import type { ItemCatalog } from '../item-catalog';
import { ModuleWriter } from '../lang/module-writer';
import { Burden } from '../rules/burden';
import { ItemUses } from './item-uses';
import type { World } from '../lang/world';
import type { Filling, Row } from './choice-grouping';
import type { Act } from './screen-types';
import type { Campaign } from '../campaign/campaign';

// Who in the company takes something it picks up or buys, so that taking is one choice rather than a list of hands:
// a companion already carrying something of the same kind, else the one the player plays, unless they carry far more
// than another, who takes it then. The pack can hand it on. Whoever carried least had taken everything, so a hired
// sword just joined took every find and every purchase, and players asked why (Mission 20's cold rounds).
export class Carriers {
  // What the company has on or in hand, by item id (see ChoiceGrouping: selling it is asked about first).
  static worn(campaign: Campaign): Set<string> {
    const party = new Set(campaign.readout.partyIds);
    return new Set(campaign.readout.creatures.filter(c => party.has(c.id))
      .flatMap(c => (c.state.inventory ?? []).filter(i => i.equipped).map(i => i.id)));
  }
  static readonly burdened = 6;
  // Read by the world's indexes (it had gone through every fact the world held, for each thing that could be taken).
  static carrier(catalog: ItemCatalog, world: World, actor: string, item: string): string | undefined {
    const kind = world.one('itemKind', item);
    const loads = world.relatedTo('memberOf', actor).filter(r => world.test(ModuleWriter.call('awake', r.args[0]!)))
      .map(r => ({ member: r.args[0]!, items: world.relatedTo('ownedItem', r.args[0]!).map(o => o.args[0]!) }));
    // Or what it goes with: a lamp's oil to whoever carries the lamp, a lamp to whoever carries its oil (OR-687: the
    // lantern had gone to Hugh and its oil to Orryn).
    const same = loads.find(l => l.items.some(i => Carriers.together(catalog, kind, world.one('itemKind', i))));
    // Nobody is handed what would leave them carrying more than they can, while another has room for it: a pot of
    // pitch given to the one the player plays had laden the company, and Sallowfield's causeway came an hour too late.
    const room = loads.filter(l => Carriers.fits(catalog, world, l.member, kind));
    const able = room.length ? room : loads;
    const least = [...able].sort((a, b) => a.items.length - b.items.length)[0], own = able.find(l => l === loads[0]);
    const mine = own && least && !Carriers.laden(world, own, least) ? own : least;
    return (same && able.includes(same) ? same : mine)?.member;
  }
  // Whether two kinds of thing go in one pack: the same, or a lamp and what it burns (the catalog's fuel).
  private static together(catalog: ItemCatalog, a?: string, b?: string): boolean {
    if (!a || !b) { return false; }
    const [x, y] = [a, b].map(k => k.split('__').pop()!);
    return a === b || ItemUses.fuel(catalog, x!) === y || ItemUses.fuel(catalog, y!) === x;
  }
  // Whether the one the player plays carries far more than another: by how much of what each can carry is taken up,
  // where the world weighs things, else by how many things each has. Counted, a warrior come up out of a barrow with
  // a rope, a potion and a pair of bracers had been handed nothing bought after, every ware "for Carlin", a hireling
  // carrying a third of what she could (cold play 4, CL-50).
  static readonly heavier = 0.25;
  private static laden(world: World, own: { member: string; items: string[] },
    least: { member: string; items: string[] }): boolean {
    if (!world.module.measures?.some(m => m.name === 'capacity')) {
      return own.items.length - least.items.length >= Carriers.burdened;
    }
    return Carriers.share(world, own.member) - Carriers.share(world, least.member) >= Carriers.heavier;
  }
  private static share(world: World, member: string): number {
    return world.number(ModuleWriter.call('carried', member)) / Math.max(1, world.number(ModuleWriter.call('capacity', member)));
  }
  private static fits(catalog: ItemCatalog, world: World, member: string, kind?: string): boolean {
    if (!world.module.measures?.some(m => m.name === 'capacity')) { return true; }
    const mass = kind ? world.number(ModuleWriter.call('mass', kind)) || Burden.mass(catalog, kind.split('__').pop()!) : 0;
    return world.number(ModuleWriter.call('carried', member)) + mass <= world.number(ModuleWriter.call('capacity', member));
  }
  // Who takes each thing the choices offer to take, by what is done with it ("take_item|the rope"): the one carrier()
  // would hand it to, where a choice offers it to them; else the first the choices offer it to. Two of the company
  // with one name are offered as one ("Collect a coil of rope for Harbek", for the first of them: PlayerView.alike),
  // and the one who carried least had been the other, so that a thing was offered to no one and was not at hand at
  // all: a rope, a wand and an elixir in a barrow's hall of bones came and went as either brother picked something
  // up, and a casket's gift and the king's crown were never there (the fresh playtest of 7 November).
  static hands(rows: readonly Row[], carrier: (item: string) => string | undefined): Map<string, string> {
    const hands = new Map<string, string>();
    for (const { action } of rows) {
      const { find, recipient } = action.bindings ?? {}, key = `${action.schema ?? action.id}|${find}`;
      const to = find && recipient ? carrier(find) : undefined;
      if (to && (!hands.has(key) || recipient === to)) { hands.set(key, recipient!); }
    }
    return hands;
  }
  // Who takes what is picked up, by the last of its rule's path and its rule and thing: the one hand it is offered to
  // (see hands), said beside it, not in it; none said where one has come alone. False where this is another hand's.
  static handed(last: string | undefined, key: string, { b, context }: Filling,
    at: { path: string[]; leaf: Partial<Act> }): boolean {
    if (last?.startsWith('for {recipient}') && b.recipient && context.hands?.has(key)) {
      if (context.hands.get(key) !== b.recipient) { return false; }
      at.path.pop(); if (!context.solo) { at.leaf.by = [context.names.get(b.recipient) ?? b.recipient]; }
    } else if (context.solo && last === 'for {recipient}') { at.path.pop(); }
    return true;
  }
}
