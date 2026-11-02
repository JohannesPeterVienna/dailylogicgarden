// Guides: at least 900 words each, a table, an inline SVG, FAQ and sources.
import { figConfined as figConf2, figFlowerBlocks, figConfined, figTents, figLastOne, figBinaryRules, figGrid, figFair, figPipeline, figPath3, figSizes } from './figs.mjs';

const ABOUT = 'Our own method notes: <a href="/about/">About &amp; method</a>';
const TATHAM = '<a href="https://www.chiark.greenend.org.uk/~sgtatham/puzzles/" rel="noopener">Simon Tatham&rsquo;s Portable Puzzle Collection</a> – free implementations of Tents, Unruly (a binary puzzle) and many other grid puzzles';
const STARBATTLE = '<a href="https://www.puzzle-star-battle.com/" rel="noopener">puzzle-star-battle.com</a> – a large online collection of Star Battle puzzles';
const KRAZY = '<a href="https://krazydad.com/starbattle/" rel="noopener">KrazyDad Star Battle</a> – printable Star Battle books';
const WCAG = '<a href="https://www.w3.org/WAI/standards-guidelines/wcag/" rel="noopener">W3C Web Content Accessibility Guidelines (WCAG) overview</a>';
const confined3 = figConfined(3);
const lastOne = figLastOne();

