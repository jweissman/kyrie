// The same journey before and after a prose revision (compare.html): the capture's prose beside the replay's, step
// by step, the words changed marked, and each note on the capture said to be still shown or no longer shown. The two
// are labelled by what they are (captured, played when it was recorded; replay, the capture's acts under the code as
// it is now) and neither stands in for the other: a step the replay could not take ends the comparison there.
import type { CapturedRun } from './journey-capture';
import { JourneyAccount, type AccountStep } from './journey-account';
import { JourneyHtml } from './journey-html';
import { JourneyNotes, type Notes } from './journey-notes';

export interface Compared { n: number; label: string; before: string; after?: string; same: boolean; notes: string[] }

export class JourneyCompare {
  static steps(captured: CapturedRun, replay: CapturedRun, notes: Notes): Compared[] {
    const a = JourneyAccount.steps(captured), b = new Map(JourneyAccount.steps(replay).map(s => [s.n, s]));
    return a.map(s => {
      const r = b.get(s.n), before = this.text(s), after = r && this.text(r);
      return { n: s.n, label: s.label, before, ...after !== undefined ? { after } : {}, same: before === after,
        notes: JourneyNotes.at(notes, s.n).map(n => `${n.kind}: “${n.quote}” ${!r ? 'not replayed'
          : JourneyNotes.shown(n, r) ? 'still shown' : 'no longer shown'}`) };
    });
  }
  private static text(s: AccountStep): string { return s.prose.join('\n'); }
  // Words kept, gone (−) and come (+), by the longest run the two have in common.
  static diff(before: string, after: string): { kind: '=' | '-' | '+'; text: string }[] {
    const x = before.split(/(\s+)/), y = after.split(/(\s+)/), m = x.length, n = y.length;
    const lcs = Array.from({ length: m + 1 }, () => new Array<number>(n + 1).fill(0));
    for (let i = m - 1; i >= 0; i--) {
      for (let j = n - 1; j >= 0; j--) {
        lcs[i]![j] = x[i] === y[j] ? lcs[i + 1]![j + 1]! + 1 : Math.max(lcs[i + 1]![j]!, lcs[i]![j + 1]!);
      }
    }
    const out: { kind: '=' | '-' | '+'; text: string }[] = [];
    let i = 0, j = 0;
    while (i < m || j < n) {
      if (i < m && j < n && x[i] === y[j]) { out.push({ kind: '=', text: x[i++]! }); j++; }
      else if (j < n && (i >= m || lcs[i]![j + 1]! >= lcs[i + 1]![j]!)) { out.push({ kind: '+', text: y[j++]! }); }
      else { out.push({ kind: '-', text: x[i++]! }); }
    }
    return out;
  }
  static page(captured: CapturedRun, replay: CapturedRun, notes: Notes): string {
    const steps = this.steps(captured, replay, notes), changed = steps.filter(s => !s.same && s.after !== undefined);
    const rows = steps.map(s => this.row(s)).join('\n');
    return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Journey compared</title><style>${JourneyHtml.css}
del{color:var(--none);text-decoration:line-through}ins{color:var(--exact);text-decoration:none;border-bottom:1px solid}
.same{color:var(--muted)}</style></head><body>
<h1>Before and after: ${JourneyHtml.esc(captured.args.join(' '))}</h1>
<p class="label">Before — ${JourneyHtml.esc(JourneyAccount.label(captured))}.<br>After — ${JourneyHtml.esc(JourneyAccount.label(replay))}.</p>
<p class="meta">${changed.length} of ${steps.length} steps read otherwise; ${steps.filter(s => s.after === undefined).length} not replayed.
Deleted words struck through, new words underlined.</p>
${replay.diverged ? `<p class="label">The replay stopped at step ${replay.diverged.step}: ${JourneyHtml.esc(replay.diverged.why)}</p>` : ''}
${rows}</body></html>\n`;
  }
  private static row(s: Compared): string {
    const head = `<span class="choice">${s.n ? `${s.n}. ${JourneyHtml.esc(s.label)}` : 'The first page'}</span>`;
    const notes = s.notes.map(n => `<div class="note">${JourneyHtml.esc(n)}</div>`).join('');
    if (s.after === undefined) { return `<article>${head}<p class="same">(not replayed)</p></article>`; }
    if (s.same) { return `<article class="same">${head} <small>unchanged</small>${notes}</article>`; }
    const marked = this.diff(s.before, s.after).map(d => d.kind === '=' ? JourneyHtml.esc(d.text)
      : d.kind === '-' ? `<del>${JourneyHtml.esc(d.text)}</del>` : `<ins>${JourneyHtml.esc(d.text)}</ins>`).join('');
    return `<article id="step-${s.n}">${head}<p>${marked.replace(/\n/g, '</p><p>')}</p>${notes}</article>`;
  }
  // The comparison as Markdown: each step read otherwise, before and after in full, for an editorial table.
  static markdown(captured: CapturedRun, replay: CapturedRun, notes: Notes): string {
    const steps = this.steps(captured, replay, notes).filter(s => !s.same);
    return [`# Before and after: ${captured.args.join(' ')}`, '', `- Before: ${JourneyAccount.label(captured)}.`,
      `- After: ${JourneyAccount.label(replay)}.`, '', ...steps.flatMap(s => [`## ${s.n}. ${s.label}`, '',
        `**Before:** ${s.before.replace(/\n/g, ' ')}`, '', s.after === undefined ? '*(not replayed)*'
          : `**After:** ${s.after.replace(/\n/g, ' ')}`, '', ...s.notes.map(n => `- ${n}`), ''])].join('\n');
  }
}
