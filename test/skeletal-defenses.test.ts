import { describe, expect, it } from 'bun:test';
import { Content } from '../src/content';
import { Canon } from '../src/canon/canon';
import { CreatureVariants } from '../src/creature-variants';
import { KindDefenses } from '../src/kind-defenses';
import type { EffectContext } from '../src/effects';

// The SRD skeleton template's defenses on Kyr's skeletal (doc/architecture/mission-22/srd-proving-cases.md, case 53):
// damage reduction 5/bludgeoning and immunity to cold, on a skeletal kind of the fourth level or more, by its kind
// (the bone hound) or a template; one made for a company of the first three levels held without them (SkeletalHold:
// skeletal_held, Orsino's Bone Resilience), until a blunt weapon is on offer in the first town.
const c = new Content('skeletal');
const context = {} as EffectContext;
const struck = (raceId: string, type: string, level = 5) =>
  KindDefenses.mitigate(c.creature(raceId, 'b', 'goblins', level), { amount: 9, bonus: 0, type }, context).amount;
describe('the skeleton\'s defenses', () => {
  it('turn five of a blade\'s or a point\'s blow, none of a club\'s, and all of cold, from a fifth-level bone hound', () => {
    expect([struck('bone_hound', 'slashing'), struck('bone_hound', 'piercing'), struck('bone_hound', 'bludgeoning'),
      struck('bone_hound', 'cold'), struck('bone_hound', 'fire')]).toEqual([4, 4, 9, 0, 9]);
  });
  it('are a template\'s too: a fifth-level horse made skeletal is the skeletal horse, with them', () => {
    const horse = c.createCreature('h', { raceId: 'horse', template: 'skeletal', level: 5 });
    expect(horse.raceId).toBe('horse/skeletal');
    expect(Canon.creature(horse.raceId).defenses).toContainEqual({ kind: 'immunity', to: ['cold'] });
  });
});
describe('a skeletal kind made for a company of the first three levels, held', () => {
  it('is the same kind without them at the third level and below, by its kind or a template, never drawn', () => {
    expect([struck('bone_hound', 'slashing', 3), struck('bone_hound', 'cold', 1)]).toEqual([9, 9]);
    const wolf = c.createCreature('w', { raceId: 'wolf', template: 'skeletal', level: 2 });
    expect([wolf.raceId, wolf.variations]).toEqual(['wolf', ['skeletal_held']]);
    expect(CreatureVariants.templates).toContain('skeletal');
    expect(CreatureVariants.templates).not.toContain('skeletal_held');
  });
});
