// Daily Logic Garden – static site generator. Writes docs/ from src/. No dependencies.
import { readFileSync, writeFileSync, mkdirSync, rmSync, existsSync, readdirSync, copyFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { TOOLS } from './content/tools.mjs';
import { GUIDES } from './content/guides.mjs';
import { EXTRA } from './content/extras.mjs';
import { prestates } from './precompute.mjs';
import { home, STATIC, guidesHub, gardenPage, notFound } from './content/static.mjs';

const ROOT = dirname(dirname(fileURLToPath(import.meta.url)));
const OUT = join(ROOT, 'docs');
const SITE = 'https://dailylogicgarden.com';
const REVIEWED = '2026-11-02';
const REVIEWED_TEXT = 'November 2, 2026';
const PUB = 'ca-pub-7811071715414905';
const GA = 'G-T00HRG2YVF';
const V = '20261105a';
// Pages whose content changed on 2026-11-04 (home and About texts) and 2026-11-05 (privacy: interim statistics window): sitemap lastmod.
const CHANGED_0411 = ['/', '/about/'];
const CHANGED_0511 = ['/privacy/'];

export const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const strip = (h) => h.replace(/<svg[\s\S]*?<\/svg>/g, ' ').replace(/<script[\s\S]*?<\/script>/g, ' ').replace(/<[^>]+>/g, ' ').replace(/&[a-z#0-9]+;/gi, ' ');
export const words = (h) => strip(h).split(/\s+/).filter((w) => /[A-Za-z0-9]/.test(w)).length;

// ---------- scripts ----------
function minify(js) {
  return js.split('\n').map((l) => l.replace(/^\s+/, '')).filter((l) => l && !l.startsWith('//') && !l.startsWith('* ') && l !== '*/' && !l.startsWith('/*')).join('\n');
}
const PRE = prestates();
if (PRE.added) console.log('precomputed ' + PRE.added + ' generator states');
const ENGINE_PARTS = ['core', 'flowerbeds', 'tents', 'sunshade', 'gardenpath', 'whoplanted', 'draw', 'saves', 'play']
  .map((f) => minify(readFileSync(join(ROOT, 'src/js', f + '.js'), 'utf8')));
ENGINE_PARTS.splice(1, 0, 'DLG.core.setPre(' + JSON.stringify(PRE.data) + ');');
const ENGINE = ENGINE_PARTS.join('\n');
const CONSENT_DEFAULTS = `<script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('consent','default',{ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied',analytics_storage:'denied',wait_for_update:500});gtag('set','ads_data_redaction',true);gtag('set','url_passthrough',false);window['ga-disable-${GA}']=true;</script>`;
// First script in <head>: local preview/test (localhost, 127.0.0.1, ::1, file:) or ?stats_test=1 (kept for the
// tab in sessionStorage) sets window.DLG_NO_GOOGLE – then no Google script (AdSense, its CMP, GA) is inserted.
const GUARD = `<script>window.DLG_NO_GOOGLE=(function(l){var h=l.hostname,q=/[?&]stats_test=1(&|$)/.test(l.search),t=q;try{if(q)sessionStorage.setItem('dlg-stats-test','1');t=q||sessionStorage.getItem('dlg-stats-test')==='1';}catch(e){}return t||l.protocol==='file:'||h==='localhost'||h==='127.0.0.1'||h==='::1'||h==='[::1]';})(location);</script>`;
// AdSense loader where the static tag was (right after the consent defaults): async, crossorigin="anonymous".
const ADS_SRC = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${PUB}`;
const ADSENSE = `<script data-ads-loader>if(!window.DLG_NO_GOOGLE){(function(){var s=document.createElement('script');s.async=true;s.src='${ADS_SRC}';s.crossOrigin='anonymous';document.head.appendChild(s);})();}</script>`;

const LOGO = `<svg viewBox="0 0 40 40" aria-hidden="true"><circle cx="20" cy="20" r="19" fill="#1A1A1A"/><path d="M20 31V17" stroke="#F1F4EC" stroke-width="2.4" stroke-linecap="round"/><path d="M20 22c-6 0-9-4-9-9 6 0 9 4 9 9zM20 19c0-6 4-9 9-9 0 6-4 9-9 9z" fill="#E3B23C"/><path d="M11 31h18" stroke="#F1F4EC" stroke-width="2" stroke-linecap="round"/></svg>`;
const NAV = [['Today', '/'], ['Flower Beds', '/flower-beds/'], ['Tents & Trees', '/tents-and-trees/'], ['Sun & Shade', '/sun-and-shade/'], ['Garden Path', '/garden-path/'], ['Who Planted What', '/who-planted-what/'], ['Guides', '/guides/'], ['Archive', '/archive/'], ['My garden', '/garden/']];

function header(path) {
  return `<a class="skip" href="#main">Skip to content</a><header class="site"><div class="wrap"><a class="brand" href="/">${LOGO}<span>Daily Logic Garden</span></a><nav class="main" aria-label="Main">${NAV.map(([t, h]) => `<a href="${h}"${h === path ? ' aria-current="page"' : ''}>${t}</a>`).join('')}</nav></div></header>`;
}
function footer() {
  return `<footer class="site"><div class="wrap"><div class="cols">
<div><h2>Play</h2><ul><li><a href="/flower-beds/">Flower Beds</a></li><li><a href="/tents-and-trees/">Tents &amp; Trees</a></li><li><a href="/sun-and-shade/">Sun &amp; Shade</a></li><li><a href="/garden-path/">Garden Path</a></li><li><a href="/who-planted-what/">Who Planted What</a></li></ul></div>
<div><h2>More</h2><ul><li><a href="/archive/">Archive</a></li><li><a href="/printable/">Printable packs</a></li><li><a href="/guides/">Guides</a></li><li><a href="/garden/">My garden</a></li></ul></div>
<div><h2>About</h2><ul><li><a href="/about/">About &amp; method</a></li><li><a href="/contact/">Contact</a></li><li><a href="/imprint/">Imprint</a></li><li><a href="/privacy/">Privacy policy</a></li><li><button type="button" class="linklike" data-privacy-settings>Privacy settings</button></li></ul></div>
</div><p class="fine">Daily Logic Garden is published by AdStern, Vienna. Every puzzle is made by our own generator and checked for exactly one solution. Your progress stays in your browser.</p></div></footer>`;
}
function crumbs(list) {
  return `<nav class="crumbs" aria-label="Breadcrumb"><ol>${list.map(([t, h], i) => `<li>${i === list.length - 1 ? `<span aria-current="page">${esc(t)}</span>` : `<a href="${h}">${esc(t)}</a>`}</li>`).join('')}</ol></nav>`;
}
function ld(obj) { return `<script type="application/ld+json">${JSON.stringify(obj)}</script>`; }
function breadcrumbLd(list) {
  return { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: list.map(([t, h], i) => ({ '@type': 'ListItem', position: i + 1, name: t, item: SITE + h })) };
}
function faqLd(faq) {
  return { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: faq.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: strip(a).replace(/\s+/g, ' ').trim() } })) };
}
const PUBLISHER = { '@type': 'Organization', name: 'AdStern', url: SITE + '/about/' };
function adBox(slot) { return `<div class="ad" data-slot="${slot}" hidden><span class="ad-label">Advertisement</span></div>`; }

function page({ path, title, description, body, ads = false, adsense = false, noindex = false, canonical = true, jsonld = [], scripts = '', refresh = null }) {
  return `<!doctype html>
<html lang="en-US" data-ads="${ads ? 'yes' : 'no'}" data-stats="${adsense ? 'page' : 'settings'}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
${GUARD}
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
${canonical ? `<link rel="canonical" href="${SITE}${canonical === true ? path : canonical}">` : ''}
${noindex ? '<meta name="robots" content="noindex,follow">' : ''}
${refresh ? `<meta http-equiv="refresh" content="0; url=${refresh}">` : ''}
<meta name="google-adsense-account" content="${PUB}">
${CONSENT_DEFAULTS}
${adsense ? ADSENSE : ''}
<meta name="theme-color" content="#F6F5F1">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="preload" href="/assets/fonts/atkinson-hyperlegible-latin-400-normal.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="/assets/fonts/fraunces-latin-700-normal.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="/assets/css/site.css?v=${V}">
<meta property="og:type" content="website">
<meta property="og:site_name" content="Daily Logic Garden">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
${canonical ? `<meta property="og:url" content="${SITE}${canonical === true ? path : canonical}">` : ''}
<meta property="og:image" content="${SITE}/assets/og.png"><meta property="og:image:width" content="1200"><meta property="og:image:height" content="630"><meta name="twitter:card" content="summary_large_image">
${jsonld.map(ld).join('\n')}
</head>
<body>
${header(path)}
<main id="main"><div class="wrap">
${body}
</div></main>
${footer()}
<script src="/assets/js/consent.js?v=${V}" defer></script>
<script src="/assets/js/site.js?v=${V}" defer></script>
${scripts}
</body>
</html>
`;
}
const GAME_JS = `<script src="/assets/js/garden.js?v=${V}" defer></script>`;

function faqHtml(faq) {
  return `<section class="faq" aria-labelledby="faq-h"><h2 id="faq-h">Questions and answers</h2>${faq.map(([q, a]) => `<details><summary>${esc(q)}</summary><p>${a}</p></details>`).join('')}</section>`;
}
function sourcesHtml(src) {
  return `<section class="sources" aria-labelledby="src-h"><h2 id="src-h">Sources and further reading</h2><ul>${src.map((s) => `<li>${s}</li>`).join('')}</ul></section>`;
}
const reviewed = `<p class="reviewed">Reviewed ${REVIEWED_TEXT} &middot; Checked against the puzzle engine described on the <a href="/about/">About &amp; method</a> page.</p>`;

// ---------- page builders ----------
for (const x of [...TOOLS, ...GUIDES]) if (EXTRA[x.path]) x.sections.push(...EXTRA[x.path]);
const pages = [];
function addPage(p) { pages.push(p); }

for (const t of TOOLS) {
  const list = [['Home', '/'], ...(t.parent ? [t.parent] : []), [t.crumb, t.path]];
  const [first, ...rest] = t.sections;
  const tool = t.game ? `<section class="game no-print" data-game="${t.game}" aria-label="${esc(t.crumb)} puzzle"><noscript><p>The puzzle needs JavaScript. The rules and strategy below work without it, and the <a href="/printable/">printable packs</a> need JavaScript only to create the sheets.</p></noscript></section>` : t.tool;
  const body = `<article class="prose-wide">${crumbs(list)}<span class="kicker">${t.kicker}</span><h1>${t.h1}</h1><p class="lede">${t.lede}</p>
${tool}
<div class="prose" style="max-width:72ch">${first}
${adBox('afterplay')}
${rest.join('\n')}
${faqHtml(t.faq)}
${sourcesHtml(t.sources)}
${reviewed}</div></article><div class="print-root print-only"></div>`;
  addPage({
    path: t.path, title: t.title, description: t.description, body, ads: true, adsense: true, kind: 'tool', minWords: 800, text: t.sections.join(' ') + t.faq.map((f) => f.join(' ')).join(' '),
    jsonld: [{ '@context': 'https://schema.org', '@type': 'WebApplication', name: t.appName || t.crumb, url: SITE + t.path, description: t.description, applicationCategory: 'GameApplication', operatingSystem: 'Any (web browser)', isAccessibleForFree: true, dateModified: REVIEWED, publisher: PUBLISHER, inLanguage: 'en-US' }, breadcrumbLd(list), faqLd(t.faq)],
    scripts: GAME_JS
  });
}
for (const g of GUIDES) {
  const list = [['Home', '/'], ['Guides', '/guides/'], [g.crumb, g.path]];
  const mid = Math.ceil(g.sections.length / 2);
  const body = `<div class="layout has-side"><article class="prose">${crumbs(list)}<span class="kicker">${g.kicker}</span><h1>${g.h1}</h1><p class="lede">${g.lede}</p>
${adBox('lede')}
${g.sections.slice(0, mid).join('\n')}
${adBox('mid')}
${g.sections.slice(mid).join('\n')}
${faqHtml(g.faq)}
${sourcesHtml(g.sources)}
${reviewed}</article><aside class="side" aria-label="Advertisement">${adBox('side')}</aside></div>`;
  addPage({
    path: g.path, title: g.title, description: g.description, body, ads: true, adsense: true, kind: 'guide', minWords: 900, text: g.lede + ' ' + g.sections.join(' ') + g.faq.map((f) => f.join(' ')).join(' '),
    jsonld: [{ '@context': 'https://schema.org', '@type': 'Article', headline: g.h1.replace(/<[^>]+>/g, ''), description: g.description, url: SITE + g.path, datePublished: '2026-11-02', dateModified: REVIEWED, author: { '@type': 'Organization', name: 'Daily Logic Garden', url: SITE + '/about/' }, publisher: PUBLISHER, inLanguage: 'en-US', mainEntityOfPage: SITE + g.path }, breadcrumbLd(list), faqLd(g.faq)]
  });
}
{
  const h = home();
  addPage({ path: '/', title: h.title, description: h.description, body: h.html, ads: false, adsense: true, kind: 'home', minWords: 800, text: h.html,
    jsonld: [{ '@context': 'https://schema.org', '@type': 'WebSite', name: 'Daily Logic Garden', url: SITE + '/', description: h.description, publisher: PUBLISHER, inLanguage: 'en-US' }], scripts: GAME_JS });
  const hub = guidesHub(GUIDES, TOOLS);
  addPage({ path: '/guides/', title: hub.title, description: hub.description, body: crumbs([['Home', '/'], ['Guides', '/guides/']]) + hub.html, kind: 'hub', adsense: true, minWords: 220, text: hub.html, jsonld: [breadcrumbLd([['Home', '/'], ['Guides', '/guides/']])] });
  const gp = gardenPage();
  addPage({ path: '/garden/', title: gp.title, description: gp.description, body: crumbs([['Home', '/'], ['My garden', '/garden/']]) + gp.html, noindex: true, kind: 'garden', text: gp.html, scripts: GAME_JS });
  for (const s of STATIC) {
    const list = [['Home', '/'], [s.crumb, s.path]];
    addPage({ path: s.path, title: s.title, description: s.description, body: crumbs(list) + s.html, kind: s.kind || 'legal', adsense: s.kind === 'about', minWords: s.minWords || (s.path === '/imprint/' ? 100 : 220), text: s.html, jsonld: [breadcrumbLd(list)] });
  }
}

// ---------- write ----------
for (const d of ['index.html', 'guides', 'flower-beds', 'tents-and-trees', 'sun-and-shade', 'garden-path', 'who-planted-what', 'archive', 'printable', 'about', 'contact', 'imprint', 'privacy', 'garden', 'assets/js', 'assets/css']) {
  rmSync(join(OUT, d), { recursive: true, force: true });
}
function write(rel, content) { const f = join(OUT, rel); mkdirSync(dirname(f), { recursive: true }); writeFileSync(f, content); }
const report = [];
for (const p of pages) {
  write(p.path === '/' ? 'index.html' : p.path.slice(1) + 'index.html', page(p));
  report.push({ path: p.path, kind: p.kind, words: words(p.text), title: p.title, noindex: !!p.noindex, ads: !!p.ads, minWords: p.minWords || 0 });
}
const nf = notFound();
write('404.html', page({ path: '/404.html', title: nf.title, description: nf.description, body: nf.html, noindex: true, canonical: false }));

// old addresses of the previous site
export const OLD = [['/about.html', '/about/'], ['/imprint.html', '/imprint/'], ['/privacy.html', '/privacy/'], ['/advertise.html', '/contact/'], ['/contact.html', '/contact/']];
for (const [from, to] of OLD) {
  write(from.slice(1), page({ path: from, title: 'This page has moved – Daily Logic Garden', description: 'This address belonged to the previous version of Daily Logic Garden. The page now lives at a new address; you are being taken there automatically.', body: `<h1>This page has moved</h1><p>The content now lives at <a href="${to}">${SITE}${to}</a>.</p>`, noindex: true, canonical: to, refresh: to }));
}

write('assets/js/garden.js', `/* Daily Logic Garden – puzzle engine and player (built ${V}) */\n` + ENGINE);
write('assets/js/consent.js', readFileSync(join(ROOT, 'src/js/consent.js'), 'utf8'));
write('assets/js/site.js', readFileSync(join(ROOT, 'src/js/site.js'), 'utf8'));
write('assets/css/site.css', readFileSync(join(ROOT, 'src/assets/site.css'), 'utf8'));
write('favicon.svg', LOGO.replace('<svg ', '<svg xmlns="http://www.w3.org/2000/svg" ').replace(' aria-hidden="true"', ''));
write('ads.txt', 'google.com, pub-7811071715414905, DIRECT, f08c47fec0942fa0\n');
write('robots.txt', `User-agent: *\nAllow: /\n\nSitemap: ${SITE}/sitemap.xml\n`);
write('CNAME', 'dailylogicgarden.com'); // as committed on main (no trailing newline)
write('.nojekyll', '');
const indexable = pages.filter((p) => !p.noindex);
write('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${indexable.map((p) => `  <url><loc>${SITE}${p.path}</loc><lastmod>${CHANGED_0511.includes(p.path) ? '2026-11-05' : CHANGED_0411.includes(p.path) ? '2026-11-04' : REVIEWED}</lastmod></url>`).join('\n')}\n</urlset>\n`);
writeFileSync(join(ROOT, 'build-report.json'), JSON.stringify(report, null, 1));
console.log(`built ${pages.length} pages + 404 + ${OLD.length} redirects`);
for (const r of report) console.log(String(r.words).padStart(5), r.kind.padEnd(6), r.path);
