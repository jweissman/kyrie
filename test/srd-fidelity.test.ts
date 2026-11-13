import { describe, expect, it } from 'bun:test';
import { readFileSync } from 'node:fs';
import { Canon } from '../src/canon/canon';
import { CreatureFidelity } from '../src/cli/srd-creature-fidelity';
import { SpellFidelity } from '../src/cli/srd-spell-fidelity';
import { SrdFidelityReport } from '../src/cli/srd-fidelity-report';
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
  it('reads a stat block as the SRD gives it: the barrow ghoul\'s Hit Dice exact, its claws not', () => {
    const ghoul = CreatureFidelity.row('ghoul/barrow');
    expect(ghoul.hitDice).toEqual({ verdict: 'exact', ours: '2d12', theirs: '2d12' });
    expect(ghoul.attacks).toEqual({ verdict: 'differs', ours: '1d4 1d4 1d6', theirs: '1d3 1d3 1d6' });
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
  // What the census had not measured (proof-slices.md, step 1): a save's difficulty, how a spell is aimed, what it
  // falls on, a blow's chance to hit, and three grades a row passes or fails.
  it('measures a save\'s difficulty, how a spell is aimed and what it falls on, at the census\'s caster', () => {
    const fireball = SpellFidelity.row('fireball', 'fireball');
    expect(fireball.dc).toEqual({ verdict: 'differs', ours: '15', theirs: '16' });
    expect(fireball.target).toEqual({ verdict: 'exact', ours: 'burst', theirs: 'burst' });
    expect(SpellFidelity.row('shocking_grasp', 'shocking-grasp').attack)
      .toEqual({ verdict: 'differs', ours: 'none', theirs: 'melee touch' });
    expect(SpellFidelity.row('magic_missile', 'magic-missile').dc.verdict).toBe('n/a');
    // A burst made a cone is seen.
    const coned = { ...Canon.abilities.fireball!, area: 'cone' as const };
    expect(SpellFidelity.row('fireball', 'fireball', coned).target.verdict).toBe('differs');
  });
  it('measures a blow\'s chance to hit SRD AC 15, and grades a row in structure, resolution and play identity', () => {
    expect(CreatureFidelity.row('rat').hit).toEqual({ verdict: 'differs', ours: '20%', theirs: '50%' });
    const rows = [...SpellFidelity.rows(), ...CreatureFidelity.rows()];
    // Proved only where the concordance names a focused test: so far the SRD rat's (test/fixed-stat-block).
    expect(rows.filter(r => r.grades.identity === 'proved').map(r => r.id)).toEqual(['rat/cellar']);
    expect(SpellFidelity.row('fireball', 'fireball').grades).toEqual({ structural: 'fail', resolution: 'fail',
      identity: 'unassessed' });
    expect(SpellFidelity.row('magic_missile', 'magic-missile').grades.structural).toBe('pass');
  });
});
