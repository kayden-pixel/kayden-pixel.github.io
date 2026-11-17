import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const site = ['index.html','projects.html','systems.html','services.html','commissions.html','about.html','contact.html'];
const htmlByPage = Object.fromEntries(site.map(path => [path, readFileSync(resolve(root,path),'utf8')]));
const pageByName = new Map(site.map(x=>[x.replace('.html',''),x]));

function idsIn(html) {
  return new Set([...html.matchAll(/\bid="([^"]+)"/g)].map(match=>match[1]));
}
function testLinks(page,html) {
  for (const [,raw] of html.matchAll(/\bhref="([^"]+)"/g)) {
    const href=raw.replaceAll('&amp;','&');
    if (/^https?:\/\//.test(href) || /^(?:mailto:|tel:)/.test(href)) continue;
    assert.ok(!/^(?:javascript:|data:)/i.test(href),page+' unsafe link '+href);
    const [file,fragment] = href.split('#');
    assert.ok(!file.includes('..'),page+' path traversal '+href);
    const target=file ? resolve(root,file.split('?')[0]) : resolve(root,page);
    assert.ok(existsSync(target),page+' missing target for '+href);
    if (fragment) {
      const targetHtml=readFileSync(target,'utf8');
      assert.ok(idsIn(targetHtml).has(decodeURIComponent(fragment)),page+' broken anchor '+href);
    }
  }
}

test('seven genuinely separate discoverable HTML pages, not a single scrolling document', ()=>{
  assert.equal(site.length,7);
  for (const file of site) {
    const html=htmlByPage[file];
    assert.ok(html.includes('<main id="top"'),file);
    assert.equal((html.match(/<main\b/g)||[]).length,1,file+' duplicate main');
    assert.equal((html.match(/<\/main>/g)||[]).length,1,file+' unclosed main');
    assert.ok(html.includes('data-page="'+file.replace('.html','').replace('index','home')+'"'),file);
    assert.ok(html.includes('href="assets/base-v6.css"'),file+' base stylesheet');
    assert.ok(html.includes('href="assets/pages-v6.css"'),file+' page stylesheet');
    assert.match(html, /href="assets\/welcome-v5.css"/);
    assert.match(html, /src="assets\/welcome-v5.mjs"/);
    assert.match(html, /src="assets\/portfolio-chat.mjs"/);
    const canonical=file==='index.html'?'https://kayden-pixel.github.io/':'https://kayden-pixel.github.io/'+file;
    assert.ok(html.includes('rel="canonical" href="'+canonical+'"'),file+' canonical');
    assert.ok(html.includes('<title>'),file+' title');
  }
  const home=htmlByPage['index.html'];
  for(const target of site.filter(n=>n!=='index.html')){
    assert.ok(home.includes('href="'+target+'"'),'home missing link to '+target);
  }
  assert.ok(!home.includes('id="work"'), 'full portfolio should not be on home');
  assert.ok(!home.includes('id="lab-content"'), 'full systems lab should not be on home');
  assert.ok(!home.includes('id="commissions"'), 'Nitro commission details should not be on home');
});

test('seven-page navigation points to actual files with only the correct active link', ()=>{
  for(const [file,html] of Object.entries(htmlByPage)) {
    const nav=html.match(/<div class="nav-links" id="nav-links"[^>]*>([\s\S]*?)<\/div>/)?.[1];
    assert.ok(nav,file+' missing navigation');
    const anchors=[...nav.matchAll(/<a href="([^"]+)"([^>]*)>([^<]+)<\/a>/g)];
    assert.equal(anchors.length,7,file+' must contain seven nav links');
    assert.deepEqual(anchors.map(m=>m[1]),site);
    const current=anchors.filter(m=>m[2].includes('aria-current="page"'));
    assert.equal(current.length,1,file+' only one current link');
    assert.equal(current[0][1],file,file+' wrong active page');
    testLinks(file,html);
  }
});

test('project content, technical lab, birthday, services, bot commissions and contact are on the correct pages',()=>{
 const project=htmlByPage['projects.html'];
 const system=htmlByPage['systems.html'];
 assert.equal((project.match(/<article class="card project reveal/g)||[]).length,12);
 assert.equal((system.match(/class="lab-tab"/g)||[]).length,6);
 assert.match(project,/id="project-search"/);
 assert.match(system,/id="lab-content"/);
 assert.match(htmlByPage['about.html'], /<time datetime="2001-06-16">16 June 2001<\/time>/);
 assert.match(htmlByPage['about.html'],/id="stack"/);
 assert.match(htmlByPage['services.html'],/id="services"/);
 assert.match(htmlByPage['services.html'],/Minecraft delivery/);
 assert.match(htmlByPage['commissions.html'],/1 <small>YEAR<\/small>/);
 assert.match(htmlByPage['commissions.html'],/id="ask-bot-trigger"/);
 assert.match(htmlByPage['contact.html'],/id="contact"/);
});

test('shared quick search, mobile menu, public chat and intro controls remain on all pages',()=>{
 for (const [file,html] of Object.entries(htmlByPage)) {
  for(const id of ['nav-links','mobile-menu','command-palette','command-search','know-panel','know-trigger','welcome-intro','welcome-replay','top']){
    assert.ok(idsIn(html).has(id),file+' missing '+id);
  }
  assert.ok(html.includes('src="assets/experience.js"'),file);
  assert.ok(html.includes('src="assets/studio-v3.js"'),file);
  assert.ok(html.includes('src="assets/portfolio-chat.mjs"'),file);
  assert.ok(html.includes('href="assets/pages-v6.css"'),file);
 }
 const styles=readFileSync(resolve(root,'assets/pages-v6.css'),'utf8');
 assert.match(styles, /@media\(max-width:630px\)/);
 assert.match(styles,/prefers-reduced-motion/);
 assert.match(styles, /\[hidden\]/);
});
