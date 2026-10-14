#!/usr/bin/env python3
"""Copy canonical API sources into the separate Sites checkout before publishing."""
from pathlib import Path
import shutil

root = Path(__file__).resolve().parent
destination = root / "drill-api" / "lib"
if not (destination.parent / ".openai" / "hosting.json").is_file():
    raise SystemExit("Restore the drill-api Sites checkout before preparing it.")
destination.mkdir(exist_ok=True)
shutil.copyfile(root / "drill_sampling.js", destination / "drill_sampling.cjs")
shutil.copyfile(root / "api" / "drill.mjs", destination / "drill.mjs")
print("Copied the shared sampler and API handler into drill-api/lib.")
