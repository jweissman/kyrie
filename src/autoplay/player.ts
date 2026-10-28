import type { Battle } from '../battle';
import type { Command } from '../model';
import { Tactics } from '../tactics';
import { DangerSense } from '../presentation/danger-sense';
import { Draw } from './draw';

export type Temper = 'wander' | 'intent' | 'fight' | 'investigate' | 'care' | 'expedition' | 'deviate';
export type PolicyName = Temper | 'mixed';
export interface Offered { id: string; name: string }
export interface Situation {
  offered: Offered[]; destinations: { id: string; name: string }[]; visited: ReadonlySet<string>; step: number;
  // How each fight offered would go, as the page reckons it before it is begun (DangerSense), by its command.
  dangers?: Record<string, string>;
  // Night, when the roads are dark.
  dark?: boolean;
}
export type Move = { kind: 'command'; id: string } | { kind: 'travel'; to: string };

// One player of the autoplay laboratory. It chooses only among what the game offers (no teleport, no command the page
// would not show), by a temper held for a stretch of play: a wanderer, someone going somewhere known, a fighter, an
// investigator, someone looking after the company, an expedition out and home, or someone doing the unexpected.
// A mixed player changes temper every stretch. It fights its own turns mostly as the game's tactics would, sometimes
// with a legal blow at random, and now and then by running. A fighter and an expedition take on only what the page
// reckons can be won, as a careful player would; and any temper but the unexpected meets a demand it can meet (the
// road-money, a toll), goes back from a band the page reckons beyond it, and does not walk the roads at night.
// Someone doing the unexpected takes on anything.
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
    // Meeting a demand: road-money, a toll, a fine, an empty purse turned out, going quietly (a module's own action
    // is named for its module: raidersFolk__pay_road_money).
    yield: /^(\w+__)?(pay_|show_empty_purse|go_with)\w*\(/,
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
  // How it fights its own turns: as the game's tactics would (as the page's reckoning of a fight assumes), now and
  // then by running; someone doing the unexpected strikes about at random as often as not.
  readonly controller = (battle: Battle): Promise<Command> => {
    const legal = battle.legalCommands(), flee = legal.find(c => c.ability === 'flee');
    // In the moment before a fight that came at it closes, a careful player backs away from one it reckons it could
    // lose; someone doing the unexpected stands.
    if (flee && battle.opening && this.temper !== 'deviate' && ['grave', 'deadly'].includes(DangerSense.of(battle).danger)) {
      return Promise.resolve(flee);
    }
    if (flee && this.draw.chance(this.temper === 'fight' ? 0.02 : 0.08)) { return Promise.resolve(flee); }
    const blows = legal.filter(c => c.ability !== 'flee' && c.ability !== 'wait');
    const pick = this.temper === 'deviate' && this.draw.chance(0.5) ? this.draw.pick(blows) : undefined;
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
    const d = this.draw, careful = this.temper === 'deviate' ? undefined : this.careful(s);
    if (careful) { return careful; }
    switch (this.temper) {
      case 'wander': return this.command(d.chance(0.75) ? d.pick(this.fresh(s)) ?? d.pick(this.of(s, 'go'))
        : d.pick(this.of(s, 'look', 'talk', 'take')));
      case 'intent': return this.travel(s) ?? this.command(d.pick(this.fresh(s)));
      case 'fight': return this.command(d.pick(this.winnable(s))) ?? this.site(s) ?? this.command(d.pick(this.fresh(s)));
      case 'investigate': return this.command(d.pick(this.of(s, 'talk', 'look').filter(o => !this.tried.has(o.id)))
        ?? d.pick(this.fresh(s)));
      case 'care': return this.command(d.pick(this.of(s, 'care', 'grow', 'gear', 'trade', 'join')) ?? d.pick(this.of(s, 'wait')));
      case 'expedition': return this.expedition(s) ?? this.command(d.pick(this.winnable(s)) ?? d.pick(this.fresh(s)));
      case 'deviate': return this.command(d.pick(s.offered));
    }
  }
  // What a careful player does first: meets a demand it can, goes back from what is beyond it to somewhere it has
  // been, and rests, or waits for the light, rather than go on in the dark.
  private careful(s: Situation): Move | undefined {
    const demand = this.of(s, 'yield')[0];
    if (demand) { return this.command(demand); }
    if (Object.values(s.dangers ?? {}).some(x => ['grave', 'deadly'].includes(x))) {
      const back = this.of(s, 'go').find(o => s.visited.has(AutoPlayer.destination(o.id)));
      if (back) { return this.command(back); }
    }
    const rest = s.dark ? s.offered.find(o => /^(rest|camp|take_lodging|wait_for_light)/.test(o.id)) : undefined;
    return this.command(rest);
  }
  // The fights the page does not reckon could be lost, or beyond the company.
  private winnable(s: Situation): Offered[] {
    return this.of(s, 'fight').filter(o => !['grave', 'deadly'].includes(s.dangers?.[o.id] ?? ''));
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
