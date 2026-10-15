import { env } from "cloudflare:workers";
import { getChatGPTUser } from "../app/chatgpt-auth";

export function json(data: unknown, status = 200) {
  return Response.json(data, {status, headers:{"Cache-Control":"no-store", "Vary":"Cookie"}});
}
export async function authorize(request: Request) {
  const user = await getChatGPTUser();
  if (!user) return {error:json({error:"Sign in with ChatGPT to sync and use voice.", signIn:"/signin-with-chatgpt?return_to=%2Fpractice%2F"}, 401)};
  if (!env.VOICE_OWNER_EMAIL || user.email.toLowerCase() !== env.VOICE_OWNER_EMAIL.toLowerCase()) {
    return {error:json({error:"Voice and shared practice are available to this site's owner."}, 403)};
  }
  if (request.method !== "GET" && request.headers.get("origin") !== new URL(request.url).origin) {
    return {error:json({error:"Open practice on this site before saving or starting voice."}, 403)};
  }
  return {user};
}
