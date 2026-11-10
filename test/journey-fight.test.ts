import { describe, expect, it } from 'bun:test';
import { Journey } from '../src/session/journey';
import type { Battle } from '../src/battle';

// What the authors of the anthology and the Imbar adventures asked of a journey (register M19-185..187): where someone
// is by their own short name, what the company sees where it stands, and a fight fought as the spec says.
describe('a journey, as authors write one', () => {
  it('finds someone by a short name, sees the place, and fights as it is told', async () => {
    const j = await Journey.start('test/fixtures/wolf-yard/campaign.json', 'slice');
    expect(j.at('grey')).toBe(j.at('world__grey'));
    expect(j.at('grey')).toBeDefined();
    expect(j.seen().length).toBeGreaterThan(0);
    let asked = 0;
    const how = async (battle: Battle) => {
      asked++;
      const legal = battle.legalCommands(), mine = legal.find(c => c.ability === 'defend') ?? legal[0]!;
      return { actor: mine.actor, ability: mine.ability, target: mine.target };
    };
    await j.fight('Attack', how);
    expect(asked).toBeGreaterThan(0);
  }, 60000);
});
