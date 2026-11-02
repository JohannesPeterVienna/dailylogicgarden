/*
 * Daily Logic Garden – shared drawings: board icons, printable puzzle sheets and the growing garden.
 */
(function (root, factory) {
  var core = typeof module !== 'undefined' && module.exports ? require('./core.js') : root.DLG.core;
  var api = factory(core);
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.DLG.draw = api;
})(this, function (core) {
  'use strict';
  var ICON = {
    flower: '<svg viewBox="0 0 24 24" aria-hidden="true"><g fill="var(--plum)"><circle cx="12" cy="6.2" r="3.6"/><circle cx="17.5" cy="10.2" r="3.6"/><circle cx="15.4" cy="16.6" r="3.6"/><circle cx="8.6" cy="16.6" r="3.6"/><circle cx="6.5" cy="10.2" r="3.6"/></g><circle cx="12" cy="12" r="3.1" fill="var(--pollen)" stroke="var(--moss)" stroke-width=".8"/></svg>',
    tent: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3.5 2.8 20h18.4z" fill="var(--tent)"/><path d="M12 9.5 8.6 20h6.8z" fill="var(--paper)"/><path d="M12 3.5v-1.6" stroke="var(--tent)" stroke-width="1.6" stroke-linecap="round"/></svg>',
    tree: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="9.5" r="7" fill="var(--tree)"/><circle cx="9" cy="8" r="2" fill="rgba(255,255,255,.25)"/><rect x="10.7" y="14.5" width="2.6" height="7" rx="1" fill="#7a5532"/></svg>',
    sun: '<svg viewBox="0 0 24 24" aria-hidden="true"><g stroke="var(--sun)" stroke-width="2" stroke-linecap="round"><path d="M12 1.8v3M12 19.2v3M1.8 12h3M19.2 12h3M4.8 4.8l2.1 2.1M17.1 17.1l2.1 2.1M4.8 19.2l2.1-2.1M17.1 6.9l2.1-2.1"/></g><circle cx="12" cy="12" r="5.2" fill="var(--sun)"/></svg>',
    shade: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3.5 13.5a8.5 8.5 0 0 1 17 0z" fill="var(--shade)"/><path d="M12 13.5v7.2a2 2 0 0 1-4 0" fill="none" stroke="var(--shade)" stroke-width="2" stroke-linecap="round"/><path d="M12 5V3.6" stroke="var(--shade)" stroke-width="2" stroke-linecap="round"/></svg>',
    grass: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 19c.5-3 .3-5-1-7M10 19c0-3.5.8-6 2.5-8M14 19c.2-2.6 1.4-4.6 3.6-6M18 19c.2-1.5.9-2.6 2-3.4" fill="none" stroke="var(--tree)" stroke-width="1.8" stroke-linecap="round"/></svg>',
    cross: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 7l10 10M17 7 7 17" stroke="var(--muted)" stroke-width="2.2" stroke-linecap="round"/></svg>'
  };

  // ---------- printable sheets (black on white) ----------
  var CS = 40;
  function frame(n, extraR, extraB) { return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="-30 -30 ' + (n * CS + 60 + (extraR || 0)) + ' ' + (n * CS + 60 + (extraB || 0)) + '" role="img">'; }
  function labels(n) {
    var s = '';
    for (var i = 0; i < n; i++) {
      s += '<text x="' + (i * CS + CS / 2) + '" y="-10" font-size="13" text-anchor="middle" fill="#444">' + core.COLS[i] + '</text>';
      s += '<text x="-14" y="' + (i * CS + CS / 2 + 5) + '" font-size="13" text-anchor="middle" fill="#444">' + (i + 1) + '</text>';
    }
    return s;
  }
  function gridLines(n) {
    var s = '';
    for (var i = 0; i <= n; i++) {
      s += '<line x1="0" y1="' + i * CS + '" x2="' + n * CS + '" y2="' + i * CS + '" stroke="#999" stroke-width="1"/>';
      s += '<line x1="' + i * CS + '" y1="0" x2="' + i * CS + '" y2="' + n * CS + '" stroke="#999" stroke-width="1"/>';
    }
    return s + '<rect x="0" y="0" width="' + n * CS + '" height="' + n * CS + '" fill="none" stroke="#000" stroke-width="3"/>';
  }
  var PRINT_PAT = ['dots', 'diag', 'diag2', 'hlines', 'vlines', 'cross', 'rings', 'grid', 'none'];
  function patternDefs() {
    return '<defs>' +
      '<pattern id="pp-dots" width="8" height="8" patternUnits="userSpaceOnUse"><circle cx="4" cy="4" r="1.1" fill="#888"/></pattern>' +
      '<pattern id="pp-diag" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="8" stroke="#aaa" stroke-width="1.2"/></pattern>' +
      '<pattern id="pp-diag2" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(-45)"><line x1="0" y1="0" x2="0" y2="8" stroke="#aaa" stroke-width="1.2"/></pattern>' +
      '<pattern id="pp-hlines" width="8" height="8" patternUnits="userSpaceOnUse"><line x1="0" y1="4" x2="8" y2="4" stroke="#aaa" stroke-width="1.2"/></pattern>' +
      '<pattern id="pp-vlines" width="8" height="8" patternUnits="userSpaceOnUse"><line x1="4" y1="0" x2="4" y2="8" stroke="#aaa" stroke-width="1.2"/></pattern>' +
      '<pattern id="pp-cross" width="8" height="8" patternUnits="userSpaceOnUse"><path d="M0 0l8 8M8 0 0 8" stroke="#bbb" stroke-width="1"/></pattern>' +
      '<pattern id="pp-rings" width="12" height="12" patternUnits="userSpaceOnUse"><circle cx="6" cy="6" r="3" fill="none" stroke="#aaa" stroke-width="1"/></pattern>' +
      '<pattern id="pp-grid" width="10" height="10" patternUnits="userSpaceOnUse"><path d="M0 0h10M0 0v10" stroke="#bbb" stroke-width="1"/></pattern>' +
      '</defs>';
  }
  function printFlowerBeds(p) {
    var n = p.n, s = frame(n) + patternDefs() + labels(n);
    for (var k = 0; k < n * n; k++) {
      var r = Math.floor(k / n), c = k % n, pat = PRINT_PAT[p.regions[k] % PRINT_PAT.length];
      if (pat !== 'none') s += '<rect x="' + c * CS + '" y="' + r * CS + '" width="' + CS + '" height="' + CS + '" fill="url(#pp-' + pat + ')"/>';
    }
    s += gridLines(n);
    for (k = 0; k < n * n; k++) {
      r = Math.floor(k / n); c = k % n;
      if (c + 1 < n && p.regions[k] !== p.regions[k + 1]) s += '<line x1="' + (c + 1) * CS + '" y1="' + r * CS + '" x2="' + (c + 1) * CS + '" y2="' + (r + 1) * CS + '" stroke="#000" stroke-width="3.5" stroke-linecap="square"/>';
      if (r + 1 < n && p.regions[k] !== p.regions[k + n]) s += '<line x1="' + c * CS + '" y1="' + (r + 1) * CS + '" x2="' + (c + 1) * CS + '" y2="' + (r + 1) * CS + '" stroke="#000" stroke-width="3.5" stroke-linecap="square"/>';
    }
    // first cell of each bed carries the bed's initial
    var seen = {};
    for (k = 0; k < n * n; k++) if (!seen[p.regions[k]]) {
      seen[p.regions[k]] = 1; r = Math.floor(k / n); c = k % n;
      s += '<text x="' + (c * CS + 4) + '" y="' + (r * CS + 13) + '" font-size="11" font-weight="700" fill="#000">' + p.beds[p.regions[k]].charAt(0) + p.beds[p.regions[k]].charAt(1) + '</text>';
    }
    return s + '</svg>';
  }
  function printTents(p) {
    var n = p.n, s = frame(n, 10, 10) + labels(n) + gridLines(n);
    p.trees.forEach(function (t) {
      var r = Math.floor(t / n), c = t % n, cx = c * CS + CS / 2, cy = r * CS + CS / 2;
      s += '<circle cx="' + cx + '" cy="' + (cy - 3) + '" r="12" fill="#fff" stroke="#000" stroke-width="2"/><rect x="' + (cx - 2) + '" y="' + (cy + 8) + '" width="4" height="9" fill="#000"/>';
    });
    for (var i = 0; i < n; i++) {
      s += '<text x="' + (n * CS + 14) + '" y="' + (i * CS + CS / 2 + 6) + '" font-size="16" font-weight="700" text-anchor="middle">' + p.rowCount[i] + '</text>';
      s += '<text x="' + (i * CS + CS / 2) + '" y="' + (n * CS + 22) + '" font-size="16" font-weight="700" text-anchor="middle">' + p.colCount[i] + '</text>';
    }
    return s + '</svg>';
  }
  function printSunShade(p) {
    var n = p.n, s = frame(n) + labels(n) + gridLines(n);
    p.givens.forEach(function (v, k) {
      if (!v) return;
      var cx = (k % n) * CS + CS / 2, cy = Math.floor(k / n) * CS + CS / 2;
      s += v === 1 ? '<circle cx="' + cx + '" cy="' + cy + '" r="11" fill="#fff" stroke="#000" stroke-width="2.4"/>' : '<circle cx="' + cx + '" cy="' + cy + '" r="11" fill="#000"/>';
    });
    return s + '</svg>';
  }
  function printPath(p) {
    var n = p.n, s = frame(n) + labels(n) + gridLines(n);
    (p.hedges || []).forEach(function (e) {
      var a = Math.min.apply(null, edgeCells(p, e)), b = Math.max.apply(null, edgeCells(p, e));
      var r = Math.floor(a / n), c = a % n;
      if (b === a + 1) s += '<line x1="' + (c + 1) * CS + '" y1="' + r * CS + '" x2="' + (c + 1) * CS + '" y2="' + (r + 1) * CS + '" stroke="#000" stroke-width="6" stroke-linecap="round"/>';
      else s += '<line x1="' + c * CS + '" y1="' + (r + 1) * CS + '" x2="' + (c + 1) * CS + '" y2="' + (r + 1) * CS + '" stroke="#000" stroke-width="6" stroke-linecap="round"/>';
    });
    Object.keys(p.stones).forEach(function (cell) {
      var k = +cell, cx = (k % n) * CS + CS / 2, cy = Math.floor(k / n) * CS + CS / 2;
      s += '<circle cx="' + cx + '" cy="' + cy + '" r="13" fill="#000"/><text x="' + cx + '" y="' + (cy + 5) + '" font-size="14" font-weight="700" fill="#fff" text-anchor="middle">' + p.stones[cell] + '</text>';
    });
    return s + '</svg>';
  }
  function edgeCells(p, e) {
    var n = p.n, count = 0;
    for (var k = 0; k < n * n; k++) {
      var r = Math.floor(k / n), c = k % n;
      if (c + 1 < n) { if (count === e) return [k, k + 1]; count++; }
      if (r + 1 < n) { if (count === e) return [k, k + n]; count++; }
    }
    return [0, 0];
  }
  function esc(t) { return String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
  function printGrid(p, wp) {
    var html = '<ol class="sheet-clues">' + p.clueTexts.map(function (t) { return '<li>' + esc(t) + '</li>'; }).join('') + '</ol><table class="sheet-table"><thead><tr><th>Gardener</th>';
    for (var c = 1; c < p.cats.length; c++) html += '<th>' + { plant: 'Crop', bed: 'Bed', day: 'Day' }[p.cats[c]] + '</th>';
    html += '</tr></thead><tbody>';
    p.items[0].forEach(function (name) { html += '<tr><td>' + esc(name) + '</td>' + new Array(p.cats.length).join('<td>&nbsp;</td>') + '</tr>'; });
    html += '</tbody></table><p class="sheet-rules">Options: ' + p.cats.slice(1).map(function (k, i) { return p.items[i + 1].map(function (j, x) { return wp.label(p, i + 1, x); }).join(', '); }).join(' &middot; ') + '</p>';
    return html;
  }
  var RULES = {
    flowerbeds: 'Plant one flower in every row, every column and every bed. Flowers never touch each other, not even diagonally.',
    tents: 'Every tree gets its own tent on a square directly beside it (not diagonally). Tents never touch each other, not even diagonally. The numbers say how many tents are in each row and column.',
    sunshade: 'Fill every square with sun (open circle) or shade (filled circle). No three of the same may sit next to each other in a row or column, and every row and column holds as many suns as shades.',
    gardenpath: 'Draw one path from stone 1 to the last stone that passes through every square exactly once, moving up, down, left or right and visiting the stones in number order. Thick hedges cannot be crossed.',
    whoplanted: 'Use the clues to work out which crop each gardener planted' + ', and where and when. Every option is used exactly once.'
  };
  function printSheet(p, mods, title) {
    var body = p.type === 'flowerbeds' ? printFlowerBeds(p) : p.type === 'tents' ? printTents(p) : p.type === 'sunshade' ? printSunShade(p)
      : p.type === 'gardenpath' ? printPath(p) : printGrid(p, mods.whoplanted);
    var extra = p.type === 'flowerbeds' ? '<p class="sheet-rules">Beds: ' + p.beds.map(function (b, i) { return b + ' (' + PRINT_PAT[i % PRINT_PAT.length].replace('none', 'plain').replace('diag2', 'back-diagonal').replace('diag', 'diagonal').replace('hlines', 'horizontal lines').replace('vlines', 'vertical lines').replace('cross', 'cross-hatch') + ')'; }).join(', ') + '. The first square of each bed is marked with its first two letters.</p>' : '';
    return '<section class="print-sheet"><h2>' + esc(title) + '</h2><p class="sheet-rules">' + RULES[p.type] + '</p>' + body + extra + '<p class="sheet-rules">dailylogicgarden.com &middot; one solution, no guessing needed.</p></section>';
  }

  // ---------- the growing garden ----------
  var KIND = { flowerbeds: 'daisy', tents: 'fir', sunshade: 'sunflower', gardenpath: 'fern', whoplanted: 'tulip' };
  var SCALE = { sprout: 0.6, bloom: 0.82, grove: 1.05 };
  function plantSVG(kind, x, y, sc) {
    var t = 'translate(' + x.toFixed(1) + ' ' + y.toFixed(1) + ') scale(' + sc.toFixed(2) + ')';
    if (kind === 'daisy') return '<g transform="' + t + '"><path d="M0 0V-34" stroke="#3f7a4a" stroke-width="2.4"/><path d="M0-14q-9-4-12 2q8 3 12-2" fill="#5f9a5e"/><g fill="#fff" stroke="#7B3F69" stroke-width=".8">' + [0, 60, 120, 180, 240, 300].map(function (a) { return '<ellipse cx="0" cy="-44" rx="3.6" ry="8" transform="rotate(' + a + ' 0 -36)"/>'; }).join('') + '</g><circle cx="0" cy="-36" r="4.2" fill="#E3B23C"/></g>';
    if (kind === 'fir') return '<g transform="' + t + '"><rect x="-2" y="-8" width="4" height="8" fill="#7a5532"/><path d="M0-52 14-22H6L17-8H-17L-6-22H-14z" fill="#2F6B3F"/></g>';
    if (kind === 'sunflower') return '<g transform="' + t + '"><path d="M0 0V-46" stroke="#3f7a4a" stroke-width="2.6"/><path d="M0-20q10-6 14 0q-8 5-14 0" fill="#5f9a5e"/><g fill="#E3B23C">' + [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map(function (a) { return '<ellipse cx="0" cy="-60" rx="3" ry="7" transform="rotate(' + a + ' 0 -52)"/>'; }).join('') + '</g><circle cx="0" cy="-52" r="6" fill="#6b3f1f"/></g>';
    if (kind === 'fern') return '<g transform="' + t + '" fill="none" stroke="#3f8a55" stroke-width="2" stroke-linecap="round"><path d="M0 0q-2-22 8-40"/><path d="M-1-10l-9-4M0-18l-10-6M1-26l-9-8M4-33l-7-9M1-12l9-6M2-20l9-8M5-28l8-8"/><path d="M0 0q4-16-6-30"/></g>';
    return '<g transform="' + t + '"><path d="M0 0V-30" stroke="#3f7a4a" stroke-width="2.4"/><path d="M0-6q-8-12-2-22M0-6q8-12 2-22" fill="#5f9a5e"/><path d="M-7-44q0-10 7-6q7-4 7 6q0 9-7 9q-7 0-7-9z" fill="#C2577F"/></g>';
  }
  function season(month) { return month < 2 || month === 11 ? 'winter' : month < 5 ? 'spring' : month < 8 ? 'summer' : 'autumn'; }
  var SKY = { spring: ['#EAF3E2', '#CFE3BE'], summer: ['#F4F0D8', '#D7E6B5'], autumn: ['#F5E8D6', '#E2CFA3'], winter: ['#E9EEF2', '#D3DCE2'] };
  function gardenSVG(plants, month, title) {
    var W = 720, rows = Math.max(1, Math.ceil(plants.length / 18)), H = 150 + rows * 70;
    var sn = season(month), sky = SKY[sn];
    var s = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-labelledby="garden-t"><title id="garden-t">' + esc(title) + '</title>' +
      '<rect width="' + W + '" height="' + H + '" fill="' + sky[0] + '"/><rect y="' + (H - rows * 70 - 40) + '" width="' + W + '" height="' + (rows * 70 + 40) + '" fill="' + sky[1] + '"/>';
    for (var r = 0; r < rows; r++) s += '<path d="M20 ' + (H - r * 70 - 26) + 'H' + (W - 20) + '" stroke="#8a6a44" stroke-width="5" stroke-linecap="round" opacity=".55"/>';
    if (sn === 'winter') for (var i = 0; i < 40; i++) s += '<circle cx="' + ((i * 97) % W) + '" cy="' + ((i * 53) % (H - 60)) + '" r="2" fill="#fff" opacity=".8"/>';
    if (sn === 'autumn') for (i = 0; i < 16; i++) s += '<ellipse cx="' + ((i * 131) % W) + '" cy="' + (30 + (i * 37) % 60) + '" rx="4" ry="2" fill="#c27a2c" opacity=".6" transform="rotate(' + (i * 40) + ' ' + ((i * 131) % W) + ' ' + (30 + (i * 37) % 60) + ')"/>';
    plants.forEach(function (pl, idx) {
      var row = Math.floor(idx / 18), col = idx % 18;
      var x = 40 + col * 37 + (row % 2 ? 18 : 0), y = H - row * 70 - 28;
      s += plantSVG(KIND[pl.type] || 'tulip', x, y, SCALE[pl.level] || 0.7);
    });
    if (!plants.length) s += '<text x="' + W / 2 + '" y="' + (H / 2) + '" text-anchor="middle" font-size="18" fill="#4B5D50">Your garden is ready for its first plant.</text>';
    return s + '</svg>';
  }

  return { ICON: ICON, printSheet: printSheet, RULES: RULES, gardenSVG: gardenSVG, plantSVG: plantSVG, KIND: KIND, season: season, PRINT_PAT: PRINT_PAT, edgeCells: edgeCells };
});
