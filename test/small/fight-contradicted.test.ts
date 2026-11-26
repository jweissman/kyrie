import { ItemCatalog } from '../../src/item-catalog';
import { describe, expect, it } from 'bun:test';
import { Battle } from '../../src/arena';
import { Content } from '../../src/content';
import { CombatProjection } from '../../src/combat-projection';
import { CombatTelling } from '../../src/ui/combat-telling';
import { Voice } from '../../src/narrative/voice';
import type { BattleState, CombatEvent, Fighter } from '../../src/model';

// What cold play 2 found a fight saying against itself (CL-11): a blow that missed told as taken; a verb that agreed
// with the pronoun and not with the one it was said of; and a ranger's companion another beast by another name in the
// next fight.
const state = { combatants: [{ id: 's', name: 'the spiders\' mother', team: 'goblins' },
  { id: 'w', name: 'Wenna', team: 'fighters' }, { id: 'c', name: 'Carlin', team: 'fighters' }] } as unknown as BattleState;
const stepped = (success: boolean): CombatEvent[] => [
  { type: 'action', turn: 3, command: { actor: 's', ability: 'melee', target: 'c' } },
  { type: 'intercept', turn: 3, actor: 'w', target: 'c' },
  { type: 'attack', turn: 3, actor: 's', target: 'w', die: success ? 15 : 5, need: 12, toHit: 0, armorClass: 6,
    weapon: 'bite', success, critical: false },
  ...success ? [{ type: 'damage', turn: 3, actor: 's', target: 'w', rolled: 3, amount: 3, hp: 8 } as const] : []];
const call = (ranger: Fighter, seed: string): { called: Fighter; ranger: Fighter } => {
  const battle = new Battle({ id: 'c', combatants: [ranger, { ...new Content(seed).creature('wolf', 'wolf', 'goblins'),
    hp: 90, maxHp: 90 }], abilities: Content.abilities }, seed);
  for (let i = 0; i < 20 && battle.state.actor !== 'ranger'; i++) { battle.step(battle.chosen()); }
  battle.step(battle.legalCommands().find(c => c.actor === 'ranger' && c.ability === 'summon_animal')!);
  const all = battle.state.combatants;
  return { called: all.find(f => f.summoner === 'ranger')!, ranger: all.find(f => f.id === 'ranger')! };
};

describe('a fight that does not contradict itself', () => {
  it('tells one stepping in front of another before the blow, and the blow as it fell', () => {
    expect(CombatTelling.exchanges(stepped(false), state)[0]!.text)
      .toBe('Wenna steps in front of Carlin. The spiders\' mother strikes at Wenna and misses.');
    expect(CombatTelling.exchanges(stepped(true), state)[0]!.text)
      .toBe('Wenna steps in front of Carlin. The spiders\' mother hits Wenna, for 3.');
  });
  it('agrees every verb of the one it is said of with them, until "they" is the subject', () => {
    const say = (text: string, many = false) => Voice.render(text, { actor: 'Wenna', pronoun: 'they', many });
    expect(say('{Actor} [wince|winces], and still [look|looks] round to see who else is hurt.'))
      .toBe('Wenna winces, and still looks round to see who else is hurt.');
    expect(say('{Actor} [take|takes] the blow without a sound, and [set|sets] {their} feet again.'))
      .toBe('Wenna takes the blow without a sound, and sets their feet again.');
    expect(say('{Actor} nods, and goes back to what {they} [were|was] doing.'))
      .toBe('Wenna nods, and goes back to what they were doing.');
    expect(say('{Actor} [break|breaks] and [run|runs].', true)).toBe('Wenna break and run.');
  });
  it('brings a ranger the same companion, by its name, in every fight after the first', () => {
    const made = new Content('companion').createCreature(ItemCatalog.canon, 'ranger', { raceId: 'human', classId: 'ranger', level: 3 });
    const fought = call({ ...CombatProjection.fighter(ItemCatalog.canon, made, 'fighters'), environment: 'forest' }, 'first');
    const first = fought.called;
    // What the fight made of the ranger goes on from it (as Battle commits it), and into a fight in other country.
    const after = CombatProjection.creature(fought.ranger, made);
    expect(after.state.companion).toEqual({ raceId: first.raceId, name: first.name });
    const second = call({ ...CombatProjection.fighter(ItemCatalog.canon, after, 'fighters'), environment: 'cave' }, 'second').called;
    expect([second.raceId, second.name]).toEqual([first.raceId, first.name]);
    // Without it, the call in the cave is answered by a beast of the cave.
    expect(call({ ...CombatProjection.fighter(ItemCatalog.canon, made, 'fighters'), environment: 'cave' }, 'second').called.raceId)
      .not.toBe(first.raceId);
  });
});
