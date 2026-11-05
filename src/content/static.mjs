// Home, hub, garden, about, contact, imprint, privacy and 404 – written for this site.
const RIS = 'https://www.ris.bka.gv.at/GeltendeFassung.wxe?Abfrage=Bundesnormen&amp;Gesetzesnummer=10007517';
const UPDATED = { 'Privacy policy': 'November 5, 2026', 'About Daily Logic Garden': 'November 4, 2026' }; // legal pages changed after first publication
const legal = (kicker, h1, inner) => `<article class="prose"><span class="kicker">${kicker}</span><h1>${h1}</h1>${inner}<p class="reviewed">Last updated: ${UPDATED[h1] || 'November 2, 2026'}</p></article>`;

const ICONS = {
  flowerbeds: '<svg viewBox="0 0 24 24" aria-hidden="true"><g fill="var(--plum)"><circle cx="12" cy="6.2" r="3.6"/><circle cx="17.5" cy="10.2" r="3.6"/><circle cx="15.4" cy="16.6" r="3.6"/><circle cx="8.6" cy="16.6" r="3.6"/><circle cx="6.5" cy="10.2" r="3.6"/></g><circle cx="12" cy="12" r="3.1" fill="var(--pollen)"/></svg>',
  tents: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3.5 2.8 20h18.4z" fill="var(--tent)"/><path d="M12 9.5 8.6 20h6.8z" fill="var(--paper)"/></svg>',
  sunshade: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="9" cy="10" r="5" fill="var(--sun)"/><path d="M11 18a7 7 0 0 1 12 0z" fill="var(--shade)"/></svg>',
  gardenpath: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 4h16v5H4v5h16v6" fill="none" stroke="var(--moss)" stroke-width="2.4" stroke-linejoin="round"/><circle cx="4" cy="4" r="2.6" fill="var(--pollen)"/></svg>',
  whoplanted: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="18" height="18" fill="none" stroke="var(--moss)" stroke-width="1.6"/><path d="M9 3v18M15 3v18M3 9h18M3 15h18" stroke="var(--line)" stroke-width="1.2"/><circle cx="6" cy="6" r="2" fill="var(--moss)"/><path d="M10.5 10.5l3 3M13.5 10.5l-3 3" stroke="var(--warn)" stroke-width="1.6"/></svg>'
};
const CARDS = [
  ['flowerbeds', 'Flower Beds', '/flower-beds/', 'One flower per row, column and bed; flowers never touch.'],
  ['tents', 'Tents & Trees', '/tents-and-trees/', 'Every tree gets its own tent; the numbers count the tents.'],
  ['sunshade', 'Sun & Shade', '/sun-and-shade/', 'No three alike in a row, as many suns as shades.'],
  ['gardenpath', 'Garden Path', '/garden-path/', 'One line through every square, stones in order.'],
  ['whoplanted', 'Who Planted What', '/who-planted-what/', 'A small logic grid: who planted which crop, where.']
];
const esc = (s) => s.replace(/&/g, '&amp;');

