import type { Campaign } from '../campaign/campaign';
import { ModuleWriter } from '../lang/module-writer';
import type { Screen } from '../ui/screen-types';

// What the company has to see by: where none of it carries a light or has one going, the kinds of thing that light
// (for one who sells it: Affordances.served), and the ways from here into somewhere unlit, which lead nowhere it can
// do anything (a lone ranger whose candle had burned down was led down into the dark cellar and back up, four times:
// the laboratory's lost turns).
export class CompanyLight {
  static of(campaign: Campaign, screen: Screen): { unlit?: Set<string>; dark?: Set<string>; sellers?: Set<string>;
    shops?: Set<string> } {
    const w = campaign.world, party = campaign.playerActor;
    if (!party || !w.relates('lightsUp') || !w.relates('ownedItem')) { return {}; }
    const lights = new Set(w.related('lightsUp').map(r => r.args[0]!));
    const members = w.related('memberOf').filter(r => r.args[1] === party).map(r => r.args[0]!);
    const lit = members.some(m => w.relates('brings') && w.test(ModuleWriter.call('brings', m, 'light')))
      || w.related('ownedItem').some(r => members.includes(r.args[1]!) && lights.has(w.one('itemKind', r.args[0]!) ?? ''));
    if (lit) { return {}; }
    // Only from somewhere lit: in the dark already, the way out is through it (fled to the undercroft with the candle
    // gone, the way up toward Mik had not been gold: the laboratory's lost turns).
    const dark = new Set(screen.dark ? [] : screen.exits.map(e => e.destination.id)
      .filter(id => w.test(ModuleWriter.call('unlit', id))));
    // And who sells a light, where the dark lies ahead: the aim's way goes by them (see Glance.reading).
    // (A kind of the catalog is kept on a shelf; a good of the module's own, sold.)
    const sellers = dark.size ? new Set([...campaign.module.initial.flatMap(c => c.kind === 'set'
      && c.call.name === 'shelf' && lights.has(c.call.args[1]!) ? [c.call.args[0]!] : []),
    ...w.relates('sells') ? w.related('sells').filter(r => lights.has(r.args[1]!)).map(r => r.args[0]!) : []]) : undefined;
    // And where they stand, for the ways and the walks about the town to lead there (Affordances).
    const shops = new Set([...sellers ?? []].flatMap(p => w.one('at', p) ?? []));
    return { unlit: lights, ...dark.size ? { dark } : {}, ...sellers?.size ? { sellers, shops } : {} };
  }
}
