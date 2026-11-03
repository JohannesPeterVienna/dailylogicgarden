// Unit tests for src/js/saves.js – the checks for local saves, garden imports and the address (Codex DL1–DL4).
'use strict';
const test = require('node:test');
const assert = require('node:assert');
const S = require('../src/js/saves.js');
const core = require('../src/js/core.js');
const fb = require('../src/js/flowerbeds.js');
const tents = require('../src/js/tents.js');
const ss = require('../src/js/sunshade.js');
const gp = require('../src/js/gardenpath.js');
const wp = require('../src/js/whoplanted.js');

const L = '2026-11-02', T = '2026-11-20';
const plant = (x = {}) => ({ type: 'flowerbeds', level: 'sprout', key: '2026-11-10', hints: 2, secs: 61.4, at: '2026-11-10', ...x });

test('DL1: an import listing the same plant twice adds it once; existing plants are not repeated', () => {
  const r = S.mergeImport({ v: 1, plants: [] }, { plants: [plant(), plant(), plant({ level: 'bloom' })] }, L, T);
  assert.strictEqual(r.added, 2);
  assert.strictEqual(r.skipped, 1);
  assert.strictEqual(r.garden.plants.length, 2);
  const again = S.mergeImport(r.garden, { plants: [plant()] }, L, T);
  assert.strictEqual(again.added, 0);
  // stored duplicates are removed when the garden is read
  assert.strictEqual(S.cleanGarden({ v: 1, plants: [plant(), plant()] }, L, T).plants.length, 1);
});

test('DL2: corrupt garden store gives an empty garden instead of an error, bad entries are dropped', () => {
  for (const raw of [{ v: 1, plants: {} }, null, 42, 'x', [], { plants: 'a' }]) assert.deepStrictEqual(S.cleanGarden(raw, L, T), { v: 1, plants: [] });
  const g = S.cleanGarden({ v: 1, plants: [plant(), null, 5, { type: 'x' }, plant({ level: 'grove' })] }, L, T);
  assert.strictEqual(g.plants.length, 2);
});

