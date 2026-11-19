/*
 * Daily Logic Garden – technique catalogue and solution paths.
 * Every "Why?" hint carries the id of the technique the solver used. This file gives each id a
 * plain name, its level and the place where it is explained, and it can replay a whole board:
 * path() follows the hints from the empty board to the solved one and records every step.
 */
(function (root, factory) {
  var core = typeof module !== 'undefined' && module.exports ? require('./core.js') : root.DLG.core;
  var api = factory(core);
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.DLG.tech = api;
})(this, function (core) {
  'use strict';
  var SB = '/guides/star-battle-strategy/', TT = '/guides/tents-and-trees-rules-strategy/', BP = '/guides/binary-puzzle-rules/', LG = '/guides/solve-logic-grid-puzzles/', GP = '/garden-path/';
  // [id, name, level (1 Sprout, 2 Bloom, 3 Grove), where it is explained]
  var LIST = {
    flowerbeds: [
      ['last-spot', 'Last open square', 1, SB + '#t1-2'],
      ['confined', 'Confinement', 2, SB + '#t3-4'],
      ['touch-all', 'Touch-all', 2, SB + '#t5'],
      ['k-confined', 'Beds and lines in groups', 3, '/guides/three-beds-three-rows/']
    ],
    tents: [
      ['no-tree', 'No tree beside it', 1, TT + '#sweep'],
      ['line-full', 'Line complete', 1, TT + '#sweep'],
      ['line-fill', 'Line must fill', 1, TT + '#sweep'],
      ['lone-tree', 'Tree with one open side', 1, TT + '#sweep'],
      ['line-fit', 'Fitting tents into a line', 2, TT + '#fit'],
      ['pairing', 'Pairing', 2, TT + '#pairing'],
      ['lookahead', 'One-tent look-ahead', 3, TT + '#lookahead']
    ],
    sunshade: [
      ['pair', 'Pair', 1, BP + '#basic'],
      ['sandwich', 'Sandwich', 1, BP + '#basic'],
      ['count', 'Count', 1, BP + '#basic'],
      ['last-one', 'Last one', 2, BP + '#lastone'],
      ['line', 'Full-line counting', 3, BP + '#full'],
      ['cross', 'Line check against crossing lines', 3, BP + '#crossing']
    ],
    gardenpath: [
      ['forced', 'Only ways left', 1, GP + '#example'],
      ['skip', 'No skipping a number', 1, GP + '#levels'],
      ['loop', 'No closed loop', 1, GP + '#levels'],
      ['bridge', 'Only way in', 2, GP + '#levels'],
      ['dead-end', 'No dead end', 2, GP + '#levels'],
      ['split', 'Don’t cut the garden', 2, GP + '#levels'],
      ['order', 'Stone order', 3, GP + '#levels']
    ],
    whoplanted: [
      ['clue', 'Direct clue', 1, LG + '#direct'],
      ['one-each', 'One per row and column', 1, LG + '#lines'],
      ['transfer', 'Transfer between grids', 1, LG + '#transfer'],
      ['either', 'Either – or', 2, LG + '#direct'],
      ['ends', 'Ends of an ordering', 2, LG + '#order'],
      ['either-way', 'Same result either way', 2, LG + '#transfer'],
      ['fit', 'Positions that fit', 3, LG + '#order']
    ]
  };
  var TYPES = ['flowerbeds', 'tents', 'sunshade', 'gardenpath', 'whoplanted'];
  var BY = {};
  TYPES.forEach(function (t) { BY[t] = {}; LIST[t].forEach(function (x, i) { BY[t][x[0]] = { id: x[0], name: x[1], tier: x[2], href: x[3], index: i }; }); });
  function get(type, id) { return (BY[type] && BY[type][id]) || null; }
  function ids(type) { return LIST[type].map(function (x) { return x[0]; }); }

  // the board before the first move, in the shape the player and the hints use
  function blank(type, mod, p) {
    if (type === 'gardenpath') return { path: [p.solution[0]], pencil: {} };
    if (type === 'tents') return Array.from(mod.initial(mod.geom(p)));
    if (type === 'sunshade') return p.givens.slice();
    if (type === 'whoplanted') return new Array(mod.geom(p).size).fill(0);
    return new Array(p.n * p.n).fill(0);
  }
  // Garden Path: the drawn path follows confirmed connections from its head
  function followPencil(mod, p, user) {
    var g = mod.geom(p);
    for (;;) {
      var head = user.path[user.path.length - 1], prev = user.path[user.path.length - 2], next = -1;
      g.cellEdges[head].forEach(function (e) {
        if (user.pencil[e] !== 1) return;
        var o = g.edges[e][0] === head ? g.edges[e][1] : g.edges[e][0];
        if (o !== prev && user.path.indexOf(o) < 0) next = o;
      });
      if (next < 0) break;
      user.path.push(next);
    }
  }
  // write one hint onto the board (the hint's own marks only, nothing filled in automatically)
  function apply(type, mod, p, user, set) {
    if (type === 'gardenpath') { set.forEach(function (q) { user.pencil[q[0]] = q[1]; }); followPencil(mod, p, user); return; }
    set.forEach(function (q) { user[q[0]] = q[1]; });
  }
  // The whole solution path: every hint from the empty board until the puzzle is solved.
  function path(type, mod, p) {
    var user = blank(type, mod, p), steps = [], h;
    while ((h = mod.hint(p, user)).kind !== 'done') {
      if (!h.set || !h.set.length || steps.length > 3000) throw new Error('techniques: no path for ' + type + ' ' + p.level + ' ' + p.key);
      steps.push({ tech: h.kind === 'deduction' ? h.tech : 'reveal', tier: h.tier || 0, text: h.text, cells: h.cells || [], focus: h.focus || [], set: h.set });
      apply(type, mod, p, user, h.set);
    }
    return steps;
  }
  // the board after the first k steps of a path
  function stateAt(type, mod, p, steps, k) {
    var user = blank(type, mod, p);
    for (var i = 0; i < k && i < steps.length; i++) apply(type, mod, p, user, steps[i].set);
    return user;
  }
  // how often each technique appears in a path, in catalogue order
  function tally(type, steps) {
    var out = ids(type).map(function () { return 0; });
    steps.forEach(function (s) { var t = get(type, s.tech); if (t) out[t.index]++; });
    return out;
  }
  function listing(type, level, key, steps) {
    return steps.map(function (s, i) { var t = get(type, s.tech); return (i + 1) + '. [' + (t ? t.name : 'Reveal') + '] ' + s.text; }).join('\n');
  }

  return { LIST: LIST, TYPES: TYPES, get: get, ids: ids, blank: blank, followPencil: followPencil, apply: apply, path: path, stateAt: stateAt, tally: tally, listing: listing };
});
