'use strict';
// Interim statistics window: src/js/consent.js + src/js/site.js run together in a vm with a stubbed DOM,
// a manual clock and an optional, scriptable Google CMP (googlefc callback queue + __tcfapi + __gpp).
const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const C = require('../src/js/consent.js');

const CONSENT = fs.readFileSync(path.join(__dirname, '..', 'src/js/consent.js'), 'utf8');
const SITE = fs.readFileSync(path.join(__dirname, '..', 'src/js/site.js'), 'utf8');
const KEY = 'dlg-stats', OFF = 'ga-disable-G-T00HRG2YVF', MONTH = 31 * 864e5;
const GRANT = { adStoragePurposeConsentStatus: 1, adUserDataPurposeConsentStatus: 1, adPersonalizationPurposeConsentStatus: 1, analyticsStoragePurposeConsentStatus: 1 };
const TC_HIDDEN = { gdprApplies: true, eventStatus: 'cmpuishown', displayStatus: 'hidden', tcString: '', purpose: { consents: {} }, vendor: { consents: {} } };
const TC_LOADED_EMPTY = Object.assign({}, TC_HIDDEN, { eventStatus: 'tcloaded' });
const TC_YES = { gdprApplies: true, eventStatus: 'useractioncomplete', tcString: 'CQ-yes', displayStatus: 'hidden', purpose: { consents: { 1: true } }, vendor: { consents: { 755: true } } };
const TC_NO = { gdprApplies: true, eventStatus: 'useractioncomplete', tcString: 'CQ-no', displayStatus: 'hidden', purpose: { consents: {} }, vendor: { consents: {} } };

let DOC = null;
function node(tag) {
  const n = {
    tagName: tag, attrs: {}, hidden: false, handlers: {}, focused: 0, offsetHeight: 210, textContent: '', parts: {},
    style: { props: {}, setProperty(k, v) { this.props[k] = v; } },
    classList: { set: new Set(), add(c) { this.set.add(c); }, remove(c) { this.set.delete(c); }, contains(c) { return this.set.has(c); } },
    setAttribute(k, v) { this.attrs[k] = String(v); }, hasAttribute(k) { return k in this.attrs; }, getAttribute(k) { return k in this.attrs ? this.attrs[k] : null; },
    addEventListener(ev, fn) { (this.handlers[ev] = this.handlers[ev] || []).push(fn); },
    fire(ev, e = {}) { (this.handlers[ev] || []).forEach((fn) => fn(Object.assign({ preventDefault() {}, stopPropagation() {} }, e))); },
    focus() { this.focused++; if (DOC) DOC.activeElement = this; },
    contains(x) { return x === this || Object.values(this.parts).includes(x); },
    set innerHTML(h) { this.html = h; },
    get innerHTML() { return this.html || ''; },
    querySelector(sel) { return this.parts[sel] || (this.parts[sel] = node(sel)); },
    querySelectorAll(sel) {
      if (sel === '[data-sb-choice]') return ['granted', 'denied'].map((c) => { const b = this.querySelector('choice:' + c); b.attrs['data-sb-choice'] = c; return b; });
      if (sel === '[data-sb-x],[data-sb-ok]') return [this.querySelector('[data-sb-x]'), this.querySelector('[data-sb-ok]')];
      return [];
    }
  };
  return n;
}

