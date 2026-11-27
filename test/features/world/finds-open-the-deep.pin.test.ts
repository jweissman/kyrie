import { describe, expect, it } from 'bun:test';
import { PlayTool } from '../../../src/cli/play-tool';
import { HonestPlayer } from '../../support/honest-player';
import { Undertakings } from '../../../src/presentation/undertakings';

// Feature pins: see test/features/choice/consequence.pin.test.ts. World › Finds open the deep (OR-1505). In the
// reference country a life's reason no longer ends where its find is made. The dead man's box holds his note of what
// he was after, and the sister's pin her mark and the same: the first king's crown, so the deep's own aim to bring it
// up is held. The brothers' copies, shown at the shrine, are read again by its keeper for what the makers feared
// below, the jar of day. Each opens something that later play reads, by the page's own leads.
const life = async (origin: string) => {
  const { journey } = await PlayTool.start(PlayTool.parse(['--world', 's0', '--as', 'human/warrior/Wenna',
    '--opening', 'none', '--origin', origin]));
  return journey.session;
};
describe('World › Finds open the deep', () => {
  for (const [origin, thing] of [['map', 'origin__cache'], ['lost', 'origin__pin']] as const) {
    it(`turns the ${origin} life's find into the story of the crown and the aim to bring it up`, async () => {
      const s = await life(origin), h = new HonestPlayer(s), c = s.campaign;
      const carries = () => c.world.test({ kind: 'call', name: 'carries', args: ['party', thing] });
      for (let i = 0; i < 20 && !carries(); i++) { if (!await h.step()) { break; } }
      expect(carries()).toBe(true);
      expect(c.world.test({ kind: 'call', name: 'knows', args: ['party', 'region__s1_ud_story'] })).toBe(true);
      expect(Undertakings.held(c).map(o => o.id)).toContain('region__s1_ud_bring');
    }, 60000);
  }
  it('has the shrine-keeper read the brothers\' copies for the jar of day', async () => {
    const c = (await life('order')).campaign;
    const rule = c.module.rules?.find(r => r.id === 'origin__copies_read');
    expect(rule?.teaches).toBe('region__s1_ud_bane');
  }, 60000);
});
