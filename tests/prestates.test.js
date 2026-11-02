// The precomputed generator states (src/data/prestates.json) must reproduce exactly the boards the
// generator makes on its own, in one attempt, with all checks (logic solve + uniqueness) passing.
'use strict';
const test = require('node:test');
const assert = require('node:assert');
const core = require('../src/js/core.js');
const data = require('../src/data/prestates.json');

test('precomputed states give the same boards in one attempt', () => {
  for (const combo of Object.keys(data.states)) {
    const [type, level] = combo.split('|');
    const mod = require('../src/js/' + type + '.js');
    const list = data.states[combo];
    assert.ok(list.length >= 150, combo + ' covers 150 days');
    for (let d = 0; d < list.length; d++) {
      const key = core.addDays(data.start, d);
      core.setPre(data);
      const fast = mod.generate(key, level);
      assert.strictEqual(fast.attempts, 1, `${combo} ${key} succeeds at the first attempt`);
      if (d % 10 === 0) {
        core.setPre(null);
        const slow = mod.generate(key, level);
        assert.deepStrictEqual(fast.solution, slow.solution, `${combo} ${key} same board`);
      }
    }
  }
  core.setPre(null);
});
