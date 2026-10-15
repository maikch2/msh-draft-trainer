import { env } from "cloudflare:workers";
import { authorize, json } from "../../../../lib/practice-auth";
import { sessionConfig } from "../../../../lib/voice-session.mjs";

export const dynamic = "force-dynamic";
export async function POST(request: Request) {
  const auth = await authorize(request);
  if (auth.error) return auth.error;
  if (!env.OPENAI_API_KEY) return json({error:"Voice is not configured yet."},503);
  if (!request.headers.get("content-type")?.startsWith("application/sdp")) return json({error:"Audio connection offer required."},415);
  const sdp = await request.text();
  if (sdp.length > 64000 || !sdp.startsWith("v=0") || !sdp.includes("m=audio")) return json({error:"Invalid audio connection offer."},400);
  // A single atomic increment makes this limit hold across concurrent requests.
  const hour = Math.floor(Date.now() / 3600000);
  const quota = await env.DB!.prepare("INSERT INTO voice_starts (user_id, hour, count) VALUES (?, ?, 1) ON CONFLICT(user_id, hour) DO UPDATE SET count = count + 1 RETURNING count")
    .bind(auth.user!.userId, hour).first<{count:number}>();
  if (!quota || quota.count > 12) return json({error:"Twelve voice starts per hour reached. Try again next hour."},429);
  const form = new FormData();
  form.set("sdp", sdp);
  form.set("session", JSON.stringify(sessionConfig));
  try {
    const upstream = await fetch("https://api.openai.com/v1/realtime/calls", {
      method:"POST", headers:{Authorization:`Bearer ${env.OPENAI_API_KEY}`}, body:form, signal:AbortSignal.timeout(20000)
    });
    if (!upstream.ok) return json({error:upstream.status === 429 ? "OpenAI quota or rate limit reached. Check API billing, then retry." : "OpenAI could not start voice. Please try again.", upstreamStatus:upstream.status},502);
    return new Response(await upstream.text(), {headers:{"Content-Type":"application/sdp", "Cache-Control":"no-store"}});
  } catch { return json({error:"Voice connection timed out. Check your connection and retry."},504); }
}