function page({ scope = 'page', stored, storage = 'ok', gpc = false, cmp = 'none', cookies = [], host = 'dailylogicgarden.com', now = Date.UTC(2026, 10, 5, 12) } = {}) {
  let clock = 0, timerSeq = 0, jar = cookies.slice();
  const timers = [], updates = [], configs = [], scripts = [], cookieWrites = [];
  const store = new Map(stored === undefined ? [] : [[KEY, typeof stored === 'string' ? stored : JSON.stringify(stored)]]);
  const html = node('html'); html.attrs['data-ads'] = 'no'; html.attrs['data-stats'] = scope;
  const body = node('body'), skip = node('a.skip'), privacyBtn = node('button');
  const inserted = [];
  skip.parentNode = { insertBefore: (el) => inserted.push(el) };
  body.appendChild = (el) => { inserted.push(el); order.push(el.tagName + (el.name ? ':' + el.name : '')); };
  let tcfListener = null, gppListener = null;
  const order = [], docKeys = new Set(), main = node('main');
  const document = {
    documentElement: html, body, head: { appendChild: (s) => { scripts.push(s); order.push('script:' + s.src); } },
    activeElement: body,
    getElementById: (id) => (id === 'main' ? main : null),
    addEventListener: (ev, fn) => { if (ev === 'keydown') docKeys.add(fn); },
    removeEventListener: (ev, fn) => { if (ev === 'keydown') docKeys.delete(fn); },
    createElement: (t) => node(t),
    querySelector: (sel) => (sel === '.skip' ? skip : null),
    querySelectorAll: (sel) => (sel === '[data-privacy-settings]' ? [privacyBtn] : []),
    get cookie() { return jar.join('; '); },
    set cookie(v) { cookieWrites.push(v); const name = v.split('=')[0]; jar = jar.filter((c) => c.split('=')[0] !== name); if (!/expires=Thu, 01 Jan 1970/.test(v)) jar.push(v.split(';')[0]); }
  };
  DOC = document;
  const blocked = () => { throw new Error('SecurityError'); };
  const localStorage = storage === 'blocked' ? { getItem: blocked, setItem: blocked, removeItem: blocked }
    : { getItem: (k) => (store.has(k) ? store.get(k) : null), setItem: (k, v) => store.set(k, String(v)), removeItem: (k) => store.delete(k) };
  const RealDate = Date;
  const FakeDate = function (...a) { return a.length ? new RealDate(...a) : new RealDate(now + clock); };
  FakeDate.now = () => now + clock; FakeDate.UTC = RealDate.UTC; FakeDate.prototype = RealDate.prototype;
  const ctx = {
    document, navigator: gpc ? { globalPrivacyControl: true } : {}, location: { hostname: host, protocol: 'https:', search: '' },
    Date: FakeDate, JSON, Array, Object, String, Math, isFinite, Error,
    setTimeout: (fn, ms) => { const id = ++timerSeq; timers.push({ id, at: clock + (ms || 0), fn }); return id; },
    clearTimeout: (id) => { const i = timers.findIndex((t) => t.id === id); if (i >= 0) timers.splice(i, 1); },
    matchMedia: () => ({ matches: false }),
    gtag: (...a) => { const c = JSON.parse(JSON.stringify(a.filter((x) => !(x instanceof Object && x.constructor && x.constructor.name === 'Date')))); if (a[0] === 'consent' && a[1] === 'update') updates.push(c[2]); if (a[0] === 'config') configs.push(c); },
    localStorage, dataLayer: []
  };
  ctx.window = ctx;
  if (cmp !== 'none') {
    // Google's CMP: the callback queue is processed at once; __tcfapi/__gpp keep the listener for later events
    const queue = [];
    ctx.googlefc = { callbackQueue: { push: (x) => { queue.push(x); if (typeof x === 'function') x(); else if (x.CONSENT_API_READY) x.CONSENT_API_READY(); } },
      getGoogleConsentModeValues: () => ctx.__cm || null, showRevocationMessage: () => { ctx.__revocation = (ctx.__revocation || 0) + 1; } };
    ctx.__tcfapi = (cmd, v, cb) => { if (cmd === 'addEventListener') tcfListener = cb; };
    ctx.__gpp = (cmd, cb) => { if (cmd === 'addEventListener') gppListener = cb; };
    ctx.__queue = queue;
  }
  vm.createContext(ctx);
  vm.runInContext(CONSENT, ctx);
  vm.runInContext(SITE, ctx);
  const advance = (ms) => {
    const until = clock + ms;
    for (;;) { timers.sort((a, b) => a.at - b.at); const t = timers[0]; if (!t || t.at > until) break; timers.shift(); clock = t.at; t.fn(); }
    clock = until;
  };
  const box = () => inserted.find((el) => el.attrs.role === 'dialog') || null;
  const live = () => inserted.find((el) => el.attrs['aria-live'] === 'polite') || null;
  return {
    ctx, store, updates, configs, cookieWrites, advance, box, live, privacyBtn, body, scripts, order, main,
    docEsc: (extra = {}) => [...docKeys].forEach((fn) => fn(Object.assign({ key: 'Escape', defaultPrevented: false }, extra))),
    docListeners: () => docKeys.size,
    shown: () => !!box() && box().hidden === false,
    gtm: () => scripts.filter((s) => /googletagmanager\.com\/gtag\/js/.test(s.src || '')),
    jar: () => jar.slice(),
    tcf: (tc, cm) => { if (cm !== undefined) ctx.__cm = cm; tcfListener(tc, true); },
    cmReady: (cm) => { ctx.__cm = cm; ctx.__queue.filter((x) => x && x.CONSENT_MODE_DATA_READY).forEach((x) => x.CONSENT_MODE_DATA_READY()); },
    gpp: (ping) => gppListener({ pingData: ping }, true),
    pick: (choice) => box().querySelector('choice:' + choice).fire('click'),
    closeX: () => box().querySelector('[data-sb-x]').fire('click'),
    esc: () => box().fire('keydown', { key: 'Escape' }),
    saved: () => (store.has(KEY) ? JSON.parse(store.get(KEY)) : null),
    flag: () => ctx[OFF],
    analyticsUpdates: () => updates.filter((u) => Object.keys(u).length === 1 && 'analytics_storage' in u)
  };
}

