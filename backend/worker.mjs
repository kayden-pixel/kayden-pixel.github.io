/* Optional public-only Cloudflare Worker. Does not connect to local Jarvis or private services.
   The static GitHub Pages assistant works independently without this API. */
import { answerQuestion, MAX_QUESTION_LENGTH } from "../assets/public-answers.mjs";
import knowledge from "../data/kingez-public.json" with { type: "json" };

const ORIGIN = "https://kayden-pixel.github.io";
const ROUTE = "/ask";
const MAX_BYTES = 1024;

const headers = (cors = false) => ({
  "Content-Type": "application/json; charset=utf-8",
  "Cache-Control": "no-store",
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "no-referrer",
  ...(cors ? {
    "Access-Control-Allow-Origin": ORIGIN,
    "Vary": "Origin",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "600"
  } : {})
});
const json = (body, status = 200, cors = false) =>
  new Response(JSON.stringify(body), { status, headers: headers(cors) });

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const origin = request.headers.get("Origin");
    const cors = origin === ORIGIN;
    if (url.pathname === "/health" && request.method === "GET") {
      return json({ service: "kingez-public-profile", status: "ok", schema: 1 });
    }
    if (url.pathname !== ROUTE) return json({ error: "not_found" }, 404);
    if (request.method === "OPTIONS") {
      return cors ? new Response(null, { status: 204, headers: headers(true) }) :
        json({ error: "origin_not_allowed" }, 403);
    }
    if (request.method !== "POST") return json({ error: "method_not_allowed" }, 405, cors);
    if (!cors) return json({ error: "origin_not_allowed" }, 403);
    if (request.headers.get("Content-Type")?.split(";")[0]?.trim() !== "application/json")
      return json({ error: "expected_json" }, 415, true);
    if (Number(request.headers.get("Content-Length")) > MAX_BYTES)
      return json({ error: "request_too_large" }, 413, true);
    if (!env?.CHAT_LIMITER || typeof env.CHAT_LIMITER.limit !== "function")
      return json({ error: "rate_limit_not_configured" }, 503, true);

    // This is a public, read-only endpoint. Origin is NOT authentication.
    // The rate limiter is approximate per Cloudflare location, never a per-user identity.
    const { success } = await env.CHAT_LIMITER.limit({ key: "portfolio:public-questions" });
    if (!success) return json({ error: "too_many_requests" }, 429, true);
    let body;
    try {
      const raw = await request.text();
      if (new TextEncoder().encode(raw).length > MAX_BYTES) return json({ error: "request_too_large" }, 413, true);
      body = JSON.parse(raw);
    } catch (_) {
      return json({ error: "invalid_json" }, 400, true);
    }
    if (!body || typeof body.question !== "string" || !body.question.trim() ||
        body.question.trim().length > MAX_QUESTION_LENGTH)
      return json({ error: "invalid_question" }, 400, true);
    // No personal details, logs, model inference, tool calls or persistent chat storage.
    const reply = answerQuestion(body.question, knowledge);
    return json({
      answer: reply.answer,
      matched: reply.matched,
      topic: reply.topic,
      link: reply.link,
      linkLabel: reply.linkLabel
    }, 200, true);
  }
};
