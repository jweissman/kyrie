import { describe, expect, it } from 'bun:test';
import type { Campaign } from '../src/campaign/campaign';
import { Environment } from '../src/campaign/environment';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { ModuleWriter } from '../src/lang/module-writer';
import { PlaySession } from '../src/session/play-session';
import { Spatial } from '../src/spatial';
import { ScreenModel } from '../src/ui/screen-model';
import { Frontier } from '../src/world/frontier';
import { WorldAssembler } from '../src/world/world-assembler';
import { C, Calamy } from './support/calamy';
import { GeneratedWorld } from './support/generated';

// Imbar is one plane, the canon's (doc/architecture/mission-18/one-universe.md): every generated country is a region
// of it, and so is every authored country that names it in its "canon". The road over a march into one of those is a
// road across country, as the road between two towns of one country is, and not a planar threshold. The realms beyond
// Parliament's Hexagon of Doors are its own regions of the outer planes they name, under those planes' laws.
class Imbar {
  // Every place a place lies within, nearest first.
  static line(c: Campaign, id: string): string[] {
    return Spatial.ancestry(new Map(c.module.entities.map(e => [e.id, e])), id).map(e => e.id);
  }
  // The company put somewhere, as a test puts it.
  static put(c: Campaign, place: string) {
    const at = c as unknown as { world: { apply(c: unknown[]): unknown }; commit(w: unknown): void };
    at.commit(at.world.apply([{ kind: 'retract', call: ModuleWriter.call('at', 'party', c.world.one('at', 'party')!) },
      { kind: 'assert', call: ModuleWriter.call('at', 'party', place) }]));
  }
}

describe('Imbar, one plane', () => {
  it('holds a cold country and Pellam within it, and the road between goes across country', async () => {
    const w = await WorldAssembler.assemble('rime', NodeBundleSource.shared, { region: { terrain: 'frost' } });
    expect(w.report.region.provinces!.map(p => p.name)).toContain('Pellam on the Lisk');
    const s = await PlaySession.start(w.path, 'rime', w.source), c = s.campaign;
    GeneratedWorld.put(s, 'gate_pellam');
    await new Frontier('rime', NodeBundleSource.shared).expand(c);
    const rid = 'ppellam';
    // One plane called Imbar, the canon's; Pellam a province of the country (Gate B), and both within it.
    expect(c.module.entities.filter(e => e.space?.kind === 'plane' && e.name === 'Imbar').map(e => e.id))
      .toEqual(['imbar']);
    expect(Imbar.line(c, 'region__gate_pellam').slice(-2)).toEqual(['region__region', 'imbar']);
    expect(Imbar.line(c, `${rid}__north_road`).slice(-2)).toEqual(['region__region', 'imbar']);
    // At its way in, the road on goes across country, and no way from it is a planar threshold.
    const exits = ScreenModel.build(c).exits, road = exits.find(e => e.destination.id === `${rid}__north_road`)!;
    expect(road.transition).toBe('travel');
    expect(exits.length).toBeGreaterThan(1);
    expect(exits.filter(e => e.transition === 'cross_plane').map(e => e.destination.id)).toEqual([]);
  }, 180000);
});

describe('the realms beyond the Hexagon of Doors', () => {
  it('are Parliament\'s own regions of Cthell and of the Mount of the Exalted, under their planes\' laws', async () => {
    const j = await Calamy.start(), c = j.campaign;
    expect(Imbar.line(c, C('cthelll_gate')).slice(1)).toEqual([C('cthelll'), C('furnace_city'), 'outer_cthell']);
    expect(Imbar.line(c, C('celestia_terrace')).slice(1)).toEqual([C('mount'), C('terraces'), 'outer_exalted']);
    // Beside the canon's own region of each plane, not a second plane of the same name.
    expect(c.module.entities.filter(e => e.space?.parent === 'outer_cthell').map(e => e.id).sort())
      .toEqual([C('furnace_city'), 'outer_cthell_region'].sort());
    expect(c.module.entities.filter(e => e.space?.kind === 'plane' && /cthell/i.test(e.name))).toHaveLength(1);
    // A fight at the Gate of Cthelll is fought under Cthell's law; on the Mount, which has none, under none.
    Imbar.put(c, C('cthelll_gate'));
    expect(Environment.laws(c.world, 'party')).toEqual(['plane_cthelll']);
    Imbar.put(c, C('celestia_terrace'));
    expect(Environment.laws(c.world, 'party')).toEqual([]);
  }, 120000);
});
