'use strict';
const test = require('node:test');
const assert = require('node:assert');
const C = require('../src/js/consent.js');

const GRANT = { adStoragePurposeConsentStatus: 1, adUserDataPurposeConsentStatus: 1, adPersonalizationPurposeConsentStatus: 1, analyticsStoragePurposeConsentStatus: 1 };
const tcOk = (extra = {}) => Object.assign({ gdprApplies: true, eventStatus: 'useractioncomplete', purpose: { consents: { 1: true } }, vendor: { consents: { 755: true } } }, extra);
const denied = C.allDenied();

test('nothing known: everything denied', () => {
  assert.deepStrictEqual(C.decide(null, null, null), denied);
  assert.deepStrictEqual(C.decide(undefined, GRANT, 2), denied);
  assert.deepStrictEqual(C.decide(tcOk(), null, null), denied);
});
test('GDPR: granted only with TCF loaded, purpose 1, Google vendor and CM granted', () => {
  const d = C.decide(tcOk(), GRANT, null);
  assert.deepStrictEqual(d, { ad_storage: 'granted', ad_user_data: 'granted', ad_personalization: 'granted', analytics_storage: 'granted' });
  assert.deepStrictEqual(C.decide(tcOk({ eventStatus: 'cmpuishown' }), GRANT, null), denied);
  assert.deepStrictEqual(C.decide(tcOk({ purpose: { consents: { 1: false } } }), GRANT, null), denied);
  assert.deepStrictEqual(C.decide(tcOk({ vendor: { consents: {} } }), GRANT, null), denied);
  assert.strictEqual(C.decide(tcOk({ eventStatus: 'tcloaded' }), GRANT, null).analytics_storage, 'granted');
});
test('GDPR: "not applicable" is not consent', () => {
  const cm = Object.assign({}, GRANT, { analyticsStoragePurposeConsentStatus: 3 });
  assert.strictEqual(C.decide(tcOk(), cm, null).analytics_storage, 'denied');
  assert.strictEqual(C.decide(tcOk(), Object.assign({}, GRANT, { analyticsStoragePurposeConsentStatus: 2 }), null).analytics_storage, 'denied');
});
test('gdprApplies unknown is treated like GDPR', () => {
  const tc = tcOk(); delete tc.gdprApplies;
  assert.strictEqual(C.decide(tc, GRANT, null).ad_storage, 'granted');
  const tc2 = tcOk({ purpose: null }); delete tc2.gdprApplies;
  assert.deepStrictEqual(C.decide(tc2, GRANT, 1), denied);
});
test('outside GDPR: needs CM granted/not applicable and US status 1 or 2', () => {
  const tc = { gdprApplies: false };
  const cm = { adStoragePurposeConsentStatus: 3, adUserDataPurposeConsentStatus: 1, adPersonalizationPurposeConsentStatus: 2, analyticsStoragePurposeConsentStatus: 3 };
  assert.deepStrictEqual(C.decide(tc, cm, 1), { ad_storage: 'granted', ad_user_data: 'granted', ad_personalization: 'denied', analytics_storage: 'granted' });
  assert.strictEqual(C.decide(tc, cm, 2).analytics_storage, 'granted');
  assert.deepStrictEqual(C.decide(tc, cm, 3), denied); // opted out
  assert.deepStrictEqual(C.decide(tc, cm, null), denied); // unknown
  assert.deepStrictEqual(C.decide(tc, null, 1), denied);
});

