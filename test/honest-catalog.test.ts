import { describe, expect, it } from 'bun:test';
import monsters from '../data/catalog/monsters.json';
import { Canon } from '../src/canon/canon';
import { CanonRuntime } from '../src/canon/canon-runtime';
import { CanonValidation } from '../src/canon/canon-validation';
import { CatalogFields } from '../src/canon/catalog-fields';
import { Content } from '../src/content';
import { Creation } from '../src/rules/creation';
import type { Species } from '../src/canon/schema';

// The honest catalog (the SRD adaptation briefing, increment A, §14): what a record says is what Kyr does with it.
describe('a field nothing reads', () => {
  it('is in no record of the catalogs', () => {
    expect(CatalogFields.problems()).toEqual([]);
  });
  it('fails the canon\'s load: the unicorn as it was written, with its inert dr and resist', () => {
    const written = structuredClone(monsters.species.unicorn) as unknown as Record<string, unknown>;
    delete written.defenses;
    Object.assign(written, { dr: { magic: 10 }, resist: { acid: 10, cold: 10, electricity: 10 } });
    const species = Canon.species as Record<string, Species>;
    species.t_old_unicorn = written as unknown as Species;
    try {
      expect(CanonValidation.problems().filter(p => p.startsWith('species t_old_unicorn'))).toEqual([
        'species t_old_unicorn: unknown field dr', 'species t_old_unicorn: unknown field resist']);
    } finally { delete species.t_old_unicorn; }
  });
  it('fails in what a record holds too: a weapon\'s stats, a body\'s statistics, a source', () => {
    const species = Canon.species as Record<string, Species>, wolf = Canon.creature('wolf');
    species.t_wolf = { ...wolf, statistics: { ...wolf.statistics!, hp: 9 } as never,
      source: { ...wolf.source, srd: 'wolf' } as never };
    try {
      expect(CatalogFields.problems()).toEqual(['species t_wolf statistics: unknown field hp',
        'species t_wolf source: unknown field srd']);
    } finally { delete species.t_wolf; }
  });
  it('and a defense of the wrong shape fails, rather than lying inert', () => {
    const species = Canon.species as Record<string, Species>;
    species.t_wolf = { ...Canon.creature('wolf'), defenses: [{ kind: 'reduction', amount: 5, unless: ['silvery'] },
      { kind: 'resistance', to: ['fire'], amount: 5, mode: 'flat', bypass: true } as never] };
    try {
      expect(CanonValidation.problems().filter(p => p.startsWith('species t_wolf'))
        .map(p => p.replace(/defense \{.*\}/, 'defense'))).toEqual([
        'species t_wolf: defense: unknown attack tag silvery', 'species t_wolf: defense: unknown field bypass']);
    } finally { delete species.t_wolf; }
  });
});

// An ability whose record has nothing Kyr can execute is reference only: in the catalog (the Encyclopedia says what
// it is), never learned, prepared, granted or offered. Chain Lightning and Goodberry are two of the twelve.
describe('a reference-only ability', () => {
  const referenceOnly = Object.keys(Canon.abilities).filter(id => CanonRuntime.referenceOnly(id)).sort();
  it('is every ability with no effect but the moves the rules resolve themselves', () => {
    expect(referenceOnly).toEqual(['chain_lightning', 'create_poison', 'dispel_magic', 'electric_arc', 'goodberry',
      'image', 'minor_image', 'plane_shift', 'shock_pulse', 'static_shock', 'weird', 'zephyrwild']);
    expect(CanonRuntime.referenceOnly('wait')).toBe(false);
  });
  it('is not offered in a fight, learned, granted or prepared', () => {
    const ids = new Set(Content.abilities.map(a => a.id));
    for (const id of referenceOnly) {
      expect([id, ids.has(id), Creation.executable(id)]).toEqual([id, false, false]);
      const spell = Canon.abilities[id]!.spell;
      if (spell) { expect(Creation.spellbook(spell.tradition, spell.level)).not.toContain(id); }
    }
    const taught = new Content('reference-only').createCreature('m', { raceId: 'human', classId: 'mage',
      abilities: ['chain_lightning', 'goodberry'] });
    expect(taught.base.abilities).not.toContain('chain_lightning');
    expect(taught.base.abilities).not.toContain('goodberry');
  });
});

// The ratchet (§14): no playable ability does nothing, and what the catalogs record they cannot run may not grow
// without this number, and the briefing, being changed with it. Counted after Orsino's generated records and Kyr's
// hand-written ones are merged, as the canon reads them: the keys of every `unsupported` record.
const UNSUPPORTED_LEDGER = 100;
describe('the ratchet', () => {
  it('has no playable ability that does nothing', () => {
    expect(Content.abilities.filter(a => !a.effects.length && a.id !== 'wait').map(a => a.id)).toEqual([]);
  });
  it('has no more unsupported mechanics than it had', () => {
    const families = [Canon.abilities, Canon.conditions, Canon.traits, Canon.items] as Record<string,
      { unsupported?: object }>[];
    const count = families.reduce((n, f) => n + Object.values(f)
      .reduce((m, e) => m + Object.keys(e.unsupported ?? {}).length, 0), 0)
      + Object.values(Canon.domains).reduce((n, d) => n + Object.keys(d.blessing?.unsupported ?? {}).length, 0);
    expect(count).toBeLessThanOrEqual(UNSUPPORTED_LEDGER);
  });
});
