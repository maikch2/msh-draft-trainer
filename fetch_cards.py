#!/usr/bin/env python3
"""
Download limited draft card data for a set, compute each card's rating, and
turn that into a 1-5 score.

Output: cards.json / cards_hob.json  (consumed by the simulator in index.html)

Two data sources, tried in order (--source auto):

  1. untapped.gg  — real In-Hand Win Rates + ALSA/ATA pick data. Preferred.
  2. draftsim.com — expert 0-5 ratings from their pick-order page. Used as a
     fallback for brand-new sets that have no untapped stats yet (the fallback
     disappears on its own once untapped starts publishing data for the set).

Whatever the source, the score is the *percentile rank* of the rating metric
(in-hand WR, or the draftsim rating) across every *rated* card, mapped onto a
1-5 scale:

    score = 1 + 4 * percentile_rank(metric)

so the worst card -> 1.0, the best -> 5.0, and the median -> ~3.0. Ranking
(rather than a linear min-max stretch) spreads the bell-shaped middle of the
pack out into meaningful tiers, and keeps the game consistent across sources.

With untapped data, a card is "rated" only if it has at least --min-games
total games played (default 500); brand-new sets have noisy low-sample cards.
Unrated cards (and the basic-land / no-data cards) are still written out with
score=null so the simulator can show them but skip them when scoring.

Run again any time -- win rates drift as more games are played.

    python3 fetch_cards.py                     # MSH: download + images
    python3 fetch_cards.py --set hob           # The Hobbit -> cards_hob.json
    python3 fetch_cards.py --no-images         # skip Scryfall image lookup
    python3 fetch_cards.py --min-games 300
"""
import argparse
import csv
import datetime
import hashlib
import io
import json
import re
import sys
import urllib.request

UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (draft-bot)"

# Per-set configuration. `extra_scry_sets` are bonus-sheet sets whose cards can
# appear in this set's boosters (e.g. MSH's Marvel Universe "MAR" cards).
SETS = {
    "msh": {
        "code": "MSH",
        "name": "Marvel Super Heroes",
        "untapped_slug": "marvel-super-heroes",
        "out": "cards.json",          # historical name, kept so old links work
    },
    "hob": {
        "code": "HOB",
        "name": "The Hobbit",
        "untapped_slug": "the-hobbit",
        "out": "cards_hob.json",
    },
}

# untapped rarity enum  ->  human label
RARITY = {2: "common", 3: "uncommon", 4: "rare", 5: "mythic"}
# draftsim rarity letter -> human label
DS_RARITY = {"C": "common", "U": "uncommon", "R": "rare", "M": "mythic"}
COLORS = {"W": "W", "U": "U", "B": "B", "R": "R", "G": "G"}
BASIC_NAMES = {"Plains", "Island", "Swamp", "Mountain", "Forest"}


def fetch(url):
    # Scryfall's API requires an explicit Accept header (else 400).
    req = urllib.request.Request(
        url, headers={"User-Agent": UA, "Accept": "application/json,*/*"})
    with urllib.request.urlopen(req, timeout=60) as r:
        return r.read().decode("utf-8")


# ==========================================================================
# Source 1: untapped.gg  (in-hand win rates + ALSA/ATA)
# ==========================================================================
def untapped_url(cfg):
    return f"https://mtga.untapped.gg/limited/draft/{cfg['untapped_slug']}/card-data"


def parse_next_data(html):
    m = re.search(r'id="__NEXT_DATA__"[^>]*>(.*?)</script>', html, re.S)
    if not m:
        return None
    return json.loads(m.group(1))


def parse_cost(cost):
    """'o2oUoU' -> {'text': '{2}{U}{U}', 'colors': ['U']}"""
    if not cost:
        return {"text": "", "colors": []}
    pips = [p for p in cost.split("o") if p]
    colors = sorted({COLORS[p] for p in pips if p in COLORS})
    return {"text": "".join("{%s}" % p for p in pips), "colors": colors}


