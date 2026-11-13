import { afterAll, describe, expect, it } from 'bun:test';
import { AbilityUse } from '../src/ability-use';
import { Canon } from '../src/canon/canon';
import { CanonValidation } from '../src/canon/canon-validation';
import { LocalKinds } from '../src/canon/local-catalog';
import { CombatProjection } from '../src/combat-projection';
import { Content } from '../src/content';
import { CreatureSchema } from '../src/creature';
import { Expressions } from '../src/expressions';
import type { EffectContext } from '../src/effects';
import type { CombatEvent, Fighter } from '../src/model';

// An item as form × material (engine-pressure.md, section 3): a longsword carried as silver is the longsword made of
// silver (data/catalog/materials.json), and a blade of it carries what silver passes, into the guard's `unless`
// (Defenses); no arms item is added, no loot table or market touched. Against a kind written for this spec alone
// (t_shade, 10 off a blow unless silver), a silvered longsword's blow comes through whole and is told as silver
// passing; the same longsword of its own steel loses ten.
LocalKinds.install({ species: { t_shade: { ...Canon.creature('wolf'), name: 'Shade',
  defenses: [{ kind: 'reduction', amount: 10, unless: ['silver'] }], source: { kyr: true } } } });
afterAll(() => LocalKinds.reset());
const content = new Content('materials-bite');
const carrying = (material?: string) => {
  const c = content.createCreature('h', { raceId: 'human', classId: 'warrior', level: 5 });
  c.state.inventory = [...(c.state.inventory ?? []).filter(i => !Canon.items[i.definition]?.weapon),
    { id: 'h__blade', definition: 'longsword', equipped: true, ...material ? { material } : {} }];
  return c;
};
const armed = (material?: string): Fighter => CombatProjection.fighter(carrying(material), 'fighters');
const struck = (material?: string) => {
  for (let n = 0; n < 40; n++) {
    const hero = armed(material), shade: Fighter = { ...content.creature('t_shade', 's', 'goblins'), hp: 99, maxHp: 99 };
    const events: CombatEvent[] = [], context = { actor: hero, fighters: [hero, shade], turn: 1, events, content,
      abilities: [], retreat: false, location: null, expressions: new Expressions(`blade-${n}`) } as EffectContext;
    if (AbilityUse.attack(hero, shade, context, false)) { return events.find(e => e.type === 'damage'); }
  }
  throw new Error('never hit');
};

describe('a longsword of silver', () => {
  it('carries silver, and its blow passes a guard only silver passes, told so', () => {
    expect(armed('silver').equipment.weapon.tags).toContain('silver');
    const blow = struck('silver');
    expect(blow?.type === 'damage' && blow.modifiers?.bypassed).toEqual([{ defense: 'reduction', amount: 10, by: 'silver' }]);
  });
  it('of its own steel carries nothing of it, and the guard turns ten', () => {
    expect(armed().equipment.weapon.tags ?? []).not.toContain('silver');
    const blow = struck();
    expect(blow?.type === 'damage' && blow.modifiers?.reduction).toBe(10);
  });
  it('refuses a material that passes nothing a guard can name, and a carried thing of no material', () => {
    const silver = Canon.materials.silver!, was = silver.passes;
    silver.passes = 'moonlight';
    try {
      expect(CanonValidation.problems().filter(p => p.startsWith('material silver')))
        .toEqual(['material silver: passes unknown attack tag moonlight']);
    } finally { silver.passes = was; }
    expect(() => CreatureSchema.validate(carrying('mithril'))).toThrow('Invalid item inventory');
    expect(() => CreatureSchema.validate(carrying('silver'))).not.toThrow();
  });
});
