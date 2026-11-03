// Browser test with Playwright: every sitemap page (+ /garden/) at 390 and 1366 px.
// External requests are blocked. Checks JS errors, horizontal overflow, working puzzles and tools,
// and the distance between (forcibly shown) ad containers and any control.
import { createServer } from 'node:http';
import { readFileSync, existsSync, statSync, mkdirSync } from 'node:fs';
import { join, dirname, extname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { chromium } = require('playwright');

const ROOT = dirname(dirname(fileURLToPath(import.meta.url)));
const DOCS = join(ROOT, 'docs');
const SHOTS = process.env.SHOTS || join(ROOT, '..', 'dlg-screenshots');
mkdirSync(SHOTS, { recursive: true });
const TYPES = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.xml': 'application/xml', '.txt': 'text/plain' };
const server = createServer((req, res) => {
  let p = decodeURIComponent(req.url.split('?')[0]);
  let f = join(DOCS, p);
  if (existsSync(f) && statSync(f).isDirectory()) f = join(f, 'index.html');
  if (!existsSync(f)) { res.writeHead(404, { 'content-type': 'text/html' }); res.end(readFileSync(join(DOCS, '404.html'))); return; }
  res.writeHead(200, { 'content-type': TYPES[extname(f)] || 'application/octet-stream' });
  res.end(readFileSync(f));
}).listen(0);
const BASE = 'http://127.0.0.1:' + server.address().port;
const urls = [...readFileSync(join(DOCS, 'sitemap.xml'), 'utf8').matchAll(/<loc>https:\/\/dailylogicgarden\.com([^<]+)<\/loc>/g)].map((m) => m[1]).concat(['/garden/']);

// stats.test maps to this local server but is not a local host name (for the ?stats_test=1 check)
const browser = await chromium.launch({ args: ['--host-resolver-rules=MAP stats.test 127.0.0.1'] });
// every request to a Google domain is recorded – on localhost/127.0.0.1 and with ?stats_test=1 there must be none
const GOOGLE = /^https?:\/\/([^/]*\.)?(google|googlesyndication|googletagmanager|googleadservices|doubleclick|gstatic|google-analytics)\.[a-z.]+\//;
const googleRequests = [];
let fails = 0, minAd = Infinity, minAdWhere = '', printPages = 0, lgFit = null;
const fail = (m) => { fails++; console.error('FAIL', m); };

async function solveWithHints(page, label) {
  // apply hints until the board is solved; proves board, hints and solved check work in the browser
  for (let i = 0; i < 400; i++) {
    if (await page.locator('.solved:not([hidden])').count()) return true;
    await page.click('.btn.hint');
    const apply = page.locator('.hintbox button');
    if (!(await apply.count())) { const t = await page.locator('.hintbox').innerText(); if (/solved/i.test(t)) return true; fail(label + ' hint without action: ' + t); return false; }
    await apply.first().click();
  }
  return false;
}

for (const width of [390, 1366]) {
  const ctx = await browser.newContext({ viewport: { width, height: 900 } });
  ctx.on('request', (r) => { if (GOOGLE.test(r.url())) googleRequests.push(r.url()); });
  await ctx.route('**/*', (route) => (route.request().url().startsWith(BASE) ? route.continue() : route.abort()));
  for (const u of urls) {
    const page = await ctx.newPage();
    const errors = [];
    page.on('pageerror', (e) => errors.push(e.message));
    page.on('console', (m) => { if (m.type() === 'error' && !/ERR_FAILED|net::|Failed to load resource/.test(m.text())) errors.push(m.text()); });
    await page.addInitScript(() => { window.print = () => { window.__printed = (window.__printed || 0) + 1; }; window.confirm = () => true; });
    await page.goto(BASE + u, { waitUntil: 'load' });
    const game = await page.locator('[data-game]').count();
    if (game) {
      await page.waitForSelector('.cells, .lg-grids', { timeout: 20000 });
      if (width === 390) {
        const ok = await solveWithHints(page, u);
        if (!ok) fail('could not solve via hints ' + u);
        const share = await page.locator('.share-text').innerText().catch(() => '');
        if (!/Solved in/.test(share)) fail('share text ' + u);
        // a second level renders too
        await page.click('.lvl button[data-level="grove"]');
        await page.waitForSelector('.cells, .lg-grids', { timeout: 30000 });
        await page.click('.btn.hint');
        if (!(await page.locator('.hintbox:not([hidden])').count())) fail('grove hint ' + u);
      }
    }
    const sinceLaunch = Math.round((Date.parse(new Date().toISOString().slice(0, 10)) - Date.parse('2026-11-02')) / 86400000) + 1;
    const expectDays = Math.min(30, sinceLaunch);
    if (u === '/archive/' && (await page.locator('.arch .day').count()) !== expectDays) fail('archive days');
    if (u === '/printable/' && width === 390) {
      await page.click('form[data-printable] button[type=submit]');
      await page.waitForFunction(() => window.__printed > 0, null, { timeout: 60000 });
      const sheets = await page.locator('.print-root .print-sheet').count();
      if (sheets !== Math.min(7, expectDays) * 3) fail('printable sheets ' + sheets);
      // print view: every sheet visible with height, article hidden, PDF has one page per sheet
      await page.emulateMedia({ media: 'print' });
      const pr = await page.evaluate(() => ({
        heights: [...document.querySelectorAll('.print-root .print-sheet')].map((e) => e.getBoundingClientRect().height),
        articleShown: getComputedStyle(document.querySelector('main .wrap > article')).display !== 'none'
      }));
      if (!pr.heights.length || pr.heights.some((h) => h < 100) || pr.articleShown) fail('print view of pack ' + JSON.stringify(pr));
      const pdf = await page.pdf({ format: 'Letter' });
      const pages = (pdf.toString('latin1').match(/\/Type\s*\/Page[^s]/g) || []).length;
      if (pages < sheets || pages < 2 && sheets > 1) fail('pdf pages ' + pages + ' for ' + sheets + ' sheets');
      printPages = pages;
      await page.emulateMedia({ media: 'screen' });
    }
    if (game && width === 390) {
      // single puzzle print view
      await page.emulateMedia({ media: 'print' });
      const h = await page.evaluate(() => [...document.querySelectorAll('.print-root .print-sheet')].map((e) => e.getBoundingClientRect().height));
      if (h.length !== 1 || h[0] < 100) fail('print sheet of ' + u + ' ' + JSON.stringify(h));
      const pdf = await page.pdf({ format: 'Letter' });
      if (pdf.length < 3000) fail('pdf of ' + u + ' looks empty');
      await page.emulateMedia({ media: 'screen' });
    }
    if (u === '/who-planted-what/' && width === 390) {
      // clues and the active grid fit on a 390 x 800 screen together
      await page.setViewportSize({ width: 390, height: 800 });
      const fit = await page.evaluate(() => {
        const grid = document.querySelector('.lg.active');
        grid.scrollIntoView({ block: 'end' });
        const g = grid.getBoundingClientRect(), c = document.querySelector('.lg-cluebox').getBoundingClientRect();
        return { gTop: g.top, gBottom: g.bottom, cTop: c.top, cBottom: c.bottom, vh: innerHeight, gameH: document.querySelector('[data-game]').getBoundingClientRect().height };
      });
      if (!(fit.cTop >= 0 && fit.cBottom <= fit.gTop + 1 && fit.gBottom <= fit.vh && fit.cBottom - fit.cTop > 80)) fail('who-planted-what clues + grid do not fit ' + JSON.stringify(fit));
      lgFit = fit;
      await page.setViewportSize({ width: 390, height: 900 });
    }
    if ((u === '/' || u === '/garden/') && !(await page.locator('[data-garden] svg').count())) fail('garden svg ' + u);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    if (overflow > 0) fail(`horizontal overflow ${overflow}px ${u} @${width}`);
    // force ad containers visible at full size and measure distance to controls
    const d = await page.evaluate(() => {
      const ads = [...document.querySelectorAll('.ad')];
      ads.forEach((a) => { a.hidden = false; a.style.minHeight = '250px'; a.style.background = 'rgba(200,0,0,.08)'; });
      const ctrls = [...document.querySelectorAll('button, a.btn, input, select, textarea, [data-game], .cells, .lg-grids, form, [data-archive]')].filter((e) => { const r = e.getBoundingClientRect(); return r.width && r.height && !e.closest('.ad'); });
      let min = Infinity, what = '';
      for (const a of ads) {
        const ra = a.getBoundingClientRect();
        if (!ra.width || getComputedStyle(a).display === 'none' || getComputedStyle(a.parentElement).display === 'none') continue;
        for (const c of ctrls) {
          const rc = c.getBoundingClientRect();
          const dx = Math.max(0, rc.left - ra.right, ra.left - rc.right), dy = Math.max(0, rc.top - ra.bottom, ra.top - rc.bottom);
          const dist = Math.hypot(dx, dy);
          if (dist < min) { min = dist; what = a.dataset.slot + ' vs ' + c.tagName + '.' + c.className; }
        }
      }
      return { min, what, n: ads.length };
    });
    if (d.n && d.min < 150) fail(`ad too close (${Math.round(d.min)}px, ${d.what}) ${u} @${width}`);
    if (d.n && d.min < minAd) { minAd = d.min; minAdWhere = `${u} @${width} ${d.what}`; }
    if (errors.length) fail(`JS errors ${u} @${width}: ${errors.join(' | ')}`);
    if (['/', '/flower-beds/', '/garden-path/', '/who-planted-what/'].includes(u)) {
      await page.evaluate(() => document.querySelectorAll('.ad').forEach((a) => { a.hidden = true; a.style.minHeight = ''; }));
      await page.evaluate(() => { const g = document.querySelector('[data-game]'); if (g) g.scrollIntoView(); else window.scrollTo(0, 0); });
      await page.screenshot({ path: join(SHOTS, `${u === '/' ? 'home' : u.replace(/\//g, '')}-${width}.png`), fullPage: false });
    }
    await page.close();
  }
  await ctx.close();
}
// localhost and ?stats_test=1 on a non-local host name: no Google script tag, no Google request
{
  const ctx = await browser.newContext({ viewport: { width: 1366, height: 900 } });
  ctx.on('request', (r) => { if (GOOGLE.test(r.url())) googleRequests.push(r.url()); });
  const port = server.address().port;
  await ctx.route('**/*', (route) => (/^http:\/\/(127\.0\.0\.1|localhost|stats\.test):/.test(route.request().url()) ? route.continue() : route.abort()));
  const page = await ctx.newPage();
  for (const u of [`http://localhost:${port}/`, `http://localhost:${port}/flower-beds/`, `http://localhost:${port}/privacy/`, `http://stats.test:${port}/?stats_test=1`, `http://stats.test:${port}/guides/`]) {
    await page.goto(u, { waitUntil: 'load' }); await page.waitForTimeout(250);
    if (/privacy/.test(u)) { await page.click('main [data-privacy-settings]'); await page.waitForTimeout(150); }
    const flag = await page.evaluate(() => window.DLG_NO_GOOGLE);
    const tags = await page.$$eval('script[src]', (ss) => ss.map((x) => x.src).filter((x) => /google/.test(x)));
    if (flag !== true || tags.length) fail(`${u}: guard ${flag}, Google script tags ${tags.join(', ')}`);
  }
  await ctx.close();
}
if (googleRequests.length) fail('requests to Google domains: ' + [...new Set(googleRequests)].slice(0, 5).join(', '));
else console.log('no request to any Google domain on localhost / 127.0.0.1 / ?stats_test=1');

await browser.close();
server.close();
console.log(`print pack PDF pages: ${printPages}; logic grid on 390x800: ${JSON.stringify(lgFit)}`);
console.log(`browser: ${urls.length} pages x 2 widths, ${fails} failures; min ad distance ${Math.round(minAd)}px (${minAdWhere}); screenshots in ${SHOTS}`);
if (fails) process.exit(1);
