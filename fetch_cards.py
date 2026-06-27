#!/usr/bin/env python3
"""
Download Marvel Super Heroes (MSH) limited draft card data from untapped.gg,
compute each card's In-Hand Win Rate, and turn that into a 1-5 score.

Output: cards.json  (consumed by the draft simulator in index.html)

The score is the *percentile rank* of in-hand WR across every *rated* card,
mapped onto a 1-5 scale:

    score = 1 + 4 * percentile_rank(WR)

so the worst in-hand WR -> 1.0, the best -> 5.0, and the median -> ~3.0.
Ranking (rather than a linear min-max stretch of the raw WR) spreads the
bell-shaped middle of the pack out into meaningful tiers.

A card is "rated" only if it has at least --min-games total games played
(default 500); brand-new sets have noisy low-sample cards. Unrated cards
(and the basic-land / no-data cards) are still written out with score=null
so the simulator can show them but skip them when scoring your guesses.

Run again any time -- the win rates drift as more games are played.

    python3 fetch_cards.py                 # download + images
    python3 fetch_cards.py --no-images     # skip Scryfall image lookup
    python3 fetch_cards.py --min-games 300
"""
import argparse
import hashlib
import json
import re
import sys
import urllib.request

PAGE_URL = "https://mtga.untapped.gg/limited/draft/marvel-super-heroes/card-data"
UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (draft-bot)"

# untapped rarity enum  ->  human label
RARITY = {2: "common", 3: "uncommon", 4: "rare", 5: "mythic"}
COLORS = {"W": "W", "U": "U", "B": "B", "R": "R", "G": "G"}


def fetch(url):
    # Scryfall's API requires an explicit Accept header (else 400).
    req = urllib.request.Request(
        url, headers={"User-Agent": UA, "Accept": "application/json,*/*"})
    with urllib.request.urlopen(req, timeout=60) as r:
        return r.read().decode("utf-8")


def parse_next_data(html):
    m = re.search(r'id="__NEXT_DATA__"[^>]*>(.*?)</script>', html, re.S)
    if not m:
        sys.exit("Could not find __NEXT_DATA__ in the page (layout changed?).")
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


def build_cards(data):
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
            "alsa": round(ps["alsa"], 2) if ps.get("alsa") is not None else None,
            "ata": round(ps["ata"], 2) if ps.get("ata") is not None else None,
            "is_land": False,
            "is_basic": False,
        })
    return cards


def score_cards(cards, min_games):
    """Score each rated card 1..5 by its *percentile rank* of in-hand WR.

    Raw WR is roughly bell-shaped, so a linear min-max stretch piles most cards
    into the middle. Ranking by percentile instead spreads the pack evenly: the
    worst WR -> 1.0, the best -> 5.0, the median -> ~3.0. Tied WRs share the
    average rank, so equal cards get equal scores.
    """
    rated = [c for c in cards if c["win_rate"] is not None and c["total_games"] >= min_games]
    n = len(rated)
    wrs = [c["win_rate"] for c in rated]
    lo, hi = (min(wrs), max(wrs)) if rated else (0.0, 0.0)

    # average 0-based rank per distinct WR -> percentile in [0,1] -> score in [1,5]
    by_wr = sorted(rated, key=lambda c: c["win_rate"])
    pct = {}
    i = 0
    while i < n:
        j = i
        while j < n and by_wr[j]["win_rate"] == by_wr[i]["win_rate"]:
            j += 1
        avg_rank = (i + j - 1) / 2          # mean of tied positions
        p = avg_rank / (n - 1) if n > 1 else 0.0
        pct[by_wr[i]["win_rate"]] = p
        i = j

    for c in cards:
        if c in rated:
            s = 1 + 4 * pct[c["win_rate"]]
            c["score"] = round(s, 2)
            c["tier"] = round(s)          # nearest integer 1..5, for guessing
        else:
            c["score"] = None
            c["tier"] = None
    return lo, hi, n


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
        c["is_land"] = bool(info and info.get("is_land"))
        c["is_basic"] = bool(info and info.get("is_basic"))
        matched += bool(info)
    print(f"  matched images for {matched}/{len(cards)} cards")
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
            "total_games": 0, "games": 0, "win_rate": None, "score": None, "tier": None,
            "alsa": None, "ata": None, "pick_gap": None,
            "is_land": True, "is_basic": True,
            "image": e.get("image"), "image_small": e.get("image_small"),
        })
    return sorted(out, key=lambda c: c["name"])


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--min-games", type=int, default=500,
                    help="min total games played for a card to be ranked (default 500)")
    ap.add_argument("--no-images", action="store_true",
                    help="don't fetch card images from Scryfall")
    ap.add_argument("--out", default="cards.json")
    args = ap.parse_args()

    print(f"Downloading {PAGE_URL} ...")
    html = fetch(PAGE_URL)
    data = parse_next_data(html)
    cards = build_cards(data)
    print(f"Parsed {len(cards)} cards with stats.")

    lo, hi, n = score_cards(cards, args.min_games)
    print(f"Rated {n} cards (>= {args.min_games} total games). "
          f"WR range: {lo*100:.1f}% -> {hi*100:.1f}%")

    sig = tag_pick_signals(cards)
    print(f"Tagged pick signals (power vs ALSA) for {sig} cards.")

    if not args.no_images:
        print("Fetching card images from Scryfall ...")
        cache = attach_images(cards)
        basics = basic_lands_from(cache, "MSH")
        cards.extend(basics)
        print(f"  added {len(basics)} basic lands: {', '.join(b['name'] for b in basics)}")

    cards.sort(key=lambda c: (c["score"] is None, -(c["score"] or 0)))
    payload = {
        "source": PAGE_URL,
        "min_games": args.min_games,
        "wr_min": round(lo, 4),
        "wr_max": round(hi, 4),
        "rated_count": n,
        "card_count": len(cards),
        "cards": cards,
    }
    with open(args.out, "w") as f:
        json.dump(payload, f, indent=1, ensure_ascii=False)
    print(f"Wrote {args.out}  ({len(cards)} cards).")

    # Also emit a JS wrapper so index.html works when opened directly
    # via file:// (where fetch() of a local .json is blocked by the browser).
    js_out = args.out.rsplit(".", 1)[0] + ".js"
    js_body = "window.__CARDS__ = " + json.dumps(payload, ensure_ascii=False) + ";\n"
    with open(js_out, "w") as f:
        f.write(js_body)
    print(f"Wrote {js_out} (open index.html directly, no server needed).")

    # Bump the cache-busting ?v= on the cards.js <script> tag in index.html to a
    # content hash, so browsers (esp. iOS Safari) and GitHub Pages' CDN fetch the
    # fresh file instead of serving a stale cached copy.
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
