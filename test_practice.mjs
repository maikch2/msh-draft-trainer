import test from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
const require=createRequire(import.meta.url);
const core=require('./practice_core.js');
const answer=(id,error=1)=>({id,set:'FRA',kind:'answer',cardId:'123',error});

test('replayed requests are idempotent and keep the existing Drill EMA',()=>{
  const first=answer('a',2),second=answer('b',.5);
  assert.deepEqual(core.replay([first,first,second,second]),{'123':[1.4,2]});
});
test('imports seed missing cards without overwriting cloud answers',()=>{
  const imported={id:'import:device:FRA',set:'FRA',kind:'import',history:{123:[3,5],456:[2,4]}};
  assert.deepEqual(core.replay([answer('a'),imported]),{'123':[1,1],'456':[2,4]});
});
test('reset is ordered with answers from other devices',()=>{
  assert.deepEqual(core.replay([answer('a'),{id:'reset',set:'FRA',kind:'reset'},answer('b',.2)]),{'123':[.2,1]});
});
test('invalid history and prototype keys cannot enter shared state',()=>{
  assert.deepEqual(core.cleanHistory(JSON.parse('{"__proto__":[1,2],"a":[5,1],"b":[1,-2],"c":[0.7,2]}')), {c:[.7,2]});
  assert.equal(core.validEvent({...answer('a'),error:NaN}),false);
  assert.equal(core.validEvent({...answer('a'),cardId:'__proto__'}),false);
});
test('rounds reject stale tokens and duplicate guesses without consuming valid retries',()=>{
  const round=core.createRound({name:'Test',score:3.24,colors:['W'],cost:'{2}{W}'},'q1');
  assert.throws(()=>round.submit(3,'q0'));
  assert.throws(()=>round.submit(7,'q1'));
  const result=round.submit(3.7,'q1');
  assert.equal(result.rating,'3.2'); assert.equal(result.error,'0.5');
  assert.ok(Math.abs(result.rawError-.46)<1e-9);
  assert.throws(()=>round.submit(3.7,'q1'));
  assert.equal('rating' in round.question,false);
});
test('a server acknowledgement preserves answers queued during a request',()=>{
  const batch=[answer('a',1)], pending=[...batch,answer('b',2)];
  const base=core.replay(batch), ack=new Set(batch.map(e=>e.id));
  const remaining=pending.filter(e=>!ack.has(e.id));
  assert.deepEqual(remaining.reduce(core.applyEvent,base),core.replay(pending));
});
test('both trainer pages and browser modules are valid JavaScript',()=>{
  for(const path of ['index.html','drill-api/public/practice/index.html']) {
    for(const match of readFileSync(path,'utf8').matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)) new vm.Script(match[1]);
  }
  new vm.Script(readFileSync('voice_drill.js','utf8'));
});
test('land prompts use produced mana rather than card colors or color identity',()=>{
  const land={name:'Shipwreck Marsh',rarity:'rare',is_land:true,colors:[],color_identity:['R'],cost:'',produced_mana:['U','B']};
  assert.equal(core.question(land,'q1').spoken_prompt,'Shipwreck Marsh. rare. Land. Can produce blue or black mana. Your rating?');
  assert.match(core.question({...land,produced_mana:['C']},'q1').spoken_prompt,/Can produce colorless mana/);
  assert.match(core.question({...land,produced_mana:['W','U','B','R','G']},'q1').spoken_prompt,/mana of any color/);
  assert.match(core.question({...land,produced_mana:['W','U','B','R','G','C']},'q1').spoken_prompt,/colorless mana or mana of any color/);
  assert.match(core.question({...land,produced_mana:[]},'q1').spoken_prompt,/Does not produce mana directly/);
  assert.match(core.question({...land,produced_mana:undefined},'q1').spoken_prompt,/Mana production unavailable/);
  assert.equal(core.question({name:'Spell',rarity:'common',colors:['U'],cost:'{1}{U}'},'q1').spoken_prompt,'Spell. common. blue. 1 generic, one blue. Your rating?');
});
test('questions include rarity without revealing the score',()=>{
  for(const [rarity,spoken] of Object.entries({common:'common',uncommon:'uncommon',rare:'rare',mythic:'mythic rare',basic:'basic',special:'special'})) {
    const q=core.question({name:'Test',rarity,score:4.123,colors:['R'],cost:'{R}'},'q1');
    assert.equal(q.rarity,spoken);
    assert(q.spoken_prompt.startsWith('Test. '+spoken+'. '));
    assert(!JSON.stringify(q).includes('4.123'));
  }
});
test('spot on uses the displayed one-decimal score and preserves the original error',()=>{
  for(const [score,guess] of [[3.249,3.2],[3.251,3.3],[4,4],[4.999,5],[1.001,1]]) {
    const grade=core.grade({score},guess);
    assert.equal(grade.spotOn,true);
    assert.equal(grade.rawError,Math.abs(guess-score));
  }
  assert.equal(core.grade({score:3.249},3.3).spotOn,false);
  assert.equal(core.grade({score:3.251},3.2).spotOn,false);
  assert.equal(core.grade({score:3.251},3.251).spotOn,false,'Extra precision does not match the requested one-decimal answer');
});
test('published hybrid cards have colors and speak hybrid mana alternatives',()=>{
  for(const file of ['cards.json','cards_hob.json','cards_fra.json']) {
    for(const card of JSON.parse(readFileSync(file,'utf8')).cards.filter(c=>c.cost.includes('/'))) {
      const expected=[...new Set(card.cost.match(/[WUBRG]/g) || [])].sort();
      assert.deepEqual(card.colors,expected,card.name);
      const q=core.question(card,'q1');
      assert.notEqual(q.colors,'colorless',card.name);
      assert.match(q.spoken_prompt,/ or /,card.name);
    }
  }
});
