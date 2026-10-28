import { describe, expect, it } from 'bun:test';
import { WorldAssembler } from '../src/world/world-assembler';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { PlaySession } from '../src/session/play-session';
import { PlayerView } from '../src/presentation/player-view';
import { ScreenModel } from '../src/ui/screen-model';

// The brothers' priest sends a rope with the way: play 11's thief and drover walked sixteen hours to a door high in a
// tower wall, which wanted climbing or a rope, and could not reach the writing they had come to copy.
describe('the brothers\' errand', () => {
  it('sends the company on its way with the shrine\'s rope', async () => {
    const w = await WorldAssembler.assemble('a1', NodeBundleSource.shared,
      { origin: 'order', party: [{ name: 'Tobin', raceId: 'human', classId: 'thief' }] });
    const s = await PlaySession.start(w.path, 'a1', w.source);
    const give = PlayerView.choices(s.campaign).find(c => /^Give .* the brothers' letter$/.test(c.choice.name))!;
    const told = await s.perform(give.choice.id);
    expect(told.response).toContain('take the shrine\'s rope');
    expect(ScreenModel.build(s.campaign).items.map(i => i.name)).toContain('the shrine\'s coil of rope');
  }, 60000);
});
