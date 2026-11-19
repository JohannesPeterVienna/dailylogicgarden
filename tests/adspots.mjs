// Ad placements (2026-11-19), Playwright, every sitemap page at 1366x768 and 390x844, external requests blocked.
// Delivered ads are simulated: data-ad-status="filled" on every <ins>; the sized units (top, side) have their size from
// the <style> element of the page, the responsive ones get 280 px. Checks per page with ads:
// the top unit lies completely in the first screen, at least 40 px below the navigation and 150 px from every control
// of a puzzle or tool; the heading (on phones also the start of the text or tool) is visible without scrolling; puzzle
// and tool start in the first screen; guides: top edge of the 300x600 in the first screen at 1366; nothing moves when
// the unit is put in or filled; ads stay below 30 % of the main content height; no horizontal overflow; no JS errors.
import { createServer } from 'node:http';
import { readFileSync, existsSync, statSync } from 'node:fs';
import { join, dirname, extname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { chromium } = require('playwright');

const ROOT = dirname(dirname(fileURLToPath(import.meta.url)));
const DOCS = join(ROOT, 'docs');
const TYPES = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.xml': 'application/xml', '.txt': 'text/plain' };
const server = createServer((req, res) => {
  let f = join(DOCS, decodeURIComponent(req.url.split('?')[0]));
  if (existsSync(f) && statSync(f).isDirectory()) f = join(f, 'index.html');
  if (!existsSync(f)) { res.writeHead(404); res.end(); return; }
  res.writeHead(200, { 'content-type': TYPES[extname(f)] || 'application/octet-stream' });
  res.end(readFileSync(f));
}).listen(0);
const BASE = 'http://127.0.0.1:' + server.address().port;
const urls = [...readFileSync(join(DOCS, 'sitemap.xml'), 'utf8').matchAll(/<loc>https:\/\/dailylogicgarden\.com([^<]+)<\/loc>/g)].map((m) => m[1]).concat(['/garden/']);
const NO_ADS = ['/about/', '/contact/', '/imprint/', '/privacy/', '/garden/'];
const browser = await chromium.launch();
let fails = 0, checks = 0;
const ok = (c, m) => { checks++; if (!c) { fails++; console.error('FAIL', m); } };
const rows = [];

// fill = mark every unit as delivered; returns the geometry of the page
const measure = () => {
  const vh = innerHeight, abs = (r) => ({ top: r.top + scrollY, bottom: r.bottom + scrollY, left: r.left, right: r.right, width: r.width, height: r.height });
  const mainTop0 = document.querySelector('h1').getBoundingClientRect().top;
  const shown = [...document.querySelectorAll('.ad')].filter((a) => getComputedStyle(a.parentElement).display !== 'none' && a.querySelector('ins.adsbygoogle'));
  shown.forEach((a) => { const i = a.querySelector('ins'); if (!/dlg_/.test(i.className)) i.style.height = '280px'; i.setAttribute('data-ad-status', 'filled'); });
  const h1 = document.querySelector('h1').getBoundingClientRect();
  const ads = shown.map((a) => ({ slot: a.dataset.slot, ...abs(a.querySelector('ins').getBoundingClientRect()), label: a.querySelector('.ad-label').getBoundingClientRect().height > 0 && a.querySelector('.ad-label').textContent === 'Advertisement' }));
  const ctrls = [...document.querySelectorAll('button, a.btn, input, select, textarea, [data-game], .cells, .lg-grids, form, [data-archive], [data-printable], [data-walk], [data-finder]')].filter((e) => { const r = e.getBoundingClientRect(); return r.width && r.height && !e.closest('.ad') && !e.closest('footer'); });
  let min = Infinity, what = '';
  for (const a of ads) for (const c of ctrls) {
    const rc = abs(c.getBoundingClientRect());
    const d = Math.hypot(Math.max(0, rc.left - a.right, a.left - rc.right), Math.max(0, rc.top - a.bottom, a.top - rc.bottom));
    if (d < min) { min = d; what = a.slot + ' vs ' + c.tagName + '.' + c.className; }
  }
  const nav = Math.max(...[...document.querySelectorAll('header.site a')].map((a) => a.getBoundingClientRect().bottom));
  const tool = document.querySelector('[data-game], [data-archive], [data-printable], [data-walk], [data-finder]');
  const next = document.querySelector('h1 ~ .lede, h1 + p');
  const main = document.querySelector('main .wrap').getBoundingClientRect().height;
  return { vh, ads, min, what, nav, h1: { top: h1.top, bottom: h1.bottom }, moved: h1.top - mainTop0, tool: tool ? tool.getBoundingClientRect().top : null, next: next ? next.getBoundingClientRect().top : null,
    density: ads.filter((a) => a.slot !== 'side').reduce((s, a) => s + a.height, 0) / main, overflow: document.documentElement.scrollWidth - innerWidth, adsFlag: document.documentElement.getAttribute('data-ads') };
};

for (const [width, height] of [[1366, 768], [390, 844]]) {
  const ctx = await browser.newContext({ viewport: { width, height } });
  await ctx.route('**/*', (route) => (route.request().url().startsWith(BASE) ? route.continue() : route.abort()));
  for (const u of urls) {
    const page = await ctx.newPage();
    const errors = [];
    page.on('pageerror', (e) => errors.push(e.message));
    await page.goto(BASE + u, { waitUntil: 'load' });
    await page.waitForTimeout(150);
    const m = await page.evaluate(measure);
    const at = ` ${u} @${width}x${height}`;
    ok(!errors.length, 'JS errors' + at + ': ' + errors.join(' | '));
    ok(m.overflow <= 0, `horizontal overflow ${m.overflow}px` + at);
    if (NO_ADS.includes(u)) { ok(m.adsFlag === 'no' && !m.ads.length, 'page without ads has a placement' + at); await page.close(); continue; }
    const top = m.ads.find((a) => a.slot === 'top'), guide = /^\/guides\/./.test(u);
    ok(m.adsFlag === 'yes' && top && m.ads[0] === top, 'top placement missing or not the first' + at);
    if (top) {
      const want = width >= 1024 ? [970, guide ? 250 : 90] : [320, 100];
      ok(top.width === want[0] && top.height === want[1], `top size ${top.width}x${top.height}, expected ${want.join('x')}` + at);
      ok(top.top >= 0 && top.bottom <= m.vh, `top placement not completely in the first screen (${Math.round(top.top)}–${Math.round(top.bottom)})` + at);
      ok(top.top - m.nav >= 40, `top placement ${Math.round(top.top - m.nav)}px below the navigation, at least 40` + at);
      ok(top.left >= 16 && top.right <= width - 16, 'top placement touches the window edge' + at);
      ok(m.h1.top > top.bottom && m.h1.bottom <= m.vh, `heading not visible in the first screen (${Math.round(m.h1.top)}–${Math.round(m.h1.bottom)})` + at);
      ok(m.next !== null && m.next < m.vh - 40, `start of the text not in the first screen (${m.next && Math.round(m.next)})` + at);
      // /techniques/ is a reference article whose finder follows a three-line heading and the introduction: on phones the
      // introduction is what has to be visible there (checked above); on the desktop the finder starts in the first screen
      if (m.tool !== null && !(u === '/techniques/' && width < 800)) ok(m.tool < m.vh - 40, `puzzle or tool starts below the first screen (${Math.round(m.tool)})` + at);
      ok(Math.abs(m.moved) < 0.5, `page moved by ${m.moved}px when the ads were filled` + at);
      rows.push(`${width} ${u} top ${top.width}x${top.height} ${Math.round(top.top)}–${Math.round(top.bottom)}, h1 ${Math.round(m.h1.top)}, tool ${m.tool === null ? '-' : Math.round(m.tool)}, nearest control ${Math.round(m.min)}px`);
    }
    ok(m.ads.every((a) => a.label), 'label "Advertisement" missing on a filled unit' + at);
    ok(m.min >= 150, `ad ${Math.round(m.min)}px from a control (${m.what})` + at);
    ok(m.density < 0.3, `ads take ${(m.density * 100).toFixed(0)} % of the main content height` + at);
    const side = m.ads.find((a) => a.slot === 'side');
    if (guide && width >= 1200) {
      ok(side && side.width === 300 && side.height === 600 && side.top < m.vh - 200, 'guide: 300x600 with its top edge in the first screen expected' + at);
      // no two ads closer than 40 px, none next to another one except the side column
      ok(side && top && side.top - top.bottom >= 40, 'side unit too close to the top unit' + at);
    } else ok(!side, 'side unit outside the wide guide layout' + at);
    // the container holds the place before site.js has put the unit in: same height hidden and filled-in
    const hold = await page.evaluate(() => { const b = document.querySelector('.ad[data-slot="top"]'), i = b.querySelector('ins'); const h1 = b.getBoundingClientRect().height; i.style.display = 'none'; b.hidden = true; const h0 = b.getBoundingClientRect().height; b.hidden = false; i.style.display = ''; i.setAttribute('data-ad-status', 'unfilled'); const h2 = b.getBoundingClientRect().height; return [h0, h1, h2]; });
    ok(hold[0] === hold[1] && hold[0] > 80, `placeholder ${hold[0]}px differs from the unit ${hold[1]}px` + at);
    ok(hold[2] === 0, `unfilled top unit leaves ${hold[2]}px` + at);
    await page.close();
  }
  await ctx.close();
}

// sticky side unit on guides: only wide window + mouse, completely visible, inside its column, never over the text;
// not sticky on touch devices, in low windows, or while the statistics window is open
{
  const G = '/guides/binary-puzzle-rules/';
  const probe = async (opts, y, prep) => {
    const ctx = await browser.newContext(opts);
    await ctx.route('**/*', (route) => (route.request().url().startsWith(BASE) ? route.continue() : route.abort()));
    const page = await ctx.newPage();
    await page.goto(BASE + G, { waitUntil: 'load' });
    if (prep) await page.evaluate(prep);
    await page.evaluate(measure);
    await page.evaluate((yy) => window.scrollTo(0, yy), y); await page.waitForTimeout(100);
    const r = await page.evaluate(() => { const b = document.querySelector('aside.side .ad'), q = (e) => { const x = e.getBoundingClientRect(); return { top: x.top, bottom: x.bottom, left: x.left, right: x.right }; }; return { pos: getComputedStyle(b).position, box: q(b), art: q(document.querySelector('article.prose')), lay: q(document.querySelector('.layout')), vh: innerHeight, vw: document.documentElement.clientWidth }; });
    await ctx.close();
    return r;
  };
  const desk = { viewport: { width: 1366, height: 768 } };
  let r = await probe(desk, 1500);
  ok(r.pos === 'sticky' && r.box.top >= 24 && r.box.bottom <= r.vh - 24, 'sticky side unit not completely visible while scrolling: ' + JSON.stringify(r.box));
  ok(r.box.left - r.art.right >= 40 && r.vw - r.box.right >= 40, 'sticky side unit too close to the text or the window edge');
  r = await probe(desk, 100000);
  ok(r.box.bottom <= r.lay.bottom + 1, 'sticky side unit leaves its column at the end of the article');
  r = await probe({ viewport: { width: 1366, height: 1024 }, hasTouch: true, isMobile: true }, 1500);
  ok(r.pos === 'static', 'side unit must not be sticky on touch devices (' + r.pos + ')');
  r = await probe({ viewport: { width: 1366, height: 660 } }, 1500);
  ok(r.pos === 'static', 'side unit must not be sticky in a window lower than the unit');
  r = await probe({ viewport: { width: 1240, height: 768 } }, 1500);
  ok(r.pos === 'static', 'side unit must not be sticky below 1280 px');
  r = await probe(desk, 1500, () => document.body.classList.add('statbox-open'));
  ok(r.pos === 'static', 'side unit must scroll with the page while the statistics window is open');
}

// sizes at other window formats: 320x50 on short phones, 728x90 on tablets, 970x90 on low desktop windows also on
// guides, nothing below 352 px – and never a horizontal overflow
for (const [width, height, u, want] of [[390, 664, '/flower-beds/', '320x50'], [820, 1180, '/flower-beds/', '728x90'], [1366, 650, '/guides/binary-puzzle-rules/', '970x90'], [1024, 768, '/guides/binary-puzzle-rules/', '970x250'], [340, 700, '/', '0x0'], [320, 568, '/guides/binary-puzzle-rules/', '0x0']]) {
  const ctx = await browser.newContext({ viewport: { width, height } });
  await ctx.route('**/*', (route) => (route.request().url().startsWith(BASE) ? route.continue() : route.abort()));
  const page = await ctx.newPage();
  await page.goto(BASE + u, { waitUntil: 'load' });
  const r = await page.evaluate(() => { const b = document.querySelector('.ad[data-slot="top"]'), i = b.querySelector('ins').getBoundingClientRect(); return { size: i.width + 'x' + i.height, box: b.getBoundingClientRect().height, overflow: document.documentElement.scrollWidth - innerWidth }; });
  ok(r.size === want && r.overflow <= 0 && (want !== '0x0' || r.box === 0), `${width}x${height} ${u}: top ${r.size} (expected ${want}), box ${r.box}px, overflow ${r.overflow}px`);
  await ctx.close();
}

await browser.close();
server.close();
console.log(rows.join('\n'));
console.log(`adspots: ${checks - fails}/${checks} checks passed`);
if (fails) process.exit(1);
