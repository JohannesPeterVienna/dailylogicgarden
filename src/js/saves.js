/*
 * Daily Logic Garden – checks for everything read back from this browser or from an imported file:
 * saved boards, the garden, garden imports and the page address. Pure functions (unit-tested);
 * anything that does not match the expected shape is dropped instead of breaking the page.
 */
(function (root, factory) {
  var api = factory();
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else (root.DLG = root.DLG || {}).saves = api;
})(this, function () {
  'use strict';
  var TYPES = ['flowerbeds', 'tents', 'sunshade', 'gardenpath', 'whoplanted'];
  var LEVELS = ['sprout', 'bloom', 'grove'];
  var MAX_HINTS = 10000;            // more hints than any board has cells
  var MAX_SECS = 7 * 24 * 3600;     // a week of play time on one board
  var MAX_PLANTS = 50000;           // garden entries kept / accepted in one import
  var MAX_IMPORT_BYTES = 2 * 1024 * 1024;
  var DAY = /^(\d{4})-(\d{2})-(\d{2})$/;

  function plainObject(o) { return !!o && typeof o === 'object' && Object.prototype.toString.call(o) === '[object Object]'; }
  function intIn(v, min, max) { return typeof v === 'number' && isFinite(v) && Math.floor(v) === v && v >= min && v <= max; }
  function realDay(key) {
    var m = typeof key === 'string' && DAY.exec(key);
    if (!m) return false;
    var d = new Date(Date.UTC(+m[1], +m[2] - 1, +m[3]));
    return d.getUTCFullYear() === +m[1] && d.getUTCMonth() === +m[2] - 1 && d.getUTCDate() === +m[3];
  }
  /** A real calendar day from the launch day up to today (all YYYY-MM-DD, compared as text). */
  function dayInRange(key, launch, today) { return realDay(key) && key >= launch && key <= today; }
  /** A real calendar day from the launch day on; `latest` (YYYY-MM-DD) is the upper limit, none when null. */
  function dayFrom(key, launch, latest) { return realDay(key) && key >= launch && (latest === null || key <= latest); }
  /** The day n days after the YYYY-MM-DD day `key` (UTC). */
  function addDays(key, n) {
    var m = DAY.exec(key), d = new Date(Date.UTC(+m[1], +m[2] - 1, +m[3] + n));
    return d.getUTCFullYear() + '-' + ('0' + (d.getUTCMonth() + 1)).slice(-2) + '-' + ('0' + d.getUTCDate()).slice(-2);
  }
  /** Imported files may be at most one day ahead of this device's today (time zones around midnight). */
  var IMPORT_TOLERANCE_DAYS = 1;

  function cellsOk(u, len, ok) {
    if (!Array.isArray(u) || u.length !== len) return null;
    for (var k = 0; k < len; k++) if (!ok(u[k], k)) return null;
    return u.slice();
  }
  function small(v) { return v === 0 || v === 1 || v === 2; }

  /**
   * A saved board for puzzle p of this type (mod = the puzzle module), or null when it does not fit:
   * wrong length, values outside the game's range, changed givens or trees, or a broken path.
   */
  function cleanBoard(type, p, mod, u) {
    try {
      if (type === 'flowerbeds') return cellsOk(u, p.n * p.n, small);
      if (type === 'whoplanted') return cellsOk(u, mod.geom(p).size, small);
      if (type === 'tents') {
        var tg = mod.geom(p);
        return cellsOk(u, p.n * p.n, function (v, k) { return tg.isTree[k] ? v === 3 : small(v); });
      }
      if (type === 'sunshade') return cellsOk(u, p.n * p.n, function (v, k) { return p.givens[k] ? v === p.givens[k] : small(v); });
      if (type === 'gardenpath') {
        if (!plainObject(u) || !Array.isArray(u.path) || !u.path.length || u.path.length > p.n * p.n) return null;
        var g = mod.geom(p), seen = {}, hedges = {};
        (p.hedges || []).forEach(function (e) { hedges[e] = 1; });
        if (u.path[0] !== p.solution[0]) return null;
        for (var i = 0; i < u.path.length; i++) {
          var c = u.path[i];
          if (!intIn(c, 0, p.n * p.n - 1) || seen[c]) return null;
          seen[c] = 1;
          if (i) {
            var e = g.edgeAt[u.path[i - 1] + ',' + c];
            if (e === undefined || hedges[e]) return null; // not a neighbour, or through a hedge
          }
        }
        var pencil = {};
        if (u.pencil !== undefined && !plainObject(u.pencil)) return null;
        Object.keys(u.pencil || {}).forEach(function (key) {
          if (/^\d+$/.test(key) && +key < g.edges.length && small(u.pencil[key])) pencil[key] = u.pencil[key];
        });
        return { path: u.path.slice(), pencil: pencil };
      }
    } catch (err) { return null; }
    return null;
  }

  /** A saved game record {u, h, t, s}, cleaned; null when the board itself does not fit. */
  function cleanSave(type, p, mod, saved) {
    if (!plainObject(saved)) return null;
    var u = cleanBoard(type, p, mod, saved.u);
    if (!u) return null;
    return {
      u: u,
      h: intIn(saved.h, 0, MAX_HINTS) ? saved.h : 0,
      t: typeof saved.t === 'number' && isFinite(saved.t) && saved.t >= 0 && saved.t <= MAX_SECS ? saved.t : 0,
      s: saved.s === true
    };
  }

  /**
   * One garden entry, or null: known type and level, a real day from launch up to `latest`
   * (YYYY-MM-DD; null = no upper limit), finite counts in range.
   */
  function cleanPlant(p, launch, latest) {
    if (latest === undefined) latest = null;
    if (!plainObject(p) || TYPES.indexOf(p.type) < 0 || LEVELS.indexOf(p.level) < 0 || !dayFrom(p.key, launch, latest)) return null;
    if (!intIn(p.hints, 0, MAX_HINTS)) return null;
    if (typeof p.secs !== 'number' || !isFinite(p.secs) || p.secs < 0 || p.secs > MAX_SECS) return null;
    var at = typeof p.at === 'string' ? p.at.slice(0, 10) : '';
    return { type: p.type, level: p.level, key: p.key, hints: p.hints, secs: Math.round(p.secs), at: dayFrom(at, launch, latest) && at >= p.key ? at : p.key };
  }
  function plantId(p) { return p.type + '|' + p.level + '|' + p.key; }

  /**
   * The garden stored in this browser, cleaned: invalid or repeated entries are dropped, the rest is kept.
   * Entries dated after today are kept too (no upper limit): if the device clock is set back, they must
   * not be lost when the garden is written back. Only the display hides them (shownGarden).
   */
  function cleanGarden(raw, launch) {
    var out = { v: 1, plants: [] }, have = {};
    if (!plainObject(raw) || !Array.isArray(raw.plants)) return out;
    for (var i = 0; i < raw.plants.length && out.plants.length < MAX_PLANTS; i++) {
      var p = cleanPlant(raw.plants[i], launch, null);
      if (!p || have[plantId(p)]) continue;
      have[plantId(p)] = 1;
      out.plants.push(p);
    }
    return out;
  }

  /** The part of a cleaned garden to show today: entries up to today; later ones stay stored, unshown. */
  function shownGarden(g, today) {
    return { v: 1, plants: g.plants.filter(function (p) { return p.key <= today; }) };
  }

  /**
   * Adds the plants of an imported export to the garden. Throws 'format' / 'too-large' for files that
   * are not an export; returns { garden, added, skipped }. Every accepted entry is remembered at once,
   * so a file listing the same plant twice adds it only once. Imported entries are checked strictly
   * (day from launch to today plus at most one day); the existing garden keeps all its valid entries.
   */
  function mergeImport(existing, data, launch, today) {
    if (!plainObject(data) || !Array.isArray(data.plants)) throw new Error('format');
    if (data.plants.length > MAX_PLANTS) throw new Error('too-large');
    var latest = addDays(today, IMPORT_TOLERANCE_DAYS);
    var g = cleanGarden(existing, launch), have = {}, added = 0, skipped = 0;
    g.plants.forEach(function (p) { have[plantId(p)] = 1; });
    data.plants.forEach(function (raw) {
      var p = cleanPlant(raw, launch, latest);
      if (!p || have[plantId(p)] || g.plants.length >= MAX_PLANTS) { skipped++; return; }
      have[plantId(p)] = 1;
      g.plants.push(p);
      added++;
    });
    return { garden: g, added: added, skipped: skipped };
  }

  /** The page address parameters; badly encoded values are ignored instead of throwing. */
  function parseQuery(search) {
    var q = {};
    String(search || '').replace(/^\?/, '').split('&').forEach(function (kv) {
      if (!kv) return;
      var i = kv.indexOf('='), k, v;
      try {
        k = decodeURIComponent((i < 0 ? kv : kv.slice(0, i)).replace(/\+/g, ' '));
        v = decodeURIComponent((i < 0 ? '' : kv.slice(i + 1)).replace(/\+/g, ' '));
      } catch (e) { return; }
      if (k === 'date' || k === 'level') q[k] = v;
    });
    return q;
  }

  return {
    TYPES: TYPES, LEVELS: LEVELS, MAX_HINTS: MAX_HINTS, MAX_SECS: MAX_SECS, MAX_PLANTS: MAX_PLANTS, MAX_IMPORT_BYTES: MAX_IMPORT_BYTES,
    IMPORT_TOLERANCE_DAYS: IMPORT_TOLERANCE_DAYS,
    dayInRange: dayInRange, addDays: addDays, cleanBoard: cleanBoard, cleanSave: cleanSave, cleanPlant: cleanPlant,
    cleanGarden: cleanGarden, shownGarden: shownGarden, mergeImport: mergeImport, parseQuery: parseQuery
  };
});
