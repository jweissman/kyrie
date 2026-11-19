import { describe, expect, it } from 'bun:test';
import { Battle } from '../src/arena';
import { Canon } from '../src/canon/canon';
import { Content } from '../src/content';
import { SpellResistance } from '../src/rules/spell-resistance';
import { CombatTelling } from '../src/ui/combat-telling';
import type { CombatEvent, Fighter } from '../src/model';

// Spell resistance (doc/architecture/mission-22/srd-proving-cases.md, case 43; engine-pressure.md §4's resist
// stage): a spell that allows it is checked once a casting against each creature with some, the caster's d20 and
// casting level against it; a failure leaves that one untouched by every effect of the spell. A pixie's is 15.
const c = new Content('spell-resistance');
const hardy = (f: Fighter): Fighter => ({ ...f, hp: 300, maxHp: 300 });
const mage = (spell: string, level = 1): Fighter => ({ ...hardy(c.character('mage', 'mage', 'fighters')), level,
  abilities: [spell], maxSlots: [1, 1], slots: [1, 1], prepared: [[spell], [spell]], ready: [[spell], [spell]] });
const battle = (seed: string, spell: string, foe: Fighter, level = 1) => {
  const b = new Battle({ id: 'sr', combatants: [mage(spell, level), foe, hardy(c.character('warrior', 'w', 'goblins'))],
    abilities: Content.abilities }, seed, 200);
  for (let i = 0; i < 40 && b.state.actor !== 'mage'; i++) {
    b.step(b.legalCommands().find(x => x.ability === 'wait') ?? b.chosen());
  }
  return b;
};
const pixie = () => hardy(c.creature('pixie', 'pix', 'goblins', 1));
const checks = (events: CombatEvent[]) => events.flatMap(e => e.type === 'resist' ? [e] : []);
const harmed = (events: CombatEvent[], id: string) => events.some(e => e.type === 'damage' && e.target === id);
const cast = (seed: string, spell: string, target: string, level = 1) => {
  const b = battle(seed, spell, pixie(), level);
  const events = b.step(b.legalCommands().find(x => x.ability === spell && x.target === target)!);
  return { b, events };
};
const seeds = 'abcdefghijklmnopqrstuvwx'.split('');
describe('spell resistance', () => {
  it('is a kind\'s typed defense, and a spell says whether it allows it', () => {
    expect(SpellResistance.of(pixie())).toBe(15);
    expect(SpellResistance.of(hardy(c.character('warrior', 'w', 'goblins')))).toBe(0);
    expect(Canon.abilities.magic_missile!.spell?.resistance).toBe(true);
    expect(Canon.abilities.bless!.spell?.resistance).toBeUndefined();
  });
  it('is checked once a casting, d20 and casting level against it; a failure leaves that one untouched', () => {
    let turned = 0, passed = 0;
    for (const seed of seeds) {
      const { b, events } = cast(seed, 'magic_missile', 'pix'), [check, ...more] = checks(events);
      expect(more).toEqual([]);
      expect(check).toMatchObject({ actor: 'mage', target: 'pix', level: 1, difficulty: 15 });
      expect(check!.rolled).toBe(check!.die + 1);
      expect(check!.success).toBe(check!.rolled >= 15);
      expect(harmed(events, 'pix')).toBe(check!.success);
      const told = CombatTelling.exchanges(events, b.state).map(t => t.text).join(' ');
      if (!check!.success) { expect(told).toContain('resists'); turned++; } else { passed++; }
    }
    expect(turned).toBeGreaterThan(passed);
    expect(passed).toBeGreaterThan(0);
  });
  it('is got past more often by a caster of more levels', () => {
    const past = (level: number) => seeds.filter(s => checks(cast(s, 'magic_missile', 'pix', level).events)[0]!
      .success).length;
    expect(past(9)).toBeGreaterThan(past(1));
  });
  it('is never checked for a creature with none, nor by a spell that does not allow it', () => {
    expect(checks(cast('a', 'magic_missile', 'w').events)).toEqual([]);
    for (const seed of seeds.slice(0, 6)) {
      const { events } = cast(seed, 'acid_arrow', 'pix');
      expect(checks(events)).toEqual([]);
      expect(harmed(events, 'pix')).toBe(true);
    }
  });
  it('is checked after a touch lands, never on a touch that misses', () => {
    for (const seed of seeds) {
      const { events } = cast(seed, 'shocking_grasp', 'pix');
      const touch = events.find(e => e.type === 'attack' && e.touch);
      expect(checks(events).length).toBe(touch?.type === 'attack' && touch.success ? 1 : 0);
    }
  });
});
