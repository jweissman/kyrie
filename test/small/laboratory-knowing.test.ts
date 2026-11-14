import { describe, expect, it } from 'bun:test';
import { Laboratory } from '../../scripts/laboratory';
import { PlayTool } from '../../src/cli/play-tool';

// What is known above opens a better way below (M21's FF-02, in the laboratory): asked at the inn, Eamon tells where
// the old drain's centipede lies up. A company that knows it keeps to the cold side, and searches the drain for what
// the water left without a fight; one that does not is set on while it searches.
class Lab {
  static async walk(asked: boolean) {
    const { journey: j } = await PlayTool.start(PlayTool.parse([Laboratory.file, '--as', 'human/warrior/Brann']));
    if (asked) { await j.play('taproom of the Lucky Phoenix', 'about the old drain', 'landing at Lowmouth'); }
    await j.play('wrench the padlock', 'old corn-store', 'corn-store cellar', ': light a', 'rat-runs', '^Attack',
      'old drain');
    const fights = () => j.campaign.history.filter(e => e.combat.some(c => c.type === 'end')).length, before = fights();
    // A torch lit in the cellar may give out on the search: the candle then, and the search again.
    await j.play('?Keep to the cold side', '^Search', '?: light a', '?^Search');
    return { fought: fights() - before, found: j.campaign.world.test({ kind: 'call', name: 'knows',
      args: ['party', 'lab__low_u_drain_cache_found'] }) };
  }
}
describe('the old drain', () => {
  it('is searched without a fight by one who asked about it above, and not by one who did not', async () => {
    const knowing = await Lab.walk(true), blind = await Lab.walk(false);
    expect(knowing).toEqual({ fought: 0, found: true });
    expect(blind.fought).toBeGreaterThan(0);
  }, 60000);
});
