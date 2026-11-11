/* Star Trek Play Booster model and approximation limits: README.md. */
(function(root) {
  "use strict";
  const catalog = typeof module !== "undefined" && module.exports
    ? require("./trk_catalog.js") : root.TRK_CATALOG;
  const source = catalog.source;
  const normalize = name => name.split(" // ")[0].normalize("NFKC").replace(/[’‘]/g, "'").replace(/\s*\.\s*\.\s*\./g, "...").trim().toLowerCase();
  const key = c => `${c.set}:${normalize(c.name)}`;
  function weights(entries) {
    const unknown = entries.filter(([,w]) => w === null).length;
    const remainder = 100 - entries.reduce((sum,[,w]) => sum + (w || 0), 0);
    const estimate = unknown ? remainder / unknown : 0;
    if (unknown ? !(estimate > 0 && estimate < 1) : Math.abs(remainder) > 1e-8)
      throw new Error("Invalid TRK slot probabilities");
    return entries.map(([pool, weight]) => ({pool, weight: weight ?? estimate, estimated: weight === null, source}));
  }
  const wildcard = (base, klingon, scene, lcars) => weights([
    ...["common", "uncommon", "rare", "mythic"].map((r,i) => [`main.${r}`,base[i]]),
    ["klingon.common",null], ["klingon.uncommon",klingon], ["klingon.rare",null],
    ["scene.uncommon",scene], ["scene.rare",null], ["scene.mythic",null],
    ["lcars.uncommon",lcars], ["lcars.rare",null], ["lcars.mythic",null],
    ["classic.rare",null], ["classic.mythic",null],
    ["borderless.rare",null], ["borderless.mythic",null], ["shock.rare",null],
  ]);
  const rules = {
    common: weights([["main.common",97.1],["klingon.common",2.9]]),
    uncommon: weights([["main.uncommon",78.1],["scene.uncommon",7.7],
      ["lcars.uncommon",4.6],["classic.uncommon",4.6],["klingon.uncommon",5]]),
    wildcard: wildcard([20.8,54.1,16.7,2.6],1,1.5,1),
    rare: weights([["main.rare",80.1],["main.mythic",12.4],["klingon.rare",null],
      ["scene.rare",1],["scene.mythic",null],["lcars.rare",1.8],["lcars.mythic",null],
      ["classic.rare",1.5],["classic.mythic",null],["borderless.rare",1],
      ["borderless.mythic",null],["shock.rare",1.4]]),
    foil: wildcard([51.2,34.7,6.3,1],1,1.6,1.1),
    // Normalize only the rounded basic half (50.2%); preserve duals at 50%.
    land: [
      {pool:"dual",weight:40,foil:false}, {pool:"dual",weight:10,foil:true},
      ...[["basic",26.7,6.7],["holodeck",6.7,1.7],["away",6.7,1.7]].flatMap(([pool,n,f]) =>
        [{pool,weight:n*50/50.2,foil:false},{pool,weight:f*50/50.2,foil:true}]),
    ].map(b => ({...b,estimated:b.pool !== "dual",source})),
  };

  function create(cards, random = Math.random, inventory = catalog) {
    const stats = new Map();
    for (const c of cards) {
      if (stats.has(key(c))) throw new Error(`Ambiguous TRK statistics: ${key(c)}`);
      stats.set(key(c), c);
    }
    const identities = new Map();
    for (const c of inventory.cards) {
      const matches = new Set([c.name,...c.aliases].map(name => stats.get(key({...c,name}))).filter(Boolean));
      if (matches.size > 1) throw new Error(`Ambiguous TRK match: ${c.name}`);
      const stat = [...matches][0];
      // Catalogue owns printing eligibility, metadata and representative images.
      identities.set(c.key, {id:c.key, score:null, win_rate:null, games:0, total_games:0,
        ...stat, ...c, id:stat?.id ?? c.key, name:stat?.name ?? c.name});
    }
    const pools = Object.fromEntries(Object.entries(inventory.pools).map(([name,keys]) =>
      [name,keys.map(k => {
        if (!identities.has(k)) throw new Error(`Missing TRK identity: ${k}`);
        return identities.get(k);
      })]));
    for (const name of new Set(["sds",...Object.values(rules).flat().map(b => b.pool)]))
      if (!pools[name]?.length) throw new Error(`Empty TRK booster pool: ${name}`);
    const choose = pool => pool[Math.floor(random()*pool.length)];
    function deal() {
      const used = new Set(), selections = [];
      function draw(slot, unique = true) {
        const available = rules[slot].map(b => ({...b, cards:pools[b.pool].filter(c => !unique || !used.has(c.key))}))
          .filter(b => b.cards.length);
        const total = available.reduce((sum,b) => sum + b.weight,0);
        if (!total) throw new Error(`Exhausted TRK slot: ${slot}`);
        let roll = random()*total;
        const bucket = available.find(b => (roll -= b.weight) < 0) || available.at(-1);
        const card = choose(bucket.cards);
        if (unique) used.add(card.key);
        selections.push({slot,pool:bucket.pool,foil:slot === "foil" || !!bucket.foil});
        return card;
      }
      const stardate = random() < 1/25;
      const commons = Array.from({length:stardate ? 6 : 7}, () => draw("common"));
      if (stardate) commons.push(choose(pools.sds));
      const uncommons = Array.from({length:3}, () => draw("uncommon"));
      const wildcard = draw("wildcard");
      const rare = draw("rare");
      const foil = draw("foil",false);
      const land = draw("land");
      return {commons,uncommons,wildcard,rare,foil,land,selections};
    }
    function buildPack() {
      const p = deal();
      const pack = [...p.commons,...p.uncommons,p.wildcard,p.rare,p.foil,p.land];
      for (let i = pack.length-1; i > 0; i--) {
        const j = Math.floor(random()*(i+1));
        [pack[i],pack[j]] = [pack[j],pack[i]];
      }
      return pack;
    }
    return {deal,buildPack,pools};
  }
  const api = {create,rules};
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.TRK_BOOSTERS = api;
})(globalThis);
