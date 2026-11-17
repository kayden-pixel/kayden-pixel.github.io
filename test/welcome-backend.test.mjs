import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { wantsIntro, markIntroSeen, STORAGE_KEY, INTRO_DURATION_MS } from '../assets/welcome-logic.mjs';
import { answerQuestion } from '../assets/public-answers.mjs';
import backend from '../backend-vercel/api/ask.js';
import health from '../backend-vercel/api/health.js';
import knowledge from '../data/kingez-public.json' with { type: 'json' };
import snapshot from '../backend-vercel/data/kingez-public.json' with { type: 'json' };

const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const aboutHtml = readFileSync(new URL('../about.html', import.meta.url), 'utf8');
const css = readFileSync(new URL('../assets/welcome-v5.css', import.meta.url), 'utf8');
const script = readFileSync(new URL('../assets/welcome-v5.mjs', import.meta.url), 'utf8');
const answerEngine = readFileSync(new URL('../assets/public-answers.mjs', import.meta.url), 'utf8');
const deployedEngine = readFileSync(new URL('../backend-vercel/lib/public-answers.mjs', import.meta.url), 'utf8');

function request(question, headers = {}) {
  return new Request('https://kingez-public-api.vercel.app/api/ask', {
    method: 'POST',
    headers: {
      Origin: 'https://kayden-pixel.github.io',
      'Content-Type': 'application/json',
      'X-Vercel-Forwarded-For': 'test-fixture-default',
      ...headers
    },
    body: JSON.stringify({ question })
  });
}

test('intro is only shown once and respects reduced motion and storage restrictions', () => {
  const flags = new Map();
  const storage = {
    getItem(key) { return flags.get(key) || null; },
    setItem(key, value) { flags.set(key, value); }
  };
  assert.equal(wantsIntro(storage, false), true);
  assert.equal(markIntroSeen(storage), true);
  assert.equal(flags.get(STORAGE_KEY), '1');
  assert.equal(wantsIntro(storage, false), false);
  assert.equal(wantsIntro({ getItem(){ return null; } }, true), false);
  assert.equal(wantsIntro({ getItem(){ throw Error('blocked'); } }, false), false);
  assert.equal(markIntroSeen({setItem(){throw Error('blocked');}}), false);
  assert.equal(INTRO_DURATION_MS, 3400);
});

test('welcome screen has skip, enter, replay, accessible labels and no JS fallback', () => {
  for (const id of ['welcome-intro', 'welcome-skip', 'welcome-enter', 'welcome-replay', 'welcome-status']) {
    assert.ok(html.includes('id="' + id + '"'), id);
  }
  assert.match(html, /aria-label="Welcome to Kingez Systems" hidden/);
  assert.match(html, /class="welcome-intro"/);
  assert.match(html, /src="assets\/welcome-v5.mjs"/);
  assert.match(html, /href="assets\/welcome-v5.css"/);
  assert.match(script, /prefers-reduced-motion/);
  assert.match(script, /event\.key === 'Escape'/);
  assert.match(script, /event\.key !== 'Tab'/);
  assert.match(script, /\.inert = true/);
  assert.match(css, /prefers-reduced-motion/);
  assert.match(css, /welcome-intro\[hidden\]/);
});

test('birthday is published consistently in about section and public knowledge', () => {
  assert.match(aboutHtml, /<time datetime="2001-06-16">16 June 2001<\/time>/);
  assert.equal(knowledge.topics.find(x=>x.id==='birthday')?.answer,
    'Kingez lists his birthday as 16 June 2001 on his public developer portfolio.');
  const response = answerQuestion("When is Kingez's birthday?", knowledge);
  assert.equal(response.topic, 'birthday');
  assert.ok(response.answer.includes('16 June 2001'));
  assert.deepEqual(snapshot, knowledge, 'public Vercel backend must match published local data');
  assert.equal(deployedEngine, answerEngine, 'public Vercel backend must use the same answers');
});

test('live backend answers only from approved data and returns safe CORS headers', async () => {
  const good = await backend.fetch(request("When is Kingez's birthday?"));
  assert.equal(good.status, 200);
  assert.equal(good.headers.get('Access-Control-Allow-Origin'), 'https://kayden-pixel.github.io');
  const goodData = await good.json();
  assert.equal(goodData.topic, 'birthday');
  assert.equal(goodData.source, 'approved-public-profile');
  assert.equal(goodData.answer, answerQuestion("When is Kingez's birthday?", knowledge).answer);
  const unrelated = await backend.fetch(request('What is the capital of Peru?', {'X-Vercel-Forwarded-For': 'different-ip'}));
  assert.equal(unrelated.status, 200);
  assert.equal((await unrelated.json()).matched, false);
  const outside = await backend.fetch(request('What is Jarvis?', { Origin: 'https://evil.invalid' }));
  assert.equal(outside.status, 403);
  assert.equal(outside.headers.get('Access-Control-Allow-Origin'), null);
  const options = await backend.fetch(new Request('https://kingez-public-api.vercel.app/api/ask', {
    method: 'OPTIONS', headers: { Origin: 'https://kayden-pixel.github.io' }
  }));
  assert.equal(options.status, 204);
  const oversized = await backend.fetch(request('X'.repeat(300), {'X-Vercel-Forwarded-For': 'oversized-ip'}));
  assert.equal(oversized.status, 400);
  const get = await backend.fetch(new Request('https://kingez-public-api.vercel.app/api/ask'));
  assert.equal(get.status, 405);
});

test('serverless rate limit is bounded per instance, without storing raw addresses', async () => {
  const ip='rate-limit-test-unique';
  let status=0;
  for(let i=0;i<21;i++) {
    const reply=await backend.fetch(request('What is ModAI?', {'X-Vercel-Forwarded-For': ip}));
    status=reply.status;
    if (i<20) assert.equal(status,200);
  }
  assert.equal(status, 429);
});

test('backend health identifies public service, never claims live private Jarvis access', async () => {
  const result = await health.fetch(new Request('https://kingez-public-api.vercel.app/api/health'));
  assert.equal(result.status, 200);
  const data = await result.json();
  assert.equal(data.status, 'ready');
  assert.equal(data.public_only, true);
  assert.equal(data.jarvis_remote_access, false);
  assert.ok(!script.includes('jarvis.execute'));
});
