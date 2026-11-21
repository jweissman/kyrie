#!/usr/bin/env bun
// The difference census (golden-thread.md, checkpoint 12: a different character or a different generated world gives
// rise to genuinely different relationships, circumstances, opportunities and discoveries). Each walk is a player who
// follows the gold (as scripts/first-quarter.ts walks) for the first hour's worth of acts; per walk, by kind:
//   met       who was where the company stood (people only, not beasts or bands)
//   spoke     who it talked to or asked something of
//   offered   the aims it held, and the kits', pleasures' and afoot's acts it was offered
//   found     what it came to know (facts, discoveries)
//   answered  the lines a rule said as the world answered (a greeting by what was done, a town's word)
// and for each pair compared, the overlap of each kind as a fraction (shared / either). A key is what the thing is,
// not where: a generated town's id is its template's (region__s1_hesper is hesper), so two countries are compared by
// what they hold, not by name. A measure, not a gate.
//   bun scripts/difference-census.ts [--steps 100] [--json out.json]
import { writeFileSync } from 'node:fs';
import { AutoplayRun } from '../src/autoplay/run';
import { AutoPlayer } from '../src/autoplay/player';
import { Draw } from '../src/autoplay/draw';
import { Undertakings } from '../src/presentation/undertakings';
import { ScreenModel } from '../src/ui/screen-model';
import { PlayerView } from '../src/presentation/player-view';
import { CampaignTick } from '../src/campaign/campaign-tick';
import { FirstQuarter } from './first-quarter';

export type Kind = 'met' | 'spoke' | 'offered' | 'found' | 'answered';
export const kinds: Kind[] = ['met', 'spoke', 'offered', 'found', 'answered'];
export interface Walk { name: string; seed: string; origin: string; calling: string; sets: Record<Kind, Set<string>> }
export interface Pair { a: string; b: string; overlap: Record<Kind, number>; shared: Record<Kind, string[]> }

