import { describe, expect, it } from 'bun:test';
import { WorldAssembler } from '../src/world/world-assembler';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { PlaySession } from '../src/session/play-session';
import { Frontier } from '../src/world/frontier';
import { Countries } from '../src/world/countries';
import { ScreenModel } from '../src/ui/screen-model';
import { GeneratedWorld } from './support/generated';
import { ModuleWriter } from '../src/lang/module-writer';

// The first of the adventures composed into one country (Mission 18's Gate B): the Strewnfield, where a room of glass
// fell into a barley field by Cobble Ring, is a province of the world's first country, not a country beyond a march.
// Its way in stands on the country's own land, on open ground a little in from the south, with a road to it from the
// nearest town; the first time the company stands there, The House That Grows is installed within the country; its
// places lie in that country, are drawn on its land at the way in, and the road on into the field is offered.
describe('a province of the first country', () => {
  it('stands the Strewnfield\'s way in on the country\'s land, and installs it within the country there', async () => {
    const seed = 'kite', w = await WorldAssembler.assemble(seed, NodeBundleSource.shared);
    const province = w.report.region.provinces?.find(p => p.country === 'strewnfield');
    expect(province).toMatchObject({ name: 'the Strewnfield', region: 'pstrewnfield__strewnfield' });
    expect(province!.gate.road.cells.length).toBeGreaterThan(1);
    expect(Countries.marches.some(c => c.id === 'strewnfield')).toBe(false);
    const s = await PlaySession.start(w.path, seed, w.source);
    GeneratedWorld.put(s, 'gate_strewnfield');
    await new Frontier(seed, NodeBundleSource.shared).expand(s.campaign);
    const c = s.campaign, region = c.module.entities.find(e => e.id === 'pstrewnfield__strewnfield');
    expect([c.installed.includes('pstrewnfield'), region?.space?.parent]).toEqual([true, 'region__region']);
    expect(c.module.charts?.region__region?.places.pstrewnfield__strewnfield).toBe(province!.gate.cell);
    expect(ScreenModel.build(c).exits.map(e => e.destination.id)).toContain('pstrewnfield__rim');
    // Gone in, the company is in the same country: the map is the country's, with the field where its way in is.
    const moved = c as unknown as { world: { apply(c: unknown[]): unknown }; commit(w: unknown): void };
    moved.commit(moved.world.apply([{ kind: 'assert', call: ModuleWriter.call('at', 'party', 'pstrewnfield__rim') }]));
    const land = ScreenModel.build(c).region?.land;
    expect([land?.width, land?.here]).toEqual([c.module.charts!.region__region!.width, province!.gate.cell]);
  }, 120000);
});
