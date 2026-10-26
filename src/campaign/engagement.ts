import { ModuleWriter } from '../lang/module-writer';
import type { Change, Operator } from '../lang/module';
import type { CampaignEvent } from './campaign-types';
import { CampaignTick, type TickHost } from './campaign-tick';

export interface EngagementHost extends TickHost {
  operator(id: string): Operator | undefined;
  readonly events: CampaignEvent[];
  // Replaces the last recorded event with a fuller account of the same command.
  amend(event: CampaignEvent): void;
}
// When someone falls on the company. A fact that a group assails the company, while both stand in one place and the
// assailant can fight, stops whatever the company was doing; the fight that follows is an attack the company did not
// choose, fought there and then. Afterwards the assault is spent, and a company that ran is back where it came from.
export class Engagement {
  // The group falling on the company now, if any.
  static foe(host: TickHost): string | undefined {
    const player = host.playerActor, world = host.world;
    if (!player || !world.module.relations.some(r => r.name === 'assails')) { return undefined; }
    const here = world.one('at', player);
    return world.related('assails').find(r => r.args[1] === player
      && world.test(ModuleWriter.call('able', r.args[0]!)) && world.test(ModuleWriter.call('at', r.args[0]!, here ?? '')))
      ?.args[0];
  }
  // Someone who has stopped the company where it is, if anyone: the stop is spent once it has been told.
  static halt(host: TickHost): string | undefined {
    const player = host.playerActor, world = host.world;
    if (!player || !world.module.relations.some(r => r.name === 'halts')) { return undefined; }
    const here = world.one('at', player) ?? '';
    const stop = world.related('halts').find(r => r.args[1] === player
      && world.test(ModuleWriter.call('able', r.args[0]!)) && world.test(ModuleWriter.call('at', r.args[0]!, here)));
    if (!stop) { return undefined; }
    host.commitWorld(world.apply([{ kind: 'retract', call: ModuleWriter.call('halts', ...stop.args) }]));
    return this.told(host, stop.args[0]!).replace(/ (comes|come) at you!$/, (_, v: string) => ` ${v === 'come' ? 'stop' : 'stops'} you.`);
  }
  // How the company learns it is set upon: in the assailant's own words, if they were just told ("The Wet comes down
  // the gallery at you"), or plainly.
  static announced(host: TickHost, foe: string, told: { text: string }[]): string {
    const name = (host.world.module.entities.find(e => e.id === foe)?.name ?? foe).split(', ')[0]!.toLowerCase();
    return told.find(h => h.text.toLowerCase().includes(name))?.text ?? this.told(host, foe);
  }
  // "The gate sentry comes at you!": the name without its role, and the verb for how many they are.
  static told(host: TickHost, foe: string): string {
    const name = (host.world.module.entities.find(e => e.id === foe)?.name ?? foe).split(', ')[0]!;
    const many = (host.tickState.definition.actors.find(a => a.id === foe)?.members.length ?? 1) > 1;
    return `${name.charAt(0).toUpperCase()}${name.slice(1)} ${many ? 'come' : 'comes'} at you!`;
  }
  // The attack the company is drawn into: the standard attack, against the assailant, where they stand. A company
  // that has just run from a fight it chose has gone back the way it came first, and is not fallen on again by what
  // it ran from (the cold playtest fled the cave spiders, and "The ferocious cave spiders come at you!" followed).
  static assault(host: EngagementHost): Operator | undefined {
    this.withdraw(host);
    const foe = this.foe(host), player = host.playerActor;
    if (!foe || !player) { return undefined; }
    const here = host.world.one('at', player);
    return host.operator(`attack(${player},${foe},${here})`);
  }
  // The assault is over: it no longer stands, and a company that ran from it goes back the way it came.
  static after(host: EngagementHost, first: CampaignEvent, fight: CampaignEvent, foe: string): CampaignEvent {
    const player = host.playerActor!, world = host.world;
    const changes: Change[] = [{ kind: 'retract', call: ModuleWriter.call('assails', foe, player) }];
    const ran = this.ran(fight);
    const here = world.one('at', player);
    const back = ran ? this.cameFrom(host.events, player, here) : undefined;
    if (back && here) {
      changes.push({ kind: 'retract', call: ModuleWriter.call('at', player, here) },
        { kind: 'assert', call: ModuleWriter.call('at', player, back) });
    }
    const after = world.apply(changes);
    host.commitWorld(after);
    // Both fights are told: the one the company chose (the mud it attacked), then the one that came at it after.
    // What came of the first is told too (the cage wound up), but not who came at the company: that is told between.
    const before = (first.perceptions ?? []).filter(p => p.kind === 'event' && p.text !== first.response);
    const told: CampaignEvent = { ...fight, combat: [...first.combat, ...fight.combat],
      perceptions: [...before, ...fight.perceptions ?? []],
      changes: [...fight.changes, ...CampaignTick.diff(world, after)],
      prelude: { action: first.action, fought: first.combat.length,
        ...(first.response ? { response: first.response } : {}),
        ...(first.perceptions?.length ? { perceptions: first.perceptions } : {}) }, ...(back ? { fledTo: back } : {}) };
    host.amend(told);
    return told;
  }
  private static withdraw(host: EngagementHost) {
    const event = host.events.at(-1), player = host.playerActor, world = host.world;
    if (!event || !player || !this.ran(event)) { return; }
    const here = world.one('at', player), back = this.cameFrom(host.events.slice(0, -1), player, here);
    if (!back || !here) { return; }
    // Whoever would have come at it where it stood does not, and is not said to: the company has gone.
    const foe = this.foe(host), gone = foe && this.announced(host, foe, (event.perceptions ?? []).filter(p => p.kind === 'event'));
    const after = world.apply([{ kind: 'retract', call: ModuleWriter.call('at', player, here) },
      { kind: 'assert', call: ModuleWriter.call('at', player, back) },
      ...foe ? [{ kind: 'retract' as const, call: ModuleWriter.call('assails', foe, player) }] : []]);
    host.commitWorld(after);
    const { response, ...rest } = event;
    host.amend({ ...rest, ...response && response !== gone ? { response } : {},
      perceptions: event.perceptions?.filter(p => p.text !== gone),
      changes: [...event.changes, ...CampaignTick.diff(world, after)], fledTo: back });
  }
  private static ran(event: CampaignEvent): boolean {
    return event.combat.some(e => e.type === 'end' && e.outcome === 'escaped' && e.fled?.team !== 'goblins');
  }
  // The place the company was in before it came here, from what the log records.
  private static cameFrom(events: CampaignEvent[], player: string, here: string | undefined): string | undefined {
    const pattern = new RegExp(`^- at\\(${player}, (.+)\\)$`);
    for (const event of [...events].reverse()) {
      const left = event.changes.map(c => pattern.exec(c)?.[1]).find(Boolean);
      if (left && left !== here) { return left; }
    }
    return undefined;
  }
}