def in_hand_stats(stat):
    """Sum total games, games-in-hand and wins-in-hand across all rank tiers.

    Per card the structure is {'ALL': {tier: [[games],[avail_g,avail_w],[oh,ohw]]}}
    where sub-array index 0 is total games the card was played, and index 1 is
    the 'available' (in-hand) games/wins used for the in-hand win rate.
    """
    total = games = wins = 0
    for arr in stat.get("ALL", {}).values():
        if arr and arr[0]:
            total += arr[0][0]
        if len(arr) > 1 and arr[1]:
            games += arr[1][0]
            wins += arr[1][1] if len(arr[1]) > 1 else 0
    return total, games, wins


def draft_pick_stats(data):
    """title_id -> {'alsa': float|None, 'ata': float|None} across rank tiers.

    ALSA = avg_last_pick_offered (latest pick the card was still available; a
    HIGHER value means it wheels / is uncontested). ATA = avg_pick_chosen (how
    early it's actually taken; LOWER means more contested). Each is a per-tier
    dict weighted by offered_qty; a 0 value means 'no data' for that tier, so
    those tiers are skipped rather than dragging the average toward zero.
    """
    ssr = data["props"]["pageProps"]["ssrProps"]
    info = ssr.get("limitedDraftInfo", {}).get("data") or []
    out = {}
    for row in info:
        qty = row.get("offered_qty", {})

        def wavg(field):
            num = den = 0.0
            for tier, v in row.get(field, {}).items():
                w = qty.get(tier, 0)
                if v and w:               # skip empty / no-data tiers
                    num += v * w
                    den += w
            return (num / den) if den else None

        out[row.get("title_id")] = {
            "alsa": wavg("avg_last_pick_offered"),
            "ata": wavg("avg_pick_chosen"),
        }
    return out


def build_cards_untapped(data):
    ssr = data["props"]["pageProps"]["ssrProps"]
    mj = ssr["minifiedMtgaJsonData"]
    id2name = {row[0]: row[1] for row in mj["localeData"]}
    # cardData row layout (index): 1=title_id 6=set 7=mana_cost 8=mana_value 9=rarity
    by_title = {row[1]: row for row in mj["cardData"]}
    stats = ssr["limitedCardStatsResp"]["data"]["data"]
    picks = draft_pick_stats(data)

    cards = []
    for tid_str, stat in stats.items():
        tid = int(tid_str)
        row = by_title.get(tid)
        if not row:
            continue
        total, games, wins = in_hand_stats(stat)
        wr = (wins / games) if games else None
        cost = parse_cost(row[7])
        ps = picks.get(tid, {})
        cards.append({
            "id": tid,
            "name": id2name.get(tid, f"#{tid}"),
            "set": row[6],
            "rarity": RARITY.get(row[9], "special"),
            "mana_value": row[8] if isinstance(row[8], int) else None,
            "cost": cost["text"],
            "colors": cost["colors"],
            "total_games": total,
            "games": games,
            "win_rate": round(wr, 4) if wr is not None else None,
            "ds_rating": None,
            "alsa": round(ps["alsa"], 2) if ps.get("alsa") is not None else None,
            "ata": round(ps["ata"], 2) if ps.get("ata") is not None else None,
            "is_land": False,
            "is_basic": False,
        })
    return cards


def try_untapped(cfg):
    """Return (cards, source_url) from untapped, or (None, url) if no data yet."""
    url = untapped_url(cfg)
    print(f"Downloading {url} ...")
    try:
        html = fetch(url)
    except Exception as e:
        print(f"  untapped fetch failed ({e})")
        return None, url
    data = parse_next_data(html)
    ssr = data and data.get("props", {}).get("pageProps", {}).get("ssrProps")
    stats = ssr and (ssr.get("limitedCardStatsResp") or {}).get("data", {}).get("data")
    if not stats:
        print("  untapped has no card stats for this set yet.")
        return None, url
    return build_cards_untapped(data), url


# ==========================================================================
# Source 2: draftsim.com  (expert 0-5 ratings; fallback for unreleased sets)
# ==========================================================================
def draftsim_url(cfg):
    return f"https://draftsim.com/{cfg['code']}-pick-order/"


