import { describe, expect, it } from 'bun:test';
import { WorldAssembler } from '../src/world/world-assembler';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { PlaySession } from '../src/session/play-session';
import { PlayerView } from '../src/presentation/player-view';
import { GeneratedWorld } from './support/generated';

// A country goes on after a death in it. Begun again as someone else, it is the same country, and it remembers who
// died in it and where: a cairn by the way, and how they died.
describe('a country begun again after a death in it', () => {
  it('keeps a cairn where the dead one fell', async () => {
    const memorial = { name: 'Wenna', place: 'region__s1_green', how: 'Wolves killed Wenna.' };
    const w = await WorldAssembler.assemble('thorn', NodeBundleSource.shared, { memorial });
    const s = await PlaySession.start(w.path, 'thorn', w.source);
    GeneratedWorld.put(s, 's1_green');
    await s.perform('wait');
    const seen = PlayerView.observe(s.campaign).observations.map(o => o.text).join(' ');
    expect(seen).toContain('Stones are heaped by the way here over Wenna, who died here. Wolves killed Wenna.');
  }, 60000);
});
