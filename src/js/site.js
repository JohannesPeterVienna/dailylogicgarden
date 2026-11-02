/*
 * Daily Logic Garden – page runtime: ad slots, consent-gated Google Analytics and the
 * "Privacy settings" button that reopens Google's consent message.
 * Ad slot IDs stay empty until AdSense units exist; an empty ID renders nothing and reserves no space.
 */
(function () {
  'use strict';
  var CLIENT = 'ca-pub-7811071715414905';
  var SLOTS = {
    afterplay: '', // below the first explanation on puzzle pages, never next to the board
    lede: '',      // guides: after the introduction
    mid: '',       // guides: in the middle of the article
    side: ''       // guides: sidebar from 1200 px, not sticky
  };
  var GA_ID = 'G-T00HRG2YVF';
  var html = document.documentElement;
  var adsAllowed = html.getAttribute('data-ads') === 'yes';

  function adScript() {
    if (document.querySelector('script[src*="adsbygoogle.js"]')) return;
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
  var seen = { tc: null, cmReady: false, us: null, sent: '' }, gaOn = false;
  function startAnalytics() {
    if (gaOn) return;
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
    var d = C.decide(seen.tc, cm, seen.us);
    var analytics = d.analytics_storage === 'granted';
    window['ga-disable-' + GA_ID] = !analytics;
    var sig = JSON.stringify(d);
    if (sig !== seen.sent) { seen.sent = sig; gtag('consent', 'update', d); }
    if (analytics) startAnalytics();
  }
  function listen() {
    window.googlefc = window.googlefc || {};
    window.googlefc.callbackQueue = window.googlefc.callbackQueue || [];
    window.googlefc.callbackQueue.push({
      CONSENT_API_READY: function () {
        if (typeof window.__tcfapi !== 'function') return;
        window.__tcfapi('addEventListener', 2, function (tc, ok) {
          seen.tc = ok ? tc : null;
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
        update();
      }
    });
    update();
  }
  function privacyButtons() {
    Array.prototype.forEach.call(document.querySelectorAll('[data-privacy-settings]'), function (b) {
      b.addEventListener('click', function () {
        // treat it as a withdrawal right away; the CMP reports the new choice through the listeners
        seen.tc = null; seen.cmReady = false; update();
        window.googlefc = window.googlefc || {};
        window.googlefc.callbackQueue = window.googlefc.callbackQueue || [];
        window.googlefc.callbackQueue.push(function () {
          try { window.googlefc.showRevocationMessage(); } catch (e) { /* consent message not available here */ }
        });
        adScript();
      });
    });
  }

  privacyButtons();
  if (adsAllowed) fillSlots();
  listen();
})();