export const GUIDES = [
  {
    path: '/guides/queens-style-puzzle-rules/', crumb: 'Queens-style rules', kicker: 'Rules · Flower Beds',
    title: 'How to Play Queens-Style Puzzles: Rules in One Minute',
    description: 'The rules of Queens-style puzzles (one-star Star Battle) in one minute: one per row, column and region, no touching. Diagrams, first moves, common slips.',
    h1: 'How to play Queens-style puzzles: rules in one minute',
    lede: 'Queens-style puzzles have only three rules, and you can learn them in a minute. This page explains them with our Flower Beds boards, shows what a single placement rules out, and lists the first moves and the most common mistakes.',
    sections: [
      `<h2 id="rules">The three rules</h2>
<p>A Queens-style board is a square grid – often 6 × 6 to 9 × 9 – divided into colored regions. On Daily Logic Garden the regions are flower beds and the pieces are flowers; elsewhere they are crowns, stars or queens. The rules are the same:</p>
<ol><li><b>Exactly one piece in every row and every column.</b></li>
<li><b>Exactly one piece in every region.</b> An 8 × 8 board therefore has eight regions and eight pieces.</li>
<li><b>No two pieces touch</b> – not side by side and not diagonally.</li></ol>
<p>That is all. There is no rule about long diagonals: despite the name, the pieces do not attack like chess queens across the whole board. They only block the eight squares directly around them. In puzzle books this genre is called a <i>one-star Star Battle</i>; &ldquo;Queens&rdquo; is a popular nickname that comes from a daily game on a professional networking site.</p>`,
      `<h2 id="blocks">What one piece rules out</h2>
<figure>${figFlowerBlocks()}<figcaption>A single flower in row 3 crosses out its whole row, its whole column, its whole bed and the eight squares around it. Real board from our generator.</figcaption></figure>
<p>Every placement removes a lot at once. In the picture, one flower removes its row (because the row is now complete), its column (same reason), every other square of its bed, and the ring of neighbors that also catches squares of two other rows and columns. On a 5 × 5 board that is more than half of the board decided by one move. This is why the puzzle feels slow at the start and fast at the end: the first two or three placements carry all the difficulty.</p>
<p>The flip side: a wrong placement also removes a lot, and you may not notice for several moves. If the board suddenly leaves a bed with no open square, the mistake is usually two or three flowers back. On our boards, the Why? hint checks your marks first and points at a wrong one before giving any new step.</p>`,
      `<h2 id="first">Your first moves on any board</h2>
<div class="tablewrap"><table><caption>Where to look first, and why it works</caption>
<thead><tr><th>Look for</th><th>What it tells you</th><th>Level where you need it</th></tr></thead>
<tbody><tr><td>A row, column or bed with one open square</td><td>The piece goes there</td><td>Sprout</td></tr>
<tr><td>A bed that lies inside one row or column</td><td>The rest of that line is empty</td><td>Bloom</td></tr>
<tr><td>A row or column that lies inside one bed</td><td>The rest of that bed is empty</td><td>Bloom</td></tr>
<tr><td>A square that touches every open square of some bed</td><td>That square is empty, or the bed would have no room</td><td>Bloom</td></tr>
<tr><td>Two or three beds squeezed into the same two or three lines</td><td>Those lines belong to them; everything else there is empty</td><td>Grove</td></tr></tbody></table></div>
<p>Small beds are the friendliest starting point. A bed of one square is a gift: the piece is there. A bed of two squares side by side means the two squares directly above them (and below them) are touched by either option, so they can be crossed out. A bed shaped like a short bar along an edge often claims its row.</p>
<p>If nothing jumps out, count. Which rows still have many open squares, which have few? A row with only two open squares that both lie in the same bed decides that bed&rsquo;s piece is in that row – the rest of the bed is empty. That is the most useful single idea in the whole genre, and the next guides build on it.</p>`,
      `<h2 id="slips">Common slips</h2>
<ul><li><b>Forgetting diagonals.</b> Two pieces at B2 and C3 touch at a corner and break rule 3. Our board outlines such pairs in red.</li>
<li><b>Counting a region twice.</b> A long, winding bed can reach into four or five rows. It still gets only one piece.</li>
<li><b>Guessing early.</b> Every board on this site has exactly one solution reachable by logic. If you feel you must guess, there is a deduction you haven&rsquo;t seen yet – press Why? instead.</li>
<li><b>Relying on color alone.</b> Similar shades are easy to confuse late at night or on a dim screen. Our beds also have patterns, names and thick borders; use them.</li></ul>`,
      `<h2 id="sizes">Board sizes and how many arrangements exist</h2>
<p>Without the regions, how many ways are there to place one piece per row and column with no two touching? For small boards you can count it by computer, and we did: 2 ways on a 4 × 4 board, 14 on 5 × 5, 90 on 6 × 6, 646 on 7 × 7 and 5,242 on 8 × 8. (These numbers are a known sequence in combinatorics, related to an old problem about kings on a chessboard.) The regions have to whittle those thousands down to one. That is why a well-made board has beds of very different shapes: the irregular ones carry the information.</p>
<p>On Daily Logic Garden, Sprout boards are 6 × 6, Bloom 7 × 7 and Grove 8 × 8, but the level is set by the techniques a board requires. Ready to play? Today&rsquo;s boards are on the <a href="/flower-beds/">Flower Beds</a> page; when the simple moves run out, continue with <a href="/guides/star-battle-strategy/">Star Battle strategy</a>.</p>`
    ],
    faq: [
      ['Do pieces block diagonals like a chess queen?', 'No. A piece blocks only its row, its column, its region and the eight squares directly around it. Squares further away on a diagonal are not affected.'],
      ['Is this the same as Star Battle?', 'It is the one-star version of Star Battle. Two-star Star Battle boards, usually 10 × 10, need two pieces per row, column and region and are considerably harder.'],
      ['How do I know a board is fair?', 'A fair board has exactly one solution and can be solved without guessing. Every board on this site is checked for both before it appears.'],
      ['Which size should I start with?', 'Start with 6 × 6 (our Sprout level). The rules are identical at every size; larger boards simply need more steps and more advanced techniques.'],
      ['Why do people say “Queens” if the pieces are not queens?', 'The nickname comes from a popular daily version that uses crown icons. We describe the genre that way only so people searching for it find the rules.']
    ],
    sources: [STARBATTLE, KRAZY, 'OEIS A002464 (Hertzsprung&rsquo;s problem) – the sequence 2, 14, 90, 646, 5242 for non-touching one-per-row-and-column placements; our own computer count gives the same values', ABOUT]
  },
  {
    path: '/guides/star-battle-strategy/', crumb: 'Star Battle strategy', kicker: 'Strategy · Flower Beds',
    title: 'Star Battle Strategy: 7 Techniques From Easy to Expert',
    description: 'Seven Star Battle and Queens-style solving techniques from easy to expert, with the exact order our solver uses: last square, confinement, touch-all and more.',
    h1: 'Star Battle strategy: 7 techniques from easy to expert',
    lede: 'You know the rules; now you want to stop staring at the board. These seven techniques cover everything our solver needs for the one-star boards on this site – in the order it tries them – plus a few habits that make each technique easier to spot.',
    sections: [
      `<h2 id="overview">The seven techniques at a glance</h2>
<div class="tablewrap"><table><caption>Techniques in the order our solver tries them</caption>
<thead><tr><th>#</th><th>Technique</th><th>Idea in one line</th><th>Level</th></tr></thead>
<tbody><tr><td>1</td><td>Clear the surroundings</td><td>A placed piece empties its row, column, region and neighbors</td><td>automatic</td></tr>
<tr><td>2</td><td>Last open square</td><td>A line or region with one open square gets its piece there</td><td>Sprout</td></tr>
<tr><td>3</td><td>Region inside a line</td><td>A region within one row or column owns that line</td><td>Bloom</td></tr>
<tr><td>4</td><td>Line inside a region</td><td>A row or column within one region owns that region</td><td>Bloom</td></tr>
<tr><td>5</td><td>Touch-all</td><td>A square that would block every option of a region is empty</td><td>Bloom</td></tr>
<tr><td>6</td><td>Two regions, two lines</td><td>Two regions squeezed into two lines own them</td><td>Grove</td></tr>
<tr><td>7</td><td>Three (or more) regions, three lines</td><td>The same counting with bigger groups</td><td>Grove</td></tr></tbody></table></div>
<figure>${figConf2(2).svg}<figcaption>Technique 6 on a real Grove board: two beds whose open squares (outlined) lie in the same two rows. Everything else in those rows is empty.</figcaption></figure>
<p>The levels on Daily Logic Garden are defined by this list: a Sprout board can be finished with techniques 1–2, Bloom needs something from 3–5, and Grove needs 6 or 7 at least once. In our test of 60 Grove boards (November 2 to December 31, 2026), every one of them needed a multi-region step.</p>`,
      `<h2 id="t1-2">1–2: Clear the surroundings, find the last square</h2>
<p>After every placement, cross off its row, its column, its region and the eight squares around it. Our board does this for you with small dots if you leave &ldquo;Show blocked squares&rdquo; switched on – but on paper it is the habit that matters most. Most errors on paper come from a single forgotten diagonal neighbor.</p>
<p>Then scan for a row, column or region with only one open square. Scan regions first: they are usually smaller than lines, so they run out of room sooner. On Sprout boards these two ideas solve everything, which makes Sprout a good place to build the scanning habit.</p>`,
      `<h2 id="t3-4">3–4: Confinement in both directions</h2>
<p>Look at a region and ask: in which rows can its piece still be? If the answer is &ldquo;only row 4&rdquo;, then row 4&rsquo;s piece belongs to this region, and every square of row 4 outside the region is empty. The same works with columns.</p>
<p>The mirror image is just as useful. Look at a row and ask: in which regions are its open squares? If they all belong to one region, that region&rsquo;s piece is in this row, and every other square of the region – in other rows – is empty. Players often find one direction and forget the other; train yourself to ask both questions whenever a region or a line gets small.</p>`,
      `<h2 id="t5">5: Touch-all</h2>
<p>Pick an open square and imagine a piece on it. It would block its row, its column, its region and its neighbors. Now look at the other regions (and lines): does any of them lose <i>all</i> its open squares? Then the imagined piece is impossible, and the square is empty.</p>
<p>This sounds like trial and error, but it isn&rsquo;t: you check one square against one region, with no further consequences. In practice it is found visually. A region of two or three squares in an L shape, sitting next to a square that touches all of them, is the classic picture. Our hint phrases it as &ldquo;A flower on D5 would touch or share a line with every open square of the Rose bed, leaving it no place for its flower, so D5 stays empty.&rdquo; In our test, 45 of 60 Bloom boards and all 60 Grove boards used it.</p>`,
      `<h2 id="t6-7">6–7: Groups of regions and lines</h2>
<p>Technique 3 is the case of one region in one line. Generalize it: if two regions are both confined to the same two rows, those two rows must give their two pieces to these two regions – there is no room for anyone else. Every other square in those rows is empty. With three regions in three rows the logic is identical, just harder to see.</p>
<p>The reverse works too: if all open squares of two columns lie inside two regions, those regions must place their pieces in those columns, and their squares elsewhere are empty. Our dedicated page, <a href="/guides/three-beds-three-rows/">the &ldquo;three beds, three rows&rdquo; trick</a>, shows a real Grove position and how to spot the pattern.</p>`,
      `<h2 id="habits">Habits that make the techniques visible</h2>
<ul><li><b>Mark empties aggressively.</b> Techniques 3–7 all depend on knowing where a region <i>can</i> still go. Crosses make that visible.</li>
<li><b>Work from small to large.</b> Small regions and nearly full lines give the most information.</li>
<li><b>Switch viewpoints.</b> Every few moves, look at rows, then columns, then regions. Each view hides patterns the others show.</li>
<li><b>Use the hint as a teacher.</b> When you press Why?, read the technique name in the sentence and look for the same pattern elsewhere before applying it.</li></ul>
<p>Practice on today&rsquo;s <a href="/flower-beds/">Flower Beds</a> boards. If you prefer to start at the very beginning, read <a href="/guides/queens-style-puzzle-rules/">the rules in one minute</a> first.</p>`
    ],
    faq: [
      ['Is touch-all a form of guessing?', 'No. It checks a single square against a single region without following any chain of consequences. If the region would be left without options, the square is empty – that is a direct deduction.'],
      ['Do these techniques work for two-star Star Battle?', 'The ideas carry over, but the counting changes: with two stars per region, two regions confined to two rows need four stars from them. The pattern is the same, the numbers double.'],
      ['Why does the solver try techniques in a fixed order?', 'So that hints always show the simplest available step, and so that a board&rsquo;s level reflects the hardest technique it truly needs.'],
      ['Which technique is most often missed?', 'A likely candidate is the reverse direction of confinement – a row whose open squares all lie in one region – because it asks you to look at a line instead of a shape. If you are stuck, check that direction explicitly.'],
      ['How many steps does a Grove board take?', 'Our solver records 20 logical steps on average for Grove Flower Beds boards, compared with 6 for Sprout.']
    ],
    sources: [STARBATTLE, KRAZY, ABOUT]
  },
  {
    path: '/guides/three-beds-three-rows/', crumb: 'Three beds, three rows', kicker: 'Technique · Flower Beds',
    title: 'The "Three Beds, Three Rows" Trick Explained',
    description: 'The "three beds, three rows" trick for Star Battle-type puzzles: why regions squeezed into the same lines claim them, shown on a real example board.',
    h1: 'The &ldquo;three beds, three rows&rdquo; trick explained',
    lede: 'When several beds can only use the same few rows, those rows are spoken for – and everything else in them is empty. This one counting idea unlocks most hard Flower Beds and Star Battle boards. Here it is, with a real position from our Grove level.',
    sections: [
      `<h2 id="idea">The idea in plain words</h2>
<p>Every row gets exactly one flower, and every bed gets exactly one flower. Suppose you find three beds whose remaining open squares all lie in rows 5, 6 and 7. Those three beds need three flowers, and those flowers can only be in rows 5, 6 and 7. But those three rows only have three flowers to give. So rows 5, 6 and 7 are completely used up by these three beds – no other bed can place a flower there. Every open square in rows 5–7 that belongs to some other bed is empty.</p>
<p>It is pure counting: three beds need three flowers; three rows offer three flowers; they must match exactly.</p>`,
      `<h2 id="example">A real Grove position</h2>
<figure>${confined3.svg}<figcaption>From the Grove board of ${confined3.key}: the outlined squares are the open squares of three beds, all inside the same three rows. Crosses are squares already ruled out earlier.</figcaption></figure>
<p>This is what our hint said at that moment: <i>&ldquo;${confined3.text}&rdquo;</i></p>
<p>Notice that none of the three beds is confined to a single row. Each one alone could still go in two or three rows, so the simple &ldquo;bed inside a line&rdquo; idea gives nothing. Only the group of three shows the squeeze.</p>`,
      `<h2 id="variants">The four versions of the trick</h2>
<div class="tablewrap"><table><caption>Group confinement in all directions</caption>
<thead><tr><th>You notice</th><th>You conclude</th></tr></thead>
<tbody><tr><td>k beds whose open squares lie within k rows</td><td>Other squares in those rows are empty</td></tr>
<tr><td>k beds whose open squares lie within k columns</td><td>Other squares in those columns are empty</td></tr>
<tr><td>k rows whose open squares lie within k beds</td><td>Other squares of those beds are empty</td></tr>
<tr><td>k columns whose open squares lie within k beds</td><td>Other squares of those beds are empty</td></tr></tbody></table></div>
<p>With k = 1 this is the familiar &ldquo;bed in one row&rdquo; move. With k = 2 and k = 3 it becomes the Grove technique. Larger groups exist, but they are rarely the first thing you find: if k beds fill k rows of an 8 × 8 board with k = 5, then the other three beds fill the other three rows, and the smaller group is usually easier to see.</p>
<p>One check keeps you safe. Count only beds and rows that still need their flower. A bed that already has its flower is finished and does not take part.</p>`,
      `<h2 id="spot">How to spot it</h2>
<ol><li><b>Shade with your eyes.</b> For each bed, note the band of rows it still covers – for example &ldquo;Iris: 2–3&rdquo;, &ldquo;Fern: 2–4&rdquo;, &ldquo;Mint: 3–4&rdquo;. On paper, write these bands beside the board.</li>
<li><b>Look for nested bands.</b> Iris (2–3), Fern (2–4) and Mint (3–4) all fit inside 2–4: three beds, three rows.</li>
<li><b>Check the rest of those rows.</b> If any other bed still has open squares in rows 2–4, those squares are now empty.</li>
<li><b>Repeat with columns.</b> The same beds may form a different group in the column direction.</li></ol>
<p>Beds that run along an edge are the usual suspects, because the board edge already limits them.</p>`,
      `<h2 id="why">Why it is not guessing</h2>
<p>Nothing is assumed. The argument never says &ldquo;suppose the Iris flower is in row 2&rdquo;; it only counts how many flowers a set of rows has to give and how many a set of beds must receive. That is why our solver treats it as a regular logical step, ranks it as the hardest technique on Flower Beds, and lets a Grove board appear only when this step is genuinely needed.</p>
<p>Try it on today&rsquo;s Grove board on the <a href="/flower-beds/">Flower Beds</a> page. When you press Why? at the right moment, the hint names the beds and the rows. For the full set of techniques, see <a href="/guides/star-battle-strategy/">Star Battle strategy</a>.</p>`
    ],
    faq: [
      ['Does the trick work with columns too?', 'Yes. Replace rows with columns everywhere; the counting is identical.'],
      ['What if four beds fit in three rows?', 'Then the board has no solution – four beds cannot share three flowers. On a correct board this means an earlier mark is wrong.'],
      ['Is this the same as the X-wing in Sudoku?', 'It is a cousin: both count how many candidates a group of units can take. The puzzles and rules differ, so the patterns look different.'],
      ['How often is it needed?', 'On our Grove level, every board needs a group of two or more beds at least once; that is what defines the level.'],
      ['Does it help in two-star Star Battle?', 'Yes, with doubled numbers: k regions confined to k rows need 2k stars, which is exactly what those rows offer.']
    ],
    sources: [STARBATTLE, KRAZY, ABOUT]
  },
  {
    path: '/guides/tents-and-trees-rules-strategy/', crumb: 'Tents and Trees strategy', kicker: 'Rules & strategy · Tents',
    title: 'Tents and Trees Rules and Solving Strategy',
    description: 'Tents and Trees rules and strategy: pairing tents with trees, counting tents in a line, the one-tent look-ahead, plus a solved example and common mistakes.',
    h1: 'Tents and Trees rules and solving strategy',
    lede: 'Tents and Trees looks like a camping sketch and plays like a tidy counting puzzle. Here are the rules in full – including the pairing rule many people miss – and the strategy our solver uses, from the first sweep to the look-ahead needed on Grove boards.',
    sections: [
      `<h2 id="rules">The rules</h2>
<ol><li>Every tree has exactly one tent of its own, on a square directly above, below, left or right of it.</li>
<li>Tents and trees are paired one to one, so the number of tents equals the number of trees.</li>
<li>No two tents touch, not even diagonally.</li>
<li>The number next to each row and below each column is the exact number of tents in that line.</li></ol>
<figure>${figTents()}<figcaption>A solved 5 × 5 board from our generator: each tent beside its own tree, no tents touching, all counts matched.</figcaption></figure>`,
      `<h2 id="sweep">The opening sweep</h2>
<p>Start with three quick passes that need no thought:</p>
<ul><li><b>No tree, no tent.</b> A square with no tree directly beside it can never hold a tent. Mark all of them as grass. This often removes a third of the board.</li>
<li><b>Zero lines.</b> Rows and columns marked 0 are all grass.</li>
<li><b>Exact fits.</b> If a line needs as many tents as it has open squares, all of them are tents.</li></ul>
<p>Then look at trees with a single open side and no tent next to them yet: that side is the tent. After every new tent, mark its eight neighbors as grass and re-check the lines it touched. These moves are the whole Sprout level.</p>`,
      `<h2 id="fit">Fitting tents into a line</h2>
<p>Tents in the same row can&rsquo;t be neighbors. So a run of open squares can hold at most half its length, rounded up: one tent in a run of 1 or 2, two in a run of 3 or 4. If a row needs two tents and its only open squares are B, C and D, the tents must be on B and D – C is grass.</p>
<div class="tablewrap"><table><caption>Maximum tents in a run of open squares in one line</caption>
<thead><tr><th>Run length</th><th>1</th><th>2</th><th>3</th><th>4</th><th>5</th><th>6</th></tr></thead>
<tbody><tr><td>Most tents</td><td>1</td><td>1</td><td>2</td><td>2</td><td>3</td><td>3</td></tr>
<tr><td>Forced squares at the maximum</td><td>the square</td><td>none</td><td>both ends</td><td>none</td><td>1st, 3rd, 5th</td><td>none</td></tr></tbody></table></div>
<p>Add the runs of a line together: if the maxima add up exactly to the number of tents needed, every odd-length run is forced into its alternating pattern. Our solver calls this &ldquo;line fit&rdquo; and it is the most common Bloom technique – 51 of 60 Bloom boards in our test period used it.</p>`,
      `<h2 id="pairing">Using the pairing rule</h2>
<p>Pairing turns into deductions in two ways. A tent with only one tree beside it belongs to that tree. Once a tree has its own tent, any square whose only neighboring trees are already paired can&rsquo;t be a tent – it would have no tree to belong to. And a tree whose neighboring tents all belong to other trees still needs its own: if it has one open side left, that is its tent.</p>
<p>Keep track of pairs with a small mental arrow from tree to tent. Our hints spell out the pairs they rely on, e.g. &ldquo;Every tree next to E3 already has its own tent (D3 → D2, E4 → E5)&rdquo;.</p>`,
      `<h2 id="lookahead">The one-tent look-ahead</h2>
<p>When nothing else works, take one open square and imagine a tent on it. Mark its eight neighbors as grass – only those – and check two things: does any row or column now have too few open squares for its number? Does any tree lose its last free side? If yes, the square is grass.</p>
<p>This is the Grove technique, and every Grove board in our test needed it at least once. It is bounded: one tent, one ring of grass, one check. If you find yourself imagining a second tent on top of the first, stop – the boards on this site never require that.</p>`,
      `<h2 id="mistakes">Common mistakes</h2>
<ul><li>Placing a tent diagonally next to its tree. Diagonal does not pair.</li>
<li>Letting two trees share one tent. Count trees and tents; the numbers must match.</li>
<li>Forgetting that a tent blocks squares in the neighboring rows too, which changes their counts.</li></ul>
<p>Play today&rsquo;s boards on <a href="/tents-and-trees/">Tents &amp; Trees</a>.</p>`
    ],
    faq: [
      ['Can a tent stand next to two trees?', 'Yes, but it belongs to only one of them. The other tree needs a different tent.'],
      ['Can a tree be next to another tree?', 'Yes. Trees can stand side by side; only tents have the no-touching rule.'],
      ['What does a struck-through number mean on the board?', 'That row or column already has all its tents. Every open square left in it is grass.'],
      ['Is the look-ahead trial and error?', 'It is a single bounded check – one imagined tent and its immediate neighbors – not a chain of guesses. The boards never need deeper searches.'],
      ['Where does the puzzle come from?', 'Tents puzzles have appeared in puzzle magazines and collections for decades. Our boards are generated by our own code; nothing is copied.']
    ],
    sources: ['<a href="https://www.brainbashers.com/tents.asp" rel="noopener">BrainBashers Tents</a> – daily Tents puzzles with rules', TATHAM, ABOUT]
  },
  {
    path: '/guides/binary-puzzle-rules/', crumb: 'Binary puzzle rules', kicker: 'Rules · Sun & Shade',
    title: 'Binary Puzzle Rules: No Three in a Row, Equal Counts',
    description: 'Binary puzzle (Takuzu) rules explained: no three alike in a row and equal counts per line. Pair, sandwich and last-one techniques with real example rows.',
    h1: 'Binary puzzle rules: no three in a row, equal counts',
    lede: 'Binary puzzles – Takuzu, binairo, our Sun & Shade – rest on two rules. This guide explains both, shows the three basic deductions, and then walks through the counting techniques that harder boards need, using real rows from our puzzles.',
    sections: [
      `<h2 id="rules">The two rules</h2>
<ol><li><b>No three in a row.</b> Never three equal symbols next to each other horizontally or vertically.</li>
<li><b>Equal counts.</b> Each row and each column holds the same number of each symbol – half and half.</li></ol>
<p>Some publishers add a third rule: no two rows (or columns) may be identical. Our Sun &amp; Shade boards don&rsquo;t use it; every board is unique under the two rules alone. If you play elsewhere, check which rule set applies, because the third rule allows some extra deductions.</p>`,
      `<h2 id="basic">Pair, sandwich, count</h2>
<figure>${figBinaryRules()}<figcaption>The three basic moves. Dashed squares show the deduction.</figcaption></figure>
<p>These three moves are mechanical once you know them: scan every row and column for two equal neighbors, for equal symbols with one gap, and for lines that already have half of one kind. On our 6 × 6 Sprout boards they are all you need.</p>`,
      `<h2 id="rows">How many valid lines are there?</h2>
<p>Counting valid lines tells you why the puzzle gets harder with size. We counted every line of a given length that has equal counts and no three in a row:</p>
<div class="tablewrap"><table><caption>Valid lines by length (our own count)</caption>
<thead><tr><th>Line length</th><th>4</th><th>6</th><th>8</th><th>10</th></tr></thead>
<tbody><tr><td>Lines with equal counts and no three in a row</td><td>6</td><td>14</td><td>34</td><td>84</td></tr></tbody></table></div>
<p>A row of six has only 14 possible patterns, so a couple of known squares narrow it down quickly. A row of ten has 84, and you often have to reason about the whole line rather than about neighbors.</p>`,
      `<h2 id="lastone">The &ldquo;last one&rdquo; technique</h2>
<figure>${lastOne.svg}<figcaption>A real row from one of our Bloom boards at the moment this technique applies.</figcaption></figure>
<p>Our hint at that moment: <i>&ldquo;${lastOne.text}&rdquo;</i></p>
<p>When a line is missing just one symbol of one kind, that single symbol can only go where placing the other kind everywhere else does not create three in a row. Try each open square as the position of the lone symbol: usually only one works. This is the Bloom technique on our site; every Bloom board in our test period used it at least once.</p>`,
      `<h2 id="full">Full-line counting</h2>
<p>On 10 × 10 Grove boards you meet lines missing two or more of each kind. The idea is the same, with more cases: list the ways to finish the line that obey both rules, and look for squares that are the same in all of them. With practice you don&rsquo;t write the list – you notice, for example, that two remaining suns cannot both fit into the left gap without three shades forming on the right.</p>
<p>Our solver performs this check line by line and reports the squares that every valid completion shares. It never needs to combine guesses across several lines on the published boards.</p>`,
      `<h2 id="habits">Good habits</h2>
<ul><li>After each new symbol, re-check its row and its column for pairs and sandwiches – most moves cascade.</li>
<li>Keep a running count per line; &ldquo;three suns already&rdquo; on a 6-wide row is the fastest deduction there is.</li>
<li>When stuck, choose the line with the fewest open squares and enumerate.</li></ul>
<p>Play today&rsquo;s boards on <a href="/sun-and-shade/">Sun &amp; Shade</a>.</p>`
    ],
    faq: [
      ['Are binary puzzles and Takuzu the same?', 'Yes, they are names for the same family. Rule sets vary slightly between publishers, mainly in whether identical rows are allowed.'],
      ['Can a line have two equal symbols together?', 'Yes. Two are fine; three are not.'],
      ['Why are boards always even-sized?', 'Equal counts need an even number of squares per line.'],
      ['What if I find two ways to finish a line?', 'Then that line alone does not decide those squares. Look at crossing columns or another line.'],
      ['Is guessing ever needed?', 'Not on our boards. Each one is solved by our solver with the techniques of its level before publication.']
    ],
    sources: [TATHAM, '<a href="https://en.wikipedia.org/wiki/Takuzu" rel="noopener">Takuzu on Wikipedia</a>', ABOUT]
  },
  {
    path: '/guides/solve-logic-grid-puzzles/', crumb: 'Solving logic grids', kicker: 'Strategy · Logic grids',
    title: 'How to Solve Logic Grid Puzzles Without Guessing',
    description: 'A step-by-step method for logic grid puzzles: reading clues, one per row and column, carrying facts between grids and making ordering clues fit.',
    h1: 'How to solve logic grid puzzles without guessing',
    lede: 'Logic grid puzzles give you a story and a few clues, and ask who did what. They look wordy, but a calm, repeatable method solves them every time. Here it is, using our Who Planted What puzzles as examples.',
    sections: [
      `<h2 id="setup">Setting up</h2>
<p>A logic grid has categories (gardeners, crops, beds, days) with the same number of items each. Every item of one category goes with exactly one item of each other category. The grid has one small square block per pair of categories; a ● means &ldquo;these belong together&rdquo;, a ✕ means &ldquo;they don&rsquo;t&rdquo;.</p>
<p>Before reading clues, notice which categories are ordered. Beds numbered from the gate and days of the week are ordered; names and crops are not. Clues like &ldquo;earlier&rdquo; and &ldquo;next to&rdquo; only apply to ordered categories.</p>`,
      `<h2 id="direct">Step 1: Direct clues</h2>
<p>Go through the list once and enter everything a clue states outright: &ldquo;X did not plant Y&rdquo; is a ✕; &ldquo;X planted either A or B&rdquo; crosses out every other option for X. Comparison clues also hide a direct fact: &ldquo;Ada planted earlier than the kale grower&rdquo; means Ada did not grow the kale.</p>`,
      `<h2 id="lines">Step 2: One per row, one per column</h2>
<p>A ● in a row crosses out the rest of the row and the column in that block. A row with only one open square left gets the ●. This step alone often doubles what you know after the direct clues.</p>`,
      `<h2 id="transfer">Step 3: Carry facts between blocks</h2>
<figure>${figGrid()}<figcaption>Ada planted the basil (●), the basil is not in Bed 1 (✕) – so Ada is not in Bed 1.</figcaption></figure>
<p>When two items belong together, they share all their relations. Copy the ✕s and ●s of one onto the other. The more general form: if Ada&rsquo;s crop can only be basil or kale, and neither basil nor kale is in Bed 1, Ada is not in Bed 1.</p>`,
      `<h2 id="order">Step 4: Ordering clues</h2>
<p>For &ldquo;X before Y&rdquo;, X can&rsquo;t be last and Y can&rsquo;t be first. For &ldquo;Y the day after X&rdquo;, X can&rsquo;t be last and Y can&rsquo;t be first either – and as soon as you narrow down X, Y follows. The strongest move is to list where X can still be and where Y can still be, and remove every position that has no partner. Our hints say it like this: &ldquo;Clue 3 can only fit if Ines is on Tuesday or Thursday, which rules out Tuesday for the sunflower grower.&rdquo;</p>
<div class="tablewrap"><table><caption>What each clue type tells you immediately</caption>
<thead><tr><th>Clue</th><th>Immediate facts</th><th>Level on our site</th></tr></thead>
<tbody><tr><td>X planted Y</td><td>● for X/Y</td><td>Sprout, Bloom</td></tr>
<tr><td>X did not plant Y</td><td>✕ for X/Y</td><td>all</td></tr>
<tr><td>X planted either A or B</td><td>✕ for every other crop</td><td>all</td></tr>
<tr><td>X earlier than Y</td><td>X ≠ Y, X not last, Y not first</td><td>all</td></tr>
<tr><td>X and Y on consecutive days</td><td>X ≠ Y; positions must be neighbors</td><td>Bloom, Grove</td></tr>
<tr><td>Y the day after X</td><td>X ≠ Y, X not last, Y not first</td><td>Bloom, Grove</td></tr></tbody></table></div>`,
      `<h2 id="loop">Step 5: Loop</h2>
<p>Repeat steps 2 to 4 until nothing changes. If you are stuck, re-read each clue and ask what it says <i>now</i>, given everything you know. Clues that were useless at the start often decide the end. And never guess – every puzzle on our site has a unique solution that the method above reaches.</p>
<p>Practice with <a href="/who-planted-what/">Who Planted What</a>; Sprout days use only steps 1–3.</p>`
    ],
    faq: [
      ['Do I need to fill every block?', 'No, only enough to identify every match. The extra blocks help you carry facts.'],
      ['What is the fastest way to get better?', 'Write every direct clue first, every time. Most stuck positions come from a clue fact not yet entered.'],
      ['Should I use notes outside the grid?', 'For ordering clues, a short line of positions (1 2 3 4) with possible names under each helps a lot.'],
      ['Are there puzzles with more categories?', 'Yes, classic magazine puzzles often have five categories of five items. The method is the same.'],
      ['Why does the famous Zebra Puzzle feel so hard?', 'It has five categories of five items and many relative clues, so you need many rounds of steps 3 and 4.']
    ],
    sources: ['<a href="https://logic.puzzlebaron.com/" rel="noopener">Puzzle Baron&rsquo;s Logic Puzzles</a>', '<a href="https://en.wikipedia.org/wiki/Zebra_Puzzle" rel="noopener">The Zebra Puzzle on Wikipedia</a>', ABOUT]
  },
  {
    path: '/guides/fair-logic-puzzles-unique-solutions/', crumb: 'Fair puzzles', kicker: 'Method',
    title: 'What Makes a Logic Puzzle Fair? Unique Solutions Explained',
    description: 'What makes a logic puzzle fair: exactly one solution, reachable without guessing, rated by the techniques it needs – and how we check every board.',
    h1: 'What makes a logic puzzle fair? Unique solutions explained',
    lede: 'A fair logic puzzle has exactly one solution, and you can reach it by reasoning alone. That sounds obvious, but computer-made puzzles often fail one of the two. Here is what each condition means, why it matters, and how our generator checks both for every board.',
    sections: [
      `<h2 id="one">Condition 1: exactly one solution</h2>
<figure>${figFair()}<figcaption>Left: two rows obey every rule, so the puzzle has two answers. Right: one given square leaves a single way to finish.</figcaption></figure>
<p>If two answers fit, the solver eventually reaches a point where no reasoning can decide, and must pick. The end feels arbitrary, and a checker that compares against one stored answer may reject a perfectly valid solution. Uniqueness is the minimum standard.</p>
<p>We check it by brute force: a separate program, independent of the logic solver, searches all possible fillings of each board and must find exactly one.</p>`,
      `<h2 id="noguess">Condition 2: no guessing needed</h2>
<p>A puzzle can have exactly one solution and still require trial and error, if the only way to make progress is to try an option and follow its consequences far ahead. For a human that is tedious. Our standard: a solver using a fixed list of human techniques must finish the board. The techniques are local – the last open square, a line count, a single imagined placement checked against one line or region – and never a deep search.</p>`,
      `<h2 id="rating">Condition 3: an honest difficulty</h2>
<p>We rate a board by the hardest technique it needs, not by its size. The solver tries techniques from easy to hard; a board is Sprout if the easy tier finishes it, Bloom if it needs the middle tier, Grove if it needs the top tier. Every published board is also checked <i>not</i> to be solvable one tier lower.</p>
<div class="tablewrap"><table><caption>Checks every daily board passes (tested for 60 consecutive days per puzzle and level)</caption>
<thead><tr><th>Check</th><th>How</th><th>What happens on failure</th></tr></thead>
<tbody><tr><td>Exactly one solution</td><td>Independent exhaustive search</td><td>Board discarded</td></tr>
<tr><td>Solvable by logic</td><td>Human-technique solver at the board&rsquo;s level</td><td>Board discarded</td></tr>
<tr><td>Not easier than its label</td><td>Same solver, one level lower, must fail</td><td>Board discarded</td></tr>
<tr><td>Hints are correct</td><td>Every hint compared with the solution in automated tests</td><td>Release is stopped (automated tests fail)</td></tr></tbody></table></div>`,
      `<h2 id="pipeline">From date to board</h2>
<figure>${figPipeline()}<figcaption>The daily pipeline in the browser.</figcaption></figure>
<p>The date (in UTC), puzzle type and level form a seed. The generator proposes a layout, the solver and counter test it, and the first layout that passes is the day&rsquo;s board. Because the seed fixes every random choice, everybody gets the same board without a server.</p>`,
      `<h2 id="hints">Fair hints</h2>
<p>A fair puzzle deserves fair help. Our hints never just reveal a square: they state the next deduction and why it holds. If your board contains a mistake, the hint points at it first. In our automated tests, following only hints solves every tested board, and each hint&rsquo;s claim matches the solution.</p>`,
      `<h2 id="limits">Limits</h2>
<p>Fairness is not the same as fun. A board can be fair and dull. Our minimizing generator removes givens that are not needed, which tends to make boards elegant, but taste remains a matter of opinion. Tell us via <a href="/contact/">contact</a> when a board felt wrong.</p>`
    ],
    faq: [
      ['Does a unique solution mean no guessing?', 'No. A puzzle can be unique but require deep trial and error. We check both conditions separately.'],
      ['Who checks the puzzles?', 'Our code does, in your browser, every time a board is generated. Automated tests run the same checks on 60 consecutive days for every puzzle and level.'],
      ['Can a board be rated wrong?', 'The rating follows our technique list. Someone using a different method may find a board easier or harder, but it never needs anything beyond its tier.'],
      ['Why not use human-made puzzles?', 'Human setters make wonderful puzzles. A generator lets us offer fifteen fresh boards every day with guaranteed checks and no copying.'],
      ['What if I find two solutions?', 'Please tell us the date, puzzle and level. Our tests make it very unlikely, but we would correct it immediately.']
    ],
    sources: ['<a href="https://www.worldpuzzle.org/" rel="noopener">World Puzzle Federation</a> – the international body for puzzle championships', TATHAM, ABOUT]
  },
  {
    path: '/guides/logic-puzzles-for-beginners/', crumb: 'Beginners', kicker: 'Getting started',
    title: 'Logic Puzzles for Beginners: Where to Start',
    description: 'New to logic puzzles? Where to start, which puzzle type suits you, how the Sprout, Bloom and Grove levels build up, and five habits that help from day one.',
    h1: 'Logic puzzles for beginners: where to start',
    lede: 'Logic puzzles need no math and no trivia – only the willingness to say &ldquo;because&rdquo;. If you have never solved one, this page tells you which puzzle to try first, how our three levels build up, and what to do when you get stuck.',
    sections: [
      `<h2 id="what">What a logic puzzle is</h2>
<p>A logic puzzle gives you rules and a few clues. Every step follows from them – no knowledge, no luck. The pleasure is the moment a square becomes certain because of something you noticed. All five puzzles on this site have exactly one solution, so there is always a next certain step.</p>`,
      `<h2 id="which">Which puzzle to try first</h2>
<div class="tablewrap"><table><caption>Our five puzzles for a beginner</caption>
<thead><tr><th>Puzzle</th><th>You like…</th><th>First skill</th></tr></thead>
<tbody><tr><td><a href="/sun-and-shade/">Sun &amp; Shade</a></td><td>quick patterns</td><td>Spotting pairs</td></tr>
<tr><td><a href="/flower-beds/">Flower Beds</a></td><td>visual shapes</td><td>Finding the last free square</td></tr>
<tr><td><a href="/tents-and-trees/">Tents &amp; Trees</a></td><td>counting</td><td>Matching row numbers</td></tr>
<tr><td><a href="/garden-path/">Garden Path</a></td><td>drawing</td><td>Corners with two exits</td></tr>
<tr><td><a href="/who-planted-what/">Who Planted What</a></td><td>stories and words</td><td>Entering clues as ✕ and ●</td></tr></tbody></table></div>
<p>Sun &amp; Shade is the gentlest start for most people: the two rules fit on a sticky note, and the pair move gets you far.</p>`,
      `<h2 id="levels">How the levels build up</h2>
<figure>${figPath3()}<figcaption>Sprout, Bloom, Grove: each level adds one kind of reasoning.</figcaption></figure>
<p><b>Sprout</b> needs one rule at a time. <b>Bloom</b> asks you to combine two facts – a count and a position, a clue and a grid. <b>Grove</b> adds a short look ahead: imagine one placement and check one consequence. Stay at Sprout until you finish without hints a few days in a row; nothing is lost by staying.</p>`,
      `<h2 id="stuck">When you get stuck</h2>
<p>Being stuck is normal and means a fact is hiding in plain sight. Look at the smallest region, the fullest line, the clue you haven&rsquo;t used. Then press Why?: it shows one step and its reason, not the answer. Read it, find the pattern yourself, and apply it.</p>`,
      `<h2 id="habits">Five habits from day one</h2>
<ol><li>Mark what is impossible, not only what is certain.</li>
<li>Never place something &ldquo;to see&rdquo;. If you can&rsquo;t say why, don&rsquo;t.</li>
<li>After each move, check what it changed nearby.</li>
<li>Take breaks; fresh eyes find steps.</li>
<li>Play daily but briefly. The garden grows anyway, and missed days cost nothing.</li></ol>
<p>When you want more, the guides on <a href="/guides/star-battle-strategy/">Star Battle strategy</a> and <a href="/guides/solve-logic-grid-puzzles/">logic grids</a> go deeper.</p>`
    ],
    faq: [
      ['Do I need to be good at math?', 'No. You need to count to ten at most. Logic puzzles are about consequences, not calculations.'],
      ['How long does a Sprout puzzle take?', 'Usually a few minutes once you know the rules; the first one may take longer.'],
      ['Are hints cheating?', 'No. They explain a step, and our garden rewards every solved puzzle the same way.'],
      ['Can children play?', 'The Sprout levels suit older children with an adult. Please note the site shows advertising and is designed for adults.'],
      ['Do I need an account?', 'No. Your progress is kept in your browser.']
    ],
    sources: [TATHAM, '<a href="https://www.worldpuzzle.org/" rel="noopener">World Puzzle Federation</a>', ABOUT]
  },
  {
    path: '/guides/logic-puzzles-for-seniors/', crumb: 'Seniors', kicker: 'Comfortable play',
    title: 'Logic Puzzles for Seniors: Large Grids, Calm Pace',
    description: 'Logic puzzles for seniors: large, high-contrast boards, no timers or streaks, keyboard and print options, and tips for comfortable play on any screen.',
    h1: 'Logic puzzles for seniors: large grids, calm pace',
    lede: 'Daily puzzles should be a pleasure, not a test. This page describes how to make our boards comfortable to see and to tap, which puzzles suit a calm daily routine, and why nothing on this site punishes a slow day or a missed one.',
    sections: [
      `<h2 id="calm">A calm pace by design</h2>
<p>There is no countdown, no score that falls with time, and no streak to lose. The time only appears in the result after you finish, and it pauses when you switch away. Missed days never wilt your garden. Hints cost nothing.</p>
<p>We are careful about claims: puzzles are an enjoyable pastime, and we make no medical promises about memory or brain health.</p>`,
      `<h2 id="sizes">Board sizes at a glance</h2>
<figure>${figSizes([['Flower Beds', 36, 49, 64], ['Tents & Trees', 36, 49, 64], ['Sun & Shade', 36, 64, 100], ['Garden Path', 25, 36, 49]])}<figcaption>Squares per board at each level. Fewer squares mean larger squares on the same screen.</figcaption></figure>
<div class="tablewrap"><table><caption>Recommended starting points for comfortable play</caption>
<thead><tr><th>Puzzle</th><th>Level</th><th>Squares</th><th>Why</th></tr></thead>
<tbody><tr><td>Garden Path</td><td>Sprout</td><td>25</td><td>Largest squares; drawing is relaxing</td></tr>
<tr><td>Flower Beds</td><td>Sprout</td><td>36</td><td>Patterns and names, not only colors</td></tr>
<tr><td>Sun &amp; Shade</td><td>Sprout</td><td>36</td><td>Two clear shapes</td></tr>
<tr><td>Who Planted What</td><td>Sprout</td><td>3 small grids</td><td>Reading rather than spotting</td></tr></tbody></table></div>`,
      `<h2 id="seeing">Making the board easy to see</h2>
<ul><li><b>Zoom.</b> On a computer, press Ctrl and + (Cmd and + on a Mac) – the board grows with the page and never needs sideways scrolling.</li>
<li><b>Dark or light.</b> The site follows your device&rsquo;s light or dark setting automatically.</li>
<li><b>Tablet.</b> A tablet held upright gives much larger squares than a phone.</li>
<li><b>Contrast.</b> Text is designed to meet WCAG contrast guidance; symbols are shapes, not just colors.</li></ul>`,
      `<h2 id="hands">Easy on the hands</h2>
<p>Every puzzle can be played entirely with a keyboard: arrows to move, a letter to mark. On touch screens, a tap is enough – no long presses or fine drags (Garden Path also accepts taps instead of dragging). If a tap lands wrong, Undo takes it back.</p>`,
      `<h2 id="paper">Prefer paper?</h2>
<p>The <a href="/printable/">printable packs</a> print a week of boards, one per page, in black and white with large squares. Many people enjoy a printed sheet with the morning coffee.</p>`
    ],
    faq: [
      ['Is there a large-print option?', 'Use your browser zoom or the printable packs; both give larger boards without losing anything.'],
      ['Will I lose my progress if I close the page?', 'No. Every move is saved on your device automatically.'],
      ['Do I need to log in?', 'No. There are no accounts.'],
      ['Which puzzle is the most relaxing?', 'Many people find Garden Path at Sprout level the most relaxing, because it is mostly drawing.'],
      ['Can someone help me set it up?', 'Yes – nothing needs installing. Bookmark the home page; that is all.']
    ],
    sources: [WCAG, ABOUT]
  }
];