/* ---------- "Privacy settings": U.S. opt-out dialog vs. revocation message (stubbed googlefc) ---------- */
function stubFc({ status, withEnum = true, optOut = false, throwOn } = {}) {
  const calls = [];
  const fc = { showRevocationMessage() { calls.push('revocation'); if (throwOn === 'revocation') throw new Error('x'); } };
  if (status !== undefined) {
    fc.usstatesoptout = {
      getInitialUsStatesOptOutStatus() { if (throwOn === 'status') throw new Error('x'); return status; },
      openConfirmationDialog(cb) { calls.push('us'); cb(optOut); }
    };
    if (withEnum) fc.usstatesoptout.InitialUsStatesOptOutStatusEnum = { UNKNOWN: 0, DOES_NOT_APPLY: 1, NOT_OPTED_OUT: 2, OPTED_OUT: 3 };
  }
  return { fc, calls };
}
test('privacy settings: U.S. law applies -> opt-out dialog and callback', () => {
  for (const st of [2, 3]) {
    const { fc, calls } = stubFc({ status: st, optOut: true });
    let got = null;
    assert.strictEqual(C.privacyChoice(fc, (o) => { got = o; }), 'us');
    assert.deepStrictEqual(calls, ['us']); assert.strictEqual(got, true);
  }
  const { fc } = stubFc({ status: 2, withEnum: false, optOut: false });
  let got = null;
  assert.strictEqual(C.privacyChoice(fc, (o) => { got = o; }), 'us');
  assert.strictEqual(got, false);
  assert.deepStrictEqual(C.decide({ gdprApplies: false }, GRANT, C.US_OPTED_OUT), denied);
});
test('privacy settings: DOES_NOT_APPLY / no U.S. API / errors -> revocation message, never throws', () => {
  for (const opt of [{ status: 1 }, { status: 1, withEnum: false }, {}, { status: 2, throwOn: 'status' }]) {
    const { fc, calls } = stubFc(opt);
    assert.strictEqual(C.privacyChoice(fc, () => {}), 'revocation');
    assert.deepStrictEqual(calls, ['revocation']);
  }
  // enum values from the CMP win over the defaults 2/3
  const { fc, calls } = stubFc({ status: 5 });
  fc.usstatesoptout.InitialUsStatesOptOutStatusEnum = { NOT_OPTED_OUT: 5, OPTED_OUT: 6 };
  assert.strictEqual(C.privacyChoice(fc, () => {}), 'us');
  assert.deepStrictEqual(calls, ['us']);
  const other = stubFc({ status: 2 });
  other.fc.usstatesoptout.InitialUsStatesOptOutStatusEnum = { NOT_OPTED_OUT: 5, OPTED_OUT: 6 };
  assert.strictEqual(C.privacyChoice(other.fc, () => {}), 'revocation');
  assert.strictEqual(C.privacyChoice(undefined), 'none');
  assert.strictEqual(C.privacyChoice(stubFc({ throwOn: 'revocation' }).fc), 'none');
});
test('privacy settings: EU + status 0 (UNKNOWN) -> revocation message, so consent can be withdrawn', () => {
  for (const withEnum of [true, false]) {
    const { fc, calls } = stubFc({ status: 0, withEnum });
    assert.strictEqual(C.privacyChoice(fc, () => {}, { gdprApplies: true, eventStatus: 'tcloaded' }), 'revocation');
    assert.deepStrictEqual(calls, ['revocation']);
  }
  // UNKNOWN without TCF data or outside the GDPR: also the revocation message, never the U.S. dialog
  for (const tc of [undefined, null, { gdprApplies: false }]) {
    const { fc, calls } = stubFc({ status: 0 });
    assert.strictEqual(C.privacyChoice(fc, () => {}, tc), 'revocation');
    assert.deepStrictEqual(calls, ['revocation']);
  }
});
test('privacy settings: U.S. status 2 -> U.S. dialog; the same status with gdprApplies -> revocation message', () => {
  for (const tc of [undefined, { gdprApplies: false, eventStatus: 'tcloaded' }]) {
    const { fc, calls } = stubFc({ status: 2 });
    assert.strictEqual(C.privacyChoice(fc, () => {}, tc), 'us');
    assert.deepStrictEqual(calls, ['us']);
  }
  const { fc, calls } = stubFc({ status: 2 });
  assert.strictEqual(C.privacyChoice(fc, () => {}, { gdprApplies: true }), 'revocation');
  assert.deepStrictEqual(calls, ['revocation']);
});
test('GPP: current U.S. opt-out state; without GPP a U.S. visitor stays denied', () => {
  assert.strictEqual(C.usFromGpp({ signalStatus: 'ready', parsedSections: { usnat: [{ SaleOptOut: 2, SharingOptOut: 2, TargetedAdvertisingOptOut: 2 }, { Gpc: false }] } }), 2);
  assert.strictEqual(C.usFromGpp({ parsedSections: { usnat: [{ SaleOptOut: 2, TargetedAdvertisingOptOut: 1 }] } }), 3);
  assert.strictEqual(C.usFromGpp({ parsedSections: { usva: { SaleOptOut: 1 } } }), 3);
  assert.strictEqual(C.usFromGpp({ parsedSections: { usnat: [{ SaleOptOut: 2 }, { Gpc: true }] } }), 3);
  assert.strictEqual(C.usFromGpp({ parsedSections: { tcfeuv2: {} } }), null);
  assert.strictEqual(C.usFromGpp({ signalStatus: 'not ready', parsedSections: { usnat: { SaleOptOut: 2 } } }), null);
  assert.strictEqual(C.usNow(1, null), 1);
  assert.strictEqual(C.usNow(2, null), null);
  assert.deepStrictEqual(C.decide({ gdprApplies: false }, GRANT, C.usNow(2, null)), denied);
  assert.strictEqual(C.decide({ gdprApplies: false }, GRANT, C.usNow(2, 2)).analytics_storage, 'granted');
  assert.deepStrictEqual(C.decide({ gdprApplies: false }, GRANT, C.usNow(2, 3)), denied);
});