export function home() {
  const cards = CARDS.map(([t, n, h, d]) => `<div class="card" data-today="${t}">${ICONS[t]}<h3><a href="${h}">${esc(n)}</a></h3><p>${esc(d)}</p><div class="levels">${['sprout', 'bloom', 'grove'].map((l) => `<a href="${h}?level=${l}" data-level="${l}">${l[0].toUpperCase() + l.slice(1)}</a>`).join('')}</div></div>`).join('');
  return {
    title: 'Daily Logic Garden – Today’s Five Logic Puzzles',
    description: 'Five free daily logic puzzles: Flower Beds, Tents & Trees, Sun & Shade, Garden Path and Who Planted What. Unique solutions, explained hints, a growing garden.',
    html: `<section class="hero"><div><span class="kicker">Five puzzles · every day · free</span>
<h1>Daily Logic Garden – today&rsquo;s five logic puzzles</h1>
<p class="lede">Five calm placement and logic puzzles, three levels each, new every day at midnight UTC. Every board has exactly one solution you can reach without guessing – and when you get stuck, the hint tells you <i>why</i>, not just <i>where</i>.</p>
<p class="row"><a class="btn" href="/flower-beds/">Start with Flower Beds</a> <a class="btn ghost" href="/guides/logic-puzzles-for-beginners/">New to logic puzzles?</a></p></div>
<div class="garden-box"><div data-garden></div><div class="garden-meta" data-garden-meta></div></div></section>
<section data-today-box aria-labelledby="today-h"><h2 id="today-h">Today&rsquo;s garden</h2><p class="game-date" data-today-date></p><div class="today">${cards}</div></section>
<section class="vorteile" aria-labelledby="vt-h"><h2 id="vt-h">What you get</h2><ul><li><b>Five new puzzles every day</b><span>Flower Beds, Tents &amp; Trees, Sun &amp; Shade, Garden Path and Who Planted What – the same boards for everyone.</span></li><li><b>Fair by construction</b><span>Every board has exactly one solution and is solvable by logic alone.</span></li><li><b>Hints that teach</b><span>A hint explains the next logical step instead of revealing the answer.</span></li><li><b>Print and play</b><span>Printable boards for the kitchen table, the train or the classroom.</span></li><li><b>Your garden grows</b><span>Solved puzzles plant flowers in your garden – stored only on your device.</span></li><li><b>Free, no sign-up</b><span>No account, no timer pressure, works on any screen.</span></li></ul></section>
<section class="prose" style="max-width:72ch"><h2 id="what">What you will find here</h2>
<p>Daily Logic Garden collects five kinds of puzzles in which you place things on a grid by pure reasoning. <a href="/flower-beds/">Flower Beds</a> is a one-per-row-column-and-bed puzzle in the Star Battle family. <a href="/tents-and-trees/">Tents &amp; Trees</a> pairs tents with trees under row and column counts. <a href="/sun-and-shade/">Sun &amp; Shade</a> is a binary puzzle with two simple rules. <a href="/garden-path/">Garden Path</a> asks for one line through every square, past numbered stones. <a href="/who-planted-what/">Who Planted What</a> is a small logic grid with a handful of clues.</p>
<p>Each puzzle comes in three levels. <b>Sprout</b> needs only the basic rules, <b>Bloom</b> asks you to combine two facts, and <b>Grove</b> needs one of the advanced techniques explained in our guides. Levels are set by the reasoning a board requires, which our solver checks for every board.</p>
<h2 id="garden">A garden instead of a scoreboard</h2>
<p>Every solved puzzle plants something in your personal garden: a daisy for Flower Beds, a fir for Tents &amp; Trees, a sunflower, a fern, a tulip. Grove plants grow taller than Sprout plants, and the garden changes with the seasons. There are no streaks: a missed day never wilts anything, and hints never cost you a plant. The garden is stored only in your browser; you can export it as a file and import it on another device on the <a href="/garden/">My garden</a> page.</p>
<h2 id="fair">Fair by construction</h2>
<p>All boards are created by our own generator from the date, so everyone in the world gets the same puzzles without accounts or servers. Before a board appears, an independent search confirms that it has exactly one solution, and our logic solver confirms that it can be solved at its level without trial and error. How that works is explained in <a href="/guides/fair-logic-puzzles-unique-solutions/">What makes a logic puzzle fair?</a> and on the <a href="/about/">About</a> page.</p>
<h2 id="made">How today&rsquo;s boards are made</h2>
<p>When you open a puzzle, your browser combines today&rsquo;s UTC date, the puzzle and the level into a seed and runs the generator for that board. The generator starts from a hidden solution – flowers placed so that none touch, tents beside trees, a full grid of suns and shades, a path through every square, an assignment of gardeners to crops – and builds the visible puzzle around it: beds grown around the flowers, row and column counts, the givens that are left after removing as many as possible, numbered stones, or a short list of clues.</p>
<p>Then come three checks. A separate exhaustive search counts the solutions and stops at the second; only a board with exactly one is used. The logic solver, which knows only the techniques explained in our guides, must finish the board. And it must need the hardest technique of its level, while failing with the techniques of the level below – that is what makes a Bloom board a Bloom board. A board that fails any check is thrown away, and the generator tries again from the same seed, so the result is still the same on every device.</p>
<h2 id="levels">Board sizes by level</h2>
<p>Flower Beds and Tents &amp; Trees grow from 6 &times; 6 at Sprout to 7 &times; 7 at Bloom and 8 &times; 8 at Grove. Sun &amp; Shade uses 6 &times; 6, 8 &times; 8 and 10 &times; 10, because its rules need an even number of squares per line. Garden Path runs from 5 &times; 5 to 7 &times; 7 and adds a few hedges on Bloom and Grove. Who Planted What always has four gardeners; Sprout asks for crop and bed, Bloom and Grove add the day of the week.</p>
<h2 id="hints">When you get stuck</h2>
<p>Press <b>Why?</b> and the hint first checks your marks. If one of them contradicts the only solution, it points at that square and offers to clear it, so a mistake never sends you down a long wrong road. Otherwise it names the next deduction the solver would make, explains in a sentence why it holds, highlights the squares involved and lets you apply it. The number of hints is saved with the board, but hints never cost a plant. <b>Undo</b> takes back moves one at a time, and <b>Print</b> gives you the board on paper.</p>
<p>Your moves on each board are saved in this browser as you play, so you can close the page and come back later the same day. Nothing is sent to a server, and there is nothing to sign up for.</p>
<h2 id="more">More ways to play</h2>
<p>Missed a day? The <a href="/archive/">archive</a> holds the last 30 days. Prefer paper? The <a href="/printable/">printable packs</a> put a week of boards on separate pages. Want to get better? Start with the <a href="/guides/">guides</a>: rules in a minute, strategy from easy to expert, and tips for comfortable play on any screen.</p></section>`
  };
}

