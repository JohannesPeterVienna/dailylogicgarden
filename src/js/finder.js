/*
 * Daily Logic Garden – practice board finder and table filter of the technique reference.
 * Works on the counts in window.DLG_TECHDATA (one entry per day, puzzle and level, made at build time).
 * No puzzle engine is loaded here and nothing is stored; the address carries only puzzle and technique.
 */
(function () {
  'use strict';
  var DATA = window.DLG_TECHDATA, DAY = 86400000, LEVELS = ['sprout', 'bloom', 'grove'], LEVEL_NAMES = { sprout: 'Sprout', bloom: 'Bloom', grove: 'Grove' }, ARCHIVE_DAYS = 30;
  if (!DATA) return;
  var TYPES = Object.keys(DATA.list);
  function known(type) { return TYPES.indexOf(type) >= 0; }
  function el(tag, attrs, txt) {
    var e = document.createElement(tag);
    Object.keys(attrs || {}).forEach(function (a) { e.setAttribute(a, attrs[a]); });
    if (txt !== undefined) e.appendChild(document.createTextNode(txt));
    return e;
  }
  function pad(n) { return n < 10 ? '0' + n : '' + n; }
  function keyOf(ms) { var d = new Date(ms); return d.getUTCFullYear() + '-' + pad(d.getUTCMonth() + 1) + '-' + pad(d.getUTCDate()); }
  function msOf(key) { return Date.parse(key + 'T00:00:00Z'); }
  function longDate(key) { return new Date(msOf(key)).toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC' }); }
  function techIndex(type, id) { var l = DATA.list[type].tech; for (var i = 0; i < l.length; i++) if (l[i][0] === id) return i; return -1; }

  // boards of the last 30 days (never before launch, never after today) whose path uses the technique
  function find(type, id, todayKey) {
    var out = [], i = known(type) ? techIndex(type, id) : -1;
    if (i < 0 || isNaN(msOf(todayKey))) return out;
    var today = msOf(todayKey), start = msOf(DATA.start);
    for (var back = 0; back < ARCHIVE_DAYS; back++) {
      var ms = today - back * DAY, day = Math.round((ms - start) / DAY);
      if (day < 0) break;
      LEVELS.forEach(function (level) {
        var row = DATA.counts[type + '|' + level][day];
        if (row === undefined) return;
        var uses = +row.split(',')[i];
        if (uses > 0) out.push({ key: keyOf(ms), level: level, uses: uses, today: back === 0 });
      });
    }
    return out;
  }
  function covered(todayKey) { var day = Math.round((msOf(todayKey) - msOf(DATA.start)) / DAY); return day >= 0 && day < DATA.counts[TYPES[0] + '|sprout'].length; }

  function Finder(root) {
    var self = this, q = {};
    try { new URLSearchParams(location.search).forEach(function (v, k) { if (!(k in q)) q[k] = v; }); } catch (e) { /* no address values */ }
    this.root = root;
    this.type = TYPES.indexOf(q.puzzle) >= 0 ? q.puzzle : 'flowerbeds';
    this.tech = techIndex(this.type, q.tech) >= 0 ? q.tech : this.hardest();
    this.today = keyOf(Date.now());
    root.innerHTML = '';
    root.appendChild(el('h2', { id: 'finder-h' }, 'Find a board to practice a technique'));
    var form = el('div', { 'class': 'walk-pick' });
    var lp = el('label', { 'for': 'find-puzzle' }, 'Puzzle ');
    this.selType = el('select', { id: 'find-puzzle' });
    TYPES.forEach(function (t) { self.selType.appendChild(el('option', { value: t }, DATA.list[t].name)); });
    lp.appendChild(this.selType);
    var lt = el('label', { 'for': 'find-tech' }, 'Technique ');
    this.selTech = el('select', { id: 'find-tech' });
    lt.appendChild(this.selTech);
    form.appendChild(lp); form.appendChild(lt);
    root.appendChild(form);
    this.msg = el('p', { 'class': 'game-date', role: 'status', 'aria-live': 'polite' });
    root.appendChild(this.msg);
    this.out = el('div', { 'class': 'tablewrap' });
    root.appendChild(this.out);
    var row = el('div', { 'class': 'controls' });
    this.bCopy = el('button', { type: 'button', 'class': 'btn ghost small' }, 'Copy this list');
    this.bLink = el('button', { type: 'button', 'class': 'btn ghost small' }, 'Copy link to this search');
    this.bAll = el('button', { type: 'button', 'class': 'btn ghost small' }, 'Show all puzzles in the table');
    row.appendChild(this.bCopy); row.appendChild(this.bLink); row.appendChild(this.bAll);
    root.appendChild(row);
    this.copyOut = el('textarea', { 'class': 'walk-copy', readonly: '', rows: '4', hidden: '', 'aria-label': 'Text to copy' });
    root.appendChild(this.copyOut);
    this.selType.addEventListener('change', function () { self.type = self.selType.value; self.tech = self.hardest(); self.render(); });
    this.selTech.addEventListener('change', function () { self.tech = self.selTech.value; self.render(); });
    this.bCopy.addEventListener('click', function () { self.copy(self.bCopy, self.listing()); });
    this.bLink.addEventListener('click', function () { self.copy(self.bLink, 'https://dailylogicgarden.com' + self.address()); });
    this.bAll.addEventListener('click', function () { self.showAll = !self.showAll; self.filterTable(); });
    this.render();
  }
  var F = Finder.prototype;
  F.hardest = function () { var l = DATA.list[this.type].tech; return l[l.length - 1][0]; };
  F.address = function () { return '/techniques/?puzzle=' + this.type + '&tech=' + this.tech; };
  F.copy = function (btn, txt) {
    var self = this, label = btn.textContent;
    function ok() { btn.textContent = 'Copied'; setTimeout(function () { btn.textContent = label; }, 2000); }
    function manual() { self.copyOut.hidden = false; self.copyOut.value = txt; self.copyOut.focus(); self.copyOut.select(); }
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(txt).then(ok, manual);
    else manual();
  };
  F.listing = function () {
    var info = DATA.list[this.type], name = info.tech[techIndex(this.type, this.tech)][1], type = this.type, id = this.tech;
    return info.name + ' – boards that use “' + name + '”\n' + this.hits.map(function (h) {
      return h.key + ' ' + LEVEL_NAMES[h.level] + ' (' + h.uses + '×) https://dailylogicgarden.com/walkthrough/?puzzle=' + type + '&level=' + h.level + '&date=' + h.key + '&tech=' + id;
    }).join('\n');
  };
  F.filterTable = function () {
    var type = this.type, id = this.tech, all = !!this.showAll;
    Array.prototype.forEach.call(document.querySelectorAll('#tech-table tbody tr'), function (tr) {
      tr.hidden = !all && tr.getAttribute('data-puzzle') !== type;
      tr.classList.toggle('picked', tr.getAttribute('data-puzzle') === type && tr.getAttribute('data-tech') === id);
    });
    this.bAll.textContent = all ? 'Show only this puzzle in the table' : 'Show all puzzles in the table';
  };
  F.render = function () {
    var self = this, info = DATA.list[this.type];
    this.selType.value = this.type;
    this.selTech.innerHTML = '';
    info.tech.forEach(function (t) { self.selTech.appendChild(el('option', { value: t[0] }, t[1] + ' (' + LEVEL_NAMES[LEVELS[t[2] - 1]] + ')')); });
    this.selTech.value = this.tech;
    this.hits = find(this.type, this.tech, this.today);
    this.out.innerHTML = '';
    this.copyOut.hidden = true;
    var name = info.tech[techIndex(this.type, this.tech)][1];
    if (!covered(this.today)) this.msg.textContent = 'The counts on this page end ' + ARCHIVE_DAYS + ' or more days before today, so some or all recent boards are missing from this list.';
    else this.msg.textContent = this.hits.length ? this.hits.length + (this.hits.length === 1 ? ' board' : ' boards') + ' of the last ' + ARCHIVE_DAYS + ' days use “' + name + '”.' : 'No ' + info.name + ' board of the last ' + ARCHIVE_DAYS + ' days needed “' + name + '”. The table below shows how rare it is.';
    this.bCopy.disabled = !this.hits.length;
    if (this.hits.length) {
      var table = el('table', {}), head = el('tr', {}), body = el('tbody', {});
      table.appendChild(el('caption', {}, info.name + ': recent boards whose solution path uses “' + name + '”'));
      ['Date (UTC)', 'Level', 'Uses', 'Open'].forEach(function (h) { head.appendChild(el('th', {}, h)); });
      var th = el('thead', {}); th.appendChild(head); table.appendChild(th);
      this.hits.forEach(function (h) {
        var tr = el('tr', {}), open = el('td', {});
        tr.appendChild(el('td', {}, longDate(h.key) + (h.today ? ' (today)' : '')));
        tr.appendChild(el('td', {}, LEVEL_NAMES[h.level]));
        tr.appendChild(el('td', {}, h.uses + '×'));
        open.appendChild(el('a', { href: info.path + '?date=' + h.key + '&level=' + h.level }, 'Play'));
        open.appendChild(document.createTextNode(' · '));
        open.appendChild(el('a', { href: '/walkthrough/?puzzle=' + self.type + '&level=' + h.level + '&date=' + h.key + '&tech=' + self.tech }, h.today ? 'Walkthrough (shows today’s solution)' : 'Walkthrough at first use'));
        tr.appendChild(open);
        body.appendChild(tr);
      });
      table.appendChild(body);
      this.out.appendChild(table);
    }
    this.filterTable();
    if (this.ready || location.search) { try { history.replaceState(null, '', this.address()); } catch (e) { /* address stays as it was */ } }
    this.ready = true;
  };

  window.DLGFinder = { find: find, covered: covered };
  function init() { Array.prototype.forEach.call(document.querySelectorAll('[data-finder]'), function (r) { r.__finder = new Finder(r); }); }
  if (typeof document === 'undefined') return;
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
