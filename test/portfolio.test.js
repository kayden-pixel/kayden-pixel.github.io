const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const pageFiles = ['index.html','projects.html','systems.html','services.html','commissions.html','about.html','contact.html'];
const pages = Object.fromEntries(pageFiles.map(name => [name, fs.readFileSync(path.join(root, name), 'utf8')]));
// Combined content for cross-page feature assertions; uniqueness and anchors are checked per document.
const html = Object.values(pages).join('\n');
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

test('all element IDs are unique within every independent page', () => {
  for (const [file, content] of Object.entries(pages)) {
    const ids = [...content.matchAll(/\bid="([^"]+)"/g)].map(match => match[1]);
    assert.equal(ids.length, new Set(ids).size, file);
  }
});

test('local hash links point to IDs on the same page', () => {
  for (const [file, content] of Object.entries(pages)) {
    const ids = new Set([...content.matchAll(/\bid="([^"]+)"/g)].map(match => match[1]));
    for (const [, target] of content.matchAll(/\bhref="#([^"]+)"/g)) {
      assert.ok(ids.has(target), file + ' missing local anchor #' + target);
    }
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

test('original vector logo and premium theme are integrated', () => {
  assert.ok(logo.trimStart().startsWith('<svg '));
  assert.ok(logo.includes('viewBox="0 0 128 128"'));
  assert.ok(logo.includes('<title id="t">Kingez'));
  for (const item of ['rel="icon" href="assets/kingez-mark.svg"',
                     'href="assets/studio-v3.css"',
                     'src="assets/studio-v3.js"',
                     '<img src="assets/kingez-mark.svg"']) {
    assert.ok(html.includes(item), item + ' missing');
  }
  assert.ok(studioCss.includes('prefers-reduced-motion'));
  assert.ok(studioCss.includes('max-width: 620px'));
});

test('interactive six-system lab has matching tabs and usable fallback', () => {
  const keys = [...html.matchAll(/class="lab-tab"[^>]*data-system="([^"]+)"/g)].map(m => m[1]);
  assert.deepEqual(keys, ['kingpro', 'modai', 'kydora', 'exam', 'sense', 'omnipanel']);
  for (const key of keys) assert.ok(studioJs.includes(key + ': {'), key + ' missing');
  for (const id of ['systems','lab-content','lab-title','lab-description',
    'lab-highlights','lab-tech','lab-caption','lab-note','project-search','project-empty']) {
    assert.ok(html.includes('id="' + id + '"'), id + ' missing');
  }
  assert.equal([...html.matchAll(/data-lab-node/g)].length, 4);
  assert.ok(html.includes('aria-pressed="true">KingPro'));
  assert.ok(studioJs.includes('title.textContent = entry.title'));
});

test('project links and accurate maturity labels are present', () => {
  for (const url of ['https://github.com/kayden-pixel/SENSE',
                     'https://github.com/kayden-pixel/Kydora-Home-Downloads/releases/latest',
                     'https://modrinth.com/plugin/omnipanel']) {
    assert.ok(html.includes(url), url + ' missing');
  }
  assert.ok(html.includes('Retired server'));
  assert.ok(html.includes('Private development'));
  assert.ok(html.toLowerCase().includes('early beta'));
});

test('portfolio search and copy controls remain local-only', () => {
  assert.ok(studioJs.includes('navigator.clipboard.writeText'));
  assert.ok(studioJs.includes('ArrowRight'));
  assert.ok(studioJs.includes('refreshProjects()'));
  for (const forbidden of ['innerHTML', 'eval(', 'process.env', 'Authorization:']) {
    assert.ok(!studioJs.includes(forbidden), forbidden + ' should not exist');
  }
});
