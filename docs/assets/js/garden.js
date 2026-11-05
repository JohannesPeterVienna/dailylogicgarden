/* Daily Logic Garden – puzzle engine and player (built 20261105b) */
(function (root, factory) {
var api = factory();
if (typeof module !== 'undefined' && module.exports) module.exports = api;
else (root.DLG = root.DLG || {}).core = api;
})(this, function () {
'use strict';
var VERSION = 'g1';
var LEVELS = ['sprout', 'bloom', 'grove'];
var LEVEL_NAMES = { sprout: 'Sprout', bloom: 'Bloom', grove: 'Grove' };
function hash(str) {
var h1 = 0xdeadbeef, h2 = 0x41c6ce57;
for (var i = 0; i < str.length; i++) {
var ch = str.charCodeAt(i);
h1 = Math.imul(h1 ^ ch, 2654435761);
h2 = Math.imul(h2 ^ ch, 1597334677);
}
h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
return (h1 ^ h2) >>> 0;
}
function rng(seed) {
var a = typeof seed === 'string' ? hash(seed) : seed >>> 0;
function next() {
a = (a + 0x6D2B79F5) >>> 0;
var t = a;
t = Math.imul(t ^ (t >>> 15), t | 1);
t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}
return {
next: next,
state: function () { return a; },
mark: function () { api.lastStart = a; },
int: function (n) { return Math.floor(next() * n); },
pick: function (arr) { return arr[Math.floor(next() * arr.length)]; },
shuffle: function (arr) {
for (var i = arr.length - 1; i > 0; i--) {
var j = Math.floor(next() * (i + 1));
var t = arr[i]; arr[i] = arr[j]; arr[j] = t;
}
return arr;
}
};
}
function pad(n) { return n < 10 ? '0' + n : '' + n; }
function dateKey(d) {
d = d || new Date();
return d.getUTCFullYear() + '-' + pad(d.getUTCMonth() + 1) + '-' + pad(d.getUTCDate());
}
function parseKey(key) {
var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(key || '');
if (!m) return null;
var d = new Date(Date.UTC(+m[1], +m[2] - 1, +m[3]));
return dateKey(d) === key ? d : null;
}
function addDays(key, n) {
var d = parseKey(key);
d.setUTCDate(d.getUTCDate() + n);
return dateKey(d);
}
function seedFor(type, level, key) { return VERSION + '|' + type + '|' + level + '|' + key; }
var PRE = null;
function setPre(table) { PRE = table || null; }
function rngFor(type, level, key) {
var hit;
if (PRE && PRE.states[type + '|' + level] && parseKey(key)) {
var day = Math.round((parseKey(key) - parseKey(PRE.start)) / 86400000);
hit = PRE.states[type + '|' + level][day];
}
return rng(typeof hit === 'number' ? hit >>> 0 : seedFor(type, level, key));
}
function levelIndex(level) { var i = LEVELS.indexOf(level); return i < 0 ? 0 : i; }
var COLS = 'ABCDEFGHIJKLMNOP';
function cellName(r, c) { return COLS[c] + (r + 1); }
function rowName(r) { return 'row ' + (r + 1); }
function colName(c) { return 'column ' + COLS[c]; }
function listJoin(items) {
if (items.length <= 1) return items.join('');
return items.slice(0, -1).join(', ') + ' and ' + items[items.length - 1];
}
function plural(n, one, many) { return n + ' ' + (n === 1 ? one : (many || one + 's')); }
var WORDS = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten'];
function word(n) { return WORDS[n] || String(n); }
var api = {
VERSION: VERSION, setPre: setPre, rngFor: rngFor, lastStart: null, LEVELS: LEVELS, LEVEL_NAMES: LEVEL_NAMES,
hash: hash, rng: rng, dateKey: dateKey, parseKey: parseKey, addDays: addDays,
seedFor: seedFor, levelIndex: levelIndex,
cellName: cellName, rowName: rowName, colName: colName, COLS: COLS,
listJoin: listJoin, plural: plural, word: word
};
return api;
});
DLG.core.setPre({"start":"2026-11-02","states":{"flowerbeds|sprout":[3419388765,965089105,1408069819,3039767517,218454968,3684923126,700444215,1995577759,145227246,2078297476,597967473,2459531732,964014680,1341972867,1791831678,754294151,3311400516,137401580,3440534855,1126296068,205242956,1726042525,537005311,3203299388,3589148849,1267301332,2633497819,692603970,1253545179,2255899588,2344334634,2770775895,608492258,1506668289,1448355863,2273907205,1601905326,2657073298,332815571,1369450848,3647542695,3324859655,3818307185,3665738080,203955676,1381556841,2882102183,1168348429,566211317,157612230,2650491566,2106786454,1489146499,1102235606,1423106511,3897669305,2758245770,1384433141,3720768131,4049862583,1805144502,3566614459,1725839045,2945597888,2424174402,3346920761,3446758980,3734662341,2430788677,2636644964,3866995811,2664406054,2185450811,4170281320,3443094388,2037367936,1314835383,2109732754,1752611973,2758068783,1444756332,669938537,2454804367,4244856566,2734736648,1574516838,2416620154,2883161201,718684416,2550433076,2193046520,564534103,3636564845,556841890,3853598184,1649836189,3712486502,3977338075,3722616362,1291826693,1190624648,322314636,1556092166,1684918377,424316452,3841657005,2323861,1628045707,4101305883,3863339241,1552228851,1500408989,1579098522,3454442771,771455504,2061143143,4189828194,3409042892,3523291783,209550802,3719573652,3189138325,2025572622,3593904454,297745093,3636881794,3675227158,3443623176,1856351907,655763918,1824966610,2456715100,403330087,673513993,421817217,1103976039,3141563877,3861423505,4209573812,2738791335,2364100073,3709118916,3804116199,389120368,4122074859,1391980888,313673894,2748153564,2753379424,1581670856],"flowerbeds|grove":[145219665,3622206169,2451381683,4174383427,783409292,1993257472,219123372,123806927,155229135,3901172441,1233459458,1562439673,4053231170,796824058,1108789403,1919174251,1565647274,1413112803,3410281875,333335557,2828591544,3179680818,3676322276,3607178872,4020074069,155151234,1139497144,3829846813,3622632783,3998576871,2559910543,251564011,3262272375,3223534410,245155703,2163577451,3882045075,88287125,706883459,2358822213,131104030,661448116,2189546864,3980611273,2203841026,605347257,870143630,2961822179,889772142,129110684,1993379094,3726481657,53714119,2731618606,4003552404,4089798746,1369957505,309322006,2957575668,2965101521,2548793336,761401899,2153526473,3462191032,3927804865,3532763962,1669320974,2084908812,3646460735,1606660693,1932900999,2102284166,1318726215,1093998539,3233472858,2536254457,2067977231,2102469795,763130545,3310833480,3849755117,2961694868,877373568,1345326783,4226461906,4103848709,2894855066,2462730805,2833935888,3110311107,50266906,3198744734,3241326632,773071525,3840241876,2761213261,1763728882,1263442425,3362196313,1959265510,1972021102,1552497287,1004028101,3122762439,4020632095,2496807984,243113589,1694546527,2440874455,3131678483,336350657,64376254,2365931603,4202049395,2549511049,1037338838,592779142,1784432597,4096752527,1468014782,1837576141,3218439290,3971140719,572676573,1768140191,3175411554,1787124015,2012390409,709200562,2795844259,3641458038,184279490,2720398835,2225184851,3782298670,3867075599,2483362155,1074625293,3705762404,3545072279,915460849,3267888658,4224618828,2759142291,2566721297,613708098,711962197,2945845596,71019129,20925260],"sunshade|grove":[221505196,2341940773,1377217107,2567937880,1190973044,3526839609,3525901525,103701032,2090501410,2912335714,3549122158,2816579675,3862486370,2064713761,2999233283,1155513015,612604992,3297632251,1471022230,255614276,3423246827,594166169,3543392908,2889752177,3724557660,2492884365,503308922,1151110551,828949330,2506704861,3304197319,3621309186,94859847,3515701800,914334514,2159260690,202649757,664455083,1710144625,687288649,1633847699,956958273,2710798149,2734052532,998658834,1481016595,2816430717,3675246640,2458057376,360265117,2704012806,3475966213,1144428261,3355644933,403495635,266070657,263511629,2554776432,2739344617,544099593,1264651104,141362287,3093141792,3735780511,1750789937,759701570,2808674460,3770859285,2114685316,414528659,3043219262,3688484371,2306309566,265940493,2887494528,1809476080,3539569868,3769125385,3116350704,230500555,3333716489,1008237116,2248940293,1941153766,396180073,4146363464,304688880,2896481218,1237991108,1146036189,3561330842,2132898553,2572609962,1047276767,2966826182,1458875269,4172295922,1658659966,3748072700,2281568286,2123741831,2889583752,2568730857,720415749,3213004937,3446574159,1850733856,2248505233,3822462610,961497960,2102167567,625301782,1701936084,2404957527,2823724211,3006138108,1877292538,3662239802,2464124326,1923876827,3467764893,2461410391,1028979002,3976298127,2425888684,3295357350,2598542949,1368202610,2990795387,503164232,3703971767,2642401901,1716924399,3240200168,837726210,1237081151,2613204964,1004450335,4077027953,309425660,4041398967,3378602815,3470445075,732924820,4192552980,2407808272,3070089797,586453381,4185607167,2196348342],"gardenpath|bloom":[4184381567,3628382320,1781324870,2248080012,3553935937,682044681,2397000138,2371118969,462247863,142879113,4248900916,1075783216,1755264689,3183174478,1022769870,4116212320,3926251632,477054657,848028768,1902940536,3691313863,1149487883,2938052950,3414175845,1979371691,1081438238,3983188523,4001650366,3128544279,3676468598,1364729483,3107349444,793006457,3889208276,1620234586,4110150529,3580152135,2142066364,3356884670,2558026119,3571285106,2113915907,2612247868,621331575,1616309250,2619312620,757525976,1865168769,2547922603,1830299406,2810128961,354252016,3552735658,972361959,2662421994,1693835389,1819830790,2342512189,862125053,3451145518,4174750632,2251160577,2880552072,2443027961,2941013003,1621000637,3999444811,4167895151,3927187257,1742046679,1866570736,948370963,4009228881,3892916942,7591859,1429211505,3306124149,3518825469,3435325214,2112422456,2387631765,350995500,2905951807,895506151,2135269915,2333106699,2511062805,2428523922,1965037138,3442538511,2840058703,125591211,2620613299,2497163736,1697259283,3600076918,3216770235,1518773793,777997490,4038007400,3991172006,3359335558,1961108817,2771679687,4187991572,732666483,1322866277,3289833654,4124053079,1148542755,608963599,2421782343,3287508207,3819724788,429266381,3785827254,3216794885,1074801169,3067902951,367027787,3040465364,3196151734,1873023681,1091656240,207147465,1580031502,3178182132,2812842917,519176422,3045172517,1498599669,3333311890,232746008,3203530967,91256358,1212144651,2897527773,1107863832,2379368999,4042431372,3624911904,3987658945,3460044071,3460686442,2478586653,1810137531,4259052503,222227423,1715876578,1917585739],"gardenpath|grove":[3566702934,3002203076,1308628095,4273592629,481064232,1270040029,934993900,564183572,3163788468,2391278202,991625164,902402561,2563793556,2615865229,3532142548,3552755874,2186781155,2320247947,2044825102,2761134776,484982177,1489937431,3479620766,1795115199,2020976671,4069743625,3332146847,2971431927,1493935937,3199800,1171754209,34738732,149285318,1521282337,3720573753,1504149676,3814654452,1960104200,1053950627,1324419237,2328106929,1761532592,3382685612,156550636,2130508583,332524880,2822893415,3985564187,3125506886,2154759689,410769705,3008078288,172027204,3389651726,3405095434,2657920741,3018648777,248052320,934491956,2511626375,3735344214,3305008449,511447922,3697069569,1784528479,1637197143,2893688002,2054403513,173401147,1811174246,1038539813,1121143948,2806494130,4096010675,1473636897,2144966150,3476820972,1607710193,3680536696,837428423,3579293786,4268798984,317538993,937923011,2983698317,81828166,3769729629,541678122,2459639385,3991852673,2031461480,1802751501,511303950,575482023,2191426133,4282604482,1418600504,3776512308,3099492294,180815261,548250110,585092686,876149883,146418245,4149376339,2844237100,1306009286,1262516729,2211795593,1755061199,1446997625,452156727,1356524071,3312737429,905976286,1873207612,4058465730,235489970,2703726843,588535421,782838285,2825802919,1288908767,3298514786,1621555337,126354610,4046027207,327763692,3319200434,3575031129,3164020089,2920262732,592008262,2106020912,3124022663,3566548944,1693474231,2871112660,3174389407,3883165748,3747472410,1119181373,1727634602,2117853566,4243784260,2053333442,1407392457,1760867702,392473628,1209451084]}});
(function (root, factory) {
var core = typeof module !== 'undefined' && module.exports ? require('./core.js') : root.DLG.core;
var api = factory(core);
if (typeof module !== 'undefined' && module.exports) module.exports = api;
else root.DLG.flowerbeds = api;
})(this, function (core) {
'use strict';
var BED_NAMES = ['Rose', 'Iris', 'Fern', 'Mint', 'Sage', 'Thyme', 'Poppy', 'Lily', 'Aster'];
var SIZES = { sprout: 6, bloom: 7, grove: 8 };
var TIERS = { sprout: 1, bloom: 2, grove: 3 };
var cn = core.cellName;
function geometry(n, regions) {
var rows = [], cols = [], beds = [];
for (var i = 0; i < n; i++) { rows.push([]); cols.push([]); beds.push([]); }
for (var k = 0; k < n * n; k++) {
rows[Math.floor(k / n)].push(k); cols[k % n].push(k); beds[regions[k]].push(k);
}
var near = [];
for (k = 0; k < n * n; k++) {
var r = Math.floor(k / n), c = k % n, set = {};
rows[r].concat(cols[c], beds[regions[k]]).forEach(function (x) { set[x] = 1; });
for (var dr = -1; dr <= 1; dr++) for (var dc = -1; dc <= 1; dc++) {
var rr = r + dr, cc = c + dc;
if (rr >= 0 && cc >= 0 && rr < n && cc < n) set[rr * n + cc] = 1;
}
delete set[k];
near.push(Object.keys(set).map(Number));
}
var units = [];
rows.forEach(function (cells, i) { units.push({ kind: 'row', idx: i, cells: cells, name: core.rowName(i) }); });
cols.forEach(function (cells, i) { units.push({ kind: 'col', idx: i, cells: cells, name: core.colName(i) }); });
beds.forEach(function (cells, i) { units.push({ kind: 'bed', idx: i, cells: cells, name: 'the ' + BED_NAMES[i] + ' bed' }); });
return { n: n, regions: regions, rows: rows, cols: cols, beds: beds, near: near, units: units };
}
function closure(g, s) {
for (var k = 0; k < s.length; k++) if (s[k] === 1) g.near[k].forEach(function (x) { if (s[x] === 0) s[x] = 2; });
}
function blockedBy(g, s) {
var out = [];
for (var k = 0; k < s.length; k++) if (s[k] === 1) g.near[k].forEach(function (x) { if (s[x] !== 1) out.push(x); });
return out;
}
function openCells(s, cells) { return cells.filter(function (x) { return s[x] === 0; }); }
function hasFlower(s, cells) { return cells.some(function (x) { return s[x] === 1; }); }
function cap(t) { return t.charAt(0).toUpperCase() + t.slice(1); }
function lastSpot(g, s) {
for (var u = 0; u < g.units.length; u++) {
var unit = g.units[u];
if (hasFlower(s, unit.cells)) continue;
var open = openCells(s, unit.cells);
if (open.length === 1) {
return { tier: 1, tech: 'last-spot', set: [[open[0], 1]], focus: unit.cells.slice(), mark: [open[0]],
text: cap(unit.name) + ' has only one open square left, ' + cn(Math.floor(open[0] / g.n), open[0] % g.n) + ', so its flower goes there.' };
}
}
return null;
}
function confinedOne(g, s) {
var n = g.n, lines = [['row', g.rows], ['col', g.cols]];
for (var b = 0; b < n; b++) {
if (hasFlower(s, g.beds[b])) continue;
var open = openCells(s, g.beds[b]);
if (!open.length) continue;
for (var l = 0; l < 2; l++) {
var key = l === 0 ? function (x) { return Math.floor(x / n); } : function (x) { return x % n; };
var line = key(open[0]);
if (open.every(function (x) { return key(x) === line; })) {
var lineCells = lines[l][1][line];
var clear = openCells(s, lineCells).filter(function (x) { return g.regions[x] !== b; });
if (clear.length) {
var lname = l === 0 ? core.rowName(line) : core.colName(line);
return { tier: 2, tech: 'confined', set: clear.map(function (x) { return [x, 2]; }), focus: open.concat(clear), mark: clear,
text: 'Every open square of the ' + BED_NAMES[b] + ' bed lies in ' + lname + ', so that bed takes ' + lname + '’s flower and the other open squares of ' + lname + ' stay empty.' };
}
}
}
}
for (l = 0; l < 2; l++) {
for (var i = 0; i < n; i++) {
var cells = lines[l][1][i];
if (hasFlower(s, cells)) continue;
var op = openCells(s, cells);
if (!op.length) continue;
var bed = g.regions[op[0]];
if (op.every(function (x) { return g.regions[x] === bed; })) {
var clr = openCells(s, g.beds[bed]).filter(function (x) { return (l === 0 ? Math.floor(x / n) : x % n) !== i; });
if (clr.length) {
var nm = l === 0 ? core.rowName(i) : core.colName(i);
return { tier: 2, tech: 'confined', set: clr.map(function (x) { return [x, 2]; }), focus: op.concat(clr), mark: clr,
text: 'All open squares of ' + nm + ' belong to the ' + BED_NAMES[bed] + ' bed, so that bed’s flower is in ' + nm + ' and the rest of the ' + BED_NAMES[bed] + ' bed stays empty.' };
}
}
}
}
return null;
}
function touchAll(g, s) {
var n = g.n;
for (var x = 0; x < s.length; x++) {
if (s[x] !== 0) continue;
var nearSet = {};
g.near[x].forEach(function (y) { nearSet[y] = 1; });
for (var u = 0; u < g.units.length; u++) {
var unit = g.units[u];
if (unit.cells.indexOf(x) >= 0 || hasFlower(s, unit.cells)) continue;
var open = openCells(s, unit.cells);
if (open.length && open.every(function (y) { return nearSet[y]; })) {
return { tier: 2, tech: 'touch-all', set: [[x, 2]], focus: open.concat([x]), mark: [x],
text: 'A flower on ' + cn(Math.floor(x / n), x % n) + ' would touch or share a line with every open square of ' + unit.name + ', leaving it no place for its flower, so ' + cn(Math.floor(x / n), x % n) + ' stays empty.' };
}
}
}
return null;
}
function firstSubset(items, k, fn) {
var pick = [], found = null;
(function rec(start) {
if (found) return;
if (pick.length === k) { found = fn(pick.slice()); return; }
for (var i = start; i < items.length && !found; i++) { pick.push(items[i]); rec(i + 1); pick.pop(); }
})(0);
return found;
}
function lineGroupName(kind, idxs) {
var names = idxs.map(function (i) { return kind === 'row' ? String(i + 1) : core.COLS[i]; });
return (kind === 'row' ? 'rows ' : 'columns ') + core.listJoin(names);
}
function confinedMany(g, s) {
var n = g.n;
var openBeds = [], b;
for (b = 0; b < n; b++) if (!hasFlower(s, g.beds[b])) openBeds.push(b);
var kinds = [['row', g.rows, function (x) { return Math.floor(x / n); }], ['col', g.cols, function (x) { return x % n; }]];
for (var k = 2; k < openBeds.length; k++) {
for (var t = 0; t < 2; t++) {
var kind = kinds[t][0], lines = kinds[t][1], key = kinds[t][2];
var openLines = [];
for (var i = 0; i < n; i++) if (!hasFlower(s, lines[i])) openLines.push(i);
var step = firstSubset(openLines, k, function (L) {
var inL = {}; L.forEach(function (i) { inL[i] = 1; });
var inside = openBeds.filter(function (bb) { var op = openCells(s, g.beds[bb]); return op.length && op.every(function (x) { return inL[key(x)]; }); });
if (inside.length !== k) return null;
var isIn = {}; inside.forEach(function (bb) { isIn[bb] = 1; });
var clear = [];
L.forEach(function (i) { openCells(s, lines[i]).forEach(function (x) { if (!isIn[g.regions[x]]) clear.push(x); }); });
if (!clear.length) return null;
var focus = [];
inside.forEach(function (bb) { focus = focus.concat(openCells(s, g.beds[bb])); });
return { tier: 3, tech: 'k-confined', set: clear.map(function (x) { return [x, 2]; }), focus: focus.concat(clear), mark: clear,
text: 'The ' + core.listJoin(inside.map(function (bb) { return BED_NAMES[bb]; })) + ' beds fit entirely inside ' + lineGroupName(kind, L) + ', so those ' + core.word(k) + ' lines are reserved for them and every other open square there stays empty.' };
});
if (step) return step;
step = firstSubset(openBeds, k, function (B) {
var inB = {}; B.forEach(function (bb) { inB[bb] = 1; });
var inside = openLines.filter(function (i) { var op = openCells(s, lines[i]); return op.length && op.every(function (x) { return inB[g.regions[x]]; }); });
if (inside.length !== k) return null;
var isIn = {}; inside.forEach(function (i) { isIn[i] = 1; });
var clear = [];
B.forEach(function (bb) { openCells(s, g.beds[bb]).forEach(function (x) { if (!isIn[key(x)]) clear.push(x); }); });
if (!clear.length) return null;
var focus = [];
inside.forEach(function (i) { focus = focus.concat(openCells(s, lines[i])); });
return { tier: 3, tech: 'k-confined', set: clear.map(function (x) { return [x, 2]; }), focus: focus.concat(clear), mark: clear,
text: 'All open squares of ' + lineGroupName(kind, inside) + ' lie in the ' + core.listJoin(B.map(function (bb) { return BED_NAMES[bb]; })) + ' beds, so those beds must place their flowers there and their other open squares stay empty.' };
});
if (step) return step;
}
}
return null;
}
var TECHNIQUES = [lastSpot, confinedOne, touchAll, confinedMany];
var TECH_TIER = [1, 2, 2, 3];
function nextStep(g, s, maxTier) {
closure(g, s);
for (var i = 0; i < TECHNIQUES.length; i++) {
if (TECH_TIER[i] > maxTier) continue;
var st = TECHNIQUES[i](g, s);
if (st) return st;
}
return null;
}
function broken(g, s) {
for (var u = 0; u < g.units.length; u++) {
var cells = g.units[u].cells, f = 0, o = 0;
cells.forEach(function (x) { if (s[x] === 1) f++; else if (s[x] === 0) o++; });
if (f > 1 || (f === 0 && o === 0)) return true;
}
return false;
}
function solveLogic(g, start, maxTier) {
var s = Int8Array.from(start), used = 0, steps = 0;
for (;;) {
if (broken(g, s)) return { solved: false, state: s, maxTier: used, steps: steps, broken: true };
var st = nextStep(g, s, maxTier);
if (!st) break;
st.set.forEach(function (p) { s[p[0]] = p[1]; });
used = Math.max(used, st.tier); steps++;
}
closure(g, s);
var solved = !s.some(function (v) { return v === 0; }) && !broken(g, s);
return { solved: solved, state: s, maxTier: used, steps: steps };
}
function countSolutions(g, limit, avoid) {
var n = g.n, colUsed = [], bedUsed = [], count = 0, cur = [];
limit = limit || 2;
g.lastAlt = null;
(function row(r, prev) {
if (count >= limit) return;
if (r === n) {
count++;
if (avoid && !g.lastAlt && cur.some(function (c, i) { return avoid[i] !== c; })) g.lastAlt = cur.slice();
return;
}
for (var c = 0; c < n; c++) {
var b = g.regions[r * n + c];
if (colUsed[c] || bedUsed[b] || (prev >= 0 && Math.abs(prev - c) <= 1)) continue;
colUsed[c] = bedUsed[b] = true; cur[r] = c;
row(r + 1, c);
colUsed[c] = bedUsed[b] = false;
}
})(0, -1);
return count;
}
function randomFlowers(n, R) {
var pos = [], used = [];
function rec(r) {
if (r === n) return true;
var order = R.shuffle(Array.from({ length: n }, function (_, i) { return i; }));
for (var i = 0; i < n; i++) {
var c = order[i];
if (used[c] || (r > 0 && Math.abs(pos[r - 1] - c) <= 1)) continue;
used[c] = true; pos[r] = c;
if (rec(r + 1)) return true;
used[c] = false;
}
return false;
}
rec(0);
return pos;
}
function growRegions(n, pos, R) {
var regions = new Array(n * n).fill(-1);
var size = new Array(n).fill(1);
pos.forEach(function (c, r) { regions[r * n + c] = r; });
var left = n * n - n;
while (left > 0) {
var cands = [];
for (var k = 0; k < n * n; k++) {
if (regions[k] >= 0) continue;
var r = Math.floor(k / n), c = k % n;
[[r - 1, c], [r + 1, c], [r, c - 1], [r, c + 1]].forEach(function (p) {
if (p[0] < 0 || p[1] < 0 || p[0] >= n || p[1] >= n) return;
var reg = regions[p[0] * n + p[1]];
if (reg >= 0) cands.push([k, reg]);
});
}
var best = null, bestScore = -1;
for (var t = 0; t < 3; t++) {
var cand = R.pick(cands), score = R.next() / size[cand[1]];
if (score > bestScore) { bestScore = score; best = cand; }
}
regions[best[0]] = best[1]; size[best[1]]++; left--;
}
return regions;
}
function connectedWithout(n, regions, reg, skip) {
var cells = [];
for (var k = 0; k < n * n; k++) if (regions[k] === reg && k !== skip) cells.push(k);
if (!cells.length) return false;
var seen = {}, stack = [cells[0]], cnt = 0;
seen[cells[0]] = 1;
while (stack.length) {
var x = stack.pop(); cnt++;
var r = Math.floor(x / n), c = x % n;
[[r - 1, c], [r + 1, c], [r, c - 1], [r, c + 1]].forEach(function (p) {
if (p[0] < 0 || p[1] < 0 || p[0] >= n || p[1] >= n) return;
var y = p[0] * n + p[1];
if (!seen[y] && regions[y] === reg && y !== skip) { seen[y] = 1; stack.push(y); }
});
}
return cnt === cells.length;
}
function makeUnique(n, pos, regions, R) {
regions = regions.slice();
var seeds = {};
pos.forEach(function (c, r) { seeds[r * n + c] = 1; });
for (var it = 0; it < 120; it++) {
var g = geometry(n, regions);
var cnt = countSolutions(g, 2, pos);
if (cnt === 1) return renumber(regions);
var alt = g.lastAlt, moves = [];
alt.forEach(function (c, r) {
var x = r * n + c;
if (seeds[x]) return;
[[r - 1, c], [r + 1, c], [r, c - 1], [r, c + 1]].forEach(function (p) {
if (p[0] < 0 || p[1] < 0 || p[0] >= n || p[1] >= n) return;
var to = regions[p[0] * n + p[1]];
if (to !== regions[x]) moves.push([x, to]);
});
});
R.shuffle(moves);
var moved = false;
for (var m = 0; m < moves.length && !moved; m++) {
if (connectedWithout(n, regions, regions[moves[m][0]], moves[m][0])) { regions[moves[m][0]] = moves[m][1]; moved = true; }
}
if (!moved) return null;
}
return null;
}
function renumber(regions) {
var map = {}, next = 0;
regions.forEach(function (reg) { if (!(reg in map)) map[reg] = next++; });
return regions.map(function (reg) { return map[reg]; });
}
function colorBeds(n) { var c = []; for (var i = 0; i < n; i++) c.push(i % 8); return c; }
function generate(key, level, opts) {
level = level in SIZES ? level : 'sprout';
var n = SIZES[level], target = TIERS[level];
var R = core.rngFor('flowerbeds', level, key);
var maxAttempts = (opts && opts.maxAttempts) || 4000, fallback = null;
for (var attempt = 1; attempt <= maxAttempts; attempt++) {
R.mark();
var pos = randomFlowers(n, R);
var regions = makeUnique(n, pos, growRegions(n, pos, R), R);
if (!regions) continue;
var g = geometry(n, regions);
var empty = new Int8Array(n * n);
var res = solveLogic(g, empty, target);
if (!res.solved || res.maxTier !== target) {
if (res.solved && !fallback && attempt > maxAttempts / 2) fallback = null;
continue;
}
if (target > 1 && solveLogic(g, empty, target - 1).solved) continue;
if (countSolutions(g, 2) !== 1) continue;
return build(key, level, g, res.state, attempt);
}
throw new Error('flowerbeds: no puzzle for ' + key + ' ' + level);
}
function build(key, level, g, sol, attempts) {
return { type: 'flowerbeds', key: key, level: level, n: g.n, regions: g.regions, beds: BED_NAMES.slice(0, g.n),
colors: colorBeds(g.n, g.regions), solution: Array.from(sol), attempts: attempts, g: g };
}
function geom(p) { if (!p.g) p.g = geometry(p.n, p.regions); return p.g; }
function hint(p, user) {
var g = geom(p), sol = p.solution, wrong = [];
for (var k = 0; k < user.length; k++) {
if (user[k] === 1 && sol[k] !== 1) wrong.push(k);
if (user[k] === 2 && sol[k] === 1) wrong.push(k);
}
if (wrong.length) {
var w = wrong[0], name = cn(Math.floor(w / g.n), w % g.n);
return { kind: 'mistake', cells: [w], focus: [w], set: [],
text: user[w] === 1 ? 'The flower on ' + name + ' can’t be right: the puzzle’s only solution has no flower there. Remove it and ask again.'
: name + ' is marked empty, but the puzzle’s only solution has a flower there. Clear that mark and ask again.' };
}
var s = Int8Array.from(user);
if (isSolved(p, user)) return { kind: 'done', text: 'Every bed is planted – the puzzle is solved.', cells: [], focus: [], set: [] };
var st = nextStep(g, s, 3);
if (!st) {
var miss = sol.indexOf(1, 0), i2;
for (i2 = 0; i2 < sol.length; i2++) if (sol[i2] === 1 && user[i2] !== 1) { miss = i2; break; }
return { kind: 'reveal', cells: [miss], focus: [miss], set: [[miss, 1]], text: 'No single-step deduction is left from here, so here is one flower: ' + cn(Math.floor(miss / g.n), miss % g.n) + '.' };
}
return { kind: 'deduction', tech: st.tech, tier: st.tier, text: st.text, cells: st.mark, focus: st.focus, set: st.set };
}
function isSolved(p, user) {
for (var k = 0; k < p.solution.length; k++) if ((p.solution[k] === 1) !== (user[k] === 1)) return false;
return true;
}
function conflicts(p, user) {
var g = geom(p), out = {};
for (var k = 0; k < user.length; k++) if (user[k] === 1) g.near[k].forEach(function (x) { if (user[x] === 1) { out[x] = 1; out[k] = 1; } });
return Object.keys(out).map(Number);
}
return { name: 'Flower Beds', SIZES: SIZES, TIERS: TIERS, BED_NAMES: BED_NAMES, generate: generate, geometry: geometry, geom: geom,
solveLogic: solveLogic, countSolutions: countSolutions, hint: hint, isSolved: isSolved, conflicts: conflicts,
blockedBy: function (p, user) { return blockedBy(geom(p), user); }, nextStep: nextStep };
});
(function (root, factory) {
var core = typeof module !== 'undefined' && module.exports ? require('./core.js') : root.DLG.core;
var api = factory(core);
if (typeof module !== 'undefined' && module.exports) module.exports = api;
else root.DLG.tents = api;
})(this, function (core) {
'use strict';
var SIZES = { sprout: 6, bloom: 7, grove: 8 };
var TIERS = { sprout: 1, bloom: 2, grove: 3 };
var cn = core.cellName;
function geometry(n, trees, rowCount, colCount) {
var isTree = new Array(n * n).fill(false);
trees.forEach(function (t) { isTree[t] = true; });
var orth = [], ring = [];
for (var k = 0; k < n * n; k++) {
var r = Math.floor(k / n), c = k % n, o = [], a = [];
for (var dr = -1; dr <= 1; dr++) for (var dc = -1; dc <= 1; dc++) {
if (!dr && !dc) continue;
var rr = r + dr, cc = c + dc;
if (rr < 0 || cc < 0 || rr >= n || cc >= n) continue;
a.push(rr * n + cc);
if (!dr || !dc) o.push(rr * n + cc);
}
orth.push(o); ring.push(a);
}
var rows = [], cols = [];
for (var i = 0; i < n; i++) { rows.push([]); cols.push([]); }
for (k = 0; k < n * n; k++) { rows[Math.floor(k / n)].push(k); cols[k % n].push(k); }
var lines = [];
rows.forEach(function (cells, i) { lines.push({ kind: 'row', idx: i, cells: cells, count: rowCount[i], name: core.rowName(i) }); });
cols.forEach(function (cells, i) { lines.push({ kind: 'col', idx: i, cells: cells, count: colCount[i], name: core.colName(i) }); });
return { n: n, trees: trees, isTree: isTree, orth: orth, ring: ring, lines: lines, rowCount: rowCount, colCount: colCount };
}
function nm(g, k) { return cn(Math.floor(k / g.n), k % g.n); }
function cap(t) { return t.charAt(0).toUpperCase() + t.slice(1); }
function initial(g) { var s = new Int8Array(g.n * g.n); g.trees.forEach(function (t) { s[t] = 3; }); return s; }
function closure(g, s) {
for (var k = 0; k < s.length; k++) if (s[k] === 1) g.ring[k].forEach(function (x) { if (s[x] === 0) s[x] = 2; });
}
function count(s, cells, v) { var c = 0; cells.forEach(function (x) { if (s[x] === v) c++; }); return c; }
function open(s, cells) { return cells.filter(function (x) { return s[x] === 0; }); }
function claims(g, s) {
var tentOf = {}, treeOf = {}, changed = true;
while (changed) {
changed = false;
for (var k = 0; k < s.length; k++) {
if (s[k] === 1 && treeOf[k] === undefined) {
var tr = g.orth[k].filter(function (x) { return s[x] === 3 && tentOf[x] === undefined; });
if (tr.length === 1) { treeOf[k] = tr[0]; tentOf[tr[0]] = k; changed = true; }
} else if (s[k] === 3 && tentOf[k] === undefined) {
var free = g.orth[k].filter(function (x) { return s[x] === 0; });
var tn = g.orth[k].filter(function (x) { return s[x] === 1 && treeOf[x] === undefined; });
if (!free.length && tn.length === 1) { tentOf[k] = tn[0]; treeOf[tn[0]] = k; changed = true; }
}
}
}
return { tentOf: tentOf, treeOf: treeOf };
}
function noTree(g, s) {
var cells = [];
for (var k = 0; k < s.length; k++) if (s[k] === 0 && !g.orth[k].some(function (x) { return g.isTree[x]; })) cells.push(k);
if (!cells.length) return null;
return { tier: 1, tech: 'no-tree', set: cells.map(function (x) { return [x, 2]; }), focus: cells, mark: cells,
text: cells.length === 1 ? nm(g, cells[0]) + ' has no tree on any side, so it can never hold a tent – it is grass.'
: 'These ' + cells.length + ' squares have no tree on any side, so none of them can hold a tent – they are all grass.' };
}
function lineDone(g, s) {
for (var i = 0; i < g.lines.length; i++) {
var L = g.lines[i], t = count(s, L.cells, 1), o = open(s, L.cells);
if (!o.length) continue;
if (t === L.count) return { tier: 1, tech: 'line-full', set: o.map(function (x) { return [x, 2]; }), focus: L.cells, mark: o,
text: cap(L.name) + ' already has its ' + core.plural(L.count, 'tent') + ', so its remaining open squares are grass.' };
if (o.length === L.count - t) return { tier: 1, tech: 'line-fill', set: o.map(function (x) { return [x, 1]; }), focus: L.cells, mark: o,
text: cap(L.name) + ' needs ' + core.plural(L.count - t, 'more tent') + ' and has exactly ' + core.plural(o.length, 'open square') + ' left, so ' + (o.length === 1 ? 'it is a tent' : 'all of them are tents') + '.' };
}
return null;
}
function loneTree(g, s) {
for (var i = 0; i < g.trees.length; i++) {
var t = g.trees[i];
if (g.orth[t].some(function (x) { return s[x] === 1; })) continue;
var o = g.orth[t].filter(function (x) { return s[x] === 0; });
if (o.length === 1) return { tier: 1, tech: 'lone-tree', set: [[o[0], 1]], focus: [t, o[0]], mark: [o[0]],
text: 'The tree on ' + nm(g, t) + ' has no tent beside it yet and ' + nm(g, o[0]) + ' is its only open side, so the tent goes there.' };
}
return null;
}
function placements(cells, need, s, g) {
var out = [], pick = [];
(function rec(i) {
if (pick.length === need) { out.push(pick.slice()); return; }
if (out.length > 400) return;
for (var j = i; j < cells.length; j++) {
if (pick.length && g.ring[pick[pick.length - 1]].indexOf(cells[j]) >= 0) continue;
pick.push(cells[j]); rec(j + 1); pick.pop();
}
})(0);
return out;
}
function lineFit(g, s) {
for (var i = 0; i < g.lines.length; i++) {
var L = g.lines[i], o = open(s, L.cells), need = L.count - count(s, L.cells, 1);
if (!o.length || need <= 0) continue;
var ways = placements(o, need, s, g);
if (!ways.length || ways.length > 400) continue;
var always = o.filter(function (x) { return ways.every(function (w) { return w.indexOf(x) >= 0; }); });
var never = o.filter(function (x) { return ways.every(function (w) { return w.indexOf(x) < 0; }); });
if (always.length || never.length) {
var set = always.map(function (x) { return [x, 1]; }).concat(never.map(function (x) { return [x, 2]; }));
var parts = [];
if (always.length) parts.push('puts a tent on ' + core.listJoin(always.map(function (x) { return nm(g, x); })));
if (never.length) parts.push('leaves ' + core.listJoin(never.map(function (x) { return nm(g, x); })) + ' as grass');
return { tier: 2, tech: 'line-fit', set: set, focus: o, mark: always.concat(never),
text: cap(L.name) + ' still needs ' + core.plural(need, 'tent') + ', and because tents in a line can’t sit side by side, every way to fit ' + (need === 1 ? 'it' : 'them') + ' into its open squares ' + parts.join(' and ') + '.' };
}
}
return null;
}
function pairing(g, s) {
var c = claims(g, s);
for (var k = 0; k < s.length; k++) {
if (s[k] !== 0) continue;
var tr = g.orth[k].filter(function (x) { return s[x] === 3; });
if (tr.length && tr.every(function (x) { return c.tentOf[x] !== undefined; })) {
return { tier: 2, tech: 'pairing', set: [[k, 2]], focus: [k].concat(tr, tr.map(function (x) { return c.tentOf[x]; })), mark: [k],
text: 'Every tree next to ' + nm(g, k) + ' already has its own tent (' + tr.map(function (x) { return nm(g, x) + ' → ' + nm(g, c.tentOf[x]); }).join(', ') + '), so a tent on ' + nm(g, k) + ' would have no tree – it is grass.' };
}
}
for (var i = 0; i < g.trees.length; i++) {
var t = g.trees[i];
if (c.tentOf[t] !== undefined) continue;
var freeTents = g.orth[t].filter(function (x) { return s[x] === 1 && c.treeOf[x] === undefined; });
var o = g.orth[t].filter(function (x) { return s[x] === 0; });
if (!freeTents.length && o.length === 1) {
var others = g.orth[t].filter(function (x) { return s[x] === 1; });
return { tier: 2, tech: 'pairing', set: [[o[0], 1]], focus: [t, o[0]].concat(others), mark: [o[0]],
text: 'The tree on ' + nm(g, t) + ' still needs a tent of its own (' + (others.length ? 'the tent beside it belongs to another tree' : 'none is beside it') + '), and ' + nm(g, o[0]) + ' is its only open side, so the tent goes there.' };
}
}
return null;
}
function lookahead(g, s) {
var c = claims(g, s);
for (var k = 0; k < s.length; k++) {
if (s[k] !== 0) continue;
var t = Int8Array.from(s);
t[k] = 1;
g.ring[k].forEach(function (x) { if (t[x] === 0) t[x] = 2; });
for (var i = 0; i < g.lines.length; i++) {
var L = g.lines[i];
if (count(t, L.cells, 1) + open(t, L.cells).length < L.count) return { tier: 3, tech: 'lookahead', set: [[k, 2]], focus: [k].concat(L.cells), mark: [k],
text: 'A tent on ' + nm(g, k) + ' would turn the squares around it to grass and leave ' + L.name + ' too few open squares for its ' + core.plural(L.count, 'tent') + ', so ' + nm(g, k) + ' is grass.' };
}
for (i = 0; i < g.trees.length; i++) {
var tr = g.trees[i];
if (c.tentOf[tr] !== undefined || g.orth[tr].indexOf(k) >= 0) continue;
var ok = g.orth[tr].some(function (x) { return t[x] === 0 || (t[x] === 1 && c.treeOf[x] === undefined); });
if (!ok) return { tier: 3, tech: 'lookahead', set: [[k, 2]], focus: [k, tr].concat(g.orth[tr]), mark: [k],
text: 'A tent on ' + nm(g, k) + ' would turn the last free side of the tree on ' + nm(g, tr) + ' to grass and leave that tree without a tent, so ' + nm(g, k) + ' is grass.' };
}
}
return null;
}
var TECHNIQUES = [noTree, lineDone, loneTree, lineFit, pairing, lookahead];
var TECH_TIER = [1, 1, 1, 2, 2, 3];
function nextStep(g, s, maxTier) {
closure(g, s);
for (var i = 0; i < TECHNIQUES.length; i++) {
if (TECH_TIER[i] > maxTier) continue;
var st = TECHNIQUES[i](g, s);
if (st) return st;
}
return null;
}
function broken(g, s) {
for (var i = 0; i < g.lines.length; i++) {
var L = g.lines[i], t = count(s, L.cells, 1);
if (t > L.count || t + open(s, L.cells).length < L.count) return true;
}
for (var k = 0; k < s.length; k++) if (s[k] === 1 && g.ring[k].some(function (x) { return s[x] === 1; })) return true;
return false;
}
function solveLogic(g, start, maxTier) {
var s = Int8Array.from(start), used = 0, steps = 0;
for (;;) {
if (broken(g, s)) return { solved: false, state: s, maxTier: used, steps: steps, broken: true };
var st = nextStep(g, s, maxTier);
if (!st) break;
st.set.forEach(function (p) { s[p[0]] = p[1]; });
used = Math.max(used, st.tier); steps++;
}
var solved = !s.some(function (v) { return v === 0; }) && !broken(g, s) && hasMatching(g, s);
return { solved: solved, state: s, maxTier: used, steps: steps };
}
function hasMatching(g, s) {
var tents = [];
for (var k = 0; k < s.length; k++) if (s[k] === 1) tents.push(k);
if (tents.length !== g.trees.length) return false;
var matchTree = {};
function aug(t, seen) {
var adj = g.orth[t];
for (var i = 0; i < adj.length; i++) {
var tr = adj[i];
if (!g.isTree[tr] || seen[tr]) continue;
seen[tr] = 1;
if (matchTree[tr] === undefined || aug(matchTree[tr], seen)) { matchTree[tr] = t; return true; }
}
return false;
}
return tents.every(function (t) { return aug(t, {}); });
}
function countSolutions(g, limit) {
var n = g.n, s = initial(g), cnt = 0, colT = new Array(n).fill(0), colLeft = new Array(n).fill(0);
limit = limit || 2;
var cand = [];
for (var k = 0; k < n * n; k++) cand.push(!g.isTree[k] && g.orth[k].some(function (x) { return g.isTree[x]; }));
for (k = 0; k < n * n; k++) if (cand[k]) colLeft[k % n]++;
(function rec(k, rowT) {
if (cnt >= limit) return;
var r = Math.floor(k / n), c = k % n;
if (k === n * n) { if (colT.every(function (v, i) { return v === g.colCount[i]; }) && hasMatching(g, s)) cnt++; return; }
if (c === 0 && k > 0 && rowT !== g.rowCount[r - 1]) return;
if (c === 0) rowT = 0;
if (!cand[k]) { rec(k + 1, rowT); return; }
colLeft[c]--;
var touch = g.ring[k].some(function (x) { return x < k && s[x] === 1; });
if (!touch && rowT < g.rowCount[r] && colT[c] < g.colCount[c]) {
s[k] = 1; colT[c]++;
rec(k + 1, rowT + 1);
s[k] = 0; colT[c]--;
}
if (colT[c] + colLeft[c] >= g.colCount[c]) rec(k + 1, rowT);
colLeft[c]++;
})(0, 0);
return cnt;
}
function layout(n, R) {
var s = new Int8Array(n * n), target = Math.round(n * n / 5) + R.int(2), placed = 0, fails = 0;
var tmp = geometry(n, [], new Array(n).fill(0), new Array(n).fill(0));
while (placed < target && fails < 400) {
var k = R.int(n * n);
if (s[k] !== 0 || tmp.ring[k].some(function (x) { return s[x] === 1; })) { fails++; continue; }
var spots = tmp.orth[k].filter(function (x) { return s[x] === 0; });
if (!spots.length) { fails++; continue; }
s[k] = 1; s[R.pick(spots)] = 3; placed++;
}
var trees = [], rowCount = new Array(n).fill(0), colCount = new Array(n).fill(0);
for (k = 0; k < n * n; k++) {
if (s[k] === 3) trees.push(k);
if (s[k] === 1) { rowCount[Math.floor(k / n)]++; colCount[k % n]++; }
}
return { trees: trees, rowCount: rowCount, colCount: colCount, sol: s };
}
function generate(key, level, opts) {
level = level in SIZES ? level : 'sprout';
var n = SIZES[level], target = TIERS[level];
var R = core.rngFor('tents', level, key);
var maxAttempts = (opts && opts.maxAttempts) || 4000;
for (var attempt = 1; attempt <= maxAttempts; attempt++) {
R.mark();
var L = layout(n, R), g = geometry(n, L.trees, L.rowCount, L.colCount);
var res = solveLogic(g, initial(g), target);
if (!res.solved || res.maxTier !== target) continue;
if (target > 1 && solveLogic(g, initial(g), target - 1).solved) continue;
if (countSolutions(g, 2) !== 1) continue;
return { type: 'tents', key: key, level: level, n: n, trees: L.trees, rowCount: L.rowCount, colCount: L.colCount,
solution: Array.from(res.state), attempts: attempt, g: g };
}
throw new Error('tents: no puzzle for ' + key + ' ' + level);
}
function geom(p) { if (!p.g) p.g = geometry(p.n, p.trees, p.rowCount, p.colCount); return p.g; }
function hint(p, user) {
var g = geom(p), sol = p.solution;
for (var k = 0; k < user.length; k++) {
if (user[k] === 1 && sol[k] !== 1) return { kind: 'mistake', cells: [k], focus: [k], set: [], text: 'The tent on ' + nm(g, k) + ' can’t be right: the puzzle’s only solution has grass there. Remove it and ask again.' };
if (user[k] === 2 && sol[k] === 1) return { kind: 'mistake', cells: [k], focus: [k], set: [], text: nm(g, k) + ' is marked as grass, but the puzzle’s only solution has a tent there. Clear that mark and ask again.' };
}
if (isSolved(p, user)) return { kind: 'done', text: 'Every tree has its tent – the puzzle is solved.', cells: [], focus: [], set: [] };
var s = Int8Array.from(user);
p.trees.forEach(function (t) { s[t] = 3; });
var st = nextStep(g, s, 3);
if (!st) {
for (k = 0; k < sol.length; k++) if (sol[k] === 1 && user[k] !== 1) break;
return { kind: 'reveal', cells: [k], focus: [k], set: [[k, 1]], text: 'No single-step deduction is left from here, so here is one tent: ' + nm(g, k) + '.' };
}
return { kind: 'deduction', tech: st.tech, tier: st.tier, text: st.text, cells: st.mark, focus: st.focus, set: st.set };
}
function isSolved(p, user) {
for (var k = 0; k < p.solution.length; k++) if ((p.solution[k] === 1) !== (user[k] === 1)) return false;
return true;
}
function conflicts(p, user) {
var g = geom(p), out = {};
for (var k = 0; k < user.length; k++) if (user[k] === 1) g.ring[k].forEach(function (x) { if (user[x] === 1) { out[x] = 1; out[k] = 1; } });
return Object.keys(out).map(Number);
}
function blockedBy(p, user) {
var g = geom(p), out = [];
for (var k = 0; k < user.length; k++) if (user[k] === 1) g.ring[k].forEach(function (x) { if (user[x] === 0 && !g.isTree[x]) out.push(x); });
return out;
}
return { name: 'Tents & Trees', SIZES: SIZES, TIERS: TIERS, generate: generate, geometry: geometry, geom: geom, initial: initial,
solveLogic: solveLogic, countSolutions: countSolutions, hint: hint, isSolved: isSolved, conflicts: conflicts, blockedBy: blockedBy, nextStep: nextStep };
});
(function (root, factory) {
var core = typeof module !== 'undefined' && module.exports ? require('./core.js') : root.DLG.core;
var api = factory(core);
if (typeof module !== 'undefined' && module.exports) module.exports = api;
else root.DLG.sunshade = api;
})(this, function (core) {
'use strict';
var SIZES = { sprout: 6, bloom: 8, grove: 10 };
var TIERS = { sprout: 1, bloom: 2, grove: 3 };
var cn = core.cellName;
var WORD = ['', 'sun', 'shade'], WORDS = ['', 'suns', 'shades'];
function geometry(n) {
var lines = [];
for (var i = 0; i < n; i++) {
var row = [], col = [];
for (var j = 0; j < n; j++) { row.push(i * n + j); col.push(j * n + i); }
lines.push({ kind: 'row', idx: i, cells: row, name: core.rowName(i) });
lines.push({ kind: 'col', idx: i, cells: col, name: core.colName(i) });
}
var cross = [];
for (var k = 0; k < n * n; k++) cross.push([2 * Math.floor(k / n), 2 * (k % n) + 1]);
return { n: n, lines: lines, cross: cross };
}
function nm(g, k) { return cn(Math.floor(k / g.n), k % g.n); }
function cap(t) { return t.charAt(0).toUpperCase() + t.slice(1); }
function other(v) { return 3 - v; }
function pairRule(g, s) {
for (var l = 0; l < g.lines.length; l++) {
var c = g.lines[l].cells;
for (var i = 0; i + 1 < c.length; i++) {
var a = s[c[i]], b = s[c[i + 1]];
if (a && a === b) {
var ends = [];
if (i > 0 && s[c[i - 1]] === 0) ends.push(c[i - 1]);
if (i + 2 < c.length && s[c[i + 2]] === 0) ends.push(c[i + 2]);
if (ends.length) return { tier: 1, tech: 'pair', set: ends.map(function (x) { return [x, other(a)]; }), focus: [c[i], c[i + 1]].concat(ends), mark: ends,
text: nm(g, c[i]) + ' and ' + nm(g, c[i + 1]) + ' are both ' + WORDS[a] + ', so ' + core.listJoin(ends.map(function (x) { return nm(g, x); })) + (ends.length > 1 ? ' must be ' : ' must be ') + WORD[other(a)] + ' – otherwise three ' + WORDS[a] + ' would sit in a row.' };
}
}
}
return null;
}
function sandwich(g, s) {
for (var l = 0; l < g.lines.length; l++) {
var c = g.lines[l].cells;
for (var i = 0; i + 2 < c.length; i++) {
var a = s[c[i]];
if (a && s[c[i + 2]] === a && s[c[i + 1]] === 0) return { tier: 1, tech: 'sandwich', set: [[c[i + 1], other(a)]], focus: [c[i], c[i + 1], c[i + 2]], mark: [c[i + 1]],
text: nm(g, c[i + 1]) + ' sits between two ' + WORDS[a] + ', so it must be ' + WORD[other(a)] + ' – a ' + WORD[a] + ' there would make three in a row.' };
}
}
return null;
}
function countRule(g, s) {
var half = g.n / 2;
for (var l = 0; l < g.lines.length; l++) {
var L = g.lines[l], c = L.cells, open = c.filter(function (x) { return s[x] === 0; });
if (!open.length) continue;
for (var v = 1; v <= 2; v++) {
var have = c.filter(function (x) { return s[x] === v; }).length;
if (have === half) return { tier: 1, tech: 'count', set: open.map(function (x) { return [x, other(v)]; }), focus: c, mark: open,
text: cap(L.name) + ' already has its ' + half + ' ' + WORDS[v] + ', so every open square left in it is ' + WORD[other(v)] + '.' };
}
}
return null;
}
function completions(g, s, cells, limit) {
var n = g.n, half = n / 2, out = [], cur = cells.map(function (x) { return s[x]; });
var cnt = [0, 0, 0];
cur.forEach(function (v) { cnt[v]++; });
if (cnt[1] > half || cnt[2] > half) return out;
var vals = cur.slice();
(function rec(i, c1, c2) {
if (out.length >= limit) return;
if (i === n) { out.push(vals.slice()); return; }
var opts = cur[i] ? [cur[i]] : [1, 2];
for (var o = 0; o < opts.length; o++) {
var v = opts[o];
if (i >= 2 && vals[i - 1] === v && vals[i - 2] === v) continue;
var n1 = c1 + (v === 1 && !cur[i] ? 1 : 0), n2 = c2 + (v === 2 && !cur[i] ? 1 : 0);
if (n1 > half || n2 > half) continue;
vals[i] = v;
rec(i + 1, n1, n2);
vals[i] = cur[i];
}
})(0, cnt[1], cnt[2]);
return out;
}
var INFO = {};
function lineInfo(g, s, cells) {
var key = g.n + ':' + cells.map(function (x) { return s[x]; }).join('');
var hit = INFO[key];
if (hit) return hit;
var ways = completions(g, s, cells, 100000), forced = [];
for (var i = 0; i < cells.length; i++) {
var v = ways.length ? ways[0][i] : 0;
forced.push(ways.length && ways.every(function (w) { return w[i] === v; }) ? v : 0);
}
hit = { ways: ways.length, forced: forced };
INFO[key] = hit;
return hit;
}
function settled(g, s, L, ways) {
var c = L.cells, set = [];
for (var i = 0; i < c.length; i++) {
if (s[c[i]]) continue;
var v = ways[0][i];
if (ways.every(function (w) { return w[i] === v; })) set.push([c[i], v]);
}
return set;
}
function needText(g, s, L) {
var half = g.n / 2, c = L.cells;
var n1 = half - c.filter(function (x) { return s[x] === 1; }).length, n2 = half - c.filter(function (x) { return s[x] === 2; }).length;
return core.plural(n1, 'more sun') + ' and ' + core.plural(n2, 'more shade', 'more shades');
}
function describe(g, set) {
var groups = { 1: [], 2: [] };
set.forEach(function (p) { groups[p[1]].push(nm(g, p[0])); });
var parts = [];
if (groups[1].length) parts.push('sun on ' + core.listJoin(groups[1]));
if (groups[2].length) parts.push('shade on ' + core.listJoin(groups[2]));
return parts.join(' and ');
}
function remaining(g, s, L) {
var half = g.n / 2;
return [half - L.cells.filter(function (x) { return s[x] === 1; }).length, half - L.cells.filter(function (x) { return s[x] === 2; }).length];
}
function lastOne(g, s) { return lineEnum(g, s, true); }
function lineFull(g, s) { return lineEnum(g, s, false); }
function lineEnum(g, s, onlyLastOne) {
for (var l = 0; l < g.lines.length; l++) {
var L = g.lines[l];
if (!L.cells.some(function (x) { return s[x] === 0; })) continue;
var rem = remaining(g, s, L);
if (onlyLastOne && Math.min(rem[0], rem[1]) !== 1) continue;
var info = lineInfo(g, s, L.cells);
if (!info.ways) continue;
var set = [];
L.cells.forEach(function (x, i) { if (!s[x] && info.forced[i]) set.push([x, info.forced[i]]); });
if (set.length) return { tier: onlyLastOne ? 2 : 3, tech: onlyLastOne ? 'last-one' : 'line', set: set, focus: L.cells, mark: set.map(function (p) { return p[0]; }),
text: cap(L.name) + ' still needs ' + needText(g, s, L) + '; every way to finish it without three in a row puts ' + describe(g, set) + '.' };
}
return null;
}
function crossEnum(g, s) {
var feas = {};
function ok(k, v, lineIdx) {
var key = k * 3 + v + ':' + lineIdx;
if (!(key in feas)) {
var t = Int8Array.from(s); t[k] = v;
feas[key] = lineInfo(g, t, g.lines[lineIdx].cells).ways > 0;
}
return feas[key];
}
for (var l = 0; l < g.lines.length; l++) {
var L = g.lines[l];
if (!L.cells.some(function (x) { return s[x] === 0; })) continue;
var ways = completions(g, s, L.cells, 2000);
var good = ways.filter(function (w) {
return L.cells.every(function (x, i) {
if (s[x]) return true;
var crossLine = g.cross[x][0] === l ? g.cross[x][1] : g.cross[x][0];
return ok(x, w[i], crossLine);
});
});
if (!good.length || good.length === ways.length) continue;
var set = settled(g, s, L, good);
if (set.length) {
var crossNames = {};
ways.forEach(function (w) {
if (good.indexOf(w) >= 0) return;
L.cells.forEach(function (x, i) {
if (s[x]) return;
var cl = g.cross[x][0] === l ? g.cross[x][1] : g.cross[x][0];
if (!ok(x, w[i], cl)) crossNames[g.lines[cl].name] = 1;
});
});
var names = Object.keys(crossNames);
return { tier: 3, tech: 'cross', set: set, focus: L.cells.concat(set.map(function (p) { return p[0]; })), mark: set.map(function (p) { return p[0]; }),
text: 'Of the ways to finish ' + L.name + ', some would leave ' + core.listJoin(names.slice(0, 3)) + ' with no valid way to finish; all the ways that remain put ' + describe(g, set) + '.' };
}
}
return null;
}
var TECHNIQUES = [pairRule, sandwich, countRule, lastOne, lineFull, crossEnum];
var TECH_TIER = [1, 1, 1, 2, 3, 3];
function nextStep(g, s, maxTier) {
for (var i = 0; i < TECHNIQUES.length; i++) {
if (TECH_TIER[i] > maxTier) continue;
var st = TECHNIQUES[i](g, s);
if (st) return st;
}
return null;
}
function broken(g, s) {
for (var l = 0; l < g.lines.length; l++) if (!lineInfo(g, s, g.lines[l].cells).ways) return true;
return false;
}
function solveLogic(g, start, maxTier) {
var s = Int8Array.from(start), used = 0, steps = 0;
for (;;) {
var st = nextStep(g, s, maxTier);
if (!st) break;
st.set.forEach(function (p) { s[p[0]] = p[1]; });
used = Math.max(used, st.tier); steps++;
}
var solved = !s.some(function (v) { return v === 0; }) && !broken(g, s);
return { solved: solved, state: s, maxTier: used, steps: steps };
}
function validRows(n) {
var rows = [];
for (var m = 0; m < (1 << n); m++) {
var v = [], ones = 0, ok = true;
for (var i = 0; i < n; i++) { v.push((m >> i) & 1 ? 1 : 2); if (v[i] === 1) ones++; }
if (ones !== n / 2) continue;
for (i = 2; i < n && ok; i++) if (v[i] === v[i - 1] && v[i] === v[i - 2]) ok = false;
if (ok) rows.push(v);
}
return rows;
}
var ROWCACHE = {};
function rowsFor(n) { return ROWCACHE[n] || (ROWCACHE[n] = validRows(n)); }
function countSolutions(g, givens, limit) {
var n = g.n, half = n / 2, cnt = 0, grid = [], ones = new Array(n).fill(0);
limit = limit || 2;
var cand = [];
for (var r = 0; r < n; r++) cand.push(rowsFor(n).filter(function (row) {
for (var c = 0; c < n; c++) { var gv = givens[r * n + c]; if (gv && gv !== row[c]) return false; }
return true;
}));
(function rec(r) {
if (cnt >= limit) return;
if (r === n) { cnt++; return; }
var list = cand[r];
for (var i = 0; i < list.length; i++) {
var row = list[i], ok = true;
for (var c = 0; c < n && ok; c++) {
var o = ones[c] + (row[c] === 1 ? 1 : 0);
if (o > half || (r + 1 - o) > half) ok = false;
else if (r >= 2 && grid[r - 1][c] === row[c] && grid[r - 2][c] === row[c]) ok = false;
}
if (!ok) continue;
grid[r] = row;
for (c = 0; c < n; c++) if (row[c] === 1) ones[c]++;
rec(r + 1);
for (c = 0; c < n; c++) if (row[c] === 1) ones[c]--;
}
})(0);
return cnt;
}
function countFast(g, givens, limit) {
var cnt = 0;
limit = limit || 2;
(function rec(s) {
if (cnt >= limit) return;
var changed = true;
while (changed) {
changed = false;
for (var l = 0; l < g.lines.length; l++) {
var cells = g.lines[l].cells, info = lineInfo(g, s, cells);
if (!info.ways) return;
for (var i = 0; i < cells.length; i++) if (!s[cells[i]] && info.forced[i]) { s[cells[i]] = info.forced[i]; changed = true; }
}
}
var k = -1;
for (var x = 0; x < s.length; x++) if (!s[x]) { k = x; break; }
if (k < 0) { cnt++; return; }
var a = Int8Array.from(s); a[k] = 1; rec(a);
var b = Int8Array.from(s); b[k] = 2; rec(b);
})(Int8Array.from(givens));
return cnt;
}
function randomGrid(n, R) {
var rows = R.shuffle(rowsFor(n).slice()), grid = [], half = n / 2;
(function rec(r) {
if (r === n) return true;
for (var i = 0; i < rows.length; i++) {
var row = rows[i], ok = true;
for (var c = 0; c < n && ok; c++) {
if (r >= 2 && grid[r - 1][c] === row[c] && grid[r - 2][c] === row[c]) ok = false;
var ones = row[c] === 1 ? 1 : 0;
for (var rr = 0; rr < r; rr++) if (grid[rr][c] === 1) ones++;
if (ones > half || (r + 1 - ones) > half) ok = false;
}
if (!ok) continue;
grid[r] = row;
if (rec(r + 1)) return true;
}
return false;
})(0);
var out = [];
grid.forEach(function (row) { out = out.concat(row); });
return out;
}
function generate(key, level, opts) {
level = level in SIZES ? level : 'sprout';
var n = SIZES[level], target = TIERS[level], g = geometry(n);
var R = core.rngFor('sunshade', level, key);
var maxAttempts = (opts && opts.maxAttempts) || 200;
for (var attempt = 1; attempt <= maxAttempts; attempt++) {
R.mark();
var sol = randomGrid(n, R), givens = Int8Array.from(sol);
var order = R.shuffle(Array.from({ length: n * n }, function (_, i) { return i; }));
for (var i = 0; i < order.length; i++) {
var k = order[i], keep = givens[k];
givens[k] = 0;
if (!solveLogic(g, givens, target).solved) givens[k] = keep;
}
var res = solveLogic(g, givens, target);
if (res.maxTier !== target) continue;
if (target > 1 && solveLogic(g, givens, target - 1).solved) continue;
if (countFast(g, givens, 2) !== 1) continue;
return { type: 'sunshade', key: key, level: level, n: n, givens: Array.from(givens), solution: sol, attempts: attempt, g: g };
}
throw new Error('sunshade: no puzzle for ' + key + ' ' + level);
}
function geom(p) { if (!p.g) p.g = geometry(p.n); return p.g; }
function hint(p, user) {
var g = geom(p), sol = p.solution;
for (var k = 0; k < user.length; k++) {
if (user[k] && !p.givens[k] && user[k] !== sol[k]) return { kind: 'mistake', cells: [k], focus: [k], set: [],
text: nm(g, k) + ' can’t be ' + WORD[user[k]] + ': the puzzle’s only solution has ' + WORD[sol[k]] + ' there. Clear it and ask again.' };
}
if (isSolved(p, user)) return { kind: 'done', text: 'Every square is filled – the puzzle is solved.', cells: [], focus: [], set: [] };
var s = Int8Array.from(user);
p.givens.forEach(function (v, i) { if (v) s[i] = v; });
var st = nextStep(g, s, 3);
if (!st) {
for (k = 0; k < sol.length; k++) if (!s[k]) break;
return { kind: 'reveal', cells: [k], focus: [k], set: [[k, sol[k]]], text: 'No single-step deduction is left from here, so here is one square: ' + nm(g, k) + ' is ' + WORD[sol[k]] + '.' };
}
return { kind: 'deduction', tech: st.tech, tier: st.tier, text: st.text, cells: st.mark, focus: st.focus, set: st.set };
}
function isSolved(p, user) {
for (var k = 0; k < p.solution.length; k++) if ((p.givens[k] || user[k]) !== p.solution[k]) return false;
return true;
}
function conflicts(p, user) {
var g = geom(p), out = {}, s = p.givens.map(function (v, i) { return v || user[i]; });
g.lines.forEach(function (L) {
var c = L.cells;
for (var i = 0; i + 2 < c.length; i++) if (s[c[i]] && s[c[i]] === s[c[i + 1]] && s[c[i]] === s[c[i + 2]]) { out[c[i]] = out[c[i + 1]] = out[c[i + 2]] = 1; }
[1, 2].forEach(function (v) { if (c.filter(function (x) { return s[x] === v; }).length > g.n / 2) c.forEach(function (x) { if (s[x] === v) out[x] = 1; }); });
});
return Object.keys(out).map(Number);
}
return { name: 'Sun & Shade', SIZES: SIZES, TIERS: TIERS, generate: generate, geometry: geometry, geom: geom,
solveLogic: solveLogic, countSolutions: countSolutions, countFast: countFast, hint: hint, isSolved: isSolved, conflicts: conflicts, nextStep: nextStep };
});
(function (root, factory) {
var core = typeof module !== 'undefined' && module.exports ? require('./core.js') : root.DLG.core;
var api = factory(core);
if (typeof module !== 'undefined' && module.exports) module.exports = api;
else root.DLG.gardenpath = api;
})(this, function (core) {
'use strict';
var SIZES = { sprout: 5, bloom: 6, grove: 7 };
var TIERS = { sprout: 1, bloom: 2, grove: 3 };
var HEDGES = { sprout: 0, bloom: 0.25, grove: 0.15 };
var cn = core.cellName;
function geometry(n, stones, hedges) {
var edges = [], cellEdges = [], edgeAt = {};
for (var k = 0; k < n * n; k++) cellEdges.push([]);
for (k = 0; k < n * n; k++) {
var r = Math.floor(k / n), c = k % n;
if (c + 1 < n) add(k, k + 1);
if (r + 1 < n) add(k, k + n);
}
function add(a, b) { var id = edges.length; edges.push([a, b]); cellEdges[a].push(id); cellEdges[b].push(id); edgeAt[a + ',' + b] = edgeAt[b + ',' + a] = id; }
var stoneAt = new Array(n * n).fill(0), last = 0;
Object.keys(stones).forEach(function (cell) { stoneAt[+cell] = stones[cell]; last = Math.max(last, stones[cell]); });
var need = [];
for (k = 0; k < n * n; k++) need.push(stoneAt[k] === 1 || stoneAt[k] === last ? 1 : 2);
return { n: n, edges: edges, cellEdges: cellEdges, edgeAt: edgeAt, stoneAt: stoneAt, last: last, need: need, hedges: hedges || [] };
}
function blank(g) {
var s = new Int8Array(g.edges.length);
g.hedges.forEach(function (e) { s[e] = 2; });
return s;
}
function nm(g, k) { return cn(Math.floor(k / g.n), k % g.n); }
function edgeName(g, e) { return nm(g, g.edges[e][0]) + '–' + nm(g, g.edges[e][1]); }
function otherEnd(g, e, k) { return g.edges[e][0] === k ? g.edges[e][1] : g.edges[e][0]; }
function stoneTxt(g, k) { return g.stoneAt[k] ? 'stone ' + g.stoneAt[k] + ' (' + nm(g, k) + ')' : nm(g, k); }
function cnt(g, s, k, v) { var c = 0; g.cellEdges[k].forEach(function (e) { if (s[e] === v) c++; }); return c; }
function saturate(g, s) {
var changed = true;
while (changed) {
changed = false;
for (var k = 0; k < g.need.length; k++) {
if (cnt(g, s, k, 1) >= g.need[k]) g.cellEdges[k].forEach(function (e) { if (s[e] === 0) { s[e] = 2; changed = true; } });
}
}
}
function chains(g, s) {
var n2 = g.need.length, seen = new Array(n2).fill(false), out = [], chainOf = new Array(n2);
for (var k = 0; k < n2; k++) {
if (seen[k] || cnt(g, s, k, 1) === 2) continue;
var list = [k], prev = -1, cur = k;
seen[k] = true;
for (;;) {
var nx = -1;
g.cellEdges[cur].forEach(function (e) { if (s[e] === 1) { var o = otherEnd(g, e, cur); if (o !== prev) nx = o; } });
if (nx < 0 || seen[nx]) break;
prev = cur; cur = nx; seen[cur] = true; list.push(cur);
}
var id = out.length;
out.push(list);
list.forEach(function (x) { chainOf[x] = id; });
}
return { list: out, of: chainOf };
}
function chainOk(g, cells, total) {
var nums = [], i;
for (i = 0; i < cells.length; i++) if (g.stoneAt[cells[i]]) nums.push([i, g.stoneAt[cells[i]]]);
if (nums.length >= 2) {
var dir = nums[1][1] - nums[0][1];
if (dir !== 1 && dir !== -1) return false;
for (i = 1; i < nums.length; i++) if (nums[i][1] - nums[i - 1][1] !== dir) return false;
}
for (i = 0; i < nums.length; i++) {
var v = nums[i][1], pos = nums[i][0];
if ((v === 1 || v === g.last) && pos !== 0 && pos !== cells.length - 1) return false;
}
var has1 = nums.some(function (p) { return p[1] === 1; }), hasL = nums.some(function (p) { return p[1] === g.last; });
if (has1 && hasL && cells.length !== total) return false;
return true;
}
function forcedDegree(g, s) {
for (var k = 0; k < g.need.length; k++) {
var on = cnt(g, s, k, 1), un = cnt(g, s, k, 0);
if (un > 0 && on + un === g.need[k]) {
var es = g.cellEdges[k].filter(function (e) { return s[e] === 0; });
var nb = g.cellEdges[k].filter(function (e) { return s[e] !== 2; }).map(function (e) { return otherEnd(g, e, k); });
var text;
if (g.need[k] === 1) text = 'Stone ' + g.stoneAt[k] + ' is an end of the path and ' + nm(g, nb[0]) + ' is its only way out, so the path runs ' + nm(g, k) + ' → ' + nm(g, nb[0]) + '.';
else text = (g.stoneAt[k] ? 'Stone ' + g.stoneAt[k] + ' on ' + nm(g, k) : nm(g, k)) + ' has only two ways left to go – ' + nm(g, nb[0]) + ' and ' + nm(g, nb[1]) + ' – so the path must pass ' + nm(g, nb[0]) + ' → ' + nm(g, k) + ' → ' + nm(g, nb[1]) + '.';
return { tier: 1, tech: 'forced', set: es.map(function (e) { return [e, 1]; }), focus: [k].concat(nb), mark: [k], text: text };
}
}
return null;
}
function skipRule(g, s) {
for (var e = 0; e < g.edges.length; e++) {
if (s[e] !== 0) continue;
var a = g.stoneAt[g.edges[e][0]], b = g.stoneAt[g.edges[e][1]];
if (a && b && Math.abs(a - b) !== 1) return { tier: 1, tech: 'skip', set: [[e, 2]], focus: g.edges[e].slice(), mark: [], edge: e,
text: 'Stones ' + Math.min(a, b) + ' and ' + Math.max(a, b) + ' are not consecutive, so the path never steps directly between ' + edgeName(g, e) + '.' };
}
return null;
}
function noLoop(g, s) {
var ch = chains(g, s), total = g.need.length;
for (var e = 0; e < g.edges.length; e++) {
if (s[e] !== 0) continue;
var a = g.edges[e][0], b = g.edges[e][1];
if (ch.of[a] !== undefined && ch.of[a] === ch.of[b] && ch.list[ch.of[a]].length > 1) return { tier: 1, tech: 'loop', set: [[e, 2]], focus: ch.list[ch.of[a]].slice(), mark: [], edge: e,
text: nm(g, a) + ' and ' + nm(g, b) + ' are already the two ends of one stretch of path, so joining them would close a loop – that step is never used.' };
}
return null;
}
function orderRule(g, s) {
var ch = chains(g, s), total = g.need.length;
for (var e = 0; e < g.edges.length; e++) {
if (s[e] !== 0) continue;
var a = g.edges[e][0], b = g.edges[e][1];
var A = ch.list[ch.of[a]], B = ch.list[ch.of[b]];
if (!A || !B || A === B) continue;
var left = A[0] === a ? A.slice().reverse() : A.slice();
var right = B[0] === b ? B.slice() : B.slice().reverse();
if (left[left.length - 1] !== a || right[0] !== b) continue;
var merged = left.concat(right);
if (!chainOk(g, merged, total)) {
var sa = left.filter(function (x) { return g.stoneAt[x]; }).map(function (x) { return g.stoneAt[x]; });
var sb = right.filter(function (x) { return g.stoneAt[x]; }).map(function (x) { return g.stoneAt[x]; });
var why = sa.length && sb.length ? 'the stones ' + core.listJoin(sa.concat(sb).sort(function (x, y) { return x - y; }).map(String)) + ' would no longer come in order along it'
: 'an end stone would end up in the middle of the path';
return { tier: 3, tech: 'order', set: [[e, 2]], focus: left.concat(right), mark: [], edge: e,
text: 'Joining ' + nm(g, a) + ' to ' + nm(g, b) + ' would link two stretches of path so that ' + why + ', so that step is never used.' };
}
}
return null;
}
function reachable(g, s, from) {
var seen = {}, stack = [from], c = 0;
seen[from] = 1;
while (stack.length) {
var x = stack.pop(); c++;
g.cellEdges[x].forEach(function (e) { if (s[e] !== 2) { var o = otherEnd(g, e, x); if (!seen[o]) { seen[o] = 1; stack.push(o); } } });
}
return { count: c, seen: seen };
}
function bridge(g, s) {
for (var e = 0; e < g.edges.length; e++) {
if (s[e] !== 0) continue;
s[e] = 2;
var R = reachable(g, s, g.edges[e][0]);
s[e] = 0;
if (R.count < g.need.length) {
var cut = [];
for (var k = 0; k < g.need.length; k++) if (!R.seen[k]) cut.push(k);
var small = cut.length <= g.need.length - cut.length ? cut : Object.keys(R.seen).map(Number);
return { tier: 2, tech: 'bridge', set: [[e, 1]], focus: small, mark: g.edges[e].slice(), edge: e,
text: 'The ' + core.plural(small.length, 'square') + ' around ' + nm(g, small[0]) + ' can only be reached through the step ' + edgeName(g, e) + ', so the path must use it.' };
}
}
return null;
}
function deadEnd(g, s) {
for (var e = 0; e < g.edges.length; e++) {
if (s[e] !== 0) continue;
var t = Int8Array.from(s);
t[e] = 1;
saturate(g, t);
for (var k = 0; k < g.need.length; k++) if (cnt(g, t, k, 1) + cnt(g, t, k, 0) < g.need[k]) {
return { tier: 2, tech: 'dead-end', set: [[e, 2]], focus: [k].concat(g.edges[e]), mark: [k], edge: e,
text: 'Using the step ' + edgeName(g, e) + ' would take away a way in or out of ' + nm(g, k) + ' that it still needs, turning it into a dead end, so that step is never used.' };
}
}
return null;
}
function split(g, s) {
for (var e = 0; e < g.edges.length; e++) {
if (s[e] !== 0) continue;
var t = Int8Array.from(s);
t[e] = 1;
saturate(g, t);
var R = reachable(g, t, 0);
if (R.count < g.need.length) return { tier: 2, tech: 'split', set: [[e, 2]], focus: g.edges[e].slice(), mark: g.edges[e].slice(), edge: e,
text: 'Using the step ' + edgeName(g, e) + ' would use up the neighbouring squares’ last free connections and cut the garden into two parts that one path can’t both cover, so that step is never used.' };
}
return null;
}
var TECHNIQUES = [forcedDegree, skipRule, noLoop, bridge, deadEnd, split, orderRule];
var TECH_TIER = [1, 1, 1, 2, 2, 2, 3];
function nextStep(g, s, maxTier) {
saturate(g, s);
for (var i = 0; i < TECHNIQUES.length; i++) {
if (TECH_TIER[i] > maxTier) continue;
var st = TECHNIQUES[i](g, s);
if (st) return st;
}
return null;
}
function broken(g, s) {
for (var k = 0; k < g.need.length; k++) {
var on = cnt(g, s, k, 1);
if (on > g.need[k] || on + cnt(g, s, k, 0) < g.need[k]) return true;
}
var ch = chains(g, s);
for (var i = 0; i < ch.list.length; i++) if (!chainOk(g, ch.list[i], g.need.length)) return true;
var covered = 0;
ch.list.forEach(function (l) { covered += l.length; });
return covered < g.need.length;
}
function solveLogic(g, start, maxTier) {
var s = Int8Array.from(start), used = 0, steps = 0;
for (;;) {
if (broken(g, s)) return { solved: false, state: s, maxTier: used, steps: steps, broken: true };
var st = nextStep(g, s, maxTier);
if (!st) break;
st.set.forEach(function (p) { s[p[0]] = p[1]; });
used = Math.max(used, st.tier); steps++;
}
saturate(g, s);
var solved = !s.some(function (v) { return v === 0; }) && !broken(g, s);
return { solved: solved, state: s, maxTier: used, steps: steps };
}
function pathFromEdges(g, s) {
var start = g.stoneAt.indexOf(1), path = [start], prev = -1, cur = start;
for (var i = 1; i < g.need.length; i++) {
var nx = -1;
g.cellEdges[cur].forEach(function (e) { if (s[e] === 1) { var o = otherEnd(g, e, cur); if (o !== prev) nx = o; } });
if (nx < 0) break;
prev = cur; cur = nx; path.push(cur);
}
return path;
}
function countSolutions(g, limit) {
var n = g.n, N = n * n, visited = new Array(N).fill(false), count = 0;
limit = limit || 2;
var start = g.stoneAt.indexOf(1);
var blocked = {};
g.hedges.forEach(function (e) { blocked[e] = 1; });
function nbrs(k) { return g.cellEdges[k].filter(function (e) { return !blocked[e]; }).map(function (e) { return otherEnd(g, e, k); }); }
function connectedRest(from, left) {
var seen = {}, stack = [from], c = 0;
seen[from] = 1;
while (stack.length) {
var x = stack.pop();
nbrs(x).forEach(function (y) { if (!visited[y] && !seen[y]) { seen[y] = 1; c++; stack.push(y); } });
}
return c === left;
}
(function rec(k, depth, nextStone) {
if (count >= limit) return;
if (depth === N) { if (g.stoneAt[k] === g.last) count++; return; }
if (g.stoneAt[k] === g.last) return;
if (!connectedRest(k, N - depth)) return;
var ns = nbrs(k);
for (var i = 0; i < ns.length; i++) {
var y = ns[i];
if (visited[y]) continue;
var st = g.stoneAt[y];
if (st && st !== nextStone) continue;
visited[y] = true;
rec(y, depth + 1, st ? nextStone + 1 : nextStone);
visited[y] = false;
}
})(start, 1, (visited[start] = true, 2));
return count;
}
function randomPath(n, R) {
var path = [];
for (var r = 0; r < n; r++) for (var c = 0; c < n; c++) path.push(r * n + (r % 2 ? n - 1 - c : c));
var N = n * n, pos = new Array(N);
function index() { path.forEach(function (x, i) { pos[x] = i; }); }
index();
for (var it = 0; it < N * 40; it++) {
if (R.next() < 0.5) { path.reverse(); index(); }
var end = path[N - 1], er = Math.floor(end / n), ec = end % n;
var cand = [[er - 1, ec], [er + 1, ec], [er, ec - 1], [er, ec + 1]].filter(function (p) { return p[0] >= 0 && p[1] >= 0 && p[0] < n && p[1] < n; })
.map(function (p) { return p[0] * n + p[1]; }).filter(function (x) { return x !== path[N - 2]; });
if (!cand.length) continue;
var x = R.pick(cand), i = pos[x];
var tail = path.slice(i + 1).reverse();
path = path.slice(0, i + 1).concat(tail);
index();
}
return path;
}
function stonesFrom(path, idxs) {
var st = {};
idxs.slice().sort(function (a, b) { return a - b; }).forEach(function (i, j) { st[path[i]] = j + 1; });
return st;
}
function solvable(n, path, idxs, tier, hedges) {
var g = geometry(n, stonesFrom(path, idxs), hedges);
return solveLogic(g, blank(g), tier);
}
function generate(key, level, opts) {
level = level in SIZES ? level : 'sprout';
var n = SIZES[level], target = TIERS[level], N = n * n;
var R = core.rngFor('gardenpath', level, key);
var maxAttempts = (opts && opts.maxAttempts) || 400;
for (var attempt = 1; attempt <= maxAttempts; attempt++) {
R.mark();
var path = randomPath(n, R);
var idxs = [0, N - 1], guard = 0, hedges = [];
if (HEDGES[level]) {
var tmp = geometry(n, {}), onPath = {};
for (var q = 1; q < N; q++) onPath[tmp.edgeAt[path[q - 1] + ',' + path[q]]] = 1;
for (q = 0; q < tmp.edges.length; q++) if (!onPath[q] && R.next() < HEDGES[level]) hedges.push(q);
}
var want = Math.max(2, Math.round(n * (target === 1 ? 1.2 : 0.9)));
while (idxs.length < want) { var x = 1 + R.int(N - 2); if (idxs.indexOf(x) < 0) idxs.push(x); }
while (!solvable(n, path, idxs, target, hedges).solved && guard++ < N) {
var sorted = idxs.slice().sort(function (a, b) { return a - b; }), best = 0, at = 0;
for (var i = 1; i < sorted.length; i++) if (sorted[i] - sorted[i - 1] > best) { best = sorted[i] - sorted[i - 1]; at = sorted[i - 1]; }
if (best < 2) break;
idxs.push(at + 1 + R.int(best - 1));
}
if (!solvable(n, path, idxs, target, hedges).solved) continue;
var inner = R.shuffle(idxs.filter(function (i) { return i !== 0 && i !== N - 1; }));
for (i = 0; i < inner.length; i++) {
var trial = idxs.filter(function (v) { return v !== inner[i]; });
if (solvable(n, path, trial, target, hedges).solved) idxs = trial;
}
var stones = stonesFrom(path, idxs), g = geometry(n, stones, hedges);
var res = solveLogic(g, blank(g), target);
if (!res.solved || res.maxTier !== target) continue;
if (target > 1 && solveLogic(g, blank(g), target - 1).solved) continue;
if (countSolutions(g, 2) !== 1) continue;
return { type: 'gardenpath', key: key, level: level, n: n, stones: stones, hedges: hedges, solution: path, attempts: attempt, g: g };
}
throw new Error('gardenpath: no puzzle for ' + key + ' ' + level);
}
function geom(p) { if (!p.g) p.g = geometry(p.n, p.stones, p.hedges); return p.g; }
function edgeState(p, user) {
var g = geom(p), s = blank(g);
for (var i = 1; i < user.path.length; i++) {
var e = g.edgeAt[user.path[i - 1] + ',' + user.path[i]];
if (e !== undefined) s[e] = 1;
}
Object.keys(user.pencil || {}).forEach(function (e) { if (!s[e]) s[e] = user.pencil[e]; });
return s;
}
function solutionEdges(p) {
var g = geom(p), on = {};
for (var i = 1; i < p.solution.length; i++) on[g.edgeAt[p.solution[i - 1] + ',' + p.solution[i]]] = 1;
return on;
}
function hint(p, user) {
var g = geom(p), sol = p.solution;
for (var i = 0; i < user.path.length; i++) {
if (user.path[i] !== sol[i]) return { kind: 'mistake', cells: [user.path[i]], focus: [user.path[i - 1], user.path[i]], set: [],
text: 'The path leaves the only solution at ' + nm(g, user.path[i]) + ': from ' + nm(g, user.path[i - 1]) + ' it has to go elsewhere. Back up to ' + nm(g, user.path[i - 1]) + ' and ask again.' };
}
if (isSolved(p, user)) return { kind: 'done', text: 'The path covers the whole garden – the puzzle is solved.', cells: [], focus: [], set: [] };
var s = edgeState(p, user), solOn = solutionEdges(p);
var st = nextStep(g, s, 3);
while (st && st.set.every(function (q) { return s[q[0]] === q[1]; })) st = null;
if (!st) {
var nx = sol[user.path.length], e = g.edgeAt[sol[user.path.length - 1] + ',' + nx];
return { kind: 'reveal', cells: [nx], focus: [nx], set: [[e, 1]], text: 'No single-step deduction is left from here, so here is the next step: ' + nm(g, sol[user.path.length - 1]) + ' → ' + nm(g, nx) + '.' };
}
return { kind: 'deduction', tech: st.tech, tier: st.tier, text: st.text, cells: st.mark, focus: st.focus, set: st.set, edges: true };
}
function isSolved(p, user) {
if (user.path.length !== p.solution.length) return false;
for (var i = 0; i < user.path.length; i++) if (user.path[i] !== p.solution[i]) return false;
return true;
}
return { name: 'Garden Path', SIZES: SIZES, TIERS: TIERS, generate: generate, geometry: geometry, geom: geom,
solveLogic: solveLogic, countSolutions: countSolutions, hint: hint, isSolved: isSolved, edgeState: edgeState,
solutionEdges: solutionEdges, pathFromEdges: pathFromEdges, nextStep: nextStep, saturate: saturate };
});
(function (root, factory) {
var core = typeof module !== 'undefined' && module.exports ? require('./core.js') : root.DLG.core;
var api = factory(core);
if (typeof module !== 'undefined' && module.exports) module.exports = api;
else root.DLG.whoplanted = api;
})(this, function (core) {
'use strict';
var NAMES = ['Ada', 'Bram', 'Cleo', 'Dev', 'Elif', 'Finn', 'Greta', 'Hugo', 'Ines', 'Jun', 'Kofi', 'Lena', 'Milo', 'Nora', 'Omar', 'Pia', 'Rosa', 'Sami', 'Tove', 'Wren'];
var PLANTS = ['tulips', 'basil', 'kale', 'peas', 'dahlias', 'tomatoes', 'lavender', 'chives', 'sunflowers', 'radishes', 'marigolds', 'beans'];
var DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
var CFG = {
sprout: { cats: ['who', 'plant', 'bed'], weights: { is: 2, not: 3, either: 1, before: 1 } },
bloom: { cats: ['who', 'plant', 'bed', 'day'], weights: { is: 1, not: 3, either: 2, before: 2, next: 1, after: 1 } },
grove: { cats: ['who', 'plant', 'bed', 'day'], weights: { not: 3, either: 2, before: 2, next: 2, after: 2 } }
};
var TIERS = { sprout: 1, bloom: 2, grove: 3 };
var M = 4;
var ORDERED = { bed: true, day: true };
function cap(t) { return t.charAt(0).toUpperCase() + t.slice(1); }
function geometry(p) {
var C = p.cats.length, pairs = [], pairIdx = {};
for (var a = 0; a < C; a++) for (var b = a + 1; b < C; b++) { pairIdx[a + ',' + b] = pairs.length; pairs.push([a, b]); }
return { C: C, m: p.m, pairs: pairs, pairIdx: pairIdx, size: pairs.length * p.m * p.m, p: p };
}
function idx(g, a, i, b, j) {
if (a > b) { var t = a; a = b; b = t; t = i; i = j; j = t; }
return g.pairIdx[a + ',' + b] * g.m * g.m + i * g.m + j;
}
function cellInfo(g, k) {
var mm = g.m * g.m, pr = g.pairs[Math.floor(k / mm)], r = k % mm;
return { a: pr[0], i: Math.floor(r / g.m), b: pr[1], j: r % g.m };
}
function label(p, c, j) {
var kind = p.cats[c], it = p.items[c][j];
if (kind === 'who') return it;
if (kind === 'plant') return cap(it);
if (kind === 'bed') return 'Bed ' + it;
return it;
}
function phrase(p, c, j) { return p.cats[c] === 'plant' ? 'the ' + p.items[c][j] : label(p, c, j); }
function subj(p, d) {
var kind = p.cats[d[0]], it = p.items[d[0]][d[1]];
if (kind === 'who') return it;
if (kind === 'plant') return 'the person who planted the ' + it;
if (kind === 'bed') return 'the gardener in Bed ' + it;
return 'the person who planted on ' + it;
}
function pred(p, d, neg) {
var kind = p.cats[d[0]], it = p.items[d[0]][d[1]];
if (kind === 'who') return (neg ? 'is not ' : 'is ') + it;
if (kind === 'plant') return (neg ? 'did not plant the ' : 'planted the ') + it;
if (kind === 'bed') return (neg ? 'did not work in Bed ' : 'worked in Bed ') + it;
return (neg ? 'did not plant on ' : 'planted on ') + it;
}
function eitherPred(p, alts) {
var kind = p.cats[alts[0][0]], a = p.items[alts[0][0]][alts[0][1]], b = p.items[alts[1][0]][alts[1][1]];
if (kind === 'plant') return 'planted either the ' + a + ' or the ' + b;
if (kind === 'bed') return 'worked in either Bed ' + a + ' or Bed ' + b;
if (kind === 'day') return 'planted on either ' + a + ' or ' + b;
return 'is either ' + a + ' or ' + b;
}
function clueText(p, cl) {
var x = cl.x, y = cl.y;
if (cl.type === 'is' || cl.type === 'not') {
if (p.cats[y[0]] === 'who' || (p.cats[x[0]] !== 'who' && x[0] > y[0])) { var t = x; x = y; y = t; }
return cap(subj(p, x)) + ' ' + pred(p, y, cl.type === 'not') + '.';
}
if (cl.type === 'either') return cap(subj(p, x)) + ' ' + eitherPred(p, cl.alts) + '.';
var O = p.cats[cl.o];
if (cl.type === 'before') return O === 'bed' ? cap(subj(p, x)) + ' worked in a bed closer to the gate than ' + subj(p, y) + ' did.'
: cap(subj(p, x)) + ' planted earlier in the week than ' + subj(p, y) + ' did.';
if (cl.type === 'next') return O === 'bed' ? cap(subj(p, x)) + ' and ' + subj(p, y) + ' worked in neighboring beds.'
: cap(subj(p, x)) + ' and ' + subj(p, y) + ' planted on consecutive days.';
return O === 'bed' ? cap(subj(p, y)) + ' worked in the bed right after ' + (p.cats[x[0]] === 'who' ? p.items[x[0]][x[1]] + '’s' : 'that of ' + subj(p, x)) + ', one step farther from the gate.'
: cap(subj(p, y)) + ' planted the day after ' + subj(p, x) + ' did.';
}
function entityOf(attr, d) { return attr[d[0]].indexOf(d[1]); }
function holds(attr, cl) {
if (cl.type === 'is') return entityOf(attr, cl.x) === entityOf(attr, cl.y);
if (cl.type === 'not') return entityOf(attr, cl.x) !== entityOf(attr, cl.y);
var ex = entityOf(attr, cl.x);
if (cl.type === 'either') return cl.alts.some(function (a) { return attr[a[0]][ex] === a[1]; });
var ey = entityOf(attr, cl.y);
if (ex === ey) return false;
var px = attr[cl.o][ex], py = attr[cl.o][ey];
if (cl.type === 'before') return px < py;
if (cl.type === 'next') return Math.abs(px - py) === 1;
return py === px + 1;
}
function perms(m) {
var out = [];
(function rec(a, used) {
if (a.length === m) { out.push(a.slice()); return; }
for (var i = 0; i < m; i++) if (!used[i]) { used[i] = 1; a.push(i); rec(a, used); a.pop(); used[i] = 0; }
})([], {});
return out;
}
function countSolutions(p, limit) {
var P = perms(p.m), C = p.cats.length, attr = [P[0]], count = 0;
limit = limit || 2;
(function rec(c) {
if (count >= limit) return;
if (c === C) { if (p.clues.every(function (cl) { return holds(attr, cl); })) count++; return; }
for (var i = 0; i < P.length && count < limit; i++) { attr[c] = P[i]; rec(c + 1); }
})(1);
return count;
}
function clueNo(p, cl) { return 'Clue ' + (p.clues.indexOf(cl) + 1); }
function step(tier, tech, set, focus, text) { return { tier: tier, tech: tech, set: set, focus: focus, mark: set.map(function (q) { return q[0]; }), text: text }; }
function direct(g, s) {
var p = g.p;
for (var c = 0; c < p.clues.length; c++) {
var cl = p.clues[c], k;
if (cl.type === 'is') { k = idx(g, cl.x[0], cl.x[1], cl.y[0], cl.y[1]); if (s[k] === 0) return step(1, 'clue', [[k, 1]], [k], clueNo(p, cl) + ' says it directly: ' + clueText(p, cl) + ' Mark that square ●.'); }
if (cl.type === 'not') { k = idx(g, cl.x[0], cl.x[1], cl.y[0], cl.y[1]); if (s[k] === 0) return step(1, 'clue', [[k, 2]], [k], clueNo(p, cl) + ' says it directly: ' + clueText(p, cl) + ' Mark that square ✕.'); }
if (cl.type === 'either') {
var d = cl.alts[0][0], set = [];
for (var j = 0; j < p.m; j++) if (j !== cl.alts[0][1] && j !== cl.alts[1][1]) { k = idx(g, cl.x[0], cl.x[1], d, j); if (s[k] === 0) set.push([k, 2]); }
if (set.length) return step(1, 'clue', set, set.map(function (q) { return q[0]; }), clueNo(p, cl) + ' leaves ' + subj(p, cl.x) + ' only two options (' + eitherPred(p, cl.alts).replace(/^(planted on|planted|worked in|is) either /, '') + '), so every other ' + catWord(p, d) + ' is ruled out.');
}
if (cl.x && cl.y && cl.x[0] !== cl.y[0] && cl.type !== 'is' && cl.type !== 'not' && cl.type !== 'either') {
k = idx(g, cl.x[0], cl.x[1], cl.y[0], cl.y[1]);
if (s[k] === 0) return step(1, 'clue', [[k, 2]], [k], clueNo(p, cl) + ' compares ' + subj(p, cl.x) + ' with ' + subj(p, cl.y) + ', so they are two different people.');
}
}
return null;
}
function elim(g, s) {
var p = g.p, m = g.m;
for (var q = 0; q < g.pairs.length; q++) {
var a = g.pairs[q][0], b = g.pairs[q][1];
for (var dir = 0; dir < 2; dir++) {
for (var i = 0; i < m; i++) {
var line = [];
for (var j = 0; j < m; j++) line.push(dir === 0 ? idx(g, a, i, b, j) : idx(g, a, j, b, i));
var yes = line.filter(function (k) { return s[k] === 1; }), open = line.filter(function (k) { return s[k] === 0; });
var owner = dir === 0 ? [a, i] : [b, i], otherCat = dir === 0 ? b : a;
if (yes.length === 1 && open.length) {
var ci = cellInfo(g, yes[0]), partner = ci.a === owner[0] ? [ci.b, ci.j] : [ci.a, ci.i];
return step(1, 'one-each', open.map(function (k) { return [k, 2]; }), line, cap(subj(p, owner)) + ' ' + pred(p, partner) + ', so no other ' + catWord(p, otherCat) + ' is possible for ' + subj(p, owner) + '.');
}
if (!yes.length && open.length === 1) {
var c2 = cellInfo(g, open[0]), part = c2.a === owner[0] ? [c2.b, c2.j] : [c2.a, c2.i];
return step(1, 'one-each', [[open[0], 1]], line, 'Every other ' + catWord(p, otherCat) + ' is ruled out for ' + subj(p, owner) + ', so ' + subj(p, owner) + ' ' + pred(p, part) + '.');
}
}
}
}
return null;
}
function catWord(p, c) { return { who: 'gardener', plant: 'crop', bed: 'bed', day: 'day' }[p.cats[c]]; }
function transfer(g, s) {
var p = g.p, m = g.m, C = g.C;
for (var a = 0; a < C; a++) for (var b = 0; b < C; b++) {
if (a === b) continue;
for (var i = 0; i < m; i++) for (var j = 0; j < m; j++) {
if (s[idx(g, a, i, b, j)] !== 1) continue;
for (var c = 0; c < C; c++) {
if (c === a || c === b) continue;
for (var k = 0; k < m; k++) {
var ka = idx(g, a, i, c, k), kb = idx(g, b, j, c, k);
if (s[ka] === 0 && s[kb] !== 0) {
var X = [a, i], Y = [b, j], Z = [c, k];
return step(1, 'transfer', [[ka, s[kb]]], [idx(g, a, i, b, j), kb, ka],
cap(subj(p, X)) + ' ' + pred(p, Y) + ', and ' + subj(p, Y) + ' ' + pred(p, Z, s[kb] === 2) + ', so ' + subj(p, X) + ' ' + pred(p, Z, s[kb] === 2) + ' either.'.replace(' either.', s[kb] === 2 ? ' either.' : ' too.'));
}
}
}
}
}
return null;
}
function either(g, s) {
var p = g.p;
for (var c = 0; c < p.clues.length; c++) {
var cl = p.clues[c];
if (cl.type !== 'either') continue;
var k0 = idx(g, cl.x[0], cl.x[1], cl.alts[0][0], cl.alts[0][1]), k1 = idx(g, cl.x[0], cl.x[1], cl.alts[1][0], cl.alts[1][1]);
if (s[k0] === 2 && s[k1] === 0) return step(2, 'either', [[k1, 1]], [k0, k1], clueNo(p, cl) + ': ' + subj(p, cl.x) + ' ' + eitherPred(p, cl.alts) + '; the first option is ruled out, so ' + subj(p, cl.x) + ' ' + pred(p, cl.alts[1]) + '.');
if (s[k1] === 2 && s[k0] === 0) return step(2, 'either', [[k0, 1]], [k0, k1], clueNo(p, cl) + ': ' + subj(p, cl.x) + ' ' + eitherPred(p, cl.alts) + '; the second option is ruled out, so ' + subj(p, cl.x) + ' ' + pred(p, cl.alts[0]) + '.');
}
return null;
}
function bounds(g, s) {
var p = g.p, m = g.m;
for (var c = 0; c < p.clues.length; c++) {
var cl = p.clues[c];
if (cl.type !== 'before' && cl.type !== 'after') continue;
var kx = idx(g, cl.x[0], cl.x[1], cl.o, m - 1), ky = idx(g, cl.y[0], cl.y[1], cl.o, 0);
var word = p.cats[cl.o] === 'bed' ? ['in Bed ' + p.items[cl.o][m - 1] + ', the bed farthest from the gate', 'in Bed 1, the bed nearest the gate'] : ['on ' + p.items[cl.o][m - 1] + ', the last day', 'on ' + p.items[cl.o][0] + ', the first day'];
if (s[kx] === 0) return step(2, 'ends', [[kx, 2]], [kx], clueNo(p, cl) + ' puts someone after ' + subj(p, cl.x) + ', so ' + subj(p, cl.x) + ' can’t be ' + word[0] + '.');
if (s[ky] === 0) return step(2, 'ends', [[ky, 2]], [ky], clueNo(p, cl) + ' puts someone before ' + subj(p, cl.y) + ', so ' + subj(p, cl.y) + ' can’t be ' + word[1] + '.');
}
return null;
}
function possTransfer(g, s) {
var p = g.p, m = g.m, C = g.C;
for (var a = 0; a < C; a++) for (var i = 0; i < m; i++) for (var b = 0; b < C; b++) {
if (b === a) continue;
var B = [];
for (var j = 0; j < m; j++) if (s[idx(g, a, i, b, j)] !== 2) B.push(j);
if (B.length < 2 || B.length > 3) continue;
for (var c = 0; c < C; c++) {
if (c === a || c === b) continue;
for (var k = 0; k < m; k++) {
var t = idx(g, a, i, c, k);
if (s[t] !== 0) continue;
if (B.every(function (jj) { return s[idx(g, b, jj, c, k)] === 2; })) {
var opts = core.listJoin(B.map(function (jj) { return label(p, b, jj); })).replace(/ and ([^,]*)$/, ' or $1');
return step(2, 'either-way', [[t, 2]], [t].concat(B.map(function (jj) { return idx(g, b, jj, c, k); })),
'For ' + subj(p, [a, i]) + ' the ' + catWord(p, b) + ' can only be ' + opts + ', and none of ' + (B.length === 2 ? 'those two' : 'those') + ' goes with ' + phrase(p, c, k) + ', so ' + subj(p, [a, i]) + ' ' + pred(p, [c, k], true) + '.');
}
}
}
}
return null;
}
function at(p, o, q) { return (p.cats[o] === 'bed' ? 'in Bed ' : 'on ') + p.items[o][q]; }
function positions(g, s, d, o) {
var out = [];
for (var q = 0; q < g.m; q++) if (s[idx(g, d[0], d[1], o, q)] !== 2) out.push(q);
return out;
}
function rel(type, a, b) { return type === 'before' ? a < b : type === 'next' ? Math.abs(a - b) === 1 : b === a + 1; }
function orderFit(g, s) {
var p = g.p;
for (var c = 0; c < p.clues.length; c++) {
var cl = p.clues[c];
if (cl.type !== 'before' && cl.type !== 'next' && cl.type !== 'after') continue;
var px = positions(g, s, cl.x, cl.o), py = positions(g, s, cl.y, cl.o);
var badX = px.filter(function (a) { return !py.some(function (b) { return a !== b && rel(cl.type, a, b); }); });
var badY = py.filter(function (b) { return !px.some(function (a) { return a !== b && rel(cl.type, a, b); }); });
var who = badX.length ? cl.x : cl.y, bad = badX.length ? badX : badY, other = badX.length ? py : px;
if (!bad.length) continue;
var set = bad.map(function (q) { return [idx(g, who[0], who[1], cl.o, q), 2]; });
var lbl = function (q) { return label(p, cl.o, q); };
var otherWhere = (p.cats[cl.o] === 'bed' ? 'in ' : 'on ') + core.listJoin(other.map(lbl)).replace(/ and ([^,]*)$/, ' or $1');
return step(3, 'fit', set, set.map(function (q) { return q[0]; }).concat(other.map(function (q) { return idx(g, (who === cl.x ? cl.y : cl.x)[0], (who === cl.x ? cl.y : cl.x)[1], cl.o, q); })),
clueNo(p, cl) + ' (' + clueText(p, cl).replace(/\.$/, '') + ') can only fit if ' + subj(p, who === cl.x ? cl.y : cl.x) + ' is ' + otherWhere + ', which rules out ' + core.listJoin(bad.map(lbl)) + ' for ' + subj(p, who) + '.');
}
return null;
}
var TECHNIQUES = [direct, elim, transfer, either, bounds, possTransfer, orderFit];
var TECH_TIER = [1, 1, 1, 2, 2, 2, 3];
function nextStep(g, s, maxTier) {
for (var i = 0; i < TECHNIQUES.length; i++) {
if (TECH_TIER[i] > maxTier) continue;
var st = TECHNIQUES[i](g, s);
if (st) return st;
}
return null;
}
function solveLogic(g, start, maxTier) {
var s = Int8Array.from(start), used = 0, steps = 0;
for (;;) {
var st = nextStep(g, s, maxTier);
if (!st) break;
st.set.forEach(function (q) { s[q[0]] = q[1]; });
used = Math.max(used, st.tier); steps++;
if (steps > 2000) break;
}
return { solved: !s.some(function (v) { return v === 0; }), state: s, maxTier: used, steps: steps };
}
function solutionGrid(g, attr) {
var s = new Int8Array(g.size);
for (var k = 0; k < g.size; k++) {
var ci = cellInfo(g, k), e = attr[ci.a].indexOf(ci.i);
s[k] = attr[ci.b][e] === ci.j ? 1 : 2;
}
return s;
}
function cluePool(p, attr, R) {
var C = p.cats.length, m = p.m, pool = { is: [], not: [], either: [], before: [], next: [], after: [] };
var descs = [];
for (var c = 0; c < C; c++) for (var j = 0; j < m; j++) descs.push([c, j]);
descs.forEach(function (x) {
descs.forEach(function (y) {
if (x[0] >= y[0]) return;
var same = entityOf(attr, x) === entityOf(attr, y);
(same ? pool.is : pool.not).push({ type: same ? 'is' : 'not', x: x, y: y });
});
for (var d = 0; d < C; d++) {
if (d === x[0] || p.cats[d] === 'who') continue;
var e = entityOf(attr, x), t = attr[d][e];
var decoys = [];
for (var j2 = 0; j2 < m; j2++) if (j2 !== t) decoys.push(j2);
var dec = R.pick(decoys), alts = t < dec ? [[d, t], [d, dec]] : [[d, dec], [d, t]];
pool.either.push({ type: 'either', x: x, alts: alts });
}
});
for (var o = 0; o < C; o++) {
if (!ORDERED[p.cats[o]]) continue;
descs.forEach(function (x) {
descs.forEach(function (y) {
if (x[0] === o || y[0] === o) return;
var ex = entityOf(attr, x), ey = entityOf(attr, y);
if (ex === ey) return;
var px = attr[o][ex], py = attr[o][ey];
if (px < py) pool.before.push({ type: 'before', x: x, y: y, o: o });
if (Math.abs(px - py) === 1 && x[0] <= y[0] && (x[0] < y[0] || x[1] < y[1])) pool.next.push({ type: 'next', x: x, y: y, o: o });
if (py === px + 1) pool.after.push({ type: 'after', x: x, y: y, o: o });
});
});
}
return pool;
}
function generate(key, level, opts) {
level = level in CFG ? level : 'sprout';
var cfg = CFG[level], target = TIERS[level];
var R = core.rngFor('whoplanted', level, key);
var maxAttempts = (opts && opts.maxAttempts) || 300;
for (var attempt = 1; attempt <= maxAttempts; attempt++) {
R.mark();
var p = { type: 'whoplanted', key: key, level: level, m: M, cats: cfg.cats.slice(), items: [], clues: [] };
p.cats.forEach(function (kind) {
if (kind === 'who') p.items.push(R.shuffle(NAMES.slice()).slice(0, M).sort());
else if (kind === 'plant') p.items.push(R.shuffle(PLANTS.slice()).slice(0, M).sort());
else if (kind === 'bed') p.items.push(['1', '2', '3', '4'].slice(0, M));
else p.items.push(DAYS.slice(0, M));
});
var attr = [];
p.cats.forEach(function (kind, c) { attr.push(c === 0 ? [0, 1, 2, 3].slice(0, M) : R.shuffle([0, 1, 2, 3].slice(0, M))); });
var pool = cluePool(p, attr, R), types = [];
Object.keys(cfg.weights).forEach(function (t) { for (var w = 0; w < cfg.weights[t]; w++) types.push(t); });
var g = geometry(p), solved = false;
for (var guard = 0; guard < 60 && !solved; guard++) {
var t = R.pick(types);
if (!pool[t].length) continue;
var cl = pool[t].splice(R.int(pool[t].length), 1)[0];
p.clues.push(cl);
solved = solveLogic(g, new Int8Array(g.size), target).solved;
}
if (!solved) continue;
for (var i = p.clues.length - 1; i >= 0; i--) {
var keep = p.clues.splice(i, 1)[0];
if (!solveLogic(g, new Int8Array(g.size), target).solved) p.clues.splice(i, 0, keep);
}
var res = solveLogic(g, new Int8Array(g.size), target);
if (!res.solved || res.maxTier !== target) continue;
if (target > 1 && solveLogic(g, new Int8Array(g.size), target - 1).solved) continue;
if (countSolutions(p, 2) !== 1) continue;
p.clues = R.shuffle(p.clues);
p.attr = attr;
p.solution = Array.from(solutionGrid(g, attr));
p.attempts = attempt;
p.g = g;
p.clueTexts = p.clues.map(function (c) { return clueText(p, c); });
return p;
}
throw new Error('whoplanted: no puzzle for ' + key + ' ' + level);
}
function geom(p) { if (!p.g) p.g = geometry(p); return p.g; }
function hint(p, user) {
var g = geom(p), sol = p.solution;
for (var k = 0; k < user.length; k++) {
if (user[k] && user[k] !== sol[k]) {
var ci = cellInfo(g, k);
return { kind: 'mistake', cells: [k], focus: [k], set: [], text: 'The ' + (user[k] === 1 ? '●' : '✕') + ' for ' + label(p, ci.a, ci.i) + ' / ' + label(p, ci.b, ci.j) + ' doesn’t match the only solution. Clear it and ask again.' };
}
}
if (isSolved(p, user)) return { kind: 'done', text: 'Every gardener is matched – the puzzle is solved.', cells: [], focus: [], set: [] };
var st = nextStep(g, Int8Array.from(user), 3);
if (!st) {
for (k = 0; k < sol.length; k++) if (sol[k] === 1 && user[k] !== 1) break;
var c3 = cellInfo(g, k);
return { kind: 'reveal', cells: [k], focus: [k], set: [[k, 1]], text: 'No single-step deduction is left from here, so here is one match: ' + phrase(p, c3.a, c3.i) + ' goes with ' + phrase(p, c3.b, c3.j) + '.' };
}
return { kind: 'deduction', tech: st.tech, tier: st.tier, text: st.text, cells: st.mark, focus: st.focus, set: st.set };
}
function isSolved(p, user) {
var g = geom(p);
for (var k = 0; k < p.solution.length; k++) {
var ci = cellInfo(g, k);
if (ci.a !== 0) continue;
if ((user[k] === 1) !== (p.solution[k] === 1)) return false;
}
return true;
}
return { name: 'Who Planted What', CFG: CFG, TIERS: TIERS, generate: generate, geometry: geometry, geom: geom, idx: idx, cellInfo: cellInfo,
label: label, clueText: clueText, solveLogic: solveLogic, countSolutions: countSolutions, hint: hint, isSolved: isSolved, nextStep: nextStep, holds: holds };
});
(function (root, factory) {
var core = typeof module !== 'undefined' && module.exports ? require('./core.js') : root.DLG.core;
var api = factory(core);
if (typeof module !== 'undefined' && module.exports) module.exports = api;
else root.DLG.draw = api;
})(this, function (core) {
'use strict';
var ICON = {
flower: '<svg viewBox="0 0 24 24" aria-hidden="true"><g fill="var(--plum)"><circle cx="12" cy="6.2" r="3.6"/><circle cx="17.5" cy="10.2" r="3.6"/><circle cx="15.4" cy="16.6" r="3.6"/><circle cx="8.6" cy="16.6" r="3.6"/><circle cx="6.5" cy="10.2" r="3.6"/></g><circle cx="12" cy="12" r="3.1" fill="var(--pollen)" stroke="var(--moss)" stroke-width=".8"/></svg>',
tent: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3.5 2.8 20h18.4z" fill="var(--tent)"/><path d="M12 9.5 8.6 20h6.8z" fill="var(--paper)"/><path d="M12 3.5v-1.6" stroke="var(--tent)" stroke-width="1.6" stroke-linecap="round"/></svg>',
tree: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="9.5" r="7" fill="var(--tree)"/><circle cx="9" cy="8" r="2" fill="rgba(255,255,255,.25)"/><rect x="10.7" y="14.5" width="2.6" height="7" rx="1" fill="#7a5532"/></svg>',
sun: '<svg viewBox="0 0 24 24" aria-hidden="true"><g stroke="var(--sun)" stroke-width="2" stroke-linecap="round"><path d="M12 1.8v3M12 19.2v3M1.8 12h3M19.2 12h3M4.8 4.8l2.1 2.1M17.1 17.1l2.1 2.1M4.8 19.2l2.1-2.1M17.1 6.9l2.1-2.1"/></g><circle cx="12" cy="12" r="5.2" fill="var(--sun)"/></svg>',
shade: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3.5 13.5a8.5 8.5 0 0 1 17 0z" fill="var(--shade)"/><path d="M12 13.5v7.2a2 2 0 0 1-4 0" fill="none" stroke="var(--shade)" stroke-width="2" stroke-linecap="round"/><path d="M12 5V3.6" stroke="var(--shade)" stroke-width="2" stroke-linecap="round"/></svg>',
grass: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 19c.5-3 .3-5-1-7M10 19c0-3.5.8-6 2.5-8M14 19c.2-2.6 1.4-4.6 3.6-6M18 19c.2-1.5.9-2.6 2-3.4" fill="none" stroke="var(--tree)" stroke-width="1.8" stroke-linecap="round"/></svg>',
cross: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 7l10 10M17 7 7 17" stroke="var(--muted)" stroke-width="2.2" stroke-linecap="round"/></svg>'
};
var CS = 40;
function frame(n, extraR, extraB) { return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="-30 -30 ' + (n * CS + 60 + (extraR || 0)) + ' ' + (n * CS + 60 + (extraB || 0)) + '" role="img">'; }
function labels(n) {
var s = '';
for (var i = 0; i < n; i++) {
s += '<text x="' + (i * CS + CS / 2) + '" y="-10" font-size="13" text-anchor="middle" fill="#444">' + core.COLS[i] + '</text>';
s += '<text x="-14" y="' + (i * CS + CS / 2 + 5) + '" font-size="13" text-anchor="middle" fill="#444">' + (i + 1) + '</text>';
}
return s;
}
function gridLines(n) {
var s = '';
for (var i = 0; i <= n; i++) {
s += '<line x1="0" y1="' + i * CS + '" x2="' + n * CS + '" y2="' + i * CS + '" stroke="#999" stroke-width="1"/>';
s += '<line x1="' + i * CS + '" y1="0" x2="' + i * CS + '" y2="' + n * CS + '" stroke="#999" stroke-width="1"/>';
}
return s + '<rect x="0" y="0" width="' + n * CS + '" height="' + n * CS + '" fill="none" stroke="#000" stroke-width="3"/>';
}
var PRINT_PAT = ['dots', 'diag', 'diag2', 'hlines', 'vlines', 'cross', 'rings', 'grid', 'none'];
function patternDefs() {
return '<defs>' +
'<pattern id="pp-dots" width="8" height="8" patternUnits="userSpaceOnUse"><circle cx="4" cy="4" r="1.1" fill="#888"/></pattern>' +
'<pattern id="pp-diag" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="8" stroke="#aaa" stroke-width="1.2"/></pattern>' +
'<pattern id="pp-diag2" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(-45)"><line x1="0" y1="0" x2="0" y2="8" stroke="#aaa" stroke-width="1.2"/></pattern>' +
'<pattern id="pp-hlines" width="8" height="8" patternUnits="userSpaceOnUse"><line x1="0" y1="4" x2="8" y2="4" stroke="#aaa" stroke-width="1.2"/></pattern>' +
'<pattern id="pp-vlines" width="8" height="8" patternUnits="userSpaceOnUse"><line x1="4" y1="0" x2="4" y2="8" stroke="#aaa" stroke-width="1.2"/></pattern>' +
'<pattern id="pp-cross" width="8" height="8" patternUnits="userSpaceOnUse"><path d="M0 0l8 8M8 0 0 8" stroke="#bbb" stroke-width="1"/></pattern>' +
'<pattern id="pp-rings" width="12" height="12" patternUnits="userSpaceOnUse"><circle cx="6" cy="6" r="3" fill="none" stroke="#aaa" stroke-width="1"/></pattern>' +
'<pattern id="pp-grid" width="10" height="10" patternUnits="userSpaceOnUse"><path d="M0 0h10M0 0v10" stroke="#bbb" stroke-width="1"/></pattern>' +
'</defs>';
}
function printFlowerBeds(p) {
var n = p.n, s = frame(n) + patternDefs() + labels(n);
for (var k = 0; k < n * n; k++) {
var r = Math.floor(k / n), c = k % n, pat = PRINT_PAT[p.regions[k] % PRINT_PAT.length];
if (pat !== 'none') s += '<rect x="' + c * CS + '" y="' + r * CS + '" width="' + CS + '" height="' + CS + '" fill="url(#pp-' + pat + ')"/>';
}
s += gridLines(n);
for (k = 0; k < n * n; k++) {
r = Math.floor(k / n); c = k % n;
if (c + 1 < n && p.regions[k] !== p.regions[k + 1]) s += '<line x1="' + (c + 1) * CS + '" y1="' + r * CS + '" x2="' + (c + 1) * CS + '" y2="' + (r + 1) * CS + '" stroke="#000" stroke-width="3.5" stroke-linecap="square"/>';
if (r + 1 < n && p.regions[k] !== p.regions[k + n]) s += '<line x1="' + c * CS + '" y1="' + (r + 1) * CS + '" x2="' + (c + 1) * CS + '" y2="' + (r + 1) * CS + '" stroke="#000" stroke-width="3.5" stroke-linecap="square"/>';
}
var seen = {};
for (k = 0; k < n * n; k++) if (!seen[p.regions[k]]) {
seen[p.regions[k]] = 1; r = Math.floor(k / n); c = k % n;
s += '<text x="' + (c * CS + 4) + '" y="' + (r * CS + 13) + '" font-size="11" font-weight="700" fill="#000">' + p.beds[p.regions[k]].charAt(0) + p.beds[p.regions[k]].charAt(1) + '</text>';
}
return s + '</svg>';
}
function printTents(p) {
var n = p.n, s = frame(n, 10, 10) + labels(n) + gridLines(n);
p.trees.forEach(function (t) {
var r = Math.floor(t / n), c = t % n, cx = c * CS + CS / 2, cy = r * CS + CS / 2;
s += '<circle cx="' + cx + '" cy="' + (cy - 3) + '" r="12" fill="#fff" stroke="#000" stroke-width="2"/><rect x="' + (cx - 2) + '" y="' + (cy + 8) + '" width="4" height="9" fill="#000"/>';
});
for (var i = 0; i < n; i++) {
s += '<text x="' + (n * CS + 14) + '" y="' + (i * CS + CS / 2 + 6) + '" font-size="16" font-weight="700" text-anchor="middle">' + p.rowCount[i] + '</text>';
s += '<text x="' + (i * CS + CS / 2) + '" y="' + (n * CS + 22) + '" font-size="16" font-weight="700" text-anchor="middle">' + p.colCount[i] + '</text>';
}
return s + '</svg>';
}
function printSunShade(p) {
var n = p.n, s = frame(n) + labels(n) + gridLines(n);
p.givens.forEach(function (v, k) {
if (!v) return;
var cx = (k % n) * CS + CS / 2, cy = Math.floor(k / n) * CS + CS / 2;
s += v === 1 ? '<circle cx="' + cx + '" cy="' + cy + '" r="11" fill="#fff" stroke="#000" stroke-width="2.4"/>' : '<circle cx="' + cx + '" cy="' + cy + '" r="11" fill="#000"/>';
});
return s + '</svg>';
}
function printPath(p) {
var n = p.n, s = frame(n) + labels(n) + gridLines(n);
(p.hedges || []).forEach(function (e) {
var a = Math.min.apply(null, edgeCells(p, e)), b = Math.max.apply(null, edgeCells(p, e));
var r = Math.floor(a / n), c = a % n;
if (b === a + 1) s += '<line x1="' + (c + 1) * CS + '" y1="' + r * CS + '" x2="' + (c + 1) * CS + '" y2="' + (r + 1) * CS + '" stroke="#000" stroke-width="6" stroke-linecap="round"/>';
else s += '<line x1="' + c * CS + '" y1="' + (r + 1) * CS + '" x2="' + (c + 1) * CS + '" y2="' + (r + 1) * CS + '" stroke="#000" stroke-width="6" stroke-linecap="round"/>';
});
Object.keys(p.stones).forEach(function (cell) {
var k = +cell, cx = (k % n) * CS + CS / 2, cy = Math.floor(k / n) * CS + CS / 2;
s += '<circle cx="' + cx + '" cy="' + cy + '" r="13" fill="#000"/><text x="' + cx + '" y="' + (cy + 5) + '" font-size="14" font-weight="700" fill="#fff" text-anchor="middle">' + p.stones[cell] + '</text>';
});
return s + '</svg>';
}
function edgeCells(p, e) {
var n = p.n, count = 0;
for (var k = 0; k < n * n; k++) {
var r = Math.floor(k / n), c = k % n;
if (c + 1 < n) { if (count === e) return [k, k + 1]; count++; }
if (r + 1 < n) { if (count === e) return [k, k + n]; count++; }
}
return [0, 0];
}
function esc(t) { return String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
function printGrid(p, wp) {
var html = '<ol class="sheet-clues">' + p.clueTexts.map(function (t) { return '<li>' + esc(t) + '</li>'; }).join('') + '</ol><table class="sheet-table"><thead><tr><th>Gardener</th>';
for (var c = 1; c < p.cats.length; c++) html += '<th>' + { plant: 'Crop', bed: 'Bed', day: 'Day' }[p.cats[c]] + '</th>';
html += '</tr></thead><tbody>';
p.items[0].forEach(function (name) { html += '<tr><td>' + esc(name) + '</td>' + new Array(p.cats.length).join('<td>&nbsp;</td>') + '</tr>'; });
html += '</tbody></table><p class="sheet-rules">Options: ' + p.cats.slice(1).map(function (k, i) { return p.items[i + 1].map(function (j, x) { return wp.label(p, i + 1, x); }).join(', '); }).join(' &middot; ') + '</p>';
return html;
}
var RULES = {
flowerbeds: 'Plant one flower in every row, every column and every bed. Flowers never touch each other, not even diagonally.',
tents: 'Every tree gets its own tent on a square directly beside it (not diagonally). Tents never touch each other, not even diagonally. The numbers say how many tents are in each row and column.',
sunshade: 'Fill every square with sun (open circle) or shade (filled circle). No three of the same may sit next to each other in a row or column, and every row and column holds as many suns as shades.',
gardenpath: 'Draw one path from stone 1 to the last stone that passes through every square exactly once, moving up, down, left or right and visiting the stones in number order. Thick hedges cannot be crossed.',
whoplanted: 'Use the clues to work out which crop each gardener planted' + ', and where and when. Every option is used exactly once.'
};
function printSheet(p, mods, title) {
var body = p.type === 'flowerbeds' ? printFlowerBeds(p) : p.type === 'tents' ? printTents(p) : p.type === 'sunshade' ? printSunShade(p)
: p.type === 'gardenpath' ? printPath(p) : printGrid(p, mods.whoplanted);
var extra = p.type === 'flowerbeds' ? '<p class="sheet-rules">Beds: ' + p.beds.map(function (b, i) { return b + ' (' + PRINT_PAT[i % PRINT_PAT.length].replace('none', 'plain').replace('diag2', 'back-diagonal').replace('diag', 'diagonal').replace('hlines', 'horizontal lines').replace('vlines', 'vertical lines').replace('cross', 'cross-hatch') + ')'; }).join(', ') + '. The first square of each bed is marked with its first two letters.</p>' : '';
return '<section class="print-sheet"><h2>' + esc(title) + '</h2><p class="sheet-rules">' + RULES[p.type] + '</p>' + body + extra + '<p class="sheet-rules">dailylogicgarden.com &middot; one solution, no guessing needed.</p></section>';
}
var KIND = { flowerbeds: 'daisy', tents: 'fir', sunshade: 'sunflower', gardenpath: 'fern', whoplanted: 'tulip' };
var SCALE = { sprout: 0.62, bloom: 0.9, grove: 1.3 };
function plantSVG(kind, x, y, sc) {
var t = 'translate(' + x.toFixed(1) + ' ' + y.toFixed(1) + ') scale(' + sc.toFixed(2) + ')';
if (kind === 'daisy') return '<g transform="' + t + '"><path d="M0 0V-34" stroke="#3f7a4a" stroke-width="2.4"/><path d="M0-14q-9-4-12 2q8 3 12-2" fill="#5f9a5e"/><g fill="#fff" stroke="#7B3F69" stroke-width=".8">' + [0, 60, 120, 180, 240, 300].map(function (a) { return '<ellipse cx="0" cy="-44" rx="3.6" ry="8" transform="rotate(' + a + ' 0 -36)"/>'; }).join('') + '</g><circle cx="0" cy="-36" r="4.2" fill="#E3B23C"/></g>';
if (kind === 'fir') return '<g transform="' + t + '"><rect x="-2" y="-8" width="4" height="8" fill="#7a5532"/><path d="M0-52 14-22H6L17-8H-17L-6-22H-14z" fill="#2F6B3F"/></g>';
if (kind === 'sunflower') return '<g transform="' + t + '"><path d="M0 0V-46" stroke="#3f7a4a" stroke-width="2.6"/><path d="M0-20q10-6 14 0q-8 5-14 0" fill="#5f9a5e"/><g fill="#E3B23C">' + [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map(function (a) { return '<ellipse cx="0" cy="-60" rx="3" ry="7" transform="rotate(' + a + ' 0 -52)"/>'; }).join('') + '</g><circle cx="0" cy="-52" r="6" fill="#6b3f1f"/></g>';
if (kind === 'fern') return '<g transform="' + t + '" fill="none" stroke="#3f8a55" stroke-width="2" stroke-linecap="round"><path d="M0 0q-2-22 8-40"/><path d="M-1-10l-9-4M0-18l-10-6M1-26l-9-8M4-33l-7-9M1-12l9-6M2-20l9-8M5-28l8-8"/><path d="M0 0q4-16-6-30"/></g>';
return '<g transform="' + t + '"><path d="M0 0V-30" stroke="#3f7a4a" stroke-width="2.4"/><path d="M0-6q-8-12-2-22M0-6q8-12 2-22" fill="#5f9a5e"/><path d="M-7-44q0-10 7-6q7-4 7 6q0 9-7 9q-7 0-7-9z" fill="#C2577F"/></g>';
}
function season(month) { return month < 2 || month === 11 ? 'winter' : month < 5 ? 'spring' : month < 8 ? 'summer' : 'autumn'; }
var SKY = { spring: ['#EAF3E2', '#CFE3BE'], summer: ['#F4F0D8', '#D7E6B5'], autumn: ['#F5E8D6', '#E2CFA3'], winter: ['#E9EEF2', '#D3DCE2'] };
function gardenSVG(plants, month, title) {
var W = 720, rows = Math.max(1, Math.ceil(plants.length / 18)), H = 170 + rows * 80;
var sn = season(month), sky = SKY[sn];
var s = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-labelledby="garden-t"><title id="garden-t">' + esc(title) + '</title>' +
'<rect width="' + W + '" height="' + H + '" fill="' + sky[0] + '"/><rect y="' + (H - rows * 80 - 40) + '" width="' + W + '" height="' + (rows * 80 + 40) + '" fill="' + sky[1] + '"/>';
for (var r = 0; r < rows; r++) s += '<path d="M20 ' + (H - r * 80 - 26) + 'H' + (W - 20) + '" stroke="#8a6a44" stroke-width="5" stroke-linecap="round" opacity=".55"/>';
if (sn === 'winter') for (var i = 0; i < 40; i++) s += '<circle cx="' + ((i * 97) % W) + '" cy="' + ((i * 53) % (H - 60)) + '" r="2" fill="#fff" opacity=".8"/>';
if (sn === 'autumn') for (i = 0; i < 16; i++) s += '<ellipse cx="' + ((i * 131) % W) + '" cy="' + (30 + (i * 37) % 60) + '" rx="4" ry="2" fill="#c27a2c" opacity=".6" transform="rotate(' + (i * 40) + ' ' + ((i * 131) % W) + ' ' + (30 + (i * 37) % 60) + ')"/>';
plants.forEach(function (pl, idx) {
var row = Math.floor(idx / 18), col = idx % 18, inRow = Math.min(18, plants.length - row * 18);
var step = (W - 80) / inRow;
var x = 40 + step * (col + 0.5) + (row % 2 ? step / 4 : 0), y = H - row * 80 - 28;
s += plantSVG(KIND[pl.type] || 'tulip', x, y, SCALE[pl.level] || 0.7);
});
if (!plants.length) s += '<text x="' + W / 2 + '" y="' + (H / 2) + '" text-anchor="middle" font-size="18" fill="#4B5D50">Your garden is ready for its first plant.</text>';
return s + '</svg>';
}
return { ICON: ICON, printSheet: printSheet, RULES: RULES, gardenSVG: gardenSVG, plantSVG: plantSVG, KIND: KIND, season: season, PRINT_PAT: PRINT_PAT, edgeCells: edgeCells };
});
(function (root, factory) {
var api = factory();
if (typeof module !== 'undefined' && module.exports) module.exports = api;
else (root.DLG = root.DLG || {}).saves = api;
})(this, function () {
'use strict';
var TYPES = ['flowerbeds', 'tents', 'sunshade', 'gardenpath', 'whoplanted'];
var LEVELS = ['sprout', 'bloom', 'grove'];
var MAX_HINTS = 10000;            // more hints than any board has cells
var MAX_SECS = 7 * 24 * 3600;     // a week of play time on one board
var MAX_PLANTS = 50000;           // garden entries kept / accepted in one import
var MAX_IMPORT_BYTES = 2 * 1024 * 1024;
var DAY = /^(\d{4})-(\d{2})-(\d{2})$/;
function plainObject(o) { return !!o && typeof o === 'object' && Object.prototype.toString.call(o) === '[object Object]'; }
function intIn(v, min, max) { return typeof v === 'number' && isFinite(v) && Math.floor(v) === v && v >= min && v <= max; }
function realDay(key) {
var m = typeof key === 'string' && DAY.exec(key);
if (!m) return false;
var d = new Date(Date.UTC(+m[1], +m[2] - 1, +m[3]));
return d.getUTCFullYear() === +m[1] && d.getUTCMonth() === +m[2] - 1 && d.getUTCDate() === +m[3];
}
function dayInRange(key, launch, today) { return realDay(key) && key >= launch && key <= today; }
function dayFrom(key, launch, latest) { return realDay(key) && key >= launch && (latest === null || key <= latest); }
function addDays(key, n) {
var m = DAY.exec(key), d = new Date(Date.UTC(+m[1], +m[2] - 1, +m[3] + n));
return d.getUTCFullYear() + '-' + ('0' + (d.getUTCMonth() + 1)).slice(-2) + '-' + ('0' + d.getUTCDate()).slice(-2);
}
var IMPORT_TOLERANCE_DAYS = 1;
function cellsOk(u, len, ok) {
if (!Array.isArray(u) || u.length !== len) return null;
for (var k = 0; k < len; k++) if (!ok(u[k], k)) return null;
return u.slice();
}
function small(v) { return v === 0 || v === 1 || v === 2; }
function cleanBoard(type, p, mod, u) {
try {
if (type === 'flowerbeds') return cellsOk(u, p.n * p.n, small);
if (type === 'whoplanted') return cellsOk(u, mod.geom(p).size, small);
if (type === 'tents') {
var tg = mod.geom(p);
return cellsOk(u, p.n * p.n, function (v, k) { return tg.isTree[k] ? v === 3 : small(v); });
}
if (type === 'sunshade') return cellsOk(u, p.n * p.n, function (v, k) { return p.givens[k] ? v === p.givens[k] : small(v); });
if (type === 'gardenpath') {
if (!plainObject(u) || !Array.isArray(u.path) || !u.path.length || u.path.length > p.n * p.n) return null;
var g = mod.geom(p), seen = {}, hedges = {};
(p.hedges || []).forEach(function (e) { hedges[e] = 1; });
if (u.path[0] !== p.solution[0]) return null;
for (var i = 0; i < u.path.length; i++) {
var c = u.path[i];
if (!intIn(c, 0, p.n * p.n - 1) || seen[c]) return null;
seen[c] = 1;
if (i) {
var e = g.edgeAt[u.path[i - 1] + ',' + c];
if (e === undefined || hedges[e]) return null; // not a neighbour, or through a hedge
}
}
var pencil = {};
if (u.pencil !== undefined && !plainObject(u.pencil)) return null;
Object.keys(u.pencil || {}).forEach(function (key) {
if (/^\d+$/.test(key) && +key < g.edges.length && small(u.pencil[key])) pencil[key] = u.pencil[key];
});
return { path: u.path.slice(), pencil: pencil };
}
} catch (err) { return null; }
return null;
}
function cleanSave(type, p, mod, saved) {
if (!plainObject(saved)) return null;
var u = cleanBoard(type, p, mod, saved.u);
if (!u) return null;
return {
u: u,
h: intIn(saved.h, 0, MAX_HINTS) ? saved.h : 0,
t: typeof saved.t === 'number' && isFinite(saved.t) && saved.t >= 0 && saved.t <= MAX_SECS ? saved.t : 0,
s: saved.s === true
};
}
function cleanPlant(p, launch, latest) {
if (latest === undefined) latest = null;
if (!plainObject(p) || TYPES.indexOf(p.type) < 0 || LEVELS.indexOf(p.level) < 0 || !dayFrom(p.key, launch, latest)) return null;
if (!intIn(p.hints, 0, MAX_HINTS)) return null;
if (typeof p.secs !== 'number' || !isFinite(p.secs) || p.secs < 0 || p.secs > MAX_SECS) return null;
var at = typeof p.at === 'string' ? p.at.slice(0, 10) : '';
return { type: p.type, level: p.level, key: p.key, hints: p.hints, secs: Math.round(p.secs), at: dayFrom(at, launch, latest) && at >= p.key ? at : p.key };
}
function plantId(p) { return p.type + '|' + p.level + '|' + p.key; }
function cleanGarden(raw, launch) {
var out = { v: 1, plants: [] }, have = {};
if (!plainObject(raw) || !Array.isArray(raw.plants)) return out;
for (var i = 0; i < raw.plants.length && out.plants.length < MAX_PLANTS; i++) {
var p = cleanPlant(raw.plants[i], launch, null);
if (!p || have[plantId(p)]) continue;
have[plantId(p)] = 1;
out.plants.push(p);
}
return out;
}
function shownGarden(g, today) {
return { v: 1, plants: g.plants.filter(function (p) { return p.key <= today; }) };
}
function mergeImport(existing, data, launch, today) {
if (!plainObject(data) || !Array.isArray(data.plants)) throw new Error('format');
if (data.plants.length > MAX_PLANTS) throw new Error('too-large');
var latest = addDays(today, IMPORT_TOLERANCE_DAYS);
var g = cleanGarden(existing, launch), have = {}, added = 0, skipped = 0;
g.plants.forEach(function (p) { have[plantId(p)] = 1; });
data.plants.forEach(function (raw) {
var p = cleanPlant(raw, launch, latest);
if (!p || have[plantId(p)] || g.plants.length >= MAX_PLANTS) { skipped++; return; }
have[plantId(p)] = 1;
g.plants.push(p);
added++;
});
return { garden: g, added: added, skipped: skipped };
}
function parseQuery(search) {
var q = {};
String(search || '').replace(/^\?/, '').split('&').forEach(function (kv) {
if (!kv) return;
var i = kv.indexOf('='), k, v;
try {
k = decodeURIComponent((i < 0 ? kv : kv.slice(0, i)).replace(/\+/g, ' '));
v = decodeURIComponent((i < 0 ? '' : kv.slice(i + 1)).replace(/\+/g, ' '));
} catch (e) { return; }
if (k === 'date' || k === 'level') q[k] = v;
});
return q;
}
return {
TYPES: TYPES, LEVELS: LEVELS, MAX_HINTS: MAX_HINTS, MAX_SECS: MAX_SECS, MAX_PLANTS: MAX_PLANTS, MAX_IMPORT_BYTES: MAX_IMPORT_BYTES,
IMPORT_TOLERANCE_DAYS: IMPORT_TOLERANCE_DAYS,
dayInRange: dayInRange, addDays: addDays, cleanBoard: cleanBoard, cleanSave: cleanSave, cleanPlant: cleanPlant,
cleanGarden: cleanGarden, shownGarden: shownGarden, mergeImport: mergeImport, parseQuery: parseQuery
};
});
(function () {
'use strict';
var D = window.DLG, core = D.core, draw = D.draw, saves = D.saves;
var META = {
flowerbeds: { name: 'Flower Beds', path: '/flower-beds/', plant: 'a daisy' },
tents: { name: 'Tents & Trees', path: '/tents-and-trees/', plant: 'a fir' },
sunshade: { name: 'Sun & Shade', path: '/sun-and-shade/', plant: 'a sunflower' },
gardenpath: { name: 'Garden Path', path: '/garden-path/', plant: 'a fern' },
whoplanted: { name: 'Who Planted What', path: '/who-planted-what/', plant: 'a tulip' }
};
var TYPES = ['flowerbeds', 'tents', 'sunshade', 'gardenpath', 'whoplanted'];
var ARCHIVE_DAYS = 30;
var LAUNCH = '2026-11-02'; // the archive never reaches back before the launch day
var store = {
get: function (k, d) { try { var v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
set: function (k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* storage unavailable */ } }
};
var GARDEN_KEY = 'dlg:garden';
function garden() { return saves.cleanGarden(store.get(GARDEN_KEY, null), LAUNCH); }
function shownGarden() { return saves.shownGarden(garden(), today()); }
function plant(type, level, key, hints, secs) {
var r = saves.mergeImport(garden(), { plants: [{ type: type, level: level, key: key, hints: Math.min(saves.MAX_HINTS, Math.max(0, hints | 0)), secs: Math.min(saves.MAX_SECS, Math.max(0, Math.round(+secs || 0))), at: today() }] }, LAUNCH, today());
if (!r.added) return false;
store.set(GARDEN_KEY, r.garden);
return true;
}
function solvedSet() { var m = {}; shownGarden().plants.forEach(function (p) { m[p.type + '|' + p.level + '|' + p.key] = 1; }); return m; }
function today() { return core.dateKey(new Date()); }
function query() { return saves.parseQuery(location.search); } // badly encoded values are ignored
function validDate(key) {
if (!core.parseKey(key)) return null;
var t = today();
return key <= t && key >= core.addDays(t, -(ARCHIVE_DAYS - 1)) && key >= LAUNCH ? key : null;
}
function longDate(key) {
var d = core.parseKey(key);
return d.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' });
}
function el(tag, attrs, html) {
var e = document.createElement(tag);
Object.keys(attrs || {}).forEach(function (a) { if (attrs[a] !== null && attrs[a] !== undefined) e.setAttribute(a, attrs[a]); });
if (html !== undefined) e.innerHTML = html;
return e;
}
function fmtTime(s) { s = Math.round(s); var m = Math.floor(s / 60); return m + ':' + (s % 60 < 10 ? '0' : '') + (s % 60); }
function Game(root) {
this.root = root;
this.type = root.getAttribute('data-game');
this.mod = D[this.type];
var q = query();
this.key = validDate(q.date) || today();
this.isToday = this.key === today();
var savedLevel = store.get('dlg:level:' + this.type, 'sprout');
this.level = core.LEVELS.indexOf(q.level) >= 0 ? q.level : core.LEVELS.indexOf(savedLevel) >= 0 ? savedLevel : 'sprout';
this.prefs = store.get('dlg:prefs', { dots: true, autox: true });
this.build();
this.load();
}
var G = Game.prototype;
G.build = function () {
var self = this, r = this.root;
r.innerHTML = '';
var head = el('div', { 'class': 'game-head' });
var lvl = el('div', { 'class': 'lvl', role: 'group', 'aria-label': 'Difficulty' });
core.LEVELS.forEach(function (l) {
var b = el('button', { type: 'button', 'data-level': l, 'aria-pressed': String(l === self.level) }, core.LEVEL_NAMES[l]);
b.addEventListener('click', function () { if (self.level !== l) { self.level = l; store.set('dlg:level:' + self.type, l); self.load(); } });
lvl.appendChild(b);
});
this.dateEl = el('p', { 'class': 'game-date' });
head.appendChild(lvl); head.appendChild(this.dateEl);
r.appendChild(head);
this.stage = el('div', { 'class': 'stage' });
r.appendChild(this.stage);
this.statusEl = el('p', { 'class': 'status', role: 'status', 'aria-live': 'polite' });
this.hintEl = el('div', { 'class': 'hintbox', hidden: '', 'aria-live': 'polite' });
this.solvedEl = el('div', { 'class': 'solved', hidden: '' });
var ctr = el('div', { 'class': 'controls' });
this.btnHint = el('button', { type: 'button', 'class': 'btn hint' }, 'Why? <span aria-hidden="true">(next step)</span>');
this.btnUndo = el('button', { type: 'button', 'class': 'btn ghost small' }, 'Undo');
this.btnClear = el('button', { type: 'button', 'class': 'btn ghost small' }, 'Start over');
this.btnPrint = el('button', { type: 'button', 'class': 'btn ghost small' }, 'Print');
[this.btnHint, this.btnUndo, this.btnClear, this.btnPrint].forEach(function (b) { ctr.appendChild(b); });
this.btnHint.addEventListener('click', function () { self.showHint(); });
this.btnUndo.addEventListener('click', function () { self.undo(); });
this.btnClear.addEventListener('click', function () { if (window.confirm('Clear this board and start again? Your garden keeps everything you have already planted.')) self.reset(); });
this.btnPrint.addEventListener('click', function () { window.print(); });
this.prefsEl = el('div', { 'class': 'prefs' });
r.appendChild(this.statusEl);
r.appendChild(this.hintEl);
r.appendChild(ctr);
r.appendChild(this.prefsEl);
r.appendChild(this.solvedEl);
this.printRoot = document.querySelector('.print-root');
var self2 = this;
document.addEventListener('visibilitychange', function () { self2.tick(); });
setInterval(function () { self2.tick(); }, 5000);
};
G.saveKey = function () { return 'dlg:v1:' + this.type + ':' + this.level + ':' + this.key; };
G.load = function () {
var self = this;
Array.prototype.forEach.call(this.root.querySelectorAll('.lvl button'), function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-level') === self.level)); });
this.dateEl.innerHTML = (this.isToday ? 'Today’s puzzle · ' : 'From the archive · ') + longDate(this.key) + ' (UTC) · <a href="/archive/">Archive</a>';
this.stage.innerHTML = '<p class="loading">Growing ' + core.LEVEL_NAMES[this.level] + ' puzzle…</p>';
this.hintEl.hidden = true; this.solvedEl.hidden = true;
setTimeout(function () {
try { self.p = self.mod.generate(self.key, self.level); }
catch (e) { self.stage.innerHTML = '<p class="loading">This puzzle could not be grown. Please try another level.</p>'; return; }
var saved = saves.cleanSave(self.type, self.p, self.mod, store.get(self.saveKey(), null));
self.user = saved ? self.restore(saved.u) : self.blank();
self.hints = saved ? saved.h : 0;
self.secs = saved ? saved.t : 0;
self.done = !!(saved && saved.s);
self.history = [];
self.hint = null;
self.lastTick = Date.now();
self.render();
self.renderPrint();
if (self.done) self.celebrate(false);
}, 20);
};
G.blank = function () {
var p = this.p;
if (this.type === 'gardenpath') return { path: [p.solution[0]], pencil: {} };
if (this.type === 'tents') return Array.from(this.mod.initial(this.mod.geom(p)));
if (this.type === 'sunshade') return p.givens.slice();
if (this.type === 'whoplanted') return new Array(this.mod.geom(p).size).fill(0);
return new Array(p.n * p.n).fill(0);
};
G.restore = function (u) { return this.type === 'gardenpath' ? { path: u.path.slice(), pencil: u.pencil || {} } : u.slice(); };
G.snapshot = function () { return this.type === 'gardenpath' ? { path: this.user.path.slice(), pencil: JSON.parse(JSON.stringify(this.user.pencil)) } : this.user.slice(); };
G.save = function () { store.set(this.saveKey(), { u: this.user, h: Math.min(saves.MAX_HINTS, this.hints), t: Math.min(saves.MAX_SECS, Math.round(this.secs)), s: this.done }); };
G.tick = function () {
if (!this.p || this.done) { this.lastTick = Date.now(); return; }
var now = Date.now();
if (document.visibilityState !== 'hidden') this.secs += Math.min(60, (now - (this.lastTick || now)) / 1000);
this.lastTick = now;
};
G.change = function (fn) {
if (this.done) return;
this.tick();
this.history.push(this.snapshot());
if (this.history.length > 400) this.history.shift();
fn();
this.hint = null;
this.hintEl.hidden = true;
this.save();
this.refresh();
this.checkSolved();
};
G.undo = function () { if (!this.history.length || this.done) return; this.user = this.history.pop(); this.hint = null; this.hintEl.hidden = true; this.save(); this.refresh(); };
G.reset = function () { this.user = this.blank(); this.history = []; this.done = false; this.hint = null; this.hintEl.hidden = true; this.solvedEl.hidden = true; this.save(); this.render(); };
G.checkSolved = function () {
if (this.done || !this.mod.isSolved(this.p, this.user)) return;
this.tick();
this.done = true;
this.save();
this.celebrate(true);
};
G.shareText = function () {
var m = META[this.type];
return 'Daily Logic Garden – ' + m.name + ' (' + core.LEVEL_NAMES[this.level] + ')\n' + longDate(this.key) + '\n' +
'Solved in ' + fmtTime(this.secs) + (this.hints ? ' with ' + core.plural(this.hints, 'hint') : ' without hints') + '\n' +
'https://dailylogicgarden.com' + m.path;
};
G.celebrate = function (fresh) {
var self = this, m = META[this.type];
var added = plant(this.type, this.level, this.key, this.hints, Math.round(this.secs));
var txt = this.shareText();
this.solvedEl.innerHTML = '<h3>Solved – ' + (added || !fresh ? 'you planted ' + m.plant + ' in your garden' : 'well done') + '</h3>' +
'<p>' + core.LEVEL_NAMES[this.level] + ' · ' + fmtTime(this.secs) + (this.hints ? ' · ' + core.plural(this.hints, 'hint') : '') + '. Hints never cost you a plant, and missed days never wilt anything.</p>' +
'<div class="share-text" aria-label="Result to share">' + txt.replace(/&/g, '&amp;').replace(/</g, '&lt;') + '</div>' +
'<p class="row"><button type="button" class="btn small" data-share>Copy result</button> <a class="btn ghost small" href="/garden/">See my garden</a></p>';
this.solvedEl.hidden = false;
this.solvedEl.querySelector('[data-share]').addEventListener('click', function (ev) {
var b = ev.currentTarget;
function ok() { b.textContent = 'Copied'; setTimeout(function () { b.textContent = 'Copy result'; }, 2000); }
if (navigator.share && /Mobi|Android/i.test(navigator.userAgent)) { navigator.share({ text: txt }).catch(function () {}); return; }
if (navigator.clipboard) navigator.clipboard.writeText(txt).then(ok, function () { window.prompt('Copy your result:', txt); });
else window.prompt('Copy your result:', txt);
});
this.refresh();
if (fresh) this.statusEl.textContent = 'Solved! ' + m.name + ' ' + core.LEVEL_NAMES[this.level] + ' is complete.';
};
G.showHint = function () {
if (!this.p) return;
if (this.done) { this.statusEl.textContent = 'This puzzle is already solved.'; return; }
var self = this, h = this.mod.hint(this.p, this.user);
this.hint = h;
var label = h.kind === 'mistake' ? 'Check this:' : h.kind === 'done' ? 'Done:' : 'Why?';
this.hintEl.innerHTML = '<p style="margin:0"><span class="why">' + label + '</span>' + h.text.replace(/&/g, '&amp;').replace(/</g, '&lt;') + '</p>';
if (h.kind === 'deduction' || h.kind === 'reveal' || h.kind === 'mistake') {
var row = el('div', { 'class': 'row' });
var apply = el('button', { type: 'button', 'class': 'btn small' }, h.kind === 'mistake' ? (this.type === 'gardenpath' ? 'Back up the path' : 'Clear that mark') : 'Apply this step');
apply.addEventListener('click', function () { self.applyHint(h); });
row.appendChild(apply);
this.hintEl.appendChild(row);
}
this.hintEl.hidden = false;
if (h.kind === 'deduction' || h.kind === 'reveal') { this.hints++; this.save(); }
this.refresh();
};
G.applyHint = function (h) {
var self = this;
this.change(function () {
if (self.type === 'gardenpath') {
if (h.kind === 'mistake') {
for (var i = 0; i < self.user.path.length; i++) if (self.user.path[i] !== self.p.solution[i]) { self.user.path = self.user.path.slice(0, i); break; }
} else h.set.forEach(function (q) { self.user.pencil[q[0]] = q[1]; });
self.followPencil();
return;
}
if (h.kind === 'mistake') h.cells.forEach(function (k) { self.user[k] = self.type === 'tents' && self.p.trees.indexOf(k) >= 0 ? 3 : 0; });
else h.set.forEach(function (q) { self.user[q[0]] = q[1]; });
if (self.type === 'whoplanted' && self.prefs.autox) h.set.forEach(function (q) { if (q[1] === 1) self.autoCross(q[0]); });
});
};
G.render = function () {
this.stage.innerHTML = '';
var R = RENDER[this.type];
R.build.call(this);
this.renderPrefs();
this.refresh();
};
G.refresh = function () {
if (!this.p) return;
RENDER[this.type].update.call(this);
this.btnUndo.disabled = !this.history.length || this.done;
this.btnHint.disabled = this.done;
};
G.renderPrefs = function () {
var self = this;
this.prefsEl.innerHTML = '';
var opts = this.type === 'flowerbeds' || this.type === 'tents' ? [['dots', 'Show blocked squares as dots']] : this.type === 'whoplanted' ? [['autox', 'Fill ✕ automatically after a ●']] : [];
opts.forEach(function (o) {
var id = 'pref-' + self.type + '-' + o[0];
var lab = el('label', { 'for': id }), box = el('input', { type: 'checkbox', id: id });
box.checked = !!self.prefs[o[0]];
box.addEventListener('change', function () { self.prefs[o[0]] = box.checked; store.set('dlg:prefs', self.prefs); self.refresh(); });
lab.appendChild(box); lab.appendChild(document.createTextNode(o[1]));
self.prefsEl.appendChild(lab);
});
};
G.renderPrint = function () {
if (!this.printRoot) return;
document.body.classList.add('has-print');
this.printRoot.innerHTML = draw.printSheet(this.p, D, META[this.type].name + ' – ' + core.LEVEL_NAMES[this.level] + ' – ' + longDate(this.key));
};
function squareBoard(game, n, opts) {
var b = el('div', { 'class': 'board', style: '--n:' + n });
var cl = el('div', { 'class': 'collab', 'aria-hidden': 'true' }), rl = el('div', { 'class': 'rowlab', 'aria-hidden': 'true' });
for (var i = 0; i < n; i++) { cl.appendChild(el('span', {}, core.COLS[i])); rl.appendChild(el('span', {}, String(i + 1))); }
b.appendChild(cl); b.appendChild(rl);
var cells = el('div', { 'class': 'cells' + (opts.path ? ' path' : ''), role: 'grid', 'aria-label': opts.label });
game.cellEls = [];
for (var r = 0; r < n; r++) {
var row = el('div', { role: 'row', style: 'display:contents' });
for (var c = 0; c < n; c++) {
var k = r * n + c;
var cell = el(opts.path ? 'div' : 'button', { 'class': 'cell', role: 'gridcell', 'data-k': k, tabindex: k === 0 ? '0' : '-1' });
if (!opts.path) cell.type = 'button';
row.appendChild(cell);
game.cellEls.push(cell);
}
cells.appendChild(row);
}
b.appendChild(cells);
game.cellsEl = cells;
var wrap = el('div', { 'class': 'board-wrap' });
wrap.appendChild(b);
return { wrap: wrap, board: b, cells: cells };
}
function focusCell(game, k) {
game.cellEls.forEach(function (c, i) { c.tabIndex = i === k ? 0 : -1; });
game.cellEls[k].focus();
game.cursor = k;
}
function bindCells(game, onActivate, onKeyValue) {
var n = game.p.n, dragging = false, dragVal = null;
game.cellsEl.addEventListener('click', function (ev) {
var t = ev.target.closest('.cell');
if (!t || game.dragMoved) { game.dragMoved = false; return; }
var k = +t.getAttribute('data-k');
focusCell(game, k);
onActivate(k);
});
game.cellsEl.addEventListener('keydown', function (ev) {
var t = ev.target.closest('.cell');
if (!t) return;
var k = +t.getAttribute('data-k'), r = Math.floor(k / n), c = k % n, nk = null;
if (ev.key === 'ArrowUp') nk = Math.max(0, r - 1) * n + c;
else if (ev.key === 'ArrowDown') nk = Math.min(n - 1, r + 1) * n + c;
else if (ev.key === 'ArrowLeft') nk = r * n + Math.max(0, c - 1);
else if (ev.key === 'ArrowRight') nk = r * n + Math.min(n - 1, c + 1);
else if (ev.key === 'Home') nk = r * n;
else if (ev.key === 'End') nk = r * n + n - 1;
if (nk !== null) { ev.preventDefault(); focusCell(game, nk); return; }
if (ev.key === ' ' || ev.key === 'Enter') { ev.preventDefault(); onActivate(k); return; }
var v = onKeyValue(ev.key);
if (v !== null && v !== undefined) { ev.preventDefault(); game.setCell(k, v); }
if (ev.key === 'z' && (ev.ctrlKey || ev.metaKey)) { ev.preventDefault(); game.undo(); }
});
game.cellsEl.addEventListener('pointerdown', function (ev) {
var t = ev.target.closest('.cell');
if (!t || ev.button > 0) return;
dragging = true; game.dragMoved = false; dragVal = null; game.dragStart = +t.getAttribute('data-k');
});
game.cellsEl.addEventListener('pointermove', function (ev) {
if (!dragging || !game.dragMark) return;
var t = document.elementFromPoint(ev.clientX, ev.clientY);
t = t && t.closest ? t.closest('.cell') : null;
if (!t || !game.cellsEl.contains(t)) return;
var k = +t.getAttribute('data-k');
if (k === game.dragStart && !game.dragMoved) return;
if (!game.dragMoved) { game.dragMoved = true; if (game.dragMark(game.dragStart, true)) dragVal = 1; }
game.dragMark(k, false);
});
function end() { if (dragging && game.dragMoved) { game.save(); game.refresh(); game.checkSolved(); } dragging = false; }
window.addEventListener('pointerup', end);
window.addEventListener('pointercancel', end);
}
G.setCell = function (k, v) { var self = this; if (this.user[k] === v) return; this.change(function () { self.user[k] = v; }); };
G.markHints = function () {
var h = this.hint, focus = {}, target = {};
if (h && h.focus && (h.kind === 'deduction' || h.kind === 'mistake' || h.kind === 'reveal')) {
h.focus.forEach(function (k) { focus[k] = 1; });
(h.cells || []).forEach(function (k) { target[k] = 1; });
}
return { focus: focus, target: target };
};
function cname(k, n) { return core.cellName(Math.floor(k / n), k % n); }
var RENDER = {};
RENDER.flowerbeds = {
build: function () {
var self = this, p = this.p, n = p.n;
var b = squareBoard(this, n, { label: 'Flower Beds board, ' + n + ' by ' + n });
this.stage.appendChild(b.wrap);
this.cellEls.forEach(function (cell, k) {
var r = Math.floor(k / n), c = k % n, reg = p.regions[k];
var cls = ' b' + p.colors[reg] + ' p' + (reg % 9);
if (r === 0 || p.regions[k - n] !== reg) cls += ' bt';
if (c === 0 || p.regions[k - 1] !== reg) cls += ' bl';
if (c === n - 1 || p.regions[k + 1] !== reg) cls += ' br';
if (r === n - 1 || p.regions[k + n] !== reg) cls += ' bb';
cell.className += cls;
});
var leg = el('ul', { 'class': 'legend', 'aria-label': 'Beds' });
p.beds.forEach(function (name, i) {
var sw = '<span class="sw cell b' + p.colors[i] + ' p' + (i % 9) + '" aria-hidden="true"></span>';
leg.appendChild(el('li', {}, sw + name));
});
this.stage.appendChild(leg);
this.stage.appendChild(el('p', { 'class': 'howto' }, 'Tap once for <b>empty</b> (✕), twice for a <b>flower</b>, a third time to clear. Drag across squares to mark several as empty. Keyboard: arrows move, <kbd>F</kbd> flower, <kbd>X</kbd> empty, <kbd>Backspace</kbd> clear, <kbd>Ctrl</kbd>+<kbd>Z</kbd> undo.'));
bindCells(this, function (k) { self.setCell(k, [2, 0, 1][self.user[k]]); }, function (key) {
if (key === 'f' || key === 'F' || key === '1') return 1;
if (key === 'x' || key === 'X' || key === '2') return 2;
if (key === 'Backspace' || key === 'Delete' || key === '0') return 0;
return null;
});
this.dragMark = function (k, first) { if (self.user[k] === 0) { if (first) self.history.push(self.snapshot()); self.user[k] = 2; self.refresh(); return true; } return false; };
},
update: function () {
var p = this.p, n = p.n, u = this.user, mod = this.mod;
var blocked = {}, bad = {};
if (this.prefs.dots && !this.done) mod.blockedBy(p, u).forEach(function (x) { blocked[x] = 1; });
mod.conflicts(p, u).forEach(function (x) { bad[x] = 1; });
var hl = this.markHints();
this.cellEls.forEach(function (cell, k) {
var v = u[k];
cell.innerHTML = v === 1 ? draw.ICON.flower : v === 2 ? draw.ICON.cross : blocked[k] ? '<span class="dot"></span>' : '';
cell.classList.toggle('blocked', !!blocked[k] && v === 0);
cell.classList.toggle('conflict', !!bad[k]);
cell.classList.toggle('hl-focus', !!hl.focus[k]);
cell.classList.toggle('hl-target', !!hl.target[k]);
cell.setAttribute('aria-label', cname(k, n) + ', ' + p.beds[p.regions[k]] + ' bed, ' + (v === 1 ? 'flower' : v === 2 ? 'empty' : blocked[k] ? 'blocked' : 'open'));
});
var flowers = u.filter(function (v) { return v === 1; }).length;
if (!this.done) this.statusEl.textContent = flowers + ' of ' + n + ' flowers planted';
}
};
RENDER.tents = {
build: function () {
var self = this, p = this.p, n = p.n;
var b = squareBoard(this, n, { label: 'Tents and Trees board, ' + n + ' by ' + n });
this.cntR = el('div', { 'class': 'cnt-r', 'aria-label': 'Tents per row' });
this.cntC = el('div', { 'class': 'cnt-c', 'aria-label': 'Tents per column' });
for (var i = 0; i < n; i++) { this.cntR.appendChild(el('span', {}, String(p.rowCount[i]))); this.cntC.appendChild(el('span', {}, String(p.colCount[i]))); }
b.board.appendChild(this.cntR); b.board.appendChild(this.cntC);
this.stage.appendChild(b.wrap);
this.cellEls.forEach(function (cell, k) { if (p.trees.indexOf(k) >= 0) { cell.classList.add('given'); cell.setAttribute('aria-disabled', 'true'); } });
this.stage.appendChild(el('p', { 'class': 'howto' }, 'Tap once for <b>grass</b>, twice for a <b>tent</b>, a third time to clear. Drag to lay grass on several squares. Numbers on the right and below count the tents in each row and column. Keyboard: arrows move, <kbd>T</kbd> tent, <kbd>G</kbd> grass, <kbd>Backspace</kbd> clear.'));
bindCells(this, function (k) { if (self.user[k] !== 3) self.setCell(k, [2, 0, 1][self.user[k]]); }, function (key) {
if (self.user[self.cursor || 0] === 3) return null;
if (key === 't' || key === 'T' || key === '1') return 1;
if (key === 'g' || key === 'G' || key === 'x' || key === 'X' || key === '2') return 2;
if (key === 'Backspace' || key === 'Delete' || key === '0') return 0;
return null;
});
this.dragMark = function (k, first) { if (self.user[k] === 0) { if (first) self.history.push(self.snapshot()); self.user[k] = 2; self.refresh(); return true; } return false; };
},
update: function () {
var p = this.p, n = p.n, u = this.user, mod = this.mod, blocked = {}, bad = {};
if (this.prefs.dots && !this.done) mod.blockedBy(p, u).forEach(function (x) { blocked[x] = 1; });
mod.conflicts(p, u).forEach(function (x) { bad[x] = 1; });
var hl = this.markHints();
this.cellEls.forEach(function (cell, k) {
var v = u[k];
cell.innerHTML = v === 3 ? draw.ICON.tree : v === 1 ? draw.ICON.tent : v === 2 ? draw.ICON.grass : blocked[k] ? '<span class="dot"></span>' : '';
cell.classList.toggle('conflict', !!bad[k]);
cell.classList.toggle('hl-focus', !!hl.focus[k]);
cell.classList.toggle('hl-target', !!hl.target[k]);
cell.setAttribute('aria-label', cname(k, n) + ', ' + (v === 3 ? 'tree' : v === 1 ? 'tent' : v === 2 ? 'grass' : 'open'));
});
for (var i = 0; i < n; i++) {
var tr = 0, tc = 0;
for (var j = 0; j < n; j++) { if (u[i * n + j] === 1) tr++; if (u[j * n + i] === 1) tc++; }
this.cntR.children[i].className = tr === p.rowCount[i] ? 'met' : '';
this.cntC.children[i].className = tc === p.colCount[i] ? 'met' : '';
}
if (!this.done) this.statusEl.textContent = u.filter(function (v) { return v === 1; }).length + ' of ' + p.trees.length + ' tents pitched';
}
};
RENDER.sunshade = {
build: function () {
var self = this, p = this.p, n = p.n;
var b = squareBoard(this, n, { label: 'Sun and Shade board, ' + n + ' by ' + n });
this.stage.appendChild(b.wrap);
this.cellEls.forEach(function (cell, k) { if (p.givens[k]) { cell.classList.add('given'); cell.setAttribute('aria-disabled', 'true'); } });
this.stage.appendChild(el('p', { 'class': 'howto' }, 'Tap once for <b>sun</b>, twice for <b>shade</b>, a third time to clear. Given squares have a tinted background and can\u2019t be changed. Keyboard: arrows move, <kbd>S</kbd> sun, <kbd>D</kbd> shade, <kbd>Backspace</kbd> clear.'));
bindCells(this, function (k) { if (!p.givens[k]) self.setCell(k, [1, 2, 0][self.user[k]]); }, function (key) {
if (p.givens[self.cursor || 0]) return null;
if (key === 's' || key === 'S' || key === '1') return 1;
if (key === 'd' || key === 'D' || key === '2') return 2;
if (key === 'Backspace' || key === 'Delete' || key === '0') return 0;
return null;
});
},
update: function () {
var p = this.p, n = p.n, u = this.user, bad = {};
this.mod.conflicts(p, u).forEach(function (x) { bad[x] = 1; });
var hl = this.markHints();
this.cellEls.forEach(function (cell, k) {
var v = p.givens[k] || u[k];
cell.innerHTML = v === 1 ? draw.ICON.sun : v === 2 ? draw.ICON.shade : '';
cell.style.backgroundColor = p.givens[k] ? 'var(--given)' : '';
cell.classList.toggle('conflict', !!bad[k]);
cell.classList.toggle('hl-focus', !!hl.focus[k]);
cell.classList.toggle('hl-target', !!hl.target[k]);
cell.setAttribute('aria-label', cname(k, n) + ', ' + (v === 1 ? 'sun' : v === 2 ? 'shade' : 'open') + (p.givens[k] ? ', given' : ''));
});
var filled = 0;
for (var k = 0; k < n * n; k++) if (p.givens[k] || u[k]) filled++;
if (!this.done) this.statusEl.textContent = filled + ' of ' + n * n + ' squares filled';
}
};
G.followPencil = function () {
var g = this.mod.geom(this.p), u = this.user;
for (;;) {
var head = u.path[u.path.length - 1], prev = u.path[u.path.length - 2], next = -1;
g.cellEdges[head].forEach(function (e) {
if (u.pencil[e] !== 1) return;
var o = g.edges[e][0] === head ? g.edges[e][1] : g.edges[e][0];
if (o !== prev && u.path.indexOf(o) < 0) next = o;
});
if (next < 0) break;
u.path.push(next);
}
};
G.pathStep = function (k) {
var g = this.mod.geom(this.p), u = this.user, head = u.path[u.path.length - 1];
var at = u.path.indexOf(k);
if (at >= 0) { if (at < u.path.length - 1) u.path = u.path.slice(0, at + 1); return true; }
var e = g.edgeAt[head + ',' + k];
if (e === undefined || (this.p.hedges || []).indexOf(e) >= 0) return false;
if (g.stoneAt[head] === g.last) return false;
u.path.push(k);
return true;
};
RENDER.gardenpath = {
build: function () {
var self = this, p = this.p, n = p.n, g = this.mod.geom(p);
var b = squareBoard(this, n, { label: 'Garden Path board, ' + n + ' by ' + n, path: true });
this.stage.appendChild(b.wrap);
b.cells.setAttribute('role', 'application');
b.cells.setAttribute('tabindex', '0');
b.cells.setAttribute('aria-roledescription', 'path board');
this.cellEls.forEach(function (c) { c.removeAttribute('tabindex'); c.removeAttribute('role'); });
Object.keys(p.stones).forEach(function (cell) { self.cellEls[+cell].innerHTML = '<span class="stone">' + p.stones[cell] + '</span>'; });
var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
svg.setAttribute('class', 'overlay'); svg.setAttribute('viewBox', '0 0 ' + n + ' ' + n); svg.setAttribute('aria-hidden', 'true');
svg.setAttribute('preserveAspectRatio', 'none');
b.cells.appendChild(svg);
this.svg = svg;
this.stage.appendChild(el('p', { 'class': 'howto' }, 'Start on stone 1 and drag through the squares, or tap the next square. Tap a square on your path to back up to it. Keyboard: focus the board, then arrows extend the path and <kbd>Backspace</kbd> steps back. Thick dark bars are hedges you can’t cross.'));
function cellAt(ev) {
var rect = b.cells.getBoundingClientRect();
var c = Math.floor((ev.clientX - rect.left) / rect.width * n), r = Math.floor((ev.clientY - rect.top) / rect.height * n);
return r >= 0 && c >= 0 && r < n && c < n ? r * n + c : -1;
}
var drawing = false, moved = false;
b.cells.addEventListener('pointerdown', function (ev) {
if (self.done) return;
var k = cellAt(ev);
if (k < 0) return;
ev.preventDefault();
try { b.cells.setPointerCapture(ev.pointerId); } catch (e) { /* older browsers */ }
drawing = true; moved = false;
self.history.push(self.snapshot());
var head = self.user.path[self.user.path.length - 1];
if (k !== head && !self.pathStep(k)) { /* tapping elsewhere just starts a drag */ }
self.refresh();
});
b.cells.addEventListener('pointermove', function (ev) {
if (!drawing) return;
var k = cellAt(ev), u = self.user;
if (k < 0 || k === u.path[u.path.length - 1]) return;
moved = true;
if (k === u.path[u.path.length - 2]) u.path.pop();
else if (u.path.indexOf(k) < 0) self.pathStep(k);
self.refresh();
});
function end() {
if (!drawing) return;
drawing = false;
var last = self.history[self.history.length - 1];
if (last && JSON.stringify(last.path) === JSON.stringify(self.user.path)) self.history.pop();
self.hint = null; self.hintEl.hidden = true;
self.save(); self.refresh(); self.checkSolved();
}
b.cells.addEventListener('pointerup', end);
b.cells.addEventListener('pointercancel', end);
b.cells.addEventListener('keydown', function (ev) {
var u = self.user, head = u.path[u.path.length - 1], r = Math.floor(head / n), c = head % n, k = -1;
if (ev.key === 'ArrowUp' && r > 0) k = head - n;
else if (ev.key === 'ArrowDown' && r < n - 1) k = head + n;
else if (ev.key === 'ArrowLeft' && c > 0) k = head - 1;
else if (ev.key === 'ArrowRight' && c < n - 1) k = head + 1;
if (/^Arrow/.test(ev.key)) {
ev.preventDefault();
if (k < 0) return;
self.change(function () { if (k === u.path[u.path.length - 2]) u.path.pop(); else self.pathStep(k); });
} else if (ev.key === 'Backspace' || ev.key === 'Delete') {
ev.preventDefault();
if (u.path.length > 1) self.change(function () { u.path.pop(); });
} else if (ev.key === 'z' && (ev.ctrlKey || ev.metaKey)) { ev.preventDefault(); self.undo(); }
});
void g;
},
update: function () {
var p = this.p, n = p.n, g = this.mod.geom(p), u = this.user, svg = this.svg;
var pts = u.path.map(function (k) { return ((k % n) + 0.5) + ',' + (Math.floor(k / n) + 0.5); }).join(' ');
var s = '';
(p.hedges || []).forEach(function (e) {
var a = g.edges[e][0], bb = g.edges[e][1], r = Math.floor(a / n), c = a % n;
if (bb === a + 1) s += '<line class="hedge" x1="' + (c + 1) + '" y1="' + r + '" x2="' + (c + 1) + '" y2="' + (r + 1) + '"/>';
else s += '<line class="hedge" x1="' + c + '" y1="' + (r + 1) + '" x2="' + (c + 1) + '" y2="' + (r + 1) + '"/>';
});
Object.keys(u.pencil).forEach(function (e) {
var a = g.edges[e][0], bb = g.edges[e][1];
var x1 = a % n + 0.5, y1 = Math.floor(a / n) + 0.5, x2 = bb % n + 0.5, y2 = Math.floor(bb / n) + 0.5;
if (u.pencil[e] === 1) s += '<line class="pencil" x1="' + x1 + '" y1="' + y1 + '" x2="' + x2 + '" y2="' + y2 + '"/>';
else { var mx = (x1 + x2) / 2, my = (y1 + y2) / 2, dx = (y2 - y1) * 0.18, dy = (x2 - x1) * 0.18; s += '<line class="nope" x1="' + (mx - dx) + '" y1="' + (my - dy) + '" x2="' + (mx + dx) + '" y2="' + (my + dy) + '"/>'; }
});
s += '<polyline class="route" points="' + pts + '"/>';
var head = u.path[u.path.length - 1];
s += '<circle class="head" cx="' + ((head % n) + 0.5) + '" cy="' + (Math.floor(head / n) + 0.5) + '" r=".14"/>';
svg.innerHTML = s;
var hl = this.markHints(), on = {};
u.path.forEach(function (k) { on[k] = 1; });
this.cellEls.forEach(function (cell, k) {
cell.style.backgroundColor = on[k] ? 'var(--leaf)' : '';
cell.classList.toggle('hl-focus', !!hl.focus[k]);
cell.classList.toggle('hl-target', !!hl.target[k]);
});
this.cellsEl.setAttribute('aria-label', 'Garden Path board, ' + n + ' by ' + n + '. Path at ' + cname(head, n) + ', ' + u.path.length + ' of ' + n * n + ' squares.');
if (!this.done) this.statusEl.textContent = 'Path at ' + cname(head, n) + ' · ' + u.path.length + ' of ' + n * n + ' squares';
}
};
G.autoCross = function (k) {
var mod = this.mod, g = mod.geom(this.p), ci = mod.cellInfo(g, k), u = this.user;
for (var j = 0; j < g.m; j++) {
var a = mod.idx(g, ci.a, ci.i, ci.b, j), b = mod.idx(g, ci.a, j, ci.b, ci.j);
if (a !== k && u[a] === 0) u[a] = 2;
if (b !== k && u[b] === 0) u[b] = 2;
}
};
RENDER.whoplanted = {
build: function () {
var self = this, p = this.p, mod = this.mod, g = mod.geom(p), m = g.m;
var CAT = { who: 'Gardeners', plant: 'Crops', bed: 'Beds', day: 'Days' };
var cl = el('ol', { 'class': 'lg-clues', 'aria-label': 'Clues' });
p.clueTexts.forEach(function (t) { cl.appendChild(el('li', {}, t.replace(/&/g, '&amp;').replace(/</g, '&lt;'))); });
this.stage.appendChild(el('p', { 'class': 'howto', style: 'margin-top:0' }, 'Each gardener planted one crop' + (p.cats.length > 3 ? ', in one bed, on one day' : ' in one bed') + '. Bed 1 is nearest the gate.'));
var cbox = el('details', { 'class': 'lg-cluebox', open: '' });
cbox.appendChild(el('summary', {}, 'Clues (' + p.clueTexts.length + ')'));
cbox.appendChild(cl);
this.stage.appendChild(cbox);
this.clueEls = cl.children;
var tabs = el('div', { 'class': 'lg-tabs', role: 'group', 'aria-label': 'Choose a grid' });
this.stage.appendChild(tabs);
var wrap = el('div', { 'class': 'lg-grids' });
self.showGrid = function (q) {
Array.prototype.forEach.call(wrap.children, function (b, i) { b.classList.toggle('active', i === q); });
Array.prototype.forEach.call(tabs.children, function (b, i) { b.setAttribute('aria-pressed', String(i === q)); });
self.activeGrid = q;
};
this.cellEls = [];
g.pairs.forEach(function (pr, q) {
var a = pr[0], b = pr[1];
var box = el('div', { 'class': 'lg', role: 'grid', 'aria-label': CAT[p.cats[a]] + ' and ' + CAT[p.cats[b]] });
var tb = el('button', { type: 'button', 'aria-pressed': 'false' }, CAT[p.cats[a]] + ' \u00d7 ' + CAT[p.cats[b]]);
tb.addEventListener('click', function () { self.showGrid(q); });
tabs.appendChild(tb);
box.appendChild(el('div', { 'class': 'cap' }, CAT[p.cats[a]] + ' × ' + CAT[p.cats[b]]));
box.appendChild(el('div', {}));
for (var j = 0; j < m; j++) box.appendChild(el('div', { 'class': 'ch', 'aria-hidden': 'true' }, mod.label(p, b, j)));
for (var i = 0; i < m; i++) {
box.appendChild(el('div', { 'class': 'rh', 'aria-hidden': 'true' }, mod.label(p, a, i)));
for (j = 0; j < m; j++) {
var k = mod.idx(g, a, i, b, j);
var c = el('button', { type: 'button', 'class': 'cell', role: 'gridcell', 'data-k': k, 'data-q': q, 'data-i': i, 'data-j': j, tabindex: q === 0 && i === 0 && j === 0 ? '0' : '-1' });
self.cellEls[k] = c;
box.appendChild(c);
}
}
wrap.appendChild(box);
});
this.stage.appendChild(wrap);
self.showGrid(0);
this.stage.appendChild(el('p', { 'class': 'howto' }, 'Tap a square once for ✕ (no), twice for ● (yes), a third time to clear. Keyboard: arrows move inside a grid, <kbd>Tab</kbd> jumps to the next grid, <kbd>Y</kbd> yes, <kbd>N</kbd> no, <kbd>Backspace</kbd> clear.'));
function cycle(k) {
var v = [2, 1, 0][self.user[k]];
self.change(function () { self.user[k] = v; if (v === 1 && self.prefs.autox) self.autoCross(k); });
}
wrap.addEventListener('click', function (ev) { var t = ev.target.closest('.cell'); if (t) cycle(+t.getAttribute('data-k')); });
wrap.addEventListener('keydown', function (ev) {
var t = ev.target.closest('.cell');
if (!t) return;
var q = +t.getAttribute('data-q'), i = +t.getAttribute('data-i'), j = +t.getAttribute('data-j'), k = +t.getAttribute('data-k');
var di = 0, dj = 0;
if (ev.key === 'ArrowUp') di = -1; else if (ev.key === 'ArrowDown') di = 1; else if (ev.key === 'ArrowLeft') dj = -1; else if (ev.key === 'ArrowRight') dj = 1;
if (di || dj) {
ev.preventDefault();
var ni = Math.min(m - 1, Math.max(0, i + di)), nj = Math.min(m - 1, Math.max(0, j + dj));
var pr = g.pairs[q], nk = mod.idx(g, pr[0], ni, pr[1], nj);
Array.prototype.forEach.call(t.parentNode.querySelectorAll('.cell'), function (c) { c.tabIndex = -1; });
self.cellEls[nk].tabIndex = 0; self.cellEls[nk].focus();
return;
}
var v = null;
if (ev.key === ' ' || ev.key === 'Enter') { ev.preventDefault(); cycle(k); return; }
if (ev.key === 'y' || ev.key === 'Y') v = 1; else if (ev.key === 'n' || ev.key === 'N' || ev.key === 'x' || ev.key === 'X') v = 2; else if (ev.key === 'Backspace' || ev.key === 'Delete') v = 0;
if (v !== null) { ev.preventDefault(); self.change(function () { self.user[k] = v; if (v === 1 && self.prefs.autox) self.autoCross(k); }); }
});
Array.prototype.forEach.call(wrap.querySelectorAll('.lg'), function (box) { box.querySelector('.cell').tabIndex = 0; });
},
update: function () {
var self = this, p = this.p, mod = this.mod, g = mod.geom(p), u = this.user, hl = this.markHints();
this.cellEls.forEach(function (c, k) {
var v = u[k], ci = mod.cellInfo(g, k);
c.textContent = v === 1 ? '●' : v === 2 ? '✕' : '';
c.className = 'cell' + (v === 1 ? ' yes' : v === 2 ? ' no' : '') + (hl.focus[k] ? ' hl-focus' : '') + (hl.target[k] ? ' hl-target' : '');
c.setAttribute('aria-label', mod.label(p, ci.a, ci.i) + ' and ' + mod.label(p, ci.b, ci.j) + ': ' + (v === 1 ? 'yes' : v === 2 ? 'no' : 'open'));
});
if (hl && this.hint && this.hint.cells && this.hint.cells.length && this.showGrid) {
var q0 = Math.floor(this.hint.cells[0] / (g.m * g.m));
if (q0 !== this.activeGrid) this.showGrid(q0);
}
var cited = {};
if (this.hint && /^Clue (\d+)/.test(this.hint.text || '')) cited[+/^Clue (\d+)/.exec(this.hint.text)[1] - 1] = 1;
Array.prototype.forEach.call(this.clueEls, function (li, i) { li.className = cited[i] ? 'hl' : ''; });
var yes = 0;
for (var k = 0; k < u.length; k++) if (u[k] === 1 && mod.cellInfo(g, k).a === 0) yes++;
if (!this.done) this.statusEl.textContent = yes + ' of ' + (g.m * (g.C - 1)) + ' matches for the gardeners found';
void self;
}
};
function renderGarden(box) {
var gd = shownGarden(), month = new Date().getUTCMonth();
var count = {};
gd.plants.forEach(function (p) { count[p.type] = (count[p.type] || 0) + 1; });
box.innerHTML = draw.gardenSVG(gd.plants, month, 'Your garden with ' + core.plural(gd.plants.length, 'plant'));
var meta = box.parentNode.querySelector('[data-garden-meta]');
if (meta) meta.innerHTML = gd.plants.length ? '<span>' + core.plural(gd.plants.length, 'plant') + ': ' + TYPES.filter(function (t) { return count[t]; }).map(function (t) { return count[t] + ' from ' + META[t].name; }).join(', ') + '.</span><span>Season: ' + draw.season(month) + ' (it changes with the calendar).</span>'
: '<span>Solve any puzzle and its plant appears here. Nothing ever wilts.</span>';
}
function bindGardenTools(root) {
var exp = root.querySelector('[data-export]'), imp = root.querySelector('[data-import]');
if (exp) exp.addEventListener('click', function () {
var blob = new Blob([JSON.stringify(garden(), null, 1)], { type: 'application/json' }); // cleaned, no duplicates
var a = document.createElement('a');
a.href = URL.createObjectURL(blob); a.download = 'daily-logic-garden-' + today() + '.json';
document.body.appendChild(a); a.click(); a.remove();
});
if (imp) imp.addEventListener('change', function () {
var f = imp.files && imp.files[0], out = root.querySelector('[data-import-msg]');
if (!f) return;
if (f.size > saves.MAX_IMPORT_BYTES) { if (out) out.textContent = 'That file is too large for a Daily Logic Garden export.'; imp.value = ''; return; }
f.text().then(function (txt) {
var r = saves.mergeImport(garden(), JSON.parse(txt), LAUNCH, today());
store.set(GARDEN_KEY, r.garden);
if (out) out.textContent = 'Imported ' + core.plural(r.added, 'plant') + '.' + (r.skipped ? ' ' + core.plural(r.skipped, 'entry', 'entries') + ' skipped (already in your garden or not valid).' : '');
imp.value = '';
Array.prototype.forEach.call(document.querySelectorAll('[data-garden]'), renderGarden); // the garden sits outside the tools section
}).catch(function () { if (out) out.textContent = 'That file is not a Daily Logic Garden export.'; });
});
}
function renderToday(box) {
var done = solvedSet(), key = today();
box.querySelectorAll('[data-today]').forEach(function (card) {
var t = card.getAttribute('data-today');
card.querySelectorAll('[data-level]').forEach(function (a) {
var ok = done[t + '|' + a.getAttribute('data-level') + '|' + key];
a.classList.toggle('done', !!ok);
if (ok) a.setAttribute('aria-label', a.textContent + ', solved today');
});
});
var d = box.querySelector('[data-today-date]');
if (d) d.textContent = longDate(key) + ' (UTC)';
}
function renderArchive(box) {
var done = solvedSet(), t = today(), html = '';
for (var i = 0; i < ARCHIVE_DAYS; i++) {
var key = core.addDays(t, -i);
if (key < LAUNCH) break;
html += '<section class="day"><h3>' + (i === 0 ? 'Today – ' : '') + longDate(key) + '</h3><ul>';
TYPES.forEach(function (ty) {
html += '<li>' + META[ty].name + '<span>' + core.LEVELS.map(function (l) {
var ok = done[ty + '|' + l + '|' + key];
return '<a href="' + META[ty].path + '?date=' + key + '&amp;level=' + l + '" class="' + (ok ? 'done' : '') + '" aria-label="' + META[ty].name + ' ' + core.LEVEL_NAMES[l] + ', ' + key + (ok ? ', solved' : '') + '">' + core.LEVEL_NAMES[l].charAt(0) + '</a>';
}).join('') + '</span></li>';
});
html += '</ul></section>';
}
box.innerHTML = html;
var total = 0;
shownGarden().plants.forEach(function (p) { if (p.key >= core.addDays(t, -(ARCHIVE_DAYS - 1))) total++; });
var sum = document.querySelector('[data-archive-sum]');
var shown = box.querySelectorAll('.day').length;
if (sum) sum.textContent = 'You have solved ' + total + ' of the ' + shown * 15 + ' puzzles listed here on this device.' + (shown < ARCHIVE_DAYS ? ' The archive starts on the launch day, November 2, 2026, and grows to 30 days.' : '');
}
function bindPrintable(form) {
var start = form.querySelector('[name=start]'), out = form.querySelector('[data-pack-msg]');
var t = today(), min = core.addDays(t, -(ARCHIVE_DAYS - 1));
if (min < LAUNCH) min = LAUNCH;
start.min = min; start.max = t; start.value = core.addDays(t, -6) < min ? min : core.addDays(t, -6);
form.addEventListener('submit', function (ev) {
ev.preventDefault();
var from = validDate(start.value) || min;
var level = form.querySelector('[name=level]').value;
var types = TYPES.filter(function (ty) { var b = form.querySelector('[name=t-' + ty + ']'); return b && b.checked; });
if (!types.length) { out.textContent = 'Pick at least one puzzle type.'; return; }
var root = document.querySelector('.print-root'), html = '', keys = [];
for (var i = 0; i < 7; i++) { var key = core.addDays(from, i); if (key > t) break; keys.push(key); }
var jobs = [];
keys.forEach(function (key) { types.forEach(function (ty) { jobs.push([key, ty]); }); });
out.textContent = 'Growing ' + jobs.length + ' puzzles…';
var btn = form.querySelector('button[type=submit]');
btn.disabled = true;
(function next(i) {
if (i < jobs.length) {
var p = D[jobs[i][1]].generate(jobs[i][0], level);
html += draw.printSheet(p, D, META[jobs[i][1]].name + ' – ' + core.LEVEL_NAMES[level] + ' – ' + longDate(jobs[i][0]));
out.textContent = 'Growing puzzle ' + (i + 1) + ' of ' + jobs.length + '…';
setTimeout(function () { next(i + 1); }, 0);
return;
}
root.innerHTML = html;
document.body.classList.add('has-print');
var prev = document.querySelector('[data-pack-preview]');
if (prev) prev.innerHTML = '<p>Ready: ' + core.plural(jobs.length, 'puzzle') + ' from ' + longDate(keys[0]) + ' to ' + longDate(keys[keys.length - 1]) + ', one per page. The pack opens in your browser’s print dialog; choose “Save as PDF” there to keep a file.</p>';
out.textContent = 'Pack ready – ' + core.plural(jobs.length, 'page') + '.';
form.setAttribute('data-ready', String(jobs.length));
btn.disabled = false;
window.print();
})(0);
});
}
function init() {
Array.prototype.forEach.call(document.querySelectorAll('[data-game]'), function (r) { r.__game = new Game(r); });
Array.prototype.forEach.call(document.querySelectorAll('[data-garden]'), renderGarden);
Array.prototype.forEach.call(document.querySelectorAll('[data-garden-tools]'), bindGardenTools);
Array.prototype.forEach.call(document.querySelectorAll('[data-today-box]'), renderToday);
Array.prototype.forEach.call(document.querySelectorAll('[data-archive]'), renderArchive);
Array.prototype.forEach.call(document.querySelectorAll('form[data-printable]'), bindPrintable);
}
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();