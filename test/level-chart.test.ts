import { describe, expect, it } from 'bun:test';
import { readFileSync } from 'node:fs';
import { WorldAssembler } from '../src/world/world-assembler';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { PlaySession } from '../src/session/play-session';
import { PlayerView } from '../src/presentation/player-view';
import { ScreenModel } from '../src/ui/screen-model';

// The plan of a deep site's level knows the site has others: the levels the company has stood on, top to bottom, and
// which way each way off this level goes. The descent's own record, played to its first ride down the cage.
describe('the plan of a level', () => {
  it('shows the levels the company has been on, and marks the way back up as up', async () => {
    const w = await WorldAssembler.assemble('wren', NodeBundleSource.shared,
      { origin: 'wanderer', party: [{ name: 'Wenna', raceId: 'human', classId: 'warrior' }] });
    const s = await PlaySession.start(w.path, 'wren', w.source);
    const record = readFileSync(new URL('./fixtures/descent/wren.choices', import.meta.url), 'utf8').split('\n');
    for (const step of record.slice(0, record.indexOf('cage in the shaft') + 1)) {
      const c = PlayerView.choices(s.campaign).find(x => new RegExp(step, 'i').test(x.choice.name))!;
      await s.perform(c.choice.id);
    }
    const chart = ScreenModel.build(s.campaign).chart!;
    expect(chart.levels).toEqual([{ name: 'the adit level', here: false }, { name: 'the deep galleries', here: true }]);
    expect(chart.places.filter(p => p.external && p.rise === 'up').map(p => p.name)).toContain('the shaft head');
  }, 120000);
});
