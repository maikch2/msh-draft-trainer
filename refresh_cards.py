#!/usr/bin/env python3
"""Refresh one set from Untapped, optionally committing and publishing it.

Exit 0: refreshed (or already loaded with --only-if-missing).
Exit 2: no usable Untapped data yet; files are untouched.
Other nonzero exit: failure requiring attention.
"""
import argparse
import fcntl
import json
from pathlib import Path
import subprocess
import sys

from fetch_cards import SETS

ROOT = Path(__file__).resolve().parent


def git(*args, capture=False):
    result = subprocess.run(["git", *args], cwd=ROOT, check=True,
                            text=True, capture_output=capture)
    return result.stdout.strip() if capture else None


def loaded(path, code):
    if not path.exists():
        return False
    data = json.loads(path.read_text())
    return (data.get("set") == code and data.get("rating_source") == "untapped"
            and any(c.get("games", 0) > 0 for c in data.get("cards", [])
                    if c.get("set") == code))


def refresh(args):
    cfg = SETS[args.set]
    if args.publish:
        if git("branch", "--show-current", capture=True) != "main":
            raise RuntimeError("Publication requires the main branch.")
        if git("status", "--porcelain", capture=True):
            raise RuntimeError("Working tree is not clean; preserve and review existing changes first.")
        git("pull", "--ff-only", "origin", "main")
        if git("rev-list", "--count", "origin/main..HEAD", capture=True) != "0":
            raise RuntimeError("Unpushed commits need review before automated publication.")

    if args.only_if_missing and loaded(ROOT / cfg["out"], cfg["code"]):
        print(f"READY: {cfg['code']} already has Untapped data.")
        return 0

    result = subprocess.run([
        sys.executable, str(ROOT / "fetch_cards.py"), "--set", args.set,
        "--source", "untapped", "--wait-for-data",
    ], cwd=ROOT)
    if result.returncode:
        return result.returncode

    if args.publish:
        paths = [cfg["out"], str(Path(cfg["out"]).with_suffix(".js")), "index.html"]
        # git add includes a new set's previously untracked card files.
        git("add", "--", *paths)
        if git("diff", "--cached", "--name-only", capture=True):
            git("commit", "-m", f"Refresh {cfg['code']} card data from Untapped")
            git("push", "origin", "HEAD:main")
        else:
            print("No data changes; nothing to publish.")
    print(f"READY: {cfg['code']} refresh complete.")
    return 0


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--set", choices=sorted(SETS), required=True)
    parser.add_argument("--publish", action="store_true")
    parser.add_argument("--only-if-missing", action="store_true")
    args = parser.parse_args()
    # Advisory lock is released even after an interrupted process. Store it in
    # .git so the lock itself never makes the working tree dirty.
    lock_path = Path(git("rev-parse", "--git-path", "draft-refresh.lock", capture=True))
    if not lock_path.is_absolute():
        lock_path = ROOT / lock_path
    with lock_path.open("w") as lock:
        try:
            fcntl.flock(lock, fcntl.LOCK_EX | fcntl.LOCK_NB)
        except BlockingIOError:
            raise RuntimeError("Another refresh is running; retry after it finishes.")
        return refresh(args)


if __name__ == "__main__":
    try:
        sys.exit(main())
    except (RuntimeError, subprocess.CalledProcessError) as exc:
        print(f"ERROR: {exc}", file=sys.stderr)
        sys.exit(1)
