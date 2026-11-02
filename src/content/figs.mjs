// Inline SVG figures. Example boards are produced by the real puzzle engine at build time,
// so every pictured puzzle is valid and has exactly one solution.
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const core = require('../js/core.js');
const fb = require('../js/flowerbeds.js');
const tents = require('../js/tents.js');
const gp = require('../js/gardenpath.js');
const ss = require('../js/sunshade.js');

const C = 44;
const BED = ['var(--bed0)', 'var(--bed1)', 'var(--bed2)', 'var(--bed3)', 'var(--bed4)', 'var(--bed5)'];
const T = (x, y, s, extra = '') => `<text x="${x}" y="${y}" font-size="13" fill="var(--muted)" text-anchor="middle" ${extra}>${s}</text>`;
const flower = (cx, cy, r = 12) => `<g>${[0, 72, 144, 216, 288].map((a) => `<circle cx="${(cx + Math.sin(a * Math.PI / 180) * r * 0.55).toFixed(1)}" cy="${(cy - Math.cos(a * Math.PI / 180) * r * 0.55).toFixed(1)}" r="${(r * 0.36).toFixed(1)}" fill="var(--plum)"/>`).join('')}<circle cx="${cx}" cy="${cy}" r="${(r * 0.3).toFixed(1)}" fill="var(--pollen)"/></g>`;
const cross = (cx, cy) => `<path d="M${cx - 6} ${cy - 6}l12 12M${cx + 6} ${cy - 6}l-12 12" stroke="var(--muted)" stroke-width="2" stroke-linecap="round"/>`;
const tree = (cx, cy) => `<circle cx="${cx}" cy="${cy - 3}" r="11" fill="var(--tree)"/><rect x="${cx - 2}" y="${cy + 6}" width="4" height="9" fill="#7a5532"/>`;
const tent = (cx, cy) => `<path d="M${cx} ${cy - 13}L${cx - 13} ${cy + 11}h26z" fill="var(--tent)"/>`;
const sunIcon = (cx, cy) => `<circle cx="${cx}" cy="${cy}" r="9" fill="var(--sun)"/>`;
const shadeIcon = (cx, cy) => `<path d="M${cx - 12} ${cy + 2}a12 12 0 0 1 24 0z" fill="var(--shade)"/><path d="M${cx} ${cy + 2}v9" stroke="var(--shade)" stroke-width="2.4"/>`;

function wrap(w, h, title, inner) {
  const id = 'f' + core.hash(title).toString(36);
  return `<svg viewBox="0 0 ${w} ${h}" role="img" aria-labelledby="${id}"><title id="${id}">${title}</title>${inner}</svg>`;
}
function labels(n, ox, oy) {
  let s = '';
  for (let i = 0; i < n; i++) s += T(ox + i * C + C / 2, oy - 8, core.COLS[i]) + T(ox - 12, oy + i * C + C / 2 + 5, i + 1);
  return s;
}
function bedsBoard(p, ox, oy, opts = {}) {
  const n = p.n; let s = '';
  for (let k = 0; k < n * n; k++) {
    const r = Math.floor(k / n), c = k % n;
    const hl = opts.focus && opts.focus.includes(k);
    s += `<rect x="${ox + c * C}" y="${oy + r * C}" width="${C}" height="${C}" fill="${BED[p.colors[p.regions[k]]]}" stroke="var(--line)"/>`;
    if (hl) s += `<rect x="${ox + c * C + 3}" y="${oy + r * C + 3}" width="${C - 6}" height="${C - 6}" fill="none" stroke="var(--plum)" stroke-width="3" rx="3"/>`;
  }
  for (let k = 0; k < n * n; k++) {
    const r = Math.floor(k / n), c = k % n;
    if (c + 1 < n && p.regions[k] !== p.regions[k + 1]) s += `<line x1="${ox + (c + 1) * C}" y1="${oy + r * C}" x2="${ox + (c + 1) * C}" y2="${oy + (r + 1) * C}" stroke="var(--line-strong)" stroke-width="3.5"/>`;
    if (r + 1 < n && p.regions[k] !== p.regions[k + n]) s += `<line x1="${ox + c * C}" y1="${oy + (r + 1) * C}" x2="${ox + (c + 1) * C}" y2="${oy + (r + 1) * C}" stroke="var(--line-strong)" stroke-width="3.5"/>`;
  }
  s += `<rect x="${ox}" y="${oy}" width="${n * C}" height="${n * C}" fill="none" stroke="var(--line-strong)" stroke-width="3"/>`;
  const state = opts.state || [];
  for (let k = 0; k < n * n; k++) {
    const cx = ox + (k % n) * C + C / 2, cy = oy + Math.floor(k / n) * C + C / 2;
    if (state[k] === 1) s += flower(cx, cy);
    else if (state[k] === 2 && opts.crosses) s += cross(cx, cy);
  }
  const seen = {};
  for (let k = 0; k < n * n; k++) if (!seen[p.regions[k]]) {
    seen[p.regions[k]] = 1;
    s += `<text x="${ox + (k % n) * C + 4}" y="${oy + Math.floor(k / n) * C + 13}" font-size="10" font-weight="700" fill="var(--ink)">${p.beds[p.regions[k]]}</text>`;
  }
  return s + labels(n, ox, oy);
}
function withSize(mod, size, level, key) {
  const old = mod.SIZES[level];
  mod.SIZES[level] = size;
  try { return mod.generate(key, level); } finally { mod.SIZES[level] = old; }
}

