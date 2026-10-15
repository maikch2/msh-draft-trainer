#!/usr/bin/env python3
"""Copy canonical API sources into the separate Sites checkout before publishing."""
from pathlib import Path
import shutil
import re

root = Path(__file__).resolve().parent
destination = root / "drill-api" / "lib"
if not (destination.parent / ".openai" / "hosting.json").is_file():
    raise SystemExit("Restore the drill-api Sites checkout before preparing it.")
destination.mkdir(exist_ok=True)
for source in (root / "api" / "site").rglob("*"):
    if source.is_file():
        target = destination.parent / source.relative_to(root / "api" / "site")
        target.parent.mkdir(parents=True, exist_ok=True)
        shutil.copyfile(source, target)
shutil.copyfile(root / "drill_sampling.js", destination / "drill_sampling.cjs")
shutil.copyfile(root / "api" / "drill.mjs", destination / "drill.mjs")
shutil.copyfile(root / "api" / "voice-session.mjs", destination / "voice-session.mjs")
shutil.copyfile(root / "practice_core.js", destination / "practice_core.cjs")
public = destination.parent / "public" / "practice"
public.mkdir(parents=True, exist_ok=True)
html = (root / "index.html").read_text()
html = html.replace("<head>", '<head>\n<script>window.IS_HOSTED_PRACTICE=true;</script>')
# Fetch the daily datasets from GitHub. Their URLs get a new cache key each visit;
# the personal practice deployment does not need to run on the data-refresh job.
html = re.sub(r'<script src="(cards(?:_hob|_fra)?\.js)\?v=[^"]+"></script>',
    lambda m: '<script>document.write(\'<script src="https://maikch2.github.io/msh-draft-trainer/' + m[1] + '?v=\'+Date.now()+\'">\\x3c/script>\');</script>', html)
html = html.replace('href="api/"', 'href="/"')
(public / "index.html").write_text(html)
for name in ("fra_catalog.js", "fra_boosters.js", "drill_sampling.js", "practice_core.js", "voice_drill.js"):
    shutil.copyfile(root / name, public / name)
print("Prepared API, voice configuration, shared practice rules, and personal practice page.")
