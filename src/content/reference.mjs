// Walkthrough and technique reference pages, plus the worked boards that the guides embed.
// Every number and every sentence about a step is produced by the puzzle engine at build time:
// the counts come from src/data/techstats.json (150 daily boards per puzzle and level, see src/techstats.mjs),
// the worked boards from src/content/boardsvg.mjs.
import { createRequire } from 'node:module';
import { solved, frame, techName } from './boardsvg.mjs';
const require = createRequire(import.meta.url);
const core = require('../js/core.js');
const tech = require('../js/techniques.js');

export const NAMES = { flowerbeds: 'Flower Beds', tents: 'Tents & Trees', sunshade: 'Sun & Shade', gardenpath: 'Garden Path', whoplanted: 'Who Planted What' };
const PATHS = { flowerbeds: '/flower-beds/', tents: '/tents-and-trees/', sunshade: '/sun-and-shade/', gardenpath: '/garden-path/', whoplanted: '/who-planted-what/' };
const LEVEL = { sprout: 'Sprout', bloom: 'Bloom', grove: 'Grove' };
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const f1 = (x) => x.toFixed(1);
const longDate = (key) => core.parseKey(key).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' });
const ABOUT = 'Our own method notes: <a href="/about/">About &amp; method</a> and <a href="/guides/fair-logic-puzzles-unique-solutions/">What makes a logic puzzle fair?</a>';

// what each technique decides, in one sentence (ids as in src/js/techniques.js)
export const IDEAS = {
  flowerbeds: { 'last-spot': 'A row, column or bed with one open square left gets its flower there.', confined: 'A bed whose open squares lie in one line owns that line; a line whose open squares lie in one bed owns that bed.', 'touch-all': 'A square whose flower would block every open square of some row, column or bed stays empty.', 'k-confined': 'Two or more beds squeezed into the same number of rows or columns reserve those lines, and the other way round.' },
  tents: { 'no-tree': 'A square with no tree on any of its four sides is grass.', 'line-full': 'A row or column that already has its number of tents gets grass everywhere else.', 'line-fill': 'A row or column with exactly as many open squares as missing tents gets tents on all of them.', 'lone-tree': 'A tree without a tent and with one open side gets its tent there.', 'line-fit': 'Every way to fit the missing tents into a line without two side by side agrees on some squares.', pairing: 'Each tent belongs to one tree: a square whose trees are all taken is grass, and a tree whose neighboring tent belongs to another tree still needs its own.', lookahead: 'A tent that would leave a line or a tree without enough room is ruled out.' },
  sunshade: { pair: 'Two equal symbols side by side: the squares at both ends are the other symbol.', sandwich: 'Two equal symbols with one gap: the gap is the other symbol.', count: 'A line that has half of one symbol gets the other symbol on every open square.', 'last-one': 'A line missing a single symbol of one kind: it can only go where the rest does not form three in a row.', line: 'A line missing two or more of each kind: the squares that every valid way to finish it shares are decided.', cross: 'Ways to finish a line that would leave a crossing line impossible are dropped; what the remaining ways share is decided.' },
  gardenpath: { forced: 'A square with only two usable neighbors (one for an end stone) must use them.', skip: 'Two stones whose numbers are not consecutive are never joined directly.', loop: 'The two ends of one stretch of path are never joined.', bridge: 'A group of squares that can be reached through a single step forces that step.', 'dead-end': 'A step that would take away a connection another square still needs is never used.', split: 'A step that would cut the garden into two parts one path cannot both cover is never used.', order: 'Joining two stretches of path so that the stones come out of order is never possible.' },
  whoplanted: { clue: 'What a clue states outright is entered as ● or ✕.', 'one-each': 'A ● crosses out the rest of its row and column; a row with one open square gets the ●.', transfer: 'Two items that belong together share every ● and ✕.', either: 'When one option of an either-or clue is ruled out, the other one holds.', ends: 'Whoever comes before someone is not last; whoever comes after someone is not first.', 'either-way': 'If every option that is still open for an item excludes the same partner, that partner is excluded.', fit: 'For an ordering clue, a position with no possible partner position is removed.' }
};