export class DifferenceCensus {
  // What a thing is, wherever it is: a generated town's own is its template's; a placed story's, its own name.
  static key(id: string): string {
    return id.replace(/^region__(s\d+|w\d+|x-?\d+y-?\d+)_/, '').replace(/^region__/, '').replace(/\d+(?=__)/, '');
  }
  // A town's generated folk (s1_r7) by the work they do, as every town has its tinker or its salter; anyone else by
  // what they are.
  static person(id: string, name: string): string {
    return /^region__s\d+_r\d+$/.test(id) ? `folk:${name.split(', the ')[1]?.split(',')[0] ?? name}` : this.key(id);
  }
  static overlap(a: Set<string>, b: Set<string>): { fraction: number; shared: string[] } {
    const shared = [...a].filter(x => b.has(x)), either = new Set([...a, ...b]).size;
    return { fraction: either ? shared.length / either : 1, shared };
  }
  static pair(a: Walk, b: Walk): Pair {
    const overlap = {} as Record<Kind, number>, shared = {} as Record<Kind, string[]>;
    for (const k of kinds) {
      const o = this.overlap(a.sets[k], b.sets[k]);
      overlap[k] = Math.round(o.fraction * 100) / 100; shared[k] = o.shared;
    }
    return { a: a.name, b: b.name, overlap, shared };
  }
  static async walk(who: { name: string; seed: string; origin: string; calling: string }, steps: number):
    Promise<Walk> {
    const { seed, origin } = who;
    const sets = Object.fromEntries(kinds.map(k => [k, new Set<string>()])) as Record<Kind, Set<string>>;
    const spec = { seed, origin, policy: 'gold' as const, steps,
      protagonist: { name: 'Wenna', raceId: 'human', classId: who.calling } };
    const metrics = AutoplayRun.empty(), s = await AutoplayRun.start(spec, metrics), c = s.campaign;
    const knew = new Set(c.world.related('knows').filter(f => f.args[0] === 'party').map(f => f.args[1]!));
    const player = new AutoPlayer('gold', new Draw(`${seed}:${origin}:gold`));
    const before = CampaignTick.witness;
    CampaignTick.witness = this.heard.bind(this, { before, c, into: sets.answered });
    try {
      for (let step = 0; step < steps && c.running; step++) {
        if (!await this.step({ s, player, metrics, sets }, step)) { break; }
      }
    } finally { CampaignTick.witness = before; }
    for (const f of c.world.related('knows').filter(x => x.args[0] === 'party' && !knew.has(x.args[1]!))) {
      sets.found.add(this.key(f.args[1]!));
    }
    return { ...who, sets };
  }
  // A rule fired that said something: the world answering.
  private static heard(at: { before: typeof CampaignTick.witness; c: AutoplayCampaign; into: Set<string> },
    rule: string, changes: string[]) {
    at.before?.(rule, changes);
    if (at.c.module.rules?.find(r => r.id === rule)?.say) { at.into.add(this.key(rule)); }
  }
  // One act by the gold, and what the company met, was offered and spoke to on the way.
  private static async step(at: { s: Session; player: AutoPlayer; metrics: ReturnType<typeof AutoplayRun.empty>;
    sets: Record<Kind, Set<string>> }, step: number): Promise<boolean> {
    const { s, player, metrics, sets } = at, c = s.campaign, aims = Undertakings.held(c);
    for (const o of aims) { sets.offered.add(`aim:${this.key(o.id)}`); }
    if (aims.length && !Undertakings.followed(c, aims)) { Undertakings.follow(c, FirstQuarter.nearest(s, aims).id); }
    for (const p of ScreenModel.build(c).people) {
      const e = c.module.entities.find(x => x.id === p.id);
      if (e?.type === 'group') { sets.met.add(this.person(p.id, e.name)); }
    }
    for (const o of PlayerView.choices(c)) {
      const own = /(tinker\d\w*?__\w+|region__\w+?_(?:pl|af|room)_[a-z]+)/.exec(o.choice.id)?.[1];
      if (own) { sets.offered.add(this.key(own)); }
    }
    const sit = AutoplayRun.situation(s, step, true, 'undertaking');
    const move = FirstQuarter.rest(s, sit.offered) ?? player.next(sit);
    if (!move) { return false; }
    if (move.kind === 'command') { this.spoke(c, move.id, sets.spoke); }
    try { await AutoplayRun.apply(s, move, player, metrics); } catch { return false; }
    return true;
  }
  // Who a command speaks with: talk_to(x), or a topic's speaker.
  private static spoke(c: AutoplayCampaign, id: string, into: Set<string>) {
    const talk = /^talk_to\(([^),]+)/.exec(id)?.[1];
    if (talk) { into.add(this.key(talk)); return; }
    const speaker = c.module.actions.find(a => a.id === id.split('(')[0])?.speaker;
    if (speaker) { into.add(this.key(speaker)); }
  }
  // The things shared by every pair compared, by how many pairs share them: the sameness every character meets.
  static sameness(pairs: Pair[]): { key: string; kind: Kind; pairs: number }[] {
    const count = new Map<string, { key: string; kind: Kind; pairs: number }>();
    for (const p of pairs) {
      for (const k of kinds) {
        for (const key of p.shared[k]) {
          const id = `${k}:${key}`, was = count.get(id) ?? { key, kind: k, pairs: 0 };
          was.pairs++; count.set(id, was);
        }
      }
    }
    return [...count.values()].sort((a, b) => b.pairs - a.pairs);
  }
  // Two characters in one world (Iscoed's drove warrior and weir mage; a1's kin and debt), and one character in two
  // worlds (the debt's warrior in a1, thorn and ash).
  static readonly walks: [string, string, string][] = [['iscoed', 'drove', 'warrior'], ['iscoed', 'weir', 'mage'],
    ['a1', 'kin', 'warrior'], ['a1', 'debt', 'warrior'], ['thorn', 'debt', 'warrior'], ['ash', 'debt', 'warrior']];
  static async main(argv: string[]): Promise<number> {
    const steps = Number(FirstQuarter.option(argv, '--steps', '100'));
    const walks: Walk[] = [];
    for (const [seed, origin, calling] of this.walks) {
      walks.push(await this.walk({ name: `${seed} ${calling} (${origin})`, seed, origin, calling }, steps));
    }
    const pairs = [this.pair(walks[0]!, walks[1]!), this.pair(walks[2]!, walks[3]!), this.pair(walks[3]!, walks[4]!),
      this.pair(walks[4]!, walks[5]!)];
    console.log('| walk | ' + kinds.join(' | ') + ' |\n|---|' + kinds.map(() => '---|').join(''));
    for (const w of walks) { console.log(`| ${w.name} | ${kinds.map(k => w.sets[k].size).join(' | ')} |`); }
    console.log('\n| pair | ' + kinds.join(' | ') + ' |\n|---|' + kinds.map(() => '---|').join(''));
    for (const p of pairs) { console.log(`| ${p.a} / ${p.b} | ${kinds.map(k => p.overlap[k]).join(' | ')} |`); }
    console.log('\nshared by most pairs:');
    for (const x of this.sameness(pairs).slice(0, 40)) { console.log(`  ${x.pairs} ${x.kind} ${x.key}`); }
    const out = FirstQuarter.option(argv, '--json', '');
    if (out) {
      const kept = walks.map(w => ({ ...w, sets: Object.fromEntries(kinds.map(k => [k, [...w.sets[k]]])) }));
      writeFileSync(out, JSON.stringify({ walks: kept, pairs }, null, 1));
    }
    return 0;
  }
}
type Session = Awaited<ReturnType<typeof AutoplayRun.start>>;
type AutoplayCampaign = Session['campaign'];
if (import.meta.main) { process.exit(await DifferenceCensus.main(process.argv.slice(2))); }
