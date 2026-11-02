// Puzzle and tool pages. Each page: the tool plus at least 800 words of explanation,
// a data table, an inline SVG figure, FAQ and sources. Numbers in "measured" tables come
// from running this site's generator on the 60 daily seeds from November 2 to December 31, 2026.
import { figFlowerSolved, figTents, figBinaryRules, figPath, figGrid, figPipeline, figPack } from './figs.mjs';

const TATHAM = '<a href="https://www.chiark.greenend.org.uk/~sgtatham/puzzles/" rel="noopener">Simon Tatham&rsquo;s Portable Puzzle Collection</a> – free, open-source implementations of many grid puzzles, including Tents and a binary puzzle called Unruly';
const WCAG = '<a href="https://www.w3.org/WAI/standards-guidelines/wcag/" rel="noopener">W3C Web Content Accessibility Guidelines (WCAG) overview</a> – the basis for our contrast, keyboard and &ldquo;not by color alone&rdquo; choices';
const ABOUT = 'Our own method notes: <a href="/about/">About &amp; method</a> and <a href="/guides/fair-logic-puzzles-unique-solutions/">What makes a logic puzzle fair?</a>';
const path = figPath();

export const TOOLS = [
  {
    path: '/flower-beds/', crumb: 'Flower Beds', game: 'flowerbeds', appName: 'Flower Beds daily puzzle',
    kicker: 'Daily puzzle · placement',
    title: 'Flower Beds – a Free Queens-Style Puzzle Every Day',
    description: 'Play Flower Beds, a free daily Queens-style logic puzzle: one flower per row, column and bed, none touching. Three levels and hints that explain why.',
    h1: 'Flower Beds: a free Queens-style puzzle, every day',
    lede: 'Plant one flower in every row, every column and every bed – and never let two flowers touch, not even at the corners. Three new boards grow every day at midnight UTC, each with exactly one solution you can reach without guessing.',
    sections: [
      `<h2 id="how">How to play Flower Beds</h2>
<p>The board is a square garden divided into beds. Each bed has its own soft color, its own pattern and its own name – Rose, Iris, Fern, Mint and so on – so you can tell the beds apart even if you can&rsquo;t see the colors. A board with six rows also has six columns and six beds, and you plant exactly six flowers.</p>
<p>Three rules decide where they go:</p>
<ol><li><b>One flower in every row and every column.</b></li><li><b>One flower in every bed.</b></li><li><b>Flowers never touch</b> – not side by side and not diagonally. Around every flower, all eight neighboring squares stay empty.</li></ol>
<p>Tap a square once to mark it empty (✕), tap again to plant a flower, and a third time to clear it. You can drag across several squares to mark them all empty in one stroke. On a keyboard, move with the arrow keys and press <kbd>F</kbd> for a flower, <kbd>X</kbd> for empty and <kbd>Backspace</kbd> to clear. With &ldquo;Show blocked squares&rdquo; switched on, every square that a planted flower rules out shows a faint dot, so you never have to cross off the obvious ones yourself. A flower that clashes with another one gets a red outline, but nothing ever tells you whether a flower is right before you finish – that part is yours.</p>
<p>If you get stuck, press <b>Why?</b>. Instead of revealing a square, the hint names the next deduction in one sentence and outlines the squares it is about, for example: &ldquo;Row 4 has only one open square left, C4, so its flower goes there.&rdquo; You decide whether to apply it.</p>`,
      `<h2 id="levels">What the three levels ask of you</h2>
<p>The levels are not just bigger boards. Each puzzle is solved by our own solver, which uses a fixed list of techniques ordered from simple to advanced, and a puzzle is published at a level only if it needs that level&rsquo;s technique – and nothing harder.</p>
<div class="tablewrap"><table><caption>Flower Beds levels, measured on 60 daily puzzles per level (Nov 2 – Dec 31, 2026)</caption>
<thead><tr><th>Level</th><th>Board</th><th>Techniques you need</th><th>Logical steps (average)</th></tr></thead>
<tbody><tr><td>Sprout</td><td>6 × 6, 6 beds</td><td>Last open square of a row, column or bed</td><td>6.0</td></tr>
<tr><td>Bloom</td><td>7 × 7, 7 beds</td><td>+ a bed confined to one line, and &ldquo;this square would block a whole bed&rdquo;</td><td>12.8</td></tr>
<tr><td>Grove</td><td>8 × 8, 8 beds</td><td>+ several beds squeezed into the same number of rows or columns</td><td>20.0</td></tr></tbody></table></div>
<p>A &ldquo;logical step&rdquo; is one deduction the solver writes down, such as &ldquo;these three squares are empty&rdquo;. Ruling out squares around a planted flower is not counted, because the board does that for you. In all 60 Grove puzzles of the test period the multi-bed technique was needed at least once; in 45 of the 60 Bloom puzzles the solver also needed the &ldquo;would block a whole bed&rdquo; idea.</p>
<p>If you are new to this kind of puzzle, start at Sprout for a few days. The two ideas behind Bloom and Grove are explained step by step in <a href="/guides/star-battle-strategy/">Star Battle strategy: 7 techniques</a> and in <a href="/guides/three-beds-three-rows/">the &ldquo;three beds, three rows&rdquo; trick</a>.</p>`,
      `<h2 id="example">A small example, solved</h2>
<figure>${figFlowerSolved()}<figcaption>A 5 × 5 example made by the same generator as the daily boards. Every row, column and bed holds one flower, and no two flowers share an edge or a corner.</figcaption></figure>
<p>Good first moves are almost always in the smallest beds and in the corners. A bed of two squares side by side, for instance, leaves its flower in one of two squares – and whichever it is, the squares directly above and below that pair are touched by it, so they can be marked empty at once. A bed that lies entirely inside one row claims that row&rsquo;s flower, and every other square of the row can be crossed off.</p>
<p>Once a flower is planted, the board fills in its consequences: its row, its column, its bed and its eight neighbors are all blocked. Then look for a row, column or bed with only one open square left. On Sprout boards, that single idea – the last open square – is enough to solve the whole puzzle.</p>`,
      `<h2 id="hints">How the &ldquo;Why?&rdquo; hints are made</h2>
<p>The hint is not a lookup in the answer key. When you press Why?, the page first checks your marks against the unique solution. If a flower or an empty mark is wrong, the hint points at it and says so – it does not reveal anything else. If everything is right, the same solver that graded the puzzle looks at your current board and reports the easiest deduction it can find, in the order Sprout → Bloom → Grove. That way a hint never jumps ahead with an advanced trick when a simple one is available.</p>
<p>Each hint is a single sentence and comes with highlighted squares: a purple outline for the squares the reasoning is about and a dashed box for the squares it decides. &ldquo;Apply this step&rdquo; writes the deduction onto the board. Hints are counted in your result, but they never cost you anything in your garden.</p>`,
      `<h2 id="beds">Beds you can tell apart without color</h2>
<p>Many region puzzles rely on color alone. About one in twelve men and one in two hundred women have some form of red-green color vision deficiency, so a board where the only difference between two regions is a shade of green and a shade of red is unfair to a lot of players. On Daily Logic Garden every bed has three distinguishing features: a muted tone, a texture (dots, stripes in two directions, cross-hatch, rings and so on) and a thick border wherever two beds meet. The legend under the board names every bed, and screen readers announce each square with its coordinates and bed name, such as &ldquo;C4, Iris bed, open&rdquo;.</p>
<p>The board also works in dark mode, with large touch targets on phones and complete keyboard control on a computer. If you prefer paper, the <b>Print</b> button prints today&rsquo;s board in black and white with the patterns and the first two letters of each bed&rsquo;s name in its top-left square.</p>`,
      `<h2 id="genre">Where this kind of puzzle comes from</h2>
<p>Flower Beds belongs to a family of placement puzzles that puzzle books usually call <i>Star Battle</i>: place a fixed number of stars in every row, column and region so that no two stars touch. The version with one star per region became widely known through a daily puzzle on a professional networking site, which is why many people search for it as a &ldquo;Queens&rdquo; puzzle; we use the term only to describe the genre. Flower Beds is our own implementation with our own boards, generated fresh from the date – nothing is copied from any other publisher.</p>
<p>Unlike chess queens, the flowers here do not attack along diagonals across the board; they only block their eight immediate neighbors. That is exactly the one-star Star Battle rule, and it is why the puzzle can be solved by pure counting and elimination.</p>`
    ],
    faq: [
      ['Is there always exactly one solution?', 'Yes. Every board is checked twice before you see it: our logic solver must finish it without guessing, and a separate brute-force search must find exactly one way to plant the flowers. Boards that fail either check are thrown away.'],
      ['When does a new puzzle appear?', 'At midnight UTC – 7 p.m. in New York during standard time, 4 p.m. in Los Angeles. The page uses your device clock converted to UTC, and everyone in the world gets the same three boards.'],
      ['Can I play earlier days?', 'Yes. The <a href="/archive/">archive</a> lists the last 30 days with links to all three levels. Those boards are recreated from the date on your device, so they are identical to what everyone played that day.'],
      ['Do hints or a slow time hurt my garden?', 'No. A solved puzzle always plants its flower in your garden, no matter how many hints you used or how long it took. There are no streaks to lose.'],
      ['Why can two flowers not touch diagonally?', 'That is the rule that makes the puzzle work. Without it, one-per-row, one-per-column and one-per-bed alone would allow many more arrangements, and the boards could not be built to have a single solution with so few beds.']
    ],
    sources: [
      '<a href="https://www.puzzle-star-battle.com/" rel="noopener">puzzle-star-battle.com</a> – a large online collection of Star Battle puzzles in many sizes',
      '<a href="https://krazydad.com/starbattle/" rel="noopener">KrazyDad Star Battle</a> – printable Star Battle books with solutions',
      WCAG,
      ABOUT
    ]
  },
  {
    path: '/tents-and-trees/', crumb: 'Tents & Trees', game: 'tents', appName: 'Tents & Trees daily puzzle',
    kicker: 'Daily puzzle · placement',
    title: 'Tents and Trees Puzzle – Play Online Free, Daily',
    description: 'Play the Tents and Trees logic puzzle online for free: give every tree its own tent, keep tents apart and match the row counts. Three new boards every day.',
    h1: 'Tents and Trees puzzle – play online free',
    lede: 'Every tree wants one tent right beside it. Tents may not touch each other, not even at the corners, and the numbers along the edges tell you how many tents stand in each row and column. Three fresh campsites open every day.',
    sections: [
      `<h2 id="how">How to play Tents &amp; Trees</h2>
<p>The board shows trees and two rows of numbers: one number at the end of every row and one under every column. Your job is to pitch tents so that:</p>
<ol><li><b>Every tree has its own tent</b> on a square directly above, below, left or right of it – not diagonally. Tents and trees pair up one to one, so there are exactly as many tents as trees.</li>
<li><b>Tents never touch</b>, not side by side and not at a corner.</li>
<li><b>The numbers are exact</b>: a row marked 2 holds exactly two tents.</li></ol>
<p>Tap an empty square once to lay grass (a square that certainly has no tent), twice for a tent and a third time to clear it. Drag across squares to lay grass on all of them. Keyboard players move with the arrows, press <kbd>T</kbd> for a tent, <kbd>G</kbd> for grass and <kbd>Backspace</kbd> to clear. When a row or column has all its tents, its number fades and is struck through – a quiet signal that the rest of that line is grass.</p>
<p>The pairing rule is what makes this puzzle more than counting. A tent standing between two trees can only belong to one of them, so the other tree still needs a tent of its own somewhere else. Keep that in mind and many &ldquo;impossible&rdquo; positions open up.</p>`,
      `<h2 id="levels">The three levels</h2>
<p>As with every puzzle on this site, the level is decided by the reasoning a board needs, checked by our solver, not by its size alone.</p>
<div class="tablewrap"><table><caption>Tents &amp; Trees levels, measured on 60 daily puzzles per level (Nov 2 – Dec 31, 2026)</caption>
<thead><tr><th>Level</th><th>Board</th><th>Trees (average)</th><th>New idea at this level</th><th>Logical steps (average)</th></tr></thead>
<tbody><tr><td>Sprout</td><td>6 × 6</td><td>7.5</td><td>Squares with no tree beside them are grass; full lines; lines with exactly enough room</td><td>8.9</td></tr>
<tr><td>Bloom</td><td>7 × 7</td><td>10.3</td><td>Fitting the remaining tents into one line; trees that already have their tent</td><td>12.7</td></tr>
<tr><td>Grove</td><td>8 × 8</td><td>13.3</td><td>Looking one tent ahead: &ldquo;a tent here would starve that row or that tree&rdquo;</td><td>17.1</td></tr></tbody></table></div>
<p>In the test period, the line-fitting idea appeared in 51 of 60 Bloom boards and the tree-pairing idea in 18; every Grove board needed the one-tent look-ahead at least once. The look-ahead is still short and concrete: you imagine one tent, cross off the eight squares around it and check a single row, column or tree. It never requires trying out long chains of guesses.</p>`,
      `<h2 id="example">A solved example</h2>
<figure>${figTents()}<figcaption>A 5 × 5 example from our generator, shown solved. Each tent sits directly beside its own tree, no two tents touch, and the numbers on the right and below match the tents in each row and column.</figcaption></figure>
<p>How would you start a board like this? First, every square that has no tree directly beside it is grass – it could never hold a tent. On a typical board that removes a third of the squares at once. Next, look at rows and columns marked 0 (all grass) and at lines whose number equals the open squares left (all tents). Then look at trees with only one free side: the tent must go there.</p>
<p>After those first sweeps, count. A row of five that needs two tents and has open squares only at B, C and D can only hold them at B and D, because tents in a line cannot be neighbors. That is the kind of small counting argument the Bloom level is built on; the <a href="/guides/tents-and-trees-rules-strategy/">Tents and Trees strategy guide</a> walks through it with more examples.</p>`,
      `<h2 id="pairing">The pairing rule, explained</h2>
<p>Beginners often forget that tents and trees form couples. A board can satisfy every number and keep every tent apart and still be wrong, because two trees share one tent while a third tent has no tree at all. Our checker uses the full rule: a solution is only accepted if every tent can be matched to a different neighboring tree.</p>
<p>The rule also gives useful deductions. Suppose a tree has exactly one free side left and none of its neighboring tents is free – each of those tents is already the only tent of some other tree. Then the free side must be this tree&rsquo;s tent. In the other direction, a square whose neighboring trees all have their tents already settled can never hold a tent; it is grass. The &ldquo;Why?&rdquo; hint names the pairs it relies on, for example &ldquo;Every tree next to E3 already has its own tent (D3 → D2, E4 → E5), so a tent on E3 would have no tree.&rdquo;</p>`,
      `<h2 id="play-well">Small habits that help</h2>
<ul><li><b>Lay grass generously.</b> Grass is never a risk when it follows from a rule, and a board full of grass makes the remaining choices obvious.</li>
<li><b>Work line by line when you are stuck.</b> For each row, ask: how many tents are still missing, and in how many separate gaps could they go? A gap of three open squares can take at most two tents, a gap of one or two squares at most one.</li>
<li><b>Watch the corners of tents.</b> A new tent removes up to eight squares, often from two different rows and columns at once. Re-check those lines immediately.</li>
<li><b>Use the dots.</b> With &ldquo;Show blocked squares&rdquo; on, the board marks every square around your tents. You can switch this off if you prefer to do it by hand.</li></ul>
<p>When you finish, the page plants a small fir in <a href="/garden/">your garden</a> and gives you a result line you can share – the level, the date, your time and the number of hints, without revealing a single tent.</p>`
    ],
    faq: [
      ['Can a tent touch its own tree diagonally?', 'No. A tent must be directly above, below, left or right of its tree. Diagonal neighbors do not count as a pair, although a tent may of course stand diagonally next to some other tree.'],
      ['Can two tents be next to the same tree?', 'Yes, as long as each tent can be paired with a different tree. A tree may have several tents around it; only one of them is its own.'],
      ['Are the puzzles the same for everyone?', 'Yes. The board is created in your browser from the date and the level, so every player gets the same campsite on the same day without any server or account.'],
      ['How big are the boards?', 'Sprout boards are 6 × 6, Bloom boards 7 × 7 and Grove boards 8 × 8. The level is decided by the reasoning a board needs, so a Grove board is not just a larger Sprout.'],
      ['Can I print the puzzle?', 'Yes. The Print button prints today&rsquo;s board with its numbers and trees in black and white, and the <a href="/printable/">printable packs</a> collect a whole week on separate pages.']
    ],
    sources: [
      '<a href="https://www.brainbashers.com/tents.asp" rel="noopener">BrainBashers Tents</a> – long-running daily Tents puzzles in several sizes',
      TATHAM,
      ABOUT
    ]
  },
  {
    path: '/sun-and-shade/', crumb: 'Sun & Shade', game: 'sunshade', appName: 'Sun & Shade daily binary puzzle',
    kicker: 'Daily puzzle · binary',
    title: 'Sun & Shade: a Binary Puzzle (Takuzu) for Your Phone',
    description: 'Play Sun & Shade, a free daily binary puzzle (Takuzu): no three alike in a row, equal suns and shades per line. Phone-friendly boards with hints that explain.',
    h1: 'Sun &amp; Shade: a binary puzzle (Takuzu) you can finish on your phone',
    lede: 'Fill the garden with sun and shade. No three squares of the same kind may line up next to each other, and every row and column holds exactly as many suns as shades. Three boards a day, sized to fit a phone screen.',
    sections: [
      `<h2 id="how">How to play Sun &amp; Shade</h2>
<p>Some squares are already given; they have a tinted background and cannot be changed. Fill every other square with a sun or a shade so that:</p>
<ol><li><b>No three in a row.</b> Three suns or three shades may never sit next to each other in a row or a column. Two together are fine.</li>
<li><b>Equal counts.</b> Every row and every column has the same number of suns and shades – three of each on a 6 × 6 board, four of each on 8 × 8, five of each on 10 × 10.</li></ol>
<p>Tap a square once for a sun, twice for a shade, a third time to clear. On a keyboard, use the arrows and press <kbd>S</kbd> for sun, <kbd>D</kbd> for shade and <kbd>Backspace</kbd> to clear. When three alike line up, or a line has too many of one kind, the squares involved get a red outline so you can fix the slip before it spreads.</p>
<p>Sun and shade are shown as two different shapes – a round sun with rays and a small parasol – not just two colors, so the board reads the same in dark mode, in print and for color-blind players.</p>`,
      `<h2 id="basics">The three basic deductions</h2>
<figure>${figBinaryRules()}<figcaption>Pair, sandwich and count: the three moves that solve every Sprout board. Dashed squares show what each pattern decides.</figcaption></figure>
<p><b>Pair:</b> two equal squares side by side force the opposite kind on both ends, because a third would make three in a row. <b>Sandwich:</b> two equal squares with one gap between them force the opposite kind into the gap. <b>Count:</b> once a line has its full quota of one kind, every open square left in it is the other kind.</p>
<p>These three moves are all a Sprout board needs. Bloom and Grove boards add counting arguments over a whole line, which the <a href="/guides/binary-puzzle-rules/">binary puzzle rules guide</a> explains with real positions from our boards.</p>`,
      `<h2 id="levels">The three levels</h2>
<div class="tablewrap"><table><caption>Sun &amp; Shade levels, measured on 60 daily puzzles per level (Nov 2 – Dec 31, 2026)</caption>
<thead><tr><th>Level</th><th>Board</th><th>Given squares (average)</th><th>New idea at this level</th><th>Logical steps (average)</th></tr></thead>
<tbody><tr><td>Sprout</td><td>6 × 6</td><td>9.7</td><td>Pair, sandwich, count</td><td>21.3</td></tr>
<tr><td>Bloom</td><td>8 × 8</td><td>16.6</td><td>&ldquo;Last one&rdquo;: a line missing only one sun or one shade</td><td>35.8</td></tr>
<tr><td>Grove</td><td>10 × 10</td><td>21.6</td><td>Full line counting with several suns and shades still missing</td><td>47.3</td></tr></tbody></table></div>
<p>Bigger boards have more givens in absolute numbers, but proportionally fewer: about 27% of the squares on Sprout, 26% on Bloom and 22% on Grove. Every given that our generator could remove without making the puzzle unsolvable at its level has been removed, so each one you see is doing work.</p>
<p>The &ldquo;last one&rdquo; idea deserves a word. When a row of eight still needs one sun and three shades, the sun can only go where three shades would not end up side by side. Usually that leaves exactly one place for it. In all 60 Bloom boards of the test period the solver needed this move at least once, and on all 60 Grove boards it also needed the general version with two or more of each kind missing.</p>`,
      `<h2 id="phone">Designed for a phone</h2>
<p>Binary puzzles are often published in large sizes such as 12 × 12 or 14 × 14, which are hard to tap accurately on a phone. We keep the largest daily board at 10 × 10 so that each square stays at least about 30 pixels wide on a 390-pixel-wide screen, the size of many current phones held upright. The board never scrolls sideways, the controls sit below it rather than beside it, and nothing moves under your finger while you play.</p>
<p>Your progress is saved in your browser after every tap. If you close the tab on the bus and reopen it at home on the same device, the board is exactly as you left it. Nothing is sent to us: there is no account and no server-side scorebook.</p>`,
      `<h2 id="name">Binary puzzle, Takuzu, sun and shade</h2>
<p>The puzzle type is known under several names. &ldquo;Binary puzzle&rdquo; describes the two symbols, often written as 0 and 1; &ldquo;Takuzu&rdquo; is a widely used name in puzzle books and apps; Simon Tatham&rsquo;s free collection has a close relative called Unruly. Some versions add a third rule that no two rows (and no two columns) may be identical. Our boards do not use that rule – every deduction follows from the two rules above alone, and the generator checks that the solution is unique without it.</p>
<p>We chose sun and shade instead of digits because the puzzle is easier to read with two shapes than with 0 and 1 – especially for players who mix up similar digits – and because it fits the garden. The logic is exactly the same.</p>`
    ],
    faq: [
      ['Is &ldquo;no two identical rows&rdquo; a rule here?', 'No. Only the two rules on this page apply: no three alike in a line, and equal numbers of suns and shades in every row and column. Every board has exactly one solution under those two rules.'],
      ['Why do the boards have even sizes?', 'Equal counts are only possible when every row has an even number of squares, so the boards are 6 × 6, 8 × 8 and 10 × 10.'],
      ['What do the red outlines mean?', 'They mark a rule break you can see on the board: three alike next to each other, or more suns or shades in a line than it can hold. They do not tell you whether an unbroken square is correct.'],
      ['Can I solve it without hints?', 'Yes – every board is guaranteed to be solvable by logic alone. Hints are there for the moments when you want to know the next step and why it works.'],
      ['Does the puzzle work offline?', 'Once the page has loaded, the puzzle runs entirely in your browser. You can keep playing if the connection drops; only loading a new page needs the network.']
    ],
    sources: [
      TATHAM,
      '<a href="https://en.wikipedia.org/wiki/Takuzu" rel="noopener">Takuzu on Wikipedia</a> – overview of the puzzle and its variants',
      WCAG,
      ABOUT
    ]
  },
  {
    path: '/garden-path/', crumb: 'Garden Path', game: 'gardenpath', appName: 'Garden Path daily puzzle',
    kicker: 'Daily puzzle · path',
    title: 'Garden Path: Draw One Line Through Every Square',
    description: 'Play Garden Path free: draw one line from stone 1 through every square, passing the numbered stones in order. Daily boards, three levels, explained hints.',
    h1: 'Garden Path: draw one line through every square',
    lede: 'Start on stone 1, end on the last stone, visit the numbered stones in order and walk through every square of the garden exactly once. It sounds like a doodle; it plays like a proper logic puzzle.',
    sections: [
      `<h2 id="how">How to play Garden Path</h2>
<p>The garden is a grid of squares with a few numbered stepping stones. Draw a single path that:</p>
<ol><li>starts on stone <b>1</b> and ends on the stone with the <b>highest number</b>,</li>
<li>passes the other stones <b>in number order</b> – 2 before 3, 3 before 4,</li>
<li>moves only <b>up, down, left or right</b>, never diagonally,</li>
<li>visits <b>every square exactly once</b>, and</li>
<li>never crosses a <b>hedge</b> – the thick dark bars that appear on Bloom and Grove boards.</li></ol>
<p>Put your finger (or mouse) on stone 1 and drag. The path follows you square by square. Drag back over the last square to undo a step, or tap any square on your path to cut it back to that point. You can also tap the next square instead of dragging. On a keyboard, focus the board and use the arrow keys; <kbd>Backspace</kbd> steps back.</p>
<p>When you ask for a hint, the answer may be about a part of the garden your path has not reached yet – for example &ldquo;C5 has only two ways left to go, so the path must pass B5 → C5 → D5.&rdquo; Applied hints are drawn as a dotted purple guide line, and steps that can never be used are marked with a small red bar. When your path reaches a dotted guide, it follows it automatically.</p>`,
      `<h2 id="example">A solved example</h2>
<figure>${path.svg}<figcaption>A 5 × 5 Sprout-style board from our generator, shown solved with ${path.stones} stones. The path starts on stone 1, touches every square once and passes the stones in order.</figcaption></figure>
<p>The best place to start is almost never stone 1. Look at the corners first: a corner square has only two neighbors, so if it is not an end of the path, the path must enter through one and leave through the other. That fixes two steps at once. The same is true for any square that has only two usable neighbors left – because the rest are hedges, or because they are already full.</p>
<p>A square that already has two path segments is &ldquo;full&rdquo;: no further step may enter it. Full squares around a corner often create a new two-exit square next to them, and so the path grows from the edges inwards, long before it is connected to stone 1.</p>`,
      `<h2 id="levels">The three levels</h2>
<div class="tablewrap"><table><caption>Garden Path levels, measured on 60 daily puzzles per level (Nov 2 – Dec 31, 2026)</caption>
<thead><tr><th>Level</th><th>Board</th><th>Stones (average)</th><th>Hedges (average)</th><th>New idea at this level</th></tr></thead>
<tbody><tr><td>Sprout</td><td>5 × 5</td><td>8.8</td><td>0</td><td>Two exits left; no skipping a number; no closed loops</td></tr>
<tr><td>Bloom</td><td>6 × 6</td><td>8.6</td><td>6.1</td><td>Don&rsquo;t cut the garden in two; the only way into a corner region; no dead ends</td></tr>
<tr><td>Grove</td><td>7 × 7</td><td>9.9</td><td>5.8</td><td>Stone order across separate stretches of path</td></tr></tbody></table></div>
<p>The Grove idea is the subtle one. Often you know two separate pieces of the path, each passing some stones. If joining them would put the stones out of order – 3, then 6, then 4 – that connection can never be used. On all 60 Grove boards in the test period, the solver needed this argument at least once; on Sprout and Bloom boards it is never required.</p>`,
      `<h2 id="why">Why every square, and why the stones</h2>
<p>A path that visits every square of a grid exactly once is what mathematicians call a Hamiltonian path. On an empty grid there are a great many of them, so on its own the task would be a doodle with countless answers. The numbered stones and hedges cut those possibilities down until exactly one path is left – and our generator keeps removing stones as long as the puzzle stays uniquely solvable at its level. The stones you see are the minimum our process found for that board, not decoration.</p>
<p>Counting tells you a lot as well. Color the grid like a chessboard: every step moves from a light square to a dark one or back. On a 5 × 5 board with 25 squares, a path through all of them must start and end on the color that has 13 squares. That is a nice check for your own designs, although the daily boards never require it.</p>`,
      `<h2 id="tips">Tips for the drawing itself</h2>
<ul><li><b>Draw slowly near hedges.</b> The path can&rsquo;t cross a hedge; if a drag seems to stop, there is a hedge between the two squares.</li>
<li><b>Use the head marker.</b> The yellow dot shows the current end of your path. Keyboard arrows always move from there.</li>
<li><b>Back up without fear.</b> Undo, dragging back and tapping an earlier square all shorten the path; nothing else on the board changes.</li>
<li><b>Ask for a hint to plan ahead.</b> The dotted guide lines from hints stay on the board even when your path is somewhere else, which turns the puzzle into a planning game if you want it to be.</li></ul>
<p>When the path covers every square and ends on the last stone, the board is solved and a fern grows in <a href="/garden/">your garden</a>.</p>`
    ],
    faq: [
      ['Can the path cross itself?', 'No. Every square is visited exactly once, so the path can never cross or touch a square it has already used.'],
      ['Do I have to start drawing at stone 1?', 'Your drawn path always starts at stone 1, but you can plan anywhere: hints and your own deductions about distant corners are shown as dotted guide lines, and your path follows them when it gets there.'],
      ['What are the thick bars?', 'Hedges. The path may not step between two squares separated by a hedge. They appear on Bloom and Grove boards and replace some of the stones that would otherwise be needed.'],
      ['Is there a time limit?', 'No. The timer only appears in your result line after you finish, and it pauses while the tab is in the background.'],
      ['Is every board solvable without trial and error?', 'Yes. Our solver must complete each board with the techniques of its level before it is published, and a separate search confirms that only one path exists.']
    ],
    sources: [
      '<a href="https://en.wikipedia.org/wiki/Hamiltonian_path" rel="noopener">Hamiltonian path on Wikipedia</a> – the graph-theory background of one-line-through-every-square puzzles',
      TATHAM,
      ABOUT
    ]
  },
  {
    path: '/who-planted-what/', crumb: 'Who Planted What', game: 'whoplanted', appName: 'Who Planted What logic grid puzzle',
    kicker: 'Daily puzzle · logic grid',
    title: 'Who Planted What: Free Beginner Logic Grid Puzzles',
    description: 'Solve Who Planted What, a free daily logic grid puzzle for beginners: match gardeners, crops, beds and days from a few clues. No login, hints that explain.',
    h1: 'Who Planted What: beginner logic grid puzzles',
    lede: 'Four gardeners, four crops, four beds – and a handful of clues. Mark what cannot be true, spot what must be, and work out who planted what, where and when. A small, friendly logic grid every day.',
    sections: [
      `<h2 id="how">How to play</h2>
<p>Each gardener planted exactly one crop in exactly one bed (on Bloom and Grove days, also on exactly one day of the week). No two gardeners share a crop, a bed or a day. Bed 1 is the one nearest the garden gate, so &ldquo;closer to the gate&rdquo; means a lower bed number.</p>
<p>Below the clues you see small grids, one for every pair of categories: Gardeners × Crops, Gardeners × Beds, Crops × Beds and so on. Tap a square once for ✕ (&ldquo;these two don&rsquo;t go together&rdquo;), twice for ● (&ldquo;these two belong together&rdquo;) and a third time to clear it. With &ldquo;Fill ✕ automatically&rdquo; switched on, a ● crosses out the rest of its row and column in that grid for you. Keyboard players move with the arrow keys inside a grid, jump to the next grid with <kbd>Tab</kbd>, and press <kbd>Y</kbd> for yes, <kbd>N</kbd> for no.</p>
<p>The puzzle is solved when every gardener is matched with a crop, a bed and – on four-category days – a day. The Crops × Beds style grids are there to help you think; filling them completely is optional.</p>`,
      `<h2 id="method">The method in three moves</h2>
<figure>${figGrid()}<figcaption>A fact in one grid often settles a square in another: if Ada planted the basil and the basil is not in Bed 1, Ada is not in Bed 1 either.</figcaption></figure>
<ol><li><b>Write down the direct clues.</b> &ldquo;Cleo did not plant the kale&rdquo; is one ✕. &ldquo;Dev planted either the peas or the radishes&rdquo; crosses out every other crop for Dev. A comparison such as &ldquo;Ada worked in a bed closer to the gate than the kale grower&rdquo; tells you, among other things, that Ada did not grow the kale.</li>
<li><b>One per row, one per column.</b> As soon as a row has a ●, the rest of that row is ✕. As soon as a row has only one open square left, that square is the ●.</li>
<li><b>Carry facts between grids.</b> If two items belong together, they share all their other relations: whatever is crossed out for the basil is crossed out for Ada, and the other way round.</li></ol>
<p>These three moves solve every Sprout puzzle. Bloom adds ordering clues (&ldquo;planted the day after&rdquo;) and &ldquo;it can only be one of these two&rdquo; reasoning; Grove adds clues that only fit one way once you look at all positions together. The full method, with examples, is in <a href="/guides/solve-logic-grid-puzzles/">How to solve logic grid puzzles without guessing</a>.</p>`,
      `<h2 id="levels">The three levels</h2>
<div class="tablewrap"><table><caption>Who Planted What levels, measured on 60 daily puzzles per level (Nov 2 – Dec 31, 2026)</caption>
<thead><tr><th>Level</th><th>Categories</th><th>Clues (average)</th><th>Possible arrangements before any clue</th><th>New idea at this level</th></tr></thead>
<tbody><tr><td>Sprout</td><td>Gardener, crop, bed</td><td>6.2</td><td>576</td><td>Direct clues, one per row and column, carrying facts</td></tr>
<tr><td>Bloom</td><td>+ day</td><td>10.3</td><td>13,824</td><td>First and last positions from &ldquo;before/after&rdquo; clues; two-option reasoning</td></tr>
<tr><td>Grove</td><td>+ day</td><td>8.8</td><td>13,824</td><td>Making an ordering clue fit against everything you know</td></tr></tbody></table></div>
<p>The arrangement counts are simple arithmetic: with four gardeners there are 4 × 3 × 2 × 1 = 24 ways to hand out the crops, 24 ways to hand out the beds and 24 for the days, so 24 × 24 = 576 arrangements with three categories and 24 × 24 × 24 = 13,824 with four. The clues must cut that down to exactly one; our generator checks every one of those arrangements against the clues before a puzzle is published.</p>
<p>Grove puzzles have fewer clues than Bloom puzzles on average, because they contain no direct &ldquo;X planted Y&rdquo; statements at all. Each clue says less, so you have to combine more of them.</p>`,
      `<h2 id="clues">How the clues are written</h2>
<p>Every clue is a plain, true statement about the solution, built from a small set of patterns so that there is no wordplay to decode:</p>
<ul><li>&ldquo;X planted the Y&rdquo; and &ldquo;X did not work in Bed 3&rdquo; – direct facts.</li>
<li>&ldquo;X planted either the basil or the kale&rdquo; – exactly one of the two is true.</li>
<li>&ldquo;X worked in a bed closer to the gate than Y did&rdquo; and &ldquo;X planted earlier in the week than Y did&rdquo; – an order, and X and Y are different people.</li>
<li>&ldquo;X and Y worked in neighboring beds&rdquo; or &ldquo;planted on consecutive days&rdquo; – they are one step apart, in either direction.</li>
<li>&ldquo;Y planted the day after X did&rdquo; and &ldquo;Y worked in the bed right after X&rsquo;s&rdquo; – exactly one step, in a known direction.</li></ul>
<p>When a hint refers to a clue, that clue is highlighted in the list. Hints always name the clue or the grid fact they use, so you can follow the argument rather than copy a result.</p>`,
      `<h2 id="paper">Playing on paper</h2>
<p>Logic grids are a classic pencil-and-paper format, and they still work well that way. The Print button prints the clues together with a simple answer table – gardener, crop, bed, day – which many people find easier on paper than the full set of grids. For a whole week at once, use the <a href="/printable/">printable packs</a>. A fresh puzzle appears every day at midnight UTC, and solving it plants a tulip in <a href="/garden/">your garden</a>.</p>`
    ],
    faq: [
      ['Do I have to fill every grid?', 'No. The puzzle counts as solved when every gardener is matched correctly. The grids between the other categories are tools for your reasoning.'],
      ['What does &ldquo;closer to the gate&rdquo; mean?', 'Bed 1 is nearest the gate and Bed 4 is farthest away, so &ldquo;closer to the gate&rdquo; means a lower bed number.'],
      ['Does &ldquo;either … or&rdquo; allow both?', 'No. A gardener plants exactly one crop, so &ldquo;either the basil or the kale&rdquo; means exactly one of the two.'],
      ['Are the gardeners real people?', 'No. The first names are picked at random from a fixed list for each puzzle; they do not refer to anyone.'],
      ['Is there always one answer?', 'Yes. Before a puzzle is published, every possible arrangement is checked against the clues, and exactly one must fit. Our solver must also reach it without guessing.']
    ],
    sources: [
      '<a href="https://logic.puzzlebaron.com/" rel="noopener">Puzzle Baron&rsquo;s Logic Puzzles</a> – a large collection of online logic grid puzzles',
      '<a href="https://en.wikipedia.org/wiki/Zebra_Puzzle" rel="noopener">The Zebra Puzzle on Wikipedia</a> – the best-known logic grid puzzle and its history',
      ABOUT
    ]
  },
  {
    path: '/archive/', crumb: 'Archive', appName: 'Daily Logic Garden archive',
    kicker: 'Archive',
    title: 'Puzzle Archive: Every Daily Logic Garden by Date',
    description: 'Replay the last 30 days of Daily Logic Garden: Flower Beds, Tents & Trees, Sun & Shade, Garden Path and Who Planted What at all three levels, by date.',
    h1: 'Puzzle archive: every daily garden by date',
    lede: 'Missed a day? Every puzzle from the last 30 days is one tap away – five puzzle types, three levels each. Solved ones are marked in yellow, using the progress stored on this device.',
    tool: `<section class="no-print" aria-labelledby="arch-h"><h2 id="arch-h" class="sr-only" style="position:absolute;left:-999px">Last 30 days</h2><p data-archive-sum class="status"></p><div class="arch" data-archive><p>The archive needs JavaScript: the boards are recreated in your browser from their dates.</p></div><p class="howto">S = Sprout, B = Bloom, G = Grove.</p></section>`,
    sections: [
      `<h2 id="how">How the archive works</h2>
<p>Daily Logic Garden has no puzzle database. Every board is grown in your browser from three ingredients: the date in Coordinated Universal Time (UTC), the puzzle type and the level. These are turned into a number – the seed – and the seed drives our generator. The same seed always produces the same sequence of random choices, so the same board grows on every device in the world.</p>
<p>That has a pleasant consequence: the archive does not have to store anything. The list above is computed on the spot from today&rsquo;s date, going back 30 days. When you open an older day, its board is regrown from its date and checked exactly like a fresh one. The links carry the date and level in the address (for example <code>?date=2026-11-02&amp;level=bloom</code>), so you can bookmark a specific puzzle or send it to a friend.</p>
<figure>${figPipeline()}<figcaption>From date to puzzle: the generator proposes layouts, and only boards that our logic solver finishes at the right level and that have exactly one solution are kept.</figcaption></figure>`,
      `<h2 id="why30">Why 30 days</h2>
<p>Thirty days is a deliberate limit. The archive is meant for catching up after a holiday or a busy week, not for an endless backlog. A month gives you 30 × 5 × 3 = 450 boards to choose from, which is plenty, and it keeps the list short enough to scan on a phone. Older seeds still work in principle, but the site only links the last 30 days so that everyone can find the same days in the same place.</p>
<div class="tablewrap"><table><caption>What the archive holds at any time</caption>
<thead><tr><th>Puzzle</th><th>Sprout board</th><th>Bloom board</th><th>Grove board</th><th>Boards in 30 days</th></tr></thead>
<tbody><tr><td><a href="/flower-beds/">Flower Beds</a></td><td>6 × 6</td><td>7 × 7</td><td>8 × 8</td><td>90</td></tr>
<tr><td><a href="/tents-and-trees/">Tents &amp; Trees</a></td><td>6 × 6</td><td>7 × 7</td><td>8 × 8</td><td>90</td></tr>
<tr><td><a href="/sun-and-shade/">Sun &amp; Shade</a></td><td>6 × 6</td><td>8 × 8</td><td>10 × 10</td><td>90</td></tr>
<tr><td><a href="/garden-path/">Garden Path</a></td><td>5 × 5</td><td>6 × 6</td><td>7 × 7</td><td>90</td></tr>
<tr><td><a href="/who-planted-what/">Who Planted What</a></td><td>3 categories</td><td>4 categories</td><td>4 categories</td><td>90</td></tr></tbody></table></div>`,
      `<h2 id="progress">Your progress, kept on your device</h2>
<p>A yellow letter means you solved that board on this browser. The information comes from your garden, which lives in your browser&rsquo;s local storage – we never see it. If you use a second device, its archive starts empty; you can move your garden over with the export and import buttons on the <a href="/garden/">My garden</a> page. Clearing your browser&rsquo;s site data removes the garden, so export it first if you want to keep it.</p>
<p>Half-finished boards are saved too. If you started a Grove board last Tuesday and stopped halfway, opening it from the archive brings back your marks, your hint count and your time so far.</p>
<p>There is no penalty for playing old puzzles. An archive board you solve today plants its plant in your garden just like a fresh one, and your garden never loses anything because you skipped a day.</p>`,
      `<h2 id="time">Which day is &ldquo;today&rdquo;?</h2>
<p>The puzzle day changes at midnight UTC. In New York that is 7 p.m. in winter (8 p.m. during daylight saving time), in London midnight in winter and 1 a.m. in summer, in Sydney late morning. We use UTC so that there is exactly one puzzle per day worldwide; using local midnights would give people in different time zones different boards on the same calendar date.</p>
<p>The page reads your device&rsquo;s clock and converts it to UTC. If your clock is set wrong, you may see a different day&rsquo;s puzzle than everyone else. Dates in the future are never offered, and dates older than 30 days fall back to today&rsquo;s puzzle.</p>
<p>If you would rather work through a week on paper, the <a href="/printable/">printable packs</a> use the same dates and the same boards, one puzzle per page.</p>`
    ],
    faq: [
      ['Can I play puzzles older than 30 days?', 'The archive links the last 30 days only. That keeps the list manageable and makes sure everyone sees the same selection.'],
      ['Why is a day marked as solved on my phone but not on my laptop?', 'Progress is stored in each browser separately. Export your garden on one device and import it on the other to combine them.'],
      ['Do archive puzzles count for my garden?', 'Yes. Any solved board plants its plant, whatever its date, and each board can only be planted once.'],
      ['Are archive boards easier or harder than today&rsquo;s?', 'Neither. Each date gets its own boards from the same generator with the same level rules.'],
      ['Can a puzzle in the archive change?', 'Only if we change the generator itself, which would be noted on the About page. The seeds are fixed, so the same date gives the same board.']
    ],
    sources: [
      'Coordinated Universal Time (UTC) as defined by the International Telecommunication Union (ITU-R Recommendation TF.460) – the time standard behind the daily switch',
      ABOUT
    ]
  },
  {
    path: '/printable/', crumb: 'Printable packs', appName: 'Printable weekly logic puzzle packs',
    kicker: 'Print',
    title: 'Printable Logic Puzzles: Free Weekly Garden Packs',
    description: 'Print a free weekly pack of logic puzzles: Flower Beds, Tents & Trees, Sun & Shade, Garden Path and logic grids, one per page, in black and white.',
    h1: 'Printable logic puzzles: weekly garden packs',
    lede: 'Choose a week, a level and the puzzle types you like, and print them one per page – clear black-and-white boards with the rules at the top. Ideal for a quiet morning, a classroom warm-up or a long train ride.',
    tool: `<form class="game no-print" data-printable aria-labelledby="pack-h"><h2 id="pack-h" style="margin-top:0">Make a pack</h2>
<div class="formrow"><label for="pack-start">First day<input type="date" id="pack-start" name="start"></label>
<label for="pack-level">Level<select id="pack-level" name="level"><option value="sprout">Sprout</option><option value="bloom" selected>Bloom</option><option value="grove">Grove</option></select></label></div>
<fieldset><legend>Puzzles</legend>
<label><input type="checkbox" name="t-flowerbeds" checked> Flower Beds</label><label><input type="checkbox" name="t-tents" checked> Tents &amp; Trees</label><label><input type="checkbox" name="t-sunshade" checked> Sun &amp; Shade</label><label><input type="checkbox" name="t-gardenpath"> Garden Path</label><label><input type="checkbox" name="t-whoplanted"> Who Planted What</label></fieldset>
<p class="row"><button type="submit" class="btn">Create and print the pack</button></p>
<p class="status" role="status" data-pack-msg>The pack covers up to seven days, ending today at the latest.</p><div data-pack-preview></div></form>`,
    sections: [
      `<h2 id="how">How to make a pack</h2>
<p>Pick the first day of your week – any day in the last 30 days – then the level and the puzzle types. Press <b>Create and print the pack</b>. The page grows the boards for up to seven consecutive days, one puzzle per page, and opens your browser&rsquo;s print dialog. To keep a file instead of paper, choose &ldquo;Save as PDF&rdquo; as the printer; most desktop and phone browsers offer that option.</p>
<p>Each page carries the puzzle&rsquo;s name, level and date, the rules in two or three sentences, a large board and the line &ldquo;one solution, no guessing needed&rdquo;. Because the boards come from the same seeds as the daily puzzles, the pack for a given week is exactly what was played online that week, so you can check a finished sheet by opening the same date in the <a href="/archive/">archive</a> and asking for hints.</p>
<figure>${figPack()}<figcaption>A weekly pack: one sheet per day and puzzle type, each with the rules, the date and a large board.</figcaption></figure>`,
      `<h2 id="paper">What the printed boards look like</h2>
<div class="tablewrap"><table><caption>How each puzzle is drawn on paper</caption>
<thead><tr><th>Puzzle</th><th>On screen</th><th>On paper</th><th>Pages for a 7-day pack</th></tr></thead>
<tbody><tr><td>Flower Beds</td><td>Muted bed colors plus patterns</td><td>Patterns only, thick bed borders, two-letter bed labels</td><td>7</td></tr>
<tr><td>Tents &amp; Trees</td><td>Trees, row and column numbers</td><td>Outlined trees, bold numbers</td><td>7</td></tr>
<tr><td>Sun &amp; Shade</td><td>Sun and parasol icons</td><td>Open circle = sun, filled circle = shade</td><td>7</td></tr>
<tr><td>Garden Path</td><td>Stones and hedges</td><td>Numbered black stones, thick hedge bars</td><td>7</td></tr>
<tr><td>Who Planted What</td><td>Clues and pair grids</td><td>Clues plus a simple answer table</td><td>7</td></tr></tbody></table></div>
<p>All sheets are black on white, with no gray backgrounds that waste ink. The beds of Flower Beds are told apart by texture – dots, stripes in two directions, cross-hatching, rings, a fine grid – and every bed&rsquo;s first square carries the first two letters of its name, so even a faint printer leaves the puzzle solvable.</p>
<p>A full pack with all five puzzle types for seven days is 35 pages. If that is more than you want, pick two or three types; the most popular combination for a coffee-table week is Flower Beds, Tents &amp; Trees and Sun &amp; Shade.</p>`,
      `<h2 id="who">Who printable puzzles are good for</h2>
<p>Paper puzzles have advantages that a screen can&rsquo;t match. There is no device to charge, nothing beeps, and you can annotate freely: small dots in Flower Beds for squares you&rsquo;re unsure about, pencil arrows in Garden Path, notes in the margins of a logic grid. Many people simply find it more relaxing to solve with a pencil.</p>
<ul><li><b>Families and classrooms.</b> Sprout boards are a gentle introduction to deductive reasoning. The rules fit in a few lines, and every step can be explained with &ldquo;because&rdquo;.</li>
<li><b>Older solvers.</b> The printed boards are larger than most newspaper puzzles. Print at 100% on letter or A4 paper; our <a href="/guides/logic-puzzles-for-seniors/">guide for seniors</a> has more tips on sizes and pace.</li>
<li><b>Commuters and travelers.</b> A week of puzzles weighs a few sheets of paper and needs no signal.</li></ul>
<p>If you run a club or a class, you are welcome to print packs for your group. Please keep the footer line with our address on the sheets, so others can find the online versions and the hints.</p>`,
      `<h2 id="tips">Printing tips</h2>
<p>For the cleanest result, set the scale to 100% (or &ldquo;actual size&rdquo;) and turn off headers and footers in the print dialog, so the browser does not add its own URL and page numbers on top of ours. Portrait orientation suits every sheet. If your printer offers a draft mode, the boards remain legible because they use solid black lines rather than gray tones.</p>
<p>You can also print a single puzzle from its own page with the <b>Print</b> button below the board. That prints the board you have open – for example yesterday&rsquo;s Grove Tents from the archive – on one sheet.</p>
<p>Solutions are not printed. That is on purpose: every board can be solved by logic alone, and if you get stuck, opening the same date online and pressing &ldquo;Why?&rdquo; gives you the next step with its reason rather than the whole answer.</p>`
    ],
    faq: [
      ['Is the pack really free?', 'Yes. The pack is created in your browser from the daily seeds; there is no sign-up and nothing to buy.'],
      ['Why can I only pick days from the last month?', 'The packs use the same dates as the online archive, which covers the last 30 days, so you can always check a sheet against the online version.'],
      ['Can I get the solutions?', 'Solutions are not printed. Open the same date in the archive and use the hints to check or finish a sheet step by step.'],
      ['Which paper size should I use?', 'Both US letter and A4 work. Print at 100% scale in portrait orientation.'],
      ['Can I print a pack from my phone?', 'Yes, if your phone can print or save to PDF. The pack appears in the system print dialog just like on a computer.']
    ],
    sources: [
      '<a href="https://krazydad.com/starbattle/" rel="noopener">KrazyDad Star Battle</a> – an example of a long-running printable puzzle book series',
      TATHAM,
      ABOUT
    ]
  }
];
