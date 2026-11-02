/*
 * Who Planted What – a small logic-grid puzzle. Each gardener planted one crop, in one bed,
 * on one day; the clues pin down the only arrangement. Grids hold 0 = open, 1 = yes, 2 = no.
 */
(function (root, factory) {
  var core = typeof module !== 'undefined' && module.exports ? require('./core.js') : root.DLG.core;
  var api = factory(core);
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.DLG.whoplanted = api;
})(this, function (core) {
  'use strict';
  var NAMES = ['Ada', 'Bram', 'Cleo', 'Dev', 'Elif', 'Finn', 'Greta', 'Hugo', 'Ines', 'Jun', 'Kofi', 'Lena', 'Milo', 'Nora', 'Omar', 'Pia', 'Rosa', 'Sami', 'Tove', 'Wren'];
  var PLANTS = ['tulips', 'basil', 'kale', 'peas', 'dahlias', 'tomatoes', 'lavender', 'chives', 'sunflowers', 'radishes', 'marigolds', 'beans'];
  var DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  var CFG = {
    sprout: { cats: ['who', 'plant', 'bed'], weights: { is: 2, not: 3, either: 1, before: 1 } },
    bloom: { cats: ['who', 'plant', 'bed', 'day'], weights: { is: 1, not: 3, either: 2, before: 2, next: 1, after: 1 } },
    grove: { cats: ['who', 'plant', 'bed', 'day'], weights: { not: 3, either: 2, before: 2, next: 2, after: 2 } }
  };
  var TIERS = { sprout: 1, bloom: 2, grove: 3 };
  var M = 4;
  var ORDERED = { bed: true, day: true };

  function cap(t) { return t.charAt(0).toUpperCase() + t.slice(1); }

  function geometry(p) {
    var C = p.cats.length, pairs = [], pairIdx = {};
    for (var a = 0; a < C; a++) for (var b = a + 1; b < C; b++) { pairIdx[a + ',' + b] = pairs.length; pairs.push([a, b]); }
    return { C: C, m: p.m, pairs: pairs, pairIdx: pairIdx, size: pairs.length * p.m * p.m, p: p };
  }
  function idx(g, a, i, b, j) {
    if (a > b) { var t = a; a = b; b = t; t = i; i = j; j = t; }
    return g.pairIdx[a + ',' + b] * g.m * g.m + i * g.m + j;
  }
  function cellInfo(g, k) {
    var mm = g.m * g.m, pr = g.pairs[Math.floor(k / mm)], r = k % mm;
    return { a: pr[0], i: Math.floor(r / g.m), b: pr[1], j: r % g.m };
  }

  // ---- wording ----
  function label(p, c, j) {
    var kind = p.cats[c], it = p.items[c][j];
    if (kind === 'who') return it;
    if (kind === 'plant') return cap(it);
    if (kind === 'bed') return 'Bed ' + it;
    return it;
  }
  function phrase(p, c, j) { return p.cats[c] === 'plant' ? 'the ' + p.items[c][j] : label(p, c, j); }
  function subj(p, d) {
    var kind = p.cats[d[0]], it = p.items[d[0]][d[1]];
    if (kind === 'who') return it;
    if (kind === 'plant') return 'the person who planted the ' + it;
    if (kind === 'bed') return 'the gardener in Bed ' + it;
    return 'the person who planted on ' + it;
  }
  function pred(p, d, neg) {
    var kind = p.cats[d[0]], it = p.items[d[0]][d[1]];
    if (kind === 'who') return (neg ? 'is not ' : 'is ') + it;
    if (kind === 'plant') return (neg ? 'did not plant the ' : 'planted the ') + it;
    if (kind === 'bed') return (neg ? 'did not work in Bed ' : 'worked in Bed ') + it;
    return (neg ? 'did not plant on ' : 'planted on ') + it;
  }
  function eitherPred(p, alts) {
    var kind = p.cats[alts[0][0]], a = p.items[alts[0][0]][alts[0][1]], b = p.items[alts[1][0]][alts[1][1]];
    if (kind === 'plant') return 'planted either the ' + a + ' or the ' + b;
    if (kind === 'bed') return 'worked in either Bed ' + a + ' or Bed ' + b;
    if (kind === 'day') return 'planted on either ' + a + ' or ' + b;
    return 'is either ' + a + ' or ' + b;
  }
  function clueText(p, cl) {
    var x = cl.x, y = cl.y;
    if (cl.type === 'is' || cl.type === 'not') {
      if (p.cats[y[0]] === 'who' || (p.cats[x[0]] !== 'who' && x[0] > y[0])) { var t = x; x = y; y = t; }
      return cap(subj(p, x)) + ' ' + pred(p, y, cl.type === 'not') + '.';
    }
    if (cl.type === 'either') return cap(subj(p, x)) + ' ' + eitherPred(p, cl.alts) + '.';
    var O = p.cats[cl.o];
    if (cl.type === 'before') return O === 'bed' ? cap(subj(p, x)) + ' worked in a bed closer to the gate than ' + subj(p, y) + ' did.'
      : cap(subj(p, x)) + ' planted earlier in the week than ' + subj(p, y) + ' did.';
    if (cl.type === 'next') return O === 'bed' ? cap(subj(p, x)) + ' and ' + subj(p, y) + ' worked in neighboring beds.'
      : cap(subj(p, x)) + ' and ' + subj(p, y) + ' planted on consecutive days.';
    return O === 'bed' ? cap(subj(p, y)) + ' worked in the bed right after ' + (p.cats[x[0]] === 'who' ? p.items[x[0]][x[1]] + '’s' : 'that of ' + subj(p, x)) + ', one step farther from the gate.'
      : cap(subj(p, y)) + ' planted the day after ' + subj(p, x) + ' did.';
  }

  // ---- truth on a full assignment: attr[c][e] = item ----
  function entityOf(attr, d) { return attr[d[0]].indexOf(d[1]); }
  function holds(attr, cl) {
    if (cl.type === 'is') return entityOf(attr, cl.x) === entityOf(attr, cl.y);
    if (cl.type === 'not') return entityOf(attr, cl.x) !== entityOf(attr, cl.y);
    var ex = entityOf(attr, cl.x);
    if (cl.type === 'either') return cl.alts.some(function (a) { return attr[a[0]][ex] === a[1]; });
    var ey = entityOf(attr, cl.y);
    if (ex === ey) return false;
    var px = attr[cl.o][ex], py = attr[cl.o][ey];
    if (cl.type === 'before') return px < py;
    if (cl.type === 'next') return Math.abs(px - py) === 1;
    return py === px + 1;
  }
  function perms(m) {
    var out = [];
    (function rec(a, used) {
      if (a.length === m) { out.push(a.slice()); return; }
      for (var i = 0; i < m; i++) if (!used[i]) { used[i] = 1; a.push(i); rec(a, used); a.pop(); used[i] = 0; }
    })([], {});
    return out;
  }
  function countSolutions(p, limit) {
    var P = perms(p.m), C = p.cats.length, attr = [P[0]], count = 0;
    limit = limit || 2;
    (function rec(c) {
      if (count >= limit) return;
      if (c === C) { if (p.clues.every(function (cl) { return holds(attr, cl); })) count++; return; }
      for (var i = 0; i < P.length && count < limit; i++) { attr[c] = P[i]; rec(c + 1); }
    })(1);
    return count;
  }

  // ---- human-style solver ----
  function clueNo(p, cl) { return 'Clue ' + (p.clues.indexOf(cl) + 1); }
  function step(tier, tech, set, focus, text) { return { tier: tier, tech: tech, set: set, focus: focus, mark: set.map(function (q) { return q[0]; }), text: text }; }

  function direct(g, s) {
    var p = g.p;
    for (var c = 0; c < p.clues.length; c++) {
      var cl = p.clues[c], k;
      if (cl.type === 'is') { k = idx(g, cl.x[0], cl.x[1], cl.y[0], cl.y[1]); if (s[k] === 0) return step(1, 'clue', [[k, 1]], [k], clueNo(p, cl) + ' says it directly: ' + clueText(p, cl) + ' Mark that square ●.'); }
      if (cl.type === 'not') { k = idx(g, cl.x[0], cl.x[1], cl.y[0], cl.y[1]); if (s[k] === 0) return step(1, 'clue', [[k, 2]], [k], clueNo(p, cl) + ' says it directly: ' + clueText(p, cl) + ' Mark that square ✕.'); }
      if (cl.type === 'either') {
        var d = cl.alts[0][0], set = [];
        for (var j = 0; j < p.m; j++) if (j !== cl.alts[0][1] && j !== cl.alts[1][1]) { k = idx(g, cl.x[0], cl.x[1], d, j); if (s[k] === 0) set.push([k, 2]); }
        if (set.length) return step(1, 'clue', set, set.map(function (q) { return q[0]; }), clueNo(p, cl) + ' leaves ' + subj(p, cl.x) + ' only two options (' + eitherPred(p, cl.alts).replace(/^(planted on|planted|worked in|is) either /, '') + '), so every other ' + catWord(p, d) + ' is ruled out.');
      }
      if (cl.x && cl.y && cl.x[0] !== cl.y[0] && cl.type !== 'is' && cl.type !== 'not' && cl.type !== 'either') {
        k = idx(g, cl.x[0], cl.x[1], cl.y[0], cl.y[1]);
        if (s[k] === 0) return step(1, 'clue', [[k, 2]], [k], clueNo(p, cl) + ' compares ' + subj(p, cl.x) + ' with ' + subj(p, cl.y) + ', so they are two different people.');
      }
    }
    return null;
  }
  function elim(g, s) {
    var p = g.p, m = g.m;
    for (var q = 0; q < g.pairs.length; q++) {
      var a = g.pairs[q][0], b = g.pairs[q][1];
      for (var dir = 0; dir < 2; dir++) {
        for (var i = 0; i < m; i++) {
          var line = [];
          for (var j = 0; j < m; j++) line.push(dir === 0 ? idx(g, a, i, b, j) : idx(g, a, j, b, i));
          var yes = line.filter(function (k) { return s[k] === 1; }), open = line.filter(function (k) { return s[k] === 0; });
          var owner = dir === 0 ? [a, i] : [b, i], otherCat = dir === 0 ? b : a;
          if (yes.length === 1 && open.length) {
            var ci = cellInfo(g, yes[0]), partner = ci.a === owner[0] ? [ci.b, ci.j] : [ci.a, ci.i];
            return step(1, 'one-each', open.map(function (k) { return [k, 2]; }), line, cap(subj(p, owner)) + ' ' + pred(p, partner) + ', so no other ' + catWord(p, otherCat) + ' is possible for ' + subj(p, owner) + '.');
          }
          if (!yes.length && open.length === 1) {
            var c2 = cellInfo(g, open[0]), part = c2.a === owner[0] ? [c2.b, c2.j] : [c2.a, c2.i];
            return step(1, 'one-each', [[open[0], 1]], line, 'Every other ' + catWord(p, otherCat) + ' is ruled out for ' + subj(p, owner) + ', so ' + subj(p, owner) + ' ' + pred(p, part) + '.');
          }
        }
      }
    }
    return null;
  }
  function catWord(p, c) { return { who: 'gardener', plant: 'crop', bed: 'bed', day: 'day' }[p.cats[c]]; }
  function transfer(g, s) {
    var p = g.p, m = g.m, C = g.C;
    for (var a = 0; a < C; a++) for (var b = 0; b < C; b++) {
      if (a === b) continue;
      for (var i = 0; i < m; i++) for (var j = 0; j < m; j++) {
        if (s[idx(g, a, i, b, j)] !== 1) continue;
        for (var c = 0; c < C; c++) {
          if (c === a || c === b) continue;
          for (var k = 0; k < m; k++) {
            var ka = idx(g, a, i, c, k), kb = idx(g, b, j, c, k);
            if (s[ka] === 0 && s[kb] !== 0) {
              var X = [a, i], Y = [b, j], Z = [c, k];
              return step(1, 'transfer', [[ka, s[kb]]], [idx(g, a, i, b, j), kb, ka],
                cap(subj(p, X)) + ' ' + pred(p, Y) + ', and ' + subj(p, Y) + ' ' + pred(p, Z, s[kb] === 2) + ', so ' + subj(p, X) + ' ' + pred(p, Z, s[kb] === 2) + ' either.'.replace(' either.', s[kb] === 2 ? ' either.' : ' too.'));
            }
          }
        }
      }
    }
    return null;
  }
  function either(g, s) {
    var p = g.p;
    for (var c = 0; c < p.clues.length; c++) {
      var cl = p.clues[c];
      if (cl.type !== 'either') continue;
      var k0 = idx(g, cl.x[0], cl.x[1], cl.alts[0][0], cl.alts[0][1]), k1 = idx(g, cl.x[0], cl.x[1], cl.alts[1][0], cl.alts[1][1]);
      if (s[k0] === 2 && s[k1] === 0) return step(2, 'either', [[k1, 1]], [k0, k1], clueNo(p, cl) + ': ' + subj(p, cl.x) + ' ' + eitherPred(p, cl.alts) + '; the first option is ruled out, so ' + subj(p, cl.x) + ' ' + pred(p, cl.alts[1]) + '.');
      if (s[k1] === 2 && s[k0] === 0) return step(2, 'either', [[k0, 1]], [k0, k1], clueNo(p, cl) + ': ' + subj(p, cl.x) + ' ' + eitherPred(p, cl.alts) + '; the second option is ruled out, so ' + subj(p, cl.x) + ' ' + pred(p, cl.alts[0]) + '.');
    }
    return null;
  }
  function bounds(g, s) {
    var p = g.p, m = g.m;
    for (var c = 0; c < p.clues.length; c++) {
      var cl = p.clues[c];
      if (cl.type !== 'before' && cl.type !== 'after') continue;
      var kx = idx(g, cl.x[0], cl.x[1], cl.o, m - 1), ky = idx(g, cl.y[0], cl.y[1], cl.o, 0);
      var word = p.cats[cl.o] === 'bed' ? ['in Bed ' + p.items[cl.o][m - 1] + ', the bed farthest from the gate', 'in Bed 1, the bed nearest the gate'] : ['on ' + p.items[cl.o][m - 1] + ', the last day', 'on ' + p.items[cl.o][0] + ', the first day'];
      if (s[kx] === 0) return step(2, 'ends', [[kx, 2]], [kx], clueNo(p, cl) + ' puts someone after ' + subj(p, cl.x) + ', so ' + subj(p, cl.x) + ' can’t be ' + word[0] + '.');
      if (s[ky] === 0) return step(2, 'ends', [[ky, 2]], [ky], clueNo(p, cl) + ' puts someone before ' + subj(p, cl.y) + ', so ' + subj(p, cl.y) + ' can’t be ' + word[1] + '.');
    }
    return null;
  }
  function possTransfer(g, s) {
    var p = g.p, m = g.m, C = g.C;
    for (var a = 0; a < C; a++) for (var i = 0; i < m; i++) for (var b = 0; b < C; b++) {
      if (b === a) continue;
      var B = [];
      for (var j = 0; j < m; j++) if (s[idx(g, a, i, b, j)] !== 2) B.push(j);
      if (B.length < 2 || B.length > 3) continue;
      for (var c = 0; c < C; c++) {
        if (c === a || c === b) continue;
        for (var k = 0; k < m; k++) {
          var t = idx(g, a, i, c, k);
          if (s[t] !== 0) continue;
          if (B.every(function (jj) { return s[idx(g, b, jj, c, k)] === 2; })) {
            var opts = core.listJoin(B.map(function (jj) { return label(p, b, jj); })).replace(/ and ([^,]*)$/, ' or $1');
            return step(2, 'either-way', [[t, 2]], [t].concat(B.map(function (jj) { return idx(g, b, jj, c, k); })),
              'For ' + subj(p, [a, i]) + ' the ' + catWord(p, b) + ' can only be ' + opts + ', and none of ' + (B.length === 2 ? 'those two' : 'those') + ' goes with ' + phrase(p, c, k) + ', so ' + subj(p, [a, i]) + ' ' + pred(p, [c, k], true) + '.');
          }
        }
      }
    }
    return null;
  }
  function at(p, o, q) { return (p.cats[o] === 'bed' ? 'in Bed ' : 'on ') + p.items[o][q]; }
  function positions(g, s, d, o) {
    var out = [];
    for (var q = 0; q < g.m; q++) if (s[idx(g, d[0], d[1], o, q)] !== 2) out.push(q);
    return out;
  }
  function rel(type, a, b) { return type === 'before' ? a < b : type === 'next' ? Math.abs(a - b) === 1 : b === a + 1; }
  function orderFit(g, s) {
    var p = g.p;
    for (var c = 0; c < p.clues.length; c++) {
      var cl = p.clues[c];
      if (cl.type !== 'before' && cl.type !== 'next' && cl.type !== 'after') continue;
      var px = positions(g, s, cl.x, cl.o), py = positions(g, s, cl.y, cl.o);
      var badX = px.filter(function (a) { return !py.some(function (b) { return a !== b && rel(cl.type, a, b); }); });
      var badY = py.filter(function (b) { return !px.some(function (a) { return a !== b && rel(cl.type, a, b); }); });
      var who = badX.length ? cl.x : cl.y, bad = badX.length ? badX : badY, other = badX.length ? py : px;
      if (!bad.length) continue;
      var set = bad.map(function (q) { return [idx(g, who[0], who[1], cl.o, q), 2]; });
      var lbl = function (q) { return label(p, cl.o, q); };
      var otherWhere = (p.cats[cl.o] === 'bed' ? 'in ' : 'on ') + core.listJoin(other.map(lbl)).replace(/ and ([^,]*)$/, ' or $1');
      return step(3, 'fit', set, set.map(function (q) { return q[0]; }).concat(other.map(function (q) { return idx(g, (who === cl.x ? cl.y : cl.x)[0], (who === cl.x ? cl.y : cl.x)[1], cl.o, q); })),
        clueNo(p, cl) + ' (' + clueText(p, cl).replace(/\.$/, '') + ') can only fit if ' + subj(p, who === cl.x ? cl.y : cl.x) + ' is ' + otherWhere + ', which rules out ' + core.listJoin(bad.map(lbl)) + ' for ' + subj(p, who) + '.');
    }
    return null;
  }

  var TECHNIQUES = [direct, elim, transfer, either, bounds, possTransfer, orderFit];
  var TECH_TIER = [1, 1, 1, 2, 2, 2, 3];
  function nextStep(g, s, maxTier) {
    for (var i = 0; i < TECHNIQUES.length; i++) {
      if (TECH_TIER[i] > maxTier) continue;
      var st = TECHNIQUES[i](g, s);
      if (st) return st;
    }
    return null;
  }
  function solveLogic(g, start, maxTier) {
    var s = Int8Array.from(start), used = 0, steps = 0;
    for (;;) {
      var st = nextStep(g, s, maxTier);
      if (!st) break;
      st.set.forEach(function (q) { s[q[0]] = q[1]; });
      used = Math.max(used, st.tier); steps++;
      if (steps > 2000) break;
    }
    return { solved: !s.some(function (v) { return v === 0; }), state: s, maxTier: used, steps: steps };
  }

  function solutionGrid(g, attr) {
    var s = new Int8Array(g.size);
    for (var k = 0; k < g.size; k++) {
      var ci = cellInfo(g, k), e = attr[ci.a].indexOf(ci.i);
      s[k] = attr[ci.b][e] === ci.j ? 1 : 2;
    }
    return s;
  }

  function cluePool(p, attr, R) {
    var C = p.cats.length, m = p.m, pool = { is: [], not: [], either: [], before: [], next: [], after: [] };
    var descs = [];
    for (var c = 0; c < C; c++) for (var j = 0; j < m; j++) descs.push([c, j]);
    descs.forEach(function (x) {
      descs.forEach(function (y) {
        if (x[0] >= y[0]) return;
        var same = entityOf(attr, x) === entityOf(attr, y);
        (same ? pool.is : pool.not).push({ type: same ? 'is' : 'not', x: x, y: y });
      });
      for (var d = 0; d < C; d++) {
        if (d === x[0] || p.cats[d] === 'who') continue;
        var e = entityOf(attr, x), t = attr[d][e];
        var decoys = [];
        for (var j2 = 0; j2 < m; j2++) if (j2 !== t) decoys.push(j2);
        var dec = R.pick(decoys), alts = t < dec ? [[d, t], [d, dec]] : [[d, dec], [d, t]];
        pool.either.push({ type: 'either', x: x, alts: alts });
      }
    });
    for (var o = 0; o < C; o++) {
      if (!ORDERED[p.cats[o]]) continue;
      descs.forEach(function (x) {
        descs.forEach(function (y) {
          if (x[0] === o || y[0] === o) return;
          var ex = entityOf(attr, x), ey = entityOf(attr, y);
          if (ex === ey) return;
          var px = attr[o][ex], py = attr[o][ey];
          if (px < py) pool.before.push({ type: 'before', x: x, y: y, o: o });
          if (Math.abs(px - py) === 1 && x[0] <= y[0] && (x[0] < y[0] || x[1] < y[1])) pool.next.push({ type: 'next', x: x, y: y, o: o });
          if (py === px + 1) pool.after.push({ type: 'after', x: x, y: y, o: o });
        });
      });
    }
    return pool;
  }

  function generate(key, level, opts) {
    level = level in CFG ? level : 'sprout';
    var cfg = CFG[level], target = TIERS[level];
    var R = core.rng(core.seedFor('whoplanted', level, key));
    var maxAttempts = (opts && opts.maxAttempts) || 300;
    for (var attempt = 1; attempt <= maxAttempts; attempt++) {
      var p = { type: 'whoplanted', key: key, level: level, m: M, cats: cfg.cats.slice(), items: [], clues: [] };
      p.cats.forEach(function (kind) {
        if (kind === 'who') p.items.push(R.shuffle(NAMES.slice()).slice(0, M).sort());
        else if (kind === 'plant') p.items.push(R.shuffle(PLANTS.slice()).slice(0, M).sort());
        else if (kind === 'bed') p.items.push(['1', '2', '3', '4'].slice(0, M));
        else p.items.push(DAYS.slice(0, M));
      });
      var attr = [];
      p.cats.forEach(function (kind, c) { attr.push(c === 0 ? [0, 1, 2, 3].slice(0, M) : R.shuffle([0, 1, 2, 3].slice(0, M))); });
      var pool = cluePool(p, attr, R), types = [];
      Object.keys(cfg.weights).forEach(function (t) { for (var w = 0; w < cfg.weights[t]; w++) types.push(t); });
      var g = geometry(p), solved = false;
      for (var guard = 0; guard < 60 && !solved; guard++) {
        var t = R.pick(types);
        if (!pool[t].length) continue;
        var cl = pool[t].splice(R.int(pool[t].length), 1)[0];
        p.clues.push(cl);
        solved = solveLogic(g, new Int8Array(g.size), target).solved;
      }
      if (!solved) continue;
      for (var i = p.clues.length - 1; i >= 0; i--) {
        var keep = p.clues.splice(i, 1)[0];
        if (!solveLogic(g, new Int8Array(g.size), target).solved) p.clues.splice(i, 0, keep);
      }
      var res = solveLogic(g, new Int8Array(g.size), target);
      if (!res.solved || res.maxTier !== target) continue;
      if (target > 1 && solveLogic(g, new Int8Array(g.size), target - 1).solved) continue;
      if (countSolutions(p, 2) !== 1) continue;
      p.clues = R.shuffle(p.clues);
      p.attr = attr;
      p.solution = Array.from(solutionGrid(g, attr));
      p.attempts = attempt;
      p.g = g;
      p.clueTexts = p.clues.map(function (c) { return clueText(p, c); });
      return p;
    }
    throw new Error('whoplanted: no puzzle for ' + key + ' ' + level);
  }
  function geom(p) { if (!p.g) p.g = geometry(p); return p.g; }

  function hint(p, user) {
    var g = geom(p), sol = p.solution;
    for (var k = 0; k < user.length; k++) {
      if (user[k] && user[k] !== sol[k]) {
        var ci = cellInfo(g, k);
        return { kind: 'mistake', cells: [k], focus: [k], set: [], text: 'The ' + (user[k] === 1 ? '●' : '✕') + ' for ' + label(p, ci.a, ci.i) + ' / ' + label(p, ci.b, ci.j) + ' doesn’t match the only solution. Clear it and ask again.' };
      }
    }
    if (isSolved(p, user)) return { kind: 'done', text: 'Every gardener is matched – the puzzle is solved.', cells: [], focus: [], set: [] };
    var st = nextStep(g, Int8Array.from(user), 3);
    if (!st) {
      for (k = 0; k < sol.length; k++) if (sol[k] === 1 && user[k] !== 1) break;
      var c3 = cellInfo(g, k);
      return { kind: 'reveal', cells: [k], focus: [k], set: [[k, 1]], text: 'No single-step deduction is left from here, so here is one match: ' + phrase(p, c3.a, c3.i) + ' goes with ' + phrase(p, c3.b, c3.j) + '.' };
    }
    return { kind: 'deduction', tech: st.tech, tier: st.tier, text: st.text, cells: st.mark, focus: st.focus, set: st.set };
  }
  function isSolved(p, user) {
    // solved when every square of the grids that involve the gardeners matches the solution
    var g = geom(p);
    for (var k = 0; k < p.solution.length; k++) {
      var ci = cellInfo(g, k);
      if (ci.a !== 0) continue;
      if ((user[k] === 1) !== (p.solution[k] === 1)) return false;
    }
    return true;
  }

  return { name: 'Who Planted What', CFG: CFG, TIERS: TIERS, generate: generate, geometry: geometry, geom: geom, idx: idx, cellInfo: cellInfo,
    label: label, clueText: clueText, solveLogic: solveLogic, countSolutions: countSolutions, hint: hint, isSolved: isSolved, nextStep: nextStep, holds: holds };
});
