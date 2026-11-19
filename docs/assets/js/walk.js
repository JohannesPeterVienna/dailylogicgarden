/* Daily Logic Garden – walkthrough (built 20261119a) */
(function () {
'use strict';
var D = window.DLG;
if (!D || !D.play || !D.tech) return;
var core = D.core, play = D.play, tech = D.tech, el = play.el;
var SITE = 'https://dailylogicgarden.com';
function text(s) { return document.createTextNode(s); }
function cleanDate(key) { return core.parseKey(key) && key >= play.LAUNCH && key <= play.today() ? key : null; }
function readAddress() {
var q = {}, out = {};
try { new URLSearchParams(location.search).forEach(function (v, k) { if (!(k in q)) q[k] = v; }); } catch (e) { /* no address values */ }
if (play.TYPES.indexOf(q.puzzle) >= 0) out.type = q.puzzle;
if (core.LEVELS.indexOf(q.level) >= 0) out.level = q.level;
if (cleanDate(q.date)) out.key = q.date;
if (/^\d{1,4}$/.test(q.step || '')) out.pos = +q.step;
if (typeof q.tech === 'string' && /^[a-z-]{2,20}$/.test(q.tech)) out.tech = q.tech;
return out;
}
function Walk(root) {
var self = this, a = readAddress(), t = play.today();
this.root = root;
this.type = a.type || 'flowerbeds';
this.level = a.level || 'sprout';
this.key = a.key || (core.addDays(t, -1) >= play.LAUNCH ? core.addDays(t, -1) : t);
this.pos = a.pos || 1;
this.wantTech = a.tech || null;
this.build();
this.load();
document.addEventListener('keydown', function (ev) {
if (!self.steps || ev.altKey || ev.ctrlKey || ev.metaKey) return;
var tag = (ev.target && ev.target.tagName) || '';
if (tag === 'INPUT' || tag === 'SELECT' || tag === 'TEXTAREA') return;
if (!ev.target || !ev.target.closest || !ev.target.closest('[data-walk]') || ev.target.closest('.cells, .lg-grids')) return;
if (ev.key === 'ArrowRight') self.go(self.pos + 1);
else if (ev.key === 'ArrowLeft') self.go(self.pos - 1);
else if (ev.key === 'Home') self.go(1);
else if (ev.key === 'End') self.go(self.steps.length + 1);
else return;
ev.preventDefault();
});
}
var W = Walk.prototype;
W.build = function () {
var self = this, r = this.root;
r.innerHTML = '';
var form = el('div', { 'class': 'walk-pick' });
var lp = el('label', { 'for': 'walk-puzzle' }, 'Puzzle ');
this.selType = el('select', { id: 'walk-puzzle' });
play.TYPES.forEach(function (t) { var o = el('option', { value: t }); o.appendChild(text(play.META[t].name)); self.selType.appendChild(o); });
lp.appendChild(this.selType);
var ld = el('label', { 'for': 'walk-date' }, 'Date (UTC) ');
this.inDate = el('input', { id: 'walk-date', type: 'date', min: play.LAUNCH, max: play.today() });
ld.appendChild(this.inDate);
this.lvl = el('div', { 'class': 'lvl', role: 'group', 'aria-label': 'Difficulty' });
core.LEVELS.forEach(function (l) {
var b = el('button', { type: 'button', 'data-level': l }, core.LEVEL_NAMES[l]);
b.addEventListener('click', function () { if (self.level !== l) { self.level = l; self.pos = 1; self.load(); } });
self.lvl.appendChild(b);
});
form.appendChild(lp); form.appendChild(ld); form.appendChild(this.lvl);
r.appendChild(form);
this.selType.addEventListener('change', function () { self.type = self.selType.value; self.pos = 1; self.load(); });
this.inDate.addEventListener('change', function () {
var k = cleanDate(self.inDate.value);
if (!k) { self.inDate.value = self.key; self.note.textContent = 'Choose a date from ' + play.longDate(play.LAUNCH) + ' to today.'; return; }
self.key = k; self.pos = 1; self.load();
});
this.note = el('p', { 'class': 'game-date', role: 'status' });
r.appendChild(this.note);
this.stage = el('div', { 'class': 'stage walk-stage' });
r.appendChild(this.stage);
this.statusEl = el('p', { 'class': 'status' });
r.appendChild(this.statusEl);
this.box = el('div', { 'class': 'hintbox walk-step', 'aria-live': 'polite' });
r.appendChild(this.box);
var nav = el('div', { 'class': 'controls walk-nav' });
this.bFirst = el('button', { type: 'button', 'class': 'btn ghost small' }, 'First');
this.bPrev = el('button', { type: 'button', 'class': 'btn ghost small' }, 'Back');
this.bNext = el('button', { type: 'button', 'class': 'btn' }, 'Next step');
this.bLast = el('button', { type: 'button', 'class': 'btn ghost small' }, 'Solved board');
[this.bFirst, this.bPrev, this.bNext, this.bLast].forEach(function (b) { nav.appendChild(b); });
this.bFirst.addEventListener('click', function () { self.go(1); });
this.bPrev.addEventListener('click', function () { self.go(self.pos - 1); });
this.bNext.addEventListener('click', function () { self.go(self.pos + 1); });
this.bLast.addEventListener('click', function () { self.go(self.steps.length + 1); });
r.appendChild(nav);
var out = el('div', { 'class': 'controls walk-out' });
this.bLink = el('button', { type: 'button', 'class': 'btn ghost small' }, 'Copy link to this step');
this.bCopy = el('button', { type: 'button', 'class': 'btn ghost small' }, 'Copy all steps');
this.bPrint = el('button', { type: 'button', 'class': 'btn ghost small' }, 'Print board and steps');
this.playLink = el('a', { 'class': 'btn ghost small', href: '/' }, 'Play this board');
[this.bLink, this.bCopy, this.bPrint, this.playLink].forEach(function (b) { out.appendChild(b); });
this.bLink.addEventListener('click', function () { self.copy(self.bLink, SITE + self.address()); });
this.bCopy.addEventListener('click', function () { self.copy(self.bCopy, self.listing()); });
this.bPrint.addEventListener('click', function () { window.print(); });
r.appendChild(out);
this.copyOut = el('textarea', { 'class': 'walk-copy', readonly: '', rows: '4', hidden: '', 'aria-label': 'Text to copy' });
r.appendChild(this.copyOut);
r.appendChild(el('h3', {}, 'All steps of this board'));
this.sum = el('p', { 'class': 'walk-sum' });
r.appendChild(this.sum);
this.list = el('ol', { 'class': 'walk-list' });
r.appendChild(this.list);
this.printRoot = document.querySelector('.print-root');
};
W.address = function () {
return '/walkthrough/?puzzle=' + this.type + '&level=' + this.level + '&date=' + this.key + '&step=' + this.pos;
};
W.listing = function () {
return 'Daily Logic Garden – ' + play.META[this.type].name + ' (' + core.LEVEL_NAMES[this.level] + '), ' + play.longDate(this.key) + '\n' +
tech.listing(this.type, this.level, this.key, this.steps) + '\n' + SITE + '/walkthrough/?puzzle=' + this.type + '&level=' + this.level + '&date=' + this.key;
};
W.copy = function (btn, txt) {
var self = this, label = btn.textContent;
function ok() { btn.textContent = 'Copied'; setTimeout(function () { btn.textContent = label; }, 2000); }
function manual() { self.copyOut.hidden = false; self.copyOut.value = txt; self.copyOut.focus(); self.copyOut.select(); }
if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(txt).then(ok, manual);
else manual();
};
W.load = function () {
var self = this;
this.steps = null;
this.selType.value = this.type;
this.inDate.value = this.key;
Array.prototype.forEach.call(this.lvl.children, function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-level') === self.level)); });
this.stage.innerHTML = '<p class="loading">Solving the ' + core.LEVEL_NAMES[this.level] + ' board…</p>';
this.box.innerHTML = ''; this.list.innerHTML = ''; this.sum.textContent = ''; this.statusEl.textContent = ''; this.copyOut.hidden = true;
setTimeout(function () {
var mod = D[self.type], p, steps;
try { p = mod.generate(self.key, self.level); steps = tech.path(self.type, mod, p); }
catch (e) { self.stage.innerHTML = '<p class="loading">This board could not be prepared. Please try another date or level.</p>'; return; }
self.p = p; self.steps = steps;
var g = Object.create(play.Game.prototype);
g.root = self.root; g.type = self.type; g.mod = mod; g.p = p; g.level = self.level; g.key = self.key;
g.prefs = { dots: true, autox: false }; g.done = false; g.history = []; g.hint = null;
g.stage = self.stage; g.statusEl = self.statusEl; g.hintEl = document.createElement('div');
g.user = tech.blank(self.type, mod, p);
g.change = g.setCell = g.save = g.checkSolved = g.undo = function () {};
g.pathStep = function () { return false; };
self.stage.innerHTML = '';
play.RENDER[self.type].build.call(g);
g.dragMark = function () { return false; };
Array.prototype.forEach.call(self.stage.querySelectorAll('.howto'), function (h) { h.parentNode.removeChild(h); });
self.g = g;
if (self.wantTech) {
for (var i = 0; i < steps.length; i++) if (steps[i].tech === self.wantTech) { self.pos = i + 1; break; }
self.wantTech = null;
}
self.renderList();
self.renderPrint();
self.go(self.pos, true);
}, 20);
};
W.renderList = function () {
var self = this, counts = tech.tally(this.type, this.steps), parts = [];
tech.ids(this.type).forEach(function (id, i) { if (counts[i]) parts.push(tech.get(self.type, id).name + ' × ' + counts[i]); });
this.sum.textContent = core.plural(this.steps.length, 'step') + ': ' + parts.join(', ') + '.';
this.steps.forEach(function (s, i) {
var li = el('li', {}), b = el('button', { type: 'button', 'class': 'linklike' }), t = tech.get(self.type, s.tech);
b.appendChild(el('b', {}, t ? t.name : 'Reveal'));
b.appendChild(text(' – ' + s.text));
b.addEventListener('click', function () { self.go(i + 1); self.stage.scrollIntoView({ block: 'nearest' }); });
li.appendChild(b);
self.list.appendChild(li);
});
};
W.renderPrint = function () {
if (!this.printRoot) return;
document.body.classList.add('has-print');
var title = play.META[this.type].name + ' – ' + core.LEVEL_NAMES[this.level] + ' – ' + play.longDate(this.key);
var ol = el('ol', { 'class': 'sheet-steps' });
var self = this;
this.steps.forEach(function (s) { var t = tech.get(self.type, s.tech), li = el('li', {}); li.appendChild(text('[' + (t ? t.name : 'Reveal') + '] ' + s.text)); ol.appendChild(li); });
this.printRoot.innerHTML = D.draw.printSheet(this.p, D, title);
var sheet = el('div', { 'class': 'print-sheet' });
sheet.appendChild(el('h2', {}, 'Solution path, ' + core.plural(this.steps.length, 'step')));
sheet.appendChild(ol);
this.printRoot.appendChild(sheet);
};
W.go = function (pos, first) {
if (!this.steps) return;
var n = this.steps.length;
pos = Math.max(1, Math.min(n + 1, pos | 0));
this.pos = pos;
var g = this.g, s = this.steps[pos - 1] || null;
g.user = tech.stateAt(this.type, g.mod, this.p, this.steps, pos - 1);
g.hint = s ? { kind: 'deduction', text: s.text, cells: s.cells, focus: s.focus, set: s.set } : null;
g.done = !s;
play.RENDER[this.type].update.call(g);
this.box.innerHTML = '';
if (s) {
var t = tech.get(this.type, s.tech), head = el('p', { 'class': 'walk-head' });
head.appendChild(text('Step ' + pos + ' of ' + n + ' · '));
if (t) { var a = el('a', { href: t.href }); a.appendChild(text(t.name)); head.appendChild(a); head.appendChild(text(' · ' + core.LEVEL_NAMES[core.LEVELS[t.tier - 1]] + ' technique')); }
var body = el('p', { style: 'margin:0' });
body.appendChild(text(s.text));
this.box.appendChild(head); this.box.appendChild(body);
} else {
this.box.appendChild(el('p', { 'class': 'walk-head' }, 'Solved'));
var done = el('p', { style: 'margin:0' });
done.appendChild(text('The board is complete after ' + core.plural(n, 'step') + (this.steps.some(function (x) { return x.tech === 'reveal'; }) ? '.' : '. Every step above was a deduction from the rules; nothing was guessed.')));
this.box.appendChild(done);
this.statusEl.textContent = '';
}
var act = document.activeElement, held = act === this.bFirst || act === this.bPrev || act === this.bNext || act === this.bLast;
this.bFirst.disabled = this.bPrev.disabled = pos === 1;
this.bNext.disabled = this.bLast.disabled = pos === n + 1;
if (held && act.disabled) (pos === 1 ? this.bNext : this.bPrev).focus();
Array.prototype.forEach.call(this.list.children, function (li, i) { if (i === pos - 1) li.setAttribute('aria-current', 'step'); else li.removeAttribute('aria-current'); });
var isToday = this.key === play.today();
this.note.textContent = (isToday ? 'Today’s board – stepping through it shows its solution · ' : '') + play.longDate(this.key) + ' (UTC)';
var inArchive = !!play.validDate(this.key);
this.playLink.hidden = !inArchive;
this.playLink.setAttribute('href', play.META[this.type].path + '?date=' + this.key + '&level=' + this.level);
if (!first || location.search) { try { history.replaceState(null, '', this.address()); } catch (e) { /* address stays as it was */ } }
};
function init() { Array.prototype.forEach.call(document.querySelectorAll('[data-walk]'), function (r) { r.__walk = new Walk(r); }); }
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();