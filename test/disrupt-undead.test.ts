import { describe, expect, it } from 'bun:test';
import { Battle } from '../src/arena';
import { CombatProjection } from '../src/combat-projection';
import { Content } from '../src/content';
import { CreatureStore } from '../src/creature-store';
import { Defenses } from '../src/rules/defenses';
import { SpellResistance } from '../src/rules/spell-resistance';
import { Creation } from '../web/engine/creation';
import { Laboratory } from '../scripts/laboratory';
import { Tiny } from './support/tiny';
import type { Fighter } from '../src/model';

const hardy = (f: Fighter): Fighter => ({ ...f, hp: 300, maxHp: 300 });
const fight = (seed: string, resistant = false) => {
  const content = new Content(seed);
  const mage = hardy(CombatProjection.fighter(content.createCreature('mage',
    { raceId: 'human', classId: 'mage', traits: ['necromancer'] }), 'fighters'));
  const dead = resistant
    ? { ...hardy(content.creature('pixie', 'dead', 'goblins', 1)), traits: ['undead'] }
    : hardy(content.creature('zombie', 'dead', 'goblins', 1));
  const living = hardy(content.character('warrior', 'living', 'goblins'));
  const battle = new Battle({ id: 'disrupt', combatants: [mage, dead, living], abilities: Content.abilities }, seed, 200);
  for (let i = 0; i < 40 && battle.state.actor !== 'mage'; i++) {
    battle.step(battle.legalCommands().find(c => c.ability === 'wait') ?? battle.chosen());
  }
  return battle;
};

describe('Disrupt Undead', () => {
  it('is an ordinary necromancer cantrip aimed only at undead', () => {
    const school = Creation.catalog().callings.find(c => c.id === 'mage')!.specializations
      .find(s => s.id === 'necromancer')!;
    expect(school.spells!.find(s => s.id === 'disrupt_undead')).toMatchObject({ level: 0 });
    const battle = fight('a');
    expect(battle.state.actor).toBe('mage');
    expect(battle.legalCommands().filter(c => c.ability === 'disrupt_undead').map(c => c.target)).toEqual(['dead']);
    expect(Content.abilities.find(a => a.id === 'disrupt_undead')!.spell)
      .toEqual({ tradition: 'arcane', level: 0, school: 'necromancy', resistance: true });
  });
  it('can be cast at the actual ghoul placed under the first town', async () => {
    const t = await Tiny.start(Laboratory.text(),
      { party: [{ name: 'Eda', raceId: 'human', classId: 'mage', traits: ['necromancer'] }], seed: 'a' });
    const mage = t.campaign.readout.creatures.find(c => c.id === 'lab__party_1')!;
    const ghoul = t.campaign.readout.creatures.find(c => c.id === 'lab__low_u_dead_person')!;
    expect(ghoul.raceId).toBe('ghoul');
    const battle = Battle.encounter(new CreatureStore([mage, ghoul]),
      [{ creatureId: mage.id, team: 'fighters' }, { creatureId: ghoul.id, team: 'goblins' }], { seed: 'lab' });
    for (let i = 0; i < 20 && battle.state.actor !== mage.id; i++) {
      battle.step(battle.legalCommands().find(c => c.ability === 'wait') ?? battle.chosen());
    }
    const command = battle.legalCommands().find(c => c.ability === 'disrupt_undead' && c.target === ghoul.id);
    expect(command).toBeDefined();
    expect(battle.step(command!).some(e => e.type === 'attack' && e.touch === 'ranged' && e.target === ghoul.id)).toBe(true);
  });
  it('rolls a ranged touch and deals 1d6 untyped damage on a hit, without a slot or save', () => {
    let hits = 0, misses = 0;
    for (const seed of 'abcdefghijklmnop') {
      const battle = fight(seed);
      const before = JSON.stringify(battle.state.combatants.find(c => c.id === 'mage')!.ready);
      const events = battle.step({ actor: 'mage', ability: 'disrupt_undead', target: 'dead' });
      const touch = events.find(e => e.type === 'attack' && e.touch);
      expect(touch).toMatchObject({ target: 'dead', touch: 'ranged' });
      const hit = touch?.type === 'attack' && touch.success;
      const damage = events.flatMap(e => e.type === 'damage' && e.target === 'dead' ? [e] : []);
      expect(damage.length).toBe(hit ? 1 : 0);
      for (const e of damage) {
        expect(e.damageType).toBe('untyped');
        expect(e.rolled).toBeGreaterThanOrEqual(1);
        expect(e.rolled).toBeLessThanOrEqual(6);
      }
      expect(events.some(e => e.type === 'save' && e.target === 'dead')).toBe(false);
      expect(JSON.stringify(battle.state.combatants.find(c => c.id === 'mage')!.ready)).toBe(before);
      if (hit) { hits++; } else { misses++; }
    }
    expect(hits).toBeGreaterThan(0);
    expect(misses).toBeGreaterThan(0);
  });
  it('checks spell resistance after a hit and leaves a resisting undead unharmed', () => {
    let resisted = 0, passed = 0;
    for (const seed of 'abcdefghijklmnopqrstuvwxyz') {
      const battle = fight(seed, true);
      expect(SpellResistance.of(battle.state.combatants.find(c => c.id === 'dead')!)).toBeGreaterThan(0);
      const events = battle.step({ actor: 'mage', ability: 'disrupt_undead', target: 'dead' });
      const hit = events.some(e => e.type === 'attack' && e.touch && e.success);
      const check = events.find(e => e.type === 'resist' && e.target === 'dead');
      expect(!!check).toBe(hit);
      if (check?.type === 'resist') {
        expect(events.some(e => e.type === 'damage' && e.target === 'dead')).toBe(check.success);
        if (check.success) { passed++; } else { resisted++; }
      }
    }
    expect(resisted).toBeGreaterThan(0);
    expect(passed).toBeGreaterThan(0);
  });
  it('does not make untyped damage bypass all defenses as true damage does', () => {
    const blow = { amount: 6, bonus: 0, physical: ['slashing'], type: 'untyped' };
    const defense = { resistances: { all: 0.5, radiant: -1 } };
    expect(Defenses.mitigate(blow, defense).amount).toBe(3);
    expect(Defenses.mitigate({ ...blow, type: 'true' }, defense).amount).toBe(6);
  });
});
