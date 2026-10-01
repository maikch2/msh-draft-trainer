/* FRA slot collation. Published guarantees and approximation limits: README.md. */
(function(root) {
  "use strict";
  const catalog = typeof module !== "undefined" && module.exports
    ? require("./fra_catalog.js") : root.FRA_CATALOG;

  function create(cards, random = Math.random) {
    const key = c => `${c.set}:${c.name}`;
    const stats = new Map(cards.map(c => [key(c), c]));
    const pools = { main: {}, echo: {}, basic: [], dual: [], guest: [], foil: {} };
    const byName = new Map();
    for (const [name, set, rarity, slot, cost, colors, mana_value, is_land, image] of catalog.cards) {
      const c = {
        id: `${set}:${name}`, name, set, rarity, cost, colors, mana_value,
        is_land, is_basic: slot === "basic", image, score: null, win_rate: null,
        total_games: 0, games: 0, ...stats.get(`${set}:${name}`),
      };
      // Eligibility and printed rarity come from the inventory, never the statistics.
      c.rarity = rarity;
      byName.set(name, c);
      if (slot === "main" || slot === "echo") {
        (pools[slot][rarity] ||= []).push(c);
        (pools.foil[rarity] ||= []).push(c);
      } else pools[slot].push(c);
    }
    const pairs = { uncommon: [], rare: [], mythic: [] };
    for (const names of catalog.pairs) {
      const pair = names.map(n => byName.get(n));
      if (pair.length !== 2 || pair.some(c => !c) || pair[0].rarity !== pair[1].rarity)
        throw new Error(`Invalid FRA echoed pair: ${names.join(" / ")}`);
      pairs[pair[0].rarity].push(pair);
    }
    const choose = pool => {
      if (!pool?.length) throw new Error("Empty FRA booster pool");
      return pool[Math.floor(random() * pool.length)];
    };
    // Arena publishes 1:10 uncommon upgrades, then 1:5.7 rare upgrades.
    function echoRarity() {
      const roll = random();
      return roll < 0.9 ? "uncommon" : roll < 1 - 0.1 / 5.7 ? "rare" : "mythic";
    }
    function foilRarity() {
      // Normalize the published base-frame weights; <1% treatment shares are
      // not fully specified. This is explicitly an approximation, not sheet data.
      const roll = random() * 97.2;
      return roll < 49.5 ? "common" : roll < 90 ? "uncommon" : roll < 96 ? "rare" : "mythic";
    }
    function deal() {
      const used = new Set();
      const draw = pool => {
        const c = choose(pool.filter(c => !used.has(key(c))));
        used.add(key(c));
        return c;
      };
      const commons = Array.from({length: 6}, () => draw(pools.main.common));
      if (random() < 1 / 55) commons[Math.floor(random() * 6)] = choose(pools.guest);
      const uncommon = draw(pools.main.uncommon);
      const flex = draw(pools.main[random() < 0.23 ? "common" : "uncommon"]);
      const pair = choose(pairs[echoRarity()]);
      const third = choose(pools.echo[echoRarity()].filter(c => !pair.includes(c)));
      const rare = draw(pools.main[random() < 1 / 6 ? "mythic" : "rare"]);
      // The foil slot can contain an echo card or duplicate a nonfoil card.
      const foil = choose(pools.foil[foilRarity()]);
      const land = choose(random() < 0.455 ? pools.basic : pools.dual);
      return { commons, uncommon, flex, echoes: [...pair, third], rare, foil, land };
    }
    function buildPack() {
      const { commons, uncommon, flex, echoes, rare, foil, land } = deal();
      const pack = [...commons, uncommon, flex, ...echoes, rare, foil, land];
      // Do not mark or position the paired cards or the third card differently.
      for (let i = pack.length - 1; i > 0; i--) {
        const j = Math.floor(random() * (i + 1));
        [pack[i], pack[j]] = [pack[j], pack[i]];
      }
      return pack;
    }
    return { buildPack, deal, pools };
  }
  const api = { create };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.FRA_BOOSTERS = api;
})(globalThis);
