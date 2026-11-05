/*
 * Daily Logic Garden – page runtime: ad slots, consent-gated Google Analytics, the "Privacy settings"
 * button that reopens Google's consent message, and the interim statistics window (since 5 Nov 2026).
 *
 * Interim statistics window: Google's consent message (TCF 2.2) is published but currently reports
 * displayStatus "hidden", so no decision arrives and analytics never starts. About 3 s after start, if
 * Google's CMP has not taken over – no __tcfapi, no "useractioncomplete", no "tcloaded" with a TC string,
 * no message really on screen ("cmpuishown" with displayStatus hidden/disabled does not count) and no
 * gdprApplies === false – a small window asks about Google Analytics only (Allow / Decline, equal weight).
 * It only ever sets analytics_storage; ad_storage, ad_user_data and ad_personalization stay "denied".
 * Its choice is kept in localStorage "dlg-stats" ({v, choice, at}) for 12 months. As soon as Google's CMP
 * takes over (also later in the page view) only Google's logic counts: the window closes, and on a
 * decision or gdprApplies === false the stored window choice is deleted. If Google refuses statistics,
 * the _ga/_ga_* cookies are deleted. Global Privacy Control or a U.S. opt-out: no window, no analytics.
 * Pages without ads (data-stats="settings": imprint, privacy, contact, garden, 404) never load Google
 * code; there "Privacy settings" opens the window so a choice made in it can be changed or withdrawn.
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
  var GA_ID = 'G-T00HRG2YVF', OFF = 'ga-disable-' + GA_ID;
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
  // gtag.js is inserted once per page view; Google signals and ad personalization signals are off.
  // (The site sends no GA events; any future event must first check window[OFF] === false.)
  function startAnalytics() {
    if (gaOn || NO_GOOGLE) return;
    gaOn = true;
    if (document.querySelector('script[src*="googletagmanager.com/gtag/js"]')) return;
    var s = document.createElement('script');
    s.async = true; s.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_ID;
    document.head.appendChild(s);
    gtag('js', new Date());
    gtag('config', GA_ID, { allow_google_signals: false, allow_ad_personalization_signals: false });
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
    if ((stats.phase === 'waiting' || stats.phase === 'window') && C.cmpTakesOver(seen.tc)) handOver();
    if (stats.phase === 'window') { windowUpdate(); return; }
    var cm = seen.cmReady && C.region(seen.tc) !== 'none' ? cmValues() : null;
    var d = C.decide(seen.tc, cm, C.usNow(seen.us, seen.gpp));
    if (GPC) d.analytics_storage = 'denied';   // Global Privacy Control: no statistics
    var analytics = d.analytics_storage === 'granted';
    window[OFF] = !analytics;
    var sig = JSON.stringify(d);
    if (sig !== seen.sent) { seen.sent = sig; gtag('consent', 'update', d); }
    if (stats.phase === 'google' && (C.cmpDecided(seen.tc) || (seen.tc && seen.tc.gdprApplies === false))) forgetPick();
    if (analytics) { stats.erased = false; startAnalytics(); }
    else if (stats.phase === 'google' && !stats.erased && (GPC || C.cmpRefusesStats(seen.tc, cm) || (seen.tc && seen.tc.gdprApplies === false && usOut()))) {
      stats.erased = true; eraseGa();   // Google says no: no GA cookie may linger, even if the window was never used
    }
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
        // interim mode or a page without ads: our statistics window (view, change, withdraw)
        if (stats.phase === 'window' || stats.phase === 'settings') { openBox(b); return; }
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

  /* ---------- interim statistics window ---------- */
  var STATS_WAIT = 3000;
  var GPC = (function () { try { return navigator.globalPrivacyControl === true; } catch (e) { return false; } })();
  // phase: "waiting" (first ~3 s) | "window" (our window decides analytics) | "google" (Google's CMP decides)
  //        | "settings" (page without ads: never measures, the window only shows / changes the stored choice)
  var stats = { phase: html.getAttribute('data-stats') === 'page' ? 'waiting' : 'settings', pick: null, erased: false, forgot: false };
  function statsKey() { return window.DLGConsent ? window.DLGConsent.STATS_KEY : 'dlg-stats'; }
  function readPick() {
    try { return window.DLGConsent.readStats(window.localStorage.getItem(statsKey()), Date.now()); } catch (e) { return null; }
  }
  function forgetPick() {
    if (stats.forgot) return;
    stats.forgot = true;
    try { window.localStorage.removeItem(statsKey()); } catch (e) { /* storage blocked: nothing stored */ }
  }
  function usOut() {   // a U.S. opt-out (initial status OPTED_OUT, or the current GPP signal) means no analytics
    var C = window.DLGConsent;
    return seen.us === 3 || (!!C && C.usNow(seen.us, seen.gpp) === C.US_OPTED_OUT);
  }
  function eraseGa() {
    var C = window.DLGConsent, jar = '';
    if (!C) return;
    try { jar = String(document.cookie || ''); } catch (e) { return; }
    var names = C.gaCookieNames(jar), scopes = C.cookieScopes(location.hostname);
    names.forEach(function (n) {
      scopes.forEach(function (d) {
        try { document.cookie = n + '=; expires=Thu, 01 Jan 1970 00:00:00 GMT; max-age=0; path=/' + d; } catch (e) { /* ignore */ }
      });
    });
  }
  // only analytics_storage is ever touched here; ad_* keep their "denied" default
  function windowUpdate() {
    var on = !!stats.pick && stats.pick.choice === 'granted' && !GPC && !usOut();
    var was = seen.sent === 'window:on';
    window[OFF] = !on;
    var sig = on ? 'window:on' : 'window:off';
    if (sig !== seen.sent) { seen.sent = sig; gtag('consent', 'update', { analytics_storage: on ? 'granted' : 'denied' }); }
    if (on) { stats.erased = false; startAnalytics(); }
    else if (was || ((GPC || usOut()) && !stats.erased)) { stats.erased = true; eraseGa(); }   // switched off, or GPC / U.S. opt-out: no _ga may linger
  }
  function handOver() {
    stats.phase = 'google'; stats.pick = null;   // Google's consent management counts from now on
    closeBox(false);
  }
  function startStats() {
    var C = window.DLGConsent;
    if (stats.phase !== 'waiting' || !C) return;
    if (C.cmpTakesOver(seen.tc)) { update(); return; }
    stats.phase = 'window';
    stats.pick = readPick();
    if ((stats.pick && stats.pick.choice === 'denied') || GPC || usOut()) eraseGa();   // declined earlier, GPC or U.S. opt-out: no GA cookie may linger
    update();
    if (!stats.pick && !GPC && !usOut()) openBox(null);
  }
  function choose(choice) {
    var C = window.DLGConsent;
    if (!C || (stats.phase !== 'window' && stats.phase !== 'settings')) { closeBox(true); return; }
    var rec = C.statsRecord(choice, Date.now());
    try { window.localStorage.setItem(C.STATS_KEY, JSON.stringify(rec)); } catch (e) { /* storage blocked: the choice holds for this page view */ }
    stats.pick = rec;
    if (rec.choice === 'denied') {
      window[OFF] = true;
      if (seen.sent !== 'window:off') { seen.sent = 'window:off'; gtag('consent', 'update', { analytics_storage: 'denied' }); }
      eraseGa();
    }
    if (stats.phase === 'window') update();
    closeBox(true);
    say(rec.choice === 'granted' ? 'Saved: visitor statistics allowed.' : 'Saved: visitor statistics declined. Google Analytics stays off.');
  }

  var box = null, boxOpener = null, live = null;
  var X_ICON = '<svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true" focusable="false"><path d="M3.5 3.5l9 9M12.5 3.5l-9 9" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>';
  function say(text) {
    try {
      if (!live) { live = document.createElement('p'); live.className = 'statbox-live'; live.setAttribute('role', 'status'); live.setAttribute('aria-live', 'polite'); document.body.appendChild(live); }
      live.textContent = '';
      setTimeout(function () { live.textContent = text; }, 60);
    } catch (e) { /* no DOM */ }
  }
  function buildBox() {
    var el = document.createElement('section');
    el.id = 'dlg-statbox'; el.className = 'statbox';
    el.setAttribute('role', 'dialog'); el.setAttribute('aria-modal', 'false');
    el.setAttribute('aria-labelledby', 'statbox-h'); el.setAttribute('aria-describedby', 'statbox-p');
    el.hidden = true;
    el.innerHTML = '<p class="statbox-tag">Visitor statistics only</p>' +
      '<h2 class="statbox-h" id="statbox-h" tabindex="-1">Count this visit?</h2>' +
      '<p class="statbox-p" id="statbox-p" data-sb-text></p><p class="statbox-now" data-sb-now></p>' +
      '<div class="statbox-row" data-sb-pick><button type="button" class="statbox-btn" data-sb-choice="granted">Allow</button><button type="button" class="statbox-btn" data-sb-choice="denied">Decline</button></div>' +
      '<div class="statbox-row" data-sb-info hidden><button type="button" class="statbox-btn" data-sb-ok>Close</button></div>' +
      '<button type="button" class="statbox-x" data-sb-x aria-label="Close without choosing" title="Close without choosing">' + X_ICON + '</button>';
    Array.prototype.forEach.call(el.querySelectorAll('[data-sb-choice]'), function (b) {
      b.addEventListener('click', function () { choose(b.getAttribute('data-sb-choice')); });
    });
    // closing (×, Close, Escape) stores nothing and is never consent
    Array.prototype.forEach.call(el.querySelectorAll('[data-sb-x],[data-sb-ok]'), function (b) {
      b.addEventListener('click', function () { closeBox(true); });
    });
    el.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' || e.key === 'Esc') { e.preventDefault(); if (e.stopPropagation) e.stopPropagation(); closeBox(true); }
    });
    var skip = document.querySelector('.skip');   // early in the tab order; shown fixed at the bottom
    if (skip && skip.parentNode) skip.parentNode.insertBefore(el, skip.nextSibling); else document.body.appendChild(el);
    return el;
  }
  function longDate(ms) {
    try { return new Date(ms).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }); } catch (e) { return new Date(ms).toDateString(); }
  }
  function fillBox() {
    var settings = stats.phase === 'settings', rec = settings ? readPick() : stats.pick, off = GPC || usOut();
    var text = box.querySelector('[data-sb-text]'), now = box.querySelector('[data-sb-now]');
    if (off) {
      text.textContent = GPC ? 'Your browser sends a Global Privacy Control signal, so Google Analytics stays off on this site and we do not ask for statistics consent.'
        : 'You have opted out under a U.S. state privacy law, so Google Analytics stays off on this site.';
      now.textContent = '';
    } else {
      text.innerHTML = 'If you allow, Google Analytics (Google Ireland Ltd.) counts page views and sets _ga cookies; data may be processed in the USA. ' +
        'Not consent to ads: ad storage and personalization stay off. Saved for 12 months; change it under “Privacy settings”. ' +
        '<a href="/privacy/#statistics-window">Privacy policy</a>';
      now.textContent = (rec ? 'Your current choice: ' + (rec.choice === 'granted' ? 'allowed' : 'declined') + ' on ' + longDate(rec.at) + '.' : (settings ? 'No choice saved in this browser yet.' : '')) +
        (settings ? ' This page never loads statistics. If you decided in Google’s consent message, change it via “Privacy settings” on a puzzle or guide page.' : '');
    }
    box.querySelector('[data-sb-pick]').hidden = off;
    box.querySelector('[data-sb-info]').hidden = !off;
  }
  function openBox(opener) {
    try {
      if (!box) box = buildBox();
      boxOpener = opener || null;
      fillBox();
      box.hidden = false;
      document.body.classList.add('statbox-open');
      document.body.style.setProperty('--statbox-room', box.offsetHeight + 'px');   // the end of the page stays reachable
      if (opener) box.querySelector('#statbox-h').focus();   // opened on request: focus moves in
      else say('A question about visitor statistics is shown at the bottom of the page.');   // shown by itself: focus stays put
    } catch (e) { /* no DOM: nothing to show */ }
  }
  function closeBox(back) {
    if (!box || box.hidden) return;
    box.hidden = true;
    try {
      document.body.classList.remove('statbox-open');
      if (back && boxOpener && boxOpener.focus) boxOpener.focus();
    } catch (e) { /* ignore */ }
    boxOpener = null;
  }

  privacyButtons();
  if (adsAllowed) fillSlots();
  listen();
  (function () { var rec = readPick(); if (GPC || (rec && rec.choice === 'denied')) eraseGa(); })();   // a stored "no" or GPC deletes GA cookies at once
  if (stats.phase !== 'settings') setTimeout(startStats, STATS_WAIT);
})();
