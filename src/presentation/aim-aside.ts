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
import { CompanyRecall } from './company-recall';

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
    // What the aim waits on to be found or learned here is not beyond the keeper (Neblalac's hall: the pillar's marks
    // to read, and the aim had been set aside for the hounds past the water-stair, nothing gold: test/gold-thread).
    if (['hidden', 'taught'].includes(lead!.source) && next === screen.place.id) { return undefined; }
    const byId = EntityIndex.of(campaign.module.entities).byId, w = campaign.world, outsides = SiteOutsides.of(w, byId);
    // The site the aim goes into, or whose outside it goes to (Windtower's door, the way into its guard-floor); or
    // that it names, from further off (OR-417: from Brockminster the son had been led out toward Windtower again, its
    // lookouts beyond him, and back, round and round).
    const names = Undertakings.names(campaign, o), sites = new Set<string>(), rooms = new Set<string>();
    // Where the company knows them to be, never where they stand unseen (OR-881).
    for (const id of [next, ...names]) {
      const to = CompanyRecall.where(campaign, id);
      const site = to && (SiteOutsides.siteOf(byId, to) ?? outsides.get(to));
      if (site) { sites.add(site); } else if (to && byId.get(to)?.space?.kind === 'room') { rooms.add(to); }
    }
    for (const [e, site] of sites.size ? SiteOutsides.sited(campaign.module.entities, byId) : []) {
      if (!sites.has(site) || !w.test(ModuleWriter.call('been', party, e.id))) { continue; }
      const keeper = Guarded.beyond(campaign, e.id);
      if (keeper) { return { said: `Your aim waits: ${Guarded.said(e.name, keeper)}`, room: e.id }; }
    }
    return this.room(campaign, rooms, names);
  }
  // Or a room in no site that the aim goes to, where a keeper met bars it (OR-481: the weir route, the conger in the
  // gate-well under Gatesend's gatehouse beyond Ilse at 4 hp, and the sea-gate's aim had led back to the gatehouse from
  // the weir, the gate-yard and the sea-bank, round four times). Never a keeper the aim is itself about, whose fight is
  // the aim's own (the old buck rat of the nest the rats' job sends the company to clear: Outmatched, Threshold).
  private static room(campaign: Campaign, rooms: Set<string>, names: Set<string>):
    { said: string; room: string } | undefined {
    const byId = EntityIndex.of(campaign.module.entities).byId;
    for (const room of rooms) {
      const keeper = Guarded.keeper(campaign, room);
      if (keeper && !names.has(keeper)) {
        return { said: `Your aim waits: ${Guarded.said(byId.get(room)?.name ?? room, Guarded.named(campaign, keeper))}`,
          room };
      }
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
    // Where the company knows them to be (Outmatched.helper: OR-881).
    const help = this.of(campaign, screen, false) && Outmatched.helper(campaign);
    return help ? { help } : {};
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
