/*
 * Daily Logic Garden – page runtime: ad slots, consent-gated Google Analytics and the
 * "Privacy settings" button that reopens Google's consent message.
 * Ad slot IDs stay empty until AdSense units exist; an empty ID renders nothing and reserves no space.
 */
(function () {
  'use strict';
  var CLIENT = 'ca-pub-7811071715414905';
  var SLOTS = {
    // Shared responsive AdSense units “Themen-Websites – …” (account pub-7811071715414905)
    afterplay: '7497607759', // below the first explanation on puzzle pages, never next to the board
    lede: '7497607759',      // guides: after the introduction
    mid: '1292301217',       // guides: in the middle of the article
    side: '1292301217'       // guides: sidebar from 1200 px, not sticky
  };
  var GA_ID = 'G-T00HRG2YVF';
  var html = document.documentElement;
  var adsAllowed = html.getAttribute('data-ads') === 'yes';

  // window.DLG_NO_GOOGLE comes from the first inline script in <head> (local preview/test or ?stats_test=1)
  var NO_GOOGLE = (function () {
    if (window.DLG_NO_GOOGLE) return true;
    try { return window.DLGConsent ? window.DLGConsent.localOrTest(location.hostname, location.protocol, location.search) : true; } catch (e) { return true; }
  })();

  function adScript() {
    if (NO_GOOGLE || document.querySelector('script[src*="adsbygoogle.js"]')) return;
    var s = document.createElement('script');
    s.async = true; s.crossOrigin = 'anonymous';
    s.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=' + CLIENT;
    document.head.appendChild(s);
  }
  function fillSlots() {
    if (!adsAllowed) return;
    var wide = window.matchMedia('(min-width: 1200px)').matches;
    Array.prototype.forEach.call(document.querySelectorAll('.ad[data-slot]'), function (box) {
      var name = box.getAttribute('data-slot'), id = SLOTS[name];
      if (!id || (name === 'side' && !wide)) return;
      var ins = document.createElement('ins');
      ins.className = 'adsbygoogle';
      ins.style.display = 'block';
      ins.setAttribute('data-ad-client', CLIENT);
      ins.setAttribute('data-ad-slot', id);
      if (name !== 'side') { ins.setAttribute('data-ad-format', 'auto'); ins.setAttribute('data-full-width-responsive', 'true'); }
      box.appendChild(ins);
      box.hidden = false;
      try { (window.adsbygoogle = window.adsbygoogle || []).push({}); } catch (e) { box.hidden = true; }
    });
  }

  var gtag = window.gtag || function () { (window.dataLayer = window.dataLayer || []).push(arguments); };
  var seen = { tc: null, cmReady: false, us: null, gpp: null, gppOn: false, sent: '' }, gaOn = false;
  var lastTc = null; // latest TCF data, kept across the click-time withdrawal
  function startAnalytics() {
    if (gaOn || NO_GOOGLE) return;
    gaOn = true;
    var s = document.createElement('script');
    s.async = true; s.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_ID;
    document.head.appendChild(s);
    gtag('js', new Date());
    gtag('config', GA_ID);
  }
  function cmValues() {
    try {
      var fc = window.googlefc;
      return fc && typeof fc.getGoogleConsentModeValues === 'function' ? fc.getGoogleConsentModeValues() || null : null;
    } catch (e) { return null; }
  }
  function update() {
    var C = window.DLGConsent;
    if (!C) return;
    var cm = seen.cmReady && C.region(seen.tc) !== 'none' ? cmValues() : null;
    var d = C.decide(seen.tc, cm, C.usNow(seen.us, seen.gpp));
    var analytics = d.analytics_storage === 'granted';
    window['ga-disable-' + GA_ID] = !analytics;
    var sig = JSON.stringify(d);
    if (sig !== seen.sent) { seen.sent = sig; gtag('consent', 'update', d); }
    if (analytics) startAnalytics();
  }
  // the current U.S. opt-out state, including later changes, comes from the GPP signal
  function listenGpp() {
    if (seen.gppOn || typeof window.__gpp !== 'function') return;
    seen.gppOn = true;
    try {
      window.__gpp('addEventListener', function (evt, ok) {
        if (!ok || !evt) return;
        var ping = evt.pingData || (evt.data && evt.data.pingData) || null;
        if (ping && window.DLGConsent) { seen.gpp = window.DLGConsent.usFromGpp(ping); update(); }
      });
    } catch (e) { seen.gppOn = false; seen.gpp = null; }
  }
  function listen() {
    window.googlefc = window.googlefc || {};
    window.googlefc.callbackQueue = window.googlefc.callbackQueue || [];
    window.googlefc.callbackQueue.push({
      CONSENT_API_READY: function () {
        listenGpp();
        if (typeof window.__tcfapi !== 'function') return;
        window.__tcfapi('addEventListener', 2, function (tc, ok) {
          seen.tc = ok ? tc : null;
          if (ok && tc) lastTc = tc;
          if (ok && tc && tc.eventStatus === 'useractioncomplete' && typeof window.googlefc.getGoogleConsentModeValues === 'function') seen.cmReady = true;
          update();
        });
      },
      CONSENT_MODE_DATA_READY: function () { seen.cmReady = true; update(); },
      INITIAL_US_STATES_OPT_OUT_DATA_READY: function () {
        try {
          var u = window.googlefc.usstatesoptout;
          seen.us = u && typeof u.getInitialUsStatesOptOutStatus === 'function' ? u.getInitialUsStatesOptOutStatus() : null;
        } catch (e) { seen.us = null; }
        listenGpp();
        update();
      }
    });
    update();
  }
  function privacyButtons() {
    Array.prototype.forEach.call(document.querySelectorAll('[data-privacy-settings]'), function (b) {
      b.addEventListener('click', function () {
        // treat it as a withdrawal right away; the CMP reports the new choice through the listeners
        var before = { tc: seen.tc, cmReady: seen.cmReady };
        seen.tc = null; seen.cmReady = false; update();
        window.googlefc = window.googlefc || {};
        window.googlefc.callbackQueue = window.googlefc.callbackQueue || [];
        window.googlefc.callbackQueue.push(function () {
          try {
            // U.S. state law applies -> Google's U.S. opt-out dialog, otherwise the GDPR revocation message
            window.DLGConsent.privacyChoice(window.googlefc, function (optedOut) {
              try {
                if (optedOut) seen.gpp = window.DLGConsent.US_OPTED_OUT; // ad personalization + analytics stay denied
                else { seen.tc = before.tc; seen.cmReady = before.cmReady; }
                listenGpp();
              } catch (e) { seen.gpp = null; }
              update();
            }, lastTc || before.tc);   // latest TCF data: GDPR applies -> revocation message
          } catch (e) { /* consent message not available here */ }
        });
        adScript();
      });
    });
  }

  privacyButtons();
  if (adsAllowed) fillSlots();
  listen();
})();
