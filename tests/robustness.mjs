// Robustness of the player against bad local data, bad imports and bad addresses (Codex DL1–DL4).
// Each case is a counterexample that broke the page or was accepted before the fix.
// Usage: node tests/robustness.mjs   (DOCS=<folder> to test another build; exit 1 on any failure)
import { createServer } from 'node:http';
import { readFileSync, existsSync, statSync, writeFileSync, mkdtempSync } from 'node:fs';
import { join, dirname, extname } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { chromium } = require('playwright');

const ROOT = dirname(dirname(fileURLToPath(import.meta.url)));
const DOCS = process.env.DOCS || join(ROOT, 'docs');
const TYPES = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.svg': 'image/svg+xml', '.woff2': 'font/woff2' };
const server = createServer((req, res) => {
  let f = join(DOCS, decodeURIComponent(req.url.split('?')[0]));
  if (existsSync(f) && statSync(f).isDirectory()) f = join(f, 'index.html');
  if (!existsSync(f)) { res.writeHead(404); res.end(); return; }
  res.writeHead(200, { 'content-type': TYPES[extname(f)] || 'application/octet-stream' });
  res.end(readFileSync(f));
}).listen(0);
const BASE = 'http://127.0.0.1:' + server.address().port;
const TODAY = new Date().toISOString().slice(0, 10);
const TMP = mkdtempSync(join(tmpdir(), 'dlg-rob-'));

const browser = await chromium.launch();
let fails = 0;
const check = (ok, msg) => { if (ok) console.log('ok   ' + msg); else { fails++; console.log('FAIL ' + msg); } };

async function open(path, storage) {
  const ctx = await browser.newContext();
  await ctx.route('**/*', (r) => (r.request().url().startsWith(BASE) ? r.continue() : r.abort()));
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  if (storage) {
    await page.goto(BASE + '/about/');
    await page.evaluate((s) => { localStorage.clear(); for (const [k, v] of Object.entries(s)) localStorage.setItem(k, v); }, storage);
  }
  await page.goto(BASE + path, { waitUntil: 'load' });
  await page.waitForTimeout(400);
  return { ctx, page, errors };
}
async function cells(page) {
  await page.waitForSelector('[data-game] .cells .cell, [data-game] .cell', { timeout: 15000 }).catch(() => {});
  return page.locator('[data-game] .cell').count();
}
async function importFile(page, obj, raw) {
  const f = join(TMP, 'import-' + Math.random().toString(36).slice(2) + '.json');
  writeFileSync(f, raw || JSON.stringify(obj));
  await page.setInputFiles('#garden-import', f);
  await page.waitForTimeout(300);
  const msg = await page.textContent('[data-import-msg]');
  const plants = await page.evaluate(() => { try { return JSON.parse(localStorage.getItem('dlg:garden')).plants; } catch (e) { return null; } });
  return { msg, plants };
}
const plant = (extra = {}) => ({ type: 'flowerbeds', level: 'sprout', key: TODAY, hints: 0, secs: 60, at: TODAY, ...extra });

// DL1: the same valid plant twice in one file is imported once
{
  const { ctx, page, errors } = await open('/garden/', {});
  const r = await importFile(page, { v: 1, plants: [plant(), plant()] });
  check(/Imported 1 plant\b/.test(r.msg) && r.plants && r.plants.length === 1 && !errors.length, `DL1 duplicate entry imported once (${r.msg}; ${r.plants && r.plants.length} stored)`);
  await ctx.close();
}

// DL4: negative or non-finite counts, future and pre-launch dates are rejected
{
  const { ctx, page, errors } = await open('/garden/', {});
  const raw = `{"v":1,"plants":[{"type":"tents","level":"bloom","key":"${TODAY}","hints":-1,"secs":5,"at":"${TODAY}"},` +
    `{"type":"tents","level":"grove","key":"${TODAY}","hints":0,"secs":1e999,"at":"${TODAY}"},` +
    `{"type":"tents","level":"sprout","key":"${TODAY}","hints":0,"secs":-30,"at":"${TODAY}"},` +
    `{"type":"sunshade","level":"sprout","key":"9999-12-31","hints":0,"secs":5,"at":"9999-12-31"},` +
    `{"type":"sunshade","level":"bloom","key":"2020-01-01","hints":0,"secs":5,"at":"2020-01-01"}]}`;
  const r = await importFile(page, null, raw);
  check(/Imported 0 plants/.test(r.msg) && (!r.plants || r.plants.length === 0) && !errors.length, `DL4 invalid values/dates rejected (${r.msg})`);
  await ctx.close();
}

