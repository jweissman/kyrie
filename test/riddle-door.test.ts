import { describe, expect, it } from 'bun:test';
import { PlaySession } from '../src/session/play-session';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { ScreenModel } from '../src/ui/screen-model';
import { ChoiceList } from '../src/ui/choice-list';
import type { Choice } from '../src/ui/choice-list';

// Nothing that may hurt is done unasked, and the asking gives nothing away: every word on a speaking door asks first,
// whether or not its author said what it risks, the right word as the wrong (the owner's play, 31 October: a word
// pressed killed the company). The words are under the door, not ways in of their own.
describe('a speaking door', () => {
  it('asks before every word is pressed, alike', async () => {
    const s = await PlaySession.start('test/fixtures/probes/riddle-door/probe.campaign.json', 'riddle',
      NodeBundleSource.shared);
    const leaves = (c: Choice): Choice[] => c.children ? c.children.flatMap(leaves) : [c];
    const words = ChoiceList.ways(ScreenModel.build(s.campaign).exits).choices.flatMap(leaves)
      .filter(c => /^Press the word/.test(c.label));
    expect(words.map(c => c.label)).toEqual(['Press the word “Lute”', 'Press the word “Piano”',
      'Press the word “Trumpet”', 'Press the word “Cello”']);
    expect(words.every(c => c.grave || c.risk)).toBe(true);
    expect(words.every(c => c.id.includes('Look at the speaking door'))).toBe(true);
  }, 60000);
});
