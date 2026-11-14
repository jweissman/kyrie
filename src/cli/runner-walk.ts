import { Runner, type Offered, type Said } from './runner';
import { TerminalWalk, type Budget, type Presented } from './terminal-walk';

// How a blind walk chooses, from what the runner said alone (no world): straight at the aim (gold, else the first led
// with); curious (what teaches or is worth a look, not chosen before, else the first not chosen before); or seeded
// (one of the four led with, by the walk's own seed). Never anything the runner did not offer.
export type Policy = 'straight' | 'curious' | 'seeded';
// What a walk saw and did, turn by turn, and what it comes to (TB-04, TB-06).
export interface Walk {
  policy: Policy; turns: Said[]; chosen: Offered[]; scenes: Presented[]; budget: Budget; error?: string;
}
// Attention, by the doctrine (doc/design/DOCTRINE.md §2): a look, a search, a question or a study is repaid when what
// came of it says something the walk had not been told; empty when it says nothing new.
export interface Attention { repaid: number; empty: number; emptied: { label: string; said: string[] }[] }
export interface Measures {
  arrivals: number; mean: number; median: number; worst: number[]; outliers: number; within: boolean;
  // Lines of prose said again (on any later turn), and what came of an act that restated a line already told.
  repeated: string[]; restated: string[]; places: number; revisits: number;
  // The atlas's colours: on offer, led with, chosen, and chosen to something new (realized).
  available: Record<string, number>; promoted: Record<string, number>; selected: Record<string, number>;
  realized: Record<string, number>; types: Record<string, number>; ledTypes: Record<string, number>;
  attention: Attention; fights: number; retreats: number; deadEnds: number; loops: number; aimsSaid: number;
  // Turns an aim was followed and nothing it was offered led toward it (no gold, nothing pulling next): a blocker.
  lost: number; ended: boolean;
  // Gate 1's blockers by class (doc/architecture/mission-21/consolidated.md, "Two gates"), and whether the walk
  // carried an intention of its own to a consequence (an aim it followed seen through).
  blockers: Record<Blocker, number>; consequence: boolean;
}

