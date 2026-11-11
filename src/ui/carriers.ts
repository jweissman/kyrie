import { ModuleWriter } from '../lang/module-writer';
import { Burden } from '../rules/burden';
import type { World } from '../lang/world';
import type { Row } from './choice-grouping';
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
  static carrier(world: World, actor: string, item: string): string | undefined {
    const kind = world.one('itemKind', item);
    const loads = world.relatedTo('memberOf', actor).filter(r => world.test(ModuleWriter.call('awake', r.args[0]!)))
      .map(r => ({ member: r.args[0]!, items: world.relatedTo('ownedItem', r.args[0]!).map(o => o.args[0]!) }));
    const same = loads.find(l => l.items.some(i => world.one('itemKind', i) === kind));
    // Nobody is handed what would leave them carrying more than they can, while another has room for it: a pot of
    // pitch given to the one the player plays had laden the company, and Sallowfield's causeway came an hour too late.
    const room = loads.filter(l => Carriers.fits(world, l.member, kind));
    const able = room.length ? room : loads;
    const least = [...able].sort((a, b) => a.items.length - b.items.length)[0], own = able.find(l => l === loads[0]);
    const mine = own && least && own.items.length - least.items.length < Carriers.burdened ? own : least;
    return (same && able.includes(same) ? same : mine)?.member;
  }
  private static fits(world: World, member: string, kind?: string): boolean {
    if (!world.module.measures?.some(m => m.name === 'capacity')) { return true; }
    const mass = kind ? world.number(ModuleWriter.call('mass', kind)) || Burden.mass(kind.split('__').pop()!) : 0;
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
}
