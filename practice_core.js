/* Pure rules shared by voice, browser sync, and the history service. */
(function(root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory();
  else root.PRACTICE_CORE = factory();
})(typeof globalThis !== "undefined" ? globalThis : this, function() {
  const round = n => Math.round(n * 100) / 100;
  const validId = value => typeof value === "string" && /^[a-zA-Z0-9_:.-]{1,120}$/.test(value);
  function cleanHistory(value) {
    const result = {};
    if (!value || typeof value !== "object" || Array.isArray(value)) return result;
    for (const [id, entry] of Object.entries(value).slice(0, 1500)) {
      if (validId(id) && !["__proto__", "constructor", "prototype"].includes(id) &&
          Array.isArray(entry) && Number.isFinite(entry[0]) && entry[0] >= 0 && entry[0] <= 4 &&
          Number.isSafeInteger(entry[1]) && entry[1] > 0 && entry[1] <= 10000000) result[id] = [round(entry[0]), entry[1]];
    }
    return result;
  }
  function validEvent(e) {
    if (!e || !validId(e.id) || !["MSH", "HOB", "FRA"].includes(e.set)) return false;
    if (e.kind === "reset") return true;
    if (e.kind === "import") return e.history && typeof e.history === "object" && !Array.isArray(e.history);
    return e.kind === "answer" && validId(e.cardId) && !["__proto__", "constructor", "prototype"].includes(e.cardId) &&
      Number.isFinite(e.error) && e.error >= 0 && e.error <= 4;
  }
  function applyEvent(history, event) {
    if (!validEvent(event)) throw new Error("Invalid practice event");
    if (event.kind === "reset") return {};
    const result = {...history};
    if (event.kind === "import") {
      // Existing cloud progress wins. Only seed cards without cloud history.
      for (const [id, entry] of Object.entries(cleanHistory(event.history))) if (!result[id]) result[id] = entry;
    } else {
      const prev = result[event.cardId];
      result[event.cardId] = prev ? [round(.6 * prev[0] + .4 * event.error), prev[1] + 1] : [round(event.error), 1];
    }
    return result;
  }
  function replay(events) {
    let history = {};
    const ids = new Set();
    for (const e of events) if (!ids.has(e.id)) { history = applyEvent(history, e); ids.add(e.id); }
    return history;
  }
  function question(card, token) {
    const names = {W:"white", U:"blue", B:"black", R:"red", G:"green"};
    const colors=(card.colors || []).map(c => names[c] || c).join(" and ") || "colorless";
    if (card.is_land) {
      // Card color and color identity do not tell us which mana a land makes.
      const mana=Array.isArray(card.produced_mana) ? [...new Set(card.produced_mana)] : null;
      const types=mana?.map(symbol=>symbol === "C" ? "colorless" : names[symbol]);
      let description="Mana production unavailable.";
      if (types && types.every(Boolean)) {
        if (!types.length) description="Does not produce mana directly.";
        else if (["W","U","B","R","G"].every(c=>mana.includes(c))) {
          description=mana.includes("C") ? "Can produce colorless mana or mana of any color." : "Can produce mana of any color.";
        } else description="Can produce "+types.join(" or ")+" mana.";
      }
      return {token, name:card.name, colors, mana_cost:card.cost || "no mana cost", produced_mana:mana,
        mana_description:description, spoken_prompt:card.name+". Land. "+description+" Your rating?"};
    }
    const symbols=(card.cost || "").match(/\{[^}]+\}/g) || [];
    const spokenCost=symbols.map(s=>s.replace(/[{}()]/g,"").split("/").map(part=>
      names[part] ? "one "+names[part] : /^\d+$/.test(part) ? part+" generic" : ({C:"one colorless",X:"X generic",S:"one snow",P:"two life"}[part] || part)
    ).join(" or ")).join(", ") || "no mana cost";
    return {token, name:card.name, colors, mana_cost:card.cost || "no mana cost", spoken_prompt:card.name+". "+colors+". "+spokenCost+". Your rating?"};
  }
  function grade(card, guess) {
    if (!Number.isFinite(guess) || guess < 1 || guess > 5 || !Number.isFinite(card?.score)) throw new Error("Say a rating between one and five");
    const error = Math.abs(guess - card.score);
    return {guess:guess.toFixed(1), rating:card.score.toFixed(1), error:error.toFixed(1), rawError:error};
  }
  function scriptResponse(text) {
    return {type:"response.create",response:{
      conversation:"none", metadata:{phase:"script"}, input:[],
      output_modalities:["audio"], tool_choice:"none",
      instructions:"Read the following script verbatim in English. Do not add, omit, or replace any words. Read ratings and errors to one decimal place, including trailing zero. Then be silent. Script: "+text
    }};
  }
  function questionContext(question, paused = false) {
    return {type:"conversation.item.create",item:{type:"message",role:"system",content:[{
      type:"input_text",text:"Current drill state (replaces all earlier question state): "+JSON.stringify({current_question:question,paused})+". Use this question token for the next answer, even if the spoken rating repeats the previous rating."
    }]}};
  }
  function createRound(card, token) {
    let submitted = false;
    return {question:question(card, token), submit(guess, suppliedToken) {
      if (suppliedToken !== token || submitted) throw new Error("That question has already changed. Repeat the current question.");
      const result = grade(card, guess);
      submitted = true;
      return result;
    }};
  }
  return {cleanHistory, validEvent, applyEvent, replay, question, grade, createRound, scriptResponse, questionContext};
});
