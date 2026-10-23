import { describe, expect, it } from 'bun:test';
import { existsSync, readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import snapshot from '../data/sources/orsino/registry.json';
import ledger from '../data/sources/orsino/adaptations.json';
import { OrsinoCorpus } from '../src/cli/orsino-corpus';
import { OrsinoExtract, type RegistrySnapshot } from '../src/registry/orsino-extract';
import { CatalogLedger } from '../src/registry/catalog-ledger';
import { OrsinoRegistry, type Ledger } from '../src/registry/orsino-registry';
import { OrsinoReport } from '../src/registry/orsino-report';
import { KyrLinks } from '../src/registry/kyr-links';
import { Canon } from '../src/canon/canon';

const registry = new OrsinoRegistry(snapshot as unknown as RegistrySnapshot, CatalogLedger.combined(ledger as Ledger));
const orsino = '../orsino';
const pinned = OrsinoCorpus.available(orsino)
  && execFileSync('git', ['-C', orsino, 'rev-parse', 'HEAD'], { encoding: 'utf8' }).trim() === snapshot.source.revision;

describe('Orsino registry', () => {
  it.skipIf(!pinned)('regenerates byte-for-byte from the pinned Orsino checkout, covering every source table', () => {
    const corpus = OrsinoCorpus.load(orsino);
    expect(() => OrsinoExtract.coverage(corpus)).not.toThrow();
    expect(`${JSON.stringify(OrsinoExtract.snapshot(corpus), null, 1)}\n`)
      .toBe(readFileSync('data/sources/orsino/registry.json', 'utf8'));
  });

  it('preserves stable identifiers, provenance, descriptions and raw definitions', () => {
    const hunter = registry.entry('background:hunter');
    expect(hunter.source).toEqual({ file: 'settings/fantasy/tables.json', tables: ['backgroundModifier'] });
    expect(hunter.definition).toEqual({ dex: 2, wis: 1, con: 1, gp: 15, requiredClass: 'ranger' });
    expect(registry.entry('ancestry:dwarf').references.map(r => r.ref)).toEqual(['trait:sturdy', 'trait:tough']);
    expect(registry.entry('trait:fire_affinity').features).toContain('modifier:immuneBreath');
    expect(snapshot.families.background.count).toBe(215);
    expect(snapshot.families.arcaneSpell.count + snapshot.families.divineSpell.count + snapshot.families.ability.count)
      .toBe(342);
  });

  it('records the save categories, their attributes and the breath weapons exactly as the source defines them', () => {
    expect(registry.entry('rule.saveKind:breath').definition).toMatchObject({ attribute: 'con',
      modifier: 'saveVersusBreath', immunity: 'immuneBreath' });
    expect(registry.entry('rule.saveKind:reflex').definition).toMatchObject({ attribute: 'dex' });
    expect(registry.entry('weapon:fire_breath').definition).toEqual({ damage: '4d6', natural: true, type: 'fire', breath: true });
    expect(registry.entry('dragonColor:red').references.map(r => r.ref)).toEqual(['weapon:fire_breath']);
    const breathSaves = snapshot.entries.filter(e => e.features.includes('save:breath'));
    expect(breathSaves).toEqual([]);
  });

  it('preserves source inconsistencies as unresolved references instead of repairing them', () => {
    expect(registry.entry('weapon:lightning_breath').references)
      .toContainEqual({ field: 'type', ref: 'rule.damageKind:electric', resolved: false });
    expect(registry.entry('arcaneSpell:summon_elemental').shadowedBy).toBe('divineSpell:summon_elemental');
  });

  it('judges rule features conservatively: anything not declared is unsupported', () => {
    expect(OrsinoRegistry.judge('modifier:toHit').judgement).toBe('faithful');
    expect(OrsinoRegistry.judge('modifier:resistFire').judgement).toBe('faithful');
    expect(OrsinoRegistry.judge('modifier:extraTurns').judgement).toBe('unsupported');
    expect(OrsinoRegistry.judge('an:invented feature').judgement).toBe('unsupported');
  });

  it('keeps the adaptation ledger honest: known entries, declared gaps, real Kyr definitions and evidence', () => {
    expect(registry.problems()).toEqual([]);
    expect(KyrLinks.problems(registry.ledger)).toEqual([]);
    for (const record of registry.ledger.records) {
      for (const evidence of record.evidence ?? []) {
        const [file, needle] = evidence.split(/#(.*)/s) as [string, string];
        expect(existsSync(file), evidence).toBe(true);
        expect(readFileSync(file, 'utf8').includes(needle), evidence).toBe(true);
      }
    }
    expect(registry.status('background:hunter')).toBe('play-validated');
    // Every background is compiled from Orsino's row and its kind; the noble is no longer only catalogued.
    expect(registry.status('background:noble')).toBe('executable');
  });

  it('links every canonical entry that cites Orsino to a ledger record, and every link back to its citation', () => {
    const families = { ability: Canon.abilities, ancestry: Canon.ancestries, species: Canon.species,
      class: Canon.classes,
      trait: Canon.traits, background: Canon.backgrounds, item: Canon.items, condition: Canon.conditions,
      domain: Canon.domains, deity: Canon.deities } as Record<string, Record<string, { source?: { orsino?: string } }>>;
    for (const [family, entries] of Object.entries(families)) {
      for (const [id, entry] of Object.entries(entries)) {
        const cited = entry.source?.orsino;
        if (!cited || !registry.has(cited)) { continue; }
        expect(registry.adaptations(cited).some(r => r.kyr.includes(`${family}:${id}`)), `${family}:${id}`).toBe(true);
      }
    }
    for (const record of registry.ledger.records) {
      for (const link of record.kyr) {
        const [family, id] = link.split(/:(.*)/s) as [string, string];
        const entry = families[family]?.[id];
        if (entry?.source?.orsino) { expect(registry.has(entry.source.orsino), link).toBe(true); }
      }
    }
  });

  it('commits a compatibility report that matches the registry, support table and ledger', () => {
    expect(OrsinoReport.render(registry)).toBe(readFileSync('doc/architecture/orsino-coverage.md', 'utf8'));
  });
});
