import { describe, expect, it } from 'bun:test';
import { WorldAssembler } from '../src/world/world-assembler';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { PlaySession } from '../src/session/play-session';
import { Frontier } from '../src/world/frontier';
import { GeneratedWorld } from './support/generated';
import countries from '../data/adventures/countries.json';

// Independently authored adventures are meant to be played in one world. Every province installed in one company's
// world must load together: no module may declare what another declares differently (the conger of Sennet's harbour
// and the conger of Tessary's stair had made the two impossible to visit in one game until this was asked).
// A long spec (KYRIE_LONG=1, CI's long descents): each province's install costs more the more are installed (1.4 s for
// the first, 10 to 14 s by the twentieth: mission-20/test-loop.md §3a), so all of them take minutes. The company is set
// at each gate rather than walked there: the walking proved nothing about the modules and doubled the time, and the
// whole had run into its own twenty-five minutes on CI, holding a suite shard to its limit in every run.
describe.skipIf(!process.env.KYRIE_LONG)('every province in one world', () => {
  it('installs together, one after another, as a company goes to each gate', async () => {
    const w = await WorldAssembler.assemble('thorn', NodeBundleSource.shared, { region: { terrain: 'mountain' } });
    const s = await PlaySession.start(w.path, 'thorn', w.source), frontier = new Frontier('thorn', NodeBundleSource.shared);
    // Each province this world has: a country that asks for land beside it this one lacks is not placed here (thorn,
    // in the mountains, has no hills or marsh to the west for Tallow, nor Sallowfield's), and every one is in kite's
    // (adventure-library's "holds every adventure as a province").
    const placed = new Set(w.report.region.provinces!.map(p => p.country));
    const ids = (countries.countries as { id: string; province?: boolean }[])
      .filter(c => c.province && placed.has(c.id)).map(c => c.id);
    expect(ids.length).toBeGreaterThanOrEqual(25);
    const failed: string[] = [];
    for (const id of ids) {
      try { GeneratedWorld.put(s, `gate_${id}`); await frontier.expand(s.campaign); }
      catch (e) { failed.push(`${id}: ${(e as Error).message.slice(0, 200)}`); }
    }
    expect(failed).toEqual([]);
    expect(s.campaign.installed.length).toBeGreaterThanOrEqual(ids.length);
  }, 1500000);
});