// 1. a solved 5×5 Flower Beds example
export function figFlowerSolved() {
  const p = withSize(fb, 5, 'sprout', 'figure-1');
  const w = 5 * C + 60;
  return wrap(w, w, 'A solved 5 by 5 Flower Beds puzzle: five beds, one flower in each row, column and bed, and no two flowers touching', bedsBoard(p, 34, 30, { state: p.solution }));
}
// 2. rules: what one flower blocks
export function figFlowerBlocks() {
  const p = withSize(fb, 5, 'sprout', 'figure-1');
  const g = fb.geom(p); const flowerAt = p.solution.indexOf(1) + 5 * 2; // a flower in row 3
  const f = p.solution.findIndex((v, k) => v === 1 && Math.floor(k / 5) === 2);
  const state = new Array(25).fill(0); state[f] = 1;
  g.near[f].forEach((x) => { state[x] = 2; });
  void flowerAt;
  const w = 5 * C + 60;
  return wrap(w, w, 'One flower rules out its whole row, its whole column, its whole bed and the eight squares around it', bedsBoard(p, 34, 30, { state, crosses: true }));
}
// 3. "three beds, three rows": a real position from a Grove puzzle where the k-confined step applies
export function figConfined(kWanted = 3) {
  for (let d = 0; d < 120; d++) {
    const p = fb.generate(core.addDays('2026-11-02', d), 'grove');
    const g = fb.geom(p); const s = new Int8Array(p.n * p.n);
    for (let i = 0; i < 200; i++) {
      const st = fb.nextStep(g, s, 3);
      if (!st) break;
      if (st.tech === 'k-confined' && st.text.includes('those ' + core.word(kWanted) + ' lines') && /beds fit entirely inside rows/.test(st.text)) {
        const w = p.n * C + 60;
        const svg = wrap(w, w, `A Grove position: ${core.word(kWanted)} beds fit inside the same ${core.word(kWanted)} rows, so every other square in those rows stays empty`, bedsBoard(p, 34, 30, { state: Array.from(s), crosses: true, focus: st.mark }));
        return { svg, text: st.text, key: p.key };
      }
      st.set.forEach(([k, v]) => { s[k] = v; });
    }
  }
  throw new Error('no confined example');
}
// 4. a solved Tents & Trees example
export function figTents() {
  const p = withSize(tents, 5, 'sprout', 'figure-tents');
  const n = p.n, ox = 34, oy = 30; let s = '';
  for (let k = 0; k < n * n; k++) s += `<rect x="${ox + (k % n) * C}" y="${oy + Math.floor(k / n) * C}" width="${C}" height="${C}" fill="var(--cell-bg)" stroke="var(--line)"/>`;
  s += `<rect x="${ox}" y="${oy}" width="${n * C}" height="${n * C}" fill="none" stroke="var(--line-strong)" stroke-width="3"/>`;
  for (let k = 0; k < n * n; k++) {
    const cx = ox + (k % n) * C + C / 2, cy = oy + Math.floor(k / n) * C + C / 2;
    if (p.solution[k] === 3) s += tree(cx, cy); else if (p.solution[k] === 1) s += tent(cx, cy);
  }
  for (let i = 0; i < n; i++) {
    s += `<text x="${ox + n * C + 16}" y="${oy + i * C + C / 2 + 6}" font-size="16" font-weight="700" fill="var(--ink)" text-anchor="middle">${p.rowCount[i]}</text>`;
    s += `<text x="${ox + i * C + C / 2}" y="${oy + n * C + 22}" font-size="16" font-weight="700" fill="var(--ink)" text-anchor="middle">${p.colCount[i]}</text>`;
  }
  s += labels(n, ox, oy);
  return wrap(n * C + 70, n * C + 64, 'A solved 5 by 5 Tents and Trees puzzle: every tree has its own tent beside it and the numbers count the tents per row and column', s);
}
// 5. Sun & Shade rules as three short rows
export function figBinaryRules() {
  const rows = [
    ['Pair', [1, 1, 2, 0, 0, 0], 2, 'Two suns side by side: the squares on both ends must be shade.'],
    ['Sandwich', [0, 2, 0, 2, 0, 0], 2, 'Two shades with one gap: the gap must be sun.'],
    ['Count', [1, 2, 1, 1, 0, 0], 4, 'Three suns already in a row of six: the rest are shade.']
  ];
  let s = '', y = 20;
  rows.forEach(([name, vals, , note], ri) => {
    s += `<text x="0" y="${y + 26}" font-size="14" font-weight="700" fill="var(--moss)">${name}</text>`;
    vals.forEach((v, i) => {
      const x = 92 + i * 40;
      s += `<rect x="${x}" y="${y}" width="40" height="40" fill="var(--cell-bg)" stroke="var(--line)"/>`;
      if (v === 1) s += sunIcon(x + 20, y + 20);
      if (v === 2) s += shadeIcon(x + 20, y + 20);
    });
    const answers = ri === 0 ? [[3, 1]] : ri === 1 ? [[2, 0]] : [[4, 1], [5, 1]];
    answers.forEach(([i, kind]) => {
      const x = 92 + i * 40;
      s += `<rect x="${x + 3}" y="${y + 3}" width="34" height="34" fill="none" stroke="var(--plum)" stroke-width="2.5" stroke-dasharray="4 3" rx="3"/>`;
      s += kind === 1 ? `<g opacity=".55">${shadeIcon(x + 20, y + 20)}</g>` : `<g opacity=".55">${sunIcon(x + 20, y + 20)}</g>`;
    });
    s += `<text x="92" y="${y + 58}" font-size="12.5" fill="var(--muted)">${note}</text>`;
    y += 82;
  });
  return wrap(440, y, 'The three basic Sun and Shade deductions: pair, sandwich and count', s);
}
// 6. the "last one" technique: a real line from a Bloom puzzle at the moment the solver needs it
export function figLastOne() {
  for (let d = 0; d < 60; d++) {
    const p = ss.generate(core.addDays('2026-11-02', d), 'bloom');
    const g = ss.geom(p); const s = Int8Array.from(p.givens);
    for (let i = 0; i < 300; i++) {
      const st = ss.nextStep(g, s, 3);
      if (!st) break;
      if (st.tech === 'last-one' && st.focus.length === p.n && st.focus[1] - st.focus[0] === 1) {
        let out = '';
        st.focus.forEach((k, i2) => {
          const x = 10 + i2 * 46;
          out += `<rect x="${x}" y="24" width="46" height="46" fill="var(--cell-bg)" stroke="var(--line)"/>` + T(x + 23, 16, core.cellName(Math.floor(k / p.n), k % p.n));
          if (s[k] === 1) out += sunIcon(x + 23, 47);
          if (s[k] === 2) out += shadeIcon(x + 23, 47);
          const hit = st.set.find(([kk]) => kk === k);
          if (hit) out += `<rect x="${x + 3}" y="27" width="40" height="40" fill="none" stroke="var(--plum)" stroke-width="2.5" stroke-dasharray="4 3" rx="3"/><g opacity=".55">${hit[1] === 1 ? sunIcon(x + 23, 47) : shadeIcon(x + 23, 47)}</g>`;
        });
        return { svg: wrap(390, 80, 'A row from a Bloom puzzle at the moment the last-one technique applies; the dashed square is the deduction', out), text: st.text };
      }
      st.set.forEach(([k, v]) => { s[k] = v; });
    }
  }
  throw new Error('no last-one example');
}
// 7. a solved Garden Path example
export function figPath() {
  const p = withSize(gp, 5, 'sprout', 'figure-path');
  const n = p.n, ox = 34, oy = 30; let s = '';
  for (let k = 0; k < n * n; k++) s += `<rect x="${ox + (k % n) * C}" y="${oy + Math.floor(k / n) * C}" width="${C}" height="${C}" fill="var(--cell-bg)" stroke="var(--line)"/>`;
  s += `<rect x="${ox}" y="${oy}" width="${n * C}" height="${n * C}" fill="none" stroke="var(--line-strong)" stroke-width="3"/>`;
  const pts = p.solution.map((k) => `${ox + (k % n) * C + C / 2},${oy + Math.floor(k / n) * C + C / 2}`).join(' ');
  s += `<polyline points="${pts}" fill="none" stroke="var(--moss)" stroke-width="12" stroke-linecap="round" stroke-linejoin="round" opacity=".55"/>`;
  Object.keys(p.stones).forEach((cell) => {
    const k = +cell, cx = ox + (k % n) * C + C / 2, cy = oy + Math.floor(k / n) * C + C / 2;
    s += `<circle cx="${cx}" cy="${cy}" r="13" fill="var(--moss)"/><text x="${cx}" y="${cy + 5}" font-size="14" font-weight="700" fill="var(--sage)" text-anchor="middle">${p.stones[cell]}</text>`;
  });
  s += labels(n, ox, oy);
  return { svg: wrap(n * C + 60, n * C + 50, 'A solved 5 by 5 Garden Path: one line from stone 1 to the last stone through every square, passing the stones in order', s), stones: Object.keys(p.stones).length };
}
// 8. logic grid transfer diagram
export function figGrid() {
  const ox = 120, oy = 70, c = 34, names = ['Ada', 'Bram', 'Cleo'], crops = ['Basil', 'Kale', 'Peas'], beds = ['Bed 1', 'Bed 2', 'Bed 3'];
  let s = '';
  const grid = (x0, y0, rows, cols, marks, title) => {
    let g = `<text x="${x0 + cols.length * c / 2}" y="${y0 - 52}" font-size="13" font-weight="700" fill="var(--moss)" text-anchor="middle">${title}</text>`;
    cols.forEach((t, j) => { g += `<text transform="translate(${x0 + j * c + c / 2 + 4} ${y0 - 6}) rotate(-60)" font-size="12" fill="var(--ink)">${t}</text>`; });
    rows.forEach((t, i) => { g += `<text x="${x0 - 8}" y="${y0 + i * c + c / 2 + 4}" font-size="12" fill="var(--ink)" text-anchor="end">${t}</text>`; });
    for (let i = 0; i < rows.length; i++) for (let j = 0; j < cols.length; j++) {
      g += `<rect x="${x0 + j * c}" y="${y0 + i * c}" width="${c}" height="${c}" fill="var(--cell-bg)" stroke="var(--line)"/>`;
      const m = marks[i * cols.length + j];
      if (m === 1) g += `<circle cx="${x0 + j * c + c / 2}" cy="${y0 + i * c + c / 2}" r="7" fill="var(--moss)"/>`;
      if (m === 2) g += cross(x0 + j * c + c / 2, y0 + i * c + c / 2);
      if (m === 3) g += `<rect x="${x0 + j * c + 3}" y="${y0 + i * c + 3}" width="${c - 6}" height="${c - 6}" fill="none" stroke="var(--plum)" stroke-width="2.5" stroke-dasharray="4 3"/>` + cross(x0 + j * c + c / 2, y0 + i * c + c / 2);
    }
    return g;
  };
  s += grid(ox, oy, names, crops, [1, 2, 2, 2, 0, 0, 2, 0, 0], 'Gardeners × Crops');
  s += grid(ox + 160, oy, crops, beds, [2, 0, 0, 0, 0, 0, 0, 0, 0], 'Crops × Beds');
  s += grid(ox + 320, oy, names, beds, [3, 0, 0, 0, 0, 0, 0, 0, 0], 'Gardeners × Beds');
  s += `<text x="10" y="${oy + 3 * c + 28}" font-size="12.5" fill="var(--muted)">Ada planted the basil (●) and the basil is not in Bed 1 (✕), so Ada is not in Bed 1 either (dashed).</text>`;
  return wrap(560, oy + 3 * c + 40, 'Transferring a fact between grids: a match in one grid copies the crosses of its partner into another grid', s);
}
// 9. date -> puzzle pipeline
export function figPipeline() {
  const boxes = [['UTC date', '2026-11-02'], ['Seed', 'date + type + level'], ['Generator', 'random layout'], ['Solver', 'logic only, by tier'], ['Counter', 'exactly one solution?'], ['Puzzle', 'same for everyone']];
  let s = '';
  boxes.forEach(([a, b], i) => {
    const x = 6 + (i % 3) * 186, y = 14 + Math.floor(i / 3) * 96;
    s += `<rect x="${x}" y="${y}" width="160" height="62" rx="10" fill="${i === 5 ? 'var(--leaf)' : 'var(--paper)'}" stroke="var(--line-strong)" stroke-width="1.5"/><text x="${x + 80}" y="${y + 26}" font-size="15" font-weight="700" fill="var(--moss)" text-anchor="middle">${a}</text><text x="${x + 80}" y="${y + 46}" font-size="12" fill="var(--muted)" text-anchor="middle">${b}</text>`;
    if (i % 3 < 2 && i < 5) s += `<path d="M${x + 162} ${y + 31}h20" stroke="var(--moss)" stroke-width="2" marker-end="url(#ar)"/>`;
  });
  s += `<path d="M${6 + 2 * 186 + 80} 78v14H86v14" fill="none" stroke="var(--moss)" stroke-width="2" marker-end="url(#ar)"/>`;
  s += `<path d="M${6 + 186 + 80} 172v18H${6 + 186 + 80 - 40}" fill="none" stroke="var(--plum)" stroke-width="1.5" stroke-dasharray="4 3"/><text x="${6 + 186 + 90}" y="186" font-size="11.5" fill="var(--plum)">no: discard and try the next layout</text>`;
  return wrap(570, 200, 'How a daily puzzle is made: the UTC date becomes a seed, the generator proposes layouts, the logic solver and the solution counter accept only fair ones', `<defs><marker id="ar" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10z" fill="var(--moss)"/></marker></defs>` + s);
}
// 10. two-solution vs one-solution picture (fairness)
export function figFair() {
  // a 4x4 binary-like toy: left shows two completions, right adds one clue
  let s = '';
  const sq = (x, y, v, dash) => `<rect x="${x}" y="${y}" width="34" height="34" fill="var(--cell-bg)" stroke="var(--line)"/>` + (v === 1 ? sunIcon(x + 17, y + 17) : v === 2 ? shadeIcon(x + 17, y + 17) : '') + (dash ? `<rect x="${x + 3}" y="${y + 3}" width="28" height="28" fill="none" stroke="var(--plum)" stroke-width="2" stroke-dasharray="4 3"/>` : '');
  const A = [1, 2, 1, 2], B = [2, 1, 2, 1];
  s += `<text x="10" y="18" font-size="13" font-weight="700" fill="var(--moss)">Not fair: two answers fit</text>`;
  A.forEach((v, i) => { s += sq(10 + i * 34, 30, v); });
  B.forEach((v, i) => { s += sq(10 + i * 34, 74, v); });
  s += `<text x="10" y="128" font-size="12" fill="var(--muted)">Row of four, no clue: both rows obey every rule.</text>`;
  s += `<text x="300" y="18" font-size="13" font-weight="700" fill="var(--moss)">Fair: one clue decides</text>`;
  [1, 0, 0, 0].forEach((v, i) => { s += sq(300 + i * 34, 30, v); });
  [1, 2, 1, 2].forEach((v, i) => { s += sq(300 + i * 34, 74, v, i > 0); });
  s += `<text x="300" y="128" font-size="12" fill="var(--muted)">A given sun on A leaves one way to finish.</text>`;
  return wrap(560, 140, 'A puzzle is fair when the clues allow exactly one answer: two completions on the left, one clue removes the ambiguity on the right', s);
}
// 11. learning path
export function figPath3() {
  const cols = [['Sprout', 'one rule at a time', 'var(--bed0)'], ['Bloom', 'two facts combined', 'var(--bed4)'], ['Grove', 'a look ahead', 'var(--bed3)']];
  let s = '';
  cols.forEach(([a, b, f], i) => {
    const x = 10 + i * 190;
    s += `<rect x="${x}" y="20" width="170" height="90" rx="12" fill="${f}" stroke="var(--line-strong)"/><text x="${x + 85}" y="56" font-size="18" font-weight="700" fill="var(--ink)" text-anchor="middle">${a}</text><text x="${x + 85}" y="82" font-size="13" fill="var(--ink)" text-anchor="middle">${b}</text>`;
    if (i < 2) s += `<path d="M${x + 172} 65h14" stroke="var(--moss)" stroke-width="2.5" marker-end="url(#ar2)"/>`;
  });
  return wrap(580, 125, 'The three levels: Sprout needs single rules, Bloom combines two facts, Grove needs a short look ahead', `<defs><marker id="ar2" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10z" fill="var(--moss)"/></marker></defs>` + s);
}
// 12. board sizes per level (bar chart)
export function figSizes(rows) {
  // rows: [label, sprout, bloom, grove]
  let s = '', y = 30;
  s += `<text x="160" y="16" font-size="12" fill="var(--muted)">Squares per board (Sprout / Bloom / Grove)</text>`;
  const fills = ['var(--bed0)', 'var(--bed4)', 'var(--bed3)'];
  rows.forEach(([label, ...vals]) => {
    s += `<text x="150" y="${y + 24}" font-size="13" fill="var(--ink)" text-anchor="end">${label}</text>`;
    vals.forEach((v, i) => {
      s += `<rect x="160" y="${y + i * 13}" width="${v * 3}" height="11" fill="${fills[i]}" stroke="var(--line-strong)" stroke-width=".8"/><text x="${166 + v * 3}" y="${y + i * 13 + 10}" font-size="10.5" fill="var(--muted)">${v}</text>`;
    });
    y += 52;
  });
  return wrap(520, y, 'Bar chart of the number of squares per board at each level for the four grid puzzles', s);
}
// 13. printable pack layout
export function figPack() {
  let s = '';
  ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].forEach((d, i) => {
    const x = 8 + i * 80;
    s += `<rect x="${x}" y="14" width="66" height="92" rx="4" fill="var(--paper)" stroke="var(--line-strong)"/><rect x="${x + 10}" y="32" width="46" height="46" fill="none" stroke="var(--muted)"/><path d="M${x + 10} 47h46M${x + 10} 62h46M${x + 25} 32v46M${x + 40} 32v46" stroke="var(--line)"/><text x="${x + 33}" y="27" font-size="11" fill="var(--ink)" text-anchor="middle">${d}</text><path d="M${x + 10} 88h46M${x + 10} 96h30" stroke="var(--line)" stroke-width="3"/>`;
  });
  return wrap(570, 116, 'A weekly pack: one sheet per day and puzzle type, each with its rules, the date and a large board', s);
}
