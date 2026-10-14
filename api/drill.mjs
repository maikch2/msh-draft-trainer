const BASE = 'https://maikch2.github.io/msh-draft-trainer/';
const SET_FILES = {fra:'cards_fra.json', hob:'cards_hob.json', msh:'cards.json'};
const COLORS = {W:'white', U:'blue', B:'black', R:'red', G:'green'};
const HEADERS = {
  'Content-Type':'application/json; charset=utf-8',
  'Cache-Control':'no-store',
  'Access-Control-Allow-Origin':'*',
  'Access-Control-Allow-Methods':'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers':'Content-Type',
  'X-Content-Type-Options':'nosniff',
};
const json = (body, status = 200) => new Response(JSON.stringify(body), {status, headers:HEADERS});
const plainObject = v => v !== null && typeof v === 'object' && !Array.isArray(v);

export function createHandler({sampling, fetchData = fetch, random = Math.random, now = Date.now}) {
  // Only source data is cached. Every response samples a fresh batch.
  const cache = new Map();
  const pending = new Map();
  async function load(set) {
    const cached = cache.get(set);
    if (cached && now() - cached.at < 60_000) return cached.data;
    if (pending.has(set)) return pending.get(set);
    const promise = (async () => {
      const response = await fetchData(BASE + SET_FILES[set], {signal:AbortSignal.timeout(10_000)});
      if (!response.ok) throw new Error('Upstream unavailable');
      const data = await response.json();
      if (data.set !== set.toUpperCase() || !Array.isArray(data.cards) ||
          data.cards.filter(c => Number.isFinite(c.score) && c.score >= 1 && c.score <= 5).length < 2)
        throw new Error('Invalid upstream data');
      cache.set(set, {data, at:now()});
      return data;
    })();
    pending.set(set, promise);
    try { return await promise; } finally { pending.delete(set); }
  }
  return async function handle(request) {
    if (request.method === 'OPTIONS') return new Response(null, {status:204, headers:HEADERS});
    if (!['GET','POST'].includes(request.method)) return json({error:'Use GET or POST.'},405);
    const url = new URL(request.url);
    let input = Object.fromEntries(url.searchParams);
    if (request.method === 'POST') {
      if (!request.headers.get('content-type')?.toLowerCase().includes('application/json'))
        return json({error:'POST requires application/json.'},415);
      // Stream with a bound even if Content-Length is absent or dishonest.
      const reader = request.body?.getReader();
      const chunks = []; let size = 0;
      if (reader) {
        for (;;) {
          const {done,value} = await reader.read();
          if (done) break;
          size += value.byteLength;
          if (size > 32768) { await reader.cancel(); return json({error:'Request body exceeds 32 KB.'},413); }
          chunks.push(value);
        }
      }
      try {
        const bytes = new Uint8Array(size); let offset = 0;
        for (const chunk of chunks) { bytes.set(chunk,offset); offset+=chunk.byteLength; }
        const body = JSON.parse(new TextDecoder().decode(bytes));
        if (!plainObject(body)) throw new Error();
        input = {...input, ...body};
      } catch { return json({error:'Expected a JSON object.'},400); }
    }
    if (Object.keys(input).some(k => !['set','count','history','previous_card_id','nonce'].includes(k)))
      return json({error:'Unknown parameter. Use set, count, history, previous_card_id or nonce.'},400);
    const set = typeof input.set === 'string' ? input.set.toLowerCase() : input.set ?? 'fra';
    if (!Object.hasOwn(SET_FILES,set)) return json({error:'set must be fra, hob or msh.'},400);
    const count = input.count ?? 100;
    if (![50,100,'50','100'].includes(count)) return json({error:'count must be 50 or 100.'},400);
    const history = input.history ?? {};
    if (!plainObject(history) || Object.keys(history).length > 500 ||
        Object.entries(history).some(([id,e]) => !/^\d{1,12}$/.test(id) || !Array.isArray(e) || e.length !== 2 ||
          !Number.isFinite(e[0]) || e[0] < 0 || e[0] > 4 || !Number.isSafeInteger(e[1]) || e[1] < 1))
      return json({error:'history must map card IDs to [average_error (0–4), positive_integer_count].'},400);
    const previousId = input.previous_card_id ?? null;
    if (previousId !== null && !/^\d{1,12}$/.test(String(previousId)))
      return json({error:'previous_card_id must be a numeric card ID.'},400);
    try {
      const data = await load(set);
      const cards = sampling.batch(data.cards, Number(count), history, previousId, random);
      return json({
        set:set.toUpperCase(), count:cards.length, data_updated_at:data.generated_at,
        rating_source:data.rating_source, rating_scale:{min:1,max:5}, min_games:data.min_games,
        sampling:{mode:Object.keys(history).length ? 'rarity-and-mistakes' : 'rarity',
          per_card_weights:sampling.rarityWeights, marvel_bonus_weight:0.35,
          immediate_repeats:false, later_repeats:true, history_frozen_for_batch:true},
        cards:cards.map(c => ({id:c.id, name:c.name,
          colors:c.colors?.length ? c.colors.map(color => COLORS[color] ?? color) : ['colorless'],
          mana_cost:c.cost || '', mana_value:c.mana_value, rarity:c.rarity, rating:c.score})),
        next_previous_card_id:cards.at(-1).id,
      });
    } catch { return json({error:'Card data is temporarily unavailable. Retry shortly.'},503); }
  };
}
