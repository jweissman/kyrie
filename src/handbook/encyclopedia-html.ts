import type { Entry, Section, Table } from './model';
import type { Chapter, Encyclopedia } from './encyclopedia';
import { HandbookHtml } from './render-html';
import { Identity } from '../presentation/identity';
import { Emblems } from '../presentation/emblems';

// The Encyclopedia as pages of a book in parchment and ink (see css): a title page of chapters and a search over every
// entry, and a page for each chapter, its contents beside it, each entry a short article with what it is, what it is
// like, what it does in play, and where to read on.
export class EncyclopediaHtml {
  private readonly where: ReturnType<Encyclopedia['where']>;
  constructor(readonly book: Encyclopedia) { this.where = book.where(); }
  static readonly title = 'The Encyclopedia of Imbar';
  private static esc(s: string): string { return HandbookHtml.esc(s); }
  private link(id: string): string {
    const w = this.where.get(id);
    return w ? `<a href="${w.chapter}.html#${HandbookHtml.anchor(id)}">${EncyclopediaHtml.emblem(id, 'emblem inline')}${
      EncyclopediaHtml.esc(w.title)}</a>` : '';
  }
  page(title: string, body: string, current?: string): string {
    const nav = this.book.chapters.map(c => `<a href="${c.id}.html"${c.id === current ? ' aria-current="page"' : ''}>`
      + `${EncyclopediaHtml.esc(c.title)}</a>`).join('');
    return '<!doctype html>\n<html lang="en"><head><meta charset="utf-8">'
      + '<meta name="viewport" content="width=device-width,initial-scale=1"><meta name="theme-color" content="#EFE6D2">'
      + `<title>${EncyclopediaHtml.esc(title)}</title><style>${EncyclopediaHtml.css}</style></head><body>`
      + `<header class="bar"><a class="brand" href="../index.html">${Identity.spoken()}</a>`
      + `<a class="home" href="index.html">The Encyclopedia</a><nav>${nav}</nav></header>${body}`
      + `<script>${EncyclopediaHtml.script}</script></body></html>\n`;
  }
  // The title page: what the book is, its chapters, and a search over everything in it.
  landing(): string {
    const index = [...this.where].map(([id, w]) => [w.title, w.kind ?? '', `${w.chapter}.html#${HandbookHtml.anchor(id)}`]);
    const cards = this.book.chapters.map(c => {
      const n = EncyclopediaHtml.count(c.sections);
      return `<a class="card" href="${c.id}.html"><h2>${EncyclopediaHtml.esc(c.title)}</h2>`
        + `${c.lede.map(p => `<p>${EncyclopediaHtml.esc(p)}</p>`).join('')}<span class="n">${n} entries</span></a>`;
    }).join('');
    const body = '<main class="landing"><p class="over">A reference for travellers</p>'
      + `<h1>${EncyclopediaHtml.title}</h1><p class="lede">Imbar is old, and full of people who were there before you: `
      + 'farmers and clerks, priests and thieves, the folk of the hills and the things under them. This book tells what '
      + 'is known of its peoples and callings, its magic, its creatures and the countries spoken of at its inns. What '
      + 'your own protagonist knows is in their notes; this is what anyone might read.</p>'
      + '<input type="search" id="find-all" placeholder="Look something up" aria-label="Look something up">'
      + `<ol id="found" hidden></ol><div class="cards">${cards}</div>`
      + `<script type="application/json" id="index">${JSON.stringify(index).replace(/</g, '\\u003c')}</script></main>`;
    return this.page(EncyclopediaHtml.title, body);
  }
  chapter(c: Chapter): string {
    const contents = c.sections.map(s => `<li><a href="#${HandbookHtml.anchor(s.id)}">${EncyclopediaHtml.esc(s.title)}</a>`
      + `${s.sections?.length && s.sections.length < 20 ? `<ol>${s.sections.map(x => `<li><a href="#${
        HandbookHtml.anchor(x.id)}">${EncyclopediaHtml.esc(x.title)}</a></li>`).join('')}</ol>` : ''}</li>`).join('');
    const body = `<div class="layout"><aside class="toc"><input type="search" id="find" placeholder="Search ${
      EncyclopediaHtml.esc(c.title.toLowerCase())}" aria-label="Search"><nav><ol>${contents}</ol></nav></aside>`
      + `<main id="book"><h1>${EncyclopediaHtml.esc(c.title)}</h1>${c.lede.map(p => `<p class="lede">${
        EncyclopediaHtml.esc(p)}</p>`).join('')}${c.sections.map(s => this.section(s, 2)).join('')}`
      + '<p id="nothing" hidden>Nothing here by that name.</p></main></div>';
    return this.page(`${c.title} · ${EncyclopediaHtml.title}`, body, c.id);
  }
  private section(s: Section, depth: number): string {
    const h = `h${Math.min(depth, 4)}`;
    return `<section id="${HandbookHtml.anchor(s.id)}" class="sec"><${h}>${EncyclopediaHtml.esc(s.title)}</${h}>`
      + (s.intro ?? []).map(p => `<p class="intro">${EncyclopediaHtml.esc(p)}</p>`).join('')
      + (s.table ? this.table(s.table) : '') + (s.entries?.length ? `<div class="entries">${
        s.entries.map(e => this.entry(e)).join('')}</div>` : '')
      + (s.sections ?? []).map(x => this.section(x, depth + 1)).join('') + '</section>';
  }
  private table(t: Table): string {
    const rows = t.rows.map((r, i) => `<tr class="item"${t.ids?.[i] ? ` id="${HandbookHtml.anchor(t.ids[i]!)}"` : ''}>`
      + r.map(c => `<td>${EncyclopediaHtml.esc(c)}</td>`).join('') + '</tr>').join('');
    return `<div class="scroll"><table><thead><tr>${t.head.map(h => `<th>${EncyclopediaHtml.esc(h)}</th>`).join('')}`
      + `</tr></thead><tbody>${rows}</tbody></table></div>`;
  }
  // A people's, a calling's, a way's or a kind of life's emblem beside its name, drawn as creation and play draw it
  // (the owner, 5 November: the Encyclopedia teaches the same signs).
  private static emblem(id: string, className?: string): string {
    const of = /^(?:ancestry|class|trait):(.+)$/.exec(id)?.[1] ?? /^backgrounds-(.+)$/.exec(id)?.[1]?.replace(/^/, 'life_');
    return of ? Emblems.svg(of, className) : '';
  }
  private entry(e: Entry): string {
    const see = [...new Set(e.refs ?? [])].filter(id => id !== e.id).map(id => this.link(id)).filter(Boolean);
    return `<article class="item entry" id="${HandbookHtml.anchor(e.id)}"><h3>${EncyclopediaHtml.emblem(e.id)}${
      EncyclopediaHtml.esc(e.title)}</h3>`
      // A creature by its painting, as play shows it (the owner, 6 November: the bestiary and the menagerie).
      + (e.painting ? `<img class="painting" src="../paintings/${EncyclopediaHtml.esc(e.painting)}.webp" alt="" loading="lazy">`
        : '')
      + (e.kind ? `<p class="kind">${EncyclopediaHtml.esc(e.kind)}</p>` : '')
      + (e.text ?? []).map(p => `<p class="text">${EncyclopediaHtml.esc(p)}</p>`).join('')
      + (e.facts?.length ? `<dl>${e.facts.map(([k, v]) => `<dt>${EncyclopediaHtml.esc(k)}</dt><dd>${
        EncyclopediaHtml.esc(v)}</dd>`).join('')}</dl>` : '')
      + (e.rules?.length ? `<div class="rules"><p class="label">In play</p>${e.rules.map(r => `<p>${
        EncyclopediaHtml.esc(r)}</p>`).join('')}</div>` : '')
      + (see.length ? `<p class="see"><span class="label">See also</span> ${see.join(', ')}</p>` : '') + '</article>';
  }
  private static count(ss: Section[]): number {
    return ss.reduce((n, s) => n + (s.entries?.length ?? 0) + (s.table?.rows.length ?? 0)
      + EncyclopediaHtml.count(s.sections ?? []), 0);
  }
  // Parchment and ink (the owner, 14 November, CN-11: "a coherent parchment-and-ink design, harmonize its
  // illustrations with that surface, and check readability on tablet"): a bound reference's page, its ground a laid
  // paper drawn in gradients (no image), its type and rules in ink, a running head over it, an oxblood ink for what can
  // be gone to. Its illustrations are plates printed onto the page: in sepia, multiplied into the paper within a ruled
  // frame, never a photograph laid on it. Light by design, in either mode: a book is read on its paper, and every
  // colour is measured against it (body ink 12:1, the dim ink 6.4:1, the links 7.5:1, the faintest 4.8:1).
  static readonly css = `
@font-face { font-family: 'Jost'; src: url(../fonts/jost-normal-latin.woff2) format('woff2'); font-weight: 300 800; }
@font-face { font-family: 'Newsreader'; src: url(../fonts/newsreader-normal-latin.woff2) format('woff2'); font-weight: 300 700; }
@font-face { font-family: 'Newsreader'; font-style: italic; src: url(../fonts/newsreader-italic-latin.woff2) format('woff2'); }
:root { color-scheme: light; --paper: #EFE6D2; --paper-deep: #E4D8BE; --ink: #2B241B; --dim: #5B4F3F; --faint: #6E6150;
  --rule: rgba(43,36,27,.24); --hair: rgba(43,36,27,.12); --link: #7A2E1F; --sepia: #6B4A2B;
  --read: 'Newsreader', Georgia, serif; --do: 'Jost', 'Avenir Next', 'Helvetica Neue', Arial, sans-serif; }
* { box-sizing: border-box; }
html { background: var(--paper-deep); }
body { margin: 0; color: var(--ink); font: 18px/1.6 var(--read); min-height: 100vh;
  background:
    radial-gradient(120% 90% at 50% 40%, rgba(255,250,236,.55), rgba(255,250,236,0) 60%),
    radial-gradient(140% 120% at 50% 50%, rgba(0,0,0,0) 62%, rgba(92,66,32,.16) 100%),
    repeating-linear-gradient(0deg, rgba(92,66,32,.025) 0 1px, rgba(0,0,0,0) 1px 3px),
    var(--paper); }
a { color: var(--link); text-decoration: none; } a:hover { text-decoration: underline; text-decoration-thickness: 1px;
  text-underline-offset: 3px; }
/* The running head: the book's name and its chapters in small capitals, a double rule beneath. */
.bar { position: sticky; top: 0; z-index: 2; display: flex; flex-wrap: wrap; gap: 6px 18px; align-items: baseline;
  padding: 12px 32px 10px; background: var(--paper); border-bottom: 3px double var(--rule);
  font: 500 11.5px/1.4 var(--do); letter-spacing: .16em; text-transform: uppercase; }
.bar .brand { color: var(--ink); letter-spacing: .3em; } .bar .home { color: var(--dim); }
.bar nav { display: flex; flex-wrap: wrap; gap: 4px 16px; } .bar nav a { color: var(--dim); }
.bar nav a[aria-current] { color: var(--ink); border-bottom: 1px solid var(--ink); }
.landing { max-width: 1000px; margin: 0 auto; padding: 56px 40px 80px; }
.over, .label, .kind { font: 500 11px/1.4 var(--do); letter-spacing: .2em; text-transform: uppercase; color: var(--faint); }
h1 { font: 400 44px/1.1 var(--read); margin: 6px 0 18px; letter-spacing: .005em; }
.landing h1 { text-align: center; } .landing .over { text-align: center; }
.landing h1::after { content: '❦'; display: block; font-size: 18px; color: var(--sepia); margin-top: 14px; }
.lede { max-width: 62ch; font-size: 19px; color: var(--ink); }
.landing .lede { margin: 0 auto 8px; text-align: center; font-style: italic; }
input[type=search] { width: 100%; max-width: 520px; margin: 18px 0; padding: 9px 2px; background: transparent;
  color: var(--ink); border: 0; border-bottom: 1px solid var(--rule); font: 17px var(--read); font-style: italic; }
input[type=search]::placeholder { color: var(--faint); } input[type=search]:focus { outline: none; border-bottom-color: var(--ink); }
.landing input[type=search] { display: block; margin: 22px auto; text-align: center; }
#found { list-style: none; padding: 0; max-width: 640px; margin: 0 auto; }
#found li { padding: 6px 0; border-bottom: 1px solid var(--hair); }
#found .k { color: var(--faint); font: 13px var(--do); margin-left: 10px; }
/* The chapters as a book's contents: ruled, not boxed. */
.cards { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 0 40px; margin-top: 28px;
  border-top: 1px solid var(--rule); }
.card { display: block; padding: 18px 0 16px; border-bottom: 1px solid var(--hair); color: var(--ink); }
.card:hover { text-decoration: none; } .card:hover h2 { color: var(--link); }
.card h2 { font: 400 23px/1.2 var(--read); margin: 0 0 6px; color: var(--ink); border: 0; padding: 0; }
.card p { margin: 0 0 8px; color: var(--dim); font-size: 16px; }
.card .n { font: 500 10.5px var(--do); letter-spacing: .2em; text-transform: uppercase; color: var(--faint); }
.layout { display: grid; grid-template-columns: 240px minmax(0, 1fr); gap: 40px; max-width: 1200px; margin: 0 auto;
  padding: 0 32px; }
.toc { position: sticky; top: 52px; align-self: start; max-height: calc(100vh - 60px); overflow: auto; padding: 28px 0;
  font: 14px/1.55 var(--do); } .toc ol { list-style: none; padding-left: 0; margin: 0; } .toc ol ol { padding-left: 14px; }
.toc a { color: var(--dim); } .toc a:hover { color: var(--link); } .toc input { margin-top: 0; }
#book { padding: 36px 0 80px; min-width: 0; }
#book > h1 { border-bottom: 1px solid var(--rule); padding-bottom: 12px; }
h2 { font: 400 28px/1.2 var(--read); margin: 52px 0 12px; padding-bottom: 8px; border-bottom: 1px solid var(--rule);
  font-variant: small-caps; letter-spacing: .03em; }
h3 { font: 600 19px/1.3 var(--read); margin: 0 0 4px; } h4 { font: 500 13px/1.3 var(--do); letter-spacing: .18em;
  text-transform: uppercase; color: var(--dim); margin: 30px 0 10px; }
.intro { max-width: 66ch; color: var(--dim); font-style: italic; }
/* Entries set as a reference sets them: in two columns where the page is wide enough for two measures, ruled between,
   each kept whole. */
.entries { columns: 2 330px; column-gap: 44px; column-rule: 1px solid var(--hair); }
.entry { break-inside: avoid; padding: 14px 0 16px; border-bottom: 1px solid var(--hair); scroll-margin-top: 104px; }
.entry:target { background: linear-gradient(90deg, rgba(122,46,31,.08), rgba(122,46,31,0)); }
/* A plate: the picture in sepia, multiplied into the paper inside an inked frame with a margin of paper. */
.entry .painting { float: right; width: 150px; height: 150px; object-fit: cover; margin: 4px 0 10px 16px; padding: 5px;
  background: var(--paper-deep); border: 1px solid var(--rule); outline: 1px solid var(--hair); outline-offset: 3px;
  filter: sepia(.55) saturate(.7) contrast(1.02) brightness(1.02); mix-blend-mode: multiply; }
.entry::after { content: ''; display: block; clear: both; }
@media (max-width: 560px) { .entry .painting { width: 100px; height: 100px; } }
.entry h3 { display: flex; align-items: center; gap: 10px; }
.emblem.inline { width: 1.05em; height: 1.05em; margin-right: .25em; vertical-align: -.15em; stroke-width: 1.6; }
.emblem { width: 26px; height: 26px; flex: none; fill: none; stroke: var(--sepia); stroke-width: 1.4; stroke-linecap: round;
  stroke-linejoin: round; }
.entry .text { font-style: italic; margin: 8px 0; } .entry dl { display: grid; grid-template-columns: auto 1fr; gap: 2px 12px;
  margin: 8px 0; font: 14px/1.5 var(--do); } .entry dt { color: var(--dim); } .entry dd { margin: 0; }
.rules { margin-top: 10px; padding-top: 8px; border-top: 1px dotted var(--rule); font-size: 16px; } .rules p { margin: 4px 0; }
.see { font-size: 15px; margin: 10px 0 0; } .see .label { margin-right: 8px; }
.scroll { overflow-x: auto; } table { border-collapse: collapse; font: 14px/1.45 var(--do); margin: 8px 0 18px;
  border-top: 2px solid var(--ink); border-bottom: 2px solid var(--ink); }
th, td { text-align: left; padding: 6px 14px 6px 0; border-bottom: 1px solid var(--hair); vertical-align: top; }
th { color: var(--dim); font-weight: 500; border-bottom: 1px solid var(--rule); } tr:target td { color: var(--link); }
@media (max-width: 900px) { .layout { grid-template-columns: 200px minmax(0, 1fr); gap: 28px; padding: 0 24px; } }
@media (max-width: 760px) { .layout { grid-template-columns: 1fr; } .toc { position: static; max-height: none; }
  h1 { font-size: 34px; } .entries { columns: 1; } .bar { padding: 10px 16px; } .landing, .layout { padding: 0 18px; } }
`;
  // The search: on a chapter page, entries and rows hide as you type; on the title page, every entry by its name.
  static readonly script = `
(() => {
  const find = document.getElementById('find');
  if (find) { find.addEventListener('input', () => { const q = find.value.trim().toLowerCase(); let any = false;
    document.querySelectorAll('.item').forEach(el => { const on = !q || el.textContent.toLowerCase().includes(q);
      el.hidden = !on; any = any || on; }); document.getElementById('nothing').hidden = any; }); }
  const all = document.getElementById('find-all'), found = document.getElementById('found');
  if (all) { const index = JSON.parse(document.getElementById('index').textContent);
    all.addEventListener('input', () => { const q = all.value.trim().toLowerCase(); found.innerHTML = '';
      found.hidden = q.length < 2; if (q.length < 2) { return; }
      index.filter(([t]) => t.toLowerCase().includes(q)).slice(0, 40).forEach(([t, k, href]) => {
        const li = document.createElement('li'), a = document.createElement('a'); a.href = href; a.textContent = t;
        li.appendChild(a); if (k) { const s = document.createElement('span'); s.className = 'k'; s.textContent = k;
          li.appendChild(s); } found.appendChild(li); }); });
    // Opened from the game at an entry (?id=item-lantern) or a name (?q=lantern): to the entry, or its search.
    const asked = new URLSearchParams(location.search), id = asked.get('id'), q = asked.get('q');
    const at = id && index.find(([, , href]) => href.endsWith('#' + id));
    if (at) { location.replace(at[2]); }
    else if (q || id) { all.value = q || id.replace(/^[a-z]+-/, '').replace(/-/g, ' '); all.dispatchEvent(new Event('input')); }
  }
})();
`;
}
