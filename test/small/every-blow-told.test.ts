import { describe, expect, it } from 'bun:test';
import { CombatTelling } from '../../src/ui/combat-telling';
import type { BattleState, CombatEvent } from '../../src/model';

// Every blow of a turn told with what it did, and nothing told that did not happen (cold play 3, CL-13 and CL-17): the
// barrow ghoul's routine (claws, claws, bite) had been told by its first blow alone and the harm of the others taken as
// told ("for 6 … takes 2" for 10 lost; "the claws miss Wenna" for 2 lost); a blow that landed and did no harm (a 1 on
// the die, a tenth turned aside and floored) had read as a hit whose number was lost.
const state = { combatants: [{ id: 'g', name: 'the keeper of the vault', team: 'goblins',
  equipment: { weapon: { id: 'bite', name: 'bite', natural: true } } },
{ id: 'w', name: 'Wenna', team: 'fighters', equipment: { weapon: { id: 'longsword', name: 'longsword' } } }] } as unknown as BattleState;
const blow = (weapon: string, success: boolean, amount?: number, hp?: number): CombatEvent[] => [
  { type: 'attack', turn: 2, actor: 'g', target: 'w', die: success ? 15 : 3, need: 10, toHit: 2, armorClass: 6, weapon,
    success, critical: false },
  ...amount === undefined ? [] : [{ type: 'damage', turn: 2, actor: 'g', target: 'w', rolled: amount || 1, amount, hp: hp!,
    damageType: 'slashing' } as const]];
const told = (...blows: CombatEvent[][]) => CombatTelling.exchanges([{ type: 'action', turn: 2,
  command: { actor: 'g', ability: 'melee', target: 'w' } }, ...blows.flat()], state)[0]!.text;
const sum = (text: string) => [...text.matchAll(/for (\d+)/g)].reduce((n, m) => n + Number(m[1]), 0);

describe('every blow of a turn told', () => {
  it('tells each blow of a routine by its own weapon and its own harm', () => {
    const text = told(blow('claws', true, 6, 8), blow('claws', false), blow('bite', true, 4, 4));
    expect(text).toBe('The claws of the keeper of the vault catch Wenna, for 6. The claws of the keeper of the vault miss'
      + ' Wenna. The bite of the keeper of the vault catches Wenna, for 4.');
    expect(sum(text)).toBe(10);
  });
  it('does not take a later blow\'s harm as told by a first that missed', () => {
    const text = told(blow('claws', false), blow('claws', false), blow('bite', true, 2, 2));
    expect(text).toMatch(/miss Wenna\. The bite .* catches Wenna, for 2\./);
    expect(sum(text)).toBe(2);
  });
  it('says a blow that landed and did no harm did none', () => {
    expect(told(blow('claws', true, 0, 9))).toBe('The claws of the keeper of the vault catch Wenna, to no harm.');
  });
});
