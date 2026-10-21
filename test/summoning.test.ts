import { describe, expect, it } from 'bun:test';
import { Battle } from '../src/arena';
import { Content } from '../src/content';
import { CombatProjection } from '../src/combat-projection';
import { Canon } from '../src/canon/canon';
import { Advancement } from '../src/rules/advancement';
import type { Fighter } from '../src/model';
import type { EffectContext } from '../src/effects';
import { Expressions } from '../src/expressions';
import { Summoning } from '../src/summoning';

// Orsino's summons, random targets and many-handed monsters as general semantics: a summoner owns what it calls and
// holds only so many; a random spell draws its targets once; an owlbear acts twice a turn.
class Field {
  // A caster of a level with the spell known and prepared in a slot of its level.
  static caster(spell: string, level: number, raceId = 'human', classId = 'mage'): Fighter {
    const f = CombatProjection.fighter(new Content(`field-${spell}`).createCreature('caster', { raceId, classId, level }), 'fighters');
    const tier = Canon.abilities[spell]!.spell?.level ?? 0;
    if (!f.abilities.includes(spell)) { f.abilities.push(spell); }
    if (tier) { f.prepared![tier - 1]![0] = spell; f.ready![tier - 1]![0] = spell; }
    return f;
  }
  static foes(n: number): Fighter[] {
    return Array.from({ length: n }, (_, i) => ({ ...new Content('foes').creature('wolf', `wolf-${i}`, 'goblins'), hp: 60, maxHp: 60 }));
  }
  static battle(fighters: Fighter[], seed: string) {
    return new Battle({ id: 'field', combatants: fighters, abilities: Content.abilities }, seed);
  }
  // Steps until the caster acts, letting everyone else do what they would.
  static until(battle: Battle, id: string) {
    for (let i = 0; i < 40 && battle.state.actor !== id && !battle.state.outcome; i++) { battle.step(battle.chosen()); }
    expect(battle.state.actor).toBe(id);
  }
  static cast(battle: Battle, ability: string, target = 'caster') {
    const command = battle.legalCommands().find(c => c.ability === ability && (c.target === target || target === 'any'));
    expect(command).toBeDefined();
    return battle.step(command!);
  }
}

describe('summoning', () => {
  it('calls vermin that fight for their summoner, as many as the dice say', () => {
    const battle = Field.battle([Field.caster('summon_vermin', 3), ...Field.foes(1)], 'vermin');
    Field.until(battle, 'caster');
    const events = Field.cast(battle, 'summon_vermin');
    const called = events.filter(e => e.type === 'summon').map(e => 'target' in e ? e.target : '');
    expect(called.length).toBeGreaterThanOrEqual(2);
    const summoned = battle.state.combatants.filter(f => called.includes(f.id));
    expect(summoned.every(f => f.team === 'fighters' && f.summoner === 'caster')).toBe(true);
    expect(summoned.every(f => ['rat', 'cave_spider', 'centipede'].includes(f.raceId))).toBe(true);
  });
  it('holds at most three and a third of the level, sending the oldest back', () => {
    const owner = Field.caster('summon_vermin', 1);
    const context: EffectContext = { actor: owner, fighters: [owner], turn: 1, events: [], content: new Content('limit'),
      abilities: [], retreat: false, location: null, expressions: new Expressions('limit') };
    Summoning.call({ kind: 'summon', creature: 'rat', target: 'self', amount: { kind: 'literal', value: 5 } }, owner, context);
    const called = context.events.filter(e => e.type === 'summon').map(e => 'target' in e ? e.target : '');
    const sent = context.events.filter(e => e.type === 'dismiss').map(e => 'target' in e ? e.target : '');
    expect(Summoning.limit(owner)).toBe(3);
    expect(sent).toEqual(called.slice(0, 2));
    expect(context.fighters.filter(f => f.summoner === owner.id).map(f => f.id)).toEqual(called.slice(2));
  });
  it('makes a summoned monster at the level the spell names, grown as Orsino\'s template grows it', () => {
    const battle = Field.battle([Field.caster('summon_monster_ii', 5), ...Field.foes(1)], 'monster');
    Field.until(battle, 'caster');
    Field.cast(battle, 'summon_monster_ii');
    const called = battle.state.combatants.find(f => f.summoner === 'caster')!;
    expect(called.level).toBe(5);
    const s = Canon.creature(called.raceId);
    expect(['construct', 'giant', 'demon']).toContain(s.type!);
    if (s.statistics!.growth?.hitPoints) {
      const g = s.statistics!.growth.hitPoints;
      expect(called.maxHp).toBe(Math.max(1, g.base + Math.round((called.constitution - 10) / 2) + g.perLevel * 5));
    }
  });
  it('gives a ranger the companion beast of its people', () => {
    const elf = Field.caster('summon_animal', 2, 'elf', 'ranger');
    const battle = Field.battle([elf, ...Field.foes(1)], 'companion');
    Field.until(battle, 'caster');
    Field.cast(battle, 'summon_animal');
    const called = battle.state.combatants.find(f => f.summoner === 'caster')!;
    expect(['deer', 'owl', 'fox', 'hawk']).toContain(called.raceId);
  });
});

describe('random targets and many actions', () => {
  it('draws a random spell\'s targets once, for its saves and its damage alike', () => {
    const battle = Field.battle([Field.caster('magic_missile', 5), ...Field.foes(7)], 'missiles');
    Field.until(battle, 'caster');
    const events = Field.cast(battle, 'magic_missile', 'any');
    const missiles = events.filter(e => e.type === 'damage' && 'actor' in e && e.actor === 'caster');
    const hit = new Set(missiles.map(e => 'target' in e ? e.target : ''));
    const saved = new Set(events.filter(e => e.type === 'save').map(e => 'actor' in e ? e.actor : ''));
    expect(hit.size).toBe(2 + Math.round(5 / 2));
    expect([...saved].every(id => hit.has(id) || !id.startsWith('wolf'))).toBe(true);
  });
  it('lets an owlbear act twice in its turn, and values it as Orsino does', () => {
    const owlbear = new Content('owl').createCreature('owlbear', { raceId: 'owlbear', level: 3 });
    expect(Advancement.worth(owlbear)).toBe(150 + 50 * 3);
    const battle = Field.battle([CombatProjection.fighter(owlbear, 'goblins'),
      ...Array.from({ length: 2 }, (_, i) => ({ ...new Content('c').character('warrior', `w-${i}`, 'fighters'), hp: 90, maxHp: 90 }))], 'owlbear');
    Field.until(battle, 'owlbear');
    battle.step(battle.chosen());
    expect(battle.state.actor).toBe('owlbear');
  });
});
