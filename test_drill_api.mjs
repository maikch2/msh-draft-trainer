import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import sampling from './drill_sampling.js';
import {createHandler} from './api/drill.mjs';

const database = JSON.parse(fs.readFileSync('cards_fra.json','utf8'));
const source = async () => Response.json(database);
const request = query => new Request('https://example.test/api/drill'+query);
const post = body => new Request('https://example.test/api/drill', {
  method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(body),
});
const rng = (seed=17) => () => ((seed=(Math.imul(seed,1664525)+1013904223)>>>0)/2**32);

test('sampler preserves original Drill selection including mistake weighting', () => {
  const cards=database.cards.filter(c=>c.score!=null).sort((a,b)=>b.score-a.score);
  const history=Object.fromEntries(cards.filter((_,i)=>i%3===0).map((c,i)=>[c.id,[i%5,2]]));
  const oldRandom=rng(), newRandom=rng();
  let oldCard=null, newCard=null;
  for(let i=0;i<10000;i++) {
    const weights=cards.map(c=>c===oldCard?0:
      (c.set==='MAR'?.35:({common:9,uncommon:3,rare:.9,mythic:.18,special:.5}[c.rarity]??1))*
      (history[c.id]?Math.min(7,.5+1.6*history[c.id][0]):1.25));
    let roll=oldRandom()*weights.reduce((a,b)=>a+b,0);
    oldCard=cards.find((c,j)=>(roll-=weights[j])<=0)||cards.at(-1);
    newCard=sampling.next(cards,newCard,history,newRandom);
    assert.equal(newCard.id,oldCard.id);
  }
});

test('per-card rarity weights and no-repeat boundary', () => {
  const cards=['common','uncommon','rare','mythic'].map((rarity,i)=>({id:i,rarity,set:'FRA',score:3}));
  const counts=[0,0,0,0], random=rng();
  for(let i=0;i<100000;i++) counts[sampling.next(cards,null,{},random).id]++;
  [9,3,.9,.18].forEach((w,i)=>assert(Math.abs(counts[i]/100000-w/13.08)<.005));
  assert.equal(sampling.next(cards,cards[0],{},()=>0).id,1);
  assert.equal(sampling.cardWeight({rarity:'mythic',set:'MAR'}),.35);
  assert.equal(sampling.missMultiplier(cards[0],{0:[0,1]}),.5);
  assert.equal(sampling.missMultiplier(cards[0]),1.25);
});

test('public GET returns fresh 50/100-card batches with complete fields', async () => {
  const handle=createHandler({sampling,fetchData:source,random:rng()});
  let previous;
  for(const count of [50,100,100]) {
    const response=await handle(request(`?set=fra&count=${count}`));
    assert.equal(response.status,200);
    assert.equal(response.headers.get('Access-Control-Allow-Origin'),'*');
    assert.equal(response.headers.get('Cache-Control'),'no-store');
    const data=await response.json();
    assert.equal(data.count,count); assert.equal(data.cards.length,count);
    assert.equal(data.data_updated_at,database.generated_at);
    assert.equal(data.next_previous_card_id,data.cards.at(-1).id);
    data.cards.forEach((c,i)=>{
      assert(c.name && c.colors.length && typeof c.mana_cost==='string');
      assert(c.rating>=1 && c.rating<=5);
      assert.equal(c.rating,database.cards.find(x=>x.id===c.id).score);
      if(i) assert.notEqual(c.id,data.cards[i-1].id);
    });
    assert.notDeepEqual(data.cards,previous);
    previous=data.cards;
  }
});

test('POST history matches shared sampler and respects previous card', async () => {
  const id=database.cards.find(c=>c.score!=null).id;
  const history={[id]:[3,4]};
  const handle=createHandler({sampling,fetchData:source,random:rng()});
  const response=await handle(post({set:'fra',count:50,history,previous_card_id:id}));
  assert.equal(response.status,200);
  const data=await response.json();
  assert.deepEqual(data.cards.map(c=>c.id),sampling.batch(database.cards,50,history,id,rng()).map(c=>c.id));
  assert.equal(data.sampling.mode,'rarity-and-mistakes');
  assert.notEqual(data.cards[0].id,id);
});

