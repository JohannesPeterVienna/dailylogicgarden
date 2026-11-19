// Browser test of the walkthrough, the technique finder and the technique line in hints (390 and 1366 px).
// External requests are blocked; the local server lives only for this script.
import { createServer } from 'node:http';
import { readFileSync, existsSync, statSync } from 'node:fs';
import { join, dirname, extname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const DOCS = join(dirname(dirname(fileURLToPath(import.meta.url))), 'docs');
const TYPES = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.svg': 'image/svg+xml', '.woff2': 'font/woff2' };
const server = createServer((req, res) => {
  let f = join(DOCS, decodeURIComponent(req.url.split('?')[0]));
  if (existsSync(f) && statSync(f).isDirectory()) f = join(f, 'index.html');
  if (!existsSync(f)) { res.writeHead(404, { 'content-type': 'text/html' }); res.end('not found'); return; }
  res.writeHead(200, { 'content-type': TYPES[extname(f)] || 'application/octet-stream' });
  res.end(readFileSync(f));
}).listen(0);
const BASE = 'http://127.0.0.1:' + server.address().port;
const browser = await chromium.launch();
let fails = 0, checks = 0;
const ok = (c, m) => { checks++; if (!c) { fails++; console.error('FAIL', m); } };
const today = new Date().toISOString().slice(0, 10);
const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);

