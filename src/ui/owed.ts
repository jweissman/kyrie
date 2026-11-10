import type { Campaign } from '../campaign/campaign';
import type { Change, Operator } from '../lang/module';
import type { World } from '../lang/world';
import { Canon } from '../canon/canon';
import { Treasure } from './treasure';

// Who has something for the company now (the owner, 7 November: the wagoner got out of the ditch would pay two coin
// to be told so, and nothing showed it; "a payoff waiting is invisible"): someone with a thing to be said to them,
// open now, that pays the company: coin or goods it counts, or a thing of worth put in its hands. Only what the world
// would do if it were said, never a guess from its words ("Tell the wagoner you cannot stop" is no one's payment);
// and not the tools of an errand (the key to a quarry an innkeeper hands over with the job is no reward).
export class Owed {
  static of(campaign: Campaign): Set<string> {
    return new Set(Owed.paying(campaign).map(o => o.speaker!));
  }
  // And what is to be said to them that pays: the talk leads with it, marked as the likeness is, so that the mark on
  // someone is a thing that can be said (the owner's play of 10 November: a likeness marked green, and nothing in the
  // talk that answered it).
  static topics(campaign: Campaign): string[] {
    return [...new Set(Owed.paying(campaign).map(o => o.id.replace(/\(.*$/, '')))];
  }
  static shown(campaign: Campaign): { paying?: string[] } {
    const paying = Owed.topics(campaign);
    return paying.length ? { paying } : {};
  }
  private static paying(campaign: Campaign) {
    const actor = campaign.playerActor, world = campaign.world;
    if (!actor) { return []; }
    return campaign.offered().filter(o => o.topic && o.speaker && Owed.pays(o, actor, world));
  }
  // Whether doing it pays the company: more of what it counts (coin, rations), so many of a kind given, or a thing
  // of worth given.
  static pays(o: Operator, actor: string, world: World): boolean {
    return o.success.some(c => Owed.gives(c, actor, world));
  }
  private static gives(c: Change, actor: string, world: World): boolean {
    const name = c.call.name.replace(/^.*__/, ''), [what, to] = c.call.args;
    if (c.kind === 'increase') {
      const more = c.value.kind !== 'number' || c.value.value > 0;
      return more && ((name === 'quantity' && what === actor) || (name === 'gifts' && to === actor));
    }
    return c.kind === 'assert' && name === 'handed' && to === actor && Owed.worth(world, what!);
  }
  // A thing given that is worth something: a treasure, or of a kind the catalog prices.
  private static worth(world: World, thing: string): boolean {
    const kind = world.module.relations.some(r => r.name === 'itemKind') ? world.one('itemKind', thing) : undefined;
    return Treasure.valuable(world, thing) || (Canon.items[(kind ?? thing).replace(/^.*__/, '')]?.value ?? 0) > 0;
  }
}
