import { describe, expect, it } from 'bun:test';
import type { CreatureGenerationContext } from '../../src/content';
import { Tiny } from '../support/tiny';

const scene = `
  Place yard "the yard" is room at 0, 0 outdoors.
  Company party "You" of 1 at yard.
  Person patient "the injured keeper" at yard {
    Role "a keeper with a cut hand". Ancestry human. Level 2. Peaceable. }
  Hazard sharp "a sharp edge" means "Deal (4) physical damage to ally.".
  Action cut(actor: group, site: place) "The keeper cuts a hand" {
    Requires at(actor, site) and at(patient, site) and able(patient).
    On success { Assert strikes(sharp, patient). }
    Result "The keeper's hand is cut.".
  }
  Action mend(actor: group, caster: member, recipient: member, site: place) "Have {caster} cure the keeper" {
    Requires able(actor) and at(actor, site) and at(patient, site) and memberOf(caster, actor)
      and memberOf(recipient, patient) and awake(caster) and awake(recipient)
      and canCast(caster, cure) and treatable(recipient, cure).
    Resolve invoke(cure, caster, recipient).
    Result "{caster} casts Cure on the keeper.".
  }
  Goal false.`;

const cleric: CreatureGenerationContext = {
  name: 'Aud', raceId: 'human', classId: 'cleric', level: 2, traits: ['vitalist'],
  spells: ['cure', 'bless', 'anoint', 'prayer', 'cure_moderate', 'cure_serious'],
};

describe('casting a healing spell on another person', () => {
  it('heals the injured person and spends the caster’s spell slot', async () => {
    const t = await Tiny.start(scene, { horizon: ['care'], party: [cleric], seed: 'cure-keeper' });
    await t.play('The keeper cuts a hand');
    const keeper = () => t.campaign.readout.creatures.find(c => c.id.startsWith('t__patient_person'))!;
    const caster = () => t.campaign.readout.creatures.find(c => c.id === 't__party_1')!;
    const hp = keeper().state.hp, slots = JSON.stringify(caster().state.ready);
    await t.play('Have Aud cure the keeper');
    expect(keeper().state.hp).toBeGreaterThan(hp);
    expect(JSON.stringify(caster().state.ready)).not.toBe(slots);
    expect(t.campaign.events.at(-1)!.combat.some(e => e.type === 'heal' && e.target === keeper().id)).toBe(true);
  });
});
