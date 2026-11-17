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

test('twelve featured projects have unique deep links and usable filters', () => {
  const projects = [...html.matchAll(/<article class="card project reveal(?: featured)?" id="([^"]+)" data-categories="([^"]+)"/g)];
  assert.equal(projects.length, 12);
  assert.equal(new Set(projects.map(m => m[1])).size, 12);
  for (const category of ['minecraft', 'discord', 'ai', 'devices', 'backend']) {
    assert.ok(projects.some(m => m[2].split(' ').includes(category)), category + ' missing');
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

const studioCss = fs.readFileSync(path.join(root, 'assets/studio-v3.css'), 'utf8');
const studioJs = fs.readFileSync(path.join(root, 'assets/studio-v3.js'), 'utf8');
const logo = fs.readFileSync(path.join(root, 'assets/kingez-mark.svg'), 'utf8');

test('logo and enhanced design assets are integrated', () => {
  assert.match(logo, /^<svg[\\s>]/);
  assert.match(logo, /viewBox="0 0 128 128"/);
  assert.match(logo, /<title id="t">Kingez/);
  assert.match(html, /rel="icon" href="assets\\/kingez-mark\\.svg"/);
  assert.match(html, /href="assets\\/studio-v3\\.css"/);
  assert.match(html, /src="assets\\/studio-v3\\.js"/);
  assert.match(html, /class="brand-mark"><img src="assets\\/kingez-mark\\.svg"/);
  assert.match(studioCss, /prefers-reduced-motion/);
  assert.match(studioCss, /max-width: 620px/);
});

test('interactive systems have matching tab keys and a visible default', () => {
  const keys = [...html.matchAll(/class="lab-tab"[^>]*data-system="([^"]+)"/g)].map(m => m[1]);
  assert.deepEqual(keys, ['kingpro', 'modai', 'kydora', 'exam', 'sense', 'omnipanel']);
  for (const key of keys) assert.match(studioJs, new RegExp('\\\\b' + key + ': \\\\{'));
  for (const id of ['systems','lab-content','lab-title','lab-description','lab-highlights','lab-tech','lab-caption','lab-note','project-search','project-empty']) {
    assert.match(html, new RegExp('id="' + id + '"'));
  }
  assert.equal([...html.matchAll(/data-lab-node/g)].length,4);
  assert.match(html, /aria-pressed="true">KingPro/);
  assert.match(studioJs, /textContent = entry\\.title/);
});

test('public product links and status labels are grounded', () => {
  for (const url of [
    'https://github.com/kayden-pixel/SENSE',
    'https://github.com/kayden-pixel/Kydora-Home-Downloads/releases/latest',
    'https://modrinth.com/plugin/omnipanel'
  ]) assert.ok(html.includes(url), url + ' missing');
  assert.match(html, /Retired server/);
  assert.match(html, /Private development/);
  assert.match(html, /Early beta|early beta/);
});

test('new JavaScript remains static-safe and accessible', () => {
  assert.match(studioJs, /navigator\\.clipboard\\.writeText/);
  assert.match(studioJs, /ArrowRight/);
  assert.match(studioJs, /refreshProjects\\(\\)/);
  assert.doesNotMatch(studioJs, /innerHTML|eval\\(|process\\.env|Authorization\\s*:/);
});