export function guidesHub(GUIDES, TOOLS) {
  return {
    title: 'Logic Puzzle Guides – Rules, Strategy and Techniques',
    description: 'All Daily Logic Garden guides: rules in a minute, Star Battle and Tents strategy, binary and logic grid techniques, fairness, beginners, comfortable play.',
    html: `<article class="prose"><span class="kicker">Guides</span><h1>Guides: rules, strategy and techniques</h1>
<p class="lede">Every guide is written around the puzzles on this site and the techniques our solver actually uses. Start with the rules, then follow the techniques in order; each guide links to the puzzle where you can practice.</p>
<div class="cards">${GUIDES.map((g) => `<a class="card" href="${g.path}"><span class="kicker">${g.kicker}</span><h3>${g.h1}</h3><p>${g.description}</p></a>`).join('')}</div>
<h2>The puzzles</h2><div class="cards">${TOOLS.map((t) => `<a class="card" href="${t.path}"><span class="kicker">${t.kicker}</span><h3>${t.crumb.replace(/&/g, '&amp;')}</h3><p>${t.description}</p></a>`).join('')}</div>
<p>Rules guides answer &ldquo;what am I allowed to do&rdquo;; strategy guides answer &ldquo;what should I look at next&rdquo;. The method page explains how we make sure every board is fair, and the two reader guides help beginners and anyone who prefers larger boards and a calm pace.</p></article>`
  };
}

export function gardenPage() {
  return {
    title: 'My Garden – Your Solved Puzzles at Daily Logic Garden',
    description: 'Your personal Daily Logic Garden: every solved puzzle plants something. Stored only in your browser, with export and import to move it between devices.',
    html: `<article class="prose" style="max-width:none"><span class="kicker">My garden</span><h1>My garden</h1>
<p class="lede">Every puzzle you solve plants something here. Nothing ever wilts, and the garden changes with the seasons.</p>
<div class="garden-box"><div data-garden></div><div class="garden-meta" data-garden-meta></div></div>
<section data-garden-tools style="max-width:72ch"><h2>Keep your garden</h2><p>Your garden is stored only in this browser. To move it to another device, export it as a small file and import it there; imports add plants and never remove any.</p>
<p class="row"><button type="button" class="btn small" data-export>Export garden</button> <label class="btn ghost small" for="garden-import">Import garden<input type="file" id="garden-import" accept="application/json,.json" data-import style="position:absolute;left:-9999px"></label></p><p class="status" data-import-msg role="status"></p>
<h2>What grows</h2><ul><li>Flower Beds: a daisy</li><li>Tents &amp; Trees: a fir</li><li>Sun &amp; Shade: a sunflower</li><li>Garden Path: a fern</li><li>Who Planted What: a tulip</li></ul><p>Sprout plants are small, Bloom plants medium and Grove plants tall. Clearing your browser&rsquo;s data for this site removes the garden, so export it first.</p></section></article>`
  };
}