// ---------- worked boards ----------
const cache = {};
function board(type, level, key) { const id = type + level + key; return cache[id] || (cache[id] = solved(type, level, key)); }
const walkHref = (b, pos) => `/walkthrough/?puzzle=${b.type}&amp;level=${b.level}&amp;date=${b.key}&amp;step=${pos}`;
function tallyText(b) {
  const counts = tech.tally(b.type, b.steps);
  return tech.ids(b.type).map((id, i) => (counts[i] ? `${esc(techName(b.type, id))} × ${counts[i]}` : '')).filter(Boolean).join(', ');
}
function stepList(b) {
  return `<ol class="steps">${b.steps.map((s) => `<li><b>${esc(techName(b.type, s.tech))}.</b> ${esc(s.text)}</li>`).join('')}</ol>`;
}
function frameFig(b, pos, lead) {
  const s = b.steps[pos - 1], name = `${NAMES[b.type]} ${LEVEL[b.level]} board of ${longDate(b.key)}`;
  const title = s ? `${name} before step ${pos} of ${b.steps.length}: ${techName(b.type, s.tech)}` : `${name}, solved after ${b.steps.length} steps`;
  const cap = s ? `${lead} Step ${pos} of ${b.steps.length}, <b>${esc(techName(b.type, s.tech))}</b>: &ldquo;${esc(s.text)}&rdquo; <a href="${walkHref(b, pos)}">Open this step on the board</a>.` : `${lead} The same board after all ${b.steps.length} steps.`;
  return `<figure>${frame(b, pos, esc(title))}<figcaption>${cap}</figcaption></figure>`;
}
// first step that uses the hardest technique of the path
function keyStep(b) {
  let best = 0;
  b.steps.forEach((s, i) => { if ((tech.get(b.type, s.tech) || { tier: 0 }).tier > (tech.get(b.type, b.steps[best].tech) || { tier: 0 }).tier) best = i; });
  return best + 1;
}
// A section for a guide: one real daily board from the empty grid to the solution.
export function workedBoard(type, level, key, id = 'worked') {
  const b = board(type, level, key), k = keyStep(b), n = b.steps.length;
  return `<h2 id="${id}">A whole board, step by step</h2>
<p>This is the ${LEVEL[level]} ${esc(NAMES[type])} board of ${longDate(key)}, exactly as it was published, solved by the same solver that writes the Why? hints. It needed ${n} steps: ${tallyText(b)}. Solid outlines mark the squares a step reasons about, dashed outlines the squares it decides.</p>
${frameFig(b, 1, 'The start.')}
${k > 1 ? frameFig(b, k, `The first step that needs ${LEVEL[core.LEVELS[tech.get(type, b.steps[k - 1].tech).tier - 1]]}-level reasoning.`) : frameFig(b, Math.ceil(n / 2) + 1, 'Halfway through.')}
<details class="allsteps"><summary>All ${n} steps of this board, in the solver&rsquo;s order</summary>${stepList(b)}</details>
<p><a class="btn ghost small" href="${walkHref(b, 1)}">Step through this board yourself</a></p>`;
}

