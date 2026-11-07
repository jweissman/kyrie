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
describe('every province in one world', () => {
  it('installs together, one after another, as a company goes to each gate', async () => {
    const w = await WorldAssembler.assemble('thorn', NodeBundleSource.shared, { region: { terrain: 'mountain' } });
    const s = await PlaySession.start(w.path, 'thorn', w.source), frontier = new Frontier('thorn', NodeBundleSource.shared);
    const ids = (countries.countries as { id: string; province?: boolean }[]).filter(c => c.province).map(c => c.id);
    const failed: string[] = [];
    for (const id of ids) {
      try { await GeneratedWorld.travel(s, `gate_${id}`); await frontier.expand(s.campaign); }
      catch (e) { failed.push(`${id}: ${(e as Error).message.slice(0, 200)}`); }
    }
    console.log("FAILED", JSON.stringify(failed));
    expect(failed).toEqual([]);
    expect(s.campaign.installed.length).toBeGreaterThanOrEqual(ids.length);
  }, 1500000);
});
