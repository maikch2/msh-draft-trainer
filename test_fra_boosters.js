"use strict";
const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const catalog = require("./fra_catalog.js");
const { create } = require("./fra_boosters.js");
const stats = require("./cards_fra.json").cards;
const echoNames = new Set(catalog.pairs.flat());
const partner = new Map(catalog.pairs.flatMap(([a,b]) => [[a,b],[b,a]]));
function rng(seed) {
  return () => ((seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0) / 2 ** 32);
}

test("inventory matches published sheets, including all 43 disjoint pairs", () => {
  const { pools } = create(stats);
  assert.equal(catalog.cards.length, 295);
  assert.equal(new Set(catalog.cards.map(c => `${c[1]}:${c[0]}`)).size, 295);
  assert.equal(partner.size, 86);
  assert.deepEqual(Object.fromEntries(Object.entries(pools.main).map(([k,v]) => [k,v.length])),
    { common: 71, uncommon: 43, rare: 50, mythic: 20 });
  assert.deepEqual(Object.fromEntries(Object.entries(pools.echo).map(([k,v]) => [k,v.length])),
    { mythic: 6, rare: 14, uncommon: 66 });
  assert.equal(pools.basic.length, 5);
  assert.equal(pools.dual.length, 10);
  assert.equal(pools.guest.length, 10);
  assert(pools.main.common.some(c => c.name === "Room of Refuge"));
  assert(!pools.dual.some(c => c.name === "Room of Refuge"));
  for (const p of catalog.pairs) {
    const cards = p.map(n => catalog.cards.find(c => c[0] === n));
    assert(cards.every(c => c[3] === "echo"));
    assert.equal(cards[0][2], cards[1][2]);
  }
  assert.equal(partner.get("Jace, Reality Sculptor"), "Tam, the Possibility");
  assert.equal(partner.get("Way of the Healer"), "Way of the Necromancer");
});

test("missing or low-sample statistics never remove booster cards", () => {
  const missing = "Chandra, Torch of Defiance";
  const { pools } = create(stats.filter(c => c.name !== missing));
  assert.equal(pools.echo.mythic.find(c => c.name === missing).score, null);
  const root = pools.guest.find(c => c.name === "Root Maze");
  assert.equal(root.score, null);
  assert(root.image && root.cost);
  const original = stats.find(c => c.name === "Ajani Unrelenting");
  assert.equal(pools.echo.mythic.find(c => c.name === original.name).score, original.score);
  assert.equal(create([]).buildPack().length, 14);
});

test("100,000 packs satisfy slots, pairs and published rarity frequencies", () => {
  const engine = create(stats, rng(4317));
  const counts = { basic: 0, guest: 0, flexCommon: 0, mythic: 0, uncommonEcho: 0,
    rareEcho: 0, mythicEcho: 0, duplicate: 0, foilEcho: 0, differentRarity: 0 };
  const foil = { common: 0, uncommon: 0, rare: 0, mythic: 0 };
  const seenPairs = new Set(), seenThird = new Set(), seenGuests = new Set();
  const N = 100000;
  for (let i = 0; i < N; i++) {
    const p = engine.deal();
    const [a,b,c] = p.echoes;
    assert.equal(p.commons.length, 6);
    assert(p.commons.every(c => c.rarity === "common" || c.set === "SPG"));
    assert.equal(p.uncommon.rarity, "uncommon");
    assert(["common", "uncommon"].includes(p.flex.rarity));
    assert(["rare", "mythic"].includes(p.rare.rarity));
    assert.equal(partner.get(a.name), b.name);
    assert.equal(a.rarity, b.rarity);
    assert.equal(new Set(p.echoes.map(c => c.name)).size, 3);
    assert.notEqual(partner.get(c.name), a.name);
    assert.notEqual(partner.get(c.name), b.name);
    seenPairs.add([a.name,b.name].sort().join("/"));
    seenThird.add(c.name);
    const ordinary = [...p.commons, p.uncommon, p.flex, p.rare];
    assert(ordinary.every(c => !echoNames.has(c.name)));
    assert.equal(new Set(ordinary.map(c => c.name)).size, ordinary.length);
    assert(p.land.is_basic || engine.pools.dual.includes(p.land));
    assert(!p.foil.is_basic && !engine.pools.dual.includes(p.foil));
    counts.basic += p.land.is_basic;
    counts.flexCommon += p.flex.rarity === "common";
    counts.mythic += p.rare.rarity === "mythic";
    const guests = p.commons.filter(c => c.set === "SPG");
    assert(guests.length <= 1);
    counts.guest += guests.length;
    guests.forEach(c => seenGuests.add(c.name));
    counts.differentRarity += a.rarity !== c.rarity;
    for (const c of p.echoes) counts[`${c.rarity}Echo`]++;
    foil[p.foil.rarity]++;
    counts.foilEcho += echoNames.has(p.foil.name);
    counts.duplicate += [...ordinary, ...p.echoes].some(c => c.name === p.foil.name);
  }
  function near(actual, expected, trials = N) {
    // Six standard deviations; echoed cards occur in correlated pairs.
    const tolerance = 6 * Math.sqrt(trials * expected * (1 - expected));
    assert(Math.abs(actual - trials * expected) < tolerance,
      `${actual}/${trials} does not match ${expected}`);
  }
  near(counts.basic, .455); near(counts.guest, 1/55);
  near(counts.flexCommon, .23); near(counts.mythic, 1/6);
  near(counts.uncommonEcho / 3, .9);
  near(counts.rareEcho / 3, .1 * (1 - 1/5.7));
  near(counts.mythicEcho / 3, .1 / 5.7);
  for (const [r,w] of Object.entries({common:49.5, uncommon:40.5, rare:6, mythic:1.2}))
    near(foil[r], w/97.2);
  assert.equal(seenPairs.size, 43);
  assert.equal(seenThird.size, 86);
  assert.equal(seenGuests.size, 10);
  assert(counts.duplicate > 0 && counts.foilEcho > 0 && counts.differentRarity > 0);
});

test("display packs contain 14 cards, hide slot roles and shuffle echo positions", () => {
  const engine = create(stats, rng(592));
  const positions = new Set();
  for (let i = 0; i < 1000; i++) {
    const p = engine.buildPack();
    assert.equal(p.length, 14);
    assert(p.some(c => p.some(other => other.name === partner.get(c.name))));
    for (let j = 0; j < p.length; j++) {
      if (echoNames.has(p[j].name)) positions.add(j);
      for (const field of ["slot", "pair", "partner", "echo_pair", "isThird", "isPair"])
        assert(!Object.hasOwn(p[j], field));
    }
  }
  assert.equal(positions.size, 14);
});

test("browser script registration and buildPack use FRA engine", () => {
  const html = fs.readFileSync("index.html", "utf8");
  const context = vm.createContext({ console, Math, window: {} });
  for (const file of ["fra_catalog.js", "fra_boosters.js"]) {
    assert(html.includes(`src="${file}?`));
    vm.runInContext(fs.readFileSync(file, "utf8"), context);
  }
  const script = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].at(-1)[1];
  // Function declarations are inert until init is called. Exercise actual UI dispatch.
  vm.runInContext(script.replace(/init\(\);\s*$/, ""), context);
  context.stats = stats;
  const result = vm.runInContext(`SET="FRA"; fraBooster=FRA_BOOSTERS.create(stats); buildPack()`, context);
  assert.equal(result.length, 14);
  assert(result.some(c => result.some(other => other.name === partner.get(c.name))));
});
