import { beforeAll, describe, expect, it } from 'bun:test';
import { PlayTool } from '../../../src/cli/play-tool';
import { FirstHourBands, type Banded } from '../../../scripts/first-hour-bands';

// Feature pins: see test/features/choice/consequence.pin.test.ts. Conflict › Fights foretold (the economy review,
// 27 November, OR-1391: difficulty is bimodal, many trivial fights and a sudden lethal one; each dangerous class wants
// a truthful witness before it): the reference seed's first dungeon (s0's barrow, its halls and the grave below), every
// band in it fought by a first-level company alone, a warrior, a mage and a thief (the fragile), ten seeded trials a
// band. What the company's reckoning said before it began is never kinder than the fight: one it loses seven times in
// ten or more is said grave or deadly, and asks before it is joined; one said fair or slight is lost at most once in
// ten. Measured 27 November: of 42 bands, every one held.
const callings = ['human/warrior/Wenna', 'elf/mage/Ilse', 'human/thief/Tam'];
describe('Conflict › Fights foretold', () => {
  const fought = new Map<string, Banded[]>();
  beforeAll(async () => {
    for (const as of callings) {
      const { journey } = await PlayTool.start(PlayTool.parse(['--earned', '--world', 's0', '--as', as, '--opening', 'none']));
      fought.set(as, FirstHourBands.within(journey.session.campaign, 'region__s1_ud_', 10));
    }
  }, 600000);
  for (const as of callings) {
    it(`says a fight a first-level ${as.split('/')[1]} cannot win is grave before it starts, and never says less`, () => {
      const bands = fought.get(as)!;
      expect(bands.length).toBeGreaterThan(8);
      const lost = bands.filter(b => b.won * 10 <= b.trials * 3);
      expect(lost.filter(b => !['grave', 'deadly'].includes(b.said) || !b.asks).map(b => `${b.name}: ${b.said}`)).toEqual([]);
      const easy = bands.filter(b => ['fair', 'slight'].includes(b.said));
      expect(easy.filter(b => b.fell * 10 > b.trials).map(b => `${b.name}: fell ${b.fell}`)).toEqual([]);
    });
  }
});