// Gate 1's classes of blocker the runner can see: an act offered that could not be done or was refused (unpursuable),
// a turn with nothing to do (no way forward), a followed aim with nothing leading to it (lost: unpursuable too), a
// throw (crash). Creation and hangs are the round's; a focus dead end is the page's.
export type Blocker = 'creation' | 'no way forward' | 'unpursuable' | 'crash' | 'hang';
export class RunnerWalk {
  // The scene budget: three sentences of narration on arriving, on the mean; an arrival past twice that is an outlier.
  static readonly budget = 3;
  static readonly outlier = 6;
  static async run(runner: Runner, policy: Policy, turns = 30, seed = 1): Promise<Walk> {
    const said: Said[] = [runner.said()], chosen: Offered[] = [];
    let error: string | undefined;
    for (let n = 0; n < turns && !said.at(-1)!.end; n++) {
      // A walk that would follow an aim follows the first it holds, as a player told "follow 1" would.
      // The aim what pulls next names first (Succession), else the first held.
      const last = said.at(-1)!, held = last.aims?.every(a => !a.followed) ? last.aims : undefined;
      const unfollowed = policy !== 'seeded' && held && (held.find(a => a.id === last.next?.follow) ?? held[0]);
      if (unfollowed) {
        const out = await runner.ask(JSON.stringify({ follow: unfollowed.id }));
        // What it offers now; what was said on the turn stays as it was said.
        if (!('error' in out)) { said[said.length - 1] = { ...said.at(-1)!, offer: out.offer, aims: out.aims }; }
      }
      const pick = this.choose(policy, said.at(-1)!, chosen, seed + n);
      if (!pick) { break; }
      const out = await runner.ask(JSON.stringify({ act: pick.id }));
      if ('error' in out) { error = out.error; break; }
      chosen.push(pick);
      said.push(out);
    }
    const scenes = runner.scenes;
    return { policy, turns: said, chosen, scenes, budget: TerminalWalk.budget({ transcript: [], scenes }),
      ...error ? { error } : {} };
  }
  static choose(policy: Policy, s: Said, chosen: Offered[], seed: number): Offered | undefined {
    const led = s.offer.primary, all = [...led, ...s.offer.rest];
    // In a fight, whoever's turn it is gets out when brought below half, as a careful player would.
    const flee = s.moment === 'fight' ? this.flee(s) : undefined;
    if (flee) { return flee; }
    // Straight at the aim; else at what pulls next, where it is an act.
    const next: Offered | undefined = s.next?.act ? { id: s.next.act, label: s.next.label ?? s.next.text, aspects: [],
      type: 'other', marks: [] } : undefined;
    if (policy === 'straight') { return led.find(o => o.aspects.includes('undertaking')) ?? next ?? led[0] ?? all[0]; }
    if (policy === 'curious') {
      const fresh = all.filter(o => !chosen.some(c => c.id === o.id));
      return fresh.find(o => led.includes(o) && o.aspects.some(a => ['knowledge', 'exploration'].includes(a)))
        ?? fresh.find(o => led.includes(o) && this.attending(o)) ?? fresh.find(o => led.includes(o)) ?? fresh[0]
        ?? led[0];
    }
    return led.length ? led[(seed * 7919) % led.length] : all[0];
  }
  private static flee(s: Said): Offered | undefined {
    const who = /^Let (.+) fight this turn$/.exec(s.offer.primary.find(o => /^Let /.test(o.label))?.label ?? '')?.[1];
    const hp = who && new RegExp(`(?:^| · )${who} (\\d+)/(\\d+)`).exec(s.scene.lines.at(-1) ?? '');
    return hp && Number(hp[1]) * 2 < Number(hp[2]) ? s.offer.primary.find(o => o.label === 'Flee') : undefined;
  }
  // What is attention rather than doing: talking, searching, studying, looking at something.
  static attending(o: Offered): boolean {
    return ['talk', 'search', 'study'].includes(o.type) || /^(Look|Search|Listen|Ask|Read|Examine|Study)\b/.test(o.label);
  }
  static measure(walk: Walk): Measures {
    const arrived = walk.turns.filter(t => t.moment === 'arrive'), b = walk.budget;
    const places = arrived.map(t => t.scene.lines[0] ?? ''), told = this.told(walk);
    return { arrivals: b.scenes, mean: b.mean, median: b.median, worst: b.worst.map(w => w.sentences),
      outliers: walk.scenes.filter(w => w.turned === 'arrive' && w.sentences > this.outlier).length, within: b.mean <= this.budget,
      repeated: told.repeated, restated: told.restated, places: new Set(places).size,
      revisits: places.length - new Set(places).size,
      available: this.tally(walk.turns.flatMap(t => [...t.offer.primary, ...t.offer.rest].flatMap(o => o.aspects))),
      promoted: this.tally(walk.turns.flatMap(t => t.offer.primary.flatMap(o => o.aspects.length ? o.aspects : ['none']))),
      selected: this.tally(walk.chosen.flatMap(o => o.aspects.length ? o.aspects : ['none'])),
      realized: this.tally(walk.chosen.flatMap((o, i) => told.fresh[i] ? o.aspects : [])),
      types: this.tally(walk.chosen.map(o => o.type)),
      ledTypes: this.tally(walk.turns.flatMap(t => t.offer.primary.map(o => o.type))),
      attention: this.attention(walk, told.fresh), fights: walk.chosen.filter(o => o.type === 'fight').length,
      retreats: walk.turns.filter(t => t.scene.prose.some(l => /clear of the fight|gets? away/.test(l))).length,
      deadEnds: walk.turns.filter(t => !t.end && !t.offer.primary.length).length, loops: this.loops(walk.chosen),
      aimsSaid: new Set(walk.turns.flatMap(t => t.aim ?? [])).size, lost: this.lost(walk),
      ended: !!walk.turns.at(-1)?.end, blockers: this.blockers(walk), consequence: this.consequence(walk) };
  }
  // Each turn after the first: whether what came of its act told anything not told before; lines said again on any
  // later turn; and the outcomes that restated one.
  private static told(walk: Walk) {
    const seen = new Set<string>(), repeated = new Set<string>(), restated = new Set<string>(), fresh: boolean[] = [];
    walk.turns.forEach((t, i) => {
      const lines = t.scene.prose.filter(l => l.trim());
      if (i > 0) { fresh.push(lines.some(l => !seen.has(l))); }
      for (const l of lines) {
        if (seen.has(l)) { repeated.add(l); }
        if (seen.has(l) && t.moment === 'outcome') { restated.add(l); }
        seen.add(l);
      }
    });
    return { repeated: [...repeated], restated: [...restated], fresh };
  }
  private static attention(walk: Walk, fresh: boolean[]): Attention {
    const at = walk.chosen.map((o, i) => ({ o, i })).filter(x => this.attending(x.o));
    const empty = at.filter(x => !fresh[x.i]);
    return { repaid: at.length - empty.length, empty: empty.length,
      emptied: empty.map(x => ({ label: x.o.label, said: walk.turns[x.i + 1]?.scene.prose ?? [] })) };
  }
  private static blockers(walk: Walk): Record<Blocker, number> {
    const error = walk.error ?? '';
    return { 'creation': 0, 'no way forward': walk.turns.filter(t => !t.end && !t.offer.primary.length).length,
      'unpursuable': this.lost(walk) + Number(/^(not offered|could not be done)/.test(error)),
      'crash': Number(!!error && !/^(not offered|could not be done)/.test(error)), 'hang': 0 };
  }
  // An aim followed on one turn, and on a later one gone from those held: seen through (or ended by the world).
  private static consequence(walk: Walk): boolean {
    return walk.turns.some((t, i) => i > 0 && (walk.turns[i - 1]!.aims ?? []).some(a => a.followed
      && !(t.aims ?? []).some(b => b.id === a.id)));
  }
  private static lost(walk: Walk): number {
    // Not where a danger stands in front of the company, nor just got away from one: what to do about it (or getting
    // over it) is the next thing, not the aim.
    return walk.turns.filter((t, i) => t.moment !== 'fight' && !t.end && t.aims?.some(a => a.followed) && !t.next
      && !t.offer.primary.some(o => o.aspects.includes('danger')) && !/^fight:flee:/.test(walk.chosen[i - 1]?.id ?? '')
      && ![...t.offer.primary, ...t.offer.rest].some(o => o.aspects.includes('undertaking'))).length;
  }
  // Acts chosen again, by their words, within a few turns of the first time: going round.
  private static loops(chosen: Offered[]): number {
    return chosen.filter((o, i) => o.type !== 'fight'
      && chosen.slice(Math.max(0, i - 4), i).some(c => c.label === o.label)).length;
  }
  private static tally(xs: string[]): Record<string, number> {
    return xs.reduce<Record<string, number>>((m, x) => ({ ...m, [x]: (m[x] ?? 0) + 1 }), {});
  }
}