// ---------- figures and tables from the 150-day counts ----------
function stepsChart(S) {
  const fills = ['var(--bed0)', 'var(--bed4)', 'var(--bed3)'];
  let s = `<text x="150" y="16" font-size="12" fill="var(--muted)">Solver steps per board, average of 150 boards (Sprout / Bloom / Grove)</text>`, y = 30;
  for (const type of tech.TYPES) {
    s += `<text x="140" y="${y + 24}" font-size="13" fill="var(--ink)" text-anchor="end">${esc(NAMES[type])}</text>`;
    core.LEVELS.forEach((l, i) => { const v = S[type][l].steps; s += `<rect x="150" y="${y + i * 13}" width="${(v * 4.6).toFixed(1)}" height="11" fill="${fills[i]}" stroke="var(--line-strong)" stroke-width=".8"/><text x="${(156 + v * 4.6).toFixed(1)}" y="${y + i * 13 + 10}" font-size="10.5" fill="var(--muted)">${f1(v)}</text>`; });
    y += 52;
  }
  return `<svg viewBox="0 0 560 ${y}" role="img" aria-labelledby="stepschart"><title id="stepschart">Bar chart: average number of solver steps per board for the five puzzles at Sprout, Bloom and Grove level</title>${s}</svg>`;
}
function techTable(S) {
  let rows = '';
  for (const type of tech.TYPES) for (const id of tech.ids(type)) {
    const t = tech.get(type, id);
    const cells = core.LEVELS.map((l) => { const x = S[type][l].tech[t.index]; return `<td>${x.boards}${x.boards ? ` <small>(${f1(x.uses / x.boards)}×)</small>` : ''}</td>`; }).join('');
    rows += `<tr data-puzzle="${type}" data-tech="${id}"><td><a href="${PATHS[type]}">${esc(NAMES[type])}</a></td><td><a href="${t.href}">${esc(t.name)}</a></td><td>${LEVEL[core.LEVELS[t.tier - 1]]}</td><td>${esc(IDEAS[type][id])}</td>${cells}</tr>`;
  }
  return `<div class="tablewrap"><table id="tech-table"><caption>All ${tech.TYPES.reduce((a, t) => a + tech.ids(t).length, 0)} techniques of our solver. The last three columns: how many of the 150 daily boards of that level used the technique at least once (November 2, 2026 to March 31, 2027), and in brackets how often per board that used it.</caption>
<thead><tr><th>Puzzle</th><th>Technique</th><th>Level</th><th>What it decides</th><th>Sprout</th><th>Bloom</th><th>Grove</th></tr></thead><tbody>${rows}</tbody></table></div>`;
}
function hardestTable(S) {
  let rows = '';
  for (const type of tech.TYPES) for (const l of ['bloom', 'grove']) {
    const tier = core.LEVELS.indexOf(l) + 1, lv = S[type][l], total = lv.steps * lv.boards;
    const own = lv.tech.filter((x) => tech.get(type, x.id).tier === tier), uses = own.reduce((a, x) => a + x.uses, 0);
    rows += `<tr><td>${esc(NAMES[type])}</td><td>${LEVEL[l]}</td><td>${f1(lv.steps)}</td><td>${own.filter((x) => x.uses).map((x) => esc(tech.get(type, x.id).name)).join(', ')}</td><td>${f1(uses / lv.boards)}</td><td>${Math.round(100 * uses / total)}%</td></tr>`;
  }
  return `<div class="tablewrap"><table><caption>How much of a board is its level&rsquo;s own technique (150 boards per row)</caption>
<thead><tr><th>Puzzle</th><th>Level</th><th>Steps per board</th><th>Techniques of that level that were used</th><th>Their uses per board</th><th>Share of all steps</th></tr></thead><tbody>${rows}</tbody></table></div>`;
}
function unused(S) {
  const out = [];
  for (const type of tech.TYPES) for (const id of tech.ids(type)) {
    const i = tech.get(type, id).index, boards = core.LEVELS.reduce((a, l) => a + S[type][l].tech[i].boards, 0);
    if (boards <= 5) out.push({ type, id, boards });
  }
  return out;
}

