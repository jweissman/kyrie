import { describe, expect, it } from 'bun:test';
import { PlayTool } from '../src/cli/play-tool';
import { DangerSense } from '../src/presentation/danger-sense';
import { EntityIndex } from '../src/lang/entity-index';

// Whether a fight is beyond the company, by as few fights as settle it (DangerSense.beyond, OR-145 (b)), is what the
// whole reckoning says of it (grave or deadly): the same fights, keyed alike, stopped only where the rest could not
// move the odds across the line. Asked first of each band, before any reckoning of it is kept, then reckoned whole.
describe('a fight beyond the company', () => {
  it('is said by the fewest fights as by the whole reckoning, band by band', async () => {
    const { journey } = await PlayTool.start(PlayTool.parse(['--world', 'a1', '--origin', 'order', '--as',
      'human/mage/Ilse']));
    const c = journey.session.campaign, w = c.world;
    const bands = EntityIndex.of(c.module.entities).typed('group').map(e => e.id)
      .filter(id => w.one('at', id)).slice(0, 8);
    expect(bands.length).toBeGreaterThan(3);
    const said = bands.map(id => [DangerSense.beyond(c, id), DangerSense.reckon(c, id)?.danger]);
    expect(said.every(([beyond, danger]) => beyond === DangerSense.grave.has(danger as never) || danger === undefined))
      .toBe(true);
    expect(said.some(([beyond]) => beyond)).toBe(true);
  }, 240000);
});
