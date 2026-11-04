import type { Campaign } from '../campaign/campaign';
import { EntityIndex } from '../lang/entity-index';
import type { Entity } from '../lang/module';
import { WorldAudit, type PlacedSite } from './world-audit';

// The links an expedition makes, for every site a placement sets apart (the cold review's REV-01: scenarios, works and
// kits each left out different ones), read off the world rather than trusted to what placed it:
//   lead       a fact leads to it (leadsTo);
//   aim        knowing that fact makes an aim;
//   place      its approach can be walked to from where the company starts;
//   threshold  a way from the approach into a room of it;
//   inside     more than one room within it or beyond its approach;
//   answers    someone or something in it to deal with: a person or creature, or a thing that can be changed;
//   yield      something to carry out of it: an item lying in it, or in something in it;
//   aftermath  what is done there is told outside it: an observation elsewhere, or a word of someone elsewhere, that
//              asks of something in it;
//   successor  something learnt in it leads somewhere else.
export type Link = 'lead' | 'aim' | 'place' | 'threshold' | 'inside' | 'answers' | 'yield' | 'aftermath' | 'successor';
export interface Contract { subject: string; place: string; links: Record<Link, boolean>;
  declines?: Record<string, string> }
export class ExpeditionContract {
  static readonly links: Link[] = ['lead', 'aim', 'place', 'threshold', 'inside', 'answers', 'yield', 'aftermath',
    'successor'];
  static readonly declinable: Link[] = ['inside', 'answers', 'yield', 'aftermath', 'successor'];
  static of(campaign: Campaign, sites: PlacedSite[]): Contract[] {
    const ways = this.ways(campaign), reach = this.walk(campaign, ways);
    return sites.map(site => ({ subject: site.subject, place: site.place,
      links: this.read(campaign, site.place, { reach, beyond: this.beyond(campaign, ways, reach, site.place) }),
      ...site.declines ? { declines: site.declines } : {} }));
  }
  // What the contract asks and is not given, as "subject: link": a link neither made nor declined with a reason; a
  // decline of no link, or with no reason; and a decline of the four links without which there is no expedition at
  // all (word of it that makes an aim, and a way there and in), which no placement may decline. Empty, the contract
  // holds (REV-01).
  static undeclared(contracts: Contract[]): string[] {
    return contracts.flatMap(c => {
      const declines = c.declines ?? {};
      const wrong = Object.entries(declines).filter(([l, why]) => !this.declinable.includes(l as Link) || !why.trim())
        .map(([l]) => `${c.subject}: declines ${l}`);
      return [...this.links.filter(l => !c.links[l] && !(declines[l] && this.declinable.includes(l))).map(l => `${c.subject}: ${l}`), ...wrong];
    });
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
  private static read(campaign: Campaign, place: string, reach: { reach: Set<string>; beyond: Set<string> }):
    Record<Link, boolean> {
    const world = campaign.world, byId = EntityIndex.of(campaign.module.entities).byId;
    const inside = new Set([...campaign.module.entities.filter(e => this.within(byId, e, place)).map(e => e.id),
      ...reach.beyond]);
    const rooms = [...inside].filter(id => id !== place && byId.get(id)?.type === 'place');
    const here = campaign.module.entities.filter(e => e.type !== 'place' && this.in(campaign, inside, e.id))
      .map(e => e.id);
    const leads = world.related('leadsTo').filter(r => r.args[1] === place).map(r => r.args[0]!);
    const learnt = new Set((campaign.module.observations ?? []).filter(o => inside.has(o.place) && o.teaches)
      .map(o => o.teaches!));
    return {
      lead: leads.length > 0,
      aim: leads.some(f => WorldAudit.aimed(campaign, f)),
      place: reach.reach.has(place),
      threshold: world.related('connects').some(r => r.args[1] === place && rooms.includes(r.args[2]!)),
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
  // The ways between places, from each place: where a connection goes from it.
  private static ways(campaign: Campaign): Map<string, string[]> {
    const ways = new Map<string, string[]>();
    for (const r of campaign.world.related('connects')) {
      for (const [from, to] of [[r.args[1]!, r.args[2]!], [r.args[2]!, r.args[1]!]]) {
        ways.set(from!, [...ways.get(from!) ?? [], to!]);
      }
    }
    return ways;
  }
  // Every place the company can walk to from where it starts, not going through `avoid`.
  private static walk(campaign: Campaign, ways: Map<string, string[]>, avoid?: string): Set<string> {
    const start = campaign.world.one('at', campaign.playerActor ?? 'party'), seen = new Set<string>(start ? [start] : []);
    for (const queue = [...seen]; queue.length;) {
      for (const there of ways.get(queue.shift()!) ?? []) {
        if (there !== avoid && !seen.has(there)) { seen.add(there); queue.push(there); }
      }
    }
    return seen;
  }
  // What lies beyond a site's approach: the places reached only through it. A placement names the approach, the
  // ground outside its door; the rooms a work's plan or a kit's modules write are beside it, not within it, and are
  // the site's because there is no other way to them.
  private static beyond(campaign: Campaign, ways: Map<string, string[]>, reach: Set<string>, place: string):
    Set<string> {
    const around = this.walk(campaign, ways, place);
    return new Set([...reach].filter(p => p !== place && !around.has(p)));
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
