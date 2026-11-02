/*
 * Sun & Shade – a binary puzzle: fill every square with sun or shade so that no three
 * of the same kind sit next to each other in a row or column, and every row and column
 * holds as many suns as shades.
 * Cell state: 0 = open, 1 = sun, 2 = shade.
 */
(function (root, factory) {
  var core = typeof module !== 'undefined' && module.exports ? require('./core.js') : root.DLG.core;
  var api = factory(core);
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.DLG.sunshade = api;
})(this, function (core) {
  'use strict';
  var SIZES = { sprout: 6, bloom: 8, grove: 10 };
  var TIERS = { sprout: 1, bloom: 2, grove: 3 };
  var cn = core.cellName;
  var WORD = ['', 'sun', 'shade'], WORDS = ['', 'suns', 'shades'];

  function geometry(n) {
    var lines = [];
    for (var i = 0; i < n; i++) {
      var row = [], col = [];
      for (var j = 0; j < n; j++) { row.push(i * n + j); col.push(j * n + i); }
      lines.push({ kind: 'row', idx: i, cells: row, name: core.rowName(i) });
      lines.push({ kind: 'col', idx: i, cells: col, name: core.colName(i) });
    }
    var cross = [];
    for (var k = 0; k < n * n; k++) cross.push([2 * Math.floor(k / n), 2 * (k % n) + 1]);
    return { n: n, lines: lines, cross: cross };
  }
  function nm(g, k) { return cn(Math.floor(k / g.n), k % g.n); }
  function cap(t) { return t.charAt(0).toUpperCase() + t.slice(1); }
  function other(v) { return 3 - v; }

  function pairRule(g, s) {
    for (var l = 0; l < g.lines.length; l++) {
      var c = g.lines[l].cells;
      for (var i = 0; i + 1 < c.length; i++) {
        var a = s[c[i]], b = s[c[i + 1]];
        if (a && a === b) {
          var ends = [];
          if (i > 0 && s[c[i - 1]] === 0) ends.push(c[i - 1]);
          if (i + 2 < c.length && s[c[i + 2]] === 0) ends.push(c[i + 2]);
          if (ends.length) return { tier: 1, tech: 'pair', set: ends.map(function (x) { return [x, other(a)]; }), focus: [c[i], c[i + 1]].concat(ends), mark: ends,
            text: nm(g, c[i]) + ' and ' + nm(g, c[i + 1]) + ' are both ' + WORDS[a] + ', so ' + core.listJoin(ends.map(function (x) { return nm(g, x); })) + (ends.length > 1 ? ' must be ' : ' must be ') + WORD[other(a)] + ' – otherwise three ' + WORDS[a] + ' would sit in a row.' };
        }
      }
    }
    return null;
  }
  function sandwich(g, s) {
    for (var l = 0; l < g.lines.length; l++) {
      var c = g.lines[l].cells;
      for (var i = 0; i + 2 < c.length; i++) {
        var a = s[c[i]];
        if (a && s[c[i + 2]] === a && s[c[i + 1]] === 0) return { tier: 1, tech: 'sandwich', set: [[c[i + 1], other(a)]], focus: [c[i], c[i + 1], c[i + 2]], mark: [c[i + 1]],
          text: nm(g, c[i + 1]) + ' sits between two ' + WORDS[a] + ', so it must be ' + WORD[other(a)] + ' – a ' + WORD[a] + ' there would make three in a row.' };
      }
    }
    return null;
  }
  function countRule(g, s) {
    var half = g.n / 2;
    for (var l = 0; l < g.lines.length; l++) {
      var L = g.lines[l], c = L.cells, open = c.filter(function (x) { return s[x] === 0; });
      if (!open.length) continue;
      for (var v = 1; v <= 2; v++) {
        var have = c.filter(function (x) { return s[x] === v; }).length;
        if (have === half) return { tier: 1, tech: 'count', set: open.map(function (x) { return [x, other(v)]; }), focus: c, mark: open,
          text: cap(L.name) + ' already has its ' + half + ' ' + WORDS[v] + ', so every open square left in it is ' + WORD[other(v)] + '.' };
      }
    }
    return null;
  }

  // every valid way to finish one line
  function completions(g, s, cells, limit) {
    var n = g.n, half = n / 2, out = [], cur = cells.map(function (x) { return s[x]; });
    var cnt = [0, 0, 0];
    cur.forEach(function (v) { cnt[v]++; });
    if (cnt[1] > half || cnt[2] > half) return out;
    var vals = cur.slice();
    (function rec(i, c1, c2) {
      if (out.length >= limit) return;
      if (i === n) { out.push(vals.slice()); return; }
      var opts = cur[i] ? [cur[i]] : [1, 2];
      for (var o = 0; o < opts.length; o++) {
        var v = opts[o];
        if (i >= 2 && vals[i - 1] === v && vals[i - 2] === v) continue;
        var n1 = c1 + (v === 1 && !cur[i] ? 1 : 0), n2 = c2 + (v === 2 && !cur[i] ? 1 : 0);
        if (n1 > half || n2 > half) continue;
        vals[i] = v;
        rec(i + 1, n1, n2);
        vals[i] = cur[i];
      }
    })(0, cnt[1], cnt[2]);
    return out;
  }
  // cached summary of one line pattern: number of valid completions and the values every completion shares
  var INFO = {};
  function lineInfo(g, s, cells) {
    var key = g.n + ':' + cells.map(function (x) { return s[x]; }).join('');
    var hit = INFO[key];
    if (hit) return hit;
    var ways = completions(g, s, cells, 100000), forced = [];
    for (var i = 0; i < cells.length; i++) {
      var v = ways.length ? ways[0][i] : 0;
      forced.push(ways.length && ways.every(function (w) { return w[i] === v; }) ? v : 0);
    }
    hit = { ways: ways.length, forced: forced };
    INFO[key] = hit;
    return hit;
  }
  function settled(g, s, L, ways) {
    var c = L.cells, set = [];
    for (var i = 0; i < c.length; i++) {
      if (s[c[i]]) continue;
      var v = ways[0][i];
      if (ways.every(function (w) { return w[i] === v; })) set.push([c[i], v]);
    }
    return set;
  }
  function needText(g, s, L) {
    var half = g.n / 2, c = L.cells;
    var n1 = half - c.filter(function (x) { return s[x] === 1; }).length, n2 = half - c.filter(function (x) { return s[x] === 2; }).length;
    return core.plural(n1, 'more sun') + ' and ' + core.plural(n2, 'more shade', 'more shades');
  }
  function describe(g, set) {
    var groups = { 1: [], 2: [] };
    set.forEach(function (p) { groups[p[1]].push(nm(g, p[0])); });
    var parts = [];
    if (groups[1].length) parts.push('sun on ' + core.listJoin(groups[1]));
    if (groups[2].length) parts.push('shade on ' + core.listJoin(groups[2]));
    return parts.join(' and ');
  }
  function remaining(g, s, L) {
    var half = g.n / 2;
    return [half - L.cells.filter(function (x) { return s[x] === 1; }).length, half - L.cells.filter(function (x) { return s[x] === 2; }).length];
  }
  // Bloom: a line that is missing just one sun or just one shade
  function lastOne(g, s) { return lineEnum(g, s, true); }
  // Grove: full counting on a line that still misses several of each
  function lineFull(g, s) { return lineEnum(g, s, false); }
  function lineEnum(g, s, onlyLastOne) {
    for (var l = 0; l < g.lines.length; l++) {
      var L = g.lines[l];
      if (!L.cells.some(function (x) { return s[x] === 0; })) continue;
      var rem = remaining(g, s, L);
      if (onlyLastOne && Math.min(rem[0], rem[1]) !== 1) continue;
      var info = lineInfo(g, s, L.cells);
      if (!info.ways) continue;
      var set = [];
      L.cells.forEach(function (x, i) { if (!s[x] && info.forced[i]) set.push([x, info.forced[i]]); });
      if (set.length) return { tier: onlyLastOne ? 2 : 3, tech: onlyLastOne ? 'last-one' : 'line', set: set, focus: L.cells, mark: set.map(function (p) { return p[0]; }),
        text: cap(L.name) + ' still needs ' + needText(g, s, L) + '; every way to finish it without three in a row puts ' + describe(g, set) + '.' };
    }
    return null;
  }
  function crossEnum(g, s) {
    var feas = {};
    function ok(k, v, lineIdx) {
      var key = k * 3 + v + ':' + lineIdx;
      if (!(key in feas)) {
        var t = Int8Array.from(s); t[k] = v;
        feas[key] = lineInfo(g, t, g.lines[lineIdx].cells).ways > 0;
      }
      return feas[key];
    }
    for (var l = 0; l < g.lines.length; l++) {
      var L = g.lines[l];
      if (!L.cells.some(function (x) { return s[x] === 0; })) continue;
      var ways = completions(g, s, L.cells, 2000);
      var good = ways.filter(function (w) {
        return L.cells.every(function (x, i) {
          if (s[x]) return true;
          var crossLine = g.cross[x][0] === l ? g.cross[x][1] : g.cross[x][0];
          return ok(x, w[i], crossLine);
        });
      });
      if (!good.length || good.length === ways.length) continue;
      var set = settled(g, s, L, good);
      if (set.length) {
        var crossNames = {};
        ways.forEach(function (w) {
          if (good.indexOf(w) >= 0) return;
          L.cells.forEach(function (x, i) {
            if (s[x]) return;
            var cl = g.cross[x][0] === l ? g.cross[x][1] : g.cross[x][0];
            if (!ok(x, w[i], cl)) crossNames[g.lines[cl].name] = 1;
          });
        });
        var names = Object.keys(crossNames);
        return { tier: 3, tech: 'cross', set: set, focus: L.cells.concat(set.map(function (p) { return p[0]; })), mark: set.map(function (p) { return p[0]; }),
          text: 'Of the ways to finish ' + L.name + ', some would leave ' + core.listJoin(names.slice(0, 3)) + ' with no valid way to finish; all the ways that remain put ' + describe(g, set) + '.' };
      }
    }
    return null;
  }

  var TECHNIQUES = [pairRule, sandwich, countRule, lastOne, lineFull, crossEnum];
  var TECH_TIER = [1, 1, 1, 2, 3, 3];
  function nextStep(g, s, maxTier) {
    for (var i = 0; i < TECHNIQUES.length; i++) {
      if (TECH_TIER[i] > maxTier) continue;
      var st = TECHNIQUES[i](g, s);
      if (st) return st;
    }
    return null;
  }
  function broken(g, s) {
    for (var l = 0; l < g.lines.length; l++) if (!lineInfo(g, s, g.lines[l].cells).ways) return true;
    return false;
  }
  function solveLogic(g, start, maxTier) {
    var s = Int8Array.from(start), used = 0, steps = 0;
    for (;;) {
      var st = nextStep(g, s, maxTier);
      if (!st) break;
      st.set.forEach(function (p) { s[p[0]] = p[1]; });
      used = Math.max(used, st.tier); steps++;
    }
    var solved = !s.some(function (v) { return v === 0; }) && !broken(g, s);
    return { solved: solved, state: s, maxTier: used, steps: steps };
  }

  function validRows(n) {
    var rows = [];
    for (var m = 0; m < (1 << n); m++) {
      var v = [], ones = 0, ok = true;
      for (var i = 0; i < n; i++) { v.push((m >> i) & 1 ? 1 : 2); if (v[i] === 1) ones++; }
      if (ones !== n / 2) continue;
      for (i = 2; i < n && ok; i++) if (v[i] === v[i - 1] && v[i] === v[i - 2]) ok = false;
      if (ok) rows.push(v);
    }
    return rows;
  }
  var ROWCACHE = {};
  function rowsFor(n) { return ROWCACHE[n] || (ROWCACHE[n] = validRows(n)); }

  function countSolutions(g, givens, limit) {
    var n = g.n, half = n / 2, cnt = 0, grid = [], ones = new Array(n).fill(0);
    limit = limit || 2;
    var cand = [];
    for (var r = 0; r < n; r++) cand.push(rowsFor(n).filter(function (row) {
      for (var c = 0; c < n; c++) { var gv = givens[r * n + c]; if (gv && gv !== row[c]) return false; }
      return true;
    }));
    (function rec(r) {
      if (cnt >= limit) return;
      if (r === n) { cnt++; return; }
      var list = cand[r];
      for (var i = 0; i < list.length; i++) {
        var row = list[i], ok = true;
        for (var c = 0; c < n && ok; c++) {
          var o = ones[c] + (row[c] === 1 ? 1 : 0);
          if (o > half || (r + 1 - o) > half) ok = false;
          else if (r >= 2 && grid[r - 1][c] === row[c] && grid[r - 2][c] === row[c]) ok = false;
        }
        if (!ok) continue;
        grid[r] = row;
        for (c = 0; c < n; c++) if (row[c] === 1) ones[c]++;
        rec(r + 1);
        for (c = 0; c < n; c++) if (row[c] === 1) ones[c]--;
      }
    })(0);
    return cnt;
  }
  // exhaustive count with line propagation (fast; the plain row-by-row count above is the independent check in tests)
  function countFast(g, givens, limit) {
    var cnt = 0;
    limit = limit || 2;
    (function rec(s) {
      if (cnt >= limit) return;
      var changed = true;
      while (changed) {
        changed = false;
        for (var l = 0; l < g.lines.length; l++) {
          var cells = g.lines[l].cells, info = lineInfo(g, s, cells);
          if (!info.ways) return;
          for (var i = 0; i < cells.length; i++) if (!s[cells[i]] && info.forced[i]) { s[cells[i]] = info.forced[i]; changed = true; }
        }
      }
      var k = -1;
      for (var x = 0; x < s.length; x++) if (!s[x]) { k = x; break; }
      if (k < 0) { cnt++; return; }
      var a = Int8Array.from(s); a[k] = 1; rec(a);
      var b = Int8Array.from(s); b[k] = 2; rec(b);
    })(Int8Array.from(givens));
    return cnt;
  }

  function randomGrid(n, R) {
    var rows = R.shuffle(rowsFor(n).slice()), grid = [], half = n / 2;
    (function rec(r) {
      if (r === n) return true;
      for (var i = 0; i < rows.length; i++) {
        var row = rows[i], ok = true;
        for (var c = 0; c < n && ok; c++) {
          if (r >= 2 && grid[r - 1][c] === row[c] && grid[r - 2][c] === row[c]) ok = false;
          var ones = row[c] === 1 ? 1 : 0;
          for (var rr = 0; rr < r; rr++) if (grid[rr][c] === 1) ones++;
          if (ones > half || (r + 1 - ones) > half) ok = false;
        }
        if (!ok) continue;
        grid[r] = row;
        if (rec(r + 1)) return true;
      }
      return false;
    })(0);
    var out = [];
    grid.forEach(function (row) { out = out.concat(row); });
    return out;
  }

  function generate(key, level, opts) {
    level = level in SIZES ? level : 'sprout';
    var n = SIZES[level], target = TIERS[level], g = geometry(n);
    var R = core.rng(core.seedFor('sunshade', level, key));
    var maxAttempts = (opts && opts.maxAttempts) || 200;
    for (var attempt = 1; attempt <= maxAttempts; attempt++) {
      var sol = randomGrid(n, R), givens = Int8Array.from(sol);
      var order = R.shuffle(Array.from({ length: n * n }, function (_, i) { return i; }));
      for (var i = 0; i < order.length; i++) {
        var k = order[i], keep = givens[k];
        givens[k] = 0;
        if (!solveLogic(g, givens, target).solved) givens[k] = keep;
      }
      var res = solveLogic(g, givens, target);
      if (res.maxTier !== target) continue;
      if (target > 1 && solveLogic(g, givens, target - 1).solved) continue;
      if (countFast(g, givens, 2) !== 1) continue;
      return { type: 'sunshade', key: key, level: level, n: n, givens: Array.from(givens), solution: sol, attempts: attempt, g: g };
    }
    throw new Error('sunshade: no puzzle for ' + key + ' ' + level);
  }
  function geom(p) { if (!p.g) p.g = geometry(p.n); return p.g; }

  function hint(p, user) {
    var g = geom(p), sol = p.solution;
    for (var k = 0; k < user.length; k++) {
      if (user[k] && !p.givens[k] && user[k] !== sol[k]) return { kind: 'mistake', cells: [k], focus: [k], set: [],
        text: nm(g, k) + ' can’t be ' + WORD[user[k]] + ': the puzzle’s only solution has ' + WORD[sol[k]] + ' there. Clear it and ask again.' };
    }
    if (isSolved(p, user)) return { kind: 'done', text: 'Every square is filled – the puzzle is solved.', cells: [], focus: [], set: [] };
    var s = Int8Array.from(user);
    p.givens.forEach(function (v, i) { if (v) s[i] = v; });
    var st = nextStep(g, s, 3);
    if (!st) {
      for (k = 0; k < sol.length; k++) if (!s[k]) break;
      return { kind: 'reveal', cells: [k], focus: [k], set: [[k, sol[k]]], text: 'No single-step deduction is left from here, so here is one square: ' + nm(g, k) + ' is ' + WORD[sol[k]] + '.' };
    }
    return { kind: 'deduction', tech: st.tech, tier: st.tier, text: st.text, cells: st.mark, focus: st.focus, set: st.set };
  }
  function isSolved(p, user) {
    for (var k = 0; k < p.solution.length; k++) if ((p.givens[k] || user[k]) !== p.solution[k]) return false;
    return true;
  }
  function conflicts(p, user) {
    var g = geom(p), out = {}, s = p.givens.map(function (v, i) { return v || user[i]; });
    g.lines.forEach(function (L) {
      var c = L.cells;
      for (var i = 0; i + 2 < c.length; i++) if (s[c[i]] && s[c[i]] === s[c[i + 1]] && s[c[i]] === s[c[i + 2]]) { out[c[i]] = out[c[i + 1]] = out[c[i + 2]] = 1; }
      [1, 2].forEach(function (v) { if (c.filter(function (x) { return s[x] === v; }).length > g.n / 2) c.forEach(function (x) { if (s[x] === v) out[x] = 1; }); });
    });
    return Object.keys(out).map(Number);
  }

  return { name: 'Sun & Shade', SIZES: SIZES, TIERS: TIERS, generate: generate, geometry: geometry, geom: geom,
    solveLogic: solveLogic, countSolutions: countSolutions, countFast: countFast, hint: hint, isSolved: isSolved, conflicts: conflicts, nextStep: nextStep };
});
