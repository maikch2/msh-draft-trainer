"use strict";
const {test} = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs"), vm = require("node:vm");
const catalog = require("./trk_catalog.js"), {create,rules} = require("./trk_boosters.js");
const stats = require("./cards_trk.json").cards;
const rng = (seed=9811) => () => ((seed=(Math.imul(seed,1664525)+1013904223)>>>0)/2**32);
const near = (count,p,n=100000) => assert(Math.abs(count-n*p) <= 6*Math.sqrt(n*p*(1-p))+1, `${count}/${n} vs ${p}`);

test("catalogue has every physical booster identity without Collector-only printings", () => {
  const {pools} = create(stats);
  assert.equal(catalog.cards.length,341);
  assert.equal(new Set(catalog.cards.map(c=>c.key)).size,341);
  for(const [pool,n] of Object.entries({"main.common":81,"main.uncommon":110,"main.rare":80,"main.mythic":25,dual:10,sds:30,basic:10,away:5,holodeck:5}))
    assert.equal(pools[pool].length,n,pool);
  assert(pools["main.common"].some(c=>c.name === "Unexplored Territory"));
  assert(pools["main.rare"].some(c=>c.name === "Blood Crypt"));
  assert(!pools.dual.some(c=>c.name === "Blood Crypt"));
  assert.equal(pools["main.rare"].find(c=>c.name === "Lt. Cmdr. Geordi La Forge").rarity,"rare");
  assert(catalog.cards.every(c=>["TRK","SDS"].includes(c.set) && c.image));
  assert.equal(new Set(pools.basic.map(c=>c.key)).size,5);
  for(const rule of Object.values(rules)) {
    assert(Math.abs(rule.reduce((s,b)=>s+b.weight,0)-100)<1e-8);
    for(const b of rule) assert(b.source && b.weight>0);
  }
  for(const slot of ["wildcard","rare","foil"]) for(const b of rules[slot].filter(b=>b.estimated)) assert(b.weight<1);
  assert.equal(rules.wildcard.filter(b=>b.estimated).length,11);
  assert.equal(rules.rare.filter(b=>b.estimated).length,5);
});

test("ratings join by normalized names; missing stats retain the complete inventory", () => {
  const withStats=create(stats), empty=create([]);
  assert.equal(empty.buildPack().length,14);
  assert.equal(empty.pools.sds.length,30);
  for(const c of catalog.cards) {
    const found=Object.values(withStats.pools).flat().find(x=>x.key===c.key);
    if(!c.is_basic) {
      const stat=stats.find(x=>x.name===c.name || c.aliases.includes(x.name) || x.name==='All Good Things . . .' && c.name==='All Good Things...');
      if(stat) {assert.equal(found.id,stat.id,c.name); assert.equal(found.score,stat.score,c.name);}
      else {assert.equal(found.score,null); assert.equal(typeof found.id,'string');}
    }
  }
  assert.throws(()=>create([stats[0],stats[0]]),/Ambiguous/);
  assert.throws(()=>create([],rng(),{...catalog,pools:{...catalog.pools,sds:[]}}),/Empty TRK/);
  assert.throws(()=>create([],rng(),{...catalog,pools:{...catalog.pools,sds:['missing']}}),/Missing TRK/);
});

test("100,000 packs preserve slots, unique nonfoils, bonus and treatment frequencies", () => {
  const engine=create(stats,rng()), n=100000;
  const counts={}, seenSds=new Set(); let sds=0, dual=0, duplicates=0;
  for(let i=0;i<n;i++) {
    const p=engine.deal();
    assert.equal(p.commons.length,7); assert.equal(p.uncommons.length,3);
    assert(p.commons.every(c=>c.rarity==='common' || c.set==='SDS'));
    assert(p.uncommons.every(c=>c.rarity==='uncommon'));
    assert(['rare','mythic'].includes(p.rare.rarity));
    assert.equal(p.foil.set,'TRK'); assert.equal(p.wildcard.set,'TRK');
    const nonfoil=[...p.commons,...p.uncommons,p.wildcard,p.rare,p.land];
    assert.equal(new Set(nonfoil.map(c=>c.key)).size,13);
    duplicates+=nonfoil.some(c=>c.key===p.foil.key);
    const bonus=p.commons.filter(c=>c.set==='SDS'); assert(bonus.length<=1);
    sds+=bonus.length; bonus.forEach(c=>seenSds.add(c.key)); dual+=!p.land.is_basic;
    // First fixed slot is unconditioned; later slots exclude already drawn identities.
    const tracked=[p.selections.find(s=>s.slot==='common'),p.selections.find(s=>s.slot==='uncommon'),
      ...p.selections.filter(s=>['rare','foil','land'].includes(s.slot))];
    for(const s of tracked) {
      const k=s.slot+':'+s.pool+(s.slot==='land'?':'+s.foil:''); counts[k]=(counts[k]||0)+1;
    }
  }
  near(sds,1/25); near(dual,.5); assert.equal(seenSds.size,30); assert(duplicates>0);
  for(const slot of ['common','uncommon','rare','foil','land']) for(const b of rules[slot]) {
    const k=slot+':'+b.pool+(slot==='land'?':'+b.foil:''); near(counts[k]||0,b.weight/100);
  }
});

test("all wildcard treatment buckets are reachable with seeded draws", () => {
  // No stats or chosen rarity can remove an inventory entry.
  for(const slot of ['wildcard','rare','foil']) {
    const seen=new Set(), engine=create([],rng(813));
    for(let i=0;i<15000;i++) for(const s of engine.deal().selections) if(s.slot===slot) seen.add(s.pool);
    assert.deepEqual([...seen].sort(),rules[slot].map(b=>b.pool).sort());
  }
});

test("browser dispatch uses Star Trek packs and shuffles their positions", () => {
  const html=fs.readFileSync('index.html','utf8'), context=vm.createContext({console,Math,window:{}});
  for(const f of ['trk_catalog.js','trk_boosters.js','drill_sampling.js']) {
    assert(html.includes(`src="${f}?`));vm.runInContext(fs.readFileSync(f,'utf8'),context);
  }
  assert(html.includes('src="cards_trk.js?'));
  const script=[...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].at(-1)[1];
  vm.runInContext(script.replace(/init\(\);\s*$/,''),context);
  context.stats=stats;
  assert.equal(vm.runInContext('SET="TRK"; trkBooster=TRK_BOOSTERS.create(stats); buildPack().length',context),14);
  const positions=new Set(), engine=create([],rng());
  for(let i=0;i<1000;i++) engine.buildPack().forEach((c,j)=>{if(c.is_basic)positions.add(j);});
  assert.equal(positions.size,14);
});