function puzzles() {
  const key = '2026-11-05';
  return [['flowerbeds', fb], ['tents', tents], ['sunshade', ss], ['gardenpath', gp], ['whoplanted', wp]].map(([type, mod]) => ({ type, mod, p: mod.generate(key, 'sprout') }));
}
function blank(type, mod, p) {
  if (type === 'gardenpath') return { path: [p.solution[0]], pencil: {} };
  if (type === 'tents') return Array.from(mod.initial(mod.geom(p)));
  if (type === 'sunshade') return p.givens.slice();
  if (type === 'whoplanted') return new Array(mod.geom(p).size).fill(0);
  return new Array(p.n * p.n).fill(0);
}
test('DL2: saved boards must match the puzzle exactly (length, values, givens, trees, path)', () => {
  for (const { type, mod, p } of puzzles()) {
    const ok = blank(type, mod, p);
    assert.ok(S.cleanSave(type, p, mod, { u: ok, h: 1, t: 10, s: false }), type + ' blank board accepted');
    for (const u of [{}, null, 'x', 5]) assert.strictEqual(S.cleanSave(type, p, mod, { u, h: 0, t: 0 }), null, type + ' ' + JSON.stringify(u));
    assert.strictEqual(S.cleanSave(type, p, mod, null), null);
    assert.strictEqual(S.cleanSave(type, p, mod, { v: 1, plants: {} }), null);
    if (type !== 'gardenpath') {
      assert.strictEqual(S.cleanSave(type, p, mod, { u: ok.slice(0, 3) }), null, type + ' too short');
      assert.strictEqual(S.cleanSave(type, p, mod, { u: ok.concat([0]) }), null, type + ' too long');
      for (const bad of [-1, 99, 1.5, '1', null]) {
        const u = ok.slice(); const k = u.findIndex((v, i) => v === 0 && !(type === 'sunshade' && p.givens[i]));
        u[k] = bad;
        assert.strictEqual(S.cleanSave(type, p, mod, { u }), null, `${type} value ${bad}`);
      }
    }
  }
  const { p: tp, mod: tm } = puzzles().find((x) => x.type === 'tents');
  const noTree = blank('tents', tm, tp); noTree[tp.trees[0]] = 0;
  assert.strictEqual(S.cleanSave('tents', tp, tm, { u: noTree }), null, 'tree removed');
  const extraTree = blank('tents', tm, tp); extraTree[extraTree.indexOf(0)] = 3;
  assert.strictEqual(S.cleanSave('tents', tp, tm, { u: extraTree }), null, 'tree added');
  const { p: sp, mod: sm } = puzzles().find((x) => x.type === 'sunshade');
  const changed = blank('sunshade', sm, sp); const gi = sp.givens.findIndex((v) => v);
  changed[gi] = sp.givens[gi] === 1 ? 2 : 1;
  assert.strictEqual(S.cleanSave('sunshade', sp, sm, { u: changed }), null, 'given changed');
  const { p: gpp, mod: gpm } = puzzles().find((x) => x.type === 'gardenpath');
  const sol = gpp.solution;
  assert.ok(S.cleanSave('gardenpath', gpp, gpm, { u: { path: sol.slice(0, 4), pencil: { 0: 1, 99999: 1, x: 1, 1: 7 } } }));
  assert.deepStrictEqual(S.cleanSave('gardenpath', gpp, gpm, { u: { path: sol.slice(0, 2), pencil: { 0: 1, 99999: 1, x: 1, 1: 7 } } }).u.pencil, { 0: 1 });
  assert.strictEqual(S.cleanSave('gardenpath', gpp, gpm, { u: { path: [sol[1]] } }), null, 'wrong start');
  assert.strictEqual(S.cleanSave('gardenpath', gpp, gpm, { u: { path: [sol[0], sol[0] + 2 * gpp.n + 2] } }), null, 'not adjacent');
  assert.strictEqual(S.cleanSave('gardenpath', gpp, gpm, { u: { path: [sol[0], sol[1], sol[0]] } }), null, 'cell twice');
  assert.strictEqual(S.cleanSave('gardenpath', gpp, gpm, { u: { path: [sol[0], -1] } }), null, 'out of bounds');
  assert.strictEqual(S.cleanSave('gardenpath', gpp, gpm, { u: { path: [sol[0]], pencil: [] } }), null, 'pencil not an object');
  if ((gpp.hedges || []).length) {
    const e = gpm.geom(gpp).edges[gpp.hedges[0]];
    // a path stepping through a hedge is refused even when it starts correctly
    const viaHedge = S.cleanBoard('gardenpath', { ...gpp, solution: [e[0]] }, gpm, { path: [e[0], e[1]] });
    assert.strictEqual(viaHedge, null, 'through a hedge');
  }
});
test('DL2/DL4: hints and time of a saved board must be finite, non-negative and bounded', () => {
  const { type, mod, p } = puzzles()[0];
  const u = blank(type, mod, p);
  const r = (h, t) => S.cleanSave(type, p, mod, { u, h, t, s: true });
  assert.deepStrictEqual([r(3, 40).h, r(3, 40).t, r(3, 40).s], [3, 40, true]);
  for (const [h, t] of [[-1, -5], [Infinity, NaN], [1e999, 1e999], ['3', '40'], [1.5, S.MAX_SECS + 1]]) {
    const x = r(h, t);
    assert.strictEqual(x.h, 0); assert.strictEqual(x.t, 0);
  }
});

test('DL3: badly encoded address values are ignored, never thrown', () => {
  assert.doesNotThrow(() => S.parseQuery('?date=%E0%A4%A'));
  assert.deepStrictEqual(S.parseQuery('?date=%E0%A4%A&level=bloom'), { level: 'bloom' });
  assert.deepStrictEqual(S.parseQuery('?level=%ZZ'), {});
  assert.deepStrictEqual(S.parseQuery('?date=2026-11-05&level=grove&x=1'), { date: '2026-11-05', level: 'grove' });
  assert.deepStrictEqual(S.parseQuery(''), {});
  assert.strictEqual(S.dayInRange('9999-12-31', L, T), false);
  assert.strictEqual(S.dayInRange('2026-02-30', L, T), false);
  assert.strictEqual(S.dayInRange('2026-11-01', L, T), false);
  assert.strictEqual(S.dayInRange(T, L, T), true);
  assert.strictEqual(core.LEVELS.includes(S.parseQuery('?level=%ZZ').level), false);
});

