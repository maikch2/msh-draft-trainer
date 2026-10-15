import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
import {createRequire} from 'node:module';
import {webcrypto} from 'node:crypto';
const require=createRequire(import.meta.url), core=require('./practice_core.js'), sampler=require('./drill_sampling.js');
const tick=()=>new Promise(resolve=>setImmediate(resolve));
function browser() {
  const listeners={}, nodes=new Map(), storage=new Map(), sent=[], records=[];
  const node=()=>({textContent:'',disabled:false,classList:{add(){},remove(){},toggle(){}},focus(){},setAttribute(){},pause(){},remove(){},play:()=>Promise.resolve()});
  const el=id=>{if(!nodes.has(id)) nodes.set(id,node());return nodes.get(id);};
  const cards=[{id:1,name:'First',score:3.25,colors:['W'],cost:'{W}',rarity:'common'},{id:2,name:'Second',score:2.1,colors:['U'],cost:'{U}',rarity:'common'}];
  let stopped=false, dc;
  const window={IS_HOSTED_PRACTICE:true,PRACTICE_CORE:core,addEventListener:(type,fn)=>(listeners[type] ||= []).push(fn)};
  const dispatch=(type,detail)=>{for(const fn of listeners[type]||[]) fn({detail});};
  window.TRAINER={set:'FRA',cards,history:{},applyHistory(set,h){if(set===this.set)this.history=h;},record(c,error){records.push({c,error});dispatch('practice-answer',{set:this.set,cardId:String(c.id),error});},resumeDrill(){}};
  class RTC {
    constructor(){this.connectionState='connected';} addTrack(){} close(){}
    createDataChannel(){dc={readyState:'open',send:raw=>sent.push(JSON.parse(raw)),close(){}};return dc;}
    async createOffer(){return {sdp:'v=0\nm=audio'};} async setLocalDescription(){} async setRemoteDescription(){dc.onopen();}
  }
  window.RTCPeerConnection=RTC;
  const cloud={FRA:[],HOB:[],MSH:[]};
  const context=vm.createContext({window,DRILL_SAMPLING:sampler,RTCPeerConnection:RTC,
    document:{getElementById:el,createElement:node,body:{append(){}},addEventListener(){},hidden:false},
    localStorage:{getItem:key=>storage.get(key)??null,setItem:(k,v)=>storage.set(k,v)},
    navigator:{mediaDevices:{getUserMedia:async()=>({getTracks:()=>[{stop:()=>{stopped=true;}}]})}},
    location:{hash:'#fra/drill'},crypto:webcrypto,performance,AbortController,AbortSignal,URLSearchParams,
    setInterval(){},setTimeout(){return 1;},clearTimeout(){},console,
    fetch:async(url,options={})=>{
      if(url==='/api/voice/session') return {ok:true,text:async()=> 'answer'};
      const set=new URL(url,'http://test').searchParams.get('set');
      if(options.body) cloud[set].push(...JSON.parse(options.body).events);
      return {ok:true,json:async()=>({history:core.replay(cloud[set])})};
    }});
  vm.runInContext(readFileSync('voice_drill.js','utf8'),context);
  return {el,window,records,sent,storage,dispatch,get stopped(){return stopped;},event:e=>dc.onmessage({data:JSON.stringify(e)})};
}
test('voice records one answer, speaks feedback plus the next card, and stops the microphone',async()=>{
  const b=browser();await tick();await b.el('voice-start').onclick();
  const intro=b.sent.find(e=>e.type==='conversation.item.create');
  const q=JSON.parse(intro.item.content[0].text.split('Current question: ')[1]);
  const call={type:'function_call',name:'submit_answer',call_id:'call1',arguments:JSON.stringify({guess:3.7,token:q.token})};
  b.event({type:'response.done',response:{status:'completed',output:[call]}});
  await tick();
  assert.equal(b.records.length,1);
  const response=b.sent.filter(e=>e.type==='response.create').at(-1);
  assert.equal(response.response.tool_choice,'none');
  assert.match(response.response.instructions,/Rated .*off by .*Your rating/);
  b.event({type:'response.done',response:{status:'completed',output:[call]}});
  b.event({type:'response.done',response:{status:'completed',output:[{...call,call_id:'retry'}]}});
  assert.equal(b.records.length,1,'Duplicate calls and stale question tokens must not grade the next card');
  b.el('voice-stop').onclick();assert.equal(b.stopped,true);
});
test('pause rejects answers and changing sets closes voice',async()=>{
  const b=browser();await tick();await b.el('voice-start').onclick();
  b.el('voice-pause').onclick();
  b.event({type:'response.done',response:{status:'completed',output:[{type:'function_call',name:'submit_answer',call_id:'paused',arguments:'{"guess":3.7,"token":"q1"}'}]}});
  assert.equal(b.records.length,0);
  b.dispatch('practice-set-changing');assert.equal(b.stopped,true);
});
