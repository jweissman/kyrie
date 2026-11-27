import { EntityIndex, ModuleWriter, ObservationText, type World } from '../lang/index';

// A relation of a module, by its name.
interface Named { name: string }

// What the company knows of the country, for its map and its journeys (OR-741, the knowledge door's first slice: ways
// and destinations; platform-separation.md, the fifth review's step 6): a part of the one door (see Knowing), read of
// the world here and nowhere else in the player layer. Kept beside the map and the journeys that ask it (src/ui), so
// that no import crosses the folders' cycle. The map draws the character's knowledge, never the world's truth (the
// owner's playtest, 25 November: "things were unfolding that were nowhere near where I was, and I hadn't explored
// yet"). It tells
// - the places it has been told of (a fact it knows leads there: leadsTo), and those of them it has seen from afar
//   (the fact witnessed: from high ground, looking out over the country);
// - the ways it has been told the course of (a track's secret, revealedBy; directions landmark by landmark, leadsVia);
// - what it has looked out over (each country's surveyed, surveyedWell, surveyedDim);
// - whether it knows the lie of the land as from a map (wayfinding);
// - the places its aims name (an objective held, by the ids its words name).
// Where it has been is VisitedPlaces', and what stands where (the ways, the land) the world's own geography.
export class KnownCountry {
  private kept: { told?: string[]; sighted?: string[]; directions?: string[]; wayfinding?: boolean } = {};
  private constructor(private readonly world: World, readonly actor: string) {}
  private static readonly known = new WeakMap<World, Map<string, KnownCountry>>();
  // One reading for a state of the world (which is immutable: World.apply forks it) and a company, whoever asks.
  static of(world: World, actor: string): KnownCountry {
    const by = this.known.get(world) ?? new Map<string, KnownCountry>();
    this.known.set(world, by);
    const kept = by.get(actor) ?? new KnownCountry(world, actor);
    by.set(actor, kept);
    return kept;
  }
  // Whether the company knows a fact (or has heard of a thing).
  knows(fact: string): boolean {
    const w = this.world;
    return w.relates('knows') && w.test(ModuleWriter.call('knows', this.actor, fact));
  }
  // Whether it knows the lie of the land as from a map: every road and path of the country.
  get wayfinding(): boolean {
    return this.kept.wayfinding ??= this.world.test(ModuleWriter.call('capable', this.actor, 'wayfinding'));
  }
  // The places facts it knows lead to; and the towns their words name, which it has been told of so ("The reeve at
  // {town} pays thirty crowns", known at Gatesend, had left Porthalen off the map and its journeys: OR-972).
  get told(): readonly string[] {
    const w = this.world;
    return this.kept.told ??= [...w.relates('leadsTo') ? w.related('leadsTo').filter(r => this.knows(r.args[0]!))
      .map(r => r.args[1]!) : [], ...this.named()];
  }
  private named(): string[] {
    const w = this.world, byId = EntityIndex.of(w.module.entities).byId, towns = new Set<string>();
    if (!w.relates('knows')) { return []; }
    for (const r of w.related('knows', this.actor)) {
      const text = byId.get(r.args[1]!)?.type === 'fact' ? byId.get(r.args[1]!)!.name : undefined;
      for (const id of text?.includes('{') ? ObservationText.names(text) : []) {
        if (byId.get(id)?.space?.kind === 'settlement') { towns.add(id); }
      }
    }
    return [...towns];
  }
  // The places it has seen with its own eyes from afar: a fact leading there that it witnessed.
  get sighted(): readonly string[] {
    const w = this.world;
    return this.kept.sighted ??= w.relates('leadsTo') && w.relates('witnessed') ? w.related('leadsTo')
      .filter(r => w.test(ModuleWriter.call('witnessed', this.actor, r.args[0]!))).map(r => r.args[1]!) : [];
  }
  // The ways whose course it was told: a track hidden until its way is known, once someone has told it; and the ways a
  // fact tells, landmark by landmark.
  get directions(): readonly string[] {
    const w = this.world;
    return this.kept.directions ??= [
      ...w.relates('revealedBy') ? w.related('revealedBy').filter(r => this.knows(r.args[1]!))
        .map(r => r.args[0]!) : [],
      ...w.relates('leadsVia') ? w.related('leadsVia').filter(r => this.knows(r.args[0]!)).map(r => r.args[1]!) : []];
  }
  // Whether it was told a passage's way (revealedBy a fact it knows).
  toldOf(passage: string): boolean { return this.directions.includes(passage); }
  // The places it stands in a country's relation to (region__surveyed, x1y0__surveyedWell…), in every country: each its
  // own, named for its module (the owner, OWN-43).
  looked(end: 'surveyed' | 'surveyedWell' | 'surveyedDim'): string[] {
    const w = this.world;
    return KnownCountry.ending(w.module.relations, end)
      .flatMap(name => w.related(name, this.actor).map(x => x.args[1]!));
  }
  // The relations of a module named for this end, in its order: found once for its relations as they stand (every
  // relation of the world had been gone through three times for every chart drawn).
  private static readonly ends = new WeakMap<readonly Named[], { size: number; by: Map<string, string[]> }>();
  private static ending(relations: readonly Named[], end: string): readonly string[] {
    let had = this.ends.get(relations);
    if (had?.size !== relations.length) {
      had = { size: relations.length, by: new Map() };
      this.ends.set(relations, had);
    }
    let names = had.by.get(end);
    if (!names) { names = relations.filter(r => r.name.endsWith(`__${end}`)).map(r => r.name); had.by.set(end, names); }
    return names;
  }
  // The ids its aims' words name, of each aim held.
  aimed(): Set<string> {
    const w = this.world, named = new Set<string>();
    for (const o of (w.module.objectives ?? []).filter(x => w.test(x.when))) {
      ObservationText.map(o.text, call => { call.args.forEach(a => named.add(a)); return ''; },
        id => { named.add(id); return ''; });
    }
    return named;
  }
}
