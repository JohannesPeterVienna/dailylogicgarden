// Build-time pictures of a real board at one moment of its solution path. The board, its state and the
// highlighted step all come from the puzzle engine (src/js); nothing here is drawn by hand.
// Solid outline: the squares the step reasons about. Dashed outline: the squares it decides.
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const core = require('../js/core.js');
const tech = require('../js/techniques.js');
const MODS = { flowerbeds: require('../js/flowerbeds.js'), tents: require('../js/tents.js'), sunshade: require('../js/sunshade.js'), gardenpath: require('../js/gardenpath.js'), whoplanted: require('../js/whoplanted.js') };

const C = 44, OX = 34, OY = 30;
const BED = [0, 1, 2, 3, 4, 5, 6, 7].map((i) => `var(--bed${i})`);
const xy = (k, n) => [OX + (k % n) * C, OY + Math.floor(k / n) * C];
const mid = (k, n) => { const [x, y] = xy(k, n); return [x + C / 2, y + C / 2]; };
// Icons are drawn once per picture (<defs>) and placed with <use>; ids carry the picture's own prefix.
const ICON = {
  flower: `${[0, 72, 144, 216, 288].map((a) => `<circle cx="${(Math.sin(a * Math.PI / 180) * 6.6).toFixed(1)}" cy="${(-Math.cos(a * Math.PI / 180) * 6.6).toFixed(1)}" r="4.3" fill="var(--plum)"/>`).join('')}<circle r="3.6" fill="var(--pollen)"/>`,
  cross: `<path d="M-6-6l12 12M6-6l-12 12" stroke="var(--muted)" stroke-width="2" stroke-linecap="round"/>`,
  xs: `<path d="M-5-5l10 10M5-5l-10 10" stroke="var(--muted)" stroke-width="2" stroke-linecap="round"/>`,
  tick: `<path d="M-4-4l8 8M4-4l-8 8" stroke="var(--muted)" stroke-width="2" stroke-linecap="round"/>`,
  ptick: `<path d="M-4-4l8 8M4-4l-8 8" stroke="var(--plum)" stroke-width="3.5" stroke-linecap="round"/>`,
  dot: `<circle r="2.6" fill="var(--muted)" opacity=".55"/>`,
  yes: `<circle r="7" fill="var(--moss)"/>`,
  tree: `<circle cy="-3" r="11" fill="var(--tree)"/><rect x="-2" y="6" width="4" height="9" fill="#7a5532"/>`,
  tent: `<path d="M0-13L-13 11h26z" fill="var(--tent)"/>`,
  grass: `<path d="M-8 6l3-9l3 9l3-12l3 12l3-8" fill="none" stroke="var(--tree)" stroke-width="1.6" opacity=".7"/>`,
  sun: `<circle r="9" fill="var(--sun)"/>`,
  shade: `<path d="M-12 2a12 12 0 0 1 24 0z" fill="var(--shade)"/><path d="M0 2v9" stroke="var(--shade)" stroke-width="2.4"/>`,
  focus: `<rect x="-19" y="-19" width="38" height="38" fill="none" stroke="var(--plum)" stroke-width="3" rx="3"/>`,
  target: `<rect x="-19" y="-19" width="38" height="38" fill="var(--plum-soft)" fill-opacity=".55" stroke="var(--plum)" stroke-width="2.5" stroke-dasharray="5 3" rx="3"/>`,
  focus34: `<rect x="-14" y="-14" width="28" height="28" fill="none" stroke="var(--plum)" stroke-width="3" rx="3"/>`,
  target34: `<rect x="-14" y="-14" width="28" height="28" fill="var(--plum-soft)" fill-opacity=".55" stroke="var(--plum)" stroke-width="2.5" stroke-dasharray="5 3" rx="3"/>`
};
let used = null, prefix = '';
const put = (name, cx, cy) => { used.add(name); return `<use href="#${prefix}${name}" x="${cx}" y="${cy}"/>`; };