// compact table for the beginners guide: what a Sprout board asks for
export function sproutTable(S) {
  const skill = { sunshade: 'Spotting pairs', flowerbeds: 'Finding the last open square', tents: 'Reading the row and column numbers', gardenpath: 'Squares with two ways left', whoplanted: 'Entering clues as ✕ and ●' };
  const size = { sunshade: '6 × 6', flowerbeds: '6 × 6', tents: '6 × 6', gardenpath: '5 × 5', whoplanted: 'three 4 × 4 grids' };
  const rows = ['sunshade', 'flowerbeds', 'tents', 'gardenpath', 'whoplanted'].map((type) => {
    const lv = S[type].sprout;
    return `<tr><td><a href="${PATHS[type]}">${esc(NAMES[type])}</a></td><td>${size[type]}</td><td>${lv.tech.filter((x) => x.boards).map((x) => esc(tech.get(type, x.id).name)).join(', ')}</td><td>${f1(lv.steps)}</td><td>${skill[type]}</td></tr>`;
  }).join('');
  return `<div class="tablewrap"><table><caption>What a Sprout board asks of you (solver paths of 150 daily boards per puzzle, November 2, 2026 to March 31, 2027)</caption>
<thead><tr><th>Puzzle</th><th>Board</th><th>Techniques the solver used</th><th>Solver steps (average)</th><th>First skill</th></tr></thead><tbody>${rows}</tbody></table></div>`;
}