for (const width of [390, 1366]) {
  const ctx = await browser.newContext({ viewport: { width, height: 900 } });
  await ctx.grantPermissions(['clipboard-read', 'clipboard-write']);
  await ctx.route('**/*', (r) => (r.request().url().startsWith(BASE) ? r.continue() : r.abort()));
  const open = async (u) => {
    const page = await ctx.newPage();
    page.errors = [];
    page.on('pageerror', (e) => page.errors.push(e.message));
    page.on('dialog', (d) => { page.errors.push('dialog: ' + d.message()); d.dismiss(); });
    page.on('console', (m) => { if (m.type() === 'error' && !/ERR_FAILED|net::|Failed to load resource/.test(m.text())) page.errors.push(m.text()); });
    await page.addInitScript(() => { window.print = () => { window.__printed = (window.__printed || 0) + 1; }; });
    await page.goto(BASE + u, { waitUntil: 'load' });
    return page;
  };
  const done = async (page, label) => {
    ok(!page.errors.length, `${label} @${width}: ${page.errors.join(' | ')}`);
    ok((await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)) <= 0, `${label} @${width}: no horizontal overflow`);
    await page.close();
  };

  // 1. every puzzle and level: step from the first deduction to the solved board
  for (const type of ['flowerbeds', 'tents', 'sunshade', 'gardenpath', 'whoplanted']) for (const level of width === 390 ? ['sprout', 'grove'] : ['bloom']) {
    const page = await open(`/walkthrough/?puzzle=${type}&level=${level}&date=2026-11-05&step=1`);
    await page.waitForSelector('.walk-list li', { timeout: 30000 });
    const n = await page.locator('.walk-list li').count();
    ok(n > 3 && /^Step 1 of /.test(await page.locator('.walk-head').innerText()), `${type} ${level}: starts at step 1 of ${n}`);
    ok((await page.locator('.walk-stage .hl-target, .walk-stage .hl-focus').count()) > 0, `${type} ${level}: step is highlighted on the board`);
    ok((await page.locator('.walk-head a').getAttribute('href')).startsWith('/'), `${type} ${level}: technique links to its explanation`);
    // clicking the board changes nothing
    const before = await page.locator('.walk-stage').innerHTML();
    await page.locator('.walk-stage .cell').first().click({ force: true }).catch(() => {});
    ok(before === await page.locator('.walk-stage').innerHTML(), `${type} ${level}: board is read-only`);
    for (let i = 0; i < n; i++) await page.click('.walk-nav .btn:not(.ghost)');
    ok((await page.locator('.walk-head').innerText()) === 'Solved' && await page.locator('.walk-nav .btn:not(.ghost)').isDisabled(), `${type} ${level}: ends on the solved board`);
    ok(new URL(page.url()).searchParams.get('step') === String(n + 1), `${type} ${level}: address follows the step`);
    await page.keyboard.press('Home');
    ok(/^Step 1 of /.test(await page.locator('.walk-head').innerText()), `${type} ${level}: Home key`);
    await page.keyboard.press('ArrowRight'); await page.keyboard.press('ArrowRight'); await page.keyboard.press('ArrowLeft');
    ok(/^Step 2 of /.test(await page.locator('.walk-head').innerText()), `${type} ${level}: arrow keys`);
    ok((await page.locator('.walk-list li[aria-current]').count()) === 1, `${type} ${level}: current step marked in the list`);
    // outside the tool the keys belong to the page: nothing moves
    await page.evaluate(() => { document.activeElement.blur(); });
    await page.keyboard.press('End'); await page.keyboard.press('ArrowRight'); await page.keyboard.press('Home');
    ok(/^Step 2 of /.test(await page.locator('.walk-head').innerText()), `${type} ${level}: keys outside the tool are left alone`);
    await page.locator('footer.site a').first().focus();
    await page.keyboard.press('ArrowRight');
    ok(/^Step 2 of /.test(await page.locator('.walk-head').innerText()), `${type} ${level}: keys on a link outside the tool are left alone`);
    ok((await page.evaluate(() => Object.keys(localStorage).filter((k) => k.startsWith('dlg:')).length)) === 0, `${type} ${level}: nothing stored`);
    await done(page, `walkthrough ${type} ${level}`);
  }

  // 2. copy, print, play link, deep link to a technique
  {
    const page = await open('/walkthrough/?puzzle=tents&level=grove&date=2026-11-12&tech=lookahead');
    await page.waitForSelector('.walk-list li');
    ok(/One-tent look-ahead/.test(await page.locator('.walk-head').innerText()), 'tech= opens the first step with that technique');
    await page.click('.walk-out button:nth-child(1)');
    const link = await page.evaluate(() => navigator.clipboard.readText());
    ok(/^https:\/\/dailylogicgarden\.com\/walkthrough\/\?puzzle=tents&level=grove&date=2026-11-12&step=\d+$/.test(link), 'copied link: ' + link);
    await page.click('.walk-out button:nth-child(2)');
    const all = await page.evaluate(() => navigator.clipboard.readText());
    ok(all.split('\n').length === (await page.locator('.walk-list li').count()) + 2 && /^1\. \[/m.test(all), 'copied step list');
    await page.click('.walk-out button:nth-child(3)');
    ok((await page.evaluate(() => window.__printed)) === 1 && (await page.locator('.print-root .print-sheet').count()) === 2 && (await page.locator('.print-root .sheet-steps li').count()) > 5, 'print view: board sheet and step sheet');
    await page.emulateMedia({ media: 'print' });
    ok((await page.evaluate(() => [...document.querySelectorAll('.print-root .print-sheet')].every((e) => e.getBoundingClientRect().height > 100) && getComputedStyle(document.querySelector('[data-walk]')).display === 'none')), 'print media shows only the sheets');
    await page.emulateMedia({ media: 'screen' });
    const play = await page.locator('.walk-out a').getAttribute('href');
    ok(play === '/tents-and-trees/?date=2026-11-12&level=grove', 'play link ' + play);
    await done(page, 'walkthrough tools');
  }

  // 3. default board and nonsense in the address
  {
    const page = await open('/walkthrough/');
    await page.waitForSelector('.walk-list li');
    ok((await page.inputValue('#walk-date')) === (yesterday >= '2026-11-02' ? yesterday : today) && !new URL(page.url()).search, 'default: yesterday, address untouched');
    await done(page, 'walkthrough default');
    for (const q of ['?puzzle=%3Cimg%20src%3Dx%20onerror%3Dalert(1)%3E&level=%22%3E%3Cscript%3Ealert(1)%3C/script%3E&date=9999-99-99&step=-5', '?puzzle=tents&level=grove&date=2020-01-01&step=99999999999', '?date=2026-02-30&step=abc&tech=%3Cb%3E', '?puzzle=__proto__&level=constructor&date=' + today + '&step=1e9', '?puzzle=%ZZ&step=%E0%A4%A']) {
      const p2 = await open('/walkthrough/' + q);
      await p2.waitForSelector('.walk-list li', { timeout: 30000 });
      ok(/^(Step \d+ of \d+|Solved)/.test(await p2.locator('.walk-head').innerText()), 'nonsense address still gives a board: ' + q);
      ok((await p2.locator('[data-walk] img, [data-walk] script').count()) === 0 && !(await p2.evaluate(() => window.__xss)), 'no markup from the address: ' + q);
      await done(p2, 'walkthrough ' + q);
    }
    // date field: a date outside the range is refused
    const p3 = await open('/walkthrough/?puzzle=sunshade&level=sprout&date=2026-11-03&step=2');
    await p3.waitForSelector('.walk-list li');
    await p3.fill('#walk-date', '2025-01-01'); await p3.dispatchEvent('#walk-date', 'change');
    ok((await p3.inputValue('#walk-date')) === '2026-11-03' && /Choose a date/.test(await p3.locator('[data-walk] .game-date').innerText()), 'date before launch refused');
    await p3.selectOption('#walk-puzzle', 'whoplanted');
    await p3.waitForSelector('.lg-grids');
    ok(new URL(p3.url()).searchParams.get('puzzle') === 'whoplanted', 'puzzle switch');
    await done(p3, 'walkthrough date field');
  }

  // 4. technique finder
  {
    const page = await open('/techniques/');
    await page.waitForSelector('#find-tech');
    ok(!new URL(page.url()).search, 'finder leaves the address alone until used');
    ok((await page.locator('#tech-table tbody tr').count()) === 31 && (await page.locator('#tech-table tbody tr:not([hidden])').count()) === 4, 'table narrowed to the chosen puzzle');
    await page.selectOption('#find-puzzle', 'tents');
    await page.selectOption('#find-tech', 'lookahead');
    const rows = await page.locator('[data-finder] tbody tr').count();
    ok(rows > 0 && rows <= 30, 'finder rows ' + rows);
    const hrefs = await page.locator('[data-finder] tbody a').evaluateAll((as) => as.map((a) => a.getAttribute('href')));
    ok(hrefs.every((h) => /^\/tents-and-trees\/\?date=2026-\d\d-\d\d&level=grove$|^\/walkthrough\/\?puzzle=tents&level=grove&date=2026-\d\d-\d\d&tech=lookahead$/.test(h)), 'finder links');
    ok(new URL(page.url()).search === '?puzzle=tents&tech=lookahead', 'finder address');
    await page.click('[data-finder] .controls button:nth-child(1)');
    ok((await page.evaluate(() => navigator.clipboard.readText())).split('\n').length === rows + 1, 'finder copy list');
    await page.selectOption('#find-puzzle', 'sunshade'); await page.selectOption('#find-tech', 'cross');
    ok((await page.locator('[data-finder] tbody tr').count()) === 0 && /No Sun & Shade board/.test(await page.locator('[data-finder] .game-date').innerText()) && await page.locator('[data-finder] .controls button').first().isDisabled(), 'technique never needed: message, no table');
    await page.click('[data-finder] .controls button:nth-child(3)');
    ok((await page.locator('#tech-table tbody tr:not([hidden])').count()) === 31, 'show all puzzles');
    // a finder link opens the walkthrough at that technique
    await page.goto(BASE + hrefs.find((h) => h.startsWith('/walkthrough/')));
    await page.waitForSelector('.walk-list li');
    ok(/One-tent look-ahead/.test(await page.locator('.walk-head').innerText()), 'finder link lands on the technique');
    await done(page, 'finder');
    const p2 = await open('/techniques/?puzzle=%3Cscript%3Ealert(1)%3C/script%3E&tech=%22onmouseover%3D%22alert(1)');
    await p2.waitForSelector('#find-tech');
    ok((await p2.inputValue('#find-puzzle')) === 'flowerbeds' && (await p2.locator('[data-finder] script').count()) === 0, 'finder ignores nonsense');
    await done(p2, 'finder nonsense');
  }

  // 5. hints name their technique; the old seniors address forwards
  {
    const page = await open('/tents-and-trees/?level=grove');
    await page.waitForSelector('.cells');
    await page.click('.btn.hint');
    const t = page.locator('.hintbox .hint-tech');
    ok((await t.count()) === 1 && /^Technique: .+ · (Sprout|Bloom|Grove) level$/.test(await t.innerText()) && (await t.locator('a').getAttribute('href')).startsWith('/guides/tents-and-trees-rules-strategy/#'), 'hint names the technique');
    await done(page, 'hint technique');
    // home: solving the board plants at once in the garden box and ticks today's card, without a reload
    const home = await open('/');
    await home.waitForSelector('.cells');
    const before = await home.locator('[data-garden-meta]').innerText();
    for (let i = 0; i < 300 && !(await home.locator('.solved:not([hidden])').count()); i++) { await home.click('.btn.hint'); await home.locator('.hintbox button').first().click(); }
    const after = await home.locator('[data-garden-meta]').innerText();
    ok(/Nothing ever wilts/.test(before) && /1 plant/.test(after), 'home garden box redrawn after solving: ' + after);
    ok((await home.locator('[data-today="flowerbeds"] a.done').count()) === 1, 'home: today card ticked after solving');
    await done(home, 'home garden');
    const p2 = await open('/guides/logic-puzzles-for-seniors/');
    await p2.waitForURL('**/guides/logic-puzzles-for-beginners/**');
    ok((await p2.locator('#comfort').count()) === 1, 'seniors address forwards to the comfort section');
    await p2.close();
  }
  await ctx.close();
}
await browser.close();
server.close();
console.log(`walk-browser: ${checks - fails}/${checks} checks passed`);
if (fails) process.exit(1);
