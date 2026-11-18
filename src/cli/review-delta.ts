// What a reviewed step did to the world (the adventure-structure brief §6.3): the world after it set against the world
// before it, in CampaignEvent.changes' own words (World.changes), sorted into facts written and taken away, measures,
// what was learned, who went where, what came into or out of the company's hands, the aims (by the frames' own aims)
// and the time; and each change by what made it: the act itself (its CommandResolution), a rule (as CampaignTick's
// witness saw it fire), someone's own act (the event's npc decisions), or not known.
import type { Campaign, CampaignEvent } from '../campaign/campaign';
import { World } from '../lang/world';
import type { Change } from '../lang/module';
import type { ReviewProvenance } from './review-provenance';
import type { ReviewDelta as Delta, ReviewFrame, SourceRef } from './review-types';

export interface Fired { rule: string; changes: string[] }
// before and after: the worlds; frames: the scenes before and after (for the aims and the time).
export interface Stepped { before: World; after: World; events: readonly CampaignEvent[]; fired: readonly Fired[];
  frames: [ReviewFrame, ReviewFrame | undefined] }

export class ReviewDelta {
  private readonly teaches = new Map<string, string>();
  constructor(private readonly campaign: Campaign, private readonly provenance: ReviewProvenance) {
    for (const d of [...campaign.module.observations ?? [], ...campaign.module.rules ?? []]) {
      if (d.teaches) { this.teaches.set(d.id, d.teaches); }
    }
  }
  of(s: Stepped): Delta {
    const changes = s.after.changes(s.before), [was, now] = s.frames;
    const asserted: string[] = [], retracted: string[] = [], measures: Delta['measures'] = [];
    for (const c of changes) { ReviewDelta.sort(c, { asserted, retracted, measures }); }
    const calls = ReviewDelta.calls;
    const learned = calls(asserted, 'knows').map(a => a[1]!);
    const gained = calls(asserted, 'ownedItem').map(a => a[0]!), lost = calls(retracted, 'ownedItem').map(a => a[0]!);
    const from = new Map(calls(retracted, 'at').map(a => [a[0]!, a[1]!])), to = new Map(calls(asserted, 'at').map(a => [a[0]!, a[1]!]));
    const moved = [...new Set([...from.keys(), ...to.keys()])].map(who => ({ who,
      ...from.has(who) ? { from: from.get(who) } : {}, ...to.has(who) ? { to: to.get(who) } : {} }));
    const had = new Set(was.aims?.map(a => a.id)), has = new Set(now?.aims?.map(a => a.id));
    const followed = [was.aims?.find(a => a.followed)?.id, now?.aims?.find(a => a.followed)?.id];
    return { asserted, retracted, measures, learned, moved, gained, lost,
      aims: { taken: [...has].filter(a => !had.has(a)), retired: [...had].filter(a => !has.has(a)),
        ...now && followed[0] !== followed[1] ? { followed: { ...followed[0] ? { from: followed[0] } : {},
          ...followed[1] ? { to: followed[1] } : {} } } : {} },
      elapsed: (now?.elapsed ?? was.elapsed) - was.elapsed, by: this.by(changes, s) };
  }
  // A change's own words sorted: "+ fact", "- fact", and a measure's "- m = a" and "+ m = b".
  private static sort(c: string, into: Pick<Delta, 'asserted' | 'retracted' | 'measures'>) {
    const m = /^([+-]) (.+) = (-?[\d.]+)$/.exec(c);
    if (!m) { (c.startsWith('+ ') ? into.asserted : into.retracted).push(c.slice(2)); return; }
    const [, sign, measure, value] = m, row = into.measures.find(x => x.measure === measure)
      ?? into.measures[into.measures.push({ measure: measure! }) - 1]!;
    if (sign === '-') { row.before = Number(value); } else { row.after = Number(value); }
  }
  private static calls(list: readonly string[], name: string): string[][] {
    return list.map(fact => new RegExp(`^${name}\\((.*)\\)$`).exec(fact)?.[1]?.split(', ') ?? []).filter(a => a.length);
  }
  // Each change by the last that wrote it in the step: the act, a rule, or someone else's act; what none of them wrote
  // (the clock's own reckoning, a measure the engine keeps) is not known by its maker here.
  private by(changes: readonly string[], s: Stepped): Delta['by'] {
    const writers: { source: SourceRef; wrote: Set<string> }[] = [];
    for (const e of s.events) {
      const op = this.campaign.operator(e.action), own = e.result === 'success' ? op?.success : op?.failure;
      writers.push({ source: this.provenance.kyr(this.schema(e), 'command'),
        wrote: new Set((own ?? []).map(c => ReviewDelta.written(c))) });
      for (const d of e.npc ?? []) {
        writers.push({ source: this.provenance.kyr(d.action.split('(')[0]!, `act of ${d.actor}`),
          wrote: new Set((d.changes ?? []).map(c => ReviewDelta.key(c))) });
      }
    }
    for (const f of s.fired) {
      writers.push({ source: this.provenance.kyr(f.rule, 'rule fired'), wrote: new Set(f.changes.map(c => ReviewDelta.key(c))) });
    }
    // What was learned by perceiving what teaches it: by that observation or rule's words.
    const who = this.campaign.playerActor ?? 'party';
    for (const p of s.events.flatMap(e => e.perceptions ?? [])) {
      const fact = this.teaches.get(p.id.split('@')[0]!);
      if (fact) { writers.push({ source: this.provenance.kyr(p.id, 'taught'), wrote: new Set([`+ knows(${who}, ${fact})`]) }); }
    }
    const out = new Map<string, Delta['by'][number]>();
    for (const c of changes) {
      const w = writers.findLast(x => x.wrote.has(ReviewDelta.key(c)));
      const source: SourceRef = w?.source ?? (/\(clock\)/.test(c) ? { kind: 'engine', producer: 'clock' }
        : { kind: 'unknown', reason: 'no act, rule, person or perception of this step wrote it' });
      const key = JSON.stringify(source);
      (out.get(key) ?? out.set(key, { source, changes: [] }).get(key)!).changes.push(c);
    }
    return [...out.values()];
  }
  // A change as compared with what wrote it: a fact by its words, a measure by its name alone ("~ coin(party)"),
  // for an act's increase is not its sum.
  private static key(c: string): string {
    const m = /^[+-] (.+) = -?[\d.]+$/.exec(c);
    return m ? `~ ${m[1]}` : c;
  }
  private static written(c: Change): string {
    const fact = World.format(c.call);
    return c.kind === 'assert' ? `+ ${fact}` : c.kind === 'retract' ? `- ${fact}` : `~ ${fact}`;
  }
  private schema(e: CampaignEvent): string { return e.action.split('(')[0]!; }
}
