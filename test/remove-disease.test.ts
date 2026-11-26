import { ItemCatalog } from '../src/item-catalog';
import { describe, expect, it } from 'bun:test';
import { Battle } from '../src/arena';
import { Content } from '../src/content';
import { CreatureStore } from '../src/creature-store';
import { FieldUse } from '../src/campaign/field-use';
import { Spellcasting } from '../src/rules/spellcasting';
import type { Fighter } from '../src/model';

// Remove Disease by the SRD's resolution (doc/architecture/mission-22/srd-proving-cases.md, case 42), Orsino's Cure
// Disease: third level, conjuration beside Life, on the caster or one ally, every disease on them ended (every
// condition whose harm is disease: the Diseased, the Infected that the dead's claws leave) and nothing else, in a
// fight or out of one. Its play-identity test.
const c = new Content('remove-disease');
const spell = Content.abilities.find(a => a.id === 'cure_disease')!;
const sick = [{ id: 'disease', remaining: 5 }, { id: 'infected', remaining: 5 }, { id: 'poison', remaining: 5 },
  { id: 'blessed', remaining: 5 }];
const hardy = (f: Fighter): Fighter => ({ ...f, level: 5, hp: 300, maxHp: 300 });
const cleric = (): Fighter => ({ ...hardy(c.character('cleric', 'cleric', 'fighters')), abilities: ['cure_disease'],
  maxSlots: [0, 0, 1], slots: [0, 0, 1], prepared: [[], [], ['cure_disease']], ready: [[], [], ['cure_disease']] });
describe('Remove Disease, by the SRD\'s resolution', () => {
  it('is a third-level conjuration of Life on the caster or one ally', () => {
    expect(spell.spell).toEqual({ tradition: 'divine', level: 3, domain: 'life', school: 'conjuration' });
    expect(spell.effects.map(e => [e.kind, e.target])).toEqual([['remove', 'ally']]);
  });
  it('ends every disease on a companion in a fight, the Diseased and the Infected, and nothing else', () => {
    const warrior = { ...hardy(c.character('warrior', 'warrior', 'fighters')), statuses: sick.map(s => ({ ...s })) };
    const b = new Battle({ id: 'remove', combatants: [cleric(), warrior, hardy(c.character('warrior', 'g1', 'goblins'))],
      abilities: Content.abilities }, 'remove', 200);
    for (let i = 0; i < 40 && b.state.actor !== 'cleric'; i++) {
      b.step(b.legalCommands().find(x => x.ability === 'wait') ?? b.chosen());
    }
    const events = b.step(b.legalCommands().find(x => x.ability === 'cure_disease' && x.target === 'warrior')!);
    expect(events.flatMap(e => e.type === 'remove' ? [e.detail] : []).sort()).toEqual(['disease', 'infected']);
    expect(b.state.combatants.find(f => f.id === 'warrior')!.statuses.map(s => s.id).sort())
      .toEqual(['blessed', 'poison']);
  });
  it('is cast outside a fight as well, from the third level\'s slot', () => {
    const hero = c.createCreature(ItemCatalog.canon, 'hero', { raceId: 'human', classId: 'cleric', traits: ['vitalist'], level: 5 }, 'rd');
    if (!hero.base.abilities.includes('cure_disease')) { hero.base.abilities.push('cure_disease'); }
    Spellcasting.prepare(hero.state, 2, hero.state.prepared![2]![0]!, 'cure_disease');
    hero.state.conditions.push({ id: 'infected', remaining: 3 });
    const store = new CreatureStore(ItemCatalog.canon, [hero]), before = hero.state.slots![2]!;
    FieldUse.perform(store, ['hero'], { ability: 'cure_disease', caster: 'hero', target: 'hero', seed: 'field' });
    expect(store.get('hero').state.conditions.some(s => s.id === 'infected')).toBe(false);
    expect(store.get('hero').state.slots![2]).toBe(before - 1);
  });
});
