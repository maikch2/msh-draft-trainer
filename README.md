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
| `drill_sampling.js` | Shared rarity and mistake weighting used by Drill, Rank and the public API. |
| `api/drill.mjs` | Public batch API handler. Its server entrypoint is hosted separately with Sites. |
| `test_drill_api.mjs` | Selection parity, API responses, validation, caching and error checks. |
| `prepare_drill_api.py` | Copies canonical API sources into the ignored `drill-api/` Sites checkout before deployment. |
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

## Public voice drill API

### Hands-free practice

On the trainer's **Drill** tab, select **Voice & synced practice**. This opens
[personal practice](https://draft-rating-api.andres336403.chatgpt.site/practice/#fra/drill)
and imports that browser's existing mistake memory. Sign in with the site owner's
ChatGPT account, then select **Start voice** and allow the microphone. Use this
signed-in page for both typed and spoken practice on every device. The original
GitHub Pages page continues to keep its own local history.

The drill reads the card name, rarity, colors and mana cost. For lands, it instead reads
the mana types the land can produce, using Scryfall's `produced_mana` data (including
colorless and any-color mana). Lands without a mana ability are identified as not
producing mana directly. This describes possible mana types, not activation costs
or spending restrictions. Say a rating from 1 to 5;
it speaks the rating and absolute error to one decimal, then reads the next card.
If your answer matches the rating rounded to one decimal, it says "Spot on!"
and confirms the rating. Mistake history still uses the original unrounded score.
Commands: **repeat**, **skip**, **pause**, **resume**, **stop**. Keep Safari open;
screen-lock playback is not supported. Select Bluetooth audio and start the session
before driving. The page requests a screen wake lock when the browser supports it.

Voice uses a persistent OpenAI Realtime connection with `gpt-realtime-2.1-mini`.
The browser selects cards with `drill_sampling.js` and grades against the same
unrounded scores as typed Drill. The model interprets speech and reads a supplied
sentence; it does not calculate grades or choose cards. Input interpretation must
return a grading or control command and cannot speak. The app then supplies the
exact feedback and next question for a separate spoken response. Unclear answers
prompt a request to repeat the rating. The page shows measured
response latency, starting when the service detects the end of speech. Actual
phone and Bluetooth latency depends on the network and audio route.

The server stores `OPENAI_API_KEY` and `VOICE_OWNER_EMAIL` as Sites secrets. Never
put a permanent key in browser code or Git. OpenAI API usage is billed to that key's
account. Voice starts require the owner's identity and the page's origin; they are
limited to 12 per hour. Browser sessions close after 20 minutes. This is not a
monetary spending cap; configure a project budget in the OpenAI dashboard as needed.

Shared memory lives in D1, indexed by authenticated user and set. Each answer has
a unique ID, so retries do not count twice. Answers queue locally during outages.
Legacy imports seed cards with no cloud history and never replace existing cloud
progress. Only mistake memory is shared; the displayed session counters restart
when the page reloads. Raw voice audio and transcripts are not saved by this app.

Canonical backend additions and migrations are under `api/site/`; the voice
configuration is `api/voice-session.mjs`. `prepare_drill_api.py` copies these into
the existing Sites checkout and builds its personal practice page from `index.html`.
That page loads the published daily card datasets directly, so daily rating updates
do not require a voice deployment. Run `node --test test_practice.mjs test_drill_api.mjs`
before publishing changes. Enable the `DB` D1 binding in the Site's hosting manifest;
Sites applies the committed Drizzle migrations during deployment.

Open the [API page on the maikch site](https://maikch2.github.io/msh-draft-trainer/api/)
to load all cards or generate, copy or download random batches of 50 or 100 cards. It is also linked from the trainer.

Base URL: https://draft-rating-api.andres336403.chatgpt.site

- [All FRA cards](https://draft-rating-api.andres336403.chatgpt.site/api/drill?set=fra&count=all)
- [50 FRA cards](https://draft-rating-api.andres336403.chatgpt.site/api/drill?set=fra&count=50)
- [100 FRA cards](https://draft-rating-api.andres336403.chatgpt.site/api/drill?set=fra&count=100)

`GET /api/drill?set=fra` returns every card in the published set dataset once,
in source order. `count=all` is the default. Unrated cards have `rating: null`;
no rarity weighting, history weighting or previous-card exclusion is applied.
The response reports `sampling.mode: "all"` and `next_previous_card_id: null`.
This includes imported cards, not a separate inventory of every printed card.

Use `count=50` or `count=100` for fresh random drill batches.
Supported sets: `fra` (default), `hob`, `msh`. No authentication is required. CORS permits external clients.
Responses use `Cache-Control: no-store`; chat tools that reuse URL results can
append a different `nonce` parameter to request another batch.

Each card contains `id`, `name`, `colors` (plain English), `mana_cost` (such as
`{2}{U}`), `mana_value`, `rarity`, and `rating` (the same 1–5 score as Drill).
Colorless cards use `["colorless"]`; lands have an empty mana cost, not a
zero-mana spell cost. The response also includes `data_updated_at`,
`rating_source`, `min_games`, sampling details and `next_previous_card_id`.

For a spoken session, load one batch, read only each card's name, colors and
mana cost, wait for a grade, then reveal the rating and calculate
`abs(guess - rating)`. The response includes the answers; the speaking assistant
must withhold them until the user guesses.

Random batch selection uses the same `drill_sampling.js` as the page: per-card weights of
9 common, 3 uncommon, 0.9 rare, 0.18 mythic, 0.5 special, and 0.35 for MAR
bonus cards. These are weights per card, **not percentages per rarity**.
Only rated cards enter the pool. The last card is excluded from the next draw;
later repeats are allowed. Requiring 100 unique cards would change Drill's
distribution, so batches intentionally allow later repeats.

Random GET batches match Drill with reset memory. Browser mistake history is private to
that browser and is not automatically available to this public API. To use it,
POST `application/json` with the same set and count plus optional history and
the last card ID:

```json
{
  "set": "fra",
  "count": 50,
  "history": {"1132632": [1.5, 3]},
  "previous_card_id": 1132632
}
```

Each history entry is `[error_moving_average, times_rated]`, as stored under
`drill_err_FRA` in the trainer's localStorage. Unseen cards get a 1.25 multiplier;
seen cards get `min(7, 0.5 + 1.6 * error_moving_average)`. After an answer, the
page updates the average to `round(0.6 * old + 0.4 * error, 2)`, or the rounded
error for a first answer. A batch holds that history fixed: it cannot adapt to
future answers. Send updated history with the next request to continue learning.

The API fetches the existing GitHub Pages card files, caching source data for
at most 60 seconds per server instance. Daily refreshes require no API redeploy.
Unavailable source data returns HTTP 503; invalid parameters return 400,
unsupported POST media types 415 and bodies above 32 KB 413.

The API runs on Sites because GitHub Pages cannot execute server code.
Its project ID is `appgprj_6acf71fdfa148191987a4f08a134a47c`; the source checkout
is `drill-api/`, ignored by this repository and versioned in the Site's own
source repository. Restore that same Site with the Sites source helper if the
checkout is missing. Do not create a replacement project.

Before deploying API changes, run `python3 prepare_drill_api.py`, then
`node --test test_drill_api.mjs test_fra_boosters.js`, and build/package the Site
using the Sites workflow. That script copies `api/drill.mjs` and the shared
sampler without modifying them. Redeploy the Site whenever either changes;
ordinary card-data refreshes only need the existing GitHub publication.
