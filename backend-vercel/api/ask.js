import { createHash, randomBytes } from 'node:crypto';
import { answerQuestion, MAX_QUESTION_LENGTH } from '../lib/public-answers.mjs';
import knowledge from '../data/kingez-public.json' with { type: 'json' };

/** Fully public, read-only Q&A API: no AI calls, Jarvis access, persistence or secrets. */
const ALLOWED_ORIGIN = 'https://kayden-pixel.github.io';
const MAX_BODY_BYTES = 1024;
const WINDOW_MS = 60_000;
const PER_INSTANCE_LIMIT = 20;
const BUCKET_MAX = 512;
const secret = randomBytes(16);
const buckets = new Map();

function reply(data, status, allowOrigin = false, extraHeaders = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff',
      'Referrer-Policy': 'no-referrer',
      'Vary': 'Origin',
      ...(allowOrigin ? {
        'Access-Control-Allow-Origin': ALLOWED_ORIGIN,
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Max-Age': '600'
      } : {}),
      ...extraHeaders
    }
  });
}

function rateLimited(request) {
  const now = Date.now();
  if (buckets.size >= BUCKET_MAX) {
    for (const [key, state] of buckets) {
      if (now - state.start >= WINDOW_MS) buckets.delete(key);
    }
    if (buckets.size >= BUCKET_MAX) buckets.delete(buckets.keys().next().value);
  }
  // In-memory best-effort buckets protect individual warm function instances.
  // They are NOT globally strict rate limits; no visitor IP is stored or logged.
  const ip = request.headers.get('x-vercel-forwarded-for') ||
    request.headers.get('x-forwarded-for') || 'anonymous';
  const key = createHash('sha256').update(secret).update(ip.slice(0, 128)).digest('hex').slice(0, 24);
  const state = buckets.get(key);
  if (!state || now - state.start >= WINDOW_MS) {
    buckets.set(key, { start: now, count: 1 });
    return false;
  }
  state.count++;
  return state.count > PER_INSTANCE_LIMIT;
}

async function readSmallBody(request) {
  if (!request.body) return '';
  const reader = request.body.getReader();
  const decoder = new TextDecoder('utf-8', { fatal: true });
  let size = 0;
  let body = '';
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > MAX_BODY_BYTES) {
        await reader.cancel();
        throw new RangeError('request_too_large');
      }
      body += decoder.decode(value, { stream: true });
    }
    body += decoder.decode();
    return body;
  } finally { reader.releaseLock(); }
}

export default {
  async fetch(request) {
    const origin = request.headers.get('Origin');
    const cors = origin === ALLOWED_ORIGIN;
    if (request.method === 'OPTIONS') {
      return cors ? new Response(null, { status: 204, headers: reply({}, 200, true).headers }) :
        reply({ error: 'origin_not_allowed' }, 403, false);
    }
    if (request.method !== 'POST') return reply({ error: 'method_not_allowed' }, 405, cors);
    if (!cors) return reply({ error: 'origin_not_allowed' }, 403, false);
    if (request.headers.get('Content-Type')?.split(';')[0].trim().toLowerCase() !== 'application/json')
      return reply({ error: 'expected_json' }, 415, true);
    if (Number(request.headers.get('Content-Length')) > MAX_BODY_BYTES)
      return reply({ error: 'request_too_large' }, 413, true);
    if (rateLimited(request)) return reply({ error: 'too_many_requests' }, 429, true, { 'Retry-After': '60' });
    let data;
    try {
      const body = await readSmallBody(request);
      data = JSON.parse(body);
    } catch (error) {
      return reply({ error: error instanceof RangeError ? 'request_too_large' : 'invalid_json' },
        error instanceof RangeError ? 413 : 400, true);
    }
    if (!data || typeof data.question !== 'string' || !data.question.trim() ||
        data.question.trim().length > MAX_QUESTION_LENGTH)
      return reply({ error: 'invalid_question' }, 400, true);
    const result = answerQuestion(data.question, knowledge);
    return reply({
      answer: result.answer,
      matched: result.matched,
      topic: result.topic,
      link: result.link || null,
      linkLabel: result.linkLabel || null,
      source: 'approved-public-profile'
    }, 200, true);
  }
};
