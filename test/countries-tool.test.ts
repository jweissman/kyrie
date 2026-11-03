import { describe, expect, it } from 'bun:test';
import { CountriesTool } from '../src/cli/countries-tool';
import { Countries } from '../src/world/countries';

// A Winter in Carth's 16 (CTH-16): offering Gaunt beside mountain countries moved other countries' places and broke a
// test, found only by running it. `bin/kyrie countries` says where each authored country lies, for comparing.
describe('where the authored countries lie', () => {
  it('is said for each seed: every country once, with the side and terrain of the way in', () => {
    const lines: string[] = [];
    expect(CountriesTool.main(['wren', 'thorn'], l => lines.push(l))).toBe(0);
    for (const seed of ['wren', 'thorn']) {
      const told = CountriesTool.seed(seed);
      expect(told[0]).toMatch(new RegExp(`^${seed}: the first country is \\w+$`));
      for (const c of Countries.list) {
        expect(told.filter(l => l.includes(` ${c.name} `)).length, `${seed} ${c.name}`).toBe(1);
      }
      const placed = / (north|east|south|west) (of|within) (the first country|x\S+) \(\w+\)$/;
      expect(told.slice(1).every(l => placed.test(l))).toBe(true);
    }
    expect(lines.length).toBe(2 * (Countries.list.length + 1));
  }, 60000);
});

// Fair Weather's friction 1 (FWR-01): adding a country to countries.json moved the others in every seed, silently.
// `bin/kyrie countries --diff` names each country a change moves, in which seed; a province placed first in the list
// takes the way in another had.
describe('what a change to the countries moves', () => {
  it('names each country placed elsewhere, newly, or not at all', async () => {
    const list = Countries.list, first = list.find(c => c.province)!;
    const added = [{ ...first, id: 'newcomer', name: 'the Newcomer' }, ...list];
    const moved = await CountriesTool.moved(list, added, ['wren']);
    expect(moved).toContainEqual(expect.stringMatching(/^wren: the Newcomer is placed at way in \d+$/));
    expect(moved.some(l => / moves from way in \d+ to way in \d+$/.test(l))).toBe(true);
    expect(await CountriesTool.moved(added, list, ['wren'])).toContainEqual(
      expect.stringMatching(/^wren: the Newcomer is no longer placed \(was way in \d+\)$/));
    expect(await CountriesTool.moved(list, list, ['wren', 'thorn'])).toEqual([]);
  }, 60000);
});
