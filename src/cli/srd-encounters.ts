import { WorldAssembler } from '../world/world-assembler';
import { NodeBundleSource } from '../campaign/node-bundle-source';
import { PlaySession } from '../session/play-session';
import { Canon } from '../canon/canon';

// Where a player meets each kind (the fidelity census's weights): a1's hostile groups as real play writes them (an
// origin, one life), and the dens of six generated countries begun the same way. Slow (a world assembled for each):
// measured by scripts/srd-fidelity.ts --encounters and kept in data/sources/srd35/encounters.json.
export interface Encounter { group: string; kinds: string[] }
export interface Encounters { a1: Encounter[]; countries: string[]; dens: Record<string, number> }
export class SrdEncounters {
  static readonly countries = ['kite', 'thorn', 'wren', 'kahitude', 'mere', 'ember'];
  static async placed(seed: string): Promise<Encounter[]> {
    const party = [{ name: 'Wat', raceId: 'human', classId: 'warrior' }];
    const w = await WorldAssembler.assemble(seed, NodeBundleSource.shared, { origin: 'debt', party });
    const c = (await PlaySession.start(w.path, seed, w.source)).campaign, read = c.readout, world = c.world;
    return Object.entries(read.inhabitants).filter(([g, members]) => world.one('temperament', g) && members.length
      && !members.some(m => read.partyIds.includes(m)) && !world.holds(JSON.stringify(['peaceable', g])))
      .map(([group, members]) => ({ group: group.replace(/^region__/, ''), kinds: members.map(m =>
        read.creatures.find(x => x.id === m)!).map(x => Canon.isBody(x.raceId) ? x.raceId : `person:${x.raceId}`) }));
  }
  static async measure(): Promise<Encounters> {
    const a1 = await this.placed('a1'), dens: Record<string, number> = {};
    for (const seed of this.countries) {
      for (const e of await this.placed(seed)) { for (const k of new Set(e.kinds)) { dens[k] = (dens[k] ?? 0) + 1; } }
    }
    const often = Object.entries(dens).sort(([, a], [, b]) => b - a);
    return { a1, countries: this.countries, dens: Object.fromEntries(often) };
  }
}