/* ---------- pure helpers ---------- */
test('helpers: "cmpuishown" with displayStatus hidden/disabled is not a shown dialog; real decisions are recognised', () => {
  assert.strictEqual(C.cmpShown(TC_HIDDEN), false);
  assert.strictEqual(C.cmpShown(Object.assign({}, TC_HIDDEN, { displayStatus: 'disabled' })), false);
  assert.strictEqual(C.cmpShown(Object.assign({}, TC_HIDDEN, { displayStatus: 'visible' })), true);
  assert.strictEqual(C.cmpDecided(TC_LOADED_EMPTY), false);
  assert.strictEqual(C.cmpDecided(Object.assign({}, TC_LOADED_EMPTY, { tcString: 'CQ' })), true);
  assert.strictEqual(C.cmpDecided(TC_NO), true);
  assert.strictEqual(C.cmpTakesOver({ gdprApplies: false, eventStatus: 'cmpuishown', displayStatus: 'hidden' }), true);
  assert.strictEqual(C.cmpTakesOver(TC_HIDDEN), false);
  assert.strictEqual(C.cmpTakesOver(null), false);
  assert.strictEqual(C.cmpRefusesStats(TC_NO, null), true);
  assert.strictEqual(C.cmpRefusesStats(TC_YES, GRANT), false);
  assert.strictEqual(C.cmpRefusesStats(TC_YES, Object.assign({}, GRANT, { analyticsStoragePurposeConsentStatus: 2 })), true);
  assert.strictEqual(C.cmpRefusesStats(TC_HIDDEN, null), false); // no decision yet: nothing to act on
});
test('helpers: stored choice – version, choice, 12 months, future time, junk', () => {
  const now = Date.UTC(2026, 10, 5);
  assert.deepStrictEqual(C.readStats(JSON.stringify({ v: 1, choice: 'granted', at: now - 864e5 }), now), { v: 1, choice: 'granted', at: now - 864e5 });
  assert.strictEqual(C.readStats(JSON.stringify({ v: 1, choice: 'granted', at: Date.UTC(2025, 10, 5) }), now), null);       // exactly 12 months
  assert.notStrictEqual(C.readStats(JSON.stringify({ v: 1, choice: 'denied', at: Date.UTC(2025, 10, 6) }), now), null);    // just under 12 months
  assert.strictEqual(C.readStats(JSON.stringify({ v: 1, choice: 'granted', at: now + 60000 }), now), null);                // in the future
  for (const raw of [null, '', '{', '[]', '"x"', JSON.stringify({ v: 2, choice: 'granted', at: now }), JSON.stringify({ v: 1, choice: 'yes', at: now }), JSON.stringify({ v: 1, choice: 'granted', at: 'now' })]) {
    assert.strictEqual(C.readStats(raw, now), null, String(raw));
  }
  assert.deepStrictEqual(C.statsRecord('granted', 5), { v: 1, choice: 'granted', at: 5 });
  assert.strictEqual(C.statsRecord('anything', 5).choice, 'denied');
});
test('helpers: GA cookie names and every domain variant', () => {
  assert.deepStrictEqual(C.gaCookieNames('_ga=GA1.1.1; _ga_T00HRG2YVF=GS1; _gab=1; x_ga=2; _ga=dup'), ['_ga', '_ga_T00HRG2YVF']);
  assert.deepStrictEqual(C.cookieScopes('www.dailylogicgarden.com'), ['', '; domain=www.dailylogicgarden.com', '; domain=.www.dailylogicgarden.com', '; domain=dailylogicgarden.com', '; domain=.dailylogicgarden.com']);
  assert.deepStrictEqual(C.cookieScopes('localhost'), ['']);
  assert.deepStrictEqual(C.cookieScopes('127.0.0.1'), ['']);
});

