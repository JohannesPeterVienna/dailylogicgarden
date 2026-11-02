// Precomputes generator states for the slowest daily boards (launch day + 150 days) so the browser
// can jump straight to the successful attempt. Cached in src/data/prestates.json; only missing days are computed.
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const core = require('./js/core.js');
export const LAUNCH = '2026-11-02';
export const DAYS = 150;
export const COMBOS = ['flowerbeds|sprout', 'flowerbeds|grove', 'sunshade|grove', 'gardenpath|bloom', 'gardenpath|grove'];
const FILE = join(dirname(fileURLToPath(import.meta.url)), 'data/prestates.json');

export function prestates() {
  const data = existsSync(FILE) ? JSON.parse(readFileSync(FILE, 'utf8')) : { start: LAUNCH, states: {} };
  let added = 0;
  core.setPre(null);
  for (const combo of COMBOS) {
    const [type, level] = combo.split('|');
    const mod = require('./js/' + type + '.js');
    const list = data.states[combo] || (data.states[combo] = []);
    for (let d = list.length; d < DAYS; d++) {
      mod.generate(core.addDays(LAUNCH, d), level);
      list.push(core.lastStart);
      added++;
    }
  }
  if (added) writeFileSync(FILE, JSON.stringify(data));
  return { data, added };
}
