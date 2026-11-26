import type { Campaign } from '../campaign/campaign';
import { ModuleWriter } from '../lang/module-writer';
import type { Screen } from '../ui/screen-types';
import { CompanyRecall } from './company-recall';

// What the company has to see by: where none of it carries a light or has one going, the kinds of thing that light
// (for one who sells it: Affordances.served), and the ways from here into somewhere unlit, which lead nowhere it can
// do anything (a lone ranger whose candle had burned down was led down into the dark cellar and back up, four times:
// the laboratory's lost turns).
export class CompanyLight {
  // way: the first of the known way from here to the nearest place that answers (KnownWays.first), for lit.
  static of(campaign: Campaign, screen: Screen, way?: (to: (id: string) => boolean) => string | undefined):
    { unlit?: Set<string>; dark?: Set<string>; sellers?: Set<string>; shops?: Set<string>; lit?: string } {
    const w = campaign.world, party = campaign.playerActor;
    if (!party || !w.relates('lightsUp') || !w.relates('ownedItem')) { return {}; }
    const lights = new Set(w.related('lightsUp').map(r => r.args[0]!));
    const members = w.related('memberOf').filter(r => r.args[1] === party).map(r => r.args[0]!);
    const lit = members.some(m => w.relates('brings') && w.test(ModuleWriter.call('brings', m, 'light')))
      || w.related('ownedItem').some(r => members.includes(r.args[1]!) && lights.has(w.one('itemKind', r.args[0]!) ?? ''))
      || this.lamp(campaign, members);
    if (lit) { return {}; }
    // Only from somewhere lit: in the dark already, the way out is through it (fled to the undercroft with the candle
    // gone, the way up toward Mik had not been gold: the laboratory's lost turns).
    const dark = new Set(screen.dark ? [] : screen.exits.map(e => e.destination.id).filter(id => this.unlit(w, id)));
    // In the dark already, the first of the known way to the nearest place the company can see in again (OR-590: on
    // seed c3 the candle burned out in the undercroft, and the walk went on from room to room under the town, the
    // drain, the rat-runs, the nest, the charnel passage, never led up toward the town where a light is sold).
    const toward = screen.dark ? way?.(id => id !== screen.place.id && !this.unlit(w, id)) : undefined;
    // And who sells a light, where the dark lies ahead: the aim's way goes by them (see Glance.reading).
    // (A kind of the catalog is kept on a shelf; a good of the module's own, sold.)
    const sellers = dark.size ? new Set([...campaign.module.initial.flatMap(c => c.kind === 'set'
      && c.call.name === 'shelf' && lights.has(c.call.args[1]!) ? [c.call.args[0]!] : []),
    ...w.relates('sells') ? w.related('sells').filter(r => lights.has(r.args[1]!)).map(r => r.args[0]!) : []]) : undefined;
    // And where the company knows them to stand (where it last saw them, or the shop it knows they keep), for the ways
    // and the walks about the town to lead there (Affordances): never where they stand unseen (OR-881).
    const shops = new Set([...sellers ?? []].flatMap(p => CompanyRecall.shop(campaign, p) ?? []));
    return { unlit: lights, ...dark.size ? { dark } : {}, ...sellers?.size ? { sellers, shops } : {},
      ...toward ? { lit: toward } : {} };
  }
  private static unlit(w: Campaign['world'], place: string): boolean { return w.test(ModuleWriter.call('unlit', place)); }
  // Whether the company carries a lantern and a flask of what it burns, whoever of it has each (OR-685: light_lamp
  // fills one's lantern from another's flask): a light to hand, as a torch is (the weir route: Ilse's conjured light
  // spent, a lantern and two flasks of oil in her pack, the gate-well's dark had led her up to the guest-hall for a
  // light to buy, and back, round, by the gatehouse).
  private static lamp(campaign: Campaign, members: string[]): boolean {
    const w = campaign.world;
    if (!w.relates('burns')) { return false; }
    const kinds = new Set(w.related('ownedItem').filter(r => members.includes(r.args[1]!))
      .flatMap(r => w.one('itemKind', r.args[0]!) ?? []));
    return w.related('burns').some(b => kinds.has(b.args[0]!) && kinds.has(b.args[1]!));
  }
}