// Clock set back: garden entries dated after today stay stored (hidden), imports allow at most today + 1 day
{
  const day = (n) => { const d = new Date(TODAY + 'T00:00:00Z'); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); };
  const later = plant({ type: 'tents', key: day(5), at: day(5) });
  const { ctx, page, errors } = await open('/garden/', { 'dlg:garden': JSON.stringify({ v: 1, plants: [later] }) });
  const shownBefore = await page.textContent('[data-garden-meta]');
  const r = await importFile(page, { v: 1, plants: [plant(), plant({ level: 'bloom', key: day(1), at: day(1) }), plant({ level: 'grove', key: day(2), at: day(2) })] });
  const keys = (r.plants || []).map((p) => p.key).sort();
  const shownAfter = await page.textContent('[data-garden-meta]');
  check(!errors.length && /Solve any puzzle/.test(shownBefore) && /Imported 2 plants/.test(r.msg) && keys.join() === [TODAY, day(1), day(5)].join() && /^1 plant\b/.test(shownAfter),
    `clock set back: later entry kept after write-back (${keys.join(', ')}), only today's shown (${shownAfter.slice(0, 40)}), import ${r.msg}`);
  await ctx.close();
}

// DL2: corrupt garden and corrupt board saves do not break the page; other valid saves stay
{
  const { ctx, errors } = await open('/garden/', { 'dlg:garden': '{"v":1,"plants":{}}' });
  check(!errors.length, 'DL2 garden {"plants":{}} renders without error' + (errors.length ? ': ' + errors[0] : ''));
  await ctx.close();
}
for (const [name, u] of [['u:{}', {}], ['too short', [0, 1]], ['value 99', null], ['value -1', null]]) {
  const save = 'dlg:v1:flowerbeds:sprout:' + TODAY;
  const probe = await open('/flower-beds/', { 'dlg:level:flowerbeds': '"sprout"' });
  const n = await cells(probe.page);
  const len = await probe.page.evaluate(() => document.querySelector('[data-game]').__game.user.length);
  await probe.ctx.close();
  let board = u;
  if (u === null) board = Array.from({ length: len }, (_, i) => (i === 0 ? (name === 'value 99' ? 99 : -1) : 0));
  const good = JSON.stringify({ v: 1, plants: [plant({ type: 'tents' })] });
  const { ctx, page, errors } = await open('/flower-beds/', { 'dlg:level:flowerbeds': '"sprout"', [save]: JSON.stringify({ u: board, h: 0, t: 0, s: false }), 'dlg:garden': good });
  const c = await cells(page);
  const kept = await page.evaluate(() => JSON.parse(localStorage.getItem('dlg:garden')).plants.length);
  const clean = await page.evaluate((len) => { const g = document.querySelector('[data-game]').__game; return !!g && Array.isArray(g.user) && g.user.length === len && g.user.every((v) => v === 0 || v === 1 || v === 2); }, len);
  check(!errors.length && c === n && kept === 1 && clean, `DL2 board save ${name}: board renders (${c}/${n} cells) with valid values only (${clean}), garden kept (${kept})` + (errors.length ? ' – ' + errors[0] : ''));
  await ctx.close();
}
{
  // tents: a tree replaced by an empty cell, Garden Path: a jump that is not a neighbour
  for (const [type, path] of [['tents', '/tents-and-trees/'], ['gardenpath', '/garden-path/']]) {
    const probe = await open(path, { ['dlg:level:' + type]: '"sprout"' });
    const n = await cells(probe.page);
    const saved = await probe.page.evaluate(() => { const g = document.querySelector('[data-game]').__game; return { u: g.user, p: g.p }; });
    await probe.ctx.close();
    let bad;
    if (type === 'tents') { bad = saved.u.slice(); bad[bad.indexOf(3)] = 0; }
    else bad = { path: [saved.p.solution[0], saved.p.solution[0] + saved.p.n * 2 + 2], pencil: {} };
    const { ctx, page, errors } = await open(path, { ['dlg:level:' + type]: '"sprout"', [`dlg:v1:${type}:sprout:${TODAY}`]: JSON.stringify({ u: bad, h: 0, t: 0, s: false }) });
    const c = await cells(page);
    const restored = await page.evaluate((t) => { const g = document.querySelector('[data-game]').__game; return t === 'tents' ? g.user.filter((v) => v === 3).length === g.p.trees.length : g.user.path.length === 1; }, type);
    check(!errors.length && c === n && restored, `DL2 ${type}: changed givens / broken path are not restored`);
    await ctx.close();
  }
}

// DL3: a badly encoded date in the address falls back to today
for (const q of ['?date=%E0%A4%A', '?date=9999-12-31&level=grove', '?level=%ZZ', '?date=2026-02-30']) {
  const { ctx, page, errors } = await open('/flower-beds/' + q, {});
  const c = await cells(page);
  const today = await page.evaluate(() => document.querySelector('[data-game]').__game && document.querySelector('[data-game]').__game.key);
  check(!errors.length && c > 0 && today === TODAY, `DL3 ${q}: game starts with today's puzzle` + (errors.length ? ' – ' + errors[0] : ''));
  await ctx.close();
}

await browser.close();
server.close();
console.log(fails ? `${fails} robustness failure(s)` : 'robustness checks passed');
if (fails) process.exit(1);
