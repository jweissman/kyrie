import { describe, expect, it } from 'bun:test';
import { PlayTool } from '../../../src/cli/play-tool';
import { Runner, type Said } from '../../../src/cli/runner';
import { ModuleWriter } from '../../../src/lang/module-writer';
import { StockOpenings } from '../../../src/world/stock-openings';
import { AsMeant } from '../../support/as-meant';
import { GeneratedWorld } from '../../support/generated';

// OR-311, at the dungeon (the owner, 24 November: "ideally a companion at the dungeon, and searchable gear near the
// secure entry"): on the stair below the vault under the first town, the secure way into the deep site under it,
// someone waits who would come down for a fee, and a search of the ledge finds what an earlier party left there, a
// lantern and food (data/generation/town/below.kyrt). Played by the rows the runner offers.
type Row = { id: string; label: string; opens?: Row[] };
const flat = (rs: Row[]): Row[] => rs.flatMap(r => [r, ...flat(r.opens ?? [])]);
const rows = (s: Said): Row[] => flat([...s.offer?.primary ?? [], ...s.offer?.rest ?? [],
  ...Object.values(s.offer?.lenses ?? {}).flat()] as Row[]);
describe('the ledge below the vault (OR-311)', () => {
  it('has someone to take on, and a lantern and food to be found by searching', async () => {
    const { journey } = await PlayTool.start(PlayTool.parse(['--world', 'iscoed', '--as', 'human/warrior/Wenna',
      '--opening', StockOpenings.none]));
    const s = journey.session, r = new Runner(s);
    GeneratedWorld.put(s, 's1_ud');
    let said = r.said('look');
    const ask = rows(said).find(x => /would come down with you/.test(x.label));
    expect(ask?.label).toBeDefined();
    said = await AsMeant.ask(r, JSON.stringify({ act: ask!.id })) as Said;
    expect(s.campaign.world.test(ModuleWriter.call('willing', 'region__s1_ud_waiting', 'party'))).toBe(true);
    // The stair is dark: a torch lit first, as the page leads.
    const light = rows(said).find(x => /light a torch/i.test(x.label));
    expect(light?.label).toBeDefined();
    said = await AsMeant.ask(r, JSON.stringify({ act: light!.id })) as Said;
    const search = rows(said).find(x => /^Search here/.test(x.label));
    expect(search?.label).toBeDefined();
    said = await AsMeant.ask(r, JSON.stringify({ act: search!.id })) as Said;
    const found = rows(r.said('look')).map(x => x.label).join(' | ');
    expect(found).toMatch(/lantern/);
    expect(found).toMatch(/bread and cheese/);
  }, 120000);
});