/* ---------- the window in the page ---------- */
test('window appears after 3 s when the CMP stays hidden (cmpuishown/tcloaded with displayStatus hidden)', () => {
  const p = page({ cmp: 'hidden' });
  p.tcf(TC_HIDDEN); p.tcf(TC_LOADED_EMPTY);
  p.advance(2900);
  assert.strictEqual(p.shown(), false);
  p.advance(200);
  assert.strictEqual(p.shown(), true);
  const b = p.box();
  assert.strictEqual(b.attrs.role, 'dialog'); assert.strictEqual(b.attrs['aria-modal'], 'false'); assert.strictEqual(b.attrs['aria-labelledby'], 'statbox-h');
  assert.match(b.innerHTML, /id="statbox-h" tabindex="-1"/);
  assert.match(b.innerHTML, /data-sb-choice="granted">Allow<\/button><button type="button" class="statbox-btn" data-sb-choice="denied">Decline</); // same class, same size
  assert.strictEqual(b.querySelector('#statbox-h').focused, 0); // shown by itself: focus is not taken from the game
  p.advance(100);
  assert.match(p.live().textContent, /visitor statistics/);
  assert.strictEqual(p.flag(), true); assert.strictEqual(p.gtm().length, 0);
});
test('window appears when __tcfapi is missing entirely', () => {
  const p = page({ cmp: 'none' });
  p.advance(3000);
  assert.strictEqual(p.shown(), true);
});
test('no window when the CMP decides, shows its message or reports gdprApplies false', () => {
  for (const tc of [TC_YES, TC_NO, Object.assign({}, TC_LOADED_EMPTY, { tcString: 'CQ-stored' }), Object.assign({}, TC_HIDDEN, { displayStatus: 'visible' }), { gdprApplies: false, eventStatus: 'tcloaded', tcString: '' }]) {
    const p = page({ cmp: 'live' });
    p.tcf(tc);
    p.advance(5000);
    assert.strictEqual(p.shown(), false, JSON.stringify(tc));
  }
});
test('gdprApplies false: existing logic for non-EU visitors, own stored choice is deleted', () => {
  const p = page({ cmp: 'live', stored: { v: 1, choice: 'granted', at: Date.UTC(2026, 10, 1) } });
  p.tcf({ gdprApplies: false, eventStatus: 'tcloaded', tcString: '' });
  p.advance(4000);
  assert.strictEqual(p.shown(), false); assert.strictEqual(p.saved(), null);
  assert.strictEqual(p.flag(), true); // CM values not ready, no U.S. status: stays off
  p.cmReady({ adStoragePurposeConsentStatus: 3, adUserDataPurposeConsentStatus: 3, adPersonalizationPurposeConsentStatus: 3, analyticsStoragePurposeConsentStatus: 3 });
  p.ctx.googlefc.usstatesoptout = { getInitialUsStatesOptOutStatus: () => 1 };
  p.ctx.__queue.filter((x) => x && x.INITIAL_US_STATES_OPT_OUT_DATA_READY).forEach((x) => x.INITIAL_US_STATES_OPT_OUT_DATA_READY());
  assert.strictEqual(p.flag(), false);
  // a later U.S. opt-out via GPP: analytics off and GA cookies deleted
  p.gpp({ signalStatus: 'ready', parsedSections: { usnat: [{ SaleOptOut: 1 }] } });
  assert.strictEqual(p.flag(), true);
});
test('GPC: no window, no analytics, even with a stored "allow"', () => {
  const p = page({ cmp: 'none', gpc: true, stored: { v: 1, choice: 'granted', at: Date.UTC(2026, 10, 1) } });
  p.advance(5000);
  assert.strictEqual(p.shown(), false); assert.strictEqual(p.flag(), true); assert.strictEqual(p.gtm().length, 0);
  const q = page({ cmp: 'none', gpc: true }); q.advance(5000);
  assert.strictEqual(q.shown(), false);
  q.privacyBtn.fire('click'); // on request: an explanation, no choice buttons
  assert.strictEqual(q.shown(), true);
  assert.match(q.box().querySelector('[data-sb-text]').textContent, /Global Privacy Control/);
  assert.strictEqual(q.box().querySelector('[data-sb-pick]').hidden, true);
});
test('GPC deletes existing _ga cookies at load, also with a stored "allow" and on pages without ads', () => {
  for (const scope of ['page', 'settings']) {
    const p = page({ scope, cmp: 'none', gpc: true, stored: { v: 1, choice: 'granted', at: Date.UTC(2026, 10, 1) }, cookies: ['_ga=GA1.1.1', '_ga_T00HRG2YVF=GS1', 'keep=1'] });
    assert.deepStrictEqual(p.jar(), ['keep=1'], scope + ': at load');
    p.ctx.document.cookie = '_ga=GA1.1.2'; // a cookie appearing later is removed at the 3-s start
    p.advance(3000);
    if (scope === 'page') assert.deepStrictEqual(p.jar(), ['keep=1'], 'at start');
    assert.strictEqual(p.flag(), true); assert.strictEqual(p.gtm().length, 0);
  }
  // Google phase (gdprApplies false, CMP grants) with GPC: no GA, _ga deleted
  const g = page({ cmp: 'live', gpc: true, cookies: ['_ga=GA1.1.4'] });
  g.ctx.document.cookie = '_ga=GA1.1.4';
  g.tcf({ gdprApplies: false, eventStatus: 'tcloaded', tcString: '' });
  assert.deepStrictEqual(g.jar(), []); assert.strictEqual(g.flag(), true);
});
test('U.S. opt-out with a stored "allow" and _ga already present: deleted at the start, no window', () => {
  const p = page({ cmp: 'hidden', stored: { v: 1, choice: 'granted', at: Date.UTC(2026, 10, 1) } });
  p.ctx.googlefc.usstatesoptout = { getInitialUsStatesOptOutStatus: () => 3 };
  p.ctx.__queue.filter((x) => x && x.INITIAL_US_STATES_OPT_OUT_DATA_READY).forEach((x) => x.INITIAL_US_STATES_OPT_OUT_DATA_READY());
  p.tcf(TC_HIDDEN);
  p.ctx.document.cookie = '_ga=GA1.1.8';
  p.advance(3000);
  assert.deepStrictEqual(p.jar(), []); assert.strictEqual(p.flag(), true); assert.strictEqual(p.shown(), false); assert.strictEqual(p.gtm().length, 0);
});
test('U.S. opt-out via GPP during the window phase: no analytics', () => {
  const p = page({ cmp: 'hidden', stored: { v: 1, choice: 'granted', at: Date.UTC(2026, 10, 1) }, cookies: ['_ga=GA1.1.5'] });
  p.tcf(TC_HIDDEN); p.advance(3000);
  assert.strictEqual(p.flag(), false);
  p.gpp({ signalStatus: 'ready', parsedSections: { usnat: [{ SaleOptOut: 2 }, { Gpc: true }] } });
  assert.strictEqual(p.flag(), true);
  assert.deepStrictEqual(p.analyticsUpdates().pop(), { analytics_storage: 'denied' });
  assert.deepStrictEqual(p.jar(), []);
});
test('Allow sets only analytics_storage, loads gtag.js once with signals off', () => {
  const p = page({ cmp: 'none' });
  p.advance(3000);
  p.pick('granted');
  assert.strictEqual(p.shown(), false);
  assert.strictEqual(p.saved().choice, 'granted'); assert.strictEqual(p.saved().v, 1); assert.strictEqual(typeof p.saved().at, 'number');
  assert.deepStrictEqual(p.updates[p.updates.length - 1], { analytics_storage: 'granted' });
  for (const u of p.updates) for (const k of ['ad_storage', 'ad_user_data', 'ad_personalization']) assert.ok(!(k in u) || u[k] === 'denied', 'never grants ' + k);
  assert.strictEqual(p.flag(), false);
  assert.strictEqual(p.gtm().length, 1);
  assert.deepStrictEqual(p.configs, [['config', 'G-T00HRG2YVF', { allow_google_signals: false, allow_ad_personalization_signals: false }]]);
  // withdraw and allow again in the same page view: still one gtag.js
  p.privacyBtn.fire('click'); p.pick('denied'); p.privacyBtn.fire('click'); p.pick('granted');
  assert.strictEqual(p.gtm().length, 1);
  assert.strictEqual(p.privacyBtn.focused >= 1, true); // focus returns to "Privacy settings"
});
test('Decline / withdrawal: GA off, analytics_storage denied, _ga and _ga_* deleted on every domain variant', () => {
  const p = page({ cmp: 'none', host: 'www.dailylogicgarden.com', cookies: ['_ga=GA1.1.9', '_ga_T00HRG2YVF=GS1.1', 'dlg=1'] });
  p.advance(3000);
  p.pick('denied');
  assert.strictEqual(p.flag(), true);
  assert.deepStrictEqual(p.updates[p.updates.length - 1], { analytics_storage: 'denied' });
  assert.deepStrictEqual(p.jar(), ['dlg=1']);
  for (const n of ['_ga', '_ga_T00HRG2YVF']) for (const d of ['', '; domain=dailylogicgarden.com', '; domain=.dailylogicgarden.com', '; domain=www.dailylogicgarden.com']) {
    assert.ok(p.cookieWrites.includes(`${n}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; max-age=0; path=/${d}`), n + d);
  }
  assert.strictEqual(p.saved().choice, 'denied');
});
test('a stored "no" deletes _ga at load; a stored "yes" measures without asking', () => {
  const p = page({ cmp: 'none', stored: { v: 1, choice: 'denied', at: Date.UTC(2026, 10, 1) }, cookies: ['_ga=GA1.1.3'] });
  assert.deepStrictEqual(p.jar(), []); // at once, before the 3 s
  p.advance(3000);
  assert.strictEqual(p.shown(), false); assert.strictEqual(p.flag(), true);
  const q = page({ cmp: 'none', stored: { v: 1, choice: 'granted', at: Date.UTC(2026, 10, 1) } });
  q.advance(3000);
  assert.strictEqual(q.shown(), false); assert.strictEqual(q.flag(), false); assert.strictEqual(q.gtm().length, 1);
});
test('× and Escape store nothing and are not consent', () => {
  const p = page({ cmp: 'none' });
  p.advance(3000); p.closeX();
  assert.strictEqual(p.shown(), false); assert.strictEqual(p.saved(), null); assert.strictEqual(p.flag(), true);
  const q = page({ cmp: 'none' });
  q.advance(3000); q.esc();
  assert.strictEqual(q.shown(), false); assert.strictEqual(q.saved(), null); assert.strictEqual(q.gtm().length, 0);
});
test('12-month expiry and future timestamps: asked again', () => {
  const now = Date.UTC(2026, 10, 5, 12);
  for (const at of [now - 13 * MONTH, now + 864e5]) {
    const p = page({ cmp: 'none', now, stored: { v: 1, choice: 'granted', at } });
    p.advance(3000);
    assert.strictEqual(p.shown(), true, String(at)); assert.strictEqual(p.flag(), true);
  }
  const fresh = page({ cmp: 'none', now, stored: { v: 1, choice: 'granted', at: now - 11 * MONTH } });
  fresh.advance(3000);
  assert.strictEqual(fresh.shown(), false);
});
test('blocked localStorage throws nothing; the choice holds for the page view', () => {
  const p = page({ cmp: 'none', storage: 'blocked' });
  assert.doesNotThrow(() => p.advance(3000));
  assert.strictEqual(p.shown(), true);
  assert.doesNotThrow(() => p.pick('granted'));
  assert.strictEqual(p.flag(), false);
  const q = page({ scope: 'settings', storage: 'blocked' });
  assert.doesNotThrow(() => q.privacyBtn.fire('click'));
  assert.match(q.box().querySelector('[data-sb-now]').textContent, /No choice saved/);
});
test('Google has priority: a late CMP decision closes the window, deletes the own choice and decides alone', () => {
  // window open, then Google decides "yes"
  const p = page({ cmp: 'hidden' });
  p.tcf(TC_HIDDEN); p.advance(3000);
  assert.strictEqual(p.shown(), true);
  p.tcf(TC_YES, GRANT); p.cmReady(GRANT);
  assert.strictEqual(p.shown(), false);
  assert.strictEqual(p.flag(), false);
  assert.deepStrictEqual(p.updates[p.updates.length - 1], { ad_storage: 'granted', ad_user_data: 'granted', ad_personalization: 'granted', analytics_storage: 'granted' });
  // window said "allow" earlier, Google now says "no": own choice deleted, GA off, _ga deleted
  const q = page({ cmp: 'hidden', stored: { v: 1, choice: 'granted', at: Date.UTC(2026, 10, 1) }, cookies: ['_ga=GA1.1.7', '_ga_T00HRG2YVF=GS'] });
  q.tcf(TC_HIDDEN); q.advance(3000);
  assert.strictEqual(q.flag(), false);
  q.tcf(TC_NO);
  assert.strictEqual(q.flag(), true); assert.strictEqual(q.saved(), null); assert.deepStrictEqual(q.jar(), []);
  // Google shows its message later: the window closes, the window no longer decides
  const r = page({ cmp: 'hidden' });
  r.tcf(TC_HIDDEN); r.advance(3000);
  r.tcf(Object.assign({}, TC_HIDDEN, { displayStatus: 'visible' }));
  assert.strictEqual(r.shown(), false);
  r.privacyBtn.fire('click'); // now opens Google's message, not the window
  assert.strictEqual(r.shown(), false); assert.strictEqual(r.ctx.__revocation, 1);
});
test('Google refuses statistics: _ga deleted even if the window was never active', () => {
  const p = page({ cmp: 'live', cookies: ['_ga=GA1.1.1'] });
  p.tcf(Object.assign({}, TC_NO, { eventStatus: 'tcloaded' }));
  assert.deepStrictEqual(p.jar(), []);
  p.advance(4000);
  assert.strictEqual(p.shown(), false);
});
test('pages without ads: no timer, no GA; "Privacy settings" opens the window to view, change or withdraw', () => {
  const p = page({ scope: 'settings', stored: { v: 1, choice: 'granted', at: Date.UTC(2026, 10, 1) } });
  p.advance(10000);
  assert.strictEqual(p.shown(), false); assert.strictEqual(p.gtm().length, 0);
  p.privacyBtn.fire('click');
  assert.strictEqual(p.shown(), true);
  assert.strictEqual(p.box().querySelector('#statbox-h').focused, 1);
  assert.match(p.box().querySelector('[data-sb-now]').textContent, /allowed on November 1, 2026/);
  p.pick('denied');
  assert.strictEqual(p.saved().choice, 'denied'); assert.strictEqual(p.gtm().length, 0); assert.strictEqual(p.flag(), true);
  p.privacyBtn.fire('click'); p.pick('granted');
  assert.strictEqual(p.gtm().length, 0, 'settings pages never load GA');
});
test('pages without ads: "Open Google’s ad & U.S. privacy choices" loads only Google’s consent script on click, Google then decides, GA stays off', () => {
  const p = page({ scope: 'settings', stored: { v: 1, choice: 'granted', at: Date.UTC(2026, 10, 1) } });
  assert.strictEqual(p.scripts.length, 0);
  p.privacyBtn.fire('click');
  assert.strictEqual(p.box().querySelector('[data-sb-more]').hidden, false);
  assert.match(p.box().innerHTML, /data-sb-google>Open Google’s ad &amp; U\.S\. privacy choices</);
  assert.strictEqual(p.scripts.length, 0, 'nothing loaded before the click');
  p.box().querySelector('[data-sb-google]').fire('click');
  assert.strictEqual(p.shown(), false);
  assert.deepStrictEqual(p.scripts.map((x) => x.src), ['https://fundingchoicesmessages.google.com/i/pub-7811071715414905?ers=1']);
  assert.deepStrictEqual(p.order, ['iframe:googlefcPresent', 'script:https://fundingchoicesmessages.google.com/i/pub-7811071715414905?ers=1'], 'queue, then frame, then script (E1)');
  assert.ok(p.ctx.googlefc.callbackQueue.some((x) => typeof x === 'function'), 'callback queued before the script');
  assert.ok(!p.scripts.some((x) => /adsbygoogle/.test(x.src)), 'no ad code');
  // Google's script arrives: it runs the queued callbacks (listeners + the revocation message)
  let tcf = null, revocations = 0;
  const fc = p.ctx.googlefc;
  fc.showRevocationMessage = () => { revocations++; };
  fc.getGoogleConsentModeValues = () => GRANT;
  p.ctx.__tcfapi = (cmd, v, cb) => { if (cmd === 'addEventListener') tcf = cb; };
  const queued = fc.callbackQueue.slice();
  fc.callbackQueue = { push: (x) => (typeof x === 'function' ? x() : x.CONSENT_API_READY && x.CONSENT_API_READY()) };
  queued.forEach((x) => fc.callbackQueue.push(x));
  assert.strictEqual(revocations, 1);
  tcf(TC_YES, true);
  assert.strictEqual(p.saved(), null, 'Google decided: own choice deleted');
  assert.strictEqual(p.flag(), true); assert.strictEqual(p.gtm().length, 0, 'GA stays off on pages without ads');
  assert.strictEqual(p.updates[p.updates.length - 1].analytics_storage, 'denied');
  assert.strictEqual(p.updates[p.updates.length - 1].ad_storage, 'granted');
  // "Privacy settings" still opens the window there; its Google button calls the loaded CMP, the script is not loaded again
  p.privacyBtn.fire('click');
  assert.strictEqual(p.shown(), true);
  p.box().querySelector('[data-sb-google]').fire('click');
  assert.strictEqual(revocations, 2);
  assert.strictEqual(p.scripts.filter((x) => /fundingchoices/.test(x.src)).length, 1);
  assert.ok(!p.scripts.some((x) => /adsbygoogle/.test(x.src)));
});
test('pages with ads: Google button hidden in the automatic window, shown when opened via "Privacy settings"; it calls the loaded CMP', () => {
  const p = page({ cmp: 'hidden' });
  p.tcf(TC_HIDDEN); p.advance(3000);
  assert.strictEqual(p.box().querySelector('[data-sb-more]').hidden, true);
  p.closeX();
  p.privacyBtn.fire('click');
  assert.strictEqual(p.box().querySelector('[data-sb-more]').hidden, false);
  p.box().querySelector('[data-sb-google]').fire('click');
  assert.strictEqual(p.ctx.__revocation, 1);
  assert.ok(!p.scripts.some((x) => /fundingchoices/.test(x.src)), 'ad pages load no extra consent script');
  for (const u of p.updates) for (const k of ['ad_storage', 'ad_user_data', 'ad_personalization']) assert.ok(!(k in u) || u[k] === 'denied', 'never grants ' + k);
});
test('Escape on the page closes the open window (E3), focus goes to main when it was inside (E4), no automatic reopening (E5)', () => {
  const p = page({ cmp: 'none' });
  p.advance(3000);
  assert.strictEqual(p.docListeners(), 1);
  p.docEsc({ defaultPrevented: true });   // something else handled Escape
  assert.strictEqual(p.shown(), true);
  p.docEsc();
  assert.strictEqual(p.shown(), false); assert.strictEqual(p.docListeners(), 0); assert.strictEqual(p.saved(), null);
  // focus inside the automatic window, then ×: focus continues in main
  const q = page({ cmp: 'none' });
  q.advance(3000);
  q.box().querySelector('choice:granted').focus();
  q.closeX();
  assert.strictEqual(q.main.focused, 1); assert.strictEqual(q.main.attrs.tabindex, '-1');
  q.advance(10000);
  assert.strictEqual(q.shown(), false);
});
test('"Privacy settings" while the window decides opens the window, not the hidden CMP', () => {
  const p = page({ cmp: 'hidden' });
  p.tcf(TC_HIDDEN); p.advance(3000); p.closeX();
  p.privacyBtn.fire('click');
  assert.strictEqual(p.shown(), true); assert.strictEqual(p.ctx.__revocation, undefined);
});