test('DL4: imports refuse negative/non-finite counts, future or pre-launch days and oversized files', () => {
  const bad = [plant({ hints: -1 }), plant({ secs: -1 }), plant({ secs: JSON.parse('1e999') }), plant({ secs: null }), plant({ hints: 1.5 }),
    plant({ hints: S.MAX_HINTS + 1 }), plant({ secs: S.MAX_SECS + 1 }), plant({ key: '9999-12-31' }), plant({ key: '2026-11-22' }), plant({ key: '2026-11-01' }),
    plant({ key: '2026-02-30' }), plant({ type: 'sudoku' }), plant({ level: 'tree' }), plant({ hints: '2' })];
  const r = S.mergeImport({ v: 1, plants: [] }, { plants: bad }, L, T);
  assert.strictEqual(r.added, 0);
  assert.strictEqual(r.skipped, bad.length);
  const ok = S.mergeImport({ v: 1, plants: [] }, { plants: [plant({ at: '9999-12-31' })] }, L, T);
  assert.strictEqual(ok.garden.plants[0].at, '2026-11-10', 'impossible planting day replaced by the puzzle day');
  assert.strictEqual(ok.garden.plants[0].secs, 61);
  assert.throws(() => S.mergeImport({}, { plants: new Array(S.MAX_PLANTS + 1).fill(0) }, L, T), /too-large/);
  assert.throws(() => S.mergeImport({}, { plants: {} }, L, T), /format/);
  assert.throws(() => S.mergeImport({}, null, L, T), /format/);
  assert.ok(S.MAX_IMPORT_BYTES > 0 && S.MAX_IMPORT_BYTES <= 5 * 1024 * 1024);
});

test('stored garden: entries after today survive a clock set back; only the display hides them; imports allow today + 1 day', () => {
  const stored = { v: 1, plants: [plant(), plant({ type: 'tents', key: '2026-11-25', at: '2026-11-25' }), plant({ type: 'sunshade', key: '2026-12-31', at: '2026-12-31' })] };
  // clock set back to T (2026-11-20): reading the stored garden keeps everything
  const g = S.cleanGarden(stored, L, T);
  assert.strictEqual(g.plants.length, 3);
  assert.deepStrictEqual(S.shownGarden(g, T).plants.map((p) => p.key), ['2026-11-10']);
  // solving a puzzle writes the garden back: the later entries are still there
  const after = S.mergeImport(stored, { plants: [plant({ level: 'bloom', key: T, at: T })] }, L, T);
  assert.strictEqual(after.added, 1);
  assert.deepStrictEqual(after.garden.plants.map((p) => p.key).sort(), ['2026-11-10', '2026-11-20', '2026-11-25', '2026-12-31']);
  assert.strictEqual(after.garden.plants.find((p) => p.key === '2026-11-25').at, '2026-11-25');
  // once the clock is right again, they are shown again
  assert.strictEqual(S.shownGarden(after.garden, '2026-12-31').plants.length, 4);
  // still dropped from the stored garden: invalid days and pre-launch days
  assert.strictEqual(S.cleanGarden({ v: 1, plants: [plant({ key: '2026-02-30' }), plant({ key: '2026-11-01' })] }, L).plants.length, 0);
  // imports stay strict: today + 1 day accepted (time zones), today + 2 days refused
  assert.strictEqual(S.IMPORT_TOLERANCE_DAYS, 1);
  assert.strictEqual(S.addDays('2026-12-31', 1), '2027-01-01');
  const imp = S.mergeImport({ v: 1, plants: [] }, { plants: [plant({ key: '2026-11-21', at: '2026-11-21' }), plant({ key: '2026-11-22', at: '2026-11-22' })] }, L, T);
  assert.strictEqual(imp.added, 1);
  assert.strictEqual(imp.skipped, 1);
  assert.strictEqual(imp.garden.plants[0].key, '2026-11-21');
});
