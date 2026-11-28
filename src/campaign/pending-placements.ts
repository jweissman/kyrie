import type { BundleSource } from './bundle-source';
import type { Campaign } from './campaign';
import type { BundleRequest } from './module-bundle';
import { ModuleBundle } from './module-bundle';
import { OverlayBundleSource } from './overlay-bundle-source';
import { Crossing } from './crossing';
import { CampaignTick } from './campaign-tick';

// What a world's manifest offers to hold back (written by the world assembler for a placement whose scenario says it
// may wait: see unfit): the placement's modules and the word of it, in the world's order, and the files the world
// generated for them.
export interface LazyUnit { id: string; modules: string[]; files?: string[] }
// A placement the world holds back until the company nears it: its requests as the world drew them apart (StoryCasts:
// so its people are named as they would have been), the places of the world it binds (its sites, its towns' rooms,
// the carriers of its word) by entity id, and the generated files it is read from, kept with the game so that a game
// opened again can take it up.
export interface PendingPlacement {
  id: string; requests: BundleRequest[]; places: string[]; files?: Record<string, string>;
}

// The world's placements held back until first neared (lazy-provinces.md; SP-02): an s0 life began with fifteen stories
// four to seventeen hexes off installed whole, two seconds of its start and a third of the heap it kept, none of which
// it could reach. A placement is held back, as the world is assembled, when all it binds lies `apart` hexes or more
// from where the company begins and nothing installed imports it; it is taken up after the command that first brings
// the company `near` it (Frontier.expand), or as soon as something installed asks for it (a country beyond reading
// it, a herald), and parsed ahead while the company is `ahead` of it. Taken up, it is installed as at the world's
// start (its clock counted from the world's first morning, as the eager world counted it) and caught up, its rules run
// through the watches it waited (CampaignTick.caughtUp); the watch it was taken up at is recorded (the state's
// `neared`), so that a replay takes it up at the same step, and a game kept holds what it still holds back (the
// state's `held`). Whether a world holds back at all is its life's choice (Assembly.lazy, kept in its transcript as
// Drawn.lazy), never the environment's at replay.
export class PendingPlacements {
  static readonly apart = 2;
  static readonly near = 1;
  static readonly ahead = 2;
  // The units of the manifest held back from a world being assembled, its first module (the country) installed.
  static async hold(campaign: Campaign, units: readonly LazyUnit[], modules: readonly BundleRequest[],
    at: { source: BundleSource; path: string }): Promise<PendingPlacement[]> {
    const start = campaign.world.one('at', 'party') ?? '';
    const byId = new Map(modules.map(r => [r.id, r]));
    let held = units.flatMap(u => {
      const requests = u.modules.flatMap(id => byId.get(id) ?? []);
      if (requests.length !== u.modules.length) { return []; }
      const places = this.places(campaign, requests);
      const far = Crossing.hexes(campaign.module, start, places);
      return far !== undefined && far >= this.apart ? [{ unit: u, requests, places }] : [];
    });
    // Nothing installed may import what is held back (an origin's kin, the drover's oxen at the den).
    for (;;) {
      const ids = new Set(held.flatMap(h => h.unit.modules));
      const imported = new Set(modules.filter(r => !ids.has(r.id))
        .flatMap(r => Object.values(r.imports ?? {}).map(v => v.split('.')[0]!)));
      const kept = held.filter(h => !h.unit.modules.some(id => imported.has(id)));
      if (kept.length === held.length) { break; }
      held = kept;
    }
    return Promise.all(held.map(async ({ unit, requests, places }) => ({ id: unit.id, requests, places,
      ...unit.files?.length ? { files: Object.fromEntries(await Promise.all(unit.files.map(async f => {
        const path = at.source.resolve(f, at.path);
        return [path, await at.source.read(path)] as const;
      }))) } : {} })));
  }
  // After each command: those the company now stands near, taken up.
  static async nearing(campaign: Campaign, source: BundleSource): Promise<string[]> {
    const due = this.within(campaign, this.near);
    for (const p of due) { await this.take(campaign, p, source); }
    return due.map(p => p.id);
  }
  // Those within reach parsed ahead, while the player reads (see Frontier.prepare): taking one up then pays its join.
  static async prepare(campaign: Campaign, source: BundleSource): Promise<void> {
    for (const p of this.within(campaign, this.ahead)) {
      const from = this.source(p, source);
      for (const r of p.requests) { await ModuleBundle.prepare(campaign.vocabulary, r.bundle, from); }
    }
  }
  // What a world holds back, and what it has taken up and when.
  static held(campaign: Campaign): readonly PendingPlacement[] { return campaign.tickState.current.held ?? []; }
  static neared(campaign: Campaign): readonly { id: string; at: number }[] {
    return campaign.tickState.current.neared ?? [];
  }
  // As a world is assembled, what it holds back (CampaignAssembly).
  static keep(campaign: Campaign, held: PendingPlacement[]) {
    if (held.length) { campaign.tickState.current.held = held; }
  }
  // Before a module is installed: anything held back that it imports, or that holds one of these modules.
  static async needed(campaign: Campaign, ids: readonly string[], source: BundleSource): Promise<void> {
    const want = new Set(ids);
    for (const p of this.held(campaign).filter(x => x.requests.some(r => want.has(r.id)))) {
      await this.take(campaign, p, source);
    }
  }
  static async before(campaign: Campaign, request: BundleRequest, source: BundleSource): Promise<void> {
    if (!this.held(campaign).length) { return; }
    await this.needed(campaign, Object.values(request.imports ?? {}).map(v => v.split('.')[0]!), source);
  }
  // Its modules installed in the world's order, as at the world's start, and the watch it was taken up at recorded.
  private static async take(campaign: Campaign, p: PendingPlacement, source: BundleSource): Promise<void> {
    const current = campaign.tickState.current;
    if (!current.held?.some(x => x.id === p.id)) { return; }
    current.held = current.held.filter(x => x.id !== p.id);
    current.neared = [...current.neared ?? [], { id: p.id, at: current.elapsed }];
    const from = this.source(p, source);
    for (const [i, r] of p.requests.entries()) {
      await this.before(campaign, r, source);
      await campaign.install({ ...r, begun: 0 }, from, false, i === p.requests.length - 1);
    }
    this.caughtUp(campaign, p.requests.map(r => r.id));
  }
  // Its own rules run through the watches it waited (see CampaignTick.caughtUp), and the shared rules with them.
  private static caughtUp(campaign: Campaign, modules: readonly string[]) {
    const own = modules.map(id => `${id}__`), rules = campaign.module.rules ?? [];
    const mine = rules.filter(r => own.some(p => r.id.startsWith(p))), theirs = new Set(mine);
    const shared = rules.filter(r => !r.id.includes('__') || theirs.has(r));
    campaign.within(() => CampaignTick.caughtUp(campaign, mine, campaign.readout, shared));
  }
  // Why modules, installed, could not wait unneared (none, if they can): someone of theirs acts on goals of their own
  // (the brood's Garth, the circus on its circuit), which taking up cannot catch up; a pressure falls due by the
  // clock; or a rule of theirs says what it says wherever the company is (the arcology's winches, heard from the first
  // inn), which a world holding them back would not say. Read of a world they are installed in (test/lazy-placements-s0
  // holds every scenario marked lazy to it).
  static unfit(campaign: Campaign, modules: readonly string[]): string[] {
    const own = modules.map(id => `${id}__`), rules = campaign.module.rules ?? [];
    const installed = campaign.installations.filter(m => modules.includes(m.id));
    const acting = new Set(installed.flatMap(m => m.actors));
    return [...campaign.actors.filter(a => acting.has(a.id) && a.goals.length).map(a => `${a.id} acts`),
      ...installed.flatMap(m => m.pressures.map(p => `${p} falls due`)),
      ...rules.filter(r => own.some(p => r.id.startsWith(p)) && r.say && !r.place)
        .filter(r => !CampaignTick.waitsOnCompany(campaign.module, r)).map(r => `${r.id} is heard anywhere`)];
  }
  private static source(p: PendingPlacement, source: BundleSource): BundleSource {
    return p.files ? new OverlayBundleSource(source, p.files) : source;
  }
  // Those held back whose places lie within so many hexes of where the company stands, in the world's order.
  private static within(campaign: Campaign, hexes: number): PendingPlacement[] {
    const held = this.held(campaign), here = campaign.world.one('at', 'party') ?? '';
    return held.filter(p => (Crossing.hexes(campaign.module, here, p.places) ?? Infinity) <= hexes);
  }
  // The places of the world a placement's requests import, by entity id: what each import of an installed module
  // names (the country's rooms and sites), not one of its own.
  private static places(campaign: Campaign, requests: readonly BundleRequest[]): string[] {
    const own = new Set(requests.map(r => r.id)), installed = new Map(campaign.installations.map(m => [m.id, m]));
    return [...new Set(requests.flatMap(r => Object.values(r.imports ?? {}).flatMap(v => {
      const [module, name] = v.split('.') as [string, string];
      const id = own.has(module) ? undefined : installed.get(module)?.exports[name];
      return id ? [id] : [];
    })))];
  }
}
