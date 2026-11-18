// The journey reader's page (reader.html): the account in order, by place, every sentence marked by where it was
// written (ProseProvenance) and whether it was told before, the reviewer's notes on the words they quote, and under
// each step an inspector: the lines exactly as shown, the exchange by kind, the act chosen and where it stood, what
// was offered before and after, the aims, and the world's changes. Static: no script, opened from the disk.
import type { Offered, Said } from './runner';
import type { CapturedRun } from './journey-capture';
import { JourneyAccount, type AccountStep } from './journey-account';
import { JourneyNotes, type Note, type Notes } from './journey-notes';
import { ProseProvenance, type How, type Traced } from './prose-provenance';

export class JourneyHtml {
  static readonly css = `:root{--bg:#fbfaf7;--fg:#1d1c1a;--muted:#6b675f;--line:#e2ded5;--card:#fff;--exact:#2f6f3e;
--template:#2b5b8a;--partial:#9a6a12;--none:#a33;--mark:#ffe9a8;--repeat:#c25b2a}
@media (prefers-color-scheme:dark){:root:not([data-theme="light"]){--bg:#171614;--fg:#ece8df;--muted:#a39d91;
--line:#34312c;--card:#1f1d1a;--exact:#7cc48a;--template:#86b6e6;--partial:#e0b45a;--none:#f08a8a;--mark:#5a4a12;
--repeat:#f0a070}}
body{background:var(--bg);color:var(--fg);font:17px/1.55 Georgia,serif;margin:0 auto;max-width:52rem;padding:1rem 16px 4rem}
h1{font-size:1.5rem}h2{font-size:1.15rem;margin-top:2.2rem;border-bottom:1px solid var(--line)}
.meta,.from,.k,small,table,pre,code{font:13px/1.45 ui-monospace,Menlo,monospace;color:var(--muted)}
.label{background:var(--card);border:1px solid var(--line);padding:.5rem .7rem;border-radius:6px}
article{margin:1.1rem 0}.choice{font-weight:bold}.from{margin-left:.5rem}
p{margin:.35rem 0}.s{border-bottom:1px dotted transparent}.how-template{border-bottom-color:var(--template)}
.how-partial{border-bottom-color:var(--partial)}.how-none{border-bottom:1px dashed var(--none)}
.rep{color:var(--repeat);font-size:.8em;text-decoration:none}mark{background:var(--mark);color:inherit}
ul.known{margin:.3rem 0;padding-left:1.2rem;font-size:.92em;color:var(--muted)}
details{margin:.4rem 0;background:var(--card);border:1px solid var(--line);border-radius:6px;padding:.3rem .6rem}
summary{cursor:pointer;font:13px ui-monospace,Menlo,monospace;color:var(--muted)}
pre{white-space:pre-wrap;overflow-wrap:anywhere}table{border-collapse:collapse;width:100%}
td{border-top:1px solid var(--line);padding:.2rem .3rem;vertical-align:top;overflow-wrap:anywhere}
.note{border-left:3px solid var(--repeat);padding-left:.6rem;margin:.4rem 0;font-size:.92em}
nav{font-size:.9em}nav a{color:inherit}`;
  static page(run: CapturedRun, notes: Notes, provenance: ProseProvenance, scene: string): string {
    const steps = JourneyAccount.steps(run), first = JourneyAccount.repeats(steps);
    const traced = new Map<string, Traced>();
    const tally: Record<How, number> = { exact: 0, template: 0, partial: 0, none: 0 };
    for (const s of steps.filter(x => x.moment !== 'fight')) {
      for (const t of s.prose.flatMap(l => ProseProvenance.sentences(l))) {
        if (!traced.has(t)) { const tr = provenance.trace(t); traced.set(t, tr); tally[tr.how]++; }
      }
    }
    const places = JourneyAccount.places(steps), build = run.build;
    const body = places.map((p, i) => `<h2 id="place-${i}">${this.esc(p.name)}</h2>\n${p.steps.map(s =>
      this.step(s, { first, traced, notes: JourneyNotes.at(notes, s.n), scene })).join('\n')}`).join('\n');
    return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Journey reader</title><style>${this.css}</style></head><body>
<h1>The journey: ${this.esc(run.args.join(' '))}</h1>
<p class="label">${this.esc(JourneyAccount.label(run))}. ${run.steps.length} steps by the policy “${this.esc(run.policy)}”.</p>
<p class="meta">Sentences traced against the sources as they stand now: ${tally.exact} exact, ${tally.template} from a
template with blanks, ${tally.partial} in part, ${tally.none} not found (underlined: blue template, amber partial, red
dashed not found; exact is plain). † marks a sentence told before, with the step it was first told in.
${notes.notes.length} notes. Capture at ${this.esc(build.commit)}.</p>
<nav>${places.map((p, i) => `<a href="#place-${i}">${this.esc(p.name)}</a> (${p.steps[0]!.n}–${p.steps.at(-1)!.n})`).join(' · ')}</nav>
${run.diverged ? `<p class="label">The replay stopped at step ${run.diverged.step}: ${this.esc(run.diverged.why)}</p>` : ''}
${body}</body></html>\n`;
  }
  private static step(s: AccountStep, o: { first: Map<string, number>; traced: Map<string, Traced>; notes: Note[];
    scene: string }): string {
    const head = s.n ? `<span class="choice">${s.n}. ${this.esc(s.label)}</span><span class="from">${s.from ?? ''} · ${s.moment}</span>`
      : '<span class="choice">The first page</span>';
    const prose = s.prose.map(l => `<p>${this.line(l, s.n, o)}</p>`).join('') || '<p><small>(nothing is told)</small></p>';
    const known = [...s.understanding, ...s.gained.filter(a => !s.understanding.includes(`Aim: ${a}`)).map(a => `Aim taken up: ${a}`),
      ...s.dropped.map(a => `Aim let go or done: ${a}`), ...s.error ? [`Could not be done: ${s.error}`] : []];
    const notes = o.notes.map(n => this.note(n, JourneyNotes.shown(n, s))).join('');
    return `<article id="step-${s.n}">${head}${prose}${known.length ? `<ul class="known">${known.map(k =>
      `<li>${this.esc(k)}</li>`).join('')}</ul>` : ''}${notes}${this.inspector(s, o.traced, o.scene)}</article>`;
  }
  // A line of prose: each sentence marked by where it was written, the words a note quotes marked, and a sentence
  // told before linked to where it was first told.
  private static line(l: string, n: number,
    o: { first: Map<string, number>; traced: Map<string, Traced>; notes: Note[] }): string {
    return ProseProvenance.sentences(l).map(t => {
      const tr = o.traced.get(t), was = o.first.get(ProseProvenance.key(t));
      const where = tr?.sources.map(x => `${x.file}:${x.line}${x.decl ? ` ${x.decl}` : ''}`).join('; ') ?? '';
      const marked = o.notes.reduce((h, note) => h.replace(this.quoted(note.quote), m => `<mark title="${this.attr(
        `${note.kind}: ${note.note}`)}">${m}</mark>`), this.esc(t));
      const rep = was !== undefined && was !== n ? ` <a class="rep" href="#step-${was}" title="told before, at step ${was}">†${was}</a>` : '';
      return `<span class="s how-${tr?.how ?? 'none'}" title="${this.attr(`${tr?.how ?? 'fight'} ${where}`)}">${marked}</span>${rep}`;
    }).join(' ');
  }
  private static note(n: Note, shown: boolean): string {
    return `<div class="note"><b>${n.kind}</b>${n.by ? ` <small>${this.esc(n.by)}</small>` : ''}: “${this.esc(n.quote)}”`
      + ` — ${this.esc(n.note)}${n.suggest ? `<br>Instead: “${this.esc(n.suggest)}”` : ''}${shown ? ''
        : ' <small>(these words are not shown at this step)</small>'}</div>`;
  }
  private static inspector(s: AccountStep, traced: Map<string, Traced>, scene: string): string {
    const said = s.said, change = JourneyAccount.offerChange(s.before, said);
    const rows = s.prose.flatMap(l => ProseProvenance.sentences(l)).map(t => traced.get(t)).filter(t => !!t)
      .map(t => `<tr><td>${this.esc(t.sentence)}</td><td>${t.how}</td><td>${t.sources.map(x => this.esc(
        `${x.file}:${x.line}${x.decl ? ` (${x.decl})` : ''}`)).join('<br>')}</td></tr>`).join('');
    return `<details><summary>inspect step ${s.n}</summary>
<p class="k">Shown, line by line, exactly:</p><pre>${this.esc(s.lines.join('\n'))}</pre>
${s.n ? `<p class="k">Chosen: <code>${this.esc(s.label)}</code> · id <code>${this.esc(s.act ?? '')}</code> · from ${s.from ?? '?'}</p>` : ''}
${s.exchange?.lines.length ? `<p class="k">The exchange, by kind:</p><pre>${this.esc(s.exchange.lines.map(l =>
      `[${l.kind}] ${l.text}`).join('\n'))}</pre>` : ''}
${s.before ? `<p class="k">Offered before: as offered after <a href="#step-${s.n - 1}">step ${s.n - 1}</a></p>` : ''}
<p class="k">Offered after (what the next step chose from):</p>${this.offer(said)}
${s.before ? `<p class="k">Offer changed: +${change.added.length} −${change.removed.length}</p><pre>${this.esc([
      ...change.added.map(o => `+ ${o.label}`), ...change.removed.map(o => `− ${o.label}`)].join('\n'))}</pre>` : ''}
<p class="k">Aim: ${this.esc(said.aim ?? '—')}${said.need?.length ? ` · needs: ${this.esc(said.need.join('; '))}` : ''}${said.next
      ? ` · next: ${this.esc(said.next.text)}` : ''}</p>
${s.changed.length ? `<p class="k">The world's changes:</p><pre>${this.esc(s.changed.join('\n'))}</pre>` : ''}
${rows ? `<p class="k">Where each sentence was written:</p><table>${rows}</table>` : ''}
${s.n && s.moment !== 'fight' ? `<p class="k">Scene view: <code>${this.esc(`${scene} ${s.n}`)}</code></p>` : ''}
</details>`;
  }
  private static offer(said: Said): string {
    const li = this.li.bind(this, said);
    return `<ul>${said.offer.primary.map(o => li(o)).join('')}</ul>${said.offer.rest.length ? `<details><summary>and ${
      said.offer.rest.length} more</summary><small>${said.offer.rest.map(o => this.esc(o.label)).join(' · ')}</small></details>` : ''}`;
  }
  private static li(said: Said, o: Offered): string {
    return `<li>${this.esc(o.label)} <small>${this.esc(o.id)}${said.led?.includes(o.id) ? ' · led' : ''}</small></li>`;
  }
  // A note's words as a pattern over the page's: its quotes either way, its spacing any.
  private static quoted(quote: string): RegExp {
    const esc = this.esc(quote).replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/['‘’]/g, '[\'‘’]')
      .replace(/["“”]/g, '["“”]').replace(/\s+/g, '\\s+');
    return new RegExp(esc, 'g');
  }
  static esc(t: string): string { return t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
  static attr(t: string): string { return this.esc(t).replace(/"/g, '&quot;'); }
}
