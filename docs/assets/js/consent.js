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

  /**
   * "Privacy settings": if the CMP says a U.S. state regulation applies (initial status is not
   * DOES_NOT_APPLY), open Google's U.S. opt-out dialog and report done(userDidOptOut); otherwise
   * show the GDPR revocation message. Returns 'us' | 'revocation' | 'none'. Never throws.
   * The U.S. dialog opens only for a known status NOT_OPTED_OUT (2) or OPTED_OUT (3) (enum values if present)
   * and only when the latest TCF data (tc) does not say gdprApplies === true; UNKNOWN (0) or an EU visitor
   * gets the revocation message so consent can always be withdrawn.
   */
  function privacyChoice(fc, done, tc) {
    try {
      var u = fc && fc.usstatesoptout;
      if (u && typeof u.getInitialUsStatesOptOutStatus === 'function') {
        var en = u.InitialUsStatesOptOutStatusEnum;
        var notOptedOut = en && typeof en.NOT_OPTED_OUT === 'number' ? en.NOT_OPTED_OUT : US_NOT_OPTED_OUT;
        var optedOut = en && typeof en.OPTED_OUT === 'number' ? en.OPTED_OUT : 3;
        var gdpr = !!(tc && typeof tc === 'object' && tc.gdprApplies === true);
        var status = u.getInitialUsStatesOptOutStatus();
        if ((status === notOptedOut || status === optedOut) && !gdpr && typeof u.openConfirmationDialog === 'function') {
          u.openConfirmationDialog(function (optedOut) { try { if (done) done(!!optedOut); } catch (e) { /* ignore */ } });
          return 'us';
        }
      }
    } catch (e) { /* use the revocation message */ }
    try {
      if (fc && typeof fc.showRevocationMessage === 'function') { fc.showRevocationMessage(); return 'revocation'; }
    } catch (e) { /* not available */ }
    return 'none';
  }

  /**
   * Current U.S. opt-out state from the IAB GPP signal (pingData from __gpp('addEventListener')):
   * 3 = opted out (sale / sharing / targeted advertising opt-out = 1, or GPC), 2 = not opted out,
   * null = no U.S. section (consent stays denied).
   */
  function usFromGpp(ping) {
    if (!ping || typeof ping !== 'object' || ping.signalStatus === 'not ready' || !ping.parsedSections || typeof ping.parsedSections !== 'object') return null;
    var known = false, out = false;
    Object.keys(ping.parsedSections).forEach(function (k) {
      if (k.slice(0, 2) !== 'us') return;
      var v = ping.parsedSections[k];
      (Object.prototype.toString.call(v) === '[object Array]' ? v : [v]).forEach(function (seg) {
        if (!seg || typeof seg !== 'object') return;
        ['SaleOptOut', 'SharingOptOut', 'TargetedAdvertisingOptOut'].forEach(function (f) {
          if (seg[f] === 1) out = true; else if (seg[f] === 0 || seg[f] === 2) known = true;
        });
        if (seg.Gpc === true) out = true;
      });
    });
    return out ? 3 : (known ? US_NOT_OPTED_OUT : null);
  }
  /** Status for decide(): "law does not apply" from the CMP, otherwise only the current GPP value. */
  function usNow(initial, gpp) {
    if (initial === US_LAW_NOT_APPLICABLE) return US_LAW_NOT_APPLICABLE;
    return gpp === US_NOT_OPTED_OUT || gpp === 3 ? gpp : null;
  }

  /** No Google scripts on local previews and tests: localhost, 127.0.0.1, ::1, file: or ?stats_test=1. */
  function localOrTest(hostname, protocol, search) {
    if (protocol === 'file:' || /[?&]stats_test=1(&|$)/.test(String(search || ''))) return true;
    var h = String(hostname || '').toLowerCase();
    return h === 'localhost' || h === '127.0.0.1' || h === '::1' || h === '[::1]';
  }

  var api = { region: region, decide: decide, allDenied: allDenied, privacyChoice: privacyChoice, usFromGpp: usFromGpp, usNow: usNow, localOrTest: localOrTest, US_OPTED_OUT: 3 };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.DLGConsent = api;
})(this);
