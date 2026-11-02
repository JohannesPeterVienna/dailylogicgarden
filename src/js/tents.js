/*
 * Tents & Trees – every tree has its own tent on a side-adjacent square; tents never touch,
 * not even diagonally; the numbers give the tents in each row and column.
 * Cell state: 0 = open, 1 = tent, 2 = grass, 3 = tree (given).
 */
(function (root, factory) {
  var core = typeof module !== 'undefined' && module.exports ? require('./core.js') : root.DLG.core;
  var api = factory(core);
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.DLG.tents = api;
})(this, function (core) {
  'use strict';
  var SIZES = { sprout: 6, bloom: 7, grove: 8 };
  var TIERS = { sprout: 1, bloom: 2, grove: 3 };
  var cn = core.cellName;

  function geometry(n, trees, rowCount, colCount) {
    var isTree = new Array(n * n).fill(false);
    trees.forEach(function (t) { isTree[t] = true; });
    var orth = [], ring = [];
    for (var k = 0; k < n * n; k++) {
      var r = Math.floor(k / n), c = k % n, o = [], a = [];
      for (var dr = -1; dr <= 1; dr++) for (var dc = -1; dc <= 1; dc++) {
        if (!dr && !dc) continue;
        var rr = r + dr, cc = c + dc;
        if (rr < 0 || cc < 0 || rr >= n || cc >= n) continue;
        a.push(rr * n + cc);
        if (!dr || !dc) o.push(rr * n + cc);
      }
      orth.push(o); ring.push(a);
    }
    var rows = [], cols = [];
    for (var i = 0; i < n; i++) { rows.push([]); cols.push([]); }
    for (k = 0; k < n * n; k++) { rows[Math.floor(k / n)].push(k); cols[k % n].push(k); }
    var lines = [];
    rows.forEach(function (cells, i) { lines.push({ kind: 'row', idx: i, cells: cells, count: rowCount[i], name: core.rowName(i) }); });
    cols.forEach(function (cells, i) { lines.push({ kind: 'col', idx: i, cells: cells, count: colCount[i], name: core.colName(i) }); });
    return { n: n, trees: trees, isTree: isTree, orth: orth, ring: ring, lines: lines, rowCount: rowCount, colCount: colCount };
  }
  function nm(g, k) { return cn(Math.floor(k / g.n), k % g.n); }
  function cap(t) { return t.charAt(0).toUpperCase() + t.slice(1); }
  function initial(g) { var s = new Int8Array(g.n * g.n); g.trees.forEach(function (t) { s[t] = 3; }); return s; }
  function closure(g, s) {
    for (var k = 0; k < s.length; k++) if (s[k] === 1) g.ring[k].forEach(function (x) { if (s[x] === 0) s[x] = 2; });
  }
  function count(s, cells, v) { var c = 0; cells.forEach(function (x) { if (s[x] === v) c++; }); return c; }
  function open(s, cells) { return cells.filter(function (x) { return s[x] === 0; }); }

  // tree <-> tent pairs that are already certain
  function claims(g, s) {
    var tentOf = {}, treeOf = {}, changed = true;
    while (changed) {
      changed = false;
      for (var k = 0; k < s.length; k++) {
        if (s[k] === 1 && treeOf[k] === undefined) {
          var tr = g.orth[k].filter(function (x) { return s[x] === 3 && tentOf[x] === undefined; });
          if (tr.length === 1) { treeOf[k] = tr[0]; tentOf[tr[0]] = k; changed = true; }
        } else if (s[k] === 3 && tentOf[k] === undefined) {
          var free = g.orth[k].filter(function (x) { return s[x] === 0; });
          var tn = g.orth[k].filter(function (x) { return s[x] === 1 && treeOf[x] === undefined; });
          if (!free.length && tn.length === 1) { tentOf[k] = tn[0]; treeOf[tn[0]] = k; changed = true; }
        }
      }
    }
    return { tentOf: tentOf, treeOf: treeOf };
  }

  function noTree(g, s) {
    var cells = [];
    for (var k = 0; k < s.length; k++) if (s[k] === 0 && !g.orth[k].some(function (x) { return g.isTree[x]; })) cells.push(k);
    if (!cells.length) return null;
    return { tier: 1, tech: 'no-tree', set: cells.map(function (x) { return [x, 2]; }), focus: cells, mark: cells,
      text: cells.length === 1 ? nm(g, cells[0]) + ' has no tree on any side, so it can never hold a tent – it is grass.'
        : 'These ' + cells.length + ' squares have no tree on any side, so none of them can hold a tent – they are all grass.' };
  }
  function lineDone(g, s) {
    for (var i = 0; i < g.lines.length; i++) {
      var L = g.lines[i], t = count(s, L.cells, 1), o = open(s, L.cells);
      if (!o.length) continue;
      if (t === L.count) return { tier: 1, tech: 'line-full', set: o.map(function (x) { return [x, 2]; }), focus: L.cells, mark: o,
        text: cap(L.name) + ' already has its ' + core.plural(L.count, 'tent') + ', so its remaining open squares are grass.' };
      if (o.length === L.count - t) return { tier: 1, tech: 'line-fill', set: o.map(function (x) { return [x, 1]; }), focus: L.cells, mark: o,
        text: cap(L.name) + ' needs ' + core.plural(L.count - t, 'more tent') + ' and has exactly ' + core.plural(o.length, 'open square') + ' left, so ' + (o.length === 1 ? 'it is a tent' : 'all of them are tents') + '.' };
    }
    return null;
  }
  function loneTree(g, s) {
    for (var i = 0; i < g.trees.length; i++) {
      var t = g.trees[i];
      if (g.orth[t].some(function (x) { return s[x] === 1; })) continue;
      var o = g.orth[t].filter(function (x) { return s[x] === 0; });
      if (o.length === 1) return { tier: 1, tech: 'lone-tree', set: [[o[0], 1]], focus: [t, o[0]], mark: [o[0]],
        text: 'The tree on ' + nm(g, t) + ' has no tent beside it yet and ' + nm(g, o[0]) + ' is its only open side, so the tent goes there.' };
    }
    return null;
  }
  function placements(cells, need, s, g) {
    // all ways to put `need` tents on `cells` (in line order) without two touching
    var out = [], pick = [];
    (function rec(i) {
      if (pick.length === need) { out.push(pick.slice()); return; }
      if (out.length > 400) return;
      for (var j = i; j < cells.length; j++) {
        if (pick.length && g.ring[pick[pick.length - 1]].indexOf(cells[j]) >= 0) continue;
        pick.push(cells[j]); rec(j + 1); pick.pop();
      }
    })(0);
    return out;
  }
  function lineFit(g, s) {
    for (var i = 0; i < g.lines.length; i++) {
      var L = g.lines[i], o = open(s, L.cells), need = L.count - count(s, L.cells, 1);
      if (!o.length || need <= 0) continue;
      var ways = placements(o, need, s, g);
      if (!ways.length || ways.length > 400) continue;
      var always = o.filter(function (x) { return ways.every(function (w) { return w.indexOf(x) >= 0; }); });
      var never = o.filter(function (x) { return ways.every(function (w) { return w.indexOf(x) < 0; }); });
      if (always.length || never.length) {
        var set = always.map(function (x) { return [x, 1]; }).concat(never.map(function (x) { return [x, 2]; }));
        var parts = [];
        if (always.length) parts.push('puts a tent on ' + core.listJoin(always.map(function (x) { return nm(g, x); })));
        if (never.length) parts.push('leaves ' + core.listJoin(never.map(function (x) { return nm(g, x); })) + ' as grass');
        return { tier: 2, tech: 'line-fit', set: set, focus: o, mark: always.concat(never),
          text: cap(L.name) + ' still needs ' + core.plural(need, 'tent') + ', and because tents in a line can’t sit side by side, every way to fit ' + (need === 1 ? 'it' : 'them') + ' into its open squares ' + parts.join(' and ') + '.' };
      }
    }
    return null;
  }
  function pairing(g, s) {
    var c = claims(g, s);
    for (var k = 0; k < s.length; k++) {
      if (s[k] !== 0) continue;
      var tr = g.orth[k].filter(function (x) { return s[x] === 3; });
      if (tr.length && tr.every(function (x) { return c.tentOf[x] !== undefined; })) {
        return { tier: 2, tech: 'pairing', set: [[k, 2]], focus: [k].concat(tr, tr.map(function (x) { return c.tentOf[x]; })), mark: [k],
          text: 'Every tree next to ' + nm(g, k) + ' already has its own tent (' + tr.map(function (x) { return nm(g, x) + ' → ' + nm(g, c.tentOf[x]); }).join(', ') + '), so a tent on ' + nm(g, k) + ' would have no tree – it is grass.' };
      }
    }
    for (var i = 0; i < g.trees.length; i++) {
      var t = g.trees[i];
      if (c.tentOf[t] !== undefined) continue;
      var freeTents = g.orth[t].filter(function (x) { return s[x] === 1 && c.treeOf[x] === undefined; });
      var o = g.orth[t].filter(function (x) { return s[x] === 0; });
      if (!freeTents.length && o.length === 1) {
        var others = g.orth[t].filter(function (x) { return s[x] === 1; });
        return { tier: 2, tech: 'pairing', set: [[o[0], 1]], focus: [t, o[0]].concat(others), mark: [o[0]],
          text: 'The tree on ' + nm(g, t) + ' still needs a tent of its own (' + (others.length ? 'the tent beside it belongs to another tree' : 'none is beside it') + '), and ' + nm(g, o[0]) + ' is its only open side, so the tent goes there.' };
      }
    }
    return null;
  }
  function lookahead(g, s) {
    var c = claims(g, s);
    for (var k = 0; k < s.length; k++) {
      if (s[k] !== 0) continue;
      var t = Int8Array.from(s);
      t[k] = 1;
      g.ring[k].forEach(function (x) { if (t[x] === 0) t[x] = 2; });
      for (var i = 0; i < g.lines.length; i++) {
        var L = g.lines[i];
        if (count(t, L.cells, 1) + open(t, L.cells).length < L.count) return { tier: 3, tech: 'lookahead', set: [[k, 2]], focus: [k].concat(L.cells), mark: [k],
          text: 'A tent on ' + nm(g, k) + ' would turn the squares around it to grass and leave ' + L.name + ' too few open squares for its ' + core.plural(L.count, 'tent') + ', so ' + nm(g, k) + ' is grass.' };
      }
      for (i = 0; i < g.trees.length; i++) {
        var tr = g.trees[i];
        if (c.tentOf[tr] !== undefined || g.orth[tr].indexOf(k) >= 0) continue;
        var ok = g.orth[tr].some(function (x) { return t[x] === 0 || (t[x] === 1 && c.treeOf[x] === undefined); });
        if (!ok) return { tier: 3, tech: 'lookahead', set: [[k, 2]], focus: [k, tr].concat(g.orth[tr]), mark: [k],
          text: 'A tent on ' + nm(g, k) + ' would turn the last free side of the tree on ' + nm(g, tr) + ' to grass and leave that tree without a tent, so ' + nm(g, k) + ' is grass.' };
      }
    }
    return null;
  }

  var TECHNIQUES = [noTree, lineDone, loneTree, lineFit, pairing, lookahead];
  var TECH_TIER = [1, 1, 1, 2, 2, 3];
  function nextStep(g, s, maxTier) {
    closure(g, s);
    for (var i = 0; i < TECHNIQUES.length; i++) {
      if (TECH_TIER[i] > maxTier) continue;
      var st = TECHNIQUES[i](g, s);
      if (st) return st;
    }
    return null;
  }
  function broken(g, s) {
    for (var i = 0; i < g.lines.length; i++) {
      var L = g.lines[i], t = count(s, L.cells, 1);
      if (t > L.count || t + open(s, L.cells).length < L.count) return true;
    }
    for (var k = 0; k < s.length; k++) if (s[k] === 1 && g.ring[k].some(function (x) { return s[x] === 1; })) return true;
    return false;
  }
  function solveLogic(g, start, maxTier) {
    var s = Int8Array.from(start), used = 0, steps = 0;
    for (;;) {
      if (broken(g, s)) return { solved: false, state: s, maxTier: used, steps: steps, broken: true };
      var st = nextStep(g, s, maxTier);
      if (!st) break;
      st.set.forEach(function (p) { s[p[0]] = p[1]; });
      used = Math.max(used, st.tier); steps++;
    }
    var solved = !s.some(function (v) { return v === 0; }) && !broken(g, s) && hasMatching(g, s);
    return { solved: solved, state: s, maxTier: used, steps: steps };
  }

  function hasMatching(g, s) {
    var tents = [];
    for (var k = 0; k < s.length; k++) if (s[k] === 1) tents.push(k);
    if (tents.length !== g.trees.length) return false;
    var matchTree = {};
    function aug(t, seen) {
      var adj = g.orth[t];
      for (var i = 0; i < adj.length; i++) {
        var tr = adj[i];
        if (!g.isTree[tr] || seen[tr]) continue;
        seen[tr] = 1;
        if (matchTree[tr] === undefined || aug(matchTree[tr], seen)) { matchTree[tr] = t; return true; }
      }
      return false;
    }
    return tents.every(function (t) { return aug(t, {}); });
  }

  function countSolutions(g, limit) {
    var n = g.n, s = initial(g), cnt = 0, colT = new Array(n).fill(0), colLeft = new Array(n).fill(0);
    limit = limit || 2;
    var cand = [];
    for (var k = 0; k < n * n; k++) cand.push(!g.isTree[k] && g.orth[k].some(function (x) { return g.isTree[x]; }));
    for (k = 0; k < n * n; k++) if (cand[k]) colLeft[k % n]++;
    (function rec(k, rowT) {
      if (cnt >= limit) return;
      var r = Math.floor(k / n), c = k % n;
      if (k === n * n) { if (colT.every(function (v, i) { return v === g.colCount[i]; }) && hasMatching(g, s)) cnt++; return; }
      if (c === 0 && k > 0 && rowT !== g.rowCount[r - 1]) return;
      if (c === 0) rowT = 0;
      if (!cand[k]) { rec(k + 1, rowT); return; }
      colLeft[c]--;
      // tent here?
      var touch = g.ring[k].some(function (x) { return x < k && s[x] === 1; });
      if (!touch && rowT < g.rowCount[r] && colT[c] < g.colCount[c]) {
        s[k] = 1; colT[c]++;
        rec(k + 1, rowT + 1);
        s[k] = 0; colT[c]--;
      }
      if (colT[c] + colLeft[c] >= g.colCount[c]) rec(k + 1, rowT);
      colLeft[c]++;
    })(0, 0);
    return cnt;
  }

  function layout(n, R) {
    var s = new Int8Array(n * n), target = Math.round(n * n / 5) + R.int(2), placed = 0, fails = 0;
    var tmp = geometry(n, [], new Array(n).fill(0), new Array(n).fill(0));
    while (placed < target && fails < 400) {
      var k = R.int(n * n);
      if (s[k] !== 0 || tmp.ring[k].some(function (x) { return s[x] === 1; })) { fails++; continue; }
      var spots = tmp.orth[k].filter(function (x) { return s[x] === 0; });
      if (!spots.length) { fails++; continue; }
      s[k] = 1; s[R.pick(spots)] = 3; placed++;
    }
    var trees = [], rowCount = new Array(n).fill(0), colCount = new Array(n).fill(0);
    for (k = 0; k < n * n; k++) {
      if (s[k] === 3) trees.push(k);
      if (s[k] === 1) { rowCount[Math.floor(k / n)]++; colCount[k % n]++; }
    }
    return { trees: trees, rowCount: rowCount, colCount: colCount, sol: s };
  }

  function generate(key, level, opts) {
    level = level in SIZES ? level : 'sprout';
    var n = SIZES[level], target = TIERS[level];
    var R = core.rngFor('tents', level, key);
    var maxAttempts = (opts && opts.maxAttempts) || 4000;
    for (var attempt = 1; attempt <= maxAttempts; attempt++) {
      R.mark();
      var L = layout(n, R), g = geometry(n, L.trees, L.rowCount, L.colCount);
      var res = solveLogic(g, initial(g), target);
      if (!res.solved || res.maxTier !== target) continue;
      if (target > 1 && solveLogic(g, initial(g), target - 1).solved) continue;
      if (countSolutions(g, 2) !== 1) continue;
      return { type: 'tents', key: key, level: level, n: n, trees: L.trees, rowCount: L.rowCount, colCount: L.colCount,
        solution: Array.from(res.state), attempts: attempt, g: g };
    }
    throw new Error('tents: no puzzle for ' + key + ' ' + level);
  }
  function geom(p) { if (!p.g) p.g = geometry(p.n, p.trees, p.rowCount, p.colCount); return p.g; }

  function hint(p, user) {
    var g = geom(p), sol = p.solution;
    for (var k = 0; k < user.length; k++) {
      if (user[k] === 1 && sol[k] !== 1) return { kind: 'mistake', cells: [k], focus: [k], set: [], text: 'The tent on ' + nm(g, k) + ' can’t be right: the puzzle’s only solution has grass there. Remove it and ask again.' };
      if (user[k] === 2 && sol[k] === 1) return { kind: 'mistake', cells: [k], focus: [k], set: [], text: nm(g, k) + ' is marked as grass, but the puzzle’s only solution has a tent there. Clear that mark and ask again.' };
    }
    if (isSolved(p, user)) return { kind: 'done', text: 'Every tree has its tent – the puzzle is solved.', cells: [], focus: [], set: [] };
    var s = Int8Array.from(user);
    p.trees.forEach(function (t) { s[t] = 3; });
    var st = nextStep(g, s, 3);
    if (!st) {
      for (k = 0; k < sol.length; k++) if (sol[k] === 1 && user[k] !== 1) break;
      return { kind: 'reveal', cells: [k], focus: [k], set: [[k, 1]], text: 'No single-step deduction is left from here, so here is one tent: ' + nm(g, k) + '.' };
    }
    return { kind: 'deduction', tech: st.tech, tier: st.tier, text: st.text, cells: st.mark, focus: st.focus, set: st.set };
  }
  function isSolved(p, user) {
    for (var k = 0; k < p.solution.length; k++) if ((p.solution[k] === 1) !== (user[k] === 1)) return false;
    return true;
  }
  function conflicts(p, user) {
    var g = geom(p), out = {};
    for (var k = 0; k < user.length; k++) if (user[k] === 1) g.ring[k].forEach(function (x) { if (user[x] === 1) { out[x] = 1; out[k] = 1; } });
    return Object.keys(out).map(Number);
  }
  function blockedBy(p, user) {
    var g = geom(p), out = [];
    for (var k = 0; k < user.length; k++) if (user[k] === 1) g.ring[k].forEach(function (x) { if (user[x] === 0 && !g.isTree[x]) out.push(x); });
    return out;
  }

  return { name: 'Tents & Trees', SIZES: SIZES, TIERS: TIERS, generate: generate, geometry: geometry, geom: geom, initial: initial,
    solveLogic: solveLogic, countSolutions: countSolutions, hint: hint, isSolved: isSolved, conflicts: conflicts, blockedBy: blockedBy, nextStep: nextStep };
});
