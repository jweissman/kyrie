import { describe, expect, it } from 'bun:test';
import { Battle } from '../src/battle';
import { Content } from '../src/content';
import { PlaySession } from '../src/session/play-session';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { CombatProjection } from '../src/combat-projection';
import type { Fighter } from '../src/model';

// What is offered is what the rules allow, for every ability in the catalogs: nothing that needs its user prepared
// (a charge, hidden for a backstab) before it is, nothing aimed at a creature it cannot touch (charm on a wolf,
// turn undead on the living), and nothing that lasts a fight lasting past it.
class Legal {
  static readonly content = new Content('legality');
  static warrior(abilities: string[], statuses: string[] = []): Fighter {
    return { ...this.content.character('warrior', 'w', 'fighters'), abilities, mana: 999, maxMana: 999,
      statuses: statuses.map(id => ({ id, remaining: 2 })) };
  }
  // A caster of the ninth level with every slot holding the one spell.
  static caster(classId: string, spell: string): Fighter {
    const c = CombatProjection.fighter(new Content('legality').createCreature(classId, { raceId: 'human',
      classId, level: 9 }), 'fighters');
    return { ...c, abilities: [spell], prepared: c.prepared!.map(row => row.map(() => spell)),
      ready: c.ready!.map(row => row.map(() => spell)) };
  }
  static usable(f: Fighter, foe = this.content.creature('wolf', 'g', 'goblins')): string[] {
    return new Battle({ id: 'legality', combatants: [f, foe], abilities: Content.abilities }, 'legality').usable(f)
      .map(a => a.id);
  }
  static targets(f: Fighter, foes: Fighter[], ability: string): string[] {
    const battle = new Battle({ id: 'legality', combatants: [f, ...foes], abilities: Content.abilities }, 'legality');
    while (battle.state.actor !== f.id && !battle.state.outcome) { battle.step(battle.chosen()); }
    return battle.legalCommands().filter(c => c.ability === ability).map(c => c.target);
  }
}

describe('what is offered', () => {
  it('holds back every ability that needs a condition of its user until the user has it', () => {
    const gated = Content.abilities.filter(a => (a.requires?.status || a.requires?.notStatus) && !a.spell);
    expect(gated.map(a => a.id)).toEqual(expect.arrayContaining(['charge', 'backstab']));
    for (const a of gated) {
      const need = a.requires!.status, refuse = a.requires!.notStatus;
      if (need) {
        expect([a.id, Legal.usable(Legal.warrior([a.id])).includes(a.id)]).toEqual([a.id, false]);
        expect([a.id, Legal.usable(Legal.warrior([a.id], [need])).includes(a.id)]).toEqual([a.id, true]);
      }
      if (refuse) {
        expect([a.id, Legal.usable(Legal.warrior([a.id], [refuse])).includes(a.id)]).toEqual([a.id, false]);
        expect([a.id, Legal.usable(Legal.warrior([a.id])).includes(a.id)]).toEqual([a.id, true]);
      }
    }
  });
  it('aims an ability that works on one kind of creature only at that kind, and offers none without one', () => {
    const turner = Legal.caster('cleric', 'turn_undead'), charmer = Legal.caster('mage', 'charm');
    const wolf = Legal.content.creature('wolf', 'wolf', 'goblins'), ghoul = Legal.content.creature('ghoul', 'ghoul', 'goblins');
    const bandit = Legal.content.character('thief', 'bandit', 'goblins');
    expect(Legal.targets(turner, [wolf], 'turn_undead')).toEqual([]);
    expect(Legal.targets(turner, [wolf, ghoul], 'turn_undead')).not.toEqual([]);
    expect(Legal.targets(charmer, [wolf, bandit], 'charm')).toEqual(['bandit']);
  });
  it('ends with the fight what lasts a fight: a charge prepared and not made is not carried away', async () => {
    const s = await PlaySession.start('test/fixtures/wolf-yard/campaign.json', 'legality', NodeBundleSource.shared);
    let prepared = false;
    await s.perform('attack(world__grey)', battle => {
      const legal = battle.legalCommands(), prepare = legal.find(c => c.ability === 'prepare_charge');
      if (prepare && !prepared) { prepared = true; return Promise.resolve(prepare); }
      return Promise.resolve(legal.find(c => c.ability === 'charge') ?? legal.find(c => c.ability === 'melee') ?? legal[0]!);
    });
    expect(prepared).toBe(true);
    const conditions = s.campaign.readout.creatures.flatMap(c => c.state.conditions.map(x => x.id));
    expect(conditions).not.toContain('preparing_to_charge');
  });
});
