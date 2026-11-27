import { describe, expect, it } from 'bun:test';
import { Journey } from '../src/session/journey';
import { campaign } from './support/long-road';

describe('gnolls in the Ferryman\'s generated cell', () => {
  for (const [seed, kind, calling] of [
    ['cell-gnoll-0', 'lc_cult', 'thief'],
    ['cell-gnoll-1', 'lc_marauders', 'warrior'],
    ['cell-gnoll-13', 'lc_musicians', 'thief'],
  ] as const) {
    it(`casts ${kind} with the compatible ${calling} calling`, async () => {
      const j = await Journey.start(campaign, seed);
      expect(j.holds('lc_cell_kind', kind)).toBe(true);
      const ids = j.campaign.actors.find(a => a.id === 'tallow__lc_cell')!.members;
      const people = j.campaign.state.creatures.filter(c => ids.includes(c.id));
      expect(people.length).toBe(kind === 'lc_marauders' ? 3 : 2);
      expect(people.every(c => c.raceId === 'gnoll' && c.classId === calling)).toBe(true);
      expect(people.every(c => c.traits?.includes('resilient'))).toBe(true);
    }, 10000);
  }
});
