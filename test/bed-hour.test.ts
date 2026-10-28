import { describe, expect, it } from 'bun:test';
import { WorldAssembler } from '../src/world/world-assembler';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { Journey } from '../src/session/journey';
import { ScreenModel } from '../src/ui/screen-model';
import { ChoiceList } from '../src/ui/choice-list';
import { GeneratedWorld } from './support/generated';

// A bed taken in the morning sleeps eight hours, until the evening, and the choice had said only "8h": the cold
// evaluation's ranger took one after breakfast and woke at dusk. A night's sleep says when it will end.
describe('a bed at the inn', () => {
  it('says when the sleep it is would end: by day the hour, at night the morning', async () => {
    const w = await WorldAssembler.assemble('kite', NodeBundleSource.shared,
      { origin: 'wanderer', party: [{ name: 'Maud', raceId: 'elf', classId: 'ranger' }] });
    const j = await Journey.start(w.path, 'kite', { source: w.source });
    GeneratedWorld.put(j.session, `${w.report.region.settlements[0]!.id}_taproom`);
    const bed = () => ChoiceList.all(ChoiceList.explore(ScreenModel.build(j.campaign)))
      .find(c => /^take_lodging\(/.test(c.command ?? ''));
    expect(bed()?.note).toContain('until 4:00 p.m.');
    await j.play('=21:00');
    expect(bed()?.note).toContain('until morning');
    // The next morning, the hour as it is said, not "on day 2" (play 11's camp at a tower).
    await j.play('=08:00');
    expect(bed()?.note).toMatch(/until \d+:\d\d [ap]\.m\.$/);
    expect(bed()?.note).not.toContain('day 2');
  }, 120000);
});
