import { HandbookStatus, Statuses, type Book, type Entry, type Section, type Status, type Table } from './model';
import type { Coverage, Placed } from './handbooks';
import { HandbookStyle } from './style';
import { CapabilityAudit, type Audit } from './audit';

// The books as static pages: a contents column, a search that filters entries and table rows as you type, status
// filters, and stable anchors (an entry's id) that other pages and the game link to.
export class HandbookHtml {
  audit?: Audit;
  constructor(readonly index: Map<string, Placed>, readonly books: Book[]) {}
  static esc(s: string): string {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
  static anchor(id: string): string { return id.replace(/[^a-zA-Z0-9]+/g, '-').replace(/^-|-$/g, ''); }
  static badge(s: Status): string { return `<span class="badge s-${s}">${HandbookStatus.label(s)}</span>`; }
  link(id: string): string {
    const p = this.index.get(id);
    return p ? `<a href="${p.book}.html#${HandbookHtml.anchor(id)}">${HandbookHtml.esc(p.title)}</a>` : HandbookHtml.esc(id);
  }
  page(title: string, body: string, current: string): string {
    const nav = [['index', 'Handbooks'], ...this.books.map(b => [b.id, b.title])].map(([id, t]) =>
      `<a href="${id}.html"${id === current ? ' aria-current="page"' : ''}>${HandbookHtml.esc(t!)}</a>`).join('');
    return `<!doctype html>\n<html lang="en"><head><meta charset="utf-8">`
      + '<meta name="viewport" content="width=device-width,initial-scale=1"><meta name="theme-color" content="#110f0c">'
      + `<title>${HandbookHtml.esc(title)} · Kyr</title><style>${HandbookStyle.css}</style></head><body>`
      + `<header class="bar"><a class="brand" href="../index.html">Kyr</a><nav class="books">${nav}</nav></header>${body}`
      + `<script>${HandbookStyle.script}</script></body></html>\n`;
  }
  book(b: Book): string {
    const filters = Statuses.map(s => `<label class="chip s-${s}"><input type="checkbox" value="${s}" checked>`
      + `${HandbookStatus.label(s)}</label>`).join('');
    const body = `<div class="layout"><aside class="toc"><input type="search" id="find" placeholder="Search ${
      HandbookHtml.esc(b.title)}" aria-label="Search"><div class="chips">${filters}</div>`
      + `<details open><summary>Contents</summary><nav>${this.contents(b.sections)}</nav></details></aside>`
      + `<main id="book"><h1>${HandbookHtml.esc(b.title)}</h1>${b.intro.map(p => `<p class="lede">${HandbookHtml.esc(p)}</p>`).join('')}`
      + `${b.sections.map(s => this.section(s, 2)).join('')}<p id="nothing" hidden>Nothing matches.</p></main></div>`;
    return this.page(b.title, body, b.id);
  }
  contents(sections: Section[]): string {
    return `<ol>${sections.map(s => `<li><a href="#${HandbookHtml.anchor(s.id)}">${HandbookHtml.esc(s.title)}</a>`
      + `${s.sections?.length && s.sections.length < 30 ? this.contents(s.sections) : ''}</li>`).join('')}</ol>`;
  }
  section(s: Section, depth: number): string {
    const h = `h${Math.min(depth, 4)}`;
    return `<section id="${HandbookHtml.anchor(s.id)}" class="sec"><${h}>${HandbookHtml.esc(s.title)}</${h}>`
      + (s.intro ?? []).map(p => `<p class="intro">${HandbookHtml.esc(p)}</p>`).join('')
      + (s.table ? this.table(s.table) : '') + (s.entries ?? []).map(e => this.entry(e)).join('')
      + (s.sections ?? []).map(x => this.section(x, depth + 1)).join('') + '</section>';
  }
  table(t: Table): string {
    const rows = t.rows.map((r, i) => {
      const status = t.statuses?.[i], id = t.ids?.[i];
      return `<tr${id ? ` id="${HandbookHtml.anchor(id)}"` : ''} class="item"${status ? ` data-status="${status}"` : ''}>`
        + r.map(c => `<td>${HandbookHtml.esc(c)}</td>`).join('') + '</tr>';
    }).join('');
    return `<div class="scroll"><table><thead><tr>${t.head.map(h => `<th>${HandbookHtml.esc(h)}</th>`).join('')}</tr></thead>`
      + `<tbody>${rows}</tbody></table></div>`;
  }
  entry(e: Entry): string {
    const facts = e.facts?.length ? `<dl>${e.facts.map(([k, v]) => `<dt>${HandbookHtml.esc(k)}</dt><dd>${HandbookHtml.esc(v)}</dd>`)
      .join('')}</dl>` : '';
    const refs = (e.refs ?? []).filter(r => this.index.has(r));
    return `<article id="${HandbookHtml.anchor(e.id)}" class="item entry" data-status="${e.status}">`
      + `<header><h4><a href="#${HandbookHtml.anchor(e.id)}">${HandbookHtml.esc(e.title)}</a></h4>${HandbookHtml.badge(e.status)}`
      + `${e.kind ? `<span class="kind">${HandbookHtml.esc(e.kind)}</span>` : ''}</header>${facts}`
      + (e.rules ?? []).map(r => `<p class="rule">${HandbookHtml.esc(r)}</p>`).join('')
      + (e.text ?? []).map(t => `<p class="desc">${HandbookHtml.esc(t)}</p>`).join('')
      + (e.notes ?? []).map(n => `<p class="note${/^Not playable|^No calling/.test(n) ? ' bad' : ''}">${HandbookHtml.esc(n)}</p>`).join('')
      + (refs.length ? `<p class="refs">See ${refs.map(r => this.link(r)).join(', ')}</p>` : '')
      + `<code class="eid">${HandbookHtml.esc(e.id)}</code></article>`;
  }
  landing(coverage: Coverage): string {
    const books = this.books.map(b => {
      const c = coverage.books[b.id].counts, total = Object.values(c).reduce((a, n) => a + n, 0);
      return `<a class="card" href="${b.id}.html"><h2>${HandbookHtml.esc(b.title)}</h2><p>${HandbookHtml.esc(b.intro[0]!)}</p>`
        + `<p class="bar-chart">${Statuses.filter(s => c[s]).map(s => `<span class="s-${s}" style="flex:${c[s]}" `
        + `title="${HandbookStatus.label(s)}: ${c[s]}"></span>`).join('')}</p><p class="count">${total} entries · `
        + `${Statuses.filter(s => c[s]).map(s => `${c[s]} ${HandbookStatus.label(s).toLowerCase()}`).join(' · ')}</p></a>`;
    }).join('');
    const families = coverage.orsino.families.map(f => [f.family, String(f.total), String(f.executable + f['play-validated']),
      String(f.represented), String(f.catalogued)]);
    const problems = coverage.problems.map(p => [p.book, p.kind, p.entry, p.text]);
    const body = `<main class="landing"><h1>The Kyr handbooks</h1><p class="lede">Made from the definitions the game plays `
      + 'from, every time the game is built. Each entry says how far the game plays it. Nothing here describes a rule the '
      + `game does not run without saying so.</p><div class="cards">${books}</div>`
      + `<section class="sec"><h2>Orsino, family by family</h2><p class="intro">Orsino ${HandbookHtml.esc(
        coverage.orsino.revision.slice(0, 12))}: how many of each family's definitions Kyr executes, represents by something `
      + 'smaller, or does not hold. <a href="coverage.json">coverage.json</a> has every entry.</p>'
      + `${this.table({ head: ['Family', 'Orsino', 'Executed', 'Represented', 'Not held'], rows: families })}</section>`
      + this.matrix(coverage)
      + `<section class="sec"><h2>What building the books found</h2>${this.table({ head: ['Book', 'Kind', 'Entry', 'Problem'],
        rows: problems })}</section></main>`;
    return this.page('Handbooks', body, 'index');
  }
  // The capability audit: one family a row, its entries' statuses, then its seven answers on demand.
  matrix(coverage: Coverage): string {
    if (!this.audit) { return ''; }
    const families = this.audit.families.map(f => {
      const counts = CapabilityAudit.counts(f, coverage);
      return `<details class="family"><summary><b>${HandbookHtml.esc(f.title)}</b><span class="bar-chart">${Statuses
        .filter(s => counts[s]).map(s => `<span class="s-${s}" style="flex:${counts[s]}" title="${HandbookStatus.label(s)}: `
        + `${counts[s]}"></span>`).join('')}</span><span class="count">${HandbookHtml.esc(CapabilityAudit.line(counts))}</span>`
        + `</summary><dl>${CapabilityAudit.questions.map(([k, q]) => `<dt>${q}</dt><dd>${HandbookHtml.esc(f[k] as string)}</dd>`)
          .join('')}</dl></details>`;
    }).join('');
    const ranked = this.table({ head: ['Rank', 'Deficiency', 'Unlocks', 'Cycle', 'State'],
      rows: this.audit.deficiencies.map(d => [String(d.rank), d.title, d.unlocks, String(d.cycle), d.state]) });
    return `<section class="sec"><h2>Capability audit</h2><p class="intro">${HandbookHtml.esc(this.audit.about)}</p>`
      + `${families}<h3>Deficiencies, ranked</h3>${ranked}</section>`;
  }
}
