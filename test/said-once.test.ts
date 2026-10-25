import { describe, expect, it } from 'bun:test';
import { WorldAssembler } from '../src/world/world-assembler';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { PlaySession } from '../src/session/play-session';
import { PlayerView } from '../src/presentation/player-view';
import { GeneratedWorld } from './support/generated';

// What two things say alike is said once. The follow-up review read "The Nûrrant runs knee-deep and clear over the
// ford stones" twice over at a town with a ford of the river on each of two roads; d4's third town is one such.
describe('a place', () => {
  it('says once what two things there say alike', async () => {
    const w = await WorldAssembler.assemble('d4', NodeBundleSource.shared);
    const s = await PlaySession.start(w.path, 'd4', w.source);
    GeneratedWorld.put(s, 's3_green');
    const texts = PlayerView.observe(s.campaign).observations.map(o => o.text);
    expect(texts.filter(t => /runs knee-deep and clear over the ford stones/.test(t))).toHaveLength(1);
    expect(new Set(texts).size).toBe(texts.length);
  }, 60000);
});
