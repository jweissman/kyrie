import { describe, expect, it } from 'bun:test';
import { readFileSync } from 'node:fs';
import { Canon } from '../src/canon/canon';
import { CreatureFidelity } from '../src/cli/srd-creature-fidelity';
import { SpellFidelity } from '../src/cli/srd-spell-fidelity';
import { SrdFidelityReport } from '../src/cli/srd-fidelity-report';
import { Content } from '../src/content';
import concordance from '../data/sources/srd35/concordance.json';
import type { Encounters } from '../src/cli/srd-encounters';

// The SRD fidelity census (doc/architecture/mission-21/rules/srd-fidelity.md) read from the catalog alone: the page is
// what scripts/srd-fidelity.ts writes from it (regenerate it after a catalog edit), its verdicts are the catalog's,
// and the concordance names only what there is. The encounters are kept (scripts/srd-fidelity.ts --encounters).
const kept = JSON.parse(readFileSync('data/sources/srd35/encounters.json', 'utf8')) as Encounters;
describe('the SRD fidelity census', () => {
  it('is current: the page is what the catalog writes', () => {
    expect(readFileSync('doc/architecture/mission-21/rules/srd-fidelity.md', 'utf8')).toBe(SrdFidelityReport.markdown(kept));
  });
  it('names only creatures, spells and SRD entries there are', () => {
    const monsters = CreatureFidelity.monsters, spells = SpellFidelity.spells;
    expect(Object.entries(concordance.creatures).filter(([id, e]) => !Canon.isBody(id) || !monsters[e.srd]))
      .toEqual([]);
    expect(Object.entries(concordance.spells).filter(([id, s]) => !Canon.abilities[id]?.spell || !spells[s]))
      .toEqual([]);
  });
  it('reads a stat block as the SRD gives it: the barrow ghoul\'s Hit Dice and claws exact, Orsino\'s ghoul\'s not', () => {
    const ghoul = CreatureFidelity.row('ghoul/barrow');
    expect(ghoul.hitDice).toEqual({ verdict: 'exact', ours: '2d12', theirs: '2d12' });
    expect(ghoul.attacks).toEqual({ verdict: 'exact', ours: '1d3 1d3 1d6', theirs: '1d3 1d3 1d6' });
    expect(CreatureFidelity.row('ghoul').attacks).toEqual({ verdict: 'differs', ours: '1d4', theirs: '1d3 1d3 1d6' });
    expect(CreatureFidelity.row('rat').hitDice.verdict).toBe('orsino');
    expect(CreatureFidelity.row('golem/flesh').defences.verdict).toBe('exact');
  });
  it('reads a spell field by field, and a fault put back is seen', () => {
    const fireball = Canon.abilities.fireball!, row = SpellFidelity.row('fireball', 'fireball');
    expect(row.school.verdict).toBe('exact');
    expect(row.type).toEqual({ verdict: 'exact', ours: fireball.effects![0]!.kind === 'damage' ? 'fire' : '', theirs: 'fire' });
    expect(SpellFidelity.srdMean({ dice: '1d6', per: 'level', max: '10d6' }, 14)).toBe('35');
    const listed = { ...fireball, spell: { ...fireball.spell!, level: SpellFidelity.listed(SpellFidelity.spells.fireball!, 'arcane')! } };
    expect(SpellFidelity.row('fireball', 'fireball', listed).level.verdict).toBe('exact');
    const off = { ...listed, spell: { ...listed.spell, level: listed.spell.level + 1 } };
    expect(SpellFidelity.row('fireball', 'fireball', off).level.verdict).toBe('differs');
  });
  it('does not borrow a level or save difficulty from an unrelated class or domain', () => {
    const cloudkill = SpellFidelity.row('cloudkill', 'cloudkill');
    expect(cloudkill.level).toEqual({ verdict: 'differs', ours: '5', theirs: 'not on Clr list' });
    expect(cloudkill.dc).toEqual({ verdict: 'differs', ours: '15', theirs: 'not on Clr list' });
    expect(SpellFidelity.row('augury', 'augury').level)
      .toEqual({ verdict: 'differs', ours: '2', theirs: 'not on Sor/Wiz list' });
    expect(SpellFidelity.row('life_drain', 'vampiric-touch').level)
      .toEqual({ verdict: 'differs', ours: '3', theirs: 'not on Clr list' });
    expect(SpellFidelity.row('barkskin', 'barkskin').level)
      .toEqual({ verdict: 'differs', ours: '2', theirs: 'not on Clr list' });
    const sleep = SpellFidelity.spells.sleep!;
    expect(SpellFidelity.listed(sleep, 'arcane')).toBe(sleep.levels['Sor/Wiz']);
  });
  // A page that says its spell "functions like" another names no range, target, duration or save of its own: it takes
  // the other's (SrdPages.inherit), so Cure Moderate Wounds is instantaneous and saved against as Cure Light Wounds.
  it('reads a spell that functions like another by the other\'s header, where its own names none', () => {
    const moderate = SpellFidelity.spells['cure-moderate-wounds']!, light = SpellFidelity.spells['cure-light-wounds']!;
    expect([moderate.range, moderate.duration, moderate.save]).toEqual([light.range, light.duration, light.save]);
    expect(SpellFidelity.spells['hold-monster']!.targets).toBe('One living creature');
  });
  // What the census had not measured (proof-slices.md, step 1): a save's difficulty, how a spell is aimed, what it
  // falls on, a blow's chance to hit, and three grades a row passes or fails.
  it('measures a save\'s difficulty, how a spell is aimed and what it falls on, at the census\'s caster', () => {
    // Cloudkill is divine in Kyr, but the SRD lists it for Sor/Wiz, so no divine DC is asserted.
    const cloudkill = SpellFidelity.row('cloudkill', 'cloudkill');
    expect(cloudkill.dc).toEqual({ verdict: 'differs', ours: '15', theirs: 'not on Clr list' });
    expect(cloudkill.target).toEqual({ verdict: 'exact', ours: 'burst', theirs: 'burst' });
    // Shocking Grasp touches since case 35, Ray of Frost by a ranged touch since case 45; Orsino's Weakness rolls none.
    expect(SpellFidelity.row('shocking_grasp', 'shocking-grasp').attack)
      .toEqual({ verdict: 'exact', ours: 'melee touch', theirs: 'melee touch' });
    expect(SpellFidelity.row('ray_of_frost', 'ray-of-frost').attack)
      .toEqual({ verdict: 'exact', ours: 'ranged touch', theirs: 'ranged touch' });
    expect(SpellFidelity.row('weakness', 'ray-of-enfeeblement').attack)
      .toEqual({ verdict: 'exact', ours: 'ranged touch', theirs: 'ranged touch' });
    expect(SpellFidelity.row('magic_missile', 'magic-missile').dc.verdict).toBe('n/a');
    // A burst made a cone is seen.
    const coned = { ...Canon.abilities.cloudkill!, area: 'cone' as const };
    expect(SpellFidelity.row('cloudkill', 'cloudkill', coned).target.verdict).toBe('differs');
  });
  it('measures a blow\'s chance to hit SRD AC 15, and grades a row in structure, resolution and play identity', () => {
    expect(CreatureFidelity.row('rat').hit).toEqual({ verdict: 'differs', ours: '20%', theirs: '50%' });
    const rows = [...SpellFidelity.rows(), ...CreatureFidelity.rows()];
    // Proved only where the concordance names a focused test: the SRD rat's, the long centipede's and the midden rat's
    // (cases 63, 64), and the spells moved by cases 7, 9, 12, 14 to 24, 31 to 33, 35, 36, 38 to 40, 42, 44, 45, 48 to
    // 50, 52, 55 and 58.
    expect(rows.filter(r => r.grades.identity === 'proved').map(r => r.id).sort()).toEqual(['acid_arrow', 'acid_splash', 'armor', 'barkskin', 'bless', 'blur',
      'burning_hands',
      'calm_emotions', 'centipede/long', 'chain_lightning', 'command', 'comprehend_languages', 'cone_of_cold', 'cure', 'cure_critical', 'cure_disease', 'cure_moderate', 'cure_serious', 'disrupt_undead', 'divine_favor',
      'entangle', 'fireball', 'flesh_to_stone', 'hold_animal', 'hold_person', 'life_drain', 'lightning_bolt', 'magic_missile', 'mass_curse', 'mirror_image', 'paralyzing_touch', 'protection_from_evil', 'rat/cellar', 'rat/midden', 'ray_of_frost', 'remove_fear', 'resist_fire', 'shield',
      'shocking_grasp', 'sleep', 'terror', 'weakness']);
    expect(SpellFidelity.row('cloudkill', 'cloudkill').grades).toEqual({ structural: 'fail', resolution: 'fail',
      identity: 'unassessed' });
    expect(SpellFidelity.row('fireball', 'fireball').grades).toEqual({ structural: 'pass', resolution: 'pass',
      identity: 'proved' });
    expect(SpellFidelity.row('magic_missile', 'magic-missile').grades.structural).toBe('pass');
  });
  it('does not certify a routine when a secondary strike has the wrong bonus', () => {
    const creature = new Content('srd-secondary').creature('owlbear/fell', 'owl', 'goblins', 5);
    const source = CreatureFidelity.monsters.owlbear!;
    expect(CreatureFidelity.hit(creature, source)).toEqual({ verdict: 'exact',
      ours: '75% / 75% / 50%', theirs: '75% / 75% / 50%' });
    const routine = creature.equipment.routine!.map(w => ({ ...w }));
    routine[2]!.attackBonus = 9;
    const wrong = { ...creature, equipment: { ...creature.equipment, routine } };
    expect(CreatureFidelity.hit(wrong, source)).toEqual({ verdict: 'differs',
      ours: '75% / 75% / 75%', theirs: '75% / 75% / 50%' });
    expect(CreatureFidelity.damage(creature, source)).toEqual({ verdict: 'exact',
      ours: '1d6+5 / 1d6+5 / 1d8+2', theirs: '1d6+5 / 1d6+5 / 1d8+2' });
    routine[2]!.damageBonus = 5;
    expect(CreatureFidelity.damage(wrong, source)).toEqual({ verdict: 'differs',
      ours: '1d6+5 / 1d6+5 / 1d8+5', theirs: '1d6+5 / 1d6+5 / 1d8+2' });
  });
  it('distinguishes a signed die without the minimum-one rule from a fixed strike', () => {
    const rat = new Content('srd-minimum').creature('rat/cellar', 'rat', 'goblins', 1);
    const weapon = { ...rat.equipment.weapon, damage: '1d3-4', damageBonus: undefined };
    const missingMinimum = { ...rat, equipment: { ...rat.equipment, weapon, routine: [weapon] } };
    expect(CreatureFidelity.damage(missingMinimum, CreatureFidelity.monsters.rat!)).toEqual({
      verdict: 'differs', ours: '1d3-4 (no minimum)', theirs: '1d3-4',
    });
  });
});