test('"Privacy settings" in the first 3 s with a silent CMP: the window opens at once with focus, no later pop-up', () => {
  const p = page({ cmp: 'hidden' });
  p.tcf(TC_HIDDEN);
  p.advance(500);
  p.privacyBtn.fire('click');
  assert.strictEqual(p.shown(), true);
  assert.strictEqual(p.box().querySelector('#statbox-h').focused, 1);
  assert.strictEqual(p.ctx.__revocation, undefined, 'the hidden CMP is not used');
  p.closeX();
  p.advance(5000);
  assert.strictEqual(p.shown(), false, 'the cancelled timer does not reopen it');
  assert.strictEqual(p.saved(), null);
  // CMP has already spoken: Google's dialog, not the window
  const q = page({ cmp: 'live' });
  q.tcf(TC_YES, GRANT);
  q.privacyBtn.fire('click');
  assert.strictEqual(q.shown(), false); assert.strictEqual(q.ctx.__revocation, 1);
});
test('U.S. opt-out while the window is open: it becomes a plain notice and "allow" is refused', () => {
  const p = page({ cmp: 'hidden' });
  p.tcf(TC_HIDDEN); p.advance(3000);
  assert.strictEqual(p.box().querySelector('[data-sb-pick]').hidden, false);
  p.gpp({ signalStatus: 'ready', parsedSections: { usnat: [{ SaleOptOut: 1 }] } });
  assert.strictEqual(p.box().querySelector('[data-sb-pick]').hidden, true);
  assert.strictEqual(p.box().querySelector('[data-sb-info]').hidden, false);
  assert.match(p.box().querySelector('[data-sb-text]').textContent, /opted out under a U\.S\. state privacy law/);
  p.pick('granted'); // a stale click on the hidden button
  assert.strictEqual(p.saved(), null); assert.strictEqual(p.flag(), true); assert.strictEqual(p.gtm().length, 0);
  p.advance(100);
  assert.match(p.live().textContent, /stay off/);
  // GPC on a page without ads: "allow" is refused there too
  const q = page({ scope: 'settings', gpc: true });
  q.privacyBtn.fire('click'); q.pick('granted');
  assert.strictEqual(q.saved(), null);
});