// ---------- the two pages ----------
export function referencePages(S) {
  const ex = board('flowerbeds', 'bloom', '2026-11-02'), exKey = keyStep(ex);
  const exRows = ex.steps.map((s, i) => `<tr><td>${i + 1}</td><td>${esc(techName(ex.type, s.tech))}</td><td>${s.set.map(([k, v]) => core.cellName(Math.floor(k / ex.p.n), k % ex.p.n) + (v === 1 ? ' flower' : ' empty')).join(', ')}</td></tr>`).join('');
  const never = unused(S);
  const neverText = never.map((x) => `&ldquo;${esc(tech.get(x.type, x.id).name)}&rdquo; in ${esc(NAMES[x.type])} (${x.boards === 0 ? 'never' : x.boards + ' of 450 boards'})`);
  const gv = (type, id) => S[type].grove.tech[tech.get(type, id).index];
  const walkthrough = {
    path: '/walkthrough/', crumb: 'Walkthrough', js: 'walk', appName: 'Daily Logic Garden walkthrough', kicker: 'Tool · solution paths', minWords: 450,
    title: 'Step-by-Step Walkthrough for Every Daily Logic Board',
    description: 'Replay any Daily Logic Garden board since launch step by step: each move with the technique name and its reason, a link to that exact step, and a print view.',
    h1: 'Walkthrough: any daily board, one deduction at a time',
    lede: 'Pick a puzzle, a level and a date. The walkthrough solves that board with the same solver that writes the Why? hints and shows every step on the board: which technique, which squares, and why. By default it opens yesterday&rsquo;s board, so today&rsquo;s puzzle is not given away.',
    tool: `<section class="game walk no-print" data-walk aria-label="Walkthrough"><noscript><p>The walkthrough needs JavaScript. A complete worked board is printed further down this page and works without it.</p></noscript></section>`,
    sections: [
      `<h2 id="how">How to use it</h2>
<p><b>Next step</b> and <b>Back</b> move through the solution; the arrow keys <kbd>→</kbd> and <kbd>←</kbd> do the same, <kbd>Home</kbd> jumps to the start and <kbd>End</kbd> to the solved board. Squares with a solid outline are the ones the step reasons about, squares with a dashed outline are the ones it decides. Each step names its technique and links to the place where that technique is explained. The list under the board holds every step; select one to jump there.</p>
<p><b>Copy link to this step</b> gives an address that opens exactly this board at this step – useful when you want to ask someone about one particular move. <b>Copy all steps</b> puts the whole path on the clipboard as plain text, and <b>Print board and steps</b> prints the empty board followed by the numbered list. Nothing is saved, and stepping through a board does not plant anything in your garden.</p>
<p>The walkthrough is not an answer key that was stored somewhere. Your browser rebuilds the board from the date, then asks the solver for the simplest available deduction again and again until the board is full. That is the same procedure our tests use to prove that a board can be solved without guessing.</p>`,
      `<h2 id="example">A worked board without the tool</h2>
<p>The Bloom Flower Beds board of ${longDate(ex.key)} took the solver ${ex.steps.length} steps: ${tallyText(ex)}. The three pictures show the start, the first Bloom-level step and the finished board.</p>
${frameFig(ex, 1, 'The start.')}
${frameFig(ex, exKey, 'The first step that needs Bloom-level reasoning.')}
${frameFig(ex, ex.steps.length + 1, '')}
<div class="tablewrap"><table><caption>The ${ex.steps.length} steps of that board and what each one writes on the grid</caption>
<thead><tr><th>Step</th><th>Technique</th><th>Decides</th></tr></thead><tbody>${exRows}</tbody></table></div>
<p>Squares that a planted flower rules out (its row, column, bed and neighbors) are not listed as steps; the board shows them as small dots. <a href="${walkHref(ex, 1)}">Open this board in the walkthrough</a> to read the reason for every step.</p>`,
      `<h2 id="limits">What the walkthrough does not show</h2>
<p>It shows one valid route, not the only one. The solver always takes the simplest technique that applies and, within a technique, the first place it finds in a fixed scanning order. You may well see a different step first; if it follows from the rules, it is just as right. The step count is therefore a property of our solver, not a score to beat.</p>
<p>The technique list is fixed and published on the <a href="/techniques/">technique reference</a>, together with how often each one was needed on 150 days of boards.</p>`
    ],
    faq: [
      ['Does the walkthrough spoil today’s puzzle?', 'Only if you ask it to. It opens yesterday&rsquo;s board unless the address names another date, and it shows a notice when the selected board is today&rsquo;s.'],
      ['Which dates can I open?', `Every date from the launch on ${longDate('2026-11-02')} up to today (UTC). Boards from the last 30 days also have a &ldquo;Play this board&rdquo; button that opens them in the <a href="/archive/">archive</a>.`],
      ['Why does my own solution use fewer or different steps?', 'Because the solver writes down one small deduction at a time and always prefers the simplest technique. A person often sees several of these at once or takes them in another order.'],
      ['Is anything stored when I use it?', 'No. The walkthrough reads puzzle, level, date and step from the address and writes nothing to your browser&rsquo;s storage. A copied link contains only those four values.']
    ],
    sources: [ABOUT, 'The step texts and pictures on this page are produced by the site&rsquo;s own solver when the site is built; the technique names are listed on the <a href="/techniques/">technique reference</a>.']
  };
  const techniques = {
    path: '/techniques/', crumb: 'Techniques', js: 'finder', appName: 'Daily Logic Garden technique finder', kicker: 'Reference · measured on our own boards', minWords: 600,
    title: 'Logic Puzzle Techniques: What 2,250 Daily Boards Needed',
    description: 'All 31 solving techniques behind our five daily puzzles, with counts from 2,250 generated boards: how many boards needed each one, and where to practice it.',
    h1: 'The 31 techniques behind our puzzles, and how often boards need them',
    lede: 'Our solver knows 31 techniques across the five puzzles. We ran it over the 150 daily boards of every puzzle and level – 2,250 boards from November 2, 2026 to March 31, 2027 – and counted every step. The table shows what each technique decides and how many boards needed it; the finder lists recent boards on which you can practice one.',
    tool: `<section class="game finder no-print" data-finder aria-label="Practice board finder"><noscript><p>The finder needs JavaScript. The full table below works without it.</p></noscript></section>`,
    sections: [
      `<h2 id="table">The full list</h2>
<p>A board&rsquo;s level is set by the hardest technique its solution needs: Sprout boards are solved with Sprout techniques alone, Bloom boards need at least one Bloom technique, Grove boards at least one Grove technique. Each technique name links to its explanation.</p>
${techTable(S)}`,
      `<h2 id="findings">What the counts show</h2>
<figure>${stepsChart(S)}<figcaption>A step is one deduction the solver writes down. Who Planted What has the longest paths because each ● is followed by separate steps that cross out the rest of its row and column and carry the fact into the other grids.</figcaption></figure>
<p><b>The technique that gives a level its name is usually a small part of the board.</b> A Grove Flower Beds board took ${f1(S.flowerbeds.grove.steps)} steps on average, and only ${f1(gv('flowerbeds', 'k-confined').uses / 150)} of them were the group technique; Touch-all was used ${f1(gv('flowerbeds', 'touch-all').uses / 150)} times per board. In Tents &amp; Trees the look-ahead came up ${f1(gv('tents', 'lookahead').uses / 150)} times per Grove board, in Sun &amp; Shade full-line counting ${f1(gv('sunshade', 'line').uses / 150)} times. Garden Path is the exception: the stone-order argument was needed ${f1(gv('gardenpath', 'order').uses / 150)} times per Grove board.</p>
${hardestTable(S)}
<p><b>Some techniques the solver knows were needed rarely or never.</b> In all 450 boards of their puzzle: ${neverText.join('; ')}. The solver tries techniques in a fixed order from simple to advanced, so a later technique is recorded only when no earlier one applies; on these boards they were almost never the simplest available step. They remain part of the solver and can still appear in a hint.</p>
<p><b>Sprout really is one idea at a time.</b> No Sprout board in the sample used a Bloom or Grove technique, and no Bloom board a Grove technique – the generator rejects boards that would.</p>`,
      `<h2 id="method">How the counts were made</h2>
<p>For every date and level, the build script generates the board exactly as your browser does, then follows the solver from the empty grid to the solution and tallies the technique of each step. The same path is what the <a href="/walkthrough/">walkthrough</a> shows. Automatic consequences that the board displays for you – the dots around a planted flower, for example – are not steps.</p>
<p>Two limits matter when you read the numbers. First, they describe our solver&rsquo;s route; a person may solve the same board with other steps. Second, when two techniques would both work, the simpler one is counted, so the figures for advanced techniques are lower bounds for how often they <i>could</i> be used. The sample is the first 150 days of the site, including dates that had not been played yet when this page was last built; the boards are fixed by their date, so the counts do not change.</p>`
    ],
    faq: [
      ['Why 150 days?', 'For the first 150 days after launch the site stores the generator&rsquo;s starting point for the slowest boards, so all 2,250 boards can be rebuilt quickly and identically whenever the site is built. The automated tests recompute a sample and compare it with the stored counts.'],
      ['Can I practice one technique on purpose?', 'Yes. Choose the puzzle and the technique in the finder above. It lists the boards of the last 30 days whose solution path uses that technique, with a link to play the board and a link that opens the walkthrough at the first step where the technique appears.'],
      ['Do I need the advanced techniques to finish a Sprout board?', 'No. Every Sprout board in the sample was solved with Sprout techniques only; that is what the level means.'],
      ['Are these the standard names for the techniques?', 'They are the names our hints use. Other puzzle sites and books use their own terms for similar ideas; where a guide of ours mentions a common name, it says so.']
    ],
    sources: [ABOUT, 'All counts on this page were computed by the site&rsquo;s own generator and solver; there is no external data source. The <a href="/walkthrough/">walkthrough</a> shows the solution path of any single board.']
  };
  return [walkthrough, techniques];
}

// data for the finder script: names and day-by-day counts
export function finderData(data) {
  const list = {};
  for (const type of tech.TYPES) list[type] = { name: NAMES[type], path: PATHS[type], tech: tech.ids(type).map((id) => [id, tech.get(type, id).name, tech.get(type, id).tier]) };
  return { start: data.start, list, counts: data.counts };
}
