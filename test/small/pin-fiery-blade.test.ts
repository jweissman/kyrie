import { describe, expect, it } from 'bun:test';
import { Tiny } from '../support/tiny';

// A Paragon pin (doc/architecture/mission-21/paragon-pins.md): a knight takes up a magical blade and swings it at
// foes that answer fire differently. The blade is Westernesse's own wonder, the longsword of flames, whose every
// landed blow carries a second, fire harm; the foes take the catalog's fire affinity (half) and vulnerability
// (double), as their variations of the elemental give them. What is proved is the kernel's and the content's: the
// player's own acts (take, equip, attack) and the fight's own events, not a list of attributes.
const yard = `
  Place yard "the yard" is room at 0, 0 outdoors.
  Company party "You" of 1 at yard.
  Item brand "a longsword of flames" is longsword_of_flames at yard.
  Person kiln "the kiln-wight" at yard {
    Role "a thing of the kiln". Species elemental. Variant fire_element. Temperament territorial. }
  Person rime "the rime-wight" at yard {
    Role "a thing of the wind". Species elemental. Variant air_element. Temperament territorial. }`;
const knight = [{ name: 'Brand', raceId: 'human', classId: 'warrior', level: 6 }];
type Hurt = { type: string; target: string; damageType?: string; amount: number; modifiers?: { resistance?: number } };
describe('the fiery blade', () => {
  it('is taken up, equipped, and burns each foe as its nature answers fire', async () => {
    const t = await Tiny.start(yard, { party: knight });
    await t.play('a longsword of flames: Take');
    await t.play('a longsword of flames: Equip');
    await t.play('the kiln-wight, a thing of the kiln: Attack');
    const hurts = t.journey.taken.flatMap(x => x.event.combat).filter(e => e.type === 'damage') as unknown as Hurt[];
    const fire = hurts.filter(h => h.damageType === 'fire' && h.amount > 0);
    const on = (id: RegExp) => fire.filter(h => id.test(h.target)).map(h => h.modifiers?.resistance);
    expect(fire.length).toBeGreaterThan(0);
    expect(on(/kiln/)).toContain(0.5);
    // Vulnerable: more than the whole of it. (Its vulnerabilities sum, as Orsino's resistances do: -2, three times the
    // harm. Whether two should stack is a rules question, kept in paragon-pins.md, not settled here.)
    expect(Math.min(...on(/rime/).map(r => r ?? 0))).toBeLessThan(0);
  });
});
