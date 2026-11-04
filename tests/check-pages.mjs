// Static checks over the built site in docs/.
import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = dirname(dirname(fileURLToPath(import.meta.url)));
const DOCS = join(ROOT, 'docs');
const SITE = 'https://dailylogicgarden.com';
const report = JSON.parse(readFileSync(join(ROOT, 'build-report.json'), 'utf8'));
let fails = 0, checks = 0;
function ok(cond, msg) { checks++; if (!cond) { fails++; console.error('FAIL', msg); } }
function fileFor(path) { const clean = path.split('#')[0].split('?')[0]; if (clean.endsWith('/')) return join(DOCS, clean, 'index.html'); return join(DOCS, clean); }
function all(dir) { return readdirSync(dir).flatMap((f) => { const p = join(dir, f); return statSync(p).isDirectory() ? all(p) : [p]; }); }
const get = (h, re) => (re.exec(h) || [])[1];

const sitemap = readFileSync(join(DOCS, 'sitemap.xml'), 'utf8');
const sitemapUrls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
const titles = {}, descs = {};
const LEGAL = ['/imprint/', '/privacy/', '/contact/'];
for (const url of sitemapUrls) {
  const path = url.replace(SITE, '');
  const f = fileFor(path);
  ok(existsSync(f), 'sitemap page exists ' + path);
  const h = readFileSync(f, 'utf8');
  const title = get(h, /<title>([^<]*)<\/title>/).replace(/&amp;/g, '&');
  const desc = get(h, /<meta name="description" content="([^"]*)"/).replace(/&amp;/g, '&');
  ok(title.length >= 30 && title.length <= 65, `title length ${title.length} ${path}: ${title}`);
  ok(desc.length >= 120 && desc.length <= 160, `description length ${desc.length} ${path}`);
  ok(!titles[title], 'unique title ' + path); titles[title] = 1;
  ok(!descs[desc], 'unique description ' + path); descs[desc] = 1;
  ok((h.match(/<h1[\s>]/g) || []).length === 1, 'one h1 ' + path);
  ok(h.includes(`<link rel="canonical" href="${url}">`), 'canonical ' + path);
  ok(!/noindex/.test(h), 'sitemap page indexable ' + path);
  const r = report.find((x) => x.path === path);
  ok(r && r.words >= r.minWords, `words ${r && r.words} >= ${r && r.minWords} ${path}`);
  const isLegal = LEGAL.includes(path);
  ok(!isLegal || (!h.includes('adsbygoogle.js') && !h.includes('class="ad"')), 'no ads on legal page ' + path);
  ok(isLegal || h.includes('<script data-ads-loader>'), 'AdSense loader on every indexable non-legal page ' + path);
  if (path === '/' ) ok(h.includes('adsbygoogle.js') && !h.includes('class="ad"'), 'home: loader but no slots');
  if (r && (r.kind === 'tool' || r.kind === 'guide')) {
    ok(h.includes("<script data-ads-loader>if(!window.DLG_NO_GOOGLE){") && h.includes("s.src='https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-7811071715414905';s.crossOrigin='anonymous'") && h.includes('s.async=true'), 'adsense loader ' + path);
    ok(/<table/.test(h) && /<figure><svg/.test(h), 'table and inline svg ' + path);
    ok(h.includes('Reviewed November 2, 2026'), 'reviewed line ' + path);
    ok(h.includes('"@type":"FAQPage"') && h.includes('"@type":"BreadcrumbList"') && h.includes('"dateModified":"2026-11-02"'), 'json-ld ' + path);
    ok(h.includes(r.kind === 'tool' ? '"@type":"WebApplication"' : '"@type":"Article"'), 'type json-ld ' + path);
    ok(/Sources and further reading/.test(h), 'sources ' + path);
    // ad placement order: tools – game, then a text section, then the first slot; guides – lede, slot, sections, mid slot
    if (r.kind === 'tool') {
      const g = h.indexOf('data-game=') >= 0 ? h.indexOf('data-game=') : Math.max(h.indexOf('data-archive'), h.indexOf('data-printable'));
      const a = h.indexOf('data-slot="afterplay"');
      ok(g > 0 && a > g && /<h2[^>]*>[\s\S]{400,}/.test(h.slice(g, a)), 'first slot after first explanation ' + path);
    } else {
      ok(h.indexOf('data-slot="lede"') > h.indexOf('class="lede"') && h.indexOf('data-slot="mid"') > h.indexOf('data-slot="lede"'), 'guide slots ' + path);
    }
  }
}
// every html page
for (const f of all(DOCS).filter((x) => x.endsWith('.html'))) {
  const h = readFileSync(f, 'utf8'), rel = f.slice(DOCS.length);
  ok(h.includes('<meta name="google-adsense-account" content="ca-pub-7811071715414905">'), 'adsense meta ' + rel);
  const cd = h.indexOf("gtag('consent','default'"), firstGoogle = Math.min(...['adsbygoogle.js', 'googletagmanager'].map((s) => { const i = h.indexOf(s); return i < 0 ? Infinity : i; }));
  // local/test guard is the first script; no static Google script tag; the loader sits directly after the consent defaults
  const guardAt = h.indexOf('<script>window.DLG_NO_GOOGLE=');
  const guard = guardAt >= 0 ? h.slice(guardAt, h.indexOf('</script>', guardAt)) : '';
  ok(guardAt > 0 && h.search(/<script/) === guardAt && guardAt < cd && ['localhost', "'127.0.0.1'", "'::1'", "'file:'", 'stats_test=1'].every((k) => guard.includes(k)), 'local/test guard first ' + rel);
  ok(!/<script[^>]+src="https:\/\/(pagead2|www\.googletagmanager)/.test(h), 'no static Google script tag ' + rel);
  if (h.includes('data-ads-loader')) ok(/<script>window\.dataLayer[\s\S]*?<\/script>\n<script data-ads-loader>/.test(h), 'loader right after consent defaults ' + rel);
  ok(cd > 0 && cd < firstGoogle && h.includes('wait_for_update:500') && h.includes('ads_data_redaction') && h.includes("ga-disable-G-T00HRG2YVF']=true"), 'consent defaults first ' + rel);
  for (const m of h.matchAll(/href="(\/[^"]*)"/g)) {
    const target = m[1].replace(/&amp;/g, '&');
    if (target.startsWith('//')) continue;
    ok(existsSync(fileFor(target)), `link ${target} from ${rel}`);
  }
  for (const m of h.matchAll(/src="(\/[^"?]*)/g)) ok(existsSync(fileFor(m[1])), `asset ${m[1]} from ${rel}`);
  ok(!/\b(Queens|Tango|Zip|LinkedIn)\b(?!-style)/.test(h.replace(/<script[\s\S]*?<\/script>/g, ' ').replace(/<title>[\s\S]*?<\/title>|<meta[^>]*>/g, ' ').replace(/<[^>]+>/g, ' ').replace(/Queens-style|&ldquo;Queens&rdquo;|“Queens”/g, '')), 'no trademark product names ' + rel);
  ok(!/Sudoku|Nonogram/i.test(h.replace(/X-wing in Sudoku/, '')) || /about|three-beds/.test(rel), 'no other-site genres ' + rel);
  ok(!/coming soon|lorem ipsum|\[PREIS\]|TODO/i.test(h), 'no placeholders ' + rel);
}
// 404 and redirects
const nf = readFileSync(join(DOCS, '404.html'), 'utf8');
ok(nf.includes('noindex') && !nf.includes('rel="canonical"') && !nf.includes('adsbygoogle.js'), '404 noindex, no canonical, no ads');
for (const old of ['about', 'imprint', 'privacy', 'advertise', 'contact']) {
  const h = readFileSync(join(DOCS, old + '.html'), 'utf8');
  const to = get(h, /url=([^"]+)"/);
  ok(h.includes('noindex') && to && to !== '/' && h.includes(`rel="canonical" href="${SITE}${to}"`), 'redirect ' + old);
}
const garden = readFileSync(join(DOCS, 'garden/index.html'), 'utf8');
ok(garden.includes('noindex') && !garden.includes('class="ad"') && !sitemap.includes('/garden/'), 'garden page noindex without ads');
ok(readFileSync(join(DOCS, 'ads.txt'), 'utf8').trim() === 'google.com, pub-7811071715414905, DIRECT, f08c47fec0942fa0', 'ads.txt');
ok(readFileSync(join(DOCS, 'robots.txt'), 'utf8').includes('Sitemap: https://dailylogicgarden.com/sitemap.xml'), 'robots');
ok(readFileSync(join(DOCS, 'CNAME'), 'utf8').trim() === 'dailylogicgarden.com', 'CNAME');
ok(existsSync(join(DOCS, 'assets/fonts/OFL-Fraunces.txt')) && existsSync(join(DOCS, 'assets/fonts/OFL-Atkinson-Hyperlegible.txt')), 'font licenses');
// slot IDs are empty
ok(/afterplay: ''[\s\S]*lede: ''[\s\S]*mid: ''[\s\S]*side: ''/.test(readFileSync(join(DOCS, 'assets/js/site.js'), 'utf8')), 'ad slot IDs empty');
// page weight: html + css + js + preloaded fonts
const shared = ['assets/css/site.css', 'assets/js/consent.js', 'assets/js/site.js', 'assets/fonts/atkinson-hyperlegible-latin-400-normal.woff2', 'assets/fonts/fraunces-latin-700-normal.woff2', 'assets/fonts/atkinson-hyperlegible-latin-700-normal.woff2'].reduce((s, f) => s + statSync(join(DOCS, f)).size, 0);
const engine = statSync(join(DOCS, 'assets/js/garden.js')).size;
let heaviest = 0;
for (const url of sitemapUrls) { const h = readFileSync(fileFor(url.replace(SITE, '')), 'utf8'); heaviest = Math.max(heaviest, h.length + shared + (h.includes('garden.js') ? engine : 0)); }
ok(heaviest < 300 * 1024, 'page weight ' + heaviest);
console.log(`check-pages: ${checks - fails}/${checks} checks passed; heaviest page ${(heaviest / 1024).toFixed(0)} KB; ${sitemapUrls.length} sitemap URLs`);
if (fails) process.exit(1);