/* ---------- static guarantees ---------- */
test('garden export/import never touch the statistics key; no gtag events', () => {
  const play = fs.readFileSync(path.join(__dirname, '..', 'src/js/play.js'), 'utf8');
  assert.ok(!/dlg-stats/.test(play));
  assert.ok(!C.STATS_KEY.startsWith('dlg:'), 'outside the dlg: namespace of puzzle data');
  const tools = play.slice(play.indexOf('function bindGardenTools'), play.indexOf('function renderToday'));
  assert.ok(/JSON\.stringify\(garden\(\)/.test(tools), 'export writes only the cleaned garden');
  assert.deepStrictEqual([...tools.matchAll(/store\.set\(([^,]+),/g)].map((m) => m[1]), ['GARDEN_KEY'], 'import writes only the garden key');
  for (const f of fs.readdirSync(path.join(__dirname, '..', 'src/js'))) {
    assert.ok(!/gtag\(\s*['"]event['"]/.test(fs.readFileSync(path.join(__dirname, '..', 'src/js', f), 'utf8')), 'no unguarded gtag event in ' + f);
  }
});
test('built pages: ad pages carry data-stats="page", pages without ads "settings"; CSS hides the window in print', () => {
  const docs = path.join(__dirname, '..', 'docs');
  const read = (f) => fs.readFileSync(path.join(docs, f), 'utf8');
  for (const f of ['index.html', 'flower-beds/index.html', 'guides/index.html', 'about/index.html']) assert.match(read(f), /data-stats="page"/, f);
  for (const f of ['imprint/index.html', 'privacy/index.html', 'contact/index.html', 'garden/index.html', '404.html']) {
    const h = read(f);
    assert.match(h, /data-stats="settings"/, f);
    assert.ok(!h.includes('data-ads-loader'), 'no ad loader on ' + f);
    assert.ok(h.includes('data-privacy-settings'), 'Privacy settings on ' + f);
  }
  const css = read('assets/css/site.css');
  assert.match(css, /@media print\{\.statbox,\.statbox-live\{display:none!important\}body\.statbox-open\{padding-bottom:0!important\}\}/);
  assert.match(css, /\.statbox\{position:fixed;right:16px;bottom:16px/);
  assert.match(css, /\.statbox-btn\{min-height:44px/);
  assert.match(css, /\.statbox-x\{[^}]*width:44px;height:44px/);
  const privacy = read('privacy/index.html');
  assert.match(privacy, /<h2 id="statistics-window">Interim statistics window<\/h2>/);
  assert.match(privacy, /href="#statistics-window"/);
  assert.match(privacy, /Last updated: November 5, 2026/);
  assert.match(privacy, /<code>dlg-stats<\/code>/);
});
