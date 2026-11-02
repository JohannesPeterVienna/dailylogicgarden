/*
 * Daily Logic Garden – the puzzle player: boards, keyboard and touch input, "Why?" hints,
 * undo, local saving, sharing without spoilers, print view and the growing garden.
 * Everything stays in this browser (localStorage); nothing is sent anywhere.
 */
(function () {
  'use strict';
  var D = window.DLG, core = D.core, draw = D.draw;
  var META = {
    flowerbeds: { name: 'Flower Beds', path: '/flower-beds/', plant: 'a daisy' },
    tents: { name: 'Tents & Trees', path: '/tents-and-trees/', plant: 'a fir' },
    sunshade: { name: 'Sun & Shade', path: '/sun-and-shade/', plant: 'a sunflower' },
    gardenpath: { name: 'Garden Path', path: '/garden-path/', plant: 'a fern' },
    whoplanted: { name: 'Who Planted What', path: '/who-planted-what/', plant: 'a tulip' }
  };
  var TYPES = ['flowerbeds', 'tents', 'sunshade', 'gardenpath', 'whoplanted'];
  var ARCHIVE_DAYS = 30;

  // ---------- storage (safe when blocked) ----------
  var store = {
    get: function (k, d) { try { var v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
    set: function (k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* storage unavailable */ } }
  };
  var GARDEN_KEY = 'dlg:garden';
  function garden() { var g = store.get(GARDEN_KEY, null); return g && g.plants ? g : { v: 1, plants: [] }; }
  function plant(type, level, key, hints, secs) {
    var g = garden();
    if (g.plants.some(function (p) { return p.type === type && p.level === level && p.key === key; })) return false;
    g.plants.push({ type: type, level: level, key: key, hints: hints, secs: secs, at: new Date().toISOString().slice(0, 10) });
    store.set(GARDEN_KEY, g);
    return true;
  }
  function solvedSet() { var m = {}; garden().plants.forEach(function (p) { m[p.type + '|' + p.level + '|' + p.key] = 1; }); return m; }

  function today() { return core.dateKey(new Date()); }
  function query() {
    var q = {};
    location.search.replace(/^\?/, '').split('&').forEach(function (kv) { var a = kv.split('='); if (a[0]) q[decodeURIComponent(a[0])] = decodeURIComponent(a[1] || ''); });
    return q;
  }
  function validDate(key) {
    if (!core.parseKey(key)) return null;
    var t = today();
    return key <= t && key >= core.addDays(t, -(ARCHIVE_DAYS - 1)) ? key : null;
  }
  function longDate(key) {
    var d = core.parseKey(key);
    return d.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' });
  }
  function el(tag, attrs, html) {
    var e = document.createElement(tag);
    Object.keys(attrs || {}).forEach(function (a) { if (attrs[a] !== null && attrs[a] !== undefined) e.setAttribute(a, attrs[a]); });
    if (html !== undefined) e.innerHTML = html;
    return e;
  }
  function fmtTime(s) { s = Math.round(s); var m = Math.floor(s / 60); return m + ':' + (s % 60 < 10 ? '0' : '') + (s % 60); }

  // ======================= the game =======================
  function Game(root) {
    this.root = root;
    this.type = root.getAttribute('data-game');
    this.mod = D[this.type];
    var q = query();
    this.key = validDate(q.date) || today();
    this.isToday = this.key === today();
    var savedLevel = store.get('dlg:level:' + this.type, 'sprout');
    this.level = core.LEVELS.indexOf(q.level) >= 0 ? q.level : core.LEVELS.indexOf(savedLevel) >= 0 ? savedLevel : 'sprout';
    this.prefs = store.get('dlg:prefs', { dots: true, autox: true });
    this.build();
    this.load();
  }
  var G = Game.prototype;

  G.build = function () {
    var self = this, r = this.root;
    r.innerHTML = '';
    var head = el('div', { 'class': 'game-head' });
    var lvl = el('div', { 'class': 'lvl', role: 'group', 'aria-label': 'Difficulty' });
    core.LEVELS.forEach(function (l) {
      var b = el('button', { type: 'button', 'data-level': l, 'aria-pressed': String(l === self.level) }, core.LEVEL_NAMES[l]);
      b.addEventListener('click', function () { if (self.level !== l) { self.level = l; store.set('dlg:level:' + self.type, l); self.load(); } });
      lvl.appendChild(b);
    });
    this.dateEl = el('p', { 'class': 'game-date' });
    head.appendChild(lvl); head.appendChild(this.dateEl);
    r.appendChild(head);
    this.stage = el('div', { 'class': 'stage' });
    r.appendChild(this.stage);
    this.statusEl = el('p', { 'class': 'status', role: 'status', 'aria-live': 'polite' });
    this.hintEl = el('div', { 'class': 'hintbox', hidden: '', 'aria-live': 'polite' });
    this.solvedEl = el('div', { 'class': 'solved', hidden: '' });
    var ctr = el('div', { 'class': 'controls' });
    this.btnHint = el('button', { type: 'button', 'class': 'btn hint' }, 'Why? <span aria-hidden="true">(next step)</span>');
    this.btnUndo = el('button', { type: 'button', 'class': 'btn ghost small' }, 'Undo');
    this.btnClear = el('button', { type: 'button', 'class': 'btn ghost small' }, 'Start over');
    this.btnPrint = el('button', { type: 'button', 'class': 'btn ghost small' }, 'Print');
    [this.btnHint, this.btnUndo, this.btnClear, this.btnPrint].forEach(function (b) { ctr.appendChild(b); });
    this.btnHint.addEventListener('click', function () { self.showHint(); });
    this.btnUndo.addEventListener('click', function () { self.undo(); });
    this.btnClear.addEventListener('click', function () { if (window.confirm('Clear this board and start again? Your garden keeps everything you have already planted.')) self.reset(); });
    this.btnPrint.addEventListener('click', function () { window.print(); });
    this.prefsEl = el('div', { 'class': 'prefs' });
    r.appendChild(this.statusEl);
    r.appendChild(this.hintEl);
    r.appendChild(ctr);
    r.appendChild(this.prefsEl);
    r.appendChild(this.solvedEl);
    this.printRoot = document.querySelector('.print-root');
    var self2 = this;
    document.addEventListener('visibilitychange', function () { self2.tick(); });
    setInterval(function () { self2.tick(); }, 5000);
  };

  G.saveKey = function () { return 'dlg:v1:' + this.type + ':' + this.level + ':' + this.key; };
  G.load = function () {
    var self = this;
    Array.prototype.forEach.call(this.root.querySelectorAll('.lvl button'), function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-level') === self.level)); });
    this.dateEl.innerHTML = (this.isToday ? 'Today’s puzzle · ' : 'From the archive · ') + longDate(this.key) + ' (UTC) · <a href="/archive/">Archive</a>';
    this.stage.innerHTML = '<p class="loading">Growing ' + core.LEVEL_NAMES[this.level] + ' puzzle…</p>';
    this.hintEl.hidden = true; this.solvedEl.hidden = true;
    setTimeout(function () {
      try { self.p = self.mod.generate(self.key, self.level); }
      catch (e) { self.stage.innerHTML = '<p class="loading">This puzzle could not be grown. Please try another level.</p>'; return; }
      var saved = store.get(self.saveKey(), null);
      self.user = saved && saved.u ? self.restore(saved.u) : self.blank();
      self.hints = saved ? saved.h || 0 : 0;
      self.secs = saved ? saved.t || 0 : 0;
      self.done = !!(saved && saved.s);
      self.history = [];
      self.hint = null;
      self.lastTick = Date.now();
      self.render();
      self.renderPrint();
      if (self.done) self.celebrate(false);
    }, 20);
  };
  G.blank = function () {
    var p = this.p;
    if (this.type === 'gardenpath') return { path: [p.solution[0]], pencil: {} };
    if (this.type === 'tents') return Array.from(this.mod.initial(this.mod.geom(p)));
    if (this.type === 'sunshade') return p.givens.slice();
    if (this.type === 'whoplanted') return new Array(this.mod.geom(p).size).fill(0);
    return new Array(p.n * p.n).fill(0);
  };
  G.restore = function (u) { return this.type === 'gardenpath' ? { path: u.path.slice(), pencil: u.pencil || {} } : u.slice(); };
  G.snapshot = function () { return this.type === 'gardenpath' ? { path: this.user.path.slice(), pencil: JSON.parse(JSON.stringify(this.user.pencil)) } : this.user.slice(); };
  G.save = function () { store.set(this.saveKey(), { u: this.user, h: this.hints, t: Math.round(this.secs), s: this.done }); };
  G.tick = function () {
    if (!this.p || this.done) { this.lastTick = Date.now(); return; }
    var now = Date.now();
    if (document.visibilityState !== 'hidden') this.secs += Math.min(60, (now - (this.lastTick || now)) / 1000);
    this.lastTick = now;
  };
  G.change = function (fn) {
    if (this.done) return;
    this.tick();
    this.history.push(this.snapshot());
    if (this.history.length > 400) this.history.shift();
    fn();
    this.hint = null;
    this.hintEl.hidden = true;
    this.save();
    this.refresh();
    this.checkSolved();
  };
  G.undo = function () { if (!this.history.length || this.done) return; this.user = this.history.pop(); this.hint = null; this.hintEl.hidden = true; this.save(); this.refresh(); };
  G.reset = function () { this.user = this.blank(); this.history = []; this.done = false; this.hint = null; this.hintEl.hidden = true; this.solvedEl.hidden = true; this.save(); this.render(); };
  G.checkSolved = function () {
    if (this.done || !this.mod.isSolved(this.p, this.user)) return;
    this.tick();
    this.done = true;
    this.save();
    this.celebrate(true);
  };
  G.shareText = function () {
    var m = META[this.type];
    return 'Daily Logic Garden – ' + m.name + ' (' + core.LEVEL_NAMES[this.level] + ')\n' + longDate(this.key) + '\n' +
      'Solved in ' + fmtTime(this.secs) + (this.hints ? ' with ' + core.plural(this.hints, 'hint') : ' without hints') + '\n' +
      'https://dailylogicgarden.com' + m.path;
  };
  G.celebrate = function (fresh) {
    var self = this, m = META[this.type];
    var added = plant(this.type, this.level, this.key, this.hints, Math.round(this.secs));
    var txt = this.shareText();
    this.solvedEl.innerHTML = '<h3>Solved – ' + (added || !fresh ? 'you planted ' + m.plant + ' in your garden' : 'well done') + '</h3>' +
      '<p>' + core.LEVEL_NAMES[this.level] + ' · ' + fmtTime(this.secs) + (this.hints ? ' · ' + core.plural(this.hints, 'hint') : '') + '. Hints never cost you a plant, and missed days never wilt anything.</p>' +
      '<div class="share-text" aria-label="Result to share">' + txt.replace(/&/g, '&amp;').replace(/</g, '&lt;') + '</div>' +
      '<p class="row"><button type="button" class="btn small" data-share>Copy result</button> <a class="btn ghost small" href="/garden/">See my garden</a></p>';
    this.solvedEl.hidden = false;
    this.solvedEl.querySelector('[data-share]').addEventListener('click', function (ev) {
      var b = ev.currentTarget;
      function ok() { b.textContent = 'Copied'; setTimeout(function () { b.textContent = 'Copy result'; }, 2000); }
      if (navigator.share && /Mobi|Android/i.test(navigator.userAgent)) { navigator.share({ text: txt }).catch(function () {}); return; }
      if (navigator.clipboard) navigator.clipboard.writeText(txt).then(ok, function () { window.prompt('Copy your result:', txt); });
      else window.prompt('Copy your result:', txt);
    });
    this.refresh();
    if (fresh) this.statusEl.textContent = 'Solved! ' + m.name + ' ' + core.LEVEL_NAMES[this.level] + ' is complete.';
  };

  G.showHint = function () {
    if (!this.p) return;
    if (this.done) { this.statusEl.textContent = 'This puzzle is already solved.'; return; }
    var self = this, h = this.mod.hint(this.p, this.user);
    this.hint = h;
    var label = h.kind === 'mistake' ? 'Check this:' : h.kind === 'done' ? 'Done:' : 'Why?';
    this.hintEl.innerHTML = '<p style="margin:0"><span class="why">' + label + '</span>' + h.text.replace(/&/g, '&amp;').replace(/</g, '&lt;') + '</p>';
    if (h.kind === 'deduction' || h.kind === 'reveal' || h.kind === 'mistake') {
      var row = el('div', { 'class': 'row' });
      var apply = el('button', { type: 'button', 'class': 'btn small' }, h.kind === 'mistake' ? (this.type === 'gardenpath' ? 'Back up the path' : 'Clear that mark') : 'Apply this step');
      apply.addEventListener('click', function () { self.applyHint(h); });
      row.appendChild(apply);
      this.hintEl.appendChild(row);
    }
    this.hintEl.hidden = false;
    if (h.kind === 'deduction' || h.kind === 'reveal') { this.hints++; this.save(); }
    this.refresh();
  };
  G.applyHint = function (h) {
    var self = this;
    this.change(function () {
      if (self.type === 'gardenpath') {
        if (h.kind === 'mistake') {
          for (var i = 0; i < self.user.path.length; i++) if (self.user.path[i] !== self.p.solution[i]) { self.user.path = self.user.path.slice(0, i); break; }
        } else h.set.forEach(function (q) { self.user.pencil[q[0]] = q[1]; });
        self.followPencil();
        return;
      }
      if (h.kind === 'mistake') h.cells.forEach(function (k) { self.user[k] = self.type === 'tents' && self.p.trees.indexOf(k) >= 0 ? 3 : 0; });
      else h.set.forEach(function (q) { self.user[q[0]] = q[1]; });
      if (self.type === 'whoplanted' && self.prefs.autox) h.set.forEach(function (q) { if (q[1] === 1) self.autoCross(q[0]); });
    });
  };

  G.render = function () {
    this.stage.innerHTML = '';
    var R = RENDER[this.type];
    R.build.call(this);
    this.renderPrefs();
    this.refresh();
  };
  G.refresh = function () {
    if (!this.p) return;
    RENDER[this.type].update.call(this);
    this.btnUndo.disabled = !this.history.length || this.done;
    this.btnHint.disabled = this.done;
  };
  G.renderPrefs = function () {
    var self = this;
    this.prefsEl.innerHTML = '';
    var opts = this.type === 'flowerbeds' || this.type === 'tents' ? [['dots', 'Show blocked squares as dots']] : this.type === 'whoplanted' ? [['autox', 'Fill ✕ automatically after a ●']] : [];
    opts.forEach(function (o) {
      var id = 'pref-' + self.type + '-' + o[0];
      var lab = el('label', { 'for': id }), box = el('input', { type: 'checkbox', id: id });
      box.checked = !!self.prefs[o[0]];
      box.addEventListener('change', function () { self.prefs[o[0]] = box.checked; store.set('dlg:prefs', self.prefs); self.refresh(); });
      lab.appendChild(box); lab.appendChild(document.createTextNode(o[1]));
      self.prefsEl.appendChild(lab);
    });
  };
  G.renderPrint = function () {
    if (!this.printRoot) return;
    this.printRoot.innerHTML = draw.printSheet(this.p, D, META[this.type].name + ' – ' + core.LEVEL_NAMES[this.level] + ' – ' + longDate(this.key));
  };

  // ---------- square boards (flower beds, tents, sun & shade) ----------
  function squareBoard(game, n, opts) {
    var b = el('div', { 'class': 'board', style: '--n:' + n });
    var cl = el('div', { 'class': 'collab', 'aria-hidden': 'true' }), rl = el('div', { 'class': 'rowlab', 'aria-hidden': 'true' });
    for (var i = 0; i < n; i++) { cl.appendChild(el('span', {}, core.COLS[i])); rl.appendChild(el('span', {}, String(i + 1))); }
    b.appendChild(cl); b.appendChild(rl);
    var cells = el('div', { 'class': 'cells' + (opts.path ? ' path' : ''), role: 'grid', 'aria-label': opts.label });
    game.cellEls = [];
    for (var r = 0; r < n; r++) {
      var row = el('div', { role: 'row', style: 'display:contents' });
      for (var c = 0; c < n; c++) {
        var k = r * n + c;
        var cell = el(opts.path ? 'div' : 'button', { 'class': 'cell', role: 'gridcell', 'data-k': k, tabindex: k === 0 ? '0' : '-1' });
        if (!opts.path) cell.type = 'button';
        row.appendChild(cell);
        game.cellEls.push(cell);
      }
      cells.appendChild(row);
    }
    b.appendChild(cells);
    game.cellsEl = cells;
    var wrap = el('div', { 'class': 'board-wrap' });
    wrap.appendChild(b);
    return { wrap: wrap, board: b, cells: cells };
  }
  function focusCell(game, k) {
    game.cellEls.forEach(function (c, i) { c.tabIndex = i === k ? 0 : -1; });
    game.cellEls[k].focus();
    game.cursor = k;
  }
  function bindCells(game, onActivate, onKeyValue) {
    var n = game.p.n, dragging = false, dragVal = null;
    game.cellsEl.addEventListener('click', function (ev) {
      var t = ev.target.closest('.cell');
      if (!t || game.dragMoved) { game.dragMoved = false; return; }
      var k = +t.getAttribute('data-k');
      focusCell(game, k);
      onActivate(k);
    });
    game.cellsEl.addEventListener('keydown', function (ev) {
      var t = ev.target.closest('.cell');
      if (!t) return;
      var k = +t.getAttribute('data-k'), r = Math.floor(k / n), c = k % n, nk = null;
      if (ev.key === 'ArrowUp') nk = Math.max(0, r - 1) * n + c;
      else if (ev.key === 'ArrowDown') nk = Math.min(n - 1, r + 1) * n + c;
      else if (ev.key === 'ArrowLeft') nk = r * n + Math.max(0, c - 1);
      else if (ev.key === 'ArrowRight') nk = r * n + Math.min(n - 1, c + 1);
      else if (ev.key === 'Home') nk = r * n;
      else if (ev.key === 'End') nk = r * n + n - 1;
      if (nk !== null) { ev.preventDefault(); focusCell(game, nk); return; }
      if (ev.key === ' ' || ev.key === 'Enter') { ev.preventDefault(); onActivate(k); return; }
      var v = onKeyValue(ev.key);
      if (v !== null && v !== undefined) { ev.preventDefault(); game.setCell(k, v); }
      if (ev.key === 'z' && (ev.ctrlKey || ev.metaKey)) { ev.preventDefault(); game.undo(); }
    });
    // drag across open squares to mark them (empty / grass)
    game.cellsEl.addEventListener('pointerdown', function (ev) {
      var t = ev.target.closest('.cell');
      if (!t || ev.button > 0) return;
      dragging = true; game.dragMoved = false; dragVal = null; game.dragStart = +t.getAttribute('data-k');
    });
    game.cellsEl.addEventListener('pointermove', function (ev) {
      if (!dragging || !game.dragMark) return;
      var t = document.elementFromPoint(ev.clientX, ev.clientY);
      t = t && t.closest ? t.closest('.cell') : null;
      if (!t || !game.cellsEl.contains(t)) return;
      var k = +t.getAttribute('data-k');
      if (k === game.dragStart && !game.dragMoved) return;
      if (!game.dragMoved) { game.dragMoved = true; if (game.dragMark(game.dragStart, true)) dragVal = 1; }
      game.dragMark(k, false);
    });
    function end() { if (dragging && game.dragMoved) { game.save(); game.refresh(); game.checkSolved(); } dragging = false; }
    window.addEventListener('pointerup', end);
    window.addEventListener('pointercancel', end);
  }
  G.setCell = function (k, v) { var self = this; if (this.user[k] === v) return; this.change(function () { self.user[k] = v; }); };
  G.markHints = function () {
    var h = this.hint, focus = {}, target = {};
    if (h && h.focus && (h.kind === 'deduction' || h.kind === 'mistake' || h.kind === 'reveal')) {
      h.focus.forEach(function (k) { focus[k] = 1; });
      (h.cells || []).forEach(function (k) { target[k] = 1; });
    }
    return { focus: focus, target: target };
  };
  function cname(k, n) { return core.cellName(Math.floor(k / n), k % n); }

  var RENDER = {};

  RENDER.flowerbeds = {
    build: function () {
      var self = this, p = this.p, n = p.n;
      var b = squareBoard(this, n, { label: 'Flower Beds board, ' + n + ' by ' + n });
      this.stage.appendChild(b.wrap);
      this.cellEls.forEach(function (cell, k) {
        var r = Math.floor(k / n), c = k % n, reg = p.regions[k];
        var cls = ' b' + p.colors[reg] + ' p' + (reg % 9);
        if (r === 0 || p.regions[k - n] !== reg) cls += ' bt';
        if (c === 0 || p.regions[k - 1] !== reg) cls += ' bl';
        if (c === n - 1 || p.regions[k + 1] !== reg) cls += ' br';
        if (r === n - 1 || p.regions[k + n] !== reg) cls += ' bb';
        cell.className += cls;
      });
      var leg = el('ul', { 'class': 'legend', 'aria-label': 'Beds' });
      p.beds.forEach(function (name, i) {
        var sw = '<span class="sw cell b' + p.colors[i] + ' p' + (i % 9) + '" aria-hidden="true"></span>';
        leg.appendChild(el('li', {}, sw + name));
      });
      this.stage.appendChild(leg);
      this.stage.appendChild(el('p', { 'class': 'howto' }, 'Tap once for <b>empty</b> (✕), twice for a <b>flower</b>, a third time to clear. Drag across squares to mark several as empty. Keyboard: arrows move, <kbd>F</kbd> flower, <kbd>X</kbd> empty, <kbd>Backspace</kbd> clear, <kbd>Ctrl</kbd>+<kbd>Z</kbd> undo.'));
      bindCells(this, function (k) { self.setCell(k, [2, 0, 1][self.user[k]]); }, function (key) {
        if (key === 'f' || key === 'F' || key === '1') return 1;
        if (key === 'x' || key === 'X' || key === '2') return 2;
        if (key === 'Backspace' || key === 'Delete' || key === '0') return 0;
        return null;
      });
      this.dragMark = function (k, first) { if (self.user[k] === 0) { if (first) self.history.push(self.snapshot()); self.user[k] = 2; self.refresh(); return true; } return false; };
    },
    update: function () {
      var p = this.p, n = p.n, u = this.user, mod = this.mod;
      var blocked = {}, bad = {};
      if (this.prefs.dots) mod.blockedBy(p, u).forEach(function (x) { blocked[x] = 1; });
      mod.conflicts(p, u).forEach(function (x) { bad[x] = 1; });
      var hl = this.markHints();
      this.cellEls.forEach(function (cell, k) {
        var v = u[k];
        cell.innerHTML = v === 1 ? draw.ICON.flower : v === 2 ? draw.ICON.cross : blocked[k] ? '<span class="dot"></span>' : '';
        cell.classList.toggle('blocked', !!blocked[k] && v === 0);
        cell.classList.toggle('conflict', !!bad[k]);
        cell.classList.toggle('hl-focus', !!hl.focus[k]);
        cell.classList.toggle('hl-target', !!hl.target[k]);
        cell.setAttribute('aria-label', cname(k, n) + ', ' + p.beds[p.regions[k]] + ' bed, ' + (v === 1 ? 'flower' : v === 2 ? 'empty' : blocked[k] ? 'blocked' : 'open'));
      });
      var flowers = u.filter(function (v) { return v === 1; }).length;
      if (!this.done) this.statusEl.textContent = flowers + ' of ' + n + ' flowers planted';
    }
  };

  RENDER.tents = {
    build: function () {
      var self = this, p = this.p, n = p.n;
      var b = squareBoard(this, n, { label: 'Tents and Trees board, ' + n + ' by ' + n });
      this.cntR = el('div', { 'class': 'cnt-r', 'aria-label': 'Tents per row' });
      this.cntC = el('div', { 'class': 'cnt-c', 'aria-label': 'Tents per column' });
      for (var i = 0; i < n; i++) { this.cntR.appendChild(el('span', {}, String(p.rowCount[i]))); this.cntC.appendChild(el('span', {}, String(p.colCount[i]))); }
      b.board.appendChild(this.cntR); b.board.appendChild(this.cntC);
      this.stage.appendChild(b.wrap);
      this.cellEls.forEach(function (cell, k) { if (p.trees.indexOf(k) >= 0) { cell.classList.add('given'); cell.setAttribute('aria-disabled', 'true'); } });
      this.stage.appendChild(el('p', { 'class': 'howto' }, 'Tap once for <b>grass</b>, twice for a <b>tent</b>, a third time to clear. Drag to lay grass on several squares. Numbers on the right and below count the tents in each row and column. Keyboard: arrows move, <kbd>T</kbd> tent, <kbd>G</kbd> grass, <kbd>Backspace</kbd> clear.'));
      bindCells(this, function (k) { if (self.user[k] !== 3) self.setCell(k, [2, 0, 1][self.user[k]]); }, function (key) {
        if (self.user[self.cursor || 0] === 3) return null;
        if (key === 't' || key === 'T' || key === '1') return 1;
        if (key === 'g' || key === 'G' || key === 'x' || key === 'X' || key === '2') return 2;
        if (key === 'Backspace' || key === 'Delete' || key === '0') return 0;
        return null;
      });
      this.dragMark = function (k, first) { if (self.user[k] === 0) { if (first) self.history.push(self.snapshot()); self.user[k] = 2; self.refresh(); return true; } return false; };
    },
    update: function () {
      var p = this.p, n = p.n, u = this.user, mod = this.mod, blocked = {}, bad = {};
      if (this.prefs.dots) mod.blockedBy(p, u).forEach(function (x) { blocked[x] = 1; });
      mod.conflicts(p, u).forEach(function (x) { bad[x] = 1; });
      var hl = this.markHints();
      this.cellEls.forEach(function (cell, k) {
        var v = u[k];
        cell.innerHTML = v === 3 ? draw.ICON.tree : v === 1 ? draw.ICON.tent : v === 2 ? draw.ICON.grass : blocked[k] ? '<span class="dot"></span>' : '';
        cell.classList.toggle('conflict', !!bad[k]);
        cell.classList.toggle('hl-focus', !!hl.focus[k]);
        cell.classList.toggle('hl-target', !!hl.target[k]);
        cell.setAttribute('aria-label', cname(k, n) + ', ' + (v === 3 ? 'tree' : v === 1 ? 'tent' : v === 2 ? 'grass' : 'open'));
      });
      for (var i = 0; i < n; i++) {
        var tr = 0, tc = 0;
        for (var j = 0; j < n; j++) { if (u[i * n + j] === 1) tr++; if (u[j * n + i] === 1) tc++; }
        this.cntR.children[i].className = tr === p.rowCount[i] ? 'met' : '';
        this.cntC.children[i].className = tc === p.colCount[i] ? 'met' : '';
      }
      if (!this.done) this.statusEl.textContent = u.filter(function (v) { return v === 1; }).length + ' of ' + p.trees.length + ' tents pitched';
    }
  };

  RENDER.sunshade = {
    build: function () {
      var self = this, p = this.p, n = p.n;
      var b = squareBoard(this, n, { label: 'Sun and Shade board, ' + n + ' by ' + n });
      this.stage.appendChild(b.wrap);
      this.cellEls.forEach(function (cell, k) { if (p.givens[k]) { cell.classList.add('given'); cell.setAttribute('aria-disabled', 'true'); } });
      this.stage.appendChild(el('p', { 'class': 'howto' }, 'Tap once for <b>sun</b>, twice for <b>shade</b>, a third time to clear. Given squares have a tinted background and can\u2019t be changed. Keyboard: arrows move, <kbd>S</kbd> sun, <kbd>D</kbd> shade, <kbd>Backspace</kbd> clear.'));
      bindCells(this, function (k) { if (!p.givens[k]) self.setCell(k, [1, 2, 0][self.user[k]]); }, function (key) {
        if (p.givens[self.cursor || 0]) return null;
        if (key === 's' || key === 'S' || key === '1') return 1;
        if (key === 'd' || key === 'D' || key === '2') return 2;
        if (key === 'Backspace' || key === 'Delete' || key === '0') return 0;
        return null;
      });
    },
    update: function () {
      var p = this.p, n = p.n, u = this.user, bad = {};
      this.mod.conflicts(p, u).forEach(function (x) { bad[x] = 1; });
      var hl = this.markHints();
      this.cellEls.forEach(function (cell, k) {
        var v = p.givens[k] || u[k];
        cell.innerHTML = v === 1 ? draw.ICON.sun : v === 2 ? draw.ICON.shade : '';
        cell.style.backgroundColor = p.givens[k] ? 'var(--given)' : '';
        cell.classList.toggle('conflict', !!bad[k]);
        cell.classList.toggle('hl-focus', !!hl.focus[k]);
        cell.classList.toggle('hl-target', !!hl.target[k]);
        cell.setAttribute('aria-label', cname(k, n) + ', ' + (v === 1 ? 'sun' : v === 2 ? 'shade' : 'open') + (p.givens[k] ? ', given' : ''));
      });
      var filled = 0;
      for (var k = 0; k < n * n; k++) if (p.givens[k] || u[k]) filled++;
      if (!this.done) this.statusEl.textContent = filled + ' of ' + n * n + ' squares filled';
    }
  };

  // ---------- garden path ----------
  G.followPencil = function () {
    var g = this.mod.geom(this.p), u = this.user;
    for (;;) {
      var head = u.path[u.path.length - 1], prev = u.path[u.path.length - 2], next = -1;
      g.cellEdges[head].forEach(function (e) {
        if (u.pencil[e] !== 1) return;
        var o = g.edges[e][0] === head ? g.edges[e][1] : g.edges[e][0];
        if (o !== prev && u.path.indexOf(o) < 0) next = o;
      });
      if (next < 0) break;
      u.path.push(next);
    }
  };
  G.pathStep = function (k) {
    // extend the path to k, or back up when k is already on it
    var g = this.mod.geom(this.p), u = this.user, head = u.path[u.path.length - 1];
    var at = u.path.indexOf(k);
    if (at >= 0) { if (at < u.path.length - 1) u.path = u.path.slice(0, at + 1); return true; }
    var e = g.edgeAt[head + ',' + k];
    if (e === undefined || (this.p.hedges || []).indexOf(e) >= 0) return false;
    if (g.stoneAt[head] === g.last) return false;
    u.path.push(k);
    return true;
  };
  RENDER.gardenpath = {
    build: function () {
      var self = this, p = this.p, n = p.n, g = this.mod.geom(p);
      var b = squareBoard(this, n, { label: 'Garden Path board, ' + n + ' by ' + n, path: true });
      this.stage.appendChild(b.wrap);
      b.cells.setAttribute('role', 'application');
      b.cells.setAttribute('tabindex', '0');
      b.cells.setAttribute('aria-roledescription', 'path board');
      this.cellEls.forEach(function (c) { c.removeAttribute('tabindex'); c.removeAttribute('role'); });
      Object.keys(p.stones).forEach(function (cell) { self.cellEls[+cell].innerHTML = '<span class="stone">' + p.stones[cell] + '</span>'; });
      var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svg.setAttribute('class', 'overlay'); svg.setAttribute('viewBox', '0 0 ' + n + ' ' + n); svg.setAttribute('aria-hidden', 'true');
      svg.setAttribute('preserveAspectRatio', 'none');
      b.cells.appendChild(svg);
      this.svg = svg;
      this.stage.appendChild(el('p', { 'class': 'howto' }, 'Start on stone 1 and drag through the squares, or tap the next square. Tap a square on your path to back up to it. Keyboard: focus the board, then arrows extend the path and <kbd>Backspace</kbd> steps back. Thick dark bars are hedges you can’t cross.'));
      function cellAt(ev) {
        var rect = b.cells.getBoundingClientRect();
        var c = Math.floor((ev.clientX - rect.left) / rect.width * n), r = Math.floor((ev.clientY - rect.top) / rect.height * n);
        return r >= 0 && c >= 0 && r < n && c < n ? r * n + c : -1;
      }
      var drawing = false, moved = false;
      b.cells.addEventListener('pointerdown', function (ev) {
        if (self.done) return;
        var k = cellAt(ev);
        if (k < 0) return;
        ev.preventDefault();
        try { b.cells.setPointerCapture(ev.pointerId); } catch (e) { /* older browsers */ }
        drawing = true; moved = false;
        self.history.push(self.snapshot());
        var head = self.user.path[self.user.path.length - 1];
        if (k !== head && !self.pathStep(k)) { /* tapping elsewhere just starts a drag */ }
        self.refresh();
      });
      b.cells.addEventListener('pointermove', function (ev) {
        if (!drawing) return;
        var k = cellAt(ev), u = self.user;
        if (k < 0 || k === u.path[u.path.length - 1]) return;
        moved = true;
        if (k === u.path[u.path.length - 2]) u.path.pop();
        else if (u.path.indexOf(k) < 0) self.pathStep(k);
        self.refresh();
      });
      function end() {
        if (!drawing) return;
        drawing = false;
        var last = self.history[self.history.length - 1];
        if (last && JSON.stringify(last.path) === JSON.stringify(self.user.path)) self.history.pop();
        self.hint = null; self.hintEl.hidden = true;
        self.save(); self.refresh(); self.checkSolved();
      }
      b.cells.addEventListener('pointerup', end);
      b.cells.addEventListener('pointercancel', end);
      b.cells.addEventListener('keydown', function (ev) {
        var u = self.user, head = u.path[u.path.length - 1], r = Math.floor(head / n), c = head % n, k = -1;
        if (ev.key === 'ArrowUp' && r > 0) k = head - n;
        else if (ev.key === 'ArrowDown' && r < n - 1) k = head + n;
        else if (ev.key === 'ArrowLeft' && c > 0) k = head - 1;
        else if (ev.key === 'ArrowRight' && c < n - 1) k = head + 1;
        if (/^Arrow/.test(ev.key)) {
          ev.preventDefault();
          if (k < 0) return;
          self.change(function () { if (k === u.path[u.path.length - 2]) u.path.pop(); else self.pathStep(k); });
        } else if (ev.key === 'Backspace' || ev.key === 'Delete') {
          ev.preventDefault();
          if (u.path.length > 1) self.change(function () { u.path.pop(); });
        } else if (ev.key === 'z' && (ev.ctrlKey || ev.metaKey)) { ev.preventDefault(); self.undo(); }
      });
      void g;
    },
    update: function () {
      var p = this.p, n = p.n, g = this.mod.geom(p), u = this.user, svg = this.svg;
      var pts = u.path.map(function (k) { return ((k % n) + 0.5) + ',' + (Math.floor(k / n) + 0.5); }).join(' ');
      var s = '';
      (p.hedges || []).forEach(function (e) {
        var a = g.edges[e][0], bb = g.edges[e][1], r = Math.floor(a / n), c = a % n;
        if (bb === a + 1) s += '<line class="hedge" x1="' + (c + 1) + '" y1="' + r + '" x2="' + (c + 1) + '" y2="' + (r + 1) + '"/>';
        else s += '<line class="hedge" x1="' + c + '" y1="' + (r + 1) + '" x2="' + (c + 1) + '" y2="' + (r + 1) + '"/>';
      });
      Object.keys(u.pencil).forEach(function (e) {
        var a = g.edges[e][0], bb = g.edges[e][1];
        var x1 = a % n + 0.5, y1 = Math.floor(a / n) + 0.5, x2 = bb % n + 0.5, y2 = Math.floor(bb / n) + 0.5;
        if (u.pencil[e] === 1) s += '<line class="pencil" x1="' + x1 + '" y1="' + y1 + '" x2="' + x2 + '" y2="' + y2 + '"/>';
        else { var mx = (x1 + x2) / 2, my = (y1 + y2) / 2, dx = (y2 - y1) * 0.18, dy = (x2 - x1) * 0.18; s += '<line class="nope" x1="' + (mx - dx) + '" y1="' + (my - dy) + '" x2="' + (mx + dx) + '" y2="' + (my + dy) + '"/>'; }
      });
      s += '<polyline class="route" points="' + pts + '"/>';
      var head = u.path[u.path.length - 1];
      s += '<circle class="head" cx="' + ((head % n) + 0.5) + '" cy="' + (Math.floor(head / n) + 0.5) + '" r=".14"/>';
      svg.innerHTML = s;
      var hl = this.markHints(), on = {};
      u.path.forEach(function (k) { on[k] = 1; });
      this.cellEls.forEach(function (cell, k) {
        cell.style.backgroundColor = on[k] ? 'var(--leaf)' : '';
        cell.classList.toggle('hl-focus', !!hl.focus[k]);
        cell.classList.toggle('hl-target', !!hl.target[k]);
      });
      this.cellsEl.setAttribute('aria-label', 'Garden Path board, ' + n + ' by ' + n + '. Path at ' + cname(head, n) + ', ' + u.path.length + ' of ' + n * n + ' squares.');
      if (!this.done) this.statusEl.textContent = 'Path at ' + cname(head, n) + ' · ' + u.path.length + ' of ' + n * n + ' squares';
    }
  };

  // ---------- who planted what ----------
  G.autoCross = function (k) {
    var mod = this.mod, g = mod.geom(this.p), ci = mod.cellInfo(g, k), u = this.user;
    for (var j = 0; j < g.m; j++) {
      var a = mod.idx(g, ci.a, ci.i, ci.b, j), b = mod.idx(g, ci.a, j, ci.b, ci.j);
      if (a !== k && u[a] === 0) u[a] = 2;
      if (b !== k && u[b] === 0) u[b] = 2;
    }
  };
  RENDER.whoplanted = {
    build: function () {
      var self = this, p = this.p, mod = this.mod, g = mod.geom(p), m = g.m;
      var CAT = { who: 'Gardeners', plant: 'Crops', bed: 'Beds', day: 'Days' };
      var cl = el('ol', { 'class': 'lg-clues', 'aria-label': 'Clues' });
      p.clueTexts.forEach(function (t) { cl.appendChild(el('li', {}, t.replace(/&/g, '&amp;').replace(/</g, '&lt;'))); });
      this.stage.appendChild(el('p', { 'class': 'howto', style: 'margin-top:0' }, 'Each gardener planted one crop' + (p.cats.length > 3 ? ', in one bed, on one day' : ' in one bed') + '. Bed 1 is nearest the gate.'));
      this.stage.appendChild(cl);
      this.clueEls = cl.children;
      var wrap = el('div', { 'class': 'lg-grids' });
      this.cellEls = [];
      g.pairs.forEach(function (pr, q) {
        var a = pr[0], b = pr[1];
        var box = el('div', { 'class': 'lg', role: 'grid', 'aria-label': CAT[p.cats[a]] + ' and ' + CAT[p.cats[b]] });
        box.appendChild(el('div', { 'class': 'cap' }, CAT[p.cats[a]] + ' × ' + CAT[p.cats[b]]));
        box.appendChild(el('div', {}));
        for (var j = 0; j < m; j++) box.appendChild(el('div', { 'class': 'ch', 'aria-hidden': 'true' }, mod.label(p, b, j)));
        for (var i = 0; i < m; i++) {
          box.appendChild(el('div', { 'class': 'rh', 'aria-hidden': 'true' }, mod.label(p, a, i)));
          for (j = 0; j < m; j++) {
            var k = mod.idx(g, a, i, b, j);
            var c = el('button', { type: 'button', 'class': 'cell', role: 'gridcell', 'data-k': k, 'data-q': q, 'data-i': i, 'data-j': j, tabindex: q === 0 && i === 0 && j === 0 ? '0' : '-1' });
            self.cellEls[k] = c;
            box.appendChild(c);
          }
        }
        wrap.appendChild(box);
      });
      this.stage.appendChild(wrap);
      this.stage.appendChild(el('p', { 'class': 'howto' }, 'Tap a square once for ✕ (no), twice for ● (yes), a third time to clear. Keyboard: arrows move inside a grid, <kbd>Tab</kbd> jumps to the next grid, <kbd>Y</kbd> yes, <kbd>N</kbd> no, <kbd>Backspace</kbd> clear.'));
      function cycle(k) {
        var v = [2, 1, 0][self.user[k]];
        self.change(function () { self.user[k] = v; if (v === 1 && self.prefs.autox) self.autoCross(k); });
      }
      wrap.addEventListener('click', function (ev) { var t = ev.target.closest('.cell'); if (t) cycle(+t.getAttribute('data-k')); });
      wrap.addEventListener('keydown', function (ev) {
        var t = ev.target.closest('.cell');
        if (!t) return;
        var q = +t.getAttribute('data-q'), i = +t.getAttribute('data-i'), j = +t.getAttribute('data-j'), k = +t.getAttribute('data-k');
        var di = 0, dj = 0;
        if (ev.key === 'ArrowUp') di = -1; else if (ev.key === 'ArrowDown') di = 1; else if (ev.key === 'ArrowLeft') dj = -1; else if (ev.key === 'ArrowRight') dj = 1;
        if (di || dj) {
          ev.preventDefault();
          var ni = Math.min(m - 1, Math.max(0, i + di)), nj = Math.min(m - 1, Math.max(0, j + dj));
          var pr = g.pairs[q], nk = mod.idx(g, pr[0], ni, pr[1], nj);
          Array.prototype.forEach.call(t.parentNode.querySelectorAll('.cell'), function (c) { c.tabIndex = -1; });
          self.cellEls[nk].tabIndex = 0; self.cellEls[nk].focus();
          return;
        }
        var v = null;
        if (ev.key === ' ' || ev.key === 'Enter') { ev.preventDefault(); cycle(k); return; }
        if (ev.key === 'y' || ev.key === 'Y') v = 1; else if (ev.key === 'n' || ev.key === 'N' || ev.key === 'x' || ev.key === 'X') v = 2; else if (ev.key === 'Backspace' || ev.key === 'Delete') v = 0;
        if (v !== null) { ev.preventDefault(); self.change(function () { self.user[k] = v; if (v === 1 && self.prefs.autox) self.autoCross(k); }); }
      });
      // every grid keeps one tabbable square
      Array.prototype.forEach.call(wrap.querySelectorAll('.lg'), function (box) { box.querySelector('.cell').tabIndex = 0; });
    },
    update: function () {
      var self = this, p = this.p, mod = this.mod, g = mod.geom(p), u = this.user, hl = this.markHints();
      this.cellEls.forEach(function (c, k) {
        var v = u[k], ci = mod.cellInfo(g, k);
        c.textContent = v === 1 ? '●' : v === 2 ? '✕' : '';
        c.className = 'cell' + (v === 1 ? ' yes' : v === 2 ? ' no' : '') + (hl.focus[k] ? ' hl-focus' : '') + (hl.target[k] ? ' hl-target' : '');
        c.setAttribute('aria-label', mod.label(p, ci.a, ci.i) + ' and ' + mod.label(p, ci.b, ci.j) + ': ' + (v === 1 ? 'yes' : v === 2 ? 'no' : 'open'));
      });
      var cited = {};
      if (this.hint && /^Clue (\d+)/.test(this.hint.text || '')) cited[+/^Clue (\d+)/.exec(this.hint.text)[1] - 1] = 1;
      Array.prototype.forEach.call(this.clueEls, function (li, i) { li.className = cited[i] ? 'hl' : ''; });
      var yes = 0;
      for (var k = 0; k < u.length; k++) if (u[k] === 1 && mod.cellInfo(g, k).a === 0) yes++;
      if (!this.done) this.statusEl.textContent = yes + ' of ' + (g.m * (g.C - 1)) + ' matches for the gardeners found';
      void self;
    }
  };

  // ======================= garden, home, archive, printable =======================
  function renderGarden(box) {
    var gd = garden(), month = new Date().getUTCMonth();
    var count = {};
    gd.plants.forEach(function (p) { count[p.type] = (count[p.type] || 0) + 1; });
    box.innerHTML = draw.gardenSVG(gd.plants, month, 'Your garden with ' + core.plural(gd.plants.length, 'plant'));
    var meta = box.parentNode.querySelector('[data-garden-meta]');
    if (meta) meta.innerHTML = gd.plants.length ? '<span>' + core.plural(gd.plants.length, 'plant') + ': ' + TYPES.filter(function (t) { return count[t]; }).map(function (t) { return count[t] + ' from ' + META[t].name; }).join(', ') + '.</span><span>Season: ' + draw.season(month) + ' (it changes with the calendar).</span>'
      : '<span>Solve any puzzle and its plant appears here. Nothing ever wilts.</span>';
  }
  function bindGardenTools(root) {
    var exp = root.querySelector('[data-export]'), imp = root.querySelector('[data-import]');
    if (exp) exp.addEventListener('click', function () {
      var blob = new Blob([JSON.stringify(garden(), null, 1)], { type: 'application/json' });
      var a = document.createElement('a');
      a.href = URL.createObjectURL(blob); a.download = 'daily-logic-garden-' + today() + '.json';
      document.body.appendChild(a); a.click(); a.remove();
    });
    if (imp) imp.addEventListener('change', function () {
      var f = imp.files && imp.files[0], out = root.querySelector('[data-import-msg]');
      if (!f) return;
      f.text().then(function (txt) {
        var data = JSON.parse(txt);
        if (!data || !Array.isArray(data.plants)) throw new Error('format');
        var g = garden(), have = solvedSet(), added = 0;
        data.plants.forEach(function (p) {
          if (TYPES.indexOf(p.type) < 0 || core.LEVELS.indexOf(p.level) < 0 || !core.parseKey(p.key)) return;
          if (have[p.type + '|' + p.level + '|' + p.key]) return;
          g.plants.push({ type: p.type, level: p.level, key: p.key, hints: +p.hints || 0, secs: +p.secs || 0, at: String(p.at || '').slice(0, 10) });
          added++;
        });
        store.set(GARDEN_KEY, g);
        if (out) out.textContent = 'Imported ' + core.plural(added, 'plant') + '.';
        root.querySelectorAll('[data-garden]').forEach(renderGarden);
      }).catch(function () { if (out) out.textContent = 'That file is not a Daily Logic Garden export.'; });
    });
  }
  function renderToday(box) {
    var done = solvedSet(), key = today();
    box.querySelectorAll('[data-today]').forEach(function (card) {
      var t = card.getAttribute('data-today');
      card.querySelectorAll('[data-level]').forEach(function (a) {
        var ok = done[t + '|' + a.getAttribute('data-level') + '|' + key];
        a.classList.toggle('done', !!ok);
        if (ok) a.setAttribute('aria-label', a.textContent + ', solved today');
      });
    });
    var d = box.querySelector('[data-today-date]');
    if (d) d.textContent = longDate(key) + ' (UTC)';
  }
  function renderArchive(box) {
    var done = solvedSet(), t = today(), html = '';
    for (var i = 0; i < ARCHIVE_DAYS; i++) {
      var key = core.addDays(t, -i);
      html += '<section class="day"><h3>' + (i === 0 ? 'Today – ' : '') + longDate(key) + '</h3><ul>';
      TYPES.forEach(function (ty) {
        html += '<li>' + META[ty].name + '<span>' + core.LEVELS.map(function (l) {
          var ok = done[ty + '|' + l + '|' + key];
          return '<a href="' + META[ty].path + '?date=' + key + '&amp;level=' + l + '" class="' + (ok ? 'done' : '') + '" aria-label="' + META[ty].name + ' ' + core.LEVEL_NAMES[l] + ', ' + key + (ok ? ', solved' : '') + '">' + core.LEVEL_NAMES[l].charAt(0) + '</a>';
        }).join('') + '</span></li>';
      });
      html += '</ul></section>';
    }
    box.innerHTML = html;
    var total = 0;
    garden().plants.forEach(function (p) { if (p.key >= core.addDays(t, -(ARCHIVE_DAYS - 1))) total++; });
    var sum = document.querySelector('[data-archive-sum]');
    if (sum) sum.textContent = 'You have solved ' + total + ' of the ' + ARCHIVE_DAYS * 15 + ' puzzles in the last ' + ARCHIVE_DAYS + ' days on this device.';
  }
  function bindPrintable(form) {
    var start = form.querySelector('[name=start]'), out = form.querySelector('[data-pack-msg]');
    var t = today(), min = core.addDays(t, -(ARCHIVE_DAYS - 1));
    start.min = min; start.max = t; start.value = core.addDays(t, -6);
    form.addEventListener('submit', function (ev) {
      ev.preventDefault();
      var from = validDate(start.value) || core.addDays(t, -6);
      var level = form.querySelector('[name=level]').value;
      var types = TYPES.filter(function (ty) { var b = form.querySelector('[name=t-' + ty + ']'); return b && b.checked; });
      if (!types.length) { out.textContent = 'Pick at least one puzzle type.'; return; }
      var root = document.querySelector('.print-root'), html = '', days = 0, keys = [];
      for (var i = 0; i < 7; i++) { var key = core.addDays(from, i); if (key > t) break; keys.push(key); }
      out.textContent = 'Growing ' + keys.length * types.length + ' puzzles…';
      setTimeout(function () {
        keys.forEach(function (key) {
          types.forEach(function (ty) {
            var p = D[ty].generate(key, level);
            html += draw.printSheet(p, D, META[ty].name + ' – ' + core.LEVEL_NAMES[level] + ' – ' + longDate(key));
          });
          days++;
        });
        root.innerHTML = html;
        var prev = document.querySelector('[data-pack-preview]');
        if (prev) prev.innerHTML = '<p>Ready: ' + core.plural(keys.length * types.length, 'puzzle') + ' from ' + longDate(keys[0]) + ' to ' + longDate(keys[keys.length - 1]) + ', one per page. The pack opens in your browser’s print dialog; choose “Save as PDF” there to keep a file.</p>';
        out.textContent = 'Pack ready – ' + core.plural(keys.length * types.length, 'page') + '.';
        form.setAttribute('data-ready', String(keys.length * types.length));
        window.print();
      }, 30);
    });
  }

  function init() {
    Array.prototype.forEach.call(document.querySelectorAll('[data-game]'), function (r) { r.__game = new Game(r); });
    Array.prototype.forEach.call(document.querySelectorAll('[data-garden]'), renderGarden);
    Array.prototype.forEach.call(document.querySelectorAll('[data-garden-tools]'), bindGardenTools);
    Array.prototype.forEach.call(document.querySelectorAll('[data-today-box]'), renderToday);
    Array.prototype.forEach.call(document.querySelectorAll('[data-archive]'), renderArchive);
    Array.prototype.forEach.call(document.querySelectorAll('form[data-printable]'), bindPrintable);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
