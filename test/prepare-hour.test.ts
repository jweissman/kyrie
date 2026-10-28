import { describe, expect, it } from 'bun:test';
import { WorldAssembler } from '../src/world/world-assembler';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { PlaySession } from '../src/session/play-session';
import { ScreenModel } from '../src/ui/screen-model';
import { ChoiceList, type Choice } from '../src/ui/choice-list';

// Preparing a spell takes an hour of study or prayer, and each spell offered to prepare says so beside it, as a
// journey says how long it is (the register's CMB-11: a spell's hour of preparing went unsaid).
describe('a spell to prepare', () => {
  it('says the hour it takes', async () => {
    const w = await WorldAssembler.assemble('kite', NodeBundleSource.shared, { origin: 'order',
      party: [{ name: 'Aud', raceId: 'human', classId: 'mage' }] });
    const s = await PlaySession.start(w.path, 'kite', w.source);
    const leaves = (c: Choice): Choice[] => c.children ? c.children.flatMap(leaves) : [c];
    const preparing = ChoiceList.explore(ScreenModel.build(s.campaign)).flatMap(x => x.choices.flatMap(leaves))
      .filter(c => c.command?.startsWith('prepare_spell('));
    expect(preparing.length).toBeGreaterThan(2);
    expect(preparing.every(c => c.note === '1h')).toBe(true);
  }, 120000);
});
