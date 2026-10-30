import type { Campaign } from '../campaign/campaign';
import type { Call, Change, Predicate } from '../lang/module';
import { EngineWrites } from '../campaign/engine-writes';
import { EntityIndex } from '../lang/entity-index';
import { ModuleWriter } from '../lang/module-writer';
import type { Placement } from './world-assembler';

export interface AuditFinding { kind: 'route' | 'resource' | 'clue' | 'outcome'; subject: string; text: string }
// A site a placement sets apart (a kit's hold, a makers' work), and the settlements it is bound to, whose people
// should tell of it (see PlacedSites).
export interface PlacedSite { subject: string; place: string; towns: string[] }

// Whether a world's adventures can be found and finished, read off the world itself rather than trusted to its
// generator: every place a story is set in can be walked to (by any way, shut or not: a way can be opened); every
// thing someone wants exists somewhere the company can get it (for sale, growing, lying about) and not only in their
// own hands; every story has someone who tells of it, somewhere the company can reach; every site set apart for one
// is told of where it belongs, and knowing of it is an aim; and every story's ending names only what something in the
// world can bring about. What the willow fix did for one fever, for every story.
export class WorldAudit {
  // Written by the engine rather than by rules: what a story may wait on without any rule asserting it.
  static readonly engine = EngineWrites.names;
  static audit(campaign: Campaign, placements: Placement[] = [], sites: PlacedSite[] = []): AuditFinding[] {
    const reach = this.reachable(campaign);
    return [...this.routes(campaign, placements, reach), ...this.resources(campaign, reach),
      ...this.clues(campaign, placements, reach), ...this.leads(campaign, sites, reach),
      ...this.outcomes(campaign)];
  }
  // Every place reachable from where the company stands, by every passage there is.
  static reachable(campaign: Campaign): Set<string> {
    const world = campaign.world, start = world.one('at', campaign.playerActor ?? 'party');
    const links = world.related('connects'), seen = new Set<string>(start ? [start] : []);
    for (const queue = [...seen]; queue.length;) {
      const here = queue.shift()!;
      for (const l of links.filter(r => r.args[1] === here || r.args[2] === here)) {
        const there = l.args[1] === here ? l.args[2]! : l.args[1]!;
        if (!seen.has(there)) { seen.add(there); queue.push(there); }
      }
    }
    return seen;
  }
  // Where something is to be had: where it lies; where the box it is in lies; where whoever has it is.
  private static where(campaign: Campaign, id: string): string | undefined {
    const world = campaign.world, at = world.one('at', id);
    if (at) { return at; }
    const box = world.related('inside').find(r => r.args[0] === id)?.args[1];
    const holder = world.related('owns').find(r => r.args[1] === id)?.args[0]
      ?? world.related('ownedItem').find(r => r.args[0] === id)?.args[1];
    return box ? this.where(campaign, box) : holder ? this.where(campaign, holder) : undefined;
  }
  // A place is reached when it, or any room within it (a settlement's green, a site's chambers), is.
  private static reached(campaign: Campaign, place: string, reach: Set<string>): boolean {
    return reach.has(place)
      || campaign.module.entities.some(e => e.space?.parent === place && this.reached(campaign, e.id, reach));
  }
  private static region(id: string): string { return id.includes('__') ? id : `region__${id}`; }
  private static routes(campaign: Campaign, placements: Placement[], reach: Set<string>): AuditFinding[] {
    return placements.flatMap(p => Object.entries(p.bindings).flatMap(([role, id]) => {
      const place = this.region(id), known = campaign.module.entities.some(e => e.id === place);
      return known && campaign.module.entities.find(e => e.id === place)?.type !== 'passage'
        && !this.reached(campaign, place, reach) && !campaign.world.related('connects').some(r => r.args[0] === place)
        ? [{ kind: 'route' as const, subject: `${p.scenario}.${role}`, text: `${place} cannot be walked to from the start` }] : [];
    }));
  }
  // What someone wants (one of the things, when they want several: a magpie takes any): some item of a kind they want
  // for sale, growing, or lying where the company can reach it.
  private static resources(campaign: Campaign, reach: Set<string>): AuditFinding[] {
    const world = campaign.world, wanting = new Map<string, string[]>();
    for (const w of world.related('wants')) { wanting.set(w.args[0]!, [...wanting.get(w.args[0]!) ?? [], w.args[1]!]); }
    return [...wanting].filter(([who, kinds]) => !kinds.some(kind => this.obtainable(campaign, { who, kind }, reach)))
      .map(([who, kinds]) => ({ kind: 'resource' as const, subject: who,
        text: `wants ${kinds.join(' or ')}, and nothing the company can reach sells, grows or holds any` }));
  }
  private static obtainable(campaign: Campaign, want: { who: string; kind: string }, reach: Set<string>): boolean {
    const world = campaign.world;
    return world.related('itemKind').filter(r => r.args[1] === want.kind).some(r => {
      const item = r.args[0]!;
      if (world.related('owns').some(o => o.args[0] === want.who && o.args[1] === item)) { return false; }
      const seller = world.related('soldBy').find(x => x.args[0] === item)?.args[1];
      const crop = world.related('crop').find(c => c.args[0] === item)?.args[1];
      const at = seller ? this.where(campaign, seller) : crop ? this.where(campaign, crop) : this.where(campaign, item);
      return !!at && reach.has(at);
    });
  }
  // Each story's word: someone who carries it, standing where the company can reach them.
  private static clues(campaign: Campaign, placements: Placement[], reach: Set<string>): AuditFinding[] {
    return placements.flatMap(p => Object.entries(p.carriers).flatMap(([fact, carriers]) => {
      const reached = carriers.filter(c => reach.has(this.where(campaign, this.region(c)) ?? ''));
      return reached.length ? [] : [{ kind: 'clue' as const, subject: `${p.scenario}.${fact}`,
        text: carriers.length ? 'no one who tells of it can be reached' : 'no one tells of it' }];
    }));
  }
  // Each placed site: a fact that leads to it, told in a settlement it is bound to by someone (or something) the
  // company can reach, and an aim that knowing it makes. The hobs' hold had none of the three, and twelve works of
  // thirteen had no aim (the expedition diagnosis, 30 October).
  private static leads(campaign: Campaign, sites: PlacedSite[], reach: Set<string>): AuditFinding[] {
    const leads = this.rows(campaign, 'leadsTo');
    return sites.flatMap(site => {
      const towns = new Set(site.towns.map(t => this.settlement(campaign, t)).filter(t => t !== undefined));
      const facts = leads.filter(r => r.args[1] === site.place).map(r => r.args[0]!);
      const told = facts.filter(f => this.told(campaign, f)
        .some(at => reach.has(at) && towns.has(this.settlement(campaign, at) ?? '')));
      const text = !facts.length ? 'nothing leads to it'
        : !told.length ? 'nobody in a settlement it is bound to tells of it'
          : !told.some(f => this.aimed(campaign, f)) ? 'knowing of it makes no aim' : undefined;
      return text ? [{ kind: 'clue' as const, subject: site.subject, text }] : [];
    });
  }
  // Where a fact is told: where they stand who tell it when asked (as testimony, or as a topic of their own), and
  // where it is seen.
  private static told(campaign: Campaign, fact: string): string[] {
    const world = campaign.world, rows = this.rows.bind(this, campaign);
    const sources = new Set(rows('reveals').filter(r => r.args[1] === fact).map(r => r.args[0]!));
    const witnesses = rows('testimony').filter(r => sources.has(r.args[1]!)).map(r => r.args[0]!)
      .filter(who => world.test(ModuleWriter.call('knows', who, fact)));
    const speakers = campaign.schemaList.filter(a => a.speaker && a.success
      .some(c => c.kind === 'assert' && c.call.name === 'knows' && c.call.args[1] === fact)).map(a => a.speaker!);
    const seen = (campaign.module.observations ?? []).filter(o => o.teaches === fact).map(o => o.place);
    return [...witnesses, ...speakers, ...seen].map(x => this.where(campaign, x) ?? x);
  }
  private static rows(campaign: Campaign, name: string) {
    return campaign.world.relates(name) ? campaign.world.related(name) : [];
  }
  // Whether some aim holds when the fact is known: its condition asks that it be known, not that it not be.
  private static aimed(campaign: Campaign, fact: string): boolean {
    return (campaign.module.objectives ?? [])
      .some(o => this.calls(o.when).some(c => c.name === 'knows' && c.args[1] === fact));
  }
  // The settlement a place is in (or is).
  private static settlement(campaign: Campaign, id: string): string | undefined {
    const byId = EntityIndex.of(campaign.module.entities).byId;
    for (let e = byId.get(id); e; e = e.space?.parent ? byId.get(e.space.parent) : undefined) {
      if (e.space?.kind === 'settlement') { return e.id; }
    }
    return undefined;
  }
  // Each ending names only what an action, a rule, an event, the world at its start or the engine can bring about.
  private static outcomes(campaign: Campaign): AuditFinding[] {
    const module = campaign.module;
    const changes: Change[] = [...module.initial, ...(module.rules ?? []).flatMap(r => r.effects),
      ...campaign.schemaList.flatMap(a => [...a.success, ...a.failure])];
    const made = new Set([...changes.filter(c => c.kind !== 'retract').map(c => c.call.name), ...this.engine,
      ...module.queries.map(q => q.name)]);
    return campaign.installations.flatMap(m => [...m.outcomes.map(o => [o.id, o.predicate] as const), [`${m.id}.goal`, m.goal] as const]
      .flatMap(([id, p]) => this.wanted(p).filter(name => !made.has(name))
        .map(name => ({ kind: 'outcome' as const, subject: id, text: `waits on ${name}, which nothing in the world asserts` }))));
  }
  // The relations a predicate needs to hold, positively.
  private static wanted(p: Predicate): string[] { return this.calls(p).map(c => c.name); }
  // The calls a predicate needs to hold, positively.
  private static calls(p: Predicate, positive = true): Call[] {
    switch (p.kind) {
      case 'call': return positive ? [p] : [];
      case 'not': return this.calls(p.value, !positive);
      case 'and': case 'or': return [...this.calls(p.left, positive), ...this.calls(p.right, positive)];
      default: return [];
    }
  }
}
