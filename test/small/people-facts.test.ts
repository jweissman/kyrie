import { describe, expect, it } from 'bun:test';
import { CompanyChapters } from '../../src/handbook/phb-company';
import { StatBlock } from '../../src/handbook/stat-block';
import { CatalogContext } from '../../src/item-catalog';

// An ancestry's entry is a stat block (the owner, 18 November, OR-83: "Ancestries especially seem like they need a SRD
// style stat block"): its qualities, build, ages, where it lives, its tongue and its names, beside how it looks; and a
// calling's entry says what the calling is in the world, beside what it does in a fight.
describe('the encyclopedia\'s peoples and callings', () => {
  it('give every ancestry its build, ages, look and country, and the human tongue as Common', () => {
    const entries = CompanyChapters.ancestries().entries ?? [];
    for (const e of entries) {
      const facts = new Map(e.facts);
      expect([e.id, ['Build', 'Ages'].filter(f => !facts.has(f))]).toEqual([e.id, []]);
      // Its qualities as the six, drawn as the stat block's row (StatBlock).
      expect(e.abilities).toBeDefined();
      expect(StatBlock.html(e, x => x)).toContain('<b>STR</b>');
      // These peoples can appear in the deeper world without being settled in the towns' regional mix.
      expect([e.id, facts.has('Folk of') || facts.has('Lives among others in') || e.id === 'ancestry:goblin'
        || e.id === 'ancestry:glimmerkin' || e.id === 'ancestry:gnoll'
        || e.id === 'ancestry:minotaur']).toEqual([e.id, true]);
      // Its description, and under their heads how it looks and how it lives together (OR-1801).
      expect([e.id, e.text?.length, e.parts?.map(([h]) => h)]).toEqual([e.id, 1, ['How they look', 'How they live']]);
    }
    const human = new Map(entries.find(e => e.id === 'ancestry:human')!.facts);
    expect(human.get('Tongue')).toMatch(/^Common/);
    expect(new Map(entries.find(e => e.id === 'ancestry:dwarf')!.facts).get('Tongue')).toBe('Khuzdul');
  });
  it('give every calling its life in the world', () => {
    for (const e of CompanyChapters.callings(CatalogContext.canon).entries ?? []) {
      expect([e.id, e.text?.length]).toEqual([e.id, 2]);
    }
  });
});