function svg(w, h, title, draw, maxw) {
  prefix = 'b' + core.hash(title).toString(36);
  used = new Set();
  const inner = draw();
  const defs = `<defs>${[...used].map((n) => `<g id="${prefix}${n}">${ICON[n]}</g>`).join('')}</defs>`;
  return `<svg viewBox="0 0 ${w} ${h}" role="img" aria-labelledby="${prefix}"${maxw ? ` style="max-width:${maxw}px"` : ''}><title id="${prefix}">${title}</title>${defs}${inner}</svg>`;
}
function labels(n) {
  let s = '<g font-size="13" fill="var(--muted)" text-anchor="middle">';
  for (let i = 0; i < n; i++) s += `<text x="${OX + i * C + C / 2}" y="${OY - 8}">${core.COLS[i]}</text><text x="${OX - 12}" y="${OY + i * C + C / 2 + 5}">${i + 1}</text>`;
  return s + '</g>';
}
// the grid: one rectangle, tinted squares grouped per tint, all inner lines as one path
function plainCells(n, fill) {
  let s = `<rect x="${OX}" y="${OY}" width="${n * C}" height="${n * C}" fill="var(--cell-bg)"/>`;
  const groups = {};
  if (fill) for (let k = 0; k < n * n; k++) { const f = fill(k); if (f) { const [x, y] = xy(k, n); groups[f] = (groups[f] || '') + `M${x} ${y}h${C}v${C}h-${C}z`; } }
  for (const f of Object.keys(groups)) s += `<path d="${groups[f]}" fill="${f}"/>`;
  let d = '';
  for (let i = 1; i < n; i++) d += `M${OX + i * C} ${OY}v${n * C}M${OX} ${OY + i * C}h${n * C}`;
  return s + `<path d="${d}" stroke="var(--line)" fill="none"/><rect x="${OX}" y="${OY}" width="${n * C}" height="${n * C}" fill="none" stroke="var(--line-strong)" stroke-width="3"/>`;
}
function marks(n, step) {
  if (!step) return '';
  let s = '';
  const target = new Set(step.cells);
  for (const k of new Set(step.focus)) if (!target.has(k)) s += put('focus', ...mid(k, n));
  for (const k of target) s += put('target', ...mid(k, n));
  return s;
}

