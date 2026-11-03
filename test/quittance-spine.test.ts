import { describe, expect, it } from 'bun:test';
import { City, Paths, Q } from './support/quittance';

// The spine's people: Miss Pettifer, Ottoline and Prewitt, and the last Hearthkeeper.
describe('Quittance: the Tables Room', () => {
  it('shows her curves to a company that brings a good pencil, and she will be stood beside', async () => {
    const j = await City.start();
    await j.play(...City.honest, ...Paths.buy('steel pencil'), '^To the Brokers', '^To Policy Row', '^Into Phoenix House', '^To the Tables Room');
    expect(City.knows(j, 'd_tables_paradox')).toBe(false);
    await j.play('Give Miss Pettifer a new steel pencil');
    expect(City.knows(j, 'd_tables_paradox')).toBe(true);
    expect(j.measure(Q('pettiferTrust'), Q('pettifer'))).toBe(2);
    await j.play('Promise to stand beside her');
    expect(City.arc(j, 'pettifer')).toBe(1);
    expect(j.holds(Q('witness'), Q('pettifer'))).toBe(true);
    await j.play('Ask Cornelia Pettifer to join the company');
    expect(j.holds('travelsWith', Q('pettifer'), 'party')).toBe(true);
  }, 120000);

  it('shows her curves to a scholar who sits down and counts with her, and tells her to go away if they cannot', async () => {
    const seen: boolean[] = [];
    for (const seed of ['count-1', 'count-2', 'count-3', 'count-4', 'count-5', 'count-6']) {
      const j = await City.start(seed);
      await j.play(...Paths.toTables, '?Sit down and check her figures');
      seen.push(City.knows(j, 'd_tables_paradox'));
    }
    expect(seen).toContain(true);
  }, 240000);

  it('will not tell a company that did not bring a pencil or the wit to count', async () => {
    const j = await City.start();
    await j.play(...Paths.toTables, 'Ask Miss Pettifer what she is drawing');
    expect(City.knows(j, 'd_tables_paradox')).toBe(false);
    expect(City.page(j)).toContain('one pencil');
  }, 120000);
});

describe('Quittance: Ottoline and the Chief Underwriter', () => {
  it('employs the company, with a writ and twenty coin, and the Wards will notice', async () => {
    const j = await City.start();
    await j.play(...Paths.toPhoenix);
    const g0 = City.gold(j);
    await j.play('Ask Ottoline what the Phoenix wants', 'Accept the Phoenix.s commission');
    expect(j.holds(Q('employed'), 'party')).toBe(true);
    expect(City.gold(j)).toBe(g0 + 20);
    expect(j.holds('carries', 'party', Q('writ_item'))).toBe(true);
  }, 120000);

  it('meets Prewitt, who is not moved by the shawl until he is asked about it', async () => {
    const j = await City.start();
    await j.play(...Paths.toPhoenix, '^To the Chief Underwriter', 'Give your names');
    expect(City.knows(j, 'd_prewitt_met')).toBe(true);
    await j.play('Ask whose shawl it is');
    expect(j.holds(Q('shawlAsked'), 'party')).toBe(true);
    expect(City.arc(j, 'prewitt')).toBe(0);
  }, 120000);

  it('hardens him if he is threatened with the list', async () => {
    const j = await City.start();
    await j.play(...Paths.toPhoenix, '^To the Chief Underwriter');
    expect(j.matches('Tell Prewitt you will put his list on the Slate')).toEqual([]);
  }, 120000);
});

describe('Quittance: Hearn House', () => {
  it('has a coal that wants kindling, a lintel that wants scrubbing, and an old man who says one line', async () => {
    const j = await City.start();
    await j.play(...City.honest, ...Paths.buy('kindling'), '^To the Brokers', '^To Policy Row', '^To Surety Hill', '^Into Hearn', '^To the hearth-room');
    await j.play('Ask whom he takes you for');
    expect(j.measure(Q('lucidUntil'), Q('auberon'))).toBe(0);
    await j.play('Feed the old man.s coal a bundle of kindling');
    expect(City.arc(j, 'auberon')).toBe(1);
    await j.play('Ask about Honora');
    expect(City.knows(j, 'd_fire_is_real')).toBe(true);
    await j.play('Ask him to say the Return');
    expect(City.knows(j, 'd_return_1')).toBe(true);
    await j.play('Scrub the soot from the lintel');
    expect(City.knows(j, 'd_return_2')).toBe(true);
    expect(j.holds(Q('returnLearned'), 'party')).toBe(false);
  }, 120000);

  it('keeps its coal from a company with nothing to feed it', async () => {
    const j = await City.start();
    await j.play(...Paths.toHearth);
    expect(j.matches('Feed the old man')).toEqual([]);
    expect(j.matches('Ask about Honora')).toEqual([]);
  }, 120000);
});
