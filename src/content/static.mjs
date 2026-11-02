// Home, hub, garden, about, contact, imprint, privacy and 404 – written for this site.
const RIS = 'https://www.ris.bka.gv.at/GeltendeFassung.wxe?Abfrage=Bundesnormen&amp;Gesetzesnummer=10007517';
const legal = (kicker, h1, inner) => `<article class="prose"><span class="kicker">${kicker}</span><h1>${h1}</h1>${inner}<p class="reviewed">Last updated: November 2, 2026</p></article>`;

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
<section class="prose" style="max-width:72ch"><h2 id="what">What you will find here</h2>
<p>Daily Logic Garden collects five kinds of puzzles in which you place things on a grid by pure reasoning. <a href="/flower-beds/">Flower Beds</a> is a one-per-row-column-and-bed puzzle in the Star Battle family. <a href="/tents-and-trees/">Tents &amp; Trees</a> pairs tents with trees under row and column counts. <a href="/sun-and-shade/">Sun &amp; Shade</a> is a binary puzzle with two simple rules. <a href="/garden-path/">Garden Path</a> asks for one line through every square, past numbered stones. <a href="/who-planted-what/">Who Planted What</a> is a small logic grid with a handful of clues.</p>
<p>Each puzzle comes in three levels. <b>Sprout</b> needs only the basic rules, <b>Bloom</b> asks you to combine two facts, and <b>Grove</b> needs one of the advanced techniques explained in our guides. Levels are set by the reasoning a board requires, which our solver checks for every board.</p>
<h2 id="garden">A garden instead of a scoreboard</h2>
<p>Every solved puzzle plants something in your personal garden: a daisy for Flower Beds, a fir for Tents &amp; Trees, a sunflower, a fern, a tulip. Grove plants grow taller than Sprout plants, and the garden changes with the seasons. There are no streaks: a missed day never wilts anything, and hints never cost you a plant. The garden is stored only in your browser; you can export it as a file and import it on another device on the <a href="/garden/">My garden</a> page.</p>
<h2 id="fair">Fair by construction</h2>
<p>All boards are created by our own generator from the date, so everyone in the world gets the same puzzles without accounts or servers. Before a board appears, an independent search confirms that it has exactly one solution, and our logic solver confirms that it can be solved at its level without trial and error. How that works is explained in <a href="/guides/fair-logic-puzzles-unique-solutions/">What makes a logic puzzle fair?</a> and on the <a href="/about/">About</a> page.</p>
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
    path: '/about/', crumb: 'About', kind: 'about', minWords: 500,
    title: 'About Daily Logic Garden – Method, Publisher and Limits',
    description: 'Who publishes Daily Logic Garden, how puzzles are generated and checked for one solution, how levels and hints work, how content is reviewed, and limits.',
    html: legal('About &amp; method', 'About Daily Logic Garden', `<p class="lede">Daily Logic Garden publishes five daily logic puzzles with three levels each, plus guides on rules and solving technique. It is free, needs no account, and keeps your progress on your own device.</p>
<h2 id="who">Who publishes the site</h2>
<p>The site is published by AdStern, an advertising agency in Vienna, Austria (details in the <a href="/imprint/">imprint</a>). It is financed by advertising on puzzle and guide pages. No game publisher pays for mentions, and the guides contain no affiliate links. The site was rebuilt from scratch in November 2026; the previous version offered a small set of rotating nonogram boards, which are no longer published here.</p>
<h2 id="generator">How the puzzles are made</h2>
<p>Each board is generated in your browser. The date in UTC, the puzzle type and the level form a seed for a deterministic random generator, so every device produces the same board on the same day. The generator proposes a layout – flower beds grown around a hidden solution, trees beside hidden tents, a full sun-and-shade grid, a random path through every square, a random assignment of gardeners – and then removes information (givens, stones, clues) as long as the puzzle stays solvable at its level.</p>
<h2 id="checks">How every board is checked</h2>
<ul><li><b>Exactly one solution.</b> An exhaustive search, written separately from the logic solver, must find exactly one solution. (For 10 × 10 Sun &amp; Shade boards the browser uses a faster exhaustive search with line propagation; the automated tests additionally run the plain row-by-row search.)</li>
<li><b>No guessing.</b> A solver that only uses a fixed list of human techniques must finish the board.</li>
<li><b>Honest level.</b> The solver must need its level&rsquo;s technique, and must fail with the techniques of the level below.</li></ul>
<p>Automated tests run these checks for 60 consecutive days for every puzzle and level, and they verify that following only the hints solves the board and that every hint agrees with the solution. The technique lists are described in the guides, for example <a href="/guides/star-battle-strategy/">Star Battle strategy</a>.</p>
<h2 id="content">How the guides are written and checked</h2>
<p>Guides are written for this site. Numbers about our puzzles (board sizes, average steps, how often a technique was needed) come from running our generator on the 60 daily seeds from November 2 to December 31, 2026. Mathematical counts, such as the 34 valid rows of eight in a binary puzzle, were computed by our own code. Example boards in the figures are produced by the real generator when the site is built. Each page shows its review date; it changes when a page is checked again or corrected.</p>
<h2 id="limits">Limits</h2>
<p>The difficulty levels reflect our solver&rsquo;s technique order; a human may find another route. The daily switch depends on your device clock. Progress stored in the browser is lost if you clear site data, unless you exported it. We describe genres by their common names only so people can find the rules; we are not affiliated with any other puzzle publisher or game.</p>
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
<p>Puzzle and guide pages show ads delivered by Google AdSense, provided by Google Ireland Limited, Gordon House, Barrow Street, Dublin 4, Ireland (and, for users outside the EEA, the UK and Switzerland, Google LLC, 1600 Amphitheatre Parkway, Mountain View, CA 94043, USA). AdSense uses cookies and similar technologies to show ads, limit how often you see an ad, measure performance and prevent fraud.</p>
<p><b>Third party vendors, including Google, use cookies to serve ads based on a user's prior visits to this website or other websites.</b> Google's use of advertising cookies enables it and its partners to serve ads to users based on their visit to this site and/or other sites on the Internet.</p>
<p>You can opt out of personalized advertising in <a href="https://adssettings.google.com" rel="noopener">Google&rsquo;s Ads Settings</a>, at <a href="https://www.aboutads.info/choices/" rel="noopener">www.aboutads.info</a> or, in Europe, at <a href="https://www.youronlinechoices.eu/" rel="noopener">www.youronlinechoices.eu</a>. How Google uses information from sites that use its services is described at <a href="https://policies.google.com/technologies/partner-sites" rel="noopener">policies.google.com/technologies/partner-sites</a>.</p>
<h2 id="consent">Consent</h2>
<p>Visitors from the European Economic Area, the United Kingdom and Switzerland see a consent message from Google&rsquo;s certified consent management platform, which follows the IAB Transparency &amp; Consent Framework (TCF). Until you decide, and if you decline, Google Consent Mode is set to &ldquo;denied&rdquo; for advertising and analytics storage. Personalized ads need your consent. Non-personalized ads also use cookies or identifiers for frequency capping, reporting and fraud prevention and therefore also need consent to store and access information on your device. Without that consent Google can only show limited ads, which do not use cookies or local storage for advertising and are not personalized; Google still processes technical data such as your IP address to deliver them and to prevent fraud. Legal basis: your consent (Art. 6(1)(a) GDPR, § 165(3) TKG 2021). You can change or withdraw your choice at any time via <button type="button" class="linklike" data-privacy-settings>Privacy settings</button>, which also appears in the footer of every page.</p>
<h2 id="analytics">Google Analytics 4</h2>
<p>We use Google Analytics 4 (Google Ireland Limited / Google LLC, measurement ID G-T00HRG2YVF) to understand which puzzles and guides are used. Before any Google script runs, analytics is disabled. In the EEA, the UK and Switzerland, Google Analytics is only loaded after you have consented in the consent message to storing and accessing information on a device (TCF purpose 1), to Google as a vendor and to analytics storage. Elsewhere it loads only if the consent message reports analytics as granted or not requiring consent, and reports that you have not opted out under a U.S. state privacy law; missing or unclear signals keep it off. When you withdraw consent via &ldquo;Privacy settings&rdquo;, analytics is switched off immediately. Google Analytics 4 does not log or store IP addresses. Data is kept for the retention period set in our account, at most 14 months. Legal basis: your consent (Art. 6(1)(a) GDPR). Transfers to Google LLC in the USA rely on the EU–U.S. Data Privacy Framework.</p>
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
