import { describe, expect, it } from 'bun:test';
import { AbilityUse } from '../src/ability-use';
import { Canon } from '../src/canon/canon';
import { Content } from '../src/content';
import { Effects, type EffectContext } from '../src/effects';
import { Expressions } from '../src/expressions';
import type { CombatEvent, Fighter } from '../src/model';

// A venom has one chance (CB-14, the lead's ruling, 13 November): where an act lays a condition on by itself (a
// venomous bite's poison, against its save), the harm's own kind does not also trigger that condition's save; harm of
// the kind from anything else (a trap's poison, a blow of no venom) triggers it as ever.
describe('a venomous bite', () => {
  const content = new Content('one-venom'), bite = Content.abilities.find(a => a.id === 'venomous_bite')!;
  const triggered = (events: CombatEvent[]) => events.filter(e => e.type === 'save' && e.against === 'poison'
    && e.difficulty === Canon.rules.combat.triggerSave);
  const fought = (n: number) => {
    const spider = content.creature('spider', 's', 'goblins');
    const hero: Fighter = { ...content.character('warrior', 'h', 'fighters'), hp: 200, maxHp: 200 };
    const events: CombatEvent[] = [], context = { actor: spider, fighters: [spider, hero], turn: 1, events, content,
      abilities: Content.abilities.map(a => a.id), retreat: false, location: null } as EffectContext;
    AbilityUse.perform(bite, hero.id, new Expressions(`bite-${n}`), context);
    return events;
  };
  it('poisons by its own save alone, never by its poison damage\'s trigger as well', () => {
    const all = Array.from({ length: 30 }, (_, n) => fought(n));
    expect(all.flatMap(triggered)).toEqual([]);
    expect(all.some(events => events.some(e => e.type === 'save' && e.kind === 'fortitude'))).toBe(true);
  });
  it('leaves poison damage from anything else triggering it', () => {
    const hero: Fighter = { ...content.character('warrior', 'h', 'fighters'), hp: 200, maxHp: 200 };
    const events: CombatEvent[] = [], context = { fighters: [hero], turn: 1, events, content, abilities: [],
      retreat: false, location: null, expressions: new Expressions('trap'), source: { id: 'trap', kind: 'trap' } } as EffectContext;
    Effects.damage(hero, { amount: 5, type: 'poison' }, context);
    expect(triggered(events).length).toBe(1);
  });
});
