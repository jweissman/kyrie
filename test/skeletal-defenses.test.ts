import { ItemCatalog } from '../src/item-catalog';
import { describe, expect, it } from 'bun:test';
import { Content } from '../src/content';
import { Canon } from '../src/canon/canon';
import { CreatureVariants } from '../src/creature-variants';
import { KindDefenses } from '../src/kind-defenses';
import { RegionStock } from '../src/world/region-stock';
import type { EffectContext } from '../src/effects';

// The SRD skeleton template's defenses on Kyr's skeletal (doc/architecture/mission-22/srd-proving-cases.md, case 53):
// damage reduction 5/bludgeoning and immunity to cold, on every skeletal kind, by an alias (the bone hound) or a
// template (the Bound Howe's mounts); a first den's skeletal pair held without them (skeletal_held), until a blunt
// weapon is on offer in the first town.
const c = new Content('skeletal');
const context = {} as EffectContext;
const struck = (raceId: string, type: string) =>
  KindDefenses.mitigate(c.creature(raceId, 'b', 'goblins', 1), { amount: 9, bonus: 0, type }, context).amount;
describe('the skeleton\'s defenses', () => {
  it('turn five of a blade\'s or a point\'s blow, none of a club\'s, and all of cold, from a bone hound', () => {
    expect([struck('bone_hound', 'slashing'), struck('bone_hound', 'piercing'), struck('bone_hound', 'bludgeoning'),
      struck('bone_hound', 'cold'), struck('bone_hound', 'fire')]).toEqual([4, 4, 9, 0, 9]);
  });
  it('are a template\'s too: a horse made skeletal is the skeletal horse, with them', () => {
    const horse = c.createCreature(ItemCatalog.canon, 'h', { raceId: 'horse', template: 'skeletal', level: 4 });
    expect(horse.raceId).toBe('horse/skeletal');
    expect(Canon.creature(horse.raceId).defenses).toContainEqual({ kind: 'immunity', to: ['cold'] });
  });
});
describe('a first den\'s skeletal pair, held', () => {
  it('is the same kind without them, never drawn as a template', () => {
    expect(RegionStock.held('bone_hound')).toBe('bone_hound_held');
    expect(RegionStock.held('wolf')).toBe('wolf');
    expect([struck('bone_hound_held', 'slashing'), struck('bone_hound_held', 'cold')]).toEqual([9, 9]);
    expect(CreatureVariants.templates).toContain('skeletal');
    expect(CreatureVariants.templates).not.toContain('skeletal_held');
  });
});
