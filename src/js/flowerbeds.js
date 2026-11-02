/*
 * Flower Beds – one flower in every row, every column and every bed; flowers never touch,
 * not even diagonally. Generator, human-style solver (with "Why?" explanations) and a
 * brute-force solution counter that confirms every puzzle has exactly one solution.
 * Cell state: 0 = open, 1 = flower, 2 = empty.
 */
(function (root, factory) {
  var core = typeof module !== 'undefined' && module.exports ? require('./core.js') : root.DLG.core;
  var api = factory(core);
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.DLG.flowerbeds = api;
})(this, function (core) {
  'use strict';
  var BED_NAMES = ['Rose', 'Iris', 'Fern', 'Mint', 'Sage', 'Thyme', 'Poppy', 'Lily', 'Aster'];
  var SIZES = { sprout: 6, bloom: 7, grove: 8 };
  var TIERS = { sprout: 1, bloom: 2, grove: 3 };
  var cn = core.cellName;

  function geometry(n, regions) {
    var rows = [], cols = [], beds = [];
    for (var i = 0; i < n; i++) { rows.push([]); cols.push([]); beds.push([]); }
    for (var k = 0; k < n * n; k++) {
      rows[Math.floor(k / n)].push(k); cols[k % n].push(k); beds[regions[k]].push(k);
    }
    var near = [];
    for (k = 0; k < n * n; k++) {
      var r = Math.floor(k / n), c = k % n, set = {};
      rows[r].concat(cols[c], beds[regions[k]]).forEach(function (x) { set[x] = 1; });
      for (var dr = -1; dr <= 1; dr++) for (var dc = -1; dc <= 1; dc++) {
        var rr = r + dr, cc = c + dc;
        if (rr >= 0 && cc >= 0 && rr < n && cc < n) set[rr * n + cc] = 1;
      }
      delete set[k];
      near.push(Object.keys(set).map(Number));
    }
    var units = [];
    rows.forEach(function (cells, i) { units.push({ kind: 'row', idx: i, cells: cells, name: core.rowName(i) }); });
    cols.forEach(function (cells, i) { units.push({ kind: 'col', idx: i, cells: cells, name: core.colName(i) }); });
    beds.forEach(function (cells, i) { units.push({ kind: 'bed', idx: i, cells: cells, name: 'the ' + BED_NAMES[i] + ' bed' }); });
    return { n: n, regions: regions, rows: rows, cols: cols, beds: beds, near: near, units: units };
  }

  // Silent rule: cells that share a row, column or bed with a flower, or touch it, are empty.
  function closure(g, s) {
    for (var k = 0; k < s.length; k++) if (s[k] === 1) g.near[k].forEach(function (x) { if (s[x] === 0) s[x] = 2; });
  }
  function blockedBy(g, s) {
    // cells implied empty by placed flowers (the board can show them as dots)
    var out = [];
    for (var k = 0; k < s.length; k++) if (s[k] === 1) g.near[k].forEach(function (x) { if (s[x] !== 1) out.push(x); });
    return out;
  }
  function openCells(s, cells) { return cells.filter(function (x) { return s[x] === 0; }); }
  function hasFlower(s, cells) { return cells.some(function (x) { return s[x] === 1; }); }
  function cap(t) { return t.charAt(0).toUpperCase() + t.slice(1); }

  function lastSpot(g, s) {
    for (var u = 0; u < g.units.length; u++) {
      var unit = g.units[u];
      if (hasFlower(s, unit.cells)) continue;
      var open = openCells(s, unit.cells);
      if (open.length === 1) {
        return { tier: 1, tech: 'last-spot', set: [[open[0], 1]], focus: unit.cells.slice(), mark: [open[0]],
          text: cap(unit.name) + ' has only one open square left, ' + cn(Math.floor(open[0] / g.n), open[0] % g.n) + ', so its flower goes there.' };
      }
    }
    return null;
  }

  function confinedOne(g, s) {
    var n = g.n, lines = [['row', g.rows], ['col', g.cols]];
    for (var b = 0; b < n; b++) {
      if (hasFlower(s, g.beds[b])) continue;
      var open = openCells(s, g.beds[b]);
      if (!open.length) continue;
      for (var l = 0; l < 2; l++) {
        var key = l === 0 ? function (x) { return Math.floor(x / n); } : function (x) { return x % n; };
        var line = key(open[0]);
        if (open.every(function (x) { return key(x) === line; })) {
          var lineCells = lines[l][1][line];
          var clear = openCells(s, lineCells).filter(function (x) { return g.regions[x] !== b; });
          if (clear.length) {
            var lname = l === 0 ? core.rowName(line) : core.colName(line);
            return { tier: 2, tech: 'confined', set: clear.map(function (x) { return [x, 2]; }), focus: open.concat(clear), mark: clear,
              text: 'Every open square of the ' + BED_NAMES[b] + ' bed lies in ' + lname + ', so that bed takes ' + lname + '’s flower and the other open squares of ' + lname + ' stay empty.' };
          }
        }
      }
    }
    for (l = 0; l < 2; l++) {
      for (var i = 0; i < n; i++) {
        var cells = lines[l][1][i];
        if (hasFlower(s, cells)) continue;
        var op = openCells(s, cells);
        if (!op.length) continue;
        var bed = g.regions[op[0]];
        if (op.every(function (x) { return g.regions[x] === bed; })) {
          var clr = openCells(s, g.beds[bed]).filter(function (x) { return (l === 0 ? Math.floor(x / n) : x % n) !== i; });
          if (clr.length) {
            var nm = l === 0 ? core.rowName(i) : core.colName(i);
            return { tier: 2, tech: 'confined', set: clr.map(function (x) { return [x, 2]; }), focus: op.concat(clr), mark: clr,
              text: 'All open squares of ' + nm + ' belong to the ' + BED_NAMES[bed] + ' bed, so that bed’s flower is in ' + nm + ' and the rest of the ' + BED_NAMES[bed] + ' bed stays empty.' };
          }
        }
      }
    }
    return null;
  }

  function touchAll(g, s) {
    var n = g.n;
    for (var x = 0; x < s.length; x++) {
      if (s[x] !== 0) continue;
      var nearSet = {};
      g.near[x].forEach(function (y) { nearSet[y] = 1; });
      for (var u = 0; u < g.units.length; u++) {
        var unit = g.units[u];
        if (unit.cells.indexOf(x) >= 0 || hasFlower(s, unit.cells)) continue;
        var open = openCells(s, unit.cells);
        if (open.length && open.every(function (y) { return nearSet[y]; })) {
          return { tier: 2, tech: 'touch-all', set: [[x, 2]], focus: open.concat([x]), mark: [x],
            text: 'A flower on ' + cn(Math.floor(x / n), x % n) + ' would touch or share a line with every open square of ' + unit.name + ', leaving it no place for its flower, so ' + cn(Math.floor(x / n), x % n) + ' stays empty.' };
        }
      }
    }
    return null;
  }

  function firstSubset(items, k, fn) {
    var pick = [], found = null;
    (function rec(start) {
      if (found) return;
      if (pick.length === k) { found = fn(pick.slice()); return; }
      for (var i = start; i < items.length && !found; i++) { pick.push(items[i]); rec(i + 1); pick.pop(); }
    })(0);
    return found;
  }

  function lineGroupName(kind, idxs) {
    var names = idxs.map(function (i) { return kind === 'row' ? String(i + 1) : core.COLS[i]; });
    return (kind === 'row' ? 'rows ' : 'columns ') + core.listJoin(names);
  }

  function confinedMany(g, s) {
    var n = g.n;
    var openBeds = [], b;
    for (b = 0; b < n; b++) if (!hasFlower(s, g.beds[b])) openBeds.push(b);
    var kinds = [['row', g.rows, function (x) { return Math.floor(x / n); }], ['col', g.cols, function (x) { return x % n; }]];
    for (var k = 2; k < openBeds.length; k++) {
      for (var t = 0; t < 2; t++) {
        var kind = kinds[t][0], lines = kinds[t][1], key = kinds[t][2];
        var openLines = [];
        for (var i = 0; i < n; i++) if (!hasFlower(s, lines[i])) openLines.push(i);
        // k beds squeezed into k lines -> the rest of those lines is empty
        var step = firstSubset(openLines, k, function (L) {
          var inL = {}; L.forEach(function (i) { inL[i] = 1; });
          var inside = openBeds.filter(function (bb) { var op = openCells(s, g.beds[bb]); return op.length && op.every(function (x) { return inL[key(x)]; }); });
          if (inside.length !== k) return null;
          var isIn = {}; inside.forEach(function (bb) { isIn[bb] = 1; });
          var clear = [];
          L.forEach(function (i) { openCells(s, lines[i]).forEach(function (x) { if (!isIn[g.regions[x]]) clear.push(x); }); });
          if (!clear.length) return null;
          var focus = [];
          inside.forEach(function (bb) { focus = focus.concat(openCells(s, g.beds[bb])); });
          return { tier: 3, tech: 'k-confined', set: clear.map(function (x) { return [x, 2]; }), focus: focus.concat(clear), mark: clear,
            text: 'The ' + core.listJoin(inside.map(function (bb) { return BED_NAMES[bb]; })) + ' beds fit entirely inside ' + lineGroupName(kind, L) + ', so those ' + core.word(k) + ' lines are reserved for them and every other open square there stays empty.' };
        });
        if (step) return step;
        // k lines squeezed into k beds -> the rest of those beds is empty
        step = firstSubset(openBeds, k, function (B) {
          var inB = {}; B.forEach(function (bb) { inB[bb] = 1; });
          var inside = openLines.filter(function (i) { var op = openCells(s, lines[i]); return op.length && op.every(function (x) { return inB[g.regions[x]]; }); });
          if (inside.length !== k) return null;
          var isIn = {}; inside.forEach(function (i) { isIn[i] = 1; });
          var clear = [];
          B.forEach(function (bb) { openCells(s, g.beds[bb]).forEach(function (x) { if (!isIn[key(x)]) clear.push(x); }); });
          if (!clear.length) return null;
          var focus = [];
          inside.forEach(function (i) { focus = focus.concat(openCells(s, lines[i])); });
          return { tier: 3, tech: 'k-confined', set: clear.map(function (x) { return [x, 2]; }), focus: focus.concat(clear), mark: clear,
            text: 'All open squares of ' + lineGroupName(kind, inside) + ' lie in the ' + core.listJoin(B.map(function (bb) { return BED_NAMES[bb]; })) + ' beds, so those beds must place their flowers there and their other open squares stay empty.' };
        });
        if (step) return step;
      }
    }
    return null;
  }

  var TECHNIQUES = [lastSpot, confinedOne, touchAll, confinedMany];
  var TECH_TIER = [1, 2, 2, 3];

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
    for (var u = 0; u < g.units.length; u++) {
      var cells = g.units[u].cells, f = 0, o = 0;
      cells.forEach(function (x) { if (s[x] === 1) f++; else if (s[x] === 0) o++; });
      if (f > 1 || (f === 0 && o === 0)) return true;
    }
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
    closure(g, s);
    var solved = !s.some(function (v) { return v === 0; }) && !broken(g, s);
    return { solved: solved, state: s, maxTier: used, steps: steps };
  }

  // brute force: count solutions (stops at limit)
  function countSolutions(g, limit, avoid) {
    var n = g.n, colUsed = [], bedUsed = [], count = 0, cur = [];
    limit = limit || 2;
    g.lastAlt = null;
    (function row(r, prev) {
      if (count >= limit) return;
      if (r === n) {
        count++;
        if (avoid && !g.lastAlt && cur.some(function (c, i) { return avoid[i] !== c; })) g.lastAlt = cur.slice();
        return;
      }
      for (var c = 0; c < n; c++) {
        var b = g.regions[r * n + c];
        if (colUsed[c] || bedUsed[b] || (prev >= 0 && Math.abs(prev - c) <= 1)) continue;
        colUsed[c] = bedUsed[b] = true; cur[r] = c;
        row(r + 1, c);
        colUsed[c] = bedUsed[b] = false;
      }
    })(0, -1);
    return count;
  }

  function randomFlowers(n, R) {
    var pos = [], used = [];
    function rec(r) {
      if (r === n) return true;
      var order = R.shuffle(Array.from({ length: n }, function (_, i) { return i; }));
      for (var i = 0; i < n; i++) {
        var c = order[i];
        if (used[c] || (r > 0 && Math.abs(pos[r - 1] - c) <= 1)) continue;
        used[c] = true; pos[r] = c;
        if (rec(r + 1)) return true;
        used[c] = false;
      }
      return false;
    }
    rec(0);
    return pos;
  }

  function growRegions(n, pos, R) {
    var regions = new Array(n * n).fill(-1);
    var size = new Array(n).fill(1);
    pos.forEach(function (c, r) { regions[r * n + c] = r; });
    var left = n * n - n;
    while (left > 0) {
      // favour small regions a little so shapes vary without giant blobs
      var cands = [];
      for (var k = 0; k < n * n; k++) {
        if (regions[k] >= 0) continue;
        var r = Math.floor(k / n), c = k % n;
        [[r - 1, c], [r + 1, c], [r, c - 1], [r, c + 1]].forEach(function (p) {
          if (p[0] < 0 || p[1] < 0 || p[0] >= n || p[1] >= n) return;
          var reg = regions[p[0] * n + p[1]];
          if (reg >= 0) cands.push([k, reg]);
        });
      }
      var best = null, bestScore = -1;
      for (var t = 0; t < 3; t++) {
        var cand = R.pick(cands), score = R.next() / size[cand[1]];
        if (score > bestScore) { bestScore = score; best = cand; }
      }
      regions[best[0]] = best[1]; size[best[1]]++; left--;
    }
    return regions;
  }

  function connectedWithout(n, regions, reg, skip) {
    var cells = [];
    for (var k = 0; k < n * n; k++) if (regions[k] === reg && k !== skip) cells.push(k);
    if (!cells.length) return false;
    var seen = {}, stack = [cells[0]], cnt = 0;
    seen[cells[0]] = 1;
    while (stack.length) {
      var x = stack.pop(); cnt++;
      var r = Math.floor(x / n), c = x % n;
      [[r - 1, c], [r + 1, c], [r, c - 1], [r, c + 1]].forEach(function (p) {
        if (p[0] < 0 || p[1] < 0 || p[0] >= n || p[1] >= n) return;
        var y = p[0] * n + p[1];
        if (!seen[y] && regions[y] === reg && y !== skip) { seen[y] = 1; stack.push(y); }
      });
    }
    return cnt === cells.length;
  }

  // Local search: while a second solution exists, move one of its flowers into a
  // neighbouring bed so that this bed would hold two of them.
  function makeUnique(n, pos, regions, R) {
    regions = regions.slice();
    var seeds = {};
    pos.forEach(function (c, r) { seeds[r * n + c] = 1; });
    for (var it = 0; it < 120; it++) {
      var g = geometry(n, regions);
      var cnt = countSolutions(g, 2, pos);
      if (cnt === 1) return renumber(regions);
      var alt = g.lastAlt, moves = [];
      alt.forEach(function (c, r) {
        var x = r * n + c;
        if (seeds[x]) return;
        [[r - 1, c], [r + 1, c], [r, c - 1], [r, c + 1]].forEach(function (p) {
          if (p[0] < 0 || p[1] < 0 || p[0] >= n || p[1] >= n) return;
          var to = regions[p[0] * n + p[1]];
          if (to !== regions[x]) moves.push([x, to]);
        });
      });
      R.shuffle(moves);
      var moved = false;
      for (var m = 0; m < moves.length && !moved; m++) {
        if (connectedWithout(n, regions, regions[moves[m][0]], moves[m][0])) { regions[moves[m][0]] = moves[m][1]; moved = true; }
      }
      if (!moved) return null;
    }
    return null;
  }
  function renumber(regions) {
    var map = {}, next = 0;
    regions.forEach(function (reg) { if (!(reg in map)) map[reg] = next++; });
    return regions.map(function (reg) { return map[reg]; });
  }

  function colorBeds(n, regions) {
    var adj = [];
    for (var i = 0; i < n; i++) adj.push({});
    for (var k = 0; k < n * n; k++) {
      var r = Math.floor(k / n), c = k % n;
      if (c + 1 < n && regions[k] !== regions[k + 1]) { adj[regions[k]][regions[k + 1]] = 1; adj[regions[k + 1]][regions[k]] = 1; }
      if (r + 1 < n && regions[k] !== regions[k + n]) { adj[regions[k]][regions[k + n]] = 1; adj[regions[k + n]][regions[k]] = 1; }
    }
    var colors = [];
    for (i = 0; i < n; i++) {
      var taken = {};
      Object.keys(adj[i]).forEach(function (j) { if (colors[j] !== undefined) taken[colors[j]] = 1; });
      var col = i % 6;
      for (var t = 0; t < 6 && taken[col]; t++) col = (col + 1) % 6;
      colors.push(col);
    }
    return colors;
  }

  function generate(key, level, opts) {
    level = level in SIZES ? level : 'sprout';
    var n = SIZES[level], target = TIERS[level];
    var R = core.rng(core.seedFor('flowerbeds', level, key));
    var maxAttempts = (opts && opts.maxAttempts) || 4000, fallback = null;
    for (var attempt = 1; attempt <= maxAttempts; attempt++) {
      var pos = randomFlowers(n, R);
      var regions = makeUnique(n, pos, growRegions(n, pos, R), R);
      if (!regions) continue;
      var g = geometry(n, regions);
      var empty = new Int8Array(n * n);
      var res = solveLogic(g, empty, target);
      if (!res.solved || res.maxTier !== target) {
        if (res.solved && !fallback && attempt > maxAttempts / 2) fallback = null;
        continue;
      }
      if (target > 1 && solveLogic(g, empty, target - 1).solved) continue;
      if (countSolutions(g, 2) !== 1) continue;
      return build(key, level, g, res.state, attempt);
    }
    throw new Error('flowerbeds: no puzzle for ' + key + ' ' + level);
  }

  function build(key, level, g, sol, attempts) {
    return { type: 'flowerbeds', key: key, level: level, n: g.n, regions: g.regions, beds: BED_NAMES.slice(0, g.n),
      colors: colorBeds(g.n, g.regions), solution: Array.from(sol), attempts: attempts, g: g };
  }

  function geom(p) { if (!p.g) p.g = geometry(p.n, p.regions); return p.g; }

  // The hint: point out a wrong mark first, otherwise the next logical deduction.
  function hint(p, user) {
    var g = geom(p), sol = p.solution, wrong = [];
    for (var k = 0; k < user.length; k++) {
      if (user[k] === 1 && sol[k] !== 1) wrong.push(k);
      if (user[k] === 2 && sol[k] === 1) wrong.push(k);
    }
    if (wrong.length) {
      var w = wrong[0], name = cn(Math.floor(w / g.n), w % g.n);
      return { kind: 'mistake', cells: [w], focus: [w], set: [],
        text: user[w] === 1 ? 'The flower on ' + name + ' can’t be right: the puzzle’s only solution has no flower there. Remove it and ask again.'
          : name + ' is marked empty, but the puzzle’s only solution has a flower there. Clear that mark and ask again.' };
    }
    var s = Int8Array.from(user);
    if (isSolved(p, user)) return { kind: 'done', text: 'Every bed is planted – the puzzle is solved.', cells: [], focus: [], set: [] };
    var st = nextStep(g, s, 3);
    if (!st) {
      var miss = sol.indexOf(1, 0), i2;
      for (i2 = 0; i2 < sol.length; i2++) if (sol[i2] === 1 && user[i2] !== 1) { miss = i2; break; }
      return { kind: 'reveal', cells: [miss], focus: [miss], set: [[miss, 1]], text: 'No single-step deduction is left from here, so here is one flower: ' + cn(Math.floor(miss / g.n), miss % g.n) + '.' };
    }
    return { kind: 'deduction', tech: st.tech, tier: st.tier, text: st.text, cells: st.mark, focus: st.focus, set: st.set };
  }

  function isSolved(p, user) {
    for (var k = 0; k < p.solution.length; k++) if ((p.solution[k] === 1) !== (user[k] === 1)) return false;
    return true;
  }

  function conflicts(p, user) {
    // cells with a flower that clashes with another flower (shown in red as a gentle warning)
    var g = geom(p), out = {};
    for (var k = 0; k < user.length; k++) if (user[k] === 1) g.near[k].forEach(function (x) { if (user[x] === 1) { out[x] = 1; out[k] = 1; } });
    return Object.keys(out).map(Number);
  }

  return { name: 'Flower Beds', SIZES: SIZES, TIERS: TIERS, BED_NAMES: BED_NAMES, generate: generate, geometry: geometry, geom: geom,
    solveLogic: solveLogic, countSolutions: countSolutions, hint: hint, isSolved: isSolved, conflicts: conflicts,
    blockedBy: function (p, user) { return blockedBy(geom(p), user); }, nextStep: nextStep };
});
