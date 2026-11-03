import type { Campaign } from '../campaign/campaign';
import { EntityIndex } from '../lang/entity-index';
import type { Entity } from '../lang/module';
import { WorldAudit, type PlacedSite } from './world-audit';

// The links an expedition makes, for every site a placement sets apart (the cold review's REV-01: scenarios, works and
// kits each left out different ones), read off the world rather than trusted to what placed it:
//   lead       a fact leads to it (leadsTo);
//   aim        knowing that fact makes an aim;
//   place      it can be walked to from where the company starts;
//   threshold  a way into it from outside it;
//   inside     more than one room within it;
//   answers    someone or something in it to deal with: a person or creature, or a thing that can be changed;
//   yield      something to carry out of it: an item lying in it, or in something in it;
//   aftermath  what is done there is told outside it: an observation elsewhere, or a word of someone elsewhere, that
//              asks of something in it;
//   successor  something learnt in it leads somewhere else.
export type Link = 'lead' | 'aim' | 'place' | 'threshold' | 'inside' | 'answers' | 'yield' | 'aftermath' | 'successor';
export interface Contract { subject: string; place: string; links: Record<Link, boolean> }
export class ExpeditionContract {
  static readonly links: Link[] = ['lead', 'aim', 'place', 'threshold', 'inside', 'answers', 'yield', 'aftermath',
    'successor'];
  static of(campaign: Campaign, sites: PlacedSite[]): Contract[] {
    const reach = WorldAudit.reachable(campaign);
    return sites.map(site => ({ subject: site.subject, place: site.place,
      links: this.read(campaign, site.place, reach) }));
  }
  // What each contract leaves out, as "subject: link, link".
  static missing(contracts: Contract[]): string[] {
    return contracts.flatMap(c => {
      const out = this.links.filter(l => !c.links[l]);
      return out.length ? [`${c.subject}: ${out.join(', ')}`] : [];
    });
  }
  // How many of the contracts make each link.
  static tally(contracts: Contract[]): Record<Link, number> {
    const counts = this.links.map(l => [l, contracts.filter(c => c.links[l]).length]);
    return Object.fromEntries(counts) as Record<Link, number>;
  }
  private static read(campaign: Campaign, place: string, reach: Set<string>): Record<Link, boolean> {
    const world = campaign.world, byId = EntityIndex.of(campaign.module.entities).byId;
    const inside = new Set(campaign.module.entities.filter(e => this.within(byId, e, place)).map(e => e.id));
    const rooms = [...inside].filter(id => byId.get(id)?.type === 'place');
    const here = campaign.module.entities.filter(e => e.type !== 'place' && this.in(campaign, inside, e.id))
      .map(e => e.id);
    const leads = world.related('leadsTo').filter(r => r.args[1] === place).map(r => r.args[0]!);
    const learnt = new Set((campaign.module.observations ?? []).filter(o => inside.has(o.place) && o.teaches)
      .map(o => o.teaches!));
    return {
      lead: leads.length > 0,
      aim: leads.some(f => WorldAudit.aimed(campaign, f)),
      place: rooms.some(r => reach.has(r)),
      threshold: world.related('connects').some(r => inside.has(r.args[1]!) !== inside.has(r.args[2]!)),
      inside: rooms.length > 1,
      answers: here.some(id => byId.get(id)?.type === 'group'
        || world.related('changeOf').some(r => r.args[1] === id)),
      yield: world.relates('itemKind') && here.some(id => world.one('itemKind', id) !== undefined),
      aftermath: (campaign.module.observations ?? []).some(o => !inside.has(o.place) && this.names(o.when, here))
        || campaign.schemaList.some(a => a.speaker && !this.in(campaign, inside, a.speaker)
          && this.names(a.requires, here)),
      successor: world.related('leadsTo').some(r => learnt.has(r.args[0]!) && !inside.has(r.args[1]!)),
    };
  }
  // Whether something is in the site: at a place of it, or in something that is.
  private static in(campaign: Campaign, inside: Set<string>, id: string): boolean {
    const world = campaign.world;
    return inside.has(world.one('at', id) ?? '')
      || world.related('inside', id).some(r => inside.has(world.one('at', r.args[1]!) ?? ''));
  }
  // Whether a condition asks of any of these.
  private static names(condition: unknown, ids: string[]): boolean {
    const text = JSON.stringify(condition ?? null);
    return ids.some(id => text.includes(`"${id}"`));
  }
  private static within(byId: Map<string, Entity>, e: Entity, place: string): boolean {
    for (let p: Entity | undefined = e; p; p = p.space?.parent ? byId.get(p.space.parent) : undefined) {
      if (p.id === place) { return true; }
    }
    return false;
  }
}
