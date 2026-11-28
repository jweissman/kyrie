import type { Entry, Section, Table } from './model';
import type { Chapter, Encyclopedia } from './encyclopedia';
import { HandbookHtml } from './render-html';
import { Identity } from '../presentation/identity';
import { Folio } from './folio';
import { Signs } from '../presentation/signs';
import { Emblems } from '../presentation/emblems';
import { SpellSchools } from '../presentation/spell-schools';
import { StatBlock } from './stat-block';

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
  // A page of the book by its tab on the table, the open one marked as the Book's are.
  private static tab(href: string, said: string, open: boolean): string {
    return `<a class="sheet-key" href="${href}"${open ? ' aria-current="page"' : ''}>${EncyclopediaHtml.esc(said)}</a>`;
  }
  page(title: string, body: string, current?: string): string {
    const nav = [EncyclopediaHtml.tab('index.html', 'The Encyclopedia', !current),
      ...this.book.chapters.map(c => EncyclopediaHtml.tab(`${c.id}.html`, c.title, c.id === current))].join('');
    // Its head on the table, as the Book's is: the way back to the game, then its pages; opened over the game, the
    // game's head holds the way back (.within).
    return '<!doctype html>\n<html lang="en"><head><meta charset="utf-8">'
      + `<meta name="viewport" content="width=device-width,initial-scale=1"><meta name="theme-color" content="${Folio.ink.table}">`
      + `<title>${EncyclopediaHtml.esc(title)}</title><style>${Folio.book}${EncyclopediaHtml.css}</style>`
      + '<script>if (self !== top) { document.documentElement.classList.add(\'within\'); }</script></head><body>'
      + `<header class="head"><a class="back-to" href="../index.html"><span class="back-sign" aria-hidden="true">${
        Signs.whither.Out}</span>${Identity.spoken()}</a><nav class="sheets" aria-label="Chapters">${nav}</nav></header>`
      + `<div class="leaf"><div class="folio">${body}</div></div>`
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
  // (the owner, 5 November: the Encyclopedia teaches the same signs); a spell's, its school's or domain's (OR-92).
  private static emblem(id: string, className?: string): string {
    const spell = /^ability:(.+)$/.exec(id)?.[1];
    const of = /^(?:ancestry|class|trait):(.+)$/.exec(id)?.[1] ?? /^backgrounds-(.+)$/.exec(id)?.[1]?.replace(/^/, 'life_')
      ?? (spell && SpellSchools.emblem(spell));
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
      + (e.parts ?? []).map(([h, p]) => `<p class="text part"><b class="run-in">${EncyclopediaHtml.esc(h)}.</b> ${
        EncyclopediaHtml.esc(p)}</p>`).join('')
      + (StatBlock.html(e, EncyclopediaHtml.esc) ?? (e.facts?.length ? `<dl>${e.facts.map(([k, v]) => `<dt>${
        EncyclopediaHtml.esc(k)}</dt><dd>${EncyclopediaHtml.esc(v)}</dd>`).join('')}</dl>` : ''))
      + (e.rules?.length ? `<div class="rules"><p class="label">In play</p>${e.rules.map(r => `<p>${
        EncyclopediaHtml.esc(r)}</p>`).join('')}</div>` : '')
      + (see.length ? `<p class="see"><span class="label">See also</span> ${see.join(', ')}</p>` : '') + '</article>';
  }
  private static count(ss: Section[]): number {
    return ss.reduce((n, s) => n + (s.entries?.length ?? 0) + (s.table?.rows.length ?? 0)
      + EncyclopediaHtml.count(s.sections ?? []), 0);
  }
  // Parchment and ink (the owner, 14 November, CN-11: "a coherent parchment-and-ink design, harmonize its
  // illustrations with that surface, and check readability on tablet"), as a page of the game's own Book (the owner,
  // 27 November: "the change in tone for the encyclopedia is really galling"; OR-1830): laid by Folio.book as the
  // Book's pages are, in the game's two faces and its type scale (a page's name in the light sans, a kicker's small
  // capitals, the told words in the book face), its words in the paper's inks alone, never a hue (a link is ink,
  // underlined with a hair), set ragged right from the safe zone's edge as every page of the Book is, not centred.
  // Its illustrations are plates printed onto the page: in sepia, multiplied into the paper within a ruled frame,
  // never a photograph laid on it. Light by design, in either mode: a book is read on its paper, and every ink is
  // measured against it.
  static readonly css = `
:root { color-scheme: light; --paper: ${Folio.ink.paper}; --paper-deep: ${Folio.ink.deep}; --ink: ${Folio.ink.ink};
  --dim: ${Folio.ink.dim}; --faint: ${Folio.ink.faint}; --rule: ${Folio.ink.rule}; --hair: ${Folio.ink.hair};
  --sepia: ${Folio.ink.sepia}; --choice-ground: rgba(42, 33, 25, .05); --choice-edge: rgba(42, 33, 25, .15); }
* { box-sizing: border-box; }
body { color: var(--ink); font: 400 18px/1.6 var(--told); }
a { color: var(--ink); text-decoration: none; }
.see a, #found a { text-decoration: underline 1px var(--rule); text-underline-offset: 3px; }
.folio a:hover { text-decoration: underline 1px var(--ink); text-underline-offset: 3px; }
.over, .label, .kind { font: 500 11.5px/1.3 var(--do); letter-spacing: .22em; text-transform: uppercase; color: var(--dim); }
/* A page's name on the paper as the Book's are (Notes, The story so far: folio.css). */
h1 { margin: 0 0 22px; font: 300 34px/1.1 var(--do); letter-spacing: .01em; }
.landing .over { margin: 0 0 10px; }
.lede { max-width: 62ch; font: italic 400 19px/1.55 var(--told); color: var(--ink); }
/* The search as the story's is (stage.css: .story-search). */
input[type=search] { display: block; width: 100%; max-width: 22em; margin: 18px 0; padding: 9px 12px; color: var(--ink);
  background: var(--choice-ground); border: 1px solid var(--choice-edge); border-radius: 8px; font: 400 15px/1.3 var(--do); }
input[type=search]::placeholder { color: var(--dim); } input[type=search]:focus-visible { outline: none; border-color: var(--ink); }
#found { list-style: none; padding: 0; max-width: 640px; margin: 0; }
#found li { padding: 6px 0; border-bottom: 1px solid var(--hair); }
#found .k { color: var(--dim); font: 13.5px var(--do); margin-left: 10px; }
/* The chapters as a book's contents: ruled, not boxed. */
.cards { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 0 40px; margin-top: 28px;
  border-top: 1px solid var(--rule); }
.card { display: block; padding: 18px 0 16px; border-bottom: 1px solid var(--hair); color: var(--ink); }
.folio .card:hover { text-decoration: none; } .card:hover h2 { text-decoration: underline 1px var(--ink); text-underline-offset: 4px; }
.card h2 { font: 300 24px/1.2 var(--do); margin: 0 0 6px; color: var(--ink); border: 0; padding: 0; }
.card p { margin: 0 0 8px; color: var(--dim); font-size: 16px; }
.card .n { font: 500 11.5px/1.3 var(--do); letter-spacing: .22em; text-transform: uppercase; color: var(--dim); }
.layout { display: grid; grid-template-columns: 220px minmax(0, 1fr); gap: 40px; }
.toc { position: sticky; top: 0; align-self: start; max-height: 76vh; overflow: auto; padding: 4px 0;
  font: 400 14.5px/1.55 var(--do); } .toc ol { list-style: none; padding-left: 0; margin: 0; } .toc ol ol { padding-left: 14px; }
.toc a { color: var(--dim); } .toc a:hover { color: var(--ink); } .toc input { margin-top: 0; }
#book { min-width: 0; }
h2 { font: 300 26px/1.2 var(--do); margin: 48px 0 12px; padding-bottom: 8px; border-bottom: 1px solid var(--rule); }
h3 { font: 600 19px/1.3 var(--told); margin: 0 0 4px; } h4 { font: 500 11.5px/1.3 var(--do); letter-spacing: .22em;
  text-transform: uppercase; color: var(--dim); margin: 30px 0 10px; }
.intro { max-width: 66ch; color: var(--dim); font-style: italic; }
/* Entries set as a reference sets them: in two columns where the page is wide enough for two measures, ruled between,
   each kept whole. The one gone to is lit as a row of the Book is, in neutral ink. */
.entries { columns: 2 330px; column-gap: 44px; column-rule: 1px solid var(--hair); }
.entry { break-inside: avoid; padding: 14px 0 16px; border-bottom: 1px solid var(--hair); scroll-margin-top: 16px; }
.entry:target, tr:target td { background: rgba(42, 33, 25, .07); }
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
${StatBlock.css('var(--ink)')}
.entry .text { font-style: italic; margin: 8px 0; } .entry .text.part { font-style: normal; }
/* A part's head run in to its paragraph, as an encyclopedia sets it (OR-1801). */
.entry .run-in { font: 600 .74em/1 var(--do); letter-spacing: .12em; text-transform: uppercase; }
.entry dl { display: grid; grid-template-columns: auto 1fr; gap: 2px 12px;
  margin: 8px 0; font: 14.5px/1.5 var(--do); } .entry dt { color: var(--dim); } .entry dd { margin: 0; }
/* Set as a book is set (the owner's second design opinion, 24 November): paragraphs indented, not gapped, ragged
   right; a drop cap where a chapter or an entry begins, nowhere else, in the page's ink. */
p { text-align: left; hyphens: manual; }
.text + .text, .lede + .lede, .intro + .intro, .rules p + p { margin-top: 0; text-indent: 1.4em; }
.entry .text:first-of-type::first-letter, #book > .lede:first-of-type::first-letter { float: left; margin: .06em .08em 0 0;
  font: 400 3.1em/.82 var(--told); font-style: normal; color: var(--ink); }
.rules { margin-top: 10px; padding-top: 8px; border-top: 1px dotted var(--rule); font-size: 16px; } .rules p { margin: 4px 0; }
.see { font-size: 15px; margin: 10px 0 0; } .see .label { margin-right: 8px; }
.scroll { overflow-x: auto; } table { border-collapse: collapse; font: 14.5px/1.45 var(--do); margin: 8px 0 18px;
  border-top: 1px solid var(--rule); border-bottom: 1px solid var(--rule); }
th, td { text-align: left; padding: 6px 14px 6px 0; border-bottom: 1px solid var(--hair); vertical-align: top; }
th { color: var(--dim); font-weight: 500; border-bottom: 1px solid var(--rule); }
/* On a tablet the contents stand over the chapter, and its tables are set to be read and touched (OR-1085: the stat
   table had been too small to read at 820); the chapters, past the head's width, one line that scrolls. */
@media (max-width: 1024px) { .layout { grid-template-columns: minmax(0, 1fr); gap: 0; }
  .toc { position: static; max-height: none; padding: 0; font-size: 16px; } .toc a { display: inline-block; padding: 10px 0; }
  table { font-size: 16px; } th, td { padding: 10px 16px 10px 0; } body { font-size: 19px; }
  .head { flex-wrap: nowrap; } .head .sheets { flex: 1; flex-wrap: nowrap; overflow-x: auto; scrollbar-width: none;
    -webkit-mask-image: linear-gradient(90deg, transparent, #000 28px, #000 calc(100% - 28px), transparent);
    mask-image: linear-gradient(90deg, transparent, #000 28px, #000 calc(100% - 28px), transparent); } }
@media (max-width: 760px) { .entries { columns: 1; } }
`;
  // The search: on a chapter page, entries and rows hide as you type; on the title page, every entry by its name.
  static readonly script = `
(() => {
  // The open chapter in view where the chapters run past the bar's width (a tablet's, a phone's: OR-1085).
  const open = document.querySelector('.head .sheets a[aria-current]'), nav = open && open.parentElement;
  if (nav && nav.scrollWidth > nav.clientWidth) {
    nav.scrollLeft += open.getBoundingClientRect().left - nav.getBoundingClientRect().left - (nav.clientWidth - open.offsetWidth) / 2;
  }
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
