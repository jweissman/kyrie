// A recorded journey read in order (the journey reader's account): its steps gathered by the place they were taken
// in, each with the choice, what was told, and what changed in what the company knows (the notes the exchange
// carried, the aims taken up and let go); every sentence with where it was told first, if it was told before.
import type { Offered, Said } from './runner';
import type { Exchange } from '../presentation/narrator';
import type { CapturedRun, From } from './journey-capture';
import { ProseProvenance } from './prose-provenance';

export interface AccountStep {
  n: number; label: string; from?: From; moment: Said['moment']; at?: string; lines: string[]; prose: string[];
  // What the company came to know or to want: the exchange's notes, and the aims held since the step before.
  understanding: string[]; gained: string[]; dropped: string[]; changed: string[]; error?: string;
  before?: Said; said: Said;
  // The act asked by its id, and what came of it as the narrator typed it.
  act?: string; exchange?: Exchange;
}
export interface Place { name: string; at?: string; steps: AccountStep[] }

export class JourneyAccount {
  // The opening and every step, as the player met them.
  static steps(run: CapturedRun): AccountStep[] {
    const opening = this.step({ n: 0, label: '(the first page)' }, run.opening, undefined);
    return [opening, ...run.steps.map((s, i) => ({
      ...this.step(s, s.said, run.steps[i - 1]?.said ?? run.opening),
      ...s.exchange ? { understanding: s.exchange.notes, exchange: s.exchange } : {},
      ...s.error ? { error: s.error } : {},
      act: 'act' in s.asked ? s.asked.act : JSON.stringify(s.asked) }))];
  }
  private static step({ n, label, from }: { n: number; label: string; from?: From }, said: Said,
    before: Said | undefined): AccountStep {
    const held = new Set((before?.aims ?? []).map(a => a.text)), now = new Set((said.aims ?? []).map(a => a.text));
    const lines = said.scene.lines, prose = said.moment === 'fight' ? lines : said.scene.prose;
    return { n, label, ...from ? { from } : {}, moment: said.moment, ...said.at ? { at: said.at } : {}, lines, prose,
      understanding: [], gained: before && said.aims ? [...now].filter(a => !held.has(a)) : [],
      dropped: before && said.aims ? [...held].filter(a => !now.has(a)) : [], changed: said.changed ?? [],
      ...before ? { before } : {}, said };
  }
  // Steps gathered by the place they were taken in: a new place where the company arrived somewhere else.
  static places(steps: AccountStep[]): Place[] {
    const places: Place[] = [];
    for (const s of steps) {
      const last = places.at(-1), moved = s.moment === 'arrive' && s.at !== last?.at;
      if (!last || moved) { places.push({ name: this.placeName(s, last), ...s.at ? { at: s.at } : {}, steps: [s] }); }
      else { last.steps.push(s); }
    }
    return places;
  }
  private static placeName(s: AccountStep, last?: Place): string {
    return s.lines[0]?.split(' · ')[0] ?? last?.name ?? s.at ?? 'somewhere';
  }
  // Each sentence told, by the step it was first told in: a sentence told again names that step (a fight's blows and
  // its tally of wounds, told turn by turn, aside).
  static repeats(steps: AccountStep[]): Map<string, number> {
    const first = new Map<string, number>();
    for (const s of steps.filter(x => x.moment !== 'fight')) {
      for (const sentence of s.prose.flatMap(l => ProseProvenance.sentences(l))) {
        const key = ProseProvenance.key(sentence);
        if (!first.has(key)) { first.set(key, s.n); }
      }
    }
    return first;
  }
  // What the offer gained and lost from one turn to the next, by id.
  static offerChange(before: Said | undefined, after: Said): { added: Offered[]; removed: Offered[] } {
    if (!before) { return { added: [], removed: [] }; }
    const was = this.all(before), now = this.all(after), had = new Set(was.map(o => o.id));
    const has = new Set(now.map(o => o.id));
    return { added: now.filter(o => !had.has(o.id)), removed: was.filter(o => !has.has(o.id)) };
  }
  private static all(s: Said): Offered[] { return [...s.offer.primary, ...s.offer.rest]; }
  static label(run: CapturedRun): string {
    const what = run.kind === 'captured' ? 'Captured: what the player was shown when it was played'
      : `Replay: the capture's acts played again under the code as it is now (${run.policy})`;
    return `${what}, at ${run.build.commit}${run.build.dirty ? ' with changes not committed' : ''}, ${run.at.slice(0, 16)}`;
  }
  // The account as Markdown, to be read aloud: the places, the choices, what was told, and what was learned.
  static markdown(run: CapturedRun): string {
    const steps = this.steps(run), first = this.repeats(steps);
    const out = [`# The journey: ${run.args.join(' ')}`, '', `*${this.label(run)}.*`, '',
      `${run.steps.length} steps by the policy "${run.policy}". A sentence told before is marked †, with the step it`
      + ' was first told in.', ''];
    for (const place of this.places(steps)) {
      out.push(`## ${place.name}`, '');
      for (const s of place.steps) { out.push(...this.told(s, first)); }
    }
    if (run.diverged) { out.push(`**The replay stopped at step ${run.diverged.step}:** ${run.diverged.why}`, ''); }
    return out.join('\n');
  }
  private static told(s: AccountStep, first: Map<string, number>): string[] {
    const out = [s.n ? `**${s.n}. ${s.label}**` : '*(The first page)*', ''];
    const body = s.prose.map(l => ProseProvenance.sentences(l).map(t => {
      const was = first.get(ProseProvenance.key(t));
      return was !== undefined && was !== s.n ? `${t} †${was}` : t;
    }).join(' '));
    out.push(...body.length ? body.flatMap(l => [l, '']) : ['*(nothing is told)*', '']);
    const known = [...s.understanding.map(u => `- ${u}`),
      ...s.gained.filter(a => !s.understanding.includes(`Aim: ${a}`)).map(a => `- Aim taken up: ${a}`),
      ...s.dropped.map(a => `- Aim let go or done: ${a}`)];
    if (s.error) { known.push(`- Could not be done: ${s.error}`); }
    return known.length ? [...out, ...known, ''] : out;
  }
}
