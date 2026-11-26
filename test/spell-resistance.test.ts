import { describe, expect, it } from 'bun:test';
import { Battle } from '../src/arena';
import { Canon } from '../src/canon/canon';
import { Content } from '../src/content';
import { SpellResistance } from '../src/rules/spell-resistance';
import { KindDefenses } from '../src/kind-defenses';
import { Effects } from '../src/effects';
import { Targeting } from '../src/targeting';
import { FixedStatBlock } from '../src/rules/fixed-stat-block';
import { ItemCatalog } from '../src/item-catalog';
import type { Defense } from '../src/rules/defenses';
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
  it('rejects a missing catalog body instead of treating its defenses and traits as absent', () => {
    const target = pixie();
    Effects.modifiers(target);
    Reflect.deleteProperty(target.equipment, 'body');
    for (const read of [
      () => SpellResistance.of(target), () => KindDefenses.of(target),
      () => Effects.modifiers(target), () => Targeting.bears(target, 'fey'), () => FixedStatBlock.of(target),
    ]) { expect(read).toThrow('catalog body projection'); }
  });
  it('keeps same-named local defenses separate and regathers a changed body projection', () => {
    const make = (amount: number, fraction: number) => {
      const species = { name: 'warded', defenses: [
        { kind: 'spellResistance', amount },
        { kind: 'resistance', mode: 'fraction', amount: fraction, to: ['fire'] },
        { kind: 'immunity', to: ['cold'] }, { kind: 'reduction', amount },
      ] satisfies Defense[] };
      return ItemCatalog.of({ species: { warded: species } });
    };
    const a = make(7, 0.5), b = make(19, 0.25), target = pixie();
    for (const catalog of [a, b, a, b]) {
      target.equipment.body = catalog.bodyOf('warded');
      expect(SpellResistance.of(target)).toBe(catalog === a ? 7 : 19);
      expect(Effects.modifiers(target).resistances?.fire).toBe(catalog === a ? 0.5 : 0.25);
      expect(KindDefenses.of(target)).toContainEqual({ kind: 'immunity', to: ['cold'] });
      expect(KindDefenses.of(target)).toContainEqual({ kind: 'reduction', amount: catalog === a ? 7 : 19 });
      expect(target.equipment.body).toBe(catalog.bodyOf('warded'));
      expect(Object.isFrozen(target.equipment.body)).toBe(true);
    }
  });
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
      const { events } = cast(seed, 'spark', 'pix');
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
