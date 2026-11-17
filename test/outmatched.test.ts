import { describe, expect, it } from 'bun:test';
import { PlayTool } from '../src/cli/play-tool';
import { Runner, type Said } from '../src/cli/runner';

// A job whose fight is beyond a company alone, by its own reckoning (OR-64, the owner, 17 November: "way too easy
// for a starting mage to die … the initial quest-giver could hint 'you need to get some friends'"): the one who
// gives it says so, and who at the inn would go along. In a1 the quarry's spider is grave for a lone first-level
// mage and hard for a lone warrior; Eamon warns the mage, and not the warrior.
class Quarry {
  static async asked(calling: string): Promise<string> {
    const { journey } = await PlayTool.start(PlayTool.parse(['--world', 'a1', '--origin', 'wanderer',
      '--as', `human/${calling}/Wenna`]));
    const r = new Runner(journey.session);
    let s = r.said() as Said;
    for (const label of [/^To the landing at/, /^Into the Lucky Phoenix/, /^Ask Eamon about the old quarry$/]) {
      const o = [...s.offer.primary, ...s.offer.rest].find(x => label.test(x.label))!;
      s = await r.ask(JSON.stringify({ act: o.id })) as Said;
    }
    return s.scene.lines.join(' ');
  }
}
describe('a job beyond a company alone', () => {
  it('is said so by whoever gives it, to a lone mage and not to a lone warrior', async () => {
    const mage = await Quarry.asked('mage'), warrior = await Quarry.asked('warrior');
    for (const told of [mage, warrior]) { expect(told).toContain('You take the key to the quarry gate.'); }
    expect(mage).toContain('Eamon looks you over. ‘Not on your own, you won’t. Cyril at the taproom of the Lucky '
      + 'Phoenix is looking for work: take someone with you.’');
    expect(warrior).not.toContain('Not on your own');
  }, 180000);
});
