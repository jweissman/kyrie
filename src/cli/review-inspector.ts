// One step of a reviewed journey, whole (the adventure-structure brief §6.5's step inspector): the scene before it as
// shown, every line with where it was made; the whole offer, in order, each choice with its id, group and declaration;
// the line sent and what it was in that offer; the events; the scene after, line by line with its makers; and what
// changed, by what. For a reviewer who has found a bad line: what surrounded it, what choice brought it, who wrote it.
import { ReviewMarkdown } from './review-markdown';
import { ReviewProvenance } from './review-provenance';
import type { JourneyReviewV1, ReviewChoice, ReviewFrame, ReviewStep, SourceRef, ToldLine } from './review-types';

export class ReviewInspector {
  static step(r: JourneyReviewV1, n: number): string | undefined {
    const s = r.steps.find(x => x.n === n);
    if (!s) { return undefined; }
    const before = r.frames[s.before]!, after = s.after === undefined ? undefined : r.frames[s.after];
    const verdict = r.verdicts?.find(v => v.step === n);
    return [`# Step ${n} of ${r.steps.length}: ${r.source.kind}, at ${r.revision.commit}`, '',
      ...verdict ? [`Replayed against ${r.source.replayedAgainst?.file}: state ${verdict.state}, offer ${verdict.offer},`
        + ` presentation ${verdict.presentation}.`, ''] : [],
      `## Before (scene ${before.n}: ${before.place.name}, ${before.clock}, turn ${before.turn}, ${before.moment})`, '',
      ...this.lines(before.lines), '', ...this.state(before), '', '### Offered', '', ...this.offer(r, before.offer, s), '',
      '## Chosen', '', ...this.chosen(s), '', '## What happened', '', ...this.events(s),
      ...after ? ['', `## After (scene ${after.n}: ${after.place.name}, ${after.clock}, turn ${after.turn}, ${after.moment})`,
        '', ...this.lines(after.lines), '', ...this.state(after)] : [],
      '', '## What changed', '', ...this.delta(s), ''].join('\n');
  }
  // A frame's lines, each quoted as shown, its part and its makers under it.
  static lines(lines: readonly ToldLine[]): string[] {
    return lines.flatMap((l, i) => [`${i + 1}. [${l.role}, ${l.exact}] ${l.text}`,
      `   ← ${l.sources.map(s => this.source(s)).join(' + ')}`]);
  }
  static source(s: SourceRef): string {
    switch (s.kind) {
      case 'kyr': return `${s.type ?? 'kyr'} ${s.declaration} (module ${s.module}${s.via ? `, by ${s.via}` : ''})`;
      case 'template': return `table ${s.table}, entry ${s.entry}${s.via ? ` (by ${s.via})` : ''}`;
      default: return ReviewProvenance.name(s);
    }
  }
  private static state(f: ReviewFrame): string[] {
    return [`- aim: ${f.aim ?? 'none'}`, ...(f.aims ?? []).map(a => `- aim held: ${a.text} (${a.id})${a.followed ? ', followed' : ''}`),
      ...f.need ? [`- need: ${f.need.join(' · ')}`] : [], ...f.purse ? [`- purse: ${f.purse.coin} coin, ${f.purse.rations} rations`] : [],
      ...f.you ? [`- you: ${f.you}`] : [], ...(f.company ?? []).map(c => `- with: ${c}`),
      ...f.ending ? [`- ended: ${f.ending.title}`] : [], `- digest: ${f.digest}`];
  }
  // The offer whole, the chosen marked.
  private static offer(r: JourneyReviewV1, offer: readonly ReviewChoice[], s: ReviewStep): string[] {
    if (!offer.length) { return ['(nothing offered)']; }
    return offer.map((o, i) => `${i + 1}. ${o.id === s.chosen?.command ? '**→** ' : ''}[${o.group}${o.led ? ', led' : ''}] `
      + `${o.label}  \`${o.id}\`${o.aspects?.length ? ` (${o.aspects.join(', ')})` : ''}${o.aside ? ` — ${o.aside}` : ''}`
      + ` ← ${(r.makers[o.id]?.sources ?? []).map(x => this.source(x)).join(' + ') || 'unknown'}`);
  }
  private static chosen(s: ReviewStep): string[] {
    const c = s.chosen;
    return [`- sent: \`${s.line}\``, ...c ? [`- in the scene before: ${c.label ? `“${c.label}”` : '(no label)'} (${c.from})`] : [],
      ...s.error ? [`- refused: ${s.error}`] : [],
      `- ${s.consequential ? `consequential, the ${s.consequence}${this.th(s.consequence!)}` : 'not consequential'}`
        + ` (transcript steps to here: ${s.mark})`];
  }
  private static th(n: number): string {
    return n % 100 >= 11 && n % 100 <= 13 ? 'th' : ['th', 'st', 'nd', 'rd'][n % 10] ?? 'th';
  }
  private static events(s: ReviewStep): string[] {
    if (!s.events.length) { return ['(no event: nothing was done in the world)']; }
    return s.events.map(e => `- \`${e.action}\`: ${e.result}, at watch ${e.elapsed}${e.response ? `; result: ${e.response}` : ''}`);
  }
  private static delta(s: ReviewStep): string[] {
    const d = s.delta, few = ReviewMarkdown.few.bind(ReviewMarkdown);
    return [`- time: ${d.elapsed} watches`, ...d.learned.length ? [`- learned: ${d.learned.join(', ')}`] : [],
      ...d.moved.map(m => `- moved: ${m.who}${m.from ? ` from ${m.from}` : ''}${m.to ? ` to ${m.to}` : ''}`),
      ...d.gained.length ? [`- gained: ${d.gained.join(', ')}`] : [], ...d.lost.length ? [`- lost: ${d.lost.join(', ')}`] : [],
      ...d.aims.taken.length ? [`- aims taken up: ${d.aims.taken.join(', ')}`] : [],
      ...d.aims.retired.length ? [`- aims gone: ${d.aims.retired.join(', ')}`] : [],
      ...d.aims.followed ? [`- followed: ${d.aims.followed.from ?? 'none'} → ${d.aims.followed.to ?? 'none'}`] : [],
      ...d.measures.map(m => `- measure ${m.measure}: ${m.before ?? '–'} → ${m.after ?? '–'}`),
      `- facts written: ${d.asserted.length}; taken away: ${d.retracted.length}`, '', '### By what', '',
      ...d.by.map(b => `- ${this.source(b.source)}: ${few(b.changes, 8)}`)];
  }
}
