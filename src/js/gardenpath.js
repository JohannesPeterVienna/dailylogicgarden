/*
 * Garden Path – draw one path that starts at stone 1, visits the numbered stones in order,
 * ends at the last stone and passes through every square exactly once.
 * Solver works on the connections between neighbouring squares: 0 = open, 1 = used, 2 = never used.
 */
(function (root, factory) {
  var core = typeof module !== 'undefined' && module.exports ? require('./core.js') : root.DLG.core;
  var api = factory(core);
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.DLG.gardenpath = api;
})(this, function (core) {
  'use strict';
  var SIZES = { sprout: 5, bloom: 6, grove: 7 };
  var TIERS = { sprout: 1, bloom: 2, grove: 3 };
  var HEDGES = { sprout: 0, bloom: 0.25, grove: 0.15 };
  var cn = core.cellName;

  function geometry(n, stones, hedges) {
    var edges = [], cellEdges = [], edgeAt = {};
    for (var k = 0; k < n * n; k++) cellEdges.push([]);
    for (k = 0; k < n * n; k++) {
      var r = Math.floor(k / n), c = k % n;
      if (c + 1 < n) add(k, k + 1);
      if (r + 1 < n) add(k, k + n);
    }
    function add(a, b) { var id = edges.length; edges.push([a, b]); cellEdges[a].push(id); cellEdges[b].push(id); edgeAt[a + ',' + b] = edgeAt[b + ',' + a] = id; }
    var stoneAt = new Array(n * n).fill(0), last = 0;
    Object.keys(stones).forEach(function (cell) { stoneAt[+cell] = stones[cell]; last = Math.max(last, stones[cell]); });
    var need = [];
    for (k = 0; k < n * n; k++) need.push(stoneAt[k] === 1 || stoneAt[k] === last ? 1 : 2);
    return { n: n, edges: edges, cellEdges: cellEdges, edgeAt: edgeAt, stoneAt: stoneAt, last: last, need: need, hedges: hedges || [] };
  }
  function blank(g) {
    var s = new Int8Array(g.edges.length);
    g.hedges.forEach(function (e) { s[e] = 2; });
    return s;
  }
  function nm(g, k) { return cn(Math.floor(k / g.n), k % g.n); }
  function edgeName(g, e) { return nm(g, g.edges[e][0]) + '–' + nm(g, g.edges[e][1]); }
  function otherEnd(g, e, k) { return g.edges[e][0] === k ? g.edges[e][1] : g.edges[e][0]; }
  function stoneTxt(g, k) { return g.stoneAt[k] ? 'stone ' + g.stoneAt[k] + ' (' + nm(g, k) + ')' : nm(g, k); }
  function cnt(g, s, k, v) { var c = 0; g.cellEdges[k].forEach(function (e) { if (s[e] === v) c++; }); return c; }

  function saturate(g, s) {
    var changed = true;
    while (changed) {
      changed = false;
      for (var k = 0; k < g.need.length; k++) {
        if (cnt(g, s, k, 1) >= g.need[k]) g.cellEdges[k].forEach(function (e) { if (s[e] === 0) { s[e] = 2; changed = true; } });
      }
    }
  }
  // chains of used connections: for every cell, the far end of its chain and the chain's cells in order
  function chains(g, s) {
    var n2 = g.need.length, seen = new Array(n2).fill(false), out = [], chainOf = new Array(n2);
    for (var k = 0; k < n2; k++) {
      if (seen[k] || cnt(g, s, k, 1) === 2) continue;
      var list = [k], prev = -1, cur = k;
      seen[k] = true;
      for (;;) {
        var nx = -1;
        g.cellEdges[cur].forEach(function (e) { if (s[e] === 1) { var o = otherEnd(g, e, cur); if (o !== prev) nx = o; } });
        if (nx < 0 || seen[nx]) break;
        prev = cur; cur = nx; seen[cur] = true; list.push(cur);
      }
      var id = out.length;
      out.push(list);
      list.forEach(function (x) { chainOf[x] = id; });
    }
    return { list: out, of: chainOf };
  }
  function chainOk(g, cells, total) {
    // stones along the chain must be consecutive numbers in one direction; 1 and the last stone only at ends
    var nums = [], i;
    for (i = 0; i < cells.length; i++) if (g.stoneAt[cells[i]]) nums.push([i, g.stoneAt[cells[i]]]);
    if (nums.length >= 2) {
      var dir = nums[1][1] - nums[0][1];
      if (dir !== 1 && dir !== -1) return false;
      for (i = 1; i < nums.length; i++) if (nums[i][1] - nums[i - 1][1] !== dir) return false;
    }
    for (i = 0; i < nums.length; i++) {
      var v = nums[i][1], pos = nums[i][0];
      if ((v === 1 || v === g.last) && pos !== 0 && pos !== cells.length - 1) return false;
    }
    var has1 = nums.some(function (p) { return p[1] === 1; }), hasL = nums.some(function (p) { return p[1] === g.last; });
    if (has1 && hasL && cells.length !== total) return false;
    return true;
  }

  function forcedDegree(g, s) {
    for (var k = 0; k < g.need.length; k++) {
      var on = cnt(g, s, k, 1), un = cnt(g, s, k, 0);
      if (un > 0 && on + un === g.need[k]) {
        var es = g.cellEdges[k].filter(function (e) { return s[e] === 0; });
        var nb = g.cellEdges[k].filter(function (e) { return s[e] !== 2; }).map(function (e) { return otherEnd(g, e, k); });
        var text;
        if (g.need[k] === 1) text = 'Stone ' + g.stoneAt[k] + ' is an end of the path and ' + nm(g, nb[0]) + ' is its only way out, so the path runs ' + nm(g, k) + ' → ' + nm(g, nb[0]) + '.';
        else text = (g.stoneAt[k] ? 'Stone ' + g.stoneAt[k] + ' on ' + nm(g, k) : nm(g, k)) + ' has only two ways left to go – ' + nm(g, nb[0]) + ' and ' + nm(g, nb[1]) + ' – so the path must pass ' + nm(g, nb[0]) + ' → ' + nm(g, k) + ' → ' + nm(g, nb[1]) + '.';
        return { tier: 1, tech: 'forced', set: es.map(function (e) { return [e, 1]; }), focus: [k].concat(nb), mark: [k], text: text };
      }
    }
    return null;
  }
  function skipRule(g, s) {
    for (var e = 0; e < g.edges.length; e++) {
      if (s[e] !== 0) continue;
      var a = g.stoneAt[g.edges[e][0]], b = g.stoneAt[g.edges[e][1]];
      if (a && b && Math.abs(a - b) !== 1) return { tier: 1, tech: 'skip', set: [[e, 2]], focus: g.edges[e].slice(), mark: [], edge: e,
        text: 'Stones ' + Math.min(a, b) + ' and ' + Math.max(a, b) + ' are not consecutive, so the path never steps directly between ' + edgeName(g, e) + '.' };
    }
    return null;
  }
  function noLoop(g, s) {
    var ch = chains(g, s), total = g.need.length;
    for (var e = 0; e < g.edges.length; e++) {
      if (s[e] !== 0) continue;
      var a = g.edges[e][0], b = g.edges[e][1];
      if (ch.of[a] !== undefined && ch.of[a] === ch.of[b] && ch.list[ch.of[a]].length > 1) return { tier: 1, tech: 'loop', set: [[e, 2]], focus: ch.list[ch.of[a]].slice(), mark: [], edge: e,
        text: nm(g, a) + ' and ' + nm(g, b) + ' are already the two ends of one stretch of path, so joining them would close a loop – that step is never used.' };
    }
    return null;
  }
  function orderRule(g, s) {
    var ch = chains(g, s), total = g.need.length;
    for (var e = 0; e < g.edges.length; e++) {
      if (s[e] !== 0) continue;
      var a = g.edges[e][0], b = g.edges[e][1];
      var A = ch.list[ch.of[a]], B = ch.list[ch.of[b]];
      if (!A || !B || A === B) continue;
      var left = A[0] === a ? A.slice().reverse() : A.slice();
      var right = B[0] === b ? B.slice() : B.slice().reverse();
      if (left[left.length - 1] !== a || right[0] !== b) continue;
      var merged = left.concat(right);
      if (!chainOk(g, merged, total)) {
        var sa = left.filter(function (x) { return g.stoneAt[x]; }).map(function (x) { return g.stoneAt[x]; });
        var sb = right.filter(function (x) { return g.stoneAt[x]; }).map(function (x) { return g.stoneAt[x]; });
        var why = sa.length && sb.length ? 'the stones ' + core.listJoin(sa.concat(sb).sort(function (x, y) { return x - y; }).map(String)) + ' would no longer come in order along it'
          : 'an end stone would end up in the middle of the path';
        return { tier: 3, tech: 'order', set: [[e, 2]], focus: left.concat(right), mark: [], edge: e,
          text: 'Joining ' + nm(g, a) + ' to ' + nm(g, b) + ' would link two stretches of path so that ' + why + ', so that step is never used.' };
      }
    }
    return null;
  }
  function reachable(g, s, from) {
    var seen = {}, stack = [from], c = 0;
    seen[from] = 1;
    while (stack.length) {
      var x = stack.pop(); c++;
      g.cellEdges[x].forEach(function (e) { if (s[e] !== 2) { var o = otherEnd(g, e, x); if (!seen[o]) { seen[o] = 1; stack.push(o); } } });
    }
    return { count: c, seen: seen };
  }
  function bridge(g, s) {
    for (var e = 0; e < g.edges.length; e++) {
      if (s[e] !== 0) continue;
      s[e] = 2;
      var R = reachable(g, s, g.edges[e][0]);
      s[e] = 0;
      if (R.count < g.need.length) {
        var cut = [];
        for (var k = 0; k < g.need.length; k++) if (!R.seen[k]) cut.push(k);
        var small = cut.length <= g.need.length - cut.length ? cut : Object.keys(R.seen).map(Number);
        return { tier: 2, tech: 'bridge', set: [[e, 1]], focus: small, mark: g.edges[e].slice(), edge: e,
          text: 'The ' + core.plural(small.length, 'square') + ' around ' + nm(g, small[0]) + ' can only be reached through the step ' + edgeName(g, e) + ', so the path must use it.' };
      }
    }
    return null;
  }
  function deadEnd(g, s) {
    for (var e = 0; e < g.edges.length; e++) {
      if (s[e] !== 0) continue;
      var t = Int8Array.from(s);
      t[e] = 1;
      saturate(g, t);
      for (var k = 0; k < g.need.length; k++) if (cnt(g, t, k, 1) + cnt(g, t, k, 0) < g.need[k]) {
        return { tier: 2, tech: 'dead-end', set: [[e, 2]], focus: [k].concat(g.edges[e]), mark: [k], edge: e,
          text: 'Using the step ' + edgeName(g, e) + ' would take away a way in or out of ' + nm(g, k) + ' that it still needs, turning it into a dead end, so that step is never used.' };
      }
    }
    return null;
  }
  function split(g, s) {
    for (var e = 0; e < g.edges.length; e++) {
      if (s[e] !== 0) continue;
      var t = Int8Array.from(s);
      t[e] = 1;
      saturate(g, t);
      var R = reachable(g, t, 0);
      if (R.count < g.need.length) return { tier: 2, tech: 'split', set: [[e, 2]], focus: g.edges[e].slice(), mark: g.edges[e].slice(), edge: e,
        text: 'Using the step ' + edgeName(g, e) + ' would use up the neighbouring squares’ last free connections and cut the garden into two parts that one path can’t both cover, so that step is never used.' };
    }
    return null;
  }

  var TECHNIQUES = [forcedDegree, skipRule, noLoop, bridge, deadEnd, split, orderRule];
  var TECH_TIER = [1, 1, 1, 2, 2, 2, 3];
  function nextStep(g, s, maxTier) {
    saturate(g, s);
    for (var i = 0; i < TECHNIQUES.length; i++) {
      if (TECH_TIER[i] > maxTier) continue;
      var st = TECHNIQUES[i](g, s);
      if (st) return st;
    }
    return null;
  }
  function broken(g, s) {
    for (var k = 0; k < g.need.length; k++) {
      var on = cnt(g, s, k, 1);
      if (on > g.need[k] || on + cnt(g, s, k, 0) < g.need[k]) return true;
    }
    var ch = chains(g, s);
    for (var i = 0; i < ch.list.length; i++) if (!chainOk(g, ch.list[i], g.need.length)) return true;
    // a closed loop has no chain ends: every cell on it has degree 2 and is not in any chain list
    var covered = 0;
    ch.list.forEach(function (l) { covered += l.length; });
    return covered < g.need.length;
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
    saturate(g, s);
    var solved = !s.some(function (v) { return v === 0; }) && !broken(g, s);
    return { solved: solved, state: s, maxTier: used, steps: steps };
  }
  function pathFromEdges(g, s) {
    var start = g.stoneAt.indexOf(1), path = [start], prev = -1, cur = start;
    for (var i = 1; i < g.need.length; i++) {
      var nx = -1;
      g.cellEdges[cur].forEach(function (e) { if (s[e] === 1) { var o = otherEnd(g, e, cur); if (o !== prev) nx = o; } });
      if (nx < 0) break;
      prev = cur; cur = nx; path.push(cur);
    }
    return path;
  }

  // brute force over all paths from stone 1, visiting stones in order
  function countSolutions(g, limit) {
    var n = g.n, N = n * n, visited = new Array(N).fill(false), count = 0;
    limit = limit || 2;
    var start = g.stoneAt.indexOf(1);
    var blocked = {};
    g.hedges.forEach(function (e) { blocked[e] = 1; });
    function nbrs(k) { return g.cellEdges[k].filter(function (e) { return !blocked[e]; }).map(function (e) { return otherEnd(g, e, k); }); }
    function connectedRest(from, left) {
      // every unvisited cell must be reachable from the head through unvisited cells
      var seen = {}, stack = [from], c = 0;
      seen[from] = 1;
      while (stack.length) {
        var x = stack.pop();
        nbrs(x).forEach(function (y) { if (!visited[y] && !seen[y]) { seen[y] = 1; c++; stack.push(y); } });
      }
      return c === left;
    }
    (function rec(k, depth, nextStone) {
      if (count >= limit) return;
      if (depth === N) { if (g.stoneAt[k] === g.last) count++; return; }
      if (g.stoneAt[k] === g.last) return;
      if (!connectedRest(k, N - depth)) return;
      var ns = nbrs(k);
      for (var i = 0; i < ns.length; i++) {
        var y = ns[i];
        if (visited[y]) continue;
        var st = g.stoneAt[y];
        if (st && st !== nextStone) continue;
        visited[y] = true;
        rec(y, depth + 1, st ? nextStone + 1 : nextStone);
        visited[y] = false;
      }
    })(start, 1, (visited[start] = true, 2));
    return count;
  }

  function randomPath(n, R) {
    var path = [];
    for (var r = 0; r < n; r++) for (var c = 0; c < n; c++) path.push(r * n + (r % 2 ? n - 1 - c : c));
    var N = n * n, pos = new Array(N);
    function index() { path.forEach(function (x, i) { pos[x] = i; }); }
    index();
    for (var it = 0; it < N * 40; it++) {
      if (R.next() < 0.5) { path.reverse(); index(); }
      var end = path[N - 1], er = Math.floor(end / n), ec = end % n;
      var cand = [[er - 1, ec], [er + 1, ec], [er, ec - 1], [er, ec + 1]].filter(function (p) { return p[0] >= 0 && p[1] >= 0 && p[0] < n && p[1] < n; })
        .map(function (p) { return p[0] * n + p[1]; }).filter(function (x) { return x !== path[N - 2]; });
      if (!cand.length) continue;
      var x = R.pick(cand), i = pos[x];
      var tail = path.slice(i + 1).reverse();
      path = path.slice(0, i + 1).concat(tail);
      index();
    }
    return path;
  }
  function stonesFrom(path, idxs) {
    var st = {};
    idxs.slice().sort(function (a, b) { return a - b; }).forEach(function (i, j) { st[path[i]] = j + 1; });
    return st;
  }
  function solvable(n, path, idxs, tier, hedges) {
    var g = geometry(n, stonesFrom(path, idxs), hedges);
    return solveLogic(g, blank(g), tier);
  }

  function generate(key, level, opts) {
    level = level in SIZES ? level : 'sprout';
    var n = SIZES[level], target = TIERS[level], N = n * n;
    var R = core.rng(core.seedFor('gardenpath', level, key));
    var maxAttempts = (opts && opts.maxAttempts) || 400;
    for (var attempt = 1; attempt <= maxAttempts; attempt++) {
      var path = randomPath(n, R);
      var idxs = [0, N - 1], guard = 0, hedges = [];
      if (HEDGES[level]) {
        var tmp = geometry(n, {}), onPath = {};
        for (var q = 1; q < N; q++) onPath[tmp.edgeAt[path[q - 1] + ',' + path[q]]] = 1;
        for (q = 0; q < tmp.edges.length; q++) if (!onPath[q] && R.next() < HEDGES[level]) hedges.push(q);
      }
      var want = Math.max(2, Math.round(n * (target === 1 ? 1.2 : 0.9)));
      while (idxs.length < want) { var x = 1 + R.int(N - 2); if (idxs.indexOf(x) < 0) idxs.push(x); }
      while (!solvable(n, path, idxs, target, hedges).solved && guard++ < N) {
        // add a stone in the middle of the longest stretch without one
        var sorted = idxs.slice().sort(function (a, b) { return a - b; }), best = 0, at = 0;
        for (var i = 1; i < sorted.length; i++) if (sorted[i] - sorted[i - 1] > best) { best = sorted[i] - sorted[i - 1]; at = sorted[i - 1]; }
        if (best < 2) break;
        idxs.push(at + 1 + R.int(best - 1));
      }
      if (!solvable(n, path, idxs, target, hedges).solved) continue;
      // drop stones that are not needed
      var inner = R.shuffle(idxs.filter(function (i) { return i !== 0 && i !== N - 1; }));
      for (i = 0; i < inner.length; i++) {
        var trial = idxs.filter(function (v) { return v !== inner[i]; });
        if (solvable(n, path, trial, target, hedges).solved) idxs = trial;
      }
      var stones = stonesFrom(path, idxs), g = geometry(n, stones, hedges);
      var res = solveLogic(g, blank(g), target);
      if (!res.solved || res.maxTier !== target) continue;
      if (target > 1 && solveLogic(g, blank(g), target - 1).solved) continue;
      if (countSolutions(g, 2) !== 1) continue;
      return { type: 'gardenpath', key: key, level: level, n: n, stones: stones, hedges: hedges, solution: path, attempts: attempt, g: g };
    }
    throw new Error('gardenpath: no puzzle for ' + key + ' ' + level);
  }
  function geom(p) { if (!p.g) p.g = geometry(p.n, p.stones, p.hedges); return p.g; }

  // user = { path: [cells from stone 1], pencil: { edgeId: 1|2 } } (pencil holds earlier hints)
  function edgeState(p, user) {
    var g = geom(p), s = blank(g);
    for (var i = 1; i < user.path.length; i++) {
      var e = g.edgeAt[user.path[i - 1] + ',' + user.path[i]];
      if (e !== undefined) s[e] = 1;
    }
    Object.keys(user.pencil || {}).forEach(function (e) { if (!s[e]) s[e] = user.pencil[e]; });
    return s;
  }
  function solutionEdges(p) {
    var g = geom(p), on = {};
    for (var i = 1; i < p.solution.length; i++) on[g.edgeAt[p.solution[i - 1] + ',' + p.solution[i]]] = 1;
    return on;
  }
  function hint(p, user) {
    var g = geom(p), sol = p.solution;
    for (var i = 0; i < user.path.length; i++) {
      if (user.path[i] !== sol[i]) return { kind: 'mistake', cells: [user.path[i]], focus: [user.path[i - 1], user.path[i]], set: [],
        text: 'The path leaves the only solution at ' + nm(g, user.path[i]) + ': from ' + nm(g, user.path[i - 1]) + ' it has to go elsewhere. Back up to ' + nm(g, user.path[i - 1]) + ' and ask again.' };
    }
    if (isSolved(p, user)) return { kind: 'done', text: 'The path covers the whole garden – the puzzle is solved.', cells: [], focus: [], set: [] };
    var s = edgeState(p, user), solOn = solutionEdges(p);
    var st = nextStep(g, s, 3);
    while (st && st.set.every(function (q) { return s[q[0]] === q[1]; })) st = null;
    if (!st) {
      var nx = sol[user.path.length], e = g.edgeAt[sol[user.path.length - 1] + ',' + nx];
      return { kind: 'reveal', cells: [nx], focus: [nx], set: [[e, 1]], text: 'No single-step deduction is left from here, so here is the next step: ' + nm(g, sol[user.path.length - 1]) + ' → ' + nm(g, nx) + '.' };
    }
    return { kind: 'deduction', tech: st.tech, tier: st.tier, text: st.text, cells: st.mark, focus: st.focus, set: st.set, edges: true };
  }
  function isSolved(p, user) {
    if (user.path.length !== p.solution.length) return false;
    for (var i = 0; i < user.path.length; i++) if (user.path[i] !== p.solution[i]) return false;
    return true;
  }

  return { name: 'Garden Path', SIZES: SIZES, TIERS: TIERS, generate: generate, geometry: geometry, geom: geom,
    solveLogic: solveLogic, countSolutions: countSolutions, hint: hint, isSolved: isSolved, edgeState: edgeState,
    solutionEdges: solutionEdges, pathFromEdges: pathFromEdges, nextStep: nextStep, saturate: saturate };
});
