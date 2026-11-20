import { describe, expect, it } from 'bun:test';
import { PlayTool } from '../../../src/cli/play-tool';
import { Spatial } from '../../../src/lang/spatial';

// Feature pins: see test/features/choice/consequence.pin.test.ts. A town's thread tied to the place it names (FH-08,
// the golden route's part; S3-5): Iscoed's word of the bell says the hobs took it to their hold at Holyking, and
// Holyking holds them: a way from it into their ring-fort, the hobs in it, and the bell among their heap. (In a1 the
// inn had named Seolforfyrd without the hobs.)
describe('World › A town\'s threads tied to what the country holds', () => {
  it('names the hobs and Holyking in the word of the bell, and Holyking holds the hobs and the bell', async () => {
    const { journey } = await PlayTool.start(PlayTool.parse(['--world', 'iscoed', '--as', 'elf/mage/Ilse/scholar']));
    const c = journey.session.campaign, w = c.world, by = new Map(c.module.entities.map(e => [e.id, e]));
    const hold = 'raidersHold__fort', within = (id?: string) => !!id && Spatial.ancestry(by, id).some(e => e.id === hold);
    const word = c.module.entities.find(e => e.id === 'raidersFolk__bell_taken')!;
    expect(word.name).toContain('their hold at {region__w8}');
    expect(by.get('region__w8')!.name).toBe('Holyking');
    expect(w.related('connects').filter(r => r.args[1] === 'region__w8' && within(r.args[2])).length).toBeGreaterThan(0);
    expect(within(w.one('at', 'raidersFolk__watchers'))).toBe(true);
    expect(within(w.one('at', 'raidersFolk__gaffer'))).toBe(true);
    const heap = w.one('inside', 'raidersFolk__handbell');
    expect(heap).toBe('raidersHold__heap');
    expect(within(w.one('at', heap!))).toBe(true);
  }, 60000);
});
