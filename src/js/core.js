/*
 * Daily Logic Garden – shared engine core: dates, seeded randomness, helpers.
 * The same date gives every visitor the same puzzles, with no server involved.
 */
(function (root, factory) {
  var api = factory();
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else (root.DLG = root.DLG || {}).core = api;
})(this, function () {
  'use strict';
  var VERSION = 'g1';
  var LEVELS = ['sprout', 'bloom', 'grove'];
  var LEVEL_NAMES = { sprout: 'Sprout', bloom: 'Bloom', grove: 'Grove' };

  // cyrb53-style string hash -> 32-bit unsigned integer
  function hash(str) {
    var h1 = 0xdeadbeef, h2 = 0x41c6ce57;
    for (var i = 0; i < str.length; i++) {
      var ch = str.charCodeAt(i);
      h1 = Math.imul(h1 ^ ch, 2654435761);
      h2 = Math.imul(h2 ^ ch, 1597334677);
    }
    h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
    h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
    return (h1 ^ h2) >>> 0;
  }

  // mulberry32 generator with small helpers
  function rng(seed) {
    var a = typeof seed === 'string' ? hash(seed) : seed >>> 0;
    function next() {
      a = (a + 0x6D2B79F5) >>> 0;
      var t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    }
    return {
      next: next,
      state: function () { return a; },
      mark: function () { api.lastStart = a; },
      int: function (n) { return Math.floor(next() * n); },
      pick: function (arr) { return arr[Math.floor(next() * arr.length)]; },
      shuffle: function (arr) {
        for (var i = arr.length - 1; i > 0; i--) {
          var j = Math.floor(next() * (i + 1));
          var t = arr[i]; arr[i] = arr[j]; arr[j] = t;
        }
        return arr;
      }
    };
  }

  function pad(n) { return n < 10 ? '0' + n : '' + n; }
  function dateKey(d) {
    d = d || new Date();
    return d.getUTCFullYear() + '-' + pad(d.getUTCMonth() + 1) + '-' + pad(d.getUTCDate());
  }
  function parseKey(key) {
    var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(key || '');
    if (!m) return null;
    var d = new Date(Date.UTC(+m[1], +m[2] - 1, +m[3]));
    return dateKey(d) === key ? d : null;
  }
  function addDays(key, n) {
    var d = parseKey(key);
    d.setUTCDate(d.getUTCDate() + n);
    return dateKey(d);
  }
  function seedFor(type, level, key) { return VERSION + '|' + type + '|' + level + '|' + key; }
  // Precomputed generator states (made at build time for the slowest boards): the generator jumps
  // straight to the attempt that succeeds. It still runs every check (logic solve, uniqueness count).
  // table: { start: 'YYYY-MM-DD', states: { 'type|level': [state for start, start + 1 day, ...] } }
  var PRE = null;
  function setPre(table) { PRE = table || null; }
  function rngFor(type, level, key) {
    var hit;
    if (PRE && PRE.states[type + '|' + level] && parseKey(key)) {
      var day = Math.round((parseKey(key) - parseKey(PRE.start)) / 86400000);
      hit = PRE.states[type + '|' + level][day];
    }
    return rng(typeof hit === 'number' ? hit >>> 0 : seedFor(type, level, key));
  }
  function levelIndex(level) { var i = LEVELS.indexOf(level); return i < 0 ? 0 : i; }

  // A1-style cell names: rows are numbered from the top, columns lettered from the left
  var COLS = 'ABCDEFGHIJKLMNOP';
  function cellName(r, c) { return COLS[c] + (r + 1); }
  function rowName(r) { return 'row ' + (r + 1); }
  function colName(c) { return 'column ' + COLS[c]; }
  function listJoin(items) {
    if (items.length <= 1) return items.join('');
    return items.slice(0, -1).join(', ') + ' and ' + items[items.length - 1];
  }
  function plural(n, one, many) { return n + ' ' + (n === 1 ? one : (many || one + 's')); }
  var WORDS = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten'];
  function word(n) { return WORDS[n] || String(n); }

  var api = {
    VERSION: VERSION, setPre: setPre, rngFor: rngFor, lastStart: null, LEVELS: LEVELS, LEVEL_NAMES: LEVEL_NAMES,
    hash: hash, rng: rng, dateKey: dateKey, parseKey: parseKey, addDays: addDays,
    seedFor: seedFor, levelIndex: levelIndex,
    cellName: cellName, rowName: rowName, colName: colName, COLS: COLS,
    listJoin: listJoin, plural: plural, word: word
  };
  return api;
});
