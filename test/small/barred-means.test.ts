import { describe, expect, it } from 'bun:test';
import { PlayTool } from '../../src/cli/play-tool';
import { ScreenModel } from '../../src/ui/screen-model';
import { Narrator } from '../../src/presentation/narrator';

// Continuity of intention (the experience pins' family 3): a barred way on says what it needs and where the world
// has it. Over the generated tier, 85 lost turns stood at a way barred (Ironkeep's breach, climbing or rope; Tinhold's
// fall, digging or a shovel) with the need said and nothing leading to its means (EX-01's unreachable aim content).
// Typed for every client (Glance's leads, from Means), and said with the need.
describe('a barred way on, with a chandler down the lane', () => {
  it('leads to the chandler for the rope it needs', async () => {
    const { journey } = await PlayTool.start(PlayTool.parse(['test/fixtures/single/tower.kyr', '--as',
      'human/warrior/Wynn']));
    const c = journey.session.campaign, g = Narrator.leaf(c, ScreenModel.build(c)).glance!;
    expect(g.leads).toEqual([{ way: 'exit:tower__top', needs: ['climbing', 'rope'],
      from: [{ seller: 'tower__nest', kind: 'rope', at: 'tower__lane' }] }]);
    expect(g.need).toEqual(['The broken stair: needs climbing or a coil of rope; Nest, a chandler, sells a coil of rope']);
  });
});
