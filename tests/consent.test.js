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
