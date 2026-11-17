const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const css = fs.readFileSync(path.join(root, 'assets/experience.css'), 'utf8');
const js = fs.readFileSync(path.join(root, 'assets/experience.js'), 'utf8');

test('required layout sections and enhancement assets exist', () => {
  for (const id of ['top', 'services', 'stack', 'work', 'contact', 'nav-links',
    'mobile-menu', 'scroll-progress', 'command-palette', 'command-search', 'project-count']) {
    assert.match(html, new RegExp('id="' + id + '"'));
  }
  assert.match(html, /href="assets\/experience\.css"/);
  assert.match(html, /src="assets\/experience\.js"/);
  assert.match(css, /prefers-reduced-motion/);
  assert.match(js, /AbortController/);
});

test('all element IDs are unique', () => {
  const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(match => match[1]);
  assert.equal(ids.length, new Set(ids).size);
});

test('local hash links point to valid IDs', () => {
  const ids = new Set([...html.matchAll(/\bid="([^"]+)"/g)].map(match => match[1]));
  for (const [, href] of html.matchAll(/\bhref="#([^"]+)"/g)) {
    assert.ok(ids.has(href), 'Missing local anchor: #' + href);
  }
});

test('eight featured projects have categories and usable filters', () => {
  const projects = [...html.matchAll(/<article class="card project reveal" data-categories="([^"]+)"/g)];
  assert.equal(projects.length, 8);
  for (const category of ['minecraft', 'discord', 'ai', 'backend']) {
    assert.ok(projects.some(m => m[1].split(' ').includes(category)), category + ' missing');
    assert.ok(html.includes('data-filter="' + category + '"'), category + ' filter missing');
  }
  assert.match(html, /data-filter="all"/);
});

test('quick navigation and public data integration are reachable', () => {
  assert.match(html, /id="command-trigger"/);
  assert.match(html, /class="command-item"/);
  assert.match(html, /data-github-stat="repos"/);
  assert.match(html, /data-github-stat="followers"/);
  assert.match(js, /https:\/\/api\.github\.com\/users\/kayden-pixel/);
});

test('content has a no-JavaScript fallback', () => {
  assert.match(html, /document\.documentElement\.classList\.add\("has-js"\)/);
  assert.match(html, /else element\.classList\.add\('visible'\)/);
  assert.match(css, /\.has-js \.reveal:not\(\.visible\)/);
});

test('script does not require injected API credentials', () => {
  assert.doesNotMatch(js, /process\.env|Authorization\s*:|Bearer\s+/);
});
