import type { Campaign } from '../campaign/campaign';
import type { BundleSource } from '../campaign/bundle-source';
import { WorldAssembler, type Entry, type Placement } from './world-assembler';

// What other adventures are set in an authored city (the boundary stones moved in Hessel's Old Town): each installed
// once the city's country is, bound to the parts the city exports under the names a generated town's are
// (town_taproom, town_innkeeper…), its modules' ids the city's and their own, whichever way the company came. One
// city, its own people taking up the quarrel, never a copy of it (M19-77). Listed in data/scenarios/cities.json, and
// never drawn into a generated country (a city need is no settlement of one; see ScenarioTowns).
export class CityResidents {
  static readonly index = 'data/scenarios/cities.json';
  // The city's parts, exported by its country under this prefix: town, town_taproom, town_priest…
  static readonly prefix = 'town';
  private static readonly read = new WeakMap<BundleSource, Promise<Entry[]>>();
  static async install(campaign: Campaign, base: BundleSource, country: string, install: string) {
    for (const entry of await this.library(base)) {
      const placement = this.placement(entry, country, install);
      if (!placement) { continue; }
      for (const request of WorldAssembler.requests(entry, placement, base, { context: {} })) {
        if (!campaign.installed.includes(request.id)) { await campaign.install(request, base, false, true); }
      }
    }
  }
  // Where a scenario that names the city is placed: its roles that need the city bound to the city's parts, in the
  // city's country's install.
  static placement(entry: Entry, country: string, install: string): Placement | undefined {
    const s = entry.manifest, roles = Object.entries(s.places)
      .filter(([, p]) => p.settlement === `city:${country}`).map(([role]) => role);
    if (!roles.length) { return undefined; }
    const bindings = Object.fromEntries(roles.map(role => [role, this.prefix]));
    return { scenario: s.id, instance: `${install}${this.bare(s.id)}`, bindings, generated: [], carriers: {},
      rid: install, modules: s.modules.filter(m => !m.when || bindings[m.when]).map(m => `${install}${this.bare(m.id)}`) };
  }
  private static bare(id: string): string { return id.replace(/[^A-Za-z0-9]/g, ''); }
  static library(base: BundleSource): Promise<Entry[]> {
    let held = this.read.get(base);
    if (!held) { held = WorldAssembler.library(base, this.index); this.read.set(base, held); }
    return held;
  }
}
