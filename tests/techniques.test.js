// Technique catalogue, solution paths, the stored 150-day counts and the practice finder.
const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const core = require('../src/js/core.js');
const tech = require('../src/js/techniques.js');
const MODS = { flowerbeds: require('../src/js/flowerbeds.js'), tents: require('../src/js/tents.js'), sunshade: require('../src/js/sunshade.js'), gardenpath: require('../src/js/gardenpath.js'), whoplanted: require('../src/js/whoplanted.js') };
const ROOT = path.join(__dirname, '..');
const STATS = JSON.parse(fs.readFileSync(path.join(ROOT, 'src/data/techstats.json'), 'utf8'));
const PRE = JSON.parse(fs.readFileSync(path.join(ROOT, 'src/data/prestates.json'), 'utf8'));
const START = '2026-11-02';

test('catalogue: every technique id used in a solver has a name, a level and a link to an existing anchor', () => {
  for (const type of tech.TYPES) {
    const src = fs.readFileSync(path.join(ROOT, 'src/js', type + '.js'), 'utf8');
    const ids = new Set([...src.matchAll(/tech: '([a-z-]+)'/g)].map((m) => m[1]).concat([...src.matchAll(/step\(\d, '([a-z-]+)'/g)].map((m) => m[1])));
    if (type === 'sunshade') { ids.add('last-one'); ids.add('line'); }
    assert.deepStrictEqual([...ids].sort(), tech.ids(type).slice().sort(), type + ': catalogue and solver list the same techniques');
    for (const id of tech.ids(type)) {
      const t = tech.get(type, id);
      assert.ok(t.name.length > 3 && [1, 2, 3].includes(t.tier) && t.href.startsWith('/'), type + ' ' + id);
      const [page, anchor] = t.href.split('#');
      const file = path.join(ROOT, 'docs', page, 'index.html');
      assert.ok(fs.existsSync(file), 'page exists: ' + t.href);
      if (anchor) assert.ok(fs.readFileSync(file, 'utf8').includes('id="' + anchor + '"'), 'anchor exists: ' + t.href);
    }
  }
  assert.strictEqual(tech.TYPES.reduce((a, t) => a + tech.ids(t).length, 0), 31);
});

test('path(): only deductions, catalogue level equals solver tier, replay ends on the solved board', () => {
  core.setPre(PRE);
  for (const type of tech.TYPES) for (const level of core.LEVELS) for (let d = 0; d < 6; d++) {
    const mod = MODS[type], p = mod.generate(core.addDays(START, d * 9), level), steps = tech.path(type, mod, p);
    assert.ok(steps.length > 0);
    for (const s of steps) {
      assert.notStrictEqual(s.tech, 'reveal', `${type} ${level} ${p.key}: no reveal on a daily board`);
      assert.strictEqual(tech.get(type, s.tech).tier, s.tier, `${type} ${s.tech}: catalogue level matches the solver`);
      assert.ok(s.tier <= core.LEVELS.indexOf(level) + 1, 'no technique above the board level');
    }
    assert.ok(mod.isSolved(p, tech.stateAt(type, mod, p, steps, steps.length)), 'all steps solve the board');
    assert.ok(!mod.isSolved(p, tech.stateAt(type, mod, p, steps, steps.length - 1)), 'the last step is needed');
    assert.deepStrictEqual(tech.stateAt(type, mod, p, steps, 0), tech.blank(type, mod, p));
    assert.strictEqual(tech.tally(type, steps).reduce((a, b) => a + b, 0), steps.length);
    assert.strictEqual(tech.listing(type, level, p.key, steps).split('\n').length, steps.length);
  }
  core.setPre(null);
});

test('stored counts: 150 days per board, and a recomputed sample equals the stored values', () => {
  assert.strictEqual(STATS.start, START);
  core.setPre(PRE);
  for (const type of tech.TYPES) for (const level of core.LEVELS) {
    const list = STATS.counts[type + '|' + level];
    assert.strictEqual(list.length, 150);
    for (const d of [0, 16, 77, 149]) {
      const mod = MODS[type], p = mod.generate(core.addDays(START, d), level);
      assert.strictEqual(tech.tally(type, tech.path(type, mod, p)).join(','), list[d], `${type} ${level} day ${d}`);
    }
    // levels are honest: a board uses its own level's technique and nothing above it
    const tier = core.LEVELS.indexOf(level) + 1;
    for (const row of list) {
      const c = row.split(',').map(Number);
      assert.ok(tech.ids(type).some((id, i) => c[i] > 0 && tech.get(type, id).tier === tier), 'own level used');
      assert.ok(tech.ids(type).every((id, i) => !c[i] || tech.get(type, id).tier <= tier), 'nothing above');
    }
  }
  core.setPre(null);
});

test('built pages state the counts of the stored data', () => {
  const page = fs.readFileSync(path.join(ROOT, 'docs/techniques/index.html'), 'utf8');
  for (const type of tech.TYPES) for (const id of tech.ids(type)) {
    const i = tech.get(type, id).index;
    const cells = core.LEVELS.map((l) => { const rows = STATS.counts[type + '|' + l].map((s) => +s.split(',')[i]), boards = rows.filter((x) => x > 0).length, uses = rows.reduce((a, b) => a + b, 0); return '<td>' + boards + (boards ? ' <small>(' + (uses / boards).toFixed(1) + '×)</small>' : '') + '</td>'; }).join('');
    const row = new RegExp('<tr data-puzzle="' + type + '" data-tech="' + id + '">[\\s\\S]*?</tr>').exec(page);
    assert.ok(row && row[0].endsWith(cells + '</tr>'), type + ' ' + id + ' row shows the stored counts');
  }
  // worked boards: the printed steps are the solver's own sentences
  const p = MODS.tents.generate(START, 'bloom'), steps = tech.path('tents', MODS.tents, p);
  const guide = fs.readFileSync(path.join(ROOT, 'docs/guides/tents-and-trees-rules-strategy/index.html'), 'utf8');
  const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  for (const s of steps) assert.ok(guide.includes(esc(s.text)), 'guide prints step: ' + s.text);
  assert.ok(guide.includes('It needed ' + steps.length + ' steps'));
});

test('finder: boards of the last 30 days, never before launch or after today; hostile input finds nothing', () => {
  const src = fs.readFileSync(path.join(ROOT, 'docs/assets/js/finder.js'), 'utf8');
  const win = {};
  new Function('window', 'document', src)(win, undefined);
  const F = win.DLGFinder, data = win.DLG_TECHDATA;
  assert.deepStrictEqual(data.counts, STATS.counts);
  const hits = F.find('tents', 'lookahead', '2026-11-18');
  assert.ok(hits.length > 0 && hits.every((h) => h.level === 'grove' && h.key >= START && h.key <= '2026-11-18'));
  for (const h of hits) assert.strictEqual(+STATS.counts['tents|grove'][Math.round((Date.parse(h.key) - Date.parse(START)) / 86400000)].split(',')[6], h.uses);
  assert.strictEqual(F.find('tents', 'lookahead', '2026-11-02').length, 1, 'launch day: one day only');
  assert.ok(F.find('flowerbeds', 'k-confined', '2027-02-15').every((h) => h.key > '2027-01-16'));
  assert.deepStrictEqual(F.find('sunshade', 'cross', '2026-12-20'), []);
  assert.deepStrictEqual(F.find('tents', '<img src=x onerror=alert(1)>', '2026-11-18'), []);
  assert.deepStrictEqual(F.find('tents', 'lookahead', '2030-01-01'), [], 'outside the stored days');
  assert.strictEqual(F.covered('2026-11-18'), true);
  assert.strictEqual(F.covered('2030-01-01'), false);
});
