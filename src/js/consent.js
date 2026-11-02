/*
 * Daily Logic Garden – consent decision, kept as a pure function so it can be unit-tested.
 * Input comes from Google's certified CMP (Privacy & messaging):
 *   tc  – the IAB TCF v2 data from __tcfapi('addEventListener')
 *   cm  – googlefc.getGoogleConsentModeValues()  (1 = granted, 2 = denied, 3 = not applicable)
 *   us  – googlefc.usstatesoptout.getInitialUsStatesOptOutStatus() (1 = law does not apply, 2 = not opted out)
 * Rules: when GDPR applies (or it is unknown) a purpose is granted only if the TCF data is loaded,
 * purpose 1 and Google (vendor 755) have consent and the CMP reports that purpose as granted.
 * When GDPR is reported as not applying, a purpose is granted if the CMP says granted or not
 * applicable AND the U.S. state status says the law does not apply or the user has not opted out.
 * Everything else – missing data, errors, denials – stays denied.
 */
(function (root) {
  'use strict';
  var CM_GRANTED = 1, CM_NOT_APPLICABLE = 3, US_LAW_NOT_APPLICABLE = 1, US_NOT_OPTED_OUT = 2, GOOGLE_VENDOR = 755;
  var PURPOSES = {
    ad_storage: 'adStoragePurposeConsentStatus',
    ad_user_data: 'adUserDataPurposeConsentStatus',
    ad_personalization: 'adPersonalizationPurposeConsentStatus',
    analytics_storage: 'analyticsStoragePurposeConsentStatus'
  };
  function allDenied() { return { ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied', analytics_storage: 'denied' }; }

  // 'gdpr-ok' (TCF consent present), 'outside' (GDPR does not apply) or 'none'
  function region(tc) {
    if (!tc || typeof tc !== 'object') return 'none';
    if (tc.gdprApplies === false) return 'outside';
    var ready = tc.eventStatus === 'tcloaded' || tc.eventStatus === 'useractioncomplete';
    var storage = !!(tc.purpose && tc.purpose.consents && tc.purpose.consents[1] === true);
    var google = !!(tc.vendor && tc.vendor.consents && tc.vendor.consents[GOOGLE_VENDOR] === true);
    return ready && storage && google ? 'gdpr-ok' : 'none';
  }

  function decide(tc, cm, us) {
    var where = region(tc), out = allDenied();
    if (where === 'none' || !cm || typeof cm !== 'object') return out;
    if (where === 'outside' && us !== US_LAW_NOT_APPLICABLE && us !== US_NOT_OPTED_OUT) return out;
    Object.keys(PURPOSES).forEach(function (p) {
      var v = cm[PURPOSES[p]];
      var ok = where === 'gdpr-ok' ? v === CM_GRANTED : (v === CM_GRANTED || v === CM_NOT_APPLICABLE);
      out[p] = ok ? 'granted' : 'denied';
    });
    return out;
  }

  var api = { region: region, decide: decide, allDenied: allDenied };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.DLGConsent = api;
})(this);
