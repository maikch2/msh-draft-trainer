#!/bin/zsh
# Daily HOB data refresh: pull, fetch fresh untapped stats, commit & push.
# Run by launchd (~/Library/LaunchAgents/com.draft-bot.refresh-hob.plist) at 7am.
set -euo pipefail
export PATH="/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin"

cd "$(dirname "$0")"
echo "=== $(date '+%Y-%m-%d %H:%M:%S') refresh_hob start ==="

git pull --ff-only
python3 fetch_cards.py --set hob

if git diff --quiet -- cards_hob.json cards_hob.js index.html; then
    echo "No changes in HOB data; nothing to commit."
else
    git add cards_hob.json cards_hob.js index.html
    git commit -m "Refresh HOB card data (untapped WR + ALSA, scheduled)"
    git push
fi
echo "=== $(date '+%Y-%m-%d %H:%M:%S') refresh_hob done ==="
