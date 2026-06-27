#!/usr/bin/env python3
"""
Download Marvel Super Heroes (MSH) limited draft card data from untapped.gg,
compute each card's In-Hand Win Rate, and turn that into a 1-5 score.

Output: cards.json  (consumed by the draft simulator in index.html)

The score uses the user's formula, applied over every *rated* card:

    score = (WR - minWR) * 4 / (maxWR - minWR) + 1

so the worst in-hand WR -> 1.0 and the best -> 5.0.

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


def build_cards(data):
    ssr = data["props"]["pageProps"]["ssrProps"]
    mj = ssr["minifiedMtgaJsonData"]
    id2name = {row[0]: row[1] for row in mj["localeData"]}
    # cardData row layout (index): 1=title_id 6=set 7=mana_cost 8=mana_value 9=rarity
    by_title = {row[1]: row for row in mj["cardData"]}
    stats = ssr["limitedCardStatsResp"]["data"]["data"]

    cards = []
    for tid_str, stat in stats.items():
        tid = int(tid_str)
        row = by_title.get(tid)
        if not row:
            continue
        total, games, wins = in_hand_stats(stat)
        wr = (wins / games) if games else None
        cost = parse_cost(row[7])
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
            "is_land": False,
            "is_basic": False,
        })
    return cards


def score_cards(cards, min_games):
    rated = [c for c in cards if c["win_rate"] is not None and c["total_games"] >= min_games]
    wrs = [c["win_rate"] for c in rated]
    lo, hi = min(wrs), max(wrs)
    span = (hi - lo) or 1e-9
    for c in cards:
        if c in rated:
            s = (c["win_rate"] - lo) * 4 / span + 1
            c["score"] = round(s, 2)
            c["tier"] = round(s)          # nearest integer 1..5, for guessing
        else:
            c["score"] = None
            c["tier"] = None
    return lo, hi, len(rated)


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
    with open(js_out, "w") as f:
        f.write("window.__CARDS__ = ")
        json.dump(payload, f, ensure_ascii=False)
        f.write(";\n")
    print(f"Wrote {js_out} (open index.html directly, no server needed).")


if __name__ == "__main__":
    main()
