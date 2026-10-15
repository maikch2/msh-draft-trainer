import { env } from "cloudflare:workers";
import { authorize, json } from "../../../lib/practice-auth";
import core from "../../../lib/practice_core.cjs";

export const dynamic = "force-dynamic";
export async function GET(request: Request) {
  const auth = await authorize(request);
  if (auth.error) return auth.error;
  const set = new URL(request.url).searchParams.get("set")?.toUpperCase() || "FRA";
  if (!["FRA","HOB","MSH"].includes(set)) return json({error:"Unknown set"}, 400);
  return snapshot(auth.user!.userId, set);
}
async function snapshot(user: string, set: string) {
  const rows = await env.DB!.prepare("SELECT event_id, kind, payload FROM practice_events WHERE user_id = ? AND set_code = ? ORDER BY seq").bind(user, set).all<{event_id:string;kind:string;payload:string}>();
  const events = rows.results.map(row => ({...JSON.parse(row.payload), id:row.event_id, kind:row.kind, set}));
  return json({set, history:core.replay(events), signedIn:true});
}
export async function POST(request: Request) {
  const auth = await authorize(request);
  if (auth.error) return auth.error;
  if (!request.headers.get("content-type")?.startsWith("application/json")) return json({error:"JSON required"}, 415);
  const raw = await request.text();
  if (raw.length > 150000) return json({error:"Batch too large"}, 413);
  let body;
  try { body = JSON.parse(raw); } catch { return json({error:"Invalid JSON"},400); }
  if (!Array.isArray(body.events) || !body.events.length || body.events.length > 100 ||
      !body.events.every(core.validEvent) || !body.events.every((e: {set:string}) => e.set === body.set)) return json({error:"Invalid practice events"},400);
  const statements = body.events.map((e: {id:string;set:string;kind:string;history?:object}) => {
    const payload = {...e};
    if (e.kind === "import") payload.history = core.cleanHistory(e.history);
    return env.DB!.prepare("INSERT OR IGNORE INTO practice_events (user_id, event_id, set_code, kind, payload, created_at) VALUES (?, ?, ?, ?, ?, ?)")
      .bind(auth.user!.userId, e.id, e.set, e.kind, JSON.stringify(payload), Date.now());
  });
  await env.DB!.batch(statements);
  return snapshot(auth.user!.userId, body.set);
}
