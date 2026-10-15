/* Voice and normal practice share the same card sampler and error history. */
(async function() {
  "use strict";
  const hosted = Boolean(window.IS_HOSTED_PRACTICE);
  const site = "https://draft-rating-api.andres336403.chatgpt.site";
  const trainer = window.TRAINER, core = window.PRACTICE_CORE;
  const $ = id => document.getElementById(id);
  const read = (key, fallback) => {try {return JSON.parse(localStorage.getItem(key)) ?? fallback;} catch {return fallback;}};
  const write = (key, value) => {try {localStorage.setItem(key, JSON.stringify(value)); return true;} catch {return false;}};
  const uuid = () => crypto.randomUUID();
  let device = read("practice_device", null);
  if (!device) {device = uuid(); write("practice_device",device);}
  if (!hosted) {
    $("voice-start").onclick = () => {
      const history = {};
      for (const set of ["FRA","HOB","MSH"]) history[set] = core.cleanHistory(read("drill_err_"+set,{}));
      const payload = encodeURIComponent(JSON.stringify({device, history}));
      location.assign(site + "/practice/#" + trainer.set.toLowerCase() + "/drill?history=" + payload);
    };
    return;
  }

  const states = new Map();
  let signedIn = false, syncMessage = "Connecting to shared history…";
  let voice = null;
  function status(message) {syncMessage=message; $("practice-status").textContent=message;}
  function state(set) {
    if (states.has(set)) return states.get(set);
    const saved = read("practice_sync_"+set,null);
    const value = saved ? {base:core.cleanHistory(saved.base), queue:(saved.queue||[]).filter(core.validEvent)} : {
      base:{}, queue:[{id:"import:"+device+":"+set, set, kind:"import", history:core.cleanHistory(read("drill_err_"+set,{}))}]
    };
    value.busy=false;
    states.set(set,value);
    return value;
  }
  function persist(set) {
    const s=state(set);
    if (!write("practice_sync_"+set,{base:s.base,queue:s.queue})) status("Browser storage is full. Keep this page open until progress syncs.");
  }
  function apply(set) {
    const s=state(set);
    trainer.applyHistory(set,s.queue.reduce(core.applyEvent,s.base));
  }
  function enqueue(event) {state(event.set).queue.push(event); persist(event.set); apply(event.set); void sync(event.set);}
  async function sync(set) {
    const s=state(set);
    if (s.busy) return;
    s.busy=true;
    const batch=s.queue.slice(0,100);
    try {
      const response = await fetch("/api/history?set="+set, batch.length ? {
        method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({set,events:batch}), signal:AbortSignal.timeout(12000)
      } : {cache:"no-store",signal:AbortSignal.timeout(12000)});
      const data=await response.json();
      if (!response.ok) {
        signedIn=false;
        $("practice-signin").classList.toggle("hidden",response.status!==401);
        throw new Error(data.error || "Could not sync progress.");
      }
      signedIn=true;
      $("practice-signin").classList.add("hidden");
      s.base=core.cleanHistory(data.history);
      const ids=new Set(batch.map(e=>e.id));
      s.queue=s.queue.filter(e=>!ids.has(e.id));
      persist(set); apply(set);
      if(set===trainer.set) status(s.queue.length ? "Saving progress…" : "Progress synced · use this signed-in page on both devices.");
    } catch(error) {
      if(set===trainer.set) status((error.message || "Connection unavailable") + " Answers are kept on this device and will retry.");
    } finally {
      s.busy=false;
      if(!voice) $("voice-start").disabled=!signedIn;
      if(s.queue.length && signedIn) setTimeout(()=>sync(set),2000);
    }
  }
  // Fragments never reach the server. The transfer is only existing card errors,
  // not credentials. Each browser's import has a stable id, so retries are safe.
  if(window.DRILL_TRANSFER && window.DRILL_TRANSFER.length < 150000) {
    try {
      const transfer=JSON.parse(window.DRILL_TRANSFER);
      if(/^[a-f0-9-]{36}$/.test(transfer.device)) for(const set of ["FRA","HOB","MSH"]) {
        const id="import:"+transfer.device+":"+set;
        const s=state(set);
        if(!s.queue.some(e=>e.id===id)) s.queue.push({id,set,kind:"import",history:core.cleanHistory(transfer.history?.[set])});
        persist(set);
      }
    } catch {status("Could not import this browser's old history. Shared practice is still available.");}
  }
  delete window.DRILL_TRANSFER;
  $("practice-signin").href="/signin-with-chatgpt?return_to="+encodeURIComponent("/practice/#"+trainer.set.toLowerCase()+"/drill");
  $("voice-start").textContent="Start voice";
  $("voice-start").disabled=true;
  window.addEventListener("practice-answer",e=>enqueue({id:uuid(),kind:"answer",...e.detail}));
  window.addEventListener("practice-reset",e=>enqueue({id:uuid(),kind:"reset",...e.detail}));
  window.addEventListener("practice-set",()=>{
    apply(trainer.set); void sync(trainer.set);
    $("practice-signin").href="/signin-with-chatgpt?return_to="+encodeURIComponent("/practice/#"+trainer.set.toLowerCase()+"/drill");
  });
  window.addEventListener("practice-set-changing",()=>stopVoice());
  window.addEventListener("online",()=>{for(const set of states.keys()) void sync(set);});
  document.addEventListener("visibilitychange",()=>{if(!document.hidden) {void sync(trainer.set); if(voice) void wake(voice);}});
  setInterval(()=>{if(!document.hidden) for(const set of states.keys()) void sync(set);},30000);
  apply(trainer.set);
  for(const set of [trainer.set,...["FRA","HOB","MSH"].filter(s=>s!==trainer.set)]) void sync(set);

  const send=(v,event)=>{if(voice===v && v.dc?.readyState==="open") v.dc.send(JSON.stringify(event));};
  const info=text=>{$("voice-state").textContent=text;};
  function next(v) {
    v.card=DRILL_SAMPLING.next(trainer.cards,v.card,trainer.history);
    v.roundNumber=(v.roundNumber || 0)+1;
    v.round=core.createRound(v.card,"q"+v.roundNumber);
    const q=v.round.question;
    $("voice-question").textContent=q.name+" · "+q.colors+" · "+q.mana_cost;
    return q;
  }
  async function wake(v) {
    if(!navigator.wakeLock || v.wakeLock || document.hidden) return;
    try {v.wakeLock=await navigator.wakeLock.request("screen"); v.wakeLock.addEventListener("release",()=>{v.wakeLock=null;});} catch {}
  }
  function stopVoice(message="Voice stopped. Microphone disconnected.") {
    const v=voice;
    voice=null;
    if(v) {
      clearTimeout(v.timeout); clearTimeout(v.disconnectTimer);
      v.abort.abort(); v.dc?.close(); v.pc?.close();
      v.stream?.getTracks().forEach(track=>track.stop());
      v.audio.pause(); v.audio.srcObject=null; v.audio.remove();
      v.wakeLock?.release().catch(()=>{});
    }
    $("voice-start").disabled=false;
    $("voice-start").classList.remove("hidden");
    $("voice-pause").classList.add("hidden"); $("voice-stop").classList.add("hidden");
    $("voice-audio").classList.add("hidden");
    $("drillcardwrap").classList.remove("hidden"); $("drillreset").disabled=false;
    info(message);
    if(v) trainer.resumeDrill();
  }
  function setPaused(v,value) {
    v.paused=value; $("voice-pause").textContent=value?"Resume":"Pause";
    info(value?"Paused. Say resume to continue.":"Listening…");
  }
  function tool(v,item) {
    let args;
    try {args=JSON.parse(item.arguments);} catch {return {error:"Please repeat your answer.",current_question:v.round.question};}
    try {
      if(item.name==="submit_answer") {
        if(v.paused) return {paused:true, instruction:"Say resume to continue."};
        const result=v.round.submit(args.guess,args.token);
        trainer.record(v.card,result.rawError);
        $("voice-result").textContent=v.card.name+": you "+result.guess+", rated "+result.rating+", off by "+result.error+".";
        return {rating:result.rating,error:result.error,next_question:next(v)};
      }
      if(item.name!=="drill_control") return {error:"Unknown command."};
      switch(args.action) {
        case "stop": stopVoice(); return null;
        case "pause": setPaused(v,true); return {paused:true,instruction:"Say only: Paused. Say resume when ready."};
        case "resume": setPaused(v,false); return {current_question:v.round.question};
        case "skip": return v.paused ? {paused:true} : {next_question:next(v)};
        case "repeat": return {current_question:v.round.question,paused:v.paused};
        default: return {error:"Unknown command."};
      }
    } catch(error) {return {error:error.message,current_question:v.round.question};}
  }
  function handle(v,event) {
    if(voice!==v) return;
    if(event.type==="input_audio_buffer.speech_started") {info("Listening…"); v.speechEnd=null;}
    if(event.type==="input_audio_buffer.speech_stopped") {v.speechEnd=performance.now(); info("Checking…");}
    if(event.type==="output_audio_buffer.started") {
      info(v.paused?"Paused":"Speaking…");
      if(v.speechEnd) {
        const ms=performance.now()-v.speechEnd; v.latencies.push(ms); v.speechEnd=null;
        const sorted=[...v.latencies].sort((a,b)=>a-b);
        $("voice-timing").textContent="Last response "+(ms/1000).toFixed(1)+"s · median "+(sorted[Math.floor(sorted.length/2)]/1000).toFixed(1)+"s";
      }
    }
    if(event.type==="output_audio_buffer.stopped") info(v.paused?"Paused. Say resume to continue.":"Listening…");
    if(event.type==="response.output_audio_transcript.done") $("voice-transcript").textContent=event.transcript;
    if(event.type==="response.done") {
      const calls=(event.response?.output||[]).filter(item=>item.type==="function_call");
      let speech="", handled=false;
      for(const call of calls) {
        if(v.calls.has(call.call_id)) continue;
        v.calls.add(call.call_id);
        const output=handled ? {error:"Use one command at a time."} : tool(v,call);
        if(voice!==v) return;
        if(!handled) {
          const q=output.next_question || output.current_question;
          speech=output.rating ? "Rated "+output.rating+", off by "+output.error+". "+q.spoken_prompt
            : output.paused ? "Paused. Say resume when ready."
            : (output.error ? output.error+" " : "") + (q?.spoken_prompt || "Please repeat your rating.");
        }
        handled=true;
        send(v,{type:"conversation.item.create",item:{type:"function_call_output",call_id:call.call_id,output:JSON.stringify(output)}});
      }
      if(speech && voice===v) speak(v,speech);
      if(event.response?.status==="failed") stopVoice("Voice response failed. Start voice to reconnect.");
    }
    if(event.type==="error") {
      if(["response_cancel_not_active","conversation_already_has_active_response"].includes(event.error?.code)) return;
      stopVoice("Voice error. Start voice to reconnect.");
    }
  }
  function speak(v,text) {
    send(v,{type:"response.create",response:{tool_choice:"none",instructions:"Speak exactly the following text in English. Do not omit any part or add any other words. Read ratings and errors to one decimal place. Then be silent. Text: "+text}});
  }
  $("voice-stop").onclick=()=>stopVoice();
  $("voice-pause").onclick=()=>{
    const v=voice; if(!v) return;
    setPaused(v,!v.paused);
    send(v,{type:"response.cancel"});
    send(v,{type:"output_audio_buffer.clear"});
    send(v,{type:"conversation.item.create",item:{type:"message",role:"user",content:[{type:"input_text",text:v.paused?"I pressed pause. Pause the drill.":"I pressed resume. Read the current question again."}]}});
    send(v,{type:"response.create"});
  };
  $("voice-audio").onclick=()=>voice?.audio.play().then(()=>$("voice-audio").classList.add("hidden")).catch(()=>info("Safari blocked audio. Tap Enable audio again."));
  $("voice-start").onclick=async()=>{
    if(voice) return;
    if(!signedIn) {status(syncMessage); $("practice-signin").focus(); return;}
    if(trainer.cards.length<2) {status("This set needs at least two rated cards for voice practice."); return;}
    if(!navigator.mediaDevices?.getUserMedia || !window.RTCPeerConnection) {status("Voice needs Safari or another browser with microphone access over HTTPS."); return;}
    const v={abort:new AbortController(),calls:new Set(),latencies:[],audio:document.createElement("audio"),paused:false};
    voice=v;
    v.audio.autoplay=true; v.audio.setAttribute("playsinline",""); document.body.append(v.audio);
    $("voice-start").disabled=true;
    $("voice-live").classList.remove("hidden"); $("voice-stop").classList.remove("hidden");
    $("voice-result").textContent=""; $("voice-transcript").textContent=""; $("voice-timing").textContent="";
    $("drillcardwrap").classList.add("hidden"); $("drillreset").disabled=true;
    info("Connecting microphone…");
    try {
      // Request permission during the click, before any network waits (Safari).
      v.stream=await navigator.mediaDevices.getUserMedia({audio:{echoCancellation:true,noiseSuppression:true,autoGainControl:true}});
      if(voice!==v) {v.stream.getTracks().forEach(t=>t.stop()); return;}
      v.pc=new RTCPeerConnection();
      v.pc.ontrack=e=>{
        v.audio.srcObject=e.streams[0];
        v.audio.play().catch(()=>$("voice-audio").classList.remove("hidden"));
      };
      v.stream.getTracks().forEach(track=>v.pc.addTrack(track,v.stream));
      v.pc.onconnectionstatechange=()=>{
        if(voice!==v) return;
        clearTimeout(v.disconnectTimer);
        if(v.pc.connectionState==="failed") stopVoice("Connection lost. Progress is saved; tap Start voice to reconnect.");
        else if(v.pc.connectionState==="disconnected") v.disconnectTimer=setTimeout(()=>stopVoice("Connection lost. Tap Start voice to reconnect."),10000);
      };
      v.dc=v.pc.createDataChannel("oai-events");
      v.dc.onmessage=e=>{try{handle(v,JSON.parse(e.data));}catch{stopVoice("Could not process voice response. Please reconnect.");}};
      v.dc.onopen=()=>{
        clearTimeout(v.timeout);
        $("voice-start").classList.add("hidden"); $("voice-pause").classList.remove("hidden");
        $("voice-pause").textContent="Pause";
        const q=next(v);
        send(v,{type:"conversation.item.create",item:{type:"message",role:"user",content:[{type:"input_text",text:"Start the drill. Current question: "+JSON.stringify(q)}]}});
        speak(v,q.spoken_prompt);
        void wake(v);
        v.timeout=setTimeout(()=>stopVoice("Twenty-minute session finished. Tap Start voice for another session."),20*60000);
      };
      v.dc.onclose=()=>{if(voice===v) stopVoice("Voice disconnected. Tap Start voice to reconnect.");};
      v.timeout=setTimeout(()=>stopVoice("Connection timed out. Tap Start voice to retry."),30000);
      const offer=await v.pc.createOffer(); await v.pc.setLocalDescription(offer);
      const response=await fetch("/api/voice/session",{method:"POST",headers:{"Content-Type":"application/sdp"},body:offer.sdp,signal:v.abort.signal});
      if(!response.ok) {const error=await response.json(); throw new Error(error.error || "Could not connect voice.");}
      if(voice!==v) return;
      await v.pc.setRemoteDescription({type:"answer",sdp:await response.text()});
    } catch(error) {
      if(voice!==v) return;
      stopVoice(error.name==="NotAllowedError"?"Microphone permission denied. Allow microphone access in Safari, then retry.":error.message);
    }
  };
  window.addEventListener("pagehide",()=>stopVoice());
})();
