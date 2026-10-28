import { describe, expect, it } from 'bun:test';
import { WorldAssembler } from '../src/world/world-assembler';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { PlaySession } from '../src/session/play-session';
import { PlayerView } from '../src/presentation/player-view';

// One who comes alone is told, wherever in the first town they begin, who at its inn would come with them, by name:
// said only on the town's green, it was never heard by one who began at its shrine (play 7), and alone a mage, a thief
// or a bard does not get far (PT-11).
describe('one who comes alone', () => {
  it('is told who at the first inn would come along, though they begin at the shrine', async () => {
    const w = await WorldAssembler.assemble('kite', NodeBundleSource.shared,
      { origin: 'order', party: [{ name: 'Aud', raceId: 'human', classId: 'mage' }] });
    const s = await PlaySession.start(w.path, 'kite', w.source);
    const town = w.report.region.settlements[0]!;
    const told = PlayerView.observe(s.campaign).observations.map(o => o.text).join(' ');
    expect(told).toContain(`You have come alone. At the inn at ${town.name}, ${town.traveller}, `);
  }, 120000);
});
