# Draft Rating Trainer (MSH + HOB + FRA)

Open a simulated booster — **Marvel Super Heroes (MSH)**, **The Hobbit (HOB)**, or **Reality Fracture (FRA)** —
on Magic: the Gathering Arena and guess each card's power rating (1–5). Switch
sets with the **MSH | HOB | FRA** toggle in the page header (the choice is remembered,
and `#hob/study`-style links deep-link to a set + view).

Ratings come from the card's real **In-Hand Win Rate** scraped from
[untapped.gg](https://mtga.untapped.gg/limited/draft/marvel-super-heroes/card-data).
For sets untapped doesn't cover yet (brand-new releases like HOB),
`fetch_cards.py` automatically falls back to
[draftsim](https://draftsim.com/HOB-pick-order/)'s expert 0–5 ratings — and
switches itself back to untapped win rates on the first refresh after the set
has real draft data.

## Files

| File | What it is |
|------|------------|
| `fetch_cards.py` | Downloads the card data for one set (`--set msh` / `--set hob` / `--set fra`), maps its rating metric to a 1–5 score, and writes the set's `cards*.json` + `cards*.js`. Also pulls card images from Scryfall. |
| `cards.json` / `cards.js` | MSH data — name, set, rarity, mana cost, win rate, score and image for every card. `cards.js` is the same data wrapped so the page works when opened directly. |
| `cards_hob.json` / `cards_hob.js` | Same, for The Hobbit. |
| `cards_fra.json` / `cards_fra.js` | Same, for Reality Fracture. |
| `index.html` | The draft simulator and all five practice views. |
| `fra_boosters.js` / `fra_catalog.js` | FRA slot rules and complete booster inventory, including 43 explicit echoed pairs. Independent of win-rate coverage. |
| `test_fra_boosters.js` | Booster composition, pair, probability and browser integration checks. Run with `node --test test_fra_boosters.js`. |
| `refresh_cards.py` | Safe Untapped refresh for a single set, with optional GitHub publication. |
| `refresh_hob.sh` | Existing daily HOB refresh, run by macOS launchd. |
| `test_fetch_cards.py` | Import availability and registration regression tests. |

## Usage

```bash
python3 fetch_cards.py            # refresh MSH (win rates drift over time)
python3 fetch_cards.py --set hob  # refresh The Hobbit
python3 fetch_cards.py --set fra --source untapped  # refresh Reality Fracture
open index.html                   # play (macOS)
```

Then click **Open Booster**, and press **1–5** to rate each card. After every
guess you see the true score, the win rate, and how far off you were; at the end
of the pack you get a grade and a per-card breakdown.

`fetch_cards.py` options:

- `--set msh|hob|fra` — which set to fetch (default `msh`).
- `--source auto|untapped|draftsim` — data source (default `auto`: untapped
  first, draftsim fallback if untapped has no stats for the set yet).
- `--min-games N` — minimum total games played for a card to be ranked (default `500`,
  untapped only). Cards below this (and brand-new/low-sample ones) are shown but
  skipped in scoring.
- `--no-images` — skip the Scryfall image lookup (faster, offline-friendly).

## How the score works

For every *rated* card, the score is the **percentile rank** of its rating
metric — in-hand WR (untapped) or the expert rating (draftsim) — mapped to 1–5:

```
score = 1 + 4 × percentile_rank(metric)
```

so the worst card maps to **1.0**, the best to **5.0**, and the median to ~**3.0**,
regardless of which source produced the numbers. When the source is draftsim,
the raw 0–5 draftsim rating is also shown on reveal.

## Booster model

A 14-card Play Booster: **1** rare-or-mythic (mythic ≈ 13.5% of the time),
**3** uncommons, **9** commons, and **1** land slot that is a basic land ≈ 50% of
the time (otherwise a common dual land). In MSH, a **Marvel Universe** special
card replaces a common in ≈ 8% of packs. Basic lands and the special cards have
no rating data, so they're shown but skipped when scoring your guesses. Edit the
`SET_META` object at the top of the script in `index.html` to change any of this.

## Reality Fracture and scheduled updates

The repository is already published at
[maikch2/msh-draft-trainer](https://github.com/maikch2/msh-draft-trainer).
GitHub Pages serves `main` from the repository root:
[open the trainer](https://maikch2.github.io/msh-draft-trainer/#fra/study).

Reality Fracture uses set code `FRA` and
[Untapped's Reality Fracture data](https://mtga.untapped.gg/limited/draft/reality-fracture/card-data).
Study shows unscored cards while more games are recorded. Importing a new set also registers its script in `index.html`. Refreshes update
that script's content hash so browsers load the latest data. The existing
500-total-game scoring threshold remains in place; cards below it are visible
but unscored. Ratings remain percentile ranks mapped to 1–5.

FRA practice packs use the dedicated slot rules described below.
Study, Drill, Rank, Signals and Changes use the imported card data directly.

The Codex automation starts with **hourly availability checks**. Once real
Untapped data is published and verified on Pages, the same automation switches
to **Refresh Reality Fracture win rates**, every day at **07:00 America/Santiago**.
If cards are already available during setup, publication completes immediately
and the hourly phase ends that day. Both phases publish to GitHub Pages and use
Untapped only, with no Draftsim fallback.

The existing **HOB** launchd job remains scheduled at 07:00 from
`~/.draft-bot-auto`; it is separate from the FRA job. Both jobs pull before
publishing. A concurrent push can require a retry; never force-push or overwrite
conflicting work. Codex schedules require this computer to be on and the app
running. Schedule definitions live in Codex, not in this repository.

Run the same commands manually:

```bash
# One-time availability check and publication:
python3 refresh_cards.py --set fra --only-if-missing --publish

# Daily update and publication:
python3 refresh_cards.py --set fra --publish

# Preview locally without committing or pushing:
python3 refresh_cards.py --set fra

# Import regression checks:
python3 -m unittest -v test_fetch_cards.py
```

Exit **2** means Untapped has no usable data yet; existing files are untouched.
Other nonzero exits mean a network, data, image or Git failure requiring review.
A missing or empty response never falls back to expert ratings in these jobs.
Identical data does not produce a timestamp-only commit. Publication requires
`main`, a clean working tree and no unpushed commits; it stages only the chosen
set's JSON/JS files and `index.html`. A local lock prevents overlapping refreshes
in the same checkout. If a push fails after a commit, review the unpublished
commit and retry the push before running another refresh.

Pushes use the repo-local credential helper for the personal `maikch2` account.
Do not replace it with the default work-account credentials. No tokens belong
in the repository. Pull before manual data work because scheduled HOB refreshes
also update `main`.

## Reality Fracture booster rules

Every pack contains 14 cards:

| Slots | Eligible cards and selection |
|-------|------------------------------|
| 6 commons | 71 main-set commons. A Special Guest replaces one in 1/55 packs. |
| 1 uncommon | 43 non-echo uncommons. |
| 1 common/uncommon | 23% common, 77% non-echo uncommon. |
| 3 echoed cards | One actual same-rarity pair plus one card from another pair. All 43 pairs are included, including the five Way pairs. |
| 1 rare/mythic | 50 non-echo rares or 20 non-echo mythics; approximately 1/6 mythic. |
| 1 foil wildcard | Main-set cards, including echoed cards, excluding basics and the ten common duals. May duplicate a nonfoil card. |
| 1 land | 45.5% basic, 54.5% common dual. Room of Refuge belongs in the ordinary common slots. |

The slot recipe and eligible counts follow
[Wizards' Play Booster contents](https://magic.wizards.com/en/news/feature/collecting-reality-fracture).
Pair identities come from
[The Legends of Reality Fracture](https://magic.wizards.com/en/news/magic-story/the-legends-of-reality-fracture)
and the matching Way card illustrations (Healer/Necromancer, Mentor/Warlord,
Cryomancer/Pyromancer, Mind Sculptor/Paradox, Deathbringer/Wildspeaker).
[Wizards' design article](https://magic.wizards.com/en/news/feature/enter-the-echoverse-with-reality-fracture-design)
also explains the three-card echo sheet and depicts the Cryomancer/Pyromancer pair.

Echo rarity uses [Arena's published upgrade odds](https://magic.wizards.com/en/mtgarena/drop-rates):
90% uncommon, approximately 8.246% rare and 1.754% mythic. The pair and third
card receive separate rarity rolls. Cards are uniform within each selected
rarity. The complete pack is shuffled, with no labels or fixed positions that
identify the third card. This avoids adding information about which partner
was taken when a pack is passed; it cannot prevent inferences from the cards themselves.

Some probabilities remain estimates: Wizards does not publish the complete
print-sheet order or precise rates for every cosmetic treatment. The ordinary
rare slot uses a 2:1 per-card rare/mythic weight. The foil slot normalizes the
published base-frame weights 49.5:40.5:6:1.2 (C/U/R/M), giving approximately
50.93%/41.67%/6.17%/1.23%. Cosmetic treatment differences and physical sheet
correlations are not simulated. These packs combine the Play Booster slot
recipe with Arena's echo odds; they are not an exact reproduction of Arena's
unpublished complete collation algorithm.

`fra_catalog.js` pins 295 unique booster-eligible cards from Scryfall's FRA
base printings and Special Guests 159–168, checked on 2026-10-01. Stats are
joined by set and front-face name when a set loads. Missing stats leave the
card available but unscored, so daily imports cannot remove a partner or skew
the booster pool. Root Maze, currently absent from Untapped's statistics, is
included this way. All other sets retain their existing booster logic.
