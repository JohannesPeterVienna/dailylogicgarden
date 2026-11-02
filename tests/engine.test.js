// Engine tests: 60 consecutive daily seeds per puzzle type and level must give a puzzle with
// exactly one solution (independent brute-force count), solvable by the logic solver at its level
// and not below it; every "Why?" hint must state a deduction that agrees with the solution.
'use strict';
const test = require('node:test');
const assert = require('node:assert');
const core = require('../src/js/core.js');
const fb = require('../src/js/flowerbeds.js');
const tents = require('../src/js/tents.js');
const ss = require('../src/js/sunshade.js');
const gp = require('../src/js/gardenpath.js');
const wp = require('../src/js/whoplanted.js');

const START = '2026-11-02';
const DAYS = 60;
const LEVELS = core.LEVELS;

function startState(type, p) {
  if (type === 'flowerbeds') return new Int8Array(p.n * p.n);
  if (type === 'tents') return tents.initial(tents.geom(p));
  if (type === 'sunshade') return Int8Array.from(p.givens);
  if (type === 'gardenpath') { const g = gp.geom(p); const s = new Int8Array(g.edges.length); (p.hedges || []).forEach((e) => { s[e] = 2; }); return s; }
  return new Int8Array(wp.geom(p).size);
}
function sameSolution(type, p, state) {
  if (type === 'gardenpath') { const on = gp.solutionEdges(p); return Array.from(state).every((v, e) => (v === 1) === !!on[e]); }
  if (type === 'sunshade' || type === 'whoplanted' || type === 'tents') return Array.from(state).every((v, i) => v === p.solution[i]);
  return Array.from(state).every((v, i) => (v === 1) === (p.solution[i] === 1));
}
function count(type, p) {
  if (type === 'flowerbeds') return fb.countSolutions(fb.geom(p), 3);
  if (type === 'tents') return tents.countSolutions(tents.geom(p), 3);
  if (type === 'sunshade') return ss.countSolutions(ss.geom(p), p.givens, 3);
  if (type === 'gardenpath') return gp.countSolutions(gp.geom(p), 3);
  return wp.countSolutions(p, 3);
}
const MODS = { flowerbeds: fb, tents, sunshade: ss, gardenpath: gp, whoplanted: wp };

for (const type of Object.keys(MODS)) {
  const mod = MODS[type];
  for (const level of LEVELS) {
    test(`${type} ${level}: ${DAYS} daily seeds are unique and need ${level} techniques`, () => {
      for (let d = 0; d < DAYS; d++) {
        const key = core.addDays(START, d);
        const p = mod.generate(key, level);
        assert.strictEqual(count(type, p), 1, `${key}: brute force must find exactly one solution`);
        const g = mod.geom(p), tier = mod.TIERS[level];
        const res = mod.solveLogic(g, startState(type, p), tier);
        assert.ok(res.solved, `${key}: logic solver must finish at its level`);
        assert.ok(sameSolution(type, p, res.state), `${key}: logic result equals stored solution`);
        assert.strictEqual(res.maxTier, tier, `${key}: hardest technique used matches the level`);
        if (tier > 1) assert.ok(!mod.solveLogic(g, startState(type, p), tier - 1).solved, `${key}: easier techniques must not be enough`);
        // determinism: the same date gives the same puzzle
        if (d < 3) assert.deepStrictEqual(mod.generate(key, level).solution, p.solution);
      }
    });
  }
}

// ---------- hints ----------
function validSet(type, p, set) {
  if (type === 'gardenpath') { const on = gp.solutionEdges(p); return set.every(([e, v]) => (v === 1) === !!on[e]); }
  if (type === 'flowerbeds') return set.every(([k, v]) => (v === 1) === (p.solution[k] === 1));
  return set.every(([k, v]) => p.solution[k] === v);
}
function emptyUser(type, p) {
  if (type === 'gardenpath') return { path: [p.solution[0]], pencil: {} };
  if (type === 'tents') return Array.from(tents.initial(tents.geom(p)));
  if (type === 'sunshade') return p.givens.slice();
  return new Array(type === 'whoplanted' ? wp.geom(p).size : p.n * p.n).fill(0);
}
function apply(type, p, user, set) {
  if (type === 'gardenpath') {
    set.forEach(([e, v]) => { user.pencil[e] = v; });
    // the player follows confirmed connections from the head of the path
    const g = gp.geom(p);
    for (;;) {
      const head = user.path[user.path.length - 1], prev = user.path[user.path.length - 2];
      const next = g.cellEdges[head].map((e) => (user.pencil[e] === 1 ? (g.edges[e][0] === head ? g.edges[e][1] : g.edges[e][0]) : -1)).find((x) => x >= 0 && x !== prev && user.path.indexOf(x) < 0);
      if (next === undefined) break;
      user.path.push(next);
    }
    return;
  }
  set.forEach(([k, v]) => { user[k] = v; });
}