def parse_ds_cost(cost):
    """'1W' -> {'text': '{1}{W}', 'colors': ['W'], 'mv': 2}; 'none'/'' -> empty."""
    if not cost or cost.lower() == "none":
        return {"text": "", "colors": [], "mv": None}
    pips = re.findall(r"\d+|[A-Za-z]", cost)
    colors = sorted({COLORS[p.upper()] for p in pips if p.upper() in COLORS})
    mv = sum(int(p) if p.isdigit() else 1 for p in pips if p.upper() != "X")
    return {"text": "".join("{%s}" % p.upper() for p in pips), "colors": colors, "mv": mv}


def fetch_draftsim_tsv(cfg):
    """Scrape the set's ratings TSV out of draftsim's draft-app JS bundle.

    The pick-order page loads a Vite bundle (/draft-app/dist/assets/index-*.js)
    which inlines each set's ratings file as a template literal, keyed by a
    '../data/<SET>.txt' import map. Bundle hash changes per deploy, so we
    always discover it from the page.
    """
    page_url = draftsim_url(cfg)
    print(f"Downloading {page_url} ...")
    html = fetch(page_url)
    m = re.search(r'src="([^"]*/draft-app/dist/assets/index-[^"]+\.js)"', html)
    if not m:
        sys.exit("Could not find the draftsim draft-app bundle on the page (layout changed?).")
    bundle_url = m.group(1)
    if bundle_url.startswith("/"):
        bundle_url = "https://draftsim.com" + bundle_url
    print(f"  bundle: {bundle_url}")
    js = fetch(bundle_url)
    m = re.search(r'"\.\./data/%s\.txt":([A-Za-z_$][\w$]*)' % cfg["code"], js)
    if not m:
        sys.exit(f"No ../data/{cfg['code']}.txt entry in the draftsim bundle — "
                 "draftsim has no ratings for this set yet.")
    var = m.group(1)
    m = re.search(r'\b%s=`(.*?)`' % re.escape(var), js, re.S)
    if not m:
        sys.exit(f"Could not extract the {cfg['code']} ratings literal from the bundle.")
    return m.group(1), page_url


def build_cards_draftsim(tsv, cfg):
    """TSV columns: Name Name_2 Casting_Cost_1 Casting_Cost_2 Card_Type Rarity
    Rating List Archetype Fixing Splashable. Rating is 0-5; basics get -1.
    Basic lands are skipped here (added later from Scryfall, like untapped)."""
    cards = []
    for row in csv.DictReader(io.StringIO(tsv), delimiter="\t"):
        name = (row.get("Name") or "").replace("_", " ").strip()
        if not name or name in BASIC_NAMES:
            continue
        name2 = (row.get("Name_2") or "").replace("_", " ").strip()
        if name2 and name2.lower() != "none":
            name = f"{name} // {name2}"
        c1 = parse_ds_cost(row.get("Casting_Cost_1", ""))
        c2 = parse_ds_cost(row.get("Casting_Cost_2", ""))
        try:
            rating = float(row.get("Rating", ""))
        except ValueError:
            rating = None
        if rating is not None and rating < 0:      # draftsim marks basics -1
            rating = None
        cards.append({
            "id": f"ds-{cfg['code']}-{name}",
            "name": name,
            "set": cfg["code"],
            "rarity": DS_RARITY.get(row.get("Rarity", ""), "special"),
            "mana_value": c1["mv"],
            "cost": c1["text"],
            "colors": sorted(set(c1["colors"]) | set(c2["colors"])),
            "total_games": 0,
            "games": 0,
            "win_rate": None,
            "ds_rating": rating,
            "alsa": None,
            "ata": None,
            "is_land": row.get("Card_Type") == "Land",
            "is_basic": False,
        })
    return cards


# ==========================================================================
# Scoring (source-agnostic): percentile rank of a metric -> 1..5
# ==========================================================================
def _percentile_by(items, value_fn):
    """{id(item): percentile in [0,1]} ranking items by value_fn (ties share rank)."""
    items = sorted(items, key=value_fn)
    n = len(items)
    out = {}
    i = 0
    while i < n:
        j = i
        while j < n and value_fn(items[j]) == value_fn(items[i]):
            j += 1
        p = ((i + j - 1) / 2) / (n - 1) if n > 1 else 0.0
        for k in range(i, j):
            out[id(items[k])] = p
        i = j
    return out


