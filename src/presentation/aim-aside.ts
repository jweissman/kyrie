import type { Campaign } from '../campaign/campaign';
import { EntityIndex } from '../lang/index';
import { ModuleWriter } from '../lang/index';
import type { Screen } from '../ui/screen-types';
import type { Candidate } from '../ui/promotion';
import { AimLeading } from './aim-lead';
import { Guarded } from './guarded';
import { Outmatched } from './outmatched';
import { SiteOutsides } from './site-outsides';
import { Undertakings } from './undertakings';

// An aim set aside, from anywhere, while its way is barred by a keeper the company has met there and reckons beyond
// it, and no help is to be had (the coordinator's call, 24 November, on OR-411 with OR-412): its ways lead no more,
// the notice or the next true lead takes over, and the need says why it waits. It is not lost: once the company is
// strong enough (someone joins, a level is gained) the keeper is no longer beyond it, and the aim leads again. Where
// help can be hired, the help leads first (Outmatched), and the aim is not set aside.
export class AimAside {
  // What bars the followed aim's way, said as a need; none where nothing does, or where help is to be had.
  static of(campaign: Campaign, screen: Screen, help: boolean): { said: string; room: string } | undefined {
    const lead = AimLeading.of(campaign, screen), next = lead?.next[0], party = campaign.playerActor;
    const o = Undertakings.followed(campaign);
    if (help || !party || !next || !o) { return undefined; }
    const byId = EntityIndex.of(campaign.module.entities).byId, w = campaign.world, outsides = SiteOutsides.of(w, byId);
    // The site the aim goes into, or whose outside it goes to (Windtower's door, the way into its guard-floor); or
    // that it names, from further off (OR-417: from Brockminster the son had been led out toward Windtower again, its
    // lookouts beyond him, and back, round and round).
    const sites = new Set([next, ...Undertakings.names(campaign, o)].flatMap(id => {
      const to = byId.get(id)?.space ? id : w.one('at', id);
      const site = to && (SiteOutsides.siteOf(byId, to) ?? outsides.get(to));
      return site ? [site] : [];
    }));
    if (!sites.size) { return undefined; }
    for (const e of campaign.module.entities) {
      const site = e.space && SiteOutsides.siteOf(byId, e.id);
      if (!site || !sites.has(site) || !w.test(ModuleWriter.call('been', party, e.id))) { continue; }
      const keeper = Guarded.beyond(campaign, e.id);
      if (keeper) { return { said: `Your aim waits: ${Guarded.said(e.name, keeper)}`, room: e.id }; }
    }
    return undefined;
  }
  // Where a keeper met bars the aim's way and someone could go along: them, and where they are, to lead to first (the
  // owner's call on OR-411: help to be had leads; OR-417: a mage with the hand along had been led in and out of the
  // Hall cellar past its rats, with Arlen in the taproom).
  // Whoever would go along, where the aim's fight is beyond the company (Outmatched) or a keeper met bars its way.
  static reading(campaign: Campaign, screen: Screen): { help?: { who: string; at: string } } {
    const out = Outmatched.reading(campaign, screen);
    if (out.help) { return out; }
    const who = this.of(campaign, screen, false) && Outmatched.help(campaign), at = who && campaign.world.one('at', who);
    return who && at ? { help: { who, at } } : {};
  }
  // A candidate with the set-aside aim's reasons taken off it, and no reason at all to go into the keeper's room
  // (the son at Windtower's door had been led in again by the door itself, a way not yet tired of).
  static strip(c: Candidate, screen: Screen, room: string): Candidate {
    // Unless it is the only way on from here (Windtower's well-chamber, its one way out past the lookouts: OR-411),
    // which leads plain, for no reason.
    const open = screen.exits.filter(e => !e.blocked), only = open.length === 1 && open[0]!.destination.id === room;
    const into = !only && !!c.exit && screen.exits.some(e => e.id === c.exit && e.destination.id === room);
    return into ? { ...c, whys: [], held: true }
      : { ...c, whys: c.whys.filter(w => !['named', 'toward', 'advance', 'about', 'bound'].includes(w)) };
  }
}