for (const type of Object.keys(MODS)) {
  const mod = MODS[type];
  test(`${type}: following only "Why?" hints solves the puzzle, and every hint is a valid deduction`, () => {
    for (const level of LEVELS) {
      for (let d = 0; d < 20; d++) {
        const p = mod.generate(core.addDays(START, d), level);
        const user = emptyUser(type, p);
        let guard = 0, h;
        while ((h = mod.hint(p, user)).kind !== 'done') {
          assert.strictEqual(h.kind, 'deduction', `${p.key} ${level}: expected a deduction, got ${h.kind}: ${h.text}`);
          assert.ok(h.set.length > 0 && validSet(type, p, h.set), `${p.key} ${level}: hint must agree with the solution: ${h.text}`);
          assert.ok(typeof h.text === 'string' && h.text.length > 20 && !/undefined|NaN/.test(h.text), 'hint text is a sentence: ' + h.text);
          apply(type, p, user, h.set);
          assert.ok(++guard < 2000, 'hint loop terminates');
        }
      }
    }
  });

  test(`${type}: hints from random partial and wrong states`, () => {
    const R = core.rng('hint-test-' + type);
    for (const level of LEVELS) {
      for (let d = 0; d < 10; d++) {
        const p = mod.generate(core.addDays(START, 30 + d), level);
        for (let t = 0; t < 6; t++) {
          let user = emptyUser(type, p);
          if (type === 'gardenpath') {
            user.path = p.solution.slice(0, 1 + R.int(p.solution.length - 1));
          } else {
            for (let k = 0; k < user.length; k++) if (R.next() < 0.4 && !(type === 'tents' && user[k] === 3)) user[k] = type === 'flowerbeds' ? (p.solution[k] === 1 ? 1 : 2) : p.solution[k];
          }
          const h = mod.hint(p, user);
          if (h.kind === 'done') continue;
          assert.strictEqual(h.kind, 'deduction', `${p.key}: ${h.text}`);
          assert.ok(validSet(type, p, h.set), `${p.key}: partial-state hint agrees with the solution: ${h.text}`);
          // now plant one wrong mark: the hint must point at a mistake
          if (type === 'gardenpath') {
            const g = gp.geom(p), head = user.path[user.path.length - 1];
            const wrong = g.cellEdges[head].map((e) => (g.edges[e][0] === head ? g.edges[e][1] : g.edges[e][0])).find((x) => user.path.indexOf(x) < 0 && x !== p.solution[user.path.length]);
            if (wrong === undefined) continue;
            user.path.push(wrong);
          } else {
            const cand = [];
            for (let k = 0; k < user.length; k++) if (user[k] === 0) cand.push(k);
            if (!cand.length) continue;
            const k = R.pick(cand);
            if (type === 'flowerbeds') user[k] = p.solution[k] === 1 ? 2 : 1;
            else if (type === 'tents') user[k] = p.solution[k] === 1 ? 2 : 1;
            else user[k] = p.solution[k] === 1 ? 2 : 1;
          }
          const m = mod.hint(p, user);
          assert.strictEqual(m.kind, 'mistake', `${p.key}: wrong mark must be reported`);
        }
      }
    }
  });
}

test('daily keys use the UTC date and archive arithmetic', () => {
  assert.strictEqual(core.dateKey(new Date(Date.UTC(2026, 10, 2, 23, 59))), '2026-11-02');
  assert.strictEqual(core.addDays('2026-03-01', -1), '2026-02-28');
  assert.strictEqual(core.addDays('2028-03-01', -1), '2028-02-29');
  assert.strictEqual(core.parseKey('2026-02-30'), null);
  assert.notStrictEqual(core.hash(core.seedFor('tents', 'bloom', '2026-11-02')), core.hash(core.seedFor('tents', 'bloom', '2026-11-03')));
});
