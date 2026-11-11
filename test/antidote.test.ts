import { describe, expect, it } from 'bun:test';
import { parseAbility } from '../src/lang/parse';
import { ItemCatalog } from '../src/item-catalog';

// An antidote given in a fight does its work: a bite lays the fight's poison (Orsino's, which ends with the fight),
// and the antidote had taken away only the world's poisoned, "to no effect" on a bitten companion (round 7).
describe('an antidote', () => {
  it('takes away both the world\'s poisoned and the fight\'s poison', () => {
    const def = ItemCatalog.get('antidote'), ability = parseAbility('antidote', def.name, def.use!);
    const removes = JSON.stringify(ability.effects);
    expect(removes).toContain('"poisoned"');
    expect(removes).toContain('"poison"');
  });
});
