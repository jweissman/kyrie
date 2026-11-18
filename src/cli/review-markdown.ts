// A reviewed journey to read aloud (the adventure-structure brief §6.5): chronological, under each place it came to,
// what the player was shown, the choice in their words and where it stood, what they were then told, and what changed
// in what they knew and in the world, the world's own doings by what did them. Every line is as it was shown, word for
// word, on a line of its own after "> " (test/journey-review.test.ts holds it). The step inspector (ReviewInspector)
// shows one step whole; this shows the journey.
import { ReviewCoverage } from './review-coverage';
import { ReviewProvenance } from './review-provenance';
import type { Coverage, Exactness, JourneyReviewV1, ReviewFrame, ReviewStep, ToldLine } from './review-types';

export class ReviewMarkdown {
  static journey(r: JourneyReviewV1): string {
    const out = [...this.head(r), ''];
    let place = '';
    const opening = r.frames[0]!;
    out.push(...this.placed(opening, place), '**The opening**', '', ...this.told(opening.lines), '', ...this.offered(opening));
    place = opening.place.id;
    for (const s of r.steps) {
      const after = s.after === undefined ? undefined : r.frames[s.after];
      out.push('', ...after ? this.placed(after, place) : [], ...this.step(s, after));
      if (after) { place = after.place.id; }
    }
    return `${out.join('\n')}\n`;
  }
  // What the review is of, by what build, how it was made, and how much of it is known by its making.
  static head(r: JourneyReviewV1): string[] {
    const src = r.source, how = src.kind === 'live-recorded' ? 'Recorded live, as it was played' : 'Replayed';
    const against = src.replayedAgainst ? ` against ${src.replayedAgainst.file} (recorded at ${
      src.replayedAgainst.revision.commit})` : '';
    return [`# Journey review: ${src.args.join(' ')}`, '',
      `${how}, at ${r.revision.commit}${r.revision.dirty ? ' (with uncommitted changes)' : ''}, ${r.generatedAt}${against}.`,
      ...src.lines ? [`The lines: ${src.lines.file}${src.lines.playedAt ? `, first played at ${src.lines.playedAt}` : ''}.`] : [],
      `${r.steps.length} lines sent, ${r.steps.filter(s => s.consequential).length} of them consequential;`
        + ` ${r.frames.length} scenes.`, '', ...this.coverage(r.coverage),
      '', 'Each told line is quoted as shown. Marks after a line: · its maker is known only by what produced it'
        + ' (the engine, or the person or thing it is of); ? its maker is unknown. A line with no mark is known exactly:'
        + ' `bin/kyrie review step <dir> <n>` names it.'];
  }
  static coverage(c: Coverage): string[] {
    const row = ReviewMarkdown.row;
    return ['| shown | exact | producer only | unknown |', '|---|---|---|---|', row('lines', c.lines),
      row('words', c.words), row('narration lines', c.prose), row('narration words', c.proseWords),
      row('choices offered', c.choices), '',
      ...c.unknown.map(u => `- unknown, ${u.lines} lines (${u.words} words): ${u.reason}`)];
  }
  private static row(name: string, of: Record<Exactness, number>): string {
    return `| ${name} | ${of.exact} (${ReviewCoverage.share(of, 'exact')}) | ${of.producer} (${
      ReviewCoverage.share(of, 'producer')}) | ${of.unknown} (${ReviewCoverage.share(of, 'unknown')}) |`;
  }
  private static placed(f: ReviewFrame, was: string): string[] {
    return f.place.id === was ? [] : [`## ${f.place.name}`, ''];
  }
  private static step(s: ReviewStep, after: ReviewFrame | undefined): string[] {
    const c = s.chosen, counted = s.consequential ? `consequential ${s.consequence}` : 'not consequential';
    const head = `**${s.n}. ${c?.label ? `“${c.label}”` : s.line}**${c ? ` (${c.from}${c.label ? `; ${c.command}` : ''})` : ''}`
      + ` · ${counted}${after ? ` · ${after.clock}` : ''}`;
    if (s.error) { return [head, '', `Refused: ${s.error}`]; }
    return [head, '', ...this.told(after?.lines ?? []), ...this.changed(s), ...after ? ['', ...this.offered(after)] : []];
  }
  // The lines as shown, the heading apart; each quoted whole.
  static told(lines: readonly ToldLine[]): string[] {
    return lines.filter(l => l.role !== 'heading').map(l => `> ${l.text}${l.exact === 'exact' ? '' : l.exact === 'producer' ? ' ·' : ' ?'}`
      + '\n>');
  }
  private static offered(f: ReviewFrame): string[] {
    const four = f.offer.filter(o => o.group !== 'rest'), rest = f.offer.length - four.length;
    if (!f.offer.length) { return ['Offered: nothing.']; }
    return [`Offered: ${four.map(o => `${o.label}${o.led ? ' (led)' : ''}`).join(' · ')}${rest ? ` · and ${rest} more` : ''}.`];
  }
  // What the step changed that the reader should know: what was learned, who went where, what came and went, the aims,
  // and of the world's own doings, what did them.
  private static changed(s: ReviewStep): string[] {
    const d = s.delta, out: string[] = [];
    if (d.learned.length) { out.push(`- Learned: ${d.learned.join(', ')}`); }
    const moved = d.moved.filter(m => m.from && m.to);
    if (moved.length) { out.push(`- Moved: ${moved.map(m => `${m.who} ${m.from} → ${m.to}`).join('; ')}`); }
    if (d.gained.length) { out.push(`- Came into the company's hands: ${d.gained.join(', ')}`); }
    if (d.lost.length) { out.push(`- Went out of them: ${d.lost.join(', ')}`); }
    if (d.aims.taken.length) { out.push(`- Aims taken up: ${d.aims.taken.join(', ')}`); }
    if (d.aims.retired.length) { out.push(`- Aims gone: ${d.aims.retired.join(', ')}`); }
    if (d.elapsed) { out.push(`- Time: ${d.elapsed} watch${d.elapsed === 1 ? '' : 'es'}`); }
    const world = d.by.filter(b => b.source.kind === 'kyr' && b.source.via !== 'command' && b.source.via !== 'taught');
    for (const b of world) { out.push(`- By ${ReviewProvenance.name(b.source)} (${b.source.kind === 'kyr' ? b.source.via : ''}): ${
      this.few(b.changes)}`); }
    return out.length ? ['', ...out] : [];
  }
  // The findings of Phase A: how much is known by its making, every line whose maker is unknown and where, and of what
  // the world did, how much is known by what did it.
  static findings(r: JourneyReviewV1): string {
    const by = new Map<string, number>();
    for (const b of r.steps.flatMap(s => s.delta.by)) {
      const k = b.source.kind === 'kyr' ? `kyr, by ${b.source.via}` : b.source.kind === 'engine' ? `engine ${b.source.producer}`
        : b.source.kind === 'unknown' ? 'unknown' : b.source.kind;
      by.set(k, (by.get(k) ?? 0) + b.changes.length);
    }
    const unknown = r.frames.flatMap(f => f.lines.filter(l => l.exact === 'unknown').map(l => `- ${
      this.at(r, f)} (${f.place.name}): “${l.text}” — ${l.sources.map(x => x.kind === 'unknown' ? x.reason : '').join('')}`));
    const unmade = new Map<string, number>();
    for (const c of r.steps.flatMap(s => s.delta.by).filter(b => b.source.kind === 'unknown').flatMap(b => b.changes)) {
      const name = /^[+-] (\w+)/.exec(c)?.[1] ?? c;
      unmade.set(name, (unmade.get(name) ?? 0) + 1);
    }
    return [...this.head(r), '', '## Lines whose maker is unknown', '', ...unknown.length ? unknown : ['(none)'], '',
      '## The world\'s changes, by what made them', '', '| made by | changes |', '|---|---|',
      ...[...by.entries()].sort((a, b) => b[1] - a[1]).map(([k, n]) => `| ${k} | ${n} |`), '',
      'Of those not known, by what they write:', '',
      ...[...unmade.entries()].sort((a, b) => b[1] - a[1]).map(([k, n]) => `- ${k}: ${n}`), ''].join('\n');
  }
  // Where a scene was shown: after which step (the opening, before any).
  private static at(r: JourneyReviewV1, f: ReviewFrame): string {
    const s = r.steps.find(x => x.after === f.n);
    return s ? `step ${s.n}` : 'the opening';
  }
  // A replay beside the recording it replayed: both named, by revision and by how each was made, and step by step the
  // three verdicts (§15.15), with what was shown otherwise where it was.
  static compared(live: JourneyReviewV1, replay: JourneyReviewV1): string {
    const out = [`# Journey review compared: ${live.source.args.join(' ')}`, '',
      `- before: ${live.source.kind} at ${live.revision.commit}${live.revision.dirty ? ' (dirty)' : ''}, ${live.generatedAt}`,
      `- after: ${replay.source.kind} at ${replay.revision.commit}${replay.revision.dirty ? ' (dirty)' : ''},`
        + ` ${replay.generatedAt}, against ${replay.source.replayedAgainst?.file ?? '?'}`, '',
      '| step | line | state | offer | presentation |', '|---|---|---|---|---|'];
    for (const v of replay.verdicts ?? []) {
      const s = live.steps.find(x => x.n === v.step);
      out.push(`| ${v.step} | ${s?.chosen?.label || s?.line || ''} | ${v.state} | ${v.offer} | ${v.presentation} |`);
    }
    for (const v of (replay.verdicts ?? []).filter(x => x.presentation !== 'same')) {
      const a = live.steps.find(x => x.n === v.step), b = replay.steps.find(x => x.n === v.step);
      const was = a?.after === undefined ? [] : live.frames[a.after]!.lines.map(l => l.text);
      const now = b?.after === undefined ? [] : replay.frames[b.after]!.lines.map(l => l.text);
      out.push('', `## Step ${v.step}`, '', ...was.filter(l => !now.includes(l)).map(l => `- was: ${l}`),
        ...now.filter(l => !was.includes(l)).map(l => `+ now: ${l}`));
    }
    return `${out.join('\n')}\n`;
  }
  static few(changes: readonly string[], n = 4): string {
    return `${changes.slice(0, n).join('; ')}${changes.length > n ? `; and ${changes.length - n} more` : ''}`;
  }
}
