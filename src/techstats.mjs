// Technique counts for every daily board of the first 150 days (launch day + 149): how often the solver's
// own solution path uses each technique. Cached in src/data/techstats.json; only missing days are computed.
// One entry per day and board: the number of uses per technique, in the order of src/js/techniques.js.
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import { LAUNCH, DAYS } from './precompute.mjs';
const require = createRequire(import.meta.url);
const core = require('./js/core.js');
const tech = require('./js/techniques.js');
const FILE = join(dirname(fileURLToPath(import.meta.url)), 'data/techstats.json');

export function dayCounts(type, level, key) {
  const mod = require('./js/' + type + '.js');
  return tech.tally(type, tech.path(type, mod, mod.generate(key, level))).join(',');
}
// pre: the precomputed generator states (same boards, found faster)
export function techstats(pre) {
  const data = existsSync(FILE) ? JSON.parse(readFileSync(FILE, 'utf8')) : { start: LAUNCH, counts: {} };
  let added = 0;
  core.setPre(pre || null);
  try {
    for (const type of tech.TYPES) for (const level of core.LEVELS) {
      const list = data.counts[type + '|' + level] || (data.counts[type + '|' + level] = []);
      for (let d = list.length; d < DAYS; d++) { list.push(dayCounts(type, level, core.addDays(LAUNCH, d))); added++; }
    }
  } finally { core.setPre(null); }
  if (added) writeFileSync(FILE, JSON.stringify(data));
  return { data, added };
}
// Per puzzle and level: boards counted, average steps, and per technique the boards that used it and its uses.
export function summarize(data) {
  const out = {};
  for (const type of tech.TYPES) {
    out[type] = {};
    for (const level of core.LEVELS) {
      const rows = data.counts[type + '|' + level].map((s) => s.split(',').map(Number));
      const ids = tech.ids(type);
      out[type][level] = {
        boards: rows.length,
        steps: rows.reduce((a, r) => a + r.reduce((x, y) => x + y, 0), 0) / rows.length,
        tech: ids.map((id, i) => ({ id, boards: rows.filter((r) => r[i] > 0).length, uses: rows.reduce((a, r) => a + r[i], 0) }))
      };
    }
  }
  return out;
}