export function notFound() {
  return {
    title: 'Page not found – Daily Logic Garden',
    description: 'This page does not exist. Go back to today’s five logic puzzles, the archive or the guides.',
    html: `<article class="prose"><h1>This path leads nowhere</h1><p class="lede">The page you are looking for does not exist or has moved.</p><p>Try <a href="/">today&rsquo;s puzzles</a>, the <a href="/archive/">archive</a> or the <a href="/guides/">guides</a>.</p></article>`
  };
}

export const STATIC = [
  {
    path: '/about/', crumb: 'About', kind: 'about', minWords: 800,
    title: 'About Daily Logic Garden – Method, Publisher and Limits',
    description: 'Who publishes Daily Logic Garden, how puzzles are generated and checked for one solution, how levels and hints work, how content is reviewed, and limits.',
    html: legal('About &amp; method', 'About Daily Logic Garden', `<p class="lede">Daily Logic Garden publishes five daily logic puzzles with three levels each, plus guides on rules and solving technique. It is free, needs no account, and keeps your progress on your own device.</p>
<h2 id="who">Who publishes the site</h2>
<p>The site is published by AdStern, an advertising agency in Vienna, Austria (details in the <a href="/imprint/">imprint</a>). It is financed by advertising on the puzzle, guide and overview pages; the imprint, privacy policy and contact page carry no advertising. No game publisher pays for mentions, and the guides contain no affiliate links. The site was rebuilt from scratch in November 2026; the previous version offered a small set of rotating nonogram boards, which are no longer published here.</p>
<h2 id="generator">How the puzzles are made</h2>
<p>Each board is generated in your browser; there is no puzzle server. The date in UTC, the puzzle type and the level are joined into a seed text (for example &ldquo;g1|tents|bloom|2026-11-04&rdquo;), hashed to a number and fed into a small deterministic random generator. The same date therefore produces the same board on every device, and no board is stored or copied from anywhere. Each puzzle builds its board in its own way:</p>
<ul><li><b>Flower Beds</b> (6 &times; 6, 7 &times; 7 or 8 &times; 8): the generator first places one hidden flower per row and column so that no two touch, then grows the beds outward from those flowers. If the beds allow a second solution, a square where that other solution would put a flower is handed to a neighboring bed – as long as every bed stays in one piece – and the count is repeated until only the hidden solution fits.</li>
<li><b>Tents &amp; Trees</b> (6, 7 or 8 squares wide): about one square in five gets a hidden tent with a tree beside it, tents never touching each other. The row and column numbers are counted from that layout; a layout that does not meet the checks below is discarded and a new one is drawn.</li>
<li><b>Sun &amp; Shade</b> (6, 8 or 10 squares wide): a complete valid grid is drawn first. Then the generator tries to remove every given symbol in random order and keeps a removal only if the board can still be solved with the techniques of its level.</li>
<li><b>Garden Path</b> (5, 6 or 7 squares wide): a random path through every square is made by repeatedly bending a simple zigzag. Numbered stones are placed on it, more are added in the longest stretch without a stone until the logic solver can finish, and stones that turn out not to be needed are removed again. On Bloom and Grove boards some hedges block passages the path does not use.</li>
<li><b>Who Planted What</b> (four gardeners): a hidden assignment of gardeners to crops and beds – and on Bloom and Grove also to days – is drawn. Clues that are true for that assignment are added until the solver can finish the grid; then every clue that is not needed is removed.</li></ul>
<p>If an attempt fails any check, the generator moves on to the next attempt from the same seed. For the combinations that need the most attempts, the build stores the generator state of the successful attempt for the first 150 days after launch, so your browser can start there; it still runs every check below before the board is shown.</p>
<h2 id="checks">How every board is checked</h2>
<ul><li><b>Exactly one solution.</b> An exhaustive search, written separately from the logic solver, counts the solutions and stops at the second one; the board is used only if it finds exactly one. (For Sun &amp; Shade the browser uses a faster exhaustive search with line propagation; the automated tests additionally run the plain row-by-row search.)</li>
<li><b>No guessing.</b> A solver that only uses a fixed list of human techniques, ordered from simple to advanced, must finish the board.</li>
<li><b>Honest level.</b> The hardest technique the solver needs must belong to the board&rsquo;s level, and the solver must fail when it is limited to the techniques of the level below.</li></ul>
<p>The automated tests generate the boards for 60 consecutive days for every puzzle and level and repeat these checks with a separate count. They also follow only the Why? hints from an empty board for 20 days per level and check that this solves the board and that every hint agrees with the solution, and they test hints from random partly filled and wrong boards: a wrong mark must be reported before any new step. The technique lists are described in the guides, for example <a href="/guides/star-battle-strategy/">Star Battle strategy</a>.</p>
<h2 id="content">How the guides are written and checked</h2>
<p>Guides are written for this site with the help of AI tools and describe the techniques our solver actually uses. Before a guide is published, a separate review pass checks its statements against the solver code, the generator output and the sources it names; anything that cannot be confirmed is corrected or removed. That review consists of independent AI review passes and automated tests – there is no team of human editors behind the site. AdStern, the publisher, decides what is published and is responsible for it.</p>
<p>Numbers about our puzzles (board sizes, average steps, how often a technique was needed) come from running our generator on the 60 daily seeds from November 2 to December 31, 2026. Mathematical counts, such as the 34 valid rows of eight in a binary puzzle, were computed by our own code. Example boards in the figures are produced by the real generator when the site is built. Each page shows its review date; it changes when a page is checked again or corrected.</p>
<h2 id="limits">Limits</h2>
<p>The difficulty levels reflect our solver&rsquo;s technique order; a human may find another route. The daily switch depends on your device clock. Progress stored in the browser is lost if you clear site data, unless you exported it. We describe genres by their common names only so people can find the rules; we are not affiliated with any other puzzle publisher or game.</p>
<h2 id="corrections">Corrections</h2>
<p>Confirmed errors in puzzles, hints or guides are fixed and listed here with their date. No corrections have been necessary since the launch on November 2, 2026.</p>
<h2 id="privacy">Your data</h2>
<p>Puzzle progress and your garden stay in your browser&rsquo;s local storage. Details on advertising and analytics are in the <a href="/privacy/">privacy policy</a>.</p>`)
  },
  {
    path: '/contact/', crumb: 'Contact', kind: 'legal',
    title: 'Contact Daily Logic Garden – Corrections and Questions',
    description: 'How to reach the publisher of Daily Logic Garden, how to report a puzzle problem or a correction, and what kind of requests we cannot help with.',
    html: legal('Contact', 'Contact', `<p class="lede">Daily Logic Garden is published by AdStern in Vienna, Austria. You can write to <a href="mailto:office@adstern.com">office@adstern.com</a>; the postal address is in the <a href="/imprint/">imprint</a>.</p>
<h2 id="puzzles">Reporting a puzzle problem</h2>
<p>If a board seems to have two solutions, a hint seems wrong, or something does not work on your device, please tell us the puzzle, the level and the date shown above the board, and if possible what you saw. Confirmed problems are fixed and noted on the about page.</p>
<h2 id="ideas">Ideas and feedback</h2>
<p>We read every message about the puzzles. Suggestions for clearer hint wording, accessibility problems – for example a pattern that is hard to tell apart on your screen – and ideas for the guides are especially welcome. Please understand that we cannot answer every message individually, and that we do not publish user-submitted puzzles.</p>
<h2 id="press">Schools and clubs</h2>
<p>Teachers and puzzle clubs may print our sheets for their groups free of charge; please keep the footer line on each page. If you plan a larger event and want to use our boards, a short note in advance is appreciated.</p>
<h2 id="scope">What we cannot do</h2>
<p>We cannot restore a garden that was deleted with your browser data, because we never receive it. We do not accept sponsored posts or paid links.</p>
<p>How we handle data is described in the <a href="/privacy/">privacy policy</a>.</p>`)
  },
  {
    path: '/imprint/', crumb: 'Imprint', kind: 'legal',
    title: 'Imprint – Daily Logic Garden (Legal Notice, AdStern)',
    description: 'Legal notice for dailylogicgarden.com under the Austrian E-Commerce Act and Media Act: publisher, contact, business details, trade authority and chamber.',
    html: legal('Legal notice', 'Imprint', `<p>Information according to § 5 of the Austrian E-Commerce Act (ECG) and disclosure according to § 25 of the Austrian Media Act (MedienG).</p>
<h2 id="owner">Media owner and publisher</h2>
<p>AdStern<br>Seilerstätte 8<br>1010 Vienna<br>Austria</p>
<p>Email: <a href="mailto:office@adstern.com">office@adstern.com</a></p>
<h2 id="business">Business details</h2>
<ul><li>Business activity: advertising agency</li>
<li>VAT ID: ATU54682507</li>
<li>Competent trade authority: Magistratisches Bezirksamt für den 1./8. Bezirk, Vienna</li>
<li>Member of the Vienna Economic Chamber (WKO Wien), Fachgruppe Werbung und Marktkommunikation</li>
<li>Applicable trade law: Gewerbeordnung 1994, available in the <a href="${RIS}" rel="noopener">Austrian legal information system (RIS)</a></li></ul>
<h2 id="line">Editorial line (§ 25 MedienG)</h2>
<p>Daily Logic Garden publishes free daily logic puzzles and guides on how to solve them, for entertainment and practice.</p>
<h2 id="links">Links to other websites</h2>
<p>We checked linked pages when we added or reviewed them. Their content is the responsibility of their operators.</p>`)
  },
  {
    path: '/privacy/', crumb: 'Privacy', kind: 'legal', minWords: 600,
    title: 'Privacy Policy – Daily Logic Garden (Ads, Consent, Data)',
    description: 'How dailylogicgarden.com processes data: GitHub Pages hosting, Google AdSense with consent, Analytics after consent, progress kept in your browser, your rights.',
    html: legal('Privacy', 'Privacy policy', `<p>This policy explains what data is processed when you visit dailylogicgarden.com, why, on which legal basis, and which rights you have.</p>
<h2 id="controller">Controller</h2>
<p>AdStern, Seilerstätte 8, 1010 Vienna, Austria, <a href="mailto:office@adstern.com">office@adstern.com</a>. More details are in the <a href="/imprint/">imprint</a>.</p>
<h2 id="hosting">Hosting on GitHub Pages</h2>
<p>The site is a collection of static files served by GitHub Pages, a service of GitHub, Inc., 88 Colin P. Kelly Jr. Street, San Francisco, CA 94107, USA. To deliver a page, GitHub necessarily receives technical data from your browser, such as your IP address, the requested address, date and time, browser type and the referring page, and may store it in server logs for a limited time for security purposes. Legal basis: our legitimate interest in delivering a secure website (Art. 6(1)(f) GDPR). Data transfers to the USA are based on the EU–U.S. Data Privacy Framework or standard contractual clauses. See the <a href="https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement" rel="noopener">GitHub General Privacy Statement</a>.</p>
<h2 id="local">Puzzle progress in your browser</h2>
<p>Your moves, hint counts, times, chosen level, preferences and your garden are saved in your browser&rsquo;s local storage on your device so you can continue later. This data never leaves your device and is not sent to us or anyone else. You can delete it by clearing this site&rsquo;s data in your browser; the export file on the &ldquo;My garden&rdquo; page is created on your device only. Storing this data is necessary to provide the puzzle function you request (§ 165(3) Austrian Telecommunications Act 2021).</p>
<h2 id="ads">Advertising by Google AdSense</h2>
<p>Puzzle, guide and overview pages (the home page, the guide overview, the puzzle archive, the printable packs page and About) can show ads; Google places them automatically, so their number and position can vary. The imprint, this privacy policy, the contact page and your personal garden page load no advertising. The ads are delivered by Google AdSense, provided by Google Ireland Limited, Gordon House, Barrow Street, Dublin 4, Ireland (and, for users outside the EEA, the UK and Switzerland, Google LLC, 1600 Amphitheatre Parkway, Mountain View, CA 94043, USA). AdSense uses cookies and similar technologies to show ads, limit how often you see an ad, measure performance and prevent fraud.</p>
<p><b>Third party vendors, including Google, use cookies to serve ads based on a user's prior visits to this website or other websites.</b> Google's use of advertising cookies enables it and its partners to serve ads to users based on their visit to this site and/or other sites on the Internet.</p>
<p>You can opt out of personalized advertising in <a href="https://adssettings.google.com" rel="noopener">Google&rsquo;s Ads Settings</a>, at <a href="https://www.aboutads.info/choices/" rel="noopener">www.aboutads.info</a> or, in Europe, at <a href="https://www.youronlinechoices.eu/" rel="noopener">www.youronlinechoices.eu</a>. How Google uses information from sites that use its services is described at <a href="https://policies.google.com/technologies/partner-sites" rel="noopener">policies.google.com/technologies/partner-sites</a>.</p>
<h2 id="consent">Consent</h2>
<p>Visitors from the European Economic Area, the United Kingdom and Switzerland see a consent message from Google&rsquo;s certified consent management platform, which follows the IAB Transparency &amp; Consent Framework (TCF). Until you decide, and if you decline, Google Consent Mode is set to &ldquo;denied&rdquo; for advertising and analytics storage. Personalized ads need your consent. Non-personalized ads also use cookies or identifiers for frequency capping, reporting and fraud prevention and therefore also need consent to store and access information on your device. Without that consent Google can only show limited ads. Limited ads do not use cookies or local storage for personalised advertising; Google may still use them for fraud prevention and frequency limits as described in its documentation, and it processes technical data such as your IP address to deliver the ads. Legal basis: your consent (Art. 6(1)(a) GDPR, § 165(3) TKG 2021). Google&rsquo;s consent platform stores your decision on your device (for example as a cookie holding the TCF consent string) so that the message does not reappear on every page. You can change or withdraw your choice at any time via &ldquo;Privacy settings&rdquo; in the footer of every page that shows ads; on pages without ads (such as this one) the button opens our statistics window instead (see <a href="#statistics-window">Interim statistics window</a>). If a U.S. state privacy law applies to your visit, the button opens Google&rsquo;s U.S. opt-out dialog instead, where you can opt out of the sale or sharing of personal information and of targeted advertising; after an opt-out, ad personalization and Google Analytics stay off.</p>
<h2 id="statistics-window">Interim statistics window</h2>
<p>At the moment Google&rsquo;s consent message is set up on this site but is not displayed. So that visits are still only counted with your consent, we show our own small window while this is the case. It appears about three seconds after a page with ads has loaded if Google&rsquo;s consent management has not reported a decision by then, is not displaying its own message and does not report that the GDPR does not apply to your visit. The window asks only about visitor statistics with Google Analytics (Google Ireland Limited); it is not a consent to advertising and never switches on advertising storage, ad user data or ad personalization &ndash; these stay &ldquo;denied&rdquo;. &ldquo;Allow&rdquo; and &ldquo;Decline&rdquo; are equal choices. Closing the window with &ldquo;&times;&rdquo; or Escape, or not choosing, stores nothing and is not consent: Google Analytics stays off and we ask again on the next page with ads.</p>
<p>What is stored: your choice is saved in your browser&rsquo;s local storage under the key <code>dlg-stats</code>, with a version number, the choice (&ldquo;granted&rdquo; or &ldquo;denied&rdquo;) and the time of your choice. It is not sent to us or to Google, and it is not part of the garden export on the &ldquo;My garden&rdquo; page; an import does not change it. After 12 months, or if we change the window, we ask again. If you allow, Google Analytics loads as described in the next section with only analytics storage granted; it sets cookies on your device (<code>_ga</code>, <code>_ga_&hellip;</code>), and data may be transferred to the USA. If you decline or later withdraw, measurement stops at once, Google Analytics is switched off for this site and the Google Analytics cookies (<code>_ga</code>, <code>_ga_&hellip;</code>) set for this domain are deleted. Legal basis: your consent (Art. 6(1)(a) GDPR; for storing and reading information on your device &sect; 165(3) Austrian Telecommunications Act 2021, TKG 2021).</p>
<p>Google&rsquo;s consent management has priority: as soon as Google&rsquo;s consent message is displayed, reports a decision or reports that the GDPR does not apply, only Google&rsquo;s logic counts (also later during a visit); our window closes and is no longer shown, and a choice stored in it is deleted once Google reports a decision or that the GDPR does not apply. Whenever Google&rsquo;s consent management refuses statistics, the Google Analytics cookies are deleted, even if you never used our window. If your browser sends a Global Privacy Control signal, Google Analytics stays off and the window is not shown. You can review, change or withdraw your choice at any time via <button type="button" class="linklike" data-privacy-settings>Privacy settings</button> at the bottom of every page, including this one. Pages without ads (the imprint, this privacy policy, the contact page, your garden page and the error page) load no Google code at all; there the button opens our window so a choice made in it can be changed or withdrawn.</p>
<p>For visitors in the U.S.: the window does not replace the U.S. opt-out. If Google&rsquo;s consent management or the Global Privacy Control signal of your browser reports that you have opted out under a U.S. state privacy law, Google Analytics stays off and the window does not switch it on; where Google reports that the GDPR does not apply to your visit, the rules in the next section apply and the window is not shown.</p>
<h2 id="analytics">Google Analytics 4</h2>
<p>We use Google Analytics 4 (Google Ireland Limited / Google LLC, measurement ID G-T00HRG2YVF) to understand which puzzles and guides are used. Before any Google script runs, analytics is disabled. While Google&rsquo;s consent message is not displayed, Google Analytics can also be allowed in our <a href="#statistics-window">interim statistics window</a>. In the EEA, the UK and Switzerland, Google Analytics is only loaded after you have consented in the consent message to storing and accessing information on a device (TCF purpose 1), to Google as a vendor and to analytics storage. Elsewhere it loads only if the consent message reports analytics as granted or not requiring consent, and reports that you have not opted out under a U.S. state privacy law; missing or unclear signals keep it off. When you withdraw consent via &ldquo;Privacy settings&rdquo;, analytics is switched off immediately. If your browser sends a Global Privacy Control signal, Google Analytics stays off. Google signals and ad personalization signals are disabled. Google Analytics 4 does not log or store IP addresses. Data is kept for the retention period set in our Google Analytics property. Legal basis: your consent (Art. 6(1)(a) GDPR). Transfers to Google LLC in the USA rely on the EU–U.S. Data Privacy Framework.</p>
<h2 id="fonts">Fonts and other resources</h2>
<p>The fonts Fraunces and Atkinson Hyperlegible are served from this website. Apart from the Google advertising and analytics scripts described above, no scripts, fonts or styles are loaded from other servers.</p>
<h2 id="email">Email</h2>
<p>If you write to us, we use your address and message only to answer and delete them when they are no longer needed, unless legal retention periods apply (Art. 6(1)(b) and (f) GDPR).</p>
<h2 id="rights">Your rights</h2>
<p>You have the right of access (Art. 15 GDPR), rectification (Art. 16), erasure (Art. 17), restriction (Art. 18), data portability (Art. 20) and objection (Art. 21). You can withdraw consent at any time with effect for the future. As we do not store personal data about visitors ourselves, most requests concern Google, whose controls are available at <a href="https://myaccount.google.com/data-and-privacy" rel="noopener">myaccount.google.com</a>.</p>
<p>You have the right to lodge a complaint with a supervisory authority. In Austria this is the Datenschutzbehörde, Barichgasse 40–42, 1030 Vienna, <a href="mailto:dsb@dsb.gv.at">dsb@dsb.gv.at</a>, <a href="https://www.dsb.gv.at/" rel="noopener">www.dsb.gv.at</a>; you can also contact the authority in your country of residence.</p>
<h2 id="us">Notice for U.S. residents</h2>
<p>Under some U.S. state privacy laws, such as the California Consumer Privacy Act as amended by the CPRA, the use of advertising cookies for cross-context behavioral advertising can count as &ldquo;selling&rdquo; or &ldquo;sharing&rdquo; personal information. Where these laws apply, Google&rsquo;s consent message offers an opt-out, which you can reopen via &ldquo;Privacy settings&rdquo;. We do not sell personal information in any other way and do not knowingly collect personal information from children under 16.</p>
<h2 id="changes">Changes</h2>
<p>We update this policy when the services used on this site change. The date below shows the current version.</p>`)
  }
];