def score_cards(cards, metric, min_games=0):
    """Score each rated card 1..5 by its *percentile rank* of `metric`.

    Raw metrics are roughly bell-shaped, so a linear min-max stretch piles most
    cards into the middle. Ranking by percentile instead spreads the pack
    evenly: the worst -> 1.0, the best -> 5.0, the median -> ~3.0. Tied values
    share the average rank, so equal cards get equal scores.
    """
    rated = [c for c in cards
             if c[metric] is not None and c["total_games"] >= min_games]
    vals = [c[metric] for c in rated]
    lo, hi = (min(vals), max(vals)) if rated else (0.0, 0.0)
    pct = _percentile_by(rated, lambda c: c[metric])
    rated_ids = {id(c) for c in rated}
    for c in cards:
        if id(c) in rated_ids:
            s = 1 + 4 * pct[id(c)]
            c["score"] = round(s, 2)
            c["tier"] = round(s)          # nearest integer 1..5, for guessing
        else:
            c["score"] = None
            c["tier"] = None
    return lo, hi, len(rated)


def tag_pick_signals(cards):
    """Flag undervalued 'wheels' and overhyped 'traps' via the power-vs-crowd gap.

    power_pct = where the card's WR ranks   (0 worst .. 1 best) = (score-1)/4
    crowd_pct = how early the field takes it (0 wheels .. 1 first-picked), from
                ALSA -- lower ALSA = more contested = higher crowd_pct.
    pick_gap  = power_pct - crowd_pct:
        > 0  field lets a strong card wheel -> UNDERVALUED (you can wait on it)
        < 0  field grabs a weak card early  -> OVERHYPED (let others take it)
    Cards without ALSA (or unrated) get pick_gap = None.
    """
    rated = [c for c in cards if c.get("score") is not None and c.get("alsa") is not None]
    rated_ids = {id(c) for c in rated}
    crowd = _percentile_by(rated, lambda c: -c["alsa"])
    for c in cards:
        if id(c) in rated_ids:
            c["pick_gap"] = round((c["score"] - 1) / 4 - crowd[id(c)], 2)
        else:
            c["pick_gap"] = None
    return len(rated)


def diff_report(cards, old, top=25):
    """(rows, since): the top-N cards whose score moved most since last run.

    `old` is the previously-written payload dict (read it BEFORE overwriting
    the file), or None. Compares scores by card id. Cards that just entered or
    left the rated set (old or new score is None) are skipped -- their "change"
    is an artifact of the games-played threshold, not a real power shift.
    Sorted by |diff| desc.
    """
    if not old:
        return [], None
    prev = {c["id"]: c.get("score") for c in old.get("cards", [])}
    rows = []
    for c in cards:
        new_s, old_s = c.get("score"), prev.get(c["id"])
        if new_s is None or old_s is None:   # newly rated / newly dropped -> skip
            continue
        diff = round(new_s - old_s, 2)
        if diff == 0:
            continue
        rows.append({
            "id": c["id"], "name": c["name"], "rarity": c["rarity"],
            "cost": c["cost"], "set": c["set"],
            "image": c.get("image"), "image_small": c.get("image_small"),
            "old": old_s, "new": new_s, "diff": diff,
        })
    rows.sort(key=lambda r: abs(r["diff"]), reverse=True)
    return rows[:top], old.get("generated_at")


# --------------------------------------------------------------------------
# Optional: enrich with Scryfall card images (one batched request per set).
# --------------------------------------------------------------------------
def fetch_scryfall_set(set_code):
    """Return {card_name: {image, image_small, type_line, is_land, is_basic}}."""
    out = {}
    url = (f"https://api.scryfall.com/cards/search?"
           f"q=set%3A{set_code.lower()}&unique=cards&order=set")
    while url:
        page = json.loads(fetch(url))
        for c in page.get("data", []):
            imgs = c.get("image_uris")
            if not imgs and c.get("card_faces"):
                imgs = c["card_faces"][0].get("image_uris")
            tl = c.get("type_line", "")
            entry = {
                "image": imgs.get("normal") if imgs else None,
                "image_small": imgs.get("small") if imgs else None,
                "type_line": tl,
                "is_land": "Land" in tl,
                "is_basic": "Basic" in tl,
                "rarity": c.get("rarity"),
            }
            out[c["name"]] = entry
            out[c["name"].split(" // ")[0]] = entry   # also index front-face name
        url = page.get("next_page") if page.get("has_more") else None
    return out