function flowerbeds(p, user, step) {
  const n = p.n, mod = MODS.flowerbeds;
  let s = plainCells(n, (k) => BED[p.colors[p.regions[k]]]);
  let d = '';
  for (let k = 0; k < n * n; k++) {
    const [x, y] = xy(k, n), r = Math.floor(k / n), c = k % n;
    if (c + 1 < n && p.regions[k] !== p.regions[k + 1]) d += `M${x + C} ${y}v${C}`;
    if (r + 1 < n && p.regions[k] !== p.regions[k + n]) d += `M${x} ${y + C}h${C}`;
  }
  s += `<path d="${d}" stroke="var(--line-strong)" stroke-width="3.5" fill="none"/>`;
  s += marks(n, step);
  const blocked = new Set(mod.blockedBy(p, user));
  for (let k = 0; k < n * n; k++) {
    const [cx, cy] = mid(k, n);
    if (user[k] === 1) s += put('flower', cx, cy); else if (user[k] === 2) s += put('cross', cx, cy); else if (blocked.has(k)) s += put('dot', cx, cy);
  }
  const seen = {};
  for (let k = 0; k < n * n; k++) if (!seen[p.regions[k]]) { seen[p.regions[k]] = 1; const [x, y] = xy(k, n); s += `<text x="${x + 4}" y="${y + 13}" font-size="10" font-weight="700" fill="var(--ink)">${p.beds[p.regions[k]]}</text>`; }
  return { w: n * C + 60, h: n * C + 50, inner: s + labels(n) };
}
function tents(p, user, step) {
  const n = p.n;
  let s = plainCells(n) + marks(n, step);
  for (let k = 0; k < n * n; k++) { const [cx, cy] = mid(k, n); s += user[k] === 3 ? put('tree', cx, cy) : user[k] === 1 ? put('tent', cx, cy) : user[k] === 2 ? put('grass', cx, cy) : ''; }
  for (let i = 0; i < n; i++) {
    s += `<text x="${OX + n * C + 16}" y="${OY + i * C + C / 2 + 6}" font-size="16" font-weight="700" fill="var(--ink)" text-anchor="middle">${p.rowCount[i]}</text>`;
    s += `<text x="${OX + i * C + C / 2}" y="${OY + n * C + 22}" font-size="16" font-weight="700" fill="var(--ink)" text-anchor="middle">${p.colCount[i]}</text>`;
  }
  return { w: n * C + 70, h: n * C + 64, inner: s + labels(n) };
}
function sunshade(p, user, step) {
  const n = p.n;
  let s = plainCells(n, (k) => (p.givens[k] ? 'var(--given)' : '')) + marks(n, step);
  for (let k = 0; k < n * n; k++) { const [cx, cy] = mid(k, n), v = p.givens[k] || user[k]; s += v === 1 ? put('sun', cx, cy) : v === 2 ? put('shade', cx, cy) : ''; }
  return { w: n * C + 60, h: n * C + 50, inner: s + labels(n) };
}
function gardenpath(p, user, step) {
  const n = p.n, g = MODS.gardenpath.geom(p), onPath = new Set(user.path);
  let s = plainCells(n, (k) => (onPath.has(k) ? 'var(--leaf)' : '')) + marks(n, step);
  const seg = (e, attrs) => { const [a, b] = g.edges[e], [x1, y1] = mid(a, n), [x2, y2] = mid(b, n); return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" ${attrs}/>`; };
  const tick = (e, name) => { const [a, b] = g.edges[e], [x1, y1] = mid(a, n), [x2, y2] = mid(b, n); return put(name, (x1 + x2) / 2, (y1 + y2) / 2); };
  for (const e of p.hedges || []) {
    const [a, b] = g.edges[e], [x, y] = xy(a, n);
    s += b === a + 1 ? `<line x1="${x + C}" y1="${y + 2}" x2="${x + C}" y2="${y + C - 2}" stroke="var(--moss)" stroke-width="7" stroke-linecap="round"/>` : `<line x1="${x + 2}" y1="${y + C}" x2="${x + C - 2}" y2="${y + C}" stroke="var(--moss)" stroke-width="7" stroke-linecap="round"/>`;
  }
  const decided = new Map((step ? step.set : []).map(([e, v]) => [String(e), v]));
  for (const e of Object.keys(user.pencil)) if (!decided.has(e)) s += user.pencil[e] === 1 ? seg(e, 'stroke="var(--moss)" stroke-width="4" stroke-linecap="round" opacity=".45"') : tick(e, 'tick');
  if (user.path.length > 1) s += `<polyline points="${user.path.map((k) => mid(k, n).join(',')).join(' ')}" fill="none" stroke="var(--moss)" stroke-width="10" stroke-linecap="round" stroke-linejoin="round" opacity=".6"/>`;
  for (const [e, v] of decided) s += v === 1 ? seg(e, 'stroke="var(--plum)" stroke-width="5" stroke-dasharray="6 4" stroke-linecap="round"') : tick(e, 'ptick');
  for (const cell of Object.keys(p.stones)) { const [cx, cy] = mid(+cell, n); s += `<circle cx="${cx}" cy="${cy}" r="13" fill="var(--moss)"/><text x="${cx}" y="${cy + 5}" font-size="14" font-weight="700" fill="var(--sage)" text-anchor="middle">${p.stones[cell]}</text>`; }
  return { w: n * C + 60, h: n * C + 50, inner: s + labels(n) };
}
function whoplanted(p, user, step) {
  const mod = MODS.whoplanted, g = mod.geom(p), m = g.m, c = 34, left = 96, top = 62, CAT = { who: 'Gardeners', plant: 'Crops', bed: 'Beds', day: 'Days' };
  const focus = new Set(step ? step.focus : []), target = new Set(step ? step.cells : []);
  let s = '', y0 = 0;
  g.pairs.forEach(([a, b]) => {
    s += `<text x="${left + m * c / 2}" y="${y0 + 14}" font-size="13" font-weight="700" fill="var(--moss)" text-anchor="middle">${CAT[p.cats[a]]} × ${CAT[p.cats[b]]}</text>`;
    for (let j = 0; j < m; j++) s += `<text transform="translate(${left + j * c + c / 2 - 2} ${y0 + top + 13}) rotate(-45)" font-size="11.5" fill="var(--ink)">${mod.label(p, b, j)}</text>`;
    const gy = y0 + top + 18;
    let d = '';
    for (let i = 1; i < m; i++) d += `M${left + i * c} ${gy}v${m * c}M${left} ${gy + i * c}h${m * c}`;
    s += `<rect x="${left}" y="${gy}" width="${m * c}" height="${m * c}" fill="var(--cell-bg)" stroke="var(--line-strong)" stroke-width="1.5"/><path d="${d}" stroke="var(--line)" fill="none"/>`;
    for (let i = 0; i < m; i++) {
      const y = gy + i * c;
      s += `<text x="${left - 8}" y="${y + c / 2 + 4}" font-size="12" fill="var(--ink)" text-anchor="end">${mod.label(p, a, i)}</text>`;
      for (let j = 0; j < m; j++) {
        const k = mod.idx(g, a, i, b, j), x = left + j * c, v = user[k];
        if (target.has(k)) s += put('target34', x + c / 2, y + c / 2);
        else if (focus.has(k)) s += put('focus34', x + c / 2, y + c / 2);
        if (v === 1) s += put('yes', x + c / 2, y + c / 2); else if (v === 2) s += put('xs', x + c / 2, y + c / 2);
      }
    }
    y0 += top + 18 + m * c + 14;
  });
  return { w: left + m * c + 44, h: y0, inner: s, maxw: 330 };
}
const DRAW = { flowerbeds, tents, sunshade, gardenpath, whoplanted };

// One daily board with its whole solution path.
export function solved(type, level, key) {
  const mod = MODS[type], p = mod.generate(key, level);
  return { type, level, key, mod, p, steps: tech.path(type, mod, p) };
}
// The board just before step `pos` (1-based) with that step highlighted; pos = steps + 1 gives the solved board.
export function frame(b, pos, title) {
  const user = tech.stateAt(b.type, b.mod, b.p, b.steps, pos - 1);
  let d;
  const out = svg(0, 0, title, () => { d = DRAW[b.type](b.p, user, b.steps[pos - 1] || null); return d.inner; });
  return out.replace('viewBox="0 0 0 0"', `viewBox="0 0 ${d.w} ${d.h}"`).replace('<svg ', d.maxw ? `<svg style="max-width:${d.maxw}px" ` : '<svg ');
}
export const techName = (type, id) => (tech.get(type, id) || { name: 'Reveal' }).name;