test('default and count=all return every source card once, including unrated cards', async () => {
  for (const [set,path] of Object.entries({fra:'cards_fra.json',hob:'cards_hob.json',msh:'cards.json'})) {
    const db=JSON.parse(fs.readFileSync(path));
    const handle=createHandler({sampling,fetchData:async()=>Response.json(db),random:()=>{throw new Error('must not sample');}});
    for (const req of [request(`?set=${set}`),request(`?set=${set}&count=all`),post({set,count:'all',history:{[db.cards[0].id]:[4,1]},previous_card_id:db.cards[0].id})]) {
      const response=await handle(req);
      assert.equal(response.status,200);
      const data=await response.json();
      assert.equal(data.count,db.cards.length);
      assert.deepEqual(data.cards.map(c=>c.id),db.cards.map(c=>c.id));
      assert.equal(new Set(data.cards.map(c=>c.id)).size,data.count);
      assert.deepEqual(data.cards.map(c=>c.rating),db.cards.map(c=>c.score??null));
      assert.equal(data.sampling.mode,'all');
      assert.equal(data.next_previous_card_id,null);
    }
  }
});

test('complete catalogue remains available when no cards have ratings', async () => {
  const handle=createHandler({sampling,fetchData:async()=>Response.json({...database,cards:database.cards.map(c=>({...c,score:null}))})});
  const response=await handle(request(''));
  assert.equal(response.status,200);
  const data=await response.json();
  assert.equal(data.cards.length,database.cards.length);
  assert(data.cards.every(c=>c.rating===null));
  assert.equal((await handle(request('?count=50'))).status,503);
});

test('all sets read their existing source; unrated cards never enter batches', async () => {
  const paths={fra:'cards_fra.json',hob:'cards_hob.json',msh:'cards.json'};
  const handle=createHandler({sampling,fetchData:async url=>Response.json(JSON.parse(fs.readFileSync(new URL(url).pathname.split('/').at(-1))))});
  for(const [set,path] of Object.entries(paths)) {
    const data=await (await handle(request(`?set=${set}&count=50`))).json();
    const db=JSON.parse(fs.readFileSync(path));
    assert.equal(data.set,set.toUpperCase());
    assert(data.cards.every(c=>db.cards.find(x=>x.id===c.id).score!=null));
  }
  assert.throws(()=>sampling.batch([{id:1,score:3},{id:2,score:null}],50));
});

test('source cache expires and does not conceal upstream failures', async () => {
  let clock=0, calls=0, fail=false;
  const handle=createHandler({sampling,now:()=>clock,fetchData:async()=>{
    calls++; return fail ? new Response('unavailable',{status:503}) : Response.json(database);
  }});
  assert.equal((await handle(request(''))).status,200);
  assert.equal((await handle(request(''))).status,200); assert.equal(calls,1);
  clock=60001; fail=true;
  assert.equal((await handle(request(''))).status,503); assert.equal(calls,2);
  fail=false;
  assert.equal((await handle(request(''))).status,200); assert.equal(calls,3);
});

test('invalid inputs fail before source access; CORS preflight works', async () => {
  const handle=createHandler({sampling,fetchData:()=>{throw new Error('must not fetch');}});
  for(const query of ['?count=0','?count=101','?count=50.0','?set=unknown','?set=__proto__','?rating=5'])
    assert.equal((await handle(request(query))).status,400,query);
  for(const body of [{history:{1:[-1,2]}},{history:{1:[5,2]}},{history:{1:[1,0]}},{history:[]},{count:[50]},null])
    assert.equal((await handle(post(body))).status,400);
  const huge=new Request('https://example.test/api/drill',{method:'POST',headers:{'Content-Type':'application/json'},body:' '.repeat(32769)});
  assert.equal((await handle(huge)).status,413);
  assert.equal((await handle(new Request('https://example.test/api/drill',{method:'OPTIONS'}))).status,204);
});

test('browser Drill uses the same sampler', () => {
  const html=fs.readFileSync('index.html','utf8');
  assert(html.includes('src="drill_sampling.js?'));
  const context=vm.createContext({window:{},Math});
  vm.runInContext(fs.readFileSync('drill_sampling.js','utf8'),context);
  const inline=[...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].at(-1)[1];
  vm.runInContext(inline.replace(/init\(\);\s*$/,''),context);
  assert(vm.runInContext('nextDrillCard.toString().includes("DRILL_SAMPLING.next(RATED, drillCard, drillErr)")',context));
  assert.equal(vm.runInContext('cardWeight({set:"FRA",rarity:"common"})',context),9);
});