/* ---------- local/test guard ---------- */
test('localOrTest: localhost, 127.0.0.1, ::1, file: and ?stats_test=1', () => {
  for (const [h, p] of [['localhost', 'http:'], ['127.0.0.1', 'http:'], ['::1', 'http:'], ['[::1]', 'http:'], ['', 'file:']]) assert.strictEqual(C.localOrTest(h, p, ''), true);
  assert.strictEqual(C.localOrTest('dailylogicgarden.com', 'https:', '?stats_test=1'), true);
  assert.strictEqual(C.localOrTest('dailylogicgarden.com', 'https:', '?stats_test=10'), false);
  assert.strictEqual(C.localOrTest('dailylogicgarden.com', 'https:', ''), false);
});
test('head guard + inline loader: AdSense tag only in production without stats_test', () => {
  const fs = require('node:fs'); const path = require('node:path'); const vm = require('node:vm');
  const html = fs.readFileSync(path.join(__dirname, '..', 'docs', 'index.html'), 'utf8');
  const guard = html.match(/<script>(window\.DLG_NO_GOOGLE=[\s\S]*?)<\/script>/)[1];
  const loader = html.match(/<script data-ads-loader>([\s\S]*?)<\/script>/)[1];
  const run = (hostname, protocol, search = '', store = {}) => {
    const added = [];
    const ctx = { document: { createElement: () => ({}), head: { appendChild: (s) => added.push(s) } }, location: { hostname, protocol, search },
      sessionStorage: { setItem: (k, v) => { store[k] = v; }, getItem: (k) => (k in store ? store[k] : null) } };
    vm.createContext(ctx);
    vm.runInContext('var window=this;' + guard + ';' + loader, ctx);
    return added;
  };
  const prod = run('dailylogicgarden.com', 'https:');
  assert.strictEqual(prod.length, 1);
  assert.strictEqual(prod[0].src, 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-7811071715414905');
  assert.strictEqual(prod[0].async, true); assert.strictEqual(prod[0].crossOrigin, 'anonymous');
  for (const [h, p] of [['localhost', 'http:'], ['127.0.0.1', 'http:'], ['[::1]', 'http:'], ['', 'file:']]) assert.strictEqual(run(h, p).length, 0);
  const store = {};
  assert.strictEqual(run('dailylogicgarden.com', 'https:', '?stats_test=1', store).length, 0);
  assert.strictEqual(run('dailylogicgarden.com', 'https:', '', store).length, 0);
});
