# MSH Draft Rating Trainer

Open a simulated **Marvel Super Heroes (MSH)** booster on Magic: the Gathering Arena
and guess each card's power rating (1–5). Ratings come from the card's real
**In-Hand Win Rate** scraped from [untapped.gg](https://mtga.untapped.gg/limited/draft/marvel-super-heroes/card-data).

## Files

| File | What it is |
|------|------------|
| `fetch_cards.py` | Downloads the card data, computes In-Hand WR, maps it to a 1–5 score, and writes `cards.json` + `cards.js`. Also pulls card images from Scryfall. |
| `cards.json` / `cards.js` | The generated "mother file" — name, set, rarity, mana cost, win rate, score and image for every card. `cards.js` is the same data wrapped so the page works when opened directly. |
| `index.html` | The draft simulator. Open it in a browser. |

## Usage

```bash
python3 fetch_cards.py          # refresh the data (win rates drift over time)
open index.html                 # play (macOS)
```

Then click **Open Booster**, and press **1–5** to rate each card. After every
guess you see the true score, the win rate, and how far off you were; at the end
of the pack you get a grade and a per-card breakdown.

`fetch_cards.py` options:

- `--min-games N` — minimum games-in-hand for a card to be ranked (default `500`).
  Cards below this (and brand-new/low-sample ones) are shown but skipped in scoring.
- `--no-images` — skip the Scryfall image lookup (faster, offline-friendly).

## How the score works

For every *rated* card (≥ `min-games` games in hand):

```
score = (WR − minWR) × 4 / (maxWR − minWR) + 1
```

so the lowest win-rate card maps to **1.0** and the highest to **5.0**.

## Booster model

A 14-card Play Booster: **1** rare-or-mythic (mythic ≈ 13.5% of the time),
**3** uncommons, **9** commons, and **1** land slot that is a basic land ≈ 50% of
the time (otherwise a common dual land). A **Marvel Universe** special card
replaces a common in ≈ 8% of packs. Basic lands and the special cards have no
win-rate data, so they're shown but skipped when scoring your guesses. Edit the
`BOOSTER` object at the top of the script in `index.html` to change any of this.

## Host it online (GitHub Pages)

The whole thing is static files (`index.html` + `cards.js`), so GitHub Pages is
the easiest free host. One-time setup:

1. **Create a repo.** On github.com → *New repository* → name it e.g.
   `msh-draft-trainer` → *Create*. (Public is simplest; Pages on private repos
   needs a paid plan.)

2. **Push these files.** From this folder:
   ```bash
   git init
   git add index.html cards.js cards.json fetch_cards.py README.md
   git commit -m "MSH draft rating trainer"
   git branch -M main
   git remote add origin https://github.com/<your-username>/msh-draft-trainer.git
   git push -u origin main
   ```

3. **Turn on Pages.** Repo → *Settings* → *Pages* → under *Build and deployment*
   set *Source* = **Deploy from a branch**, *Branch* = **main**, folder = **/ (root)**
   → *Save*.

4. **Open it.** After ~1 minute your site is live at
   `https://<your-username>.github.io/msh-draft-trainer/`. Card images load from
   Scryfall over the internet, so nothing else is needed.

**To refresh the win rates later:** re-run `python3 fetch_cards.py`, then
```bash
git commit -am "refresh card data" && git push
```
Pages redeploys automatically in a minute.

> Tip: only `index.html` and `cards.js` are needed to *run* the site; `cards.json`,
> `fetch_cards.py` and `README.md` are included so you (or anyone) can regenerate
> the data. A custom domain can be added later under Settings → Pages.

### Other one-click options
- **Netlify / Cloudflare Pages / Vercel:** drag-and-drop this folder, or connect
  the GitHub repo — same result, also free.
- **Local quick share:** `python3 -m http.server` in this folder, then open
  `http://localhost:8000`.
