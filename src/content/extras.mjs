// Additional sections appended to guides and tool pages (kept separate to keep the main files readable).
export const EXTRA = {
  '/archive/': [
    `<h2 id="share">Sharing an archive puzzle</h2>
<p>Because the address contains the date and the level, you can send a friend a link to exactly the board you just played – for example a tricky Grove Garden Path from last weekend – and compare notes afterwards. The result line you copy after solving never contains the solution, only the puzzle, level, date, time and hint count.</p>`
  ],
  '/guides/three-beds-three-rows/': [
    `<h2 id="practice">A short practice routine</h2>
<p>On the next Grove board you play, stop after the first easy moves and write the row band of every unfinished bed in the margin, then the column band. Look for two beds with the same two-row band first; pairs are far more common than triples. Only then look for triples. Once you have found one group on your own, press Why? to compare: if the hint names a different group, both are valid – a board can contain several – and the hint simply reports the first one in its search order. After two or three boards the bands become something you see without writing them down.</p>`
  ],
  '/guides/tents-and-trees-rules-strategy/': [
    `<h2 id="levels">How our levels map to these steps</h2>
<p>Sprout boards (6 × 6) are solved by the opening sweep and lone trees. Bloom boards (7 × 7) also need line fitting or pairing. Grove boards (8 × 8) need the one-tent look-ahead at least once. Over the 60 test days, Grove boards had 13.3 trees on average and took our solver 17.1 logical steps; Sprout boards had 7.5 trees and took 8.9 steps. If a Grove board feels stuck, it is almost always a look-ahead moment: pick a square next to a tree that has few options and test it.</p>`
  ],
  '/guides/binary-puzzle-rules/': [
    `<h2 id="crossing">Rows and columns together</h2>
<p>Every square belongs to one row and one column, and a deduction in one direction is often the key for the other. A common rhythm is: finish what the pair and sandwich moves give in the rows, then switch to the columns and do the same, then come back. Each pass usually opens a few new squares. When neither direction gives anything, choose the line – row or column – with the fewest open squares and apply the last-one or full-line count to it.</p>
<p>It also helps to know which mistakes are easy to make. The most frequent one is miscounting a line of eight or ten: four suns look like three when two of them sit at the far ends. Count in pairs, left to right, and keep the half-way number in mind – three for six squares, four for eight, five for ten. Our board outlines a line in red as soon as it has more of one symbol than allowed, which catches most slips early.</p>
<h2 id="levels">Which technique each level needs</h2>
<p>On Daily Logic Garden, Sprout boards (6 × 6) are solved with pair, sandwich and count alone. Bloom boards (8 × 8) need the last-one technique at least once. Grove boards (10 × 10) need full-line counting with two or more of each symbol missing. Over 60 test days, our solver needed 21.3 steps on average for Sprout, 35.8 for Bloom and 47.3 for Grove.</p>`
  ],
  '/guides/solve-logic-grid-puzzles/': [
    `<h2 id="example">A worked mini example</h2>
<p>Take three gardeners – Ada, Bram, Cleo – three crops – basil, kale, peas – and three beds. Clues: (1) Ada did not plant the kale. (2) The person who planted the peas worked in Bed 3. (3) Cleo worked in a bed closer to the gate than Bram did. (4) Ada worked in Bed 3.</p>
<p>Step 1 enters clue 1 as a ✕, clue 2 as a ● between peas and Bed 3, clue 4 as a ● between Ada and Bed 3, and clue 3 as two ✕s: Cleo is not in Bed 3 (someone is farther from the gate) and Bram is not in Bed 1 (someone is closer). Step 2: Ada is in Bed 3, so Bram and Cleo are not; Bram is then in Bed 2 (not 1, not 3), and Cleo in Bed 1. Step 3: Ada is in Bed 3 and the peas are in Bed 3, so Ada planted the peas. That leaves basil and kale for Bram and Cleo – and here this small example would need one more clue. That is a real lesson: when a puzzle stops, check whether you have used every clue completely before assuming you missed something. On our site the clue set is always sufficient.</p>
<h2 id="mistakes">Typical mistakes</h2>
<ul><li>Reading &ldquo;either … or&rdquo; as &ldquo;at least one&rdquo;. In these puzzles it means exactly one, because each person has one item per category.</li>
<li>Forgetting that a comparison means two different people.</li>
<li>Updating one grid and not the others. After every ●, ask: what does this carry over to the other blocks?</li></ul>`
  ],
  '/guides/fair-logic-puzzles-unique-solutions/': [
    `<h2 id="minimal">Why boards are minimized</h2>
<p>After the generator has a valid board, it tries to remove each given square, stone or clue in turn. If the solver can still finish the board at its level without it, it stays removed. The result is a board in which every remaining piece of information is needed – for that solver. This is what makes the boards feel tight: there are no decorative givens, and each one you see contributes to some deduction. It is also why Grove boards often have fewer givens than you might expect: harder techniques extract more from less.</p>
<p>Minimizing is done greedily in a random order fixed by the seed, so a board is minimal in the sense that no single given can be removed – not necessarily the smallest possible board for its solution. Hand-crafted puzzles often go further and place givens to create a theme or a specific &ldquo;aha&rdquo; moment; that is an art our generator does not attempt.</p>
<h2 id="checklist">A short checklist for any puzzle</h2>
<ul><li>Does the publisher state that the puzzle has a unique solution?</li>
<li>Can every step be explained with &ldquo;because&rdquo;, using only the rules and clues?</li>
<li>Does the difficulty label match what you needed?</li>
<li>Are pieces distinguishable without color for everyone who plays?</li></ul>
<p>Our own answers to these questions are on the <a href="/about/">About &amp; method</a> page.</p>
<h2 id="human">What a human solver adds</h2>
<p>A computer check proves that a board is unique and solvable with a given set of techniques. It does not prove that a person will enjoy the route. That is why the hints matter: when a board needs its hardest technique, the hint names it and points at the squares involved, so the hardest moment of the puzzle becomes a moment of learning rather than frustration. And it is why we publish the technique lists openly, so you can judge our ratings for yourself.</p>`
  ],
  '/guides/logic-puzzles-for-beginners/': [
    `<h2 id="first-week">A first week, day by day</h2>
<div class="tablewrap"><table><caption>A gentle first week on Daily Logic Garden</caption>
<thead><tr><th>Day</th><th>Puzzle</th><th>Level</th><th>Focus</th></tr></thead>
<tbody><tr><td>1</td><td>Sun &amp; Shade</td><td>Sprout</td><td>Learn the pair and sandwich moves</td></tr>
<tr><td>2</td><td>Flower Beds</td><td>Sprout</td><td>Find the last open square</td></tr>
<tr><td>3</td><td>Garden Path</td><td>Sprout</td><td>Start in the corners</td></tr>
<tr><td>4</td><td>Tents &amp; Trees</td><td>Sprout</td><td>Grass on squares with no tree</td></tr>
<tr><td>5</td><td>Who Planted What</td><td>Sprout</td><td>Enter every clue first</td></tr>
<tr><td>6</td><td>Your favorite</td><td>Sprout</td><td>Try it without hints</td></tr>
<tr><td>7</td><td>Your favorite</td><td>Bloom</td><td>Read every hint carefully</td></tr></tbody></table></div>
<p>There is no need to follow this plan to the letter. The point is to meet each puzzle once at its easiest level before deciding which ones you enjoy. If you miss a day, the <a href="/archive/">archive</a> keeps it for a month.</p>`,
    `<h2 id="rules-cards">The rules in one line each</h2>
<ul><li><b>Sun &amp; Shade:</b> no three alike next to each other; half suns, half shades in every line.</li>
<li><b>Flower Beds:</b> one flower per row, column and bed; flowers never touch.</li>
<li><b>Tents &amp; Trees:</b> each tree gets its own tent beside it; tents never touch; numbers count tents.</li>
<li><b>Garden Path:</b> one line through every square, from stone 1, stones in order.</li>
<li><b>Who Planted What:</b> each gardener has one crop, bed and day; use the clues.</li></ul>
<p>If you remember these five lines, you can play everything on this site. The longer explanations on each puzzle page add controls, examples and the first techniques worth learning.</p>
<h2 id="why-logic">Why reasoning beats guessing</h2>
<p>It is tempting to place a piece and see what happens. On a board with a unique solution, that usually leads to a contradiction many moves later, and then you don&rsquo;t know which of your moves was wrong. Reasoning step by step is slower at first and much faster overall, because you never have to undo. It is also where the satisfaction lies: the solution is not found, it is proven.</p>
<h2 id="after">After the first weeks</h2>
<p>Once Sprout boards feel easy, move one puzzle at a time to Bloom. Each Bloom level introduces exactly one new kind of idea, and the hint will show it to you the first time you need it. Read the matching guide afterwards – <a href="/guides/queens-style-puzzle-rules/">Queens-style rules</a>, <a href="/guides/tents-and-trees-rules-strategy/">Tents strategy</a>, <a href="/guides/binary-puzzle-rules/">binary rules</a> or <a href="/guides/solve-logic-grid-puzzles/">logic grids</a> – to see the idea explained with diagrams. Grove is for when Bloom boards go smoothly without hints. There is no hurry: many regular players stay at Bloom for months and enjoy every board.</p>
<p>Your garden records the level of every solved puzzle, with taller plants for harder levels, so you can see your own progress over the weeks without any scores or rankings.</p>
<p>One last tip: talk yourself through a step out loud, or explain it to someone else. If you can finish the sentence &ldquo;this square must be a flower, because …&rdquo;, the move is safe. If the sentence trails off, it is a guess in disguise – look again or ask for a hint.</p>`
  ],
  '/guides/logic-puzzles-for-seniors/': [
    `<h2 id="routine">A daily routine that stays pleasant</h2>
<p>Many people like a fixed spot in the day for a puzzle – with breakfast, after a walk, before the evening news. One puzzle at Sprout level takes a few minutes; a Bloom board somewhat longer. If a puzzle starts to feel like work, stop. Your progress is saved, and the board will be exactly as you left it. You can come back an hour later or the next day; the archive keeps every board for 30 days.</p>
<p>Doing puzzles together is a good alternative. Two people at one tablet can take turns explaining the next step to each other – which is exactly what the Why? hint does, and a good way to learn the techniques.</p>
<h2 id="choose">Which puzzle suits which taste</h2>
<p>If you enjoy crosswords and stories, start with Who Planted What: it is mostly reading and careful bookkeeping. If you like doodling, Garden Path is the most relaxed. If you prefer numbers, Tents &amp; Trees gives you counts to work with. Sun &amp; Shade is the quickest to learn, and Flower Beds rewards an eye for shapes.</p>
<h2 id="screens">Phone, tablet or computer?</h2>
<p>All three work, and the board adapts to the screen. On a phone, boards up to 8 × 8 have comfortable squares; the 10 × 10 Sun &amp; Shade Grove board is easier on a tablet or computer. With a mouse, a single click marks a square. With a keyboard you never need to aim at all: the arrow keys move a clearly outlined cursor and a letter key places the mark. If you use a screen reader, every square announces its position and contents, for example &ldquo;C4, Iris bed, open&rdquo;.</p>
<h2 id="no-pressure">No pressure, no tricks</h2>
<p>The site never asks you to sign up, never sends notifications and never hides the next puzzle behind a timer or a purchase. Advertising appears below the puzzles and between article sections, never on top of a board. If an ad ever gets in your way, please <a href="/contact/">tell us</a> on which page.</p>`,
    `<h2 id="memory">Help without spoilers</h2>
<p>Coming back to a half-finished board after a break can be confusing: why did I mark that square? The Why? hint helps here too. It first checks every mark you have made against the solution and, if one is wrong, points at it and lets you clear it with one button. If everything is right, it suggests the next step and explains it, so you can pick up the thread again. Undo also remembers your recent moves, and Start over clears the board while keeping everything already planted in your garden.</p>
<p>For printed sheets, write lightly in pencil. A soft eraser lets you fix a mark without smudging the grid, and the large squares of our printouts leave room for small notes.</p>
<p>Finally, set your own pace for difficulty. There is no reason to move on from Sprout if Sprout is what you enjoy; the boards are new every day, and a quiet, successful puzzle is worth more than a frustrating hard one. When you are curious about Bloom, try it on a day with time to spare and keep the hint button in mind.</p>`
  ]
};