def attach_images(cards):
    """Attach Scryfall images + land flags, and return per-set Scryfall caches."""
    cache = {}
    matched = 0
    for c in cards:
        sc = c["set"].lower()
        if sc not in cache:
            try:
                cache[sc] = fetch_scryfall_set(sc)
                print(f"  Scryfall {sc.upper()}: {len(cache[sc])} names")
            except Exception as e:  # offline / API down -> degrade gracefully
                print(f"  Scryfall {sc.upper()} lookup failed ({e}); skipping images")
                cache[sc] = {}
        info = cache[sc].get(c["name"]) or cache[sc].get(c["name"].split(",")[0])
        c["image"] = info.get("image") if info else None
        c["image_small"] = info.get("image_small") if info else None
        c["is_land"] = bool(info and info.get("is_land")) or c.get("is_land", False)
        c["is_basic"] = bool(info and info.get("is_basic"))
        matched += bool(info)
    misses = [c["name"] for c in cards if not c.get("image")]
    print(f"  matched images for {matched}/{len(cards)} cards")
    if misses:
        print(f"  no image for: {', '.join(misses[:10])}{' …' if len(misses) > 10 else ''}")
    return cache


def basic_lands_from(cache, set_code):
    """Build card entries for the basic lands of a set (no win-rate data)."""
    info = cache.get(set_code.lower(), {})
    seen, out = set(), []
    for name, e in info.items():
        if not e.get("is_basic") or name in seen:
            continue
        seen.add(name)
        out.append({
            "id": f"basic-{set_code}-{name}", "name": name, "set": set_code.upper(),
            "rarity": "basic", "mana_value": None, "cost": "", "colors": [],
            "total_games": 0, "games": 0, "win_rate": None, "ds_rating": None,
            "score": None, "tier": None,
            "alsa": None, "ata": None, "pick_gap": None,
            "is_land": True, "is_basic": True,
            "image": e.get("image"), "image_small": e.get("image_small"),
        })
    return sorted(out, key=lambda c: c["name"])


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--set", default="msh", choices=sorted(SETS),
                    help="which set to fetch (default msh)")
    ap.add_argument("--source", default="auto",
                    choices=["auto", "untapped", "draftsim"],
                    help="auto = untapped first, draftsim fallback (default)")
    ap.add_argument("--min-games", type=int, default=500,
                    help="min total games played for a card to be ranked (default 500)")
    ap.add_argument("--no-images", action="store_true",
                    help="don't fetch card images from Scryfall")
    ap.add_argument("--out", default=None,
                    help="output file (default per set: cards.json / cards_hob.json)")
    args = ap.parse_args()

    cfg = SETS[args.set]
    out = args.out or cfg["out"]

    cards = None
    source = None
    src_url = untapped_url(cfg)
    if args.source in ("auto", "untapped"):
        cards, src_url = try_untapped(cfg)
        if cards:
            source = "untapped"
        elif args.source == "untapped":
            sys.exit("No untapped data (yet) — try --source auto/draftsim.")
    if cards is None:
        tsv, src_url = fetch_draftsim_tsv(cfg)
        cards = build_cards_draftsim(tsv, cfg)
        source = "draftsim"
    print(f"Parsed {len(cards)} cards from {source}.")

    if source == "untapped":
        lo, hi, n = score_cards(cards, "win_rate", args.min_games)
        print(f"Rated {n} cards (>= {args.min_games} total games). "
              f"WR range: {lo*100:.1f}% -> {hi*100:.1f}%")
    else:
        lo, hi, n = score_cards(cards, "ds_rating")
        print(f"Rated {n} cards. draftsim rating range: {lo:.1f} -> {hi:.1f}")

    sig = tag_pick_signals(cards)
    print(f"Tagged pick signals (power vs ALSA) for {sig} cards.")

    if not args.no_images:
        print("Fetching card images from Scryfall ...")
        cache = attach_images(cards)
        basics = basic_lands_from(cache, cfg["code"])
        cards.extend(basics)
        print(f"  added {len(basics)} basic lands: {', '.join(b['name'] for b in basics)}")

    cards.sort(key=lambda c: (c["score"] is None, -(c["score"] or 0)))

    # Compare against the previous output (still on disk) before we clobber it.
    try:
        with open(out) as f:
            old = json.load(f)
    except (OSError, ValueError):
        old = None
    changes, since = diff_report(cards, old)
    if changes:
        print(f"Top {len(changes)} score movers"
              + (f" since {since}." if since else " vs previous data."))
    elif old and old.get("rating_source") == source and old.get("changes"):
        # Re-fetched the same untapped batch (untapped recomputes ~daily, so a
        # second run the same day sees zero movement). Wiping the movers list
        # here is what the site would show -- keep the previous list instead;
        # it is still "the moves since <changes_since>".
        changes, since = old["changes"], old.get("changes_since")
        print(f"No score movement since last run; keeping previous movers list"
              + (f" (since {since})." if since else "."))
    else:
        print("No previous data to diff against (first run or source switch).")

    payload = {
        "set": cfg["code"],
        "set_name": cfg["name"],
        "rating_source": source,
        "source": src_url,
        "generated_at": datetime.datetime.now().strftime("%Y-%m-%d %H:%M"),
        "min_games": args.min_games if source == "untapped" else None,
        "wr_min": round(lo, 4) if source == "untapped" else None,
        "wr_max": round(hi, 4) if source == "untapped" else None,
        "rating_min": round(lo, 2) if source == "draftsim" else None,
        "rating_max": round(hi, 2) if source == "draftsim" else None,
        "rated_count": n,
        "card_count": len(cards),
        "changes_since": since,
        "changes": changes,
        "cards": cards,
    }
    with open(out, "w") as f:
        json.dump(payload, f, indent=1, ensure_ascii=False)
    print(f"Wrote {out}  ({len(cards)} cards).")

    # Also emit a JS wrapper so index.html works when opened directly
    # via file:// (where fetch() of a local .json is blocked by the browser).
    # Each set registers itself under window.__CARDS_BY_SET__; the MSH file
    # also keeps the legacy window.__CARDS__ global.
    js_out = out.rsplit(".", 1)[0] + ".js"
    js_body = ("window.__CARDS_BY_SET__ = window.__CARDS_BY_SET__ || {};\n"
               f"window.__CARDS_BY_SET__[{json.dumps(cfg['code'])}] = "
               + json.dumps(payload, ensure_ascii=False) + ";\n")
    if args.set == "msh":
        js_body += f"window.__CARDS__ = window.__CARDS_BY_SET__[{json.dumps(cfg['code'])}];\n"
    with open(js_out, "w") as f:
        f.write(js_body)
    print(f"Wrote {js_out} (open index.html directly, no server needed).")

    # Bump the cache-busting ?v= on this set's <script> tag in index.html to a
    # content hash, so browsers (esp. iOS Safari) and GitHub Pages' CDN fetch
    # the fresh file instead of serving a stale cached copy.
    bump_cache_version(js_out, js_body)


def bump_cache_version(js_out, js_body, html_path="index.html"):
    ver = hashlib.md5(js_body.encode("utf-8")).hexdigest()[:8]
    try:
        with open(html_path) as f:
            html = f.read()
    except FileNotFoundError:
        return
    new_html, n = re.subn(
        r'(<script src="%s)(\?v=[^"]*)?(")' % re.escape(js_out),
        r'\1?v=%s\3' % ver, html)
    if n and new_html != html:
        with open(html_path, "w") as f:
            f.write(new_html)
        print(f"Stamped {html_path} -> {js_out}?v={ver}")


if __name__ == "__main__":
    main()
