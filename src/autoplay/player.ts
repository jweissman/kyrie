import type { Battle } from '../battle';
import type { Command } from '../model';
import { Tactics } from '../tactics';
import { Draw } from './draw';

export type Temper = 'wander' | 'intent' | 'fight' | 'investigate' | 'care' | 'expedition' | 'deviate';
export type PolicyName = Temper | 'mixed';
export interface Offered { id: string; name: string }
export interface Situation {
  offered: Offered[]; destinations: { id: string; name: string }[]; visited: ReadonlySet<string>; step: number;
}
export type Move = { kind: 'command'; id: string } | { kind: 'travel'; to: string };

// One player of the autoplay laboratory. It chooses only among what the game offers (no teleport, no command the page
// would not show), by a temper held for a stretch of play: a wanderer, someone going somewhere known, a fighter, an
// investigator, someone looking after the company, an expedition out and home, or someone doing the unexpected.
// A mixed player changes temper every stretch. It fights its own turns mostly as the game's tactics would, sometimes
// with a legal blow at random, and now and then by running.
export class AutoPlayer {
  static readonly tempers: Temper[] = ['wander', 'intent', 'fight', 'investigate', 'care', 'expedition', 'deviate'];
  static readonly stretch = 24;
  // The kinds of choice, by the command's schema.
  static readonly kinds: Record<string, RegExp> = {
    go: /^go\(/, fight: /^(attack|engage|ambush|assail)\w*\(/, talk: /^(talk_to|ask|tell|greet|address)\w*\(/,
    look: /^(examine|read|look|listen|prod|search|study|inspect|watch)\w*\(?/, take: /^(take|collect|pick)\w*\(/,
    care: /^(rest|take_lodging|make_camp|camp|sleep|take_healing|tend|bind|heal|eat)\w*\(?/,
    trade: /^(buy|sell|barter)\w*\(/, gear: /^(equip|unequip|light|douse|put)\w*\(/,
    grow: /^(learn_skill|raise_quality|learn_spell|take_feat|prepare_spell)\(/,
    join: /^(join|hire|recruit|invite)\w*\(/,
    wait: /^wait/,
  };
  private temper: Temper;
  private readonly tried = new Set<string>();
  constructor(readonly policy: PolicyName, private readonly draw: Draw) {
    this.temper = policy === 'mixed' ? 'wander' : policy;
  }
  get mood(): Temper { return this.temper; }
  static kind(id: string): string {
    return Object.entries(this.kinds).find(([, re]) => re.test(id))?.[0] ?? 'other';
  }
  // Where a way leads: the last of its command's arguments.
  static destination(id: string): string { return id.replace(/\)$/, '').split(',').at(-1)!; }
  next(s: Situation): Move | undefined {
    if (this.policy === 'mixed' && s.step % AutoPlayer.stretch === 0) { this.temper = this.draw.pick(AutoPlayer.tempers)!; }
    if (!s.offered.length) { return undefined; }
    const move = this.preferred(s) ?? { kind: 'command' as const, id: this.draw.pick(s.offered)!.id };
    if (move.kind === 'command') { this.tried.add(move.id); }
    return move;
  }
  // How it fights its own turns.
  readonly controller = (battle: Battle): Promise<Command> => {
    const legal = battle.legalCommands(), flee = legal.find(c => c.ability === 'flee');
    if (flee && this.draw.chance(this.temper === 'fight' ? 0.02 : 0.08)) { return Promise.resolve(flee); }
    const blows = legal.filter(c => c.ability !== 'flee' && c.ability !== 'wait');
    const pick = this.draw.chance(0.3) ? this.draw.pick(blows) : undefined;
    return Promise.resolve(pick ?? Tactics.choose(battle.state, legal));
  };
  private of(s: Situation, ...kinds: string[]): Offered[] {
    return s.offered.filter(o => kinds.includes(AutoPlayer.kind(o.id)));
  }
  private command(o?: Offered): Move | undefined { return o ? { kind: 'command', id: o.id } : undefined; }
  private fresh(s: Situation): Offered[] {
    return this.of(s, 'go').filter(o => !s.visited.has(AutoPlayer.destination(o.id)));
  }
  private preferred(s: Situation): Move | undefined {
    const d = this.draw;
    switch (this.temper) {
      case 'wander': return this.command(d.chance(0.75) ? d.pick(this.fresh(s)) ?? d.pick(this.of(s, 'go'))
        : d.pick(this.of(s, 'look', 'talk', 'take')));
      case 'intent': return this.travel(s) ?? this.command(d.pick(this.fresh(s)));
      case 'fight': return this.command(d.pick(this.of(s, 'fight'))) ?? this.site(s) ?? this.command(d.pick(this.fresh(s)));
      case 'investigate': return this.command(d.pick(this.of(s, 'talk', 'look').filter(o => !this.tried.has(o.id)))
        ?? d.pick(this.fresh(s)));
      case 'care': return this.command(d.pick(this.of(s, 'care', 'grow', 'gear', 'trade', 'join')) ?? d.pick(this.of(s, 'wait')));
      case 'expedition': return this.expedition(s) ?? this.command(d.pick(this.of(s, 'fight')) ?? d.pick(this.fresh(s)));
      case 'deviate': return this.command(d.pick(s.offered));
    }
  }
  // Somewhere known and not yet been to, along the ways the company knows.
  private travel(s: Situation): Move | undefined {
    const unvisited = s.destinations.filter(t => !s.visited.has(t.id));
    const to = this.draw.pick(unvisited.length ? unvisited : s.destinations);
    return to && this.draw.chance(0.5) ? { kind: 'travel', to: to.id } : undefined;
  }
  // A known place that is not a settlement, where there may be something to meet.
  private site(s: Situation): Move | undefined {
    const to = this.draw.pick(s.destinations.filter(t => !/^region__s\d+$|_edge_/.test(t.id) && !s.visited.has(t.id)));
    return to && this.draw.chance(0.4) ? { kind: 'travel', to: to.id } : undefined;
  }
  // Out to a site known of for most of the stretch, and home again at its end.
  private expedition(s: Situation): Move | undefined {
    const late = s.step % AutoPlayer.stretch >= AutoPlayer.stretch * 2 / 3;
    const sites = s.destinations.filter(t => !/^region__s\d+$|_edge_/.test(t.id));
    const homes = s.destinations.filter(t => /^region__s\d+$/.test(t.id));
    const to = this.draw.pick(late ? homes : sites);
    return to && (late || this.draw.chance(0.3)) ? { kind: 'travel', to: to.id } : undefined;
  }
}
