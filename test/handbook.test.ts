import { describe, expect, it } from 'bun:test';
import { resolve } from 'node:path';
import { Canon } from '../src/canon/canon';
import { Handbooks } from '../src/handbook/handbooks';
import { PlayChapters } from '../src/handbook/phb-play';
import { HandbookStatus } from '../src/handbook/model';
import { CapabilityAudit } from '../src/handbook/audit';

// The handbooks are views of the definitions the game plays from: every definition appears once with the status the
// catalog gives it, a spell nobody can cast says so, and nothing points at an entry that is in no book.
const handbooks = new Handbooks(resolve(import.meta.dir, '..'));
const index = handbooks.index();
const coverage = handbooks.coverage();

describe('the handbooks', () => {
  it('list every playable definition the game has', () => {
    const expected = [
      ...Object.keys(Canon.ancestries).map(id => `ancestry:${id}`),
      ...Object.entries(Canon.classes).filter(([, c]) => c.playable).map(([id]) => `class:${id}`),
      ...Object.keys(Canon.backgrounds).map(id => `background:${id}`),
      ...Object.keys(Canon.species).map(id => `species:${id}`),
      ...Object.keys(Canon.conditions).map(id => `condition:${id}`),
      ...Object.keys(Canon.skills).map(id => `skill:${id}`),
      ...Object.keys(Canon.abilities).map(id => `ability:${id}`),
      ...Object.keys(Canon.items).filter(id => !Canon.items[id]!.weapon?.natural).map(id => `item:${id}`)];
    expect(expected.filter(id => !index.has(id))).toEqual([]);
  });
  it('give each catalog entry the status its definition records', () => {
    for (const [id, a] of Object.entries(Canon.abilities)) {
      const placed = index.get(`ability:${id}`)!;
      if (a.unsupported) { expect(placed.status).toBe('unsupported'); }
      else { expect(['faithful', 'adapted', 'kyr', 'unreachable']).toContain(placed.status); }
    }
    expect(index.get('species:wolf')!.status).toBe(HandbookStatus.of(Canon.species.wolf!));
  });
  it('reach ninth-level spells, and would mark a spell above every calling\'s slots unreachable', () => {
    expect(PlayChapters.reach()).toBe(9);
    expect(coverage.problems.filter(p => p.kind === 'unreachable' && p.entry.startsWith('ability:'))).toEqual([]);
    expect(PlayChapters.spell('death_wave', 8).status).toBe('unreachable');
    expect(PlayChapters.spell('weird', 8).status).toBe('unsupported');
    expect(PlayChapters.spell('fireball', 3).status).toBe('unreachable');
  });
  it('point only at entries some book has', () => {
    expect(coverage.problems.filter(p => p.kind === 'missing reference')).toEqual([]);
  });
  it('describe executable abilities from their mechanics', () => {
    const phb = Handbooks.all(handbooks.books.find(b => b.id === 'phb')!.sections);
    const fireball = phb.find(e => e.id === 'ability:fireball')!;
    expect(fireball.rules!.join(' ')).toContain('fire damage');
    expect(phb.filter(e => e.id.startsWith('ability:') && e.status === 'faithful' && !e.rules?.length)).toEqual([]);
  });
  it('account for every definition of Orsino\'s creature families', () => {
    for (const family of ['monsterClass', 'monsterType', 'animal', 'elemental', 'plane', 'trap', 'wonder']) {
      const total = handbooks.registry.snapshot.entries.filter(e => e.family === family).length;
      expect(coverage.entries.filter(e => e.id.startsWith(`orsino:${family}:`)).length).toBe(total);
    }
    expect(index.get('orsino:animal:wolf')!.status).toBe('represented');
    expect(index.get('orsino:plane:arcadia')?.status ?? 'data-only').toBe('data-only');
  });
  it('say what each rules module declares, from its source', () => {
    const dmg = Handbooks.all(handbooks.books.find(b => b.id === 'dmg')!.sections);
    const seized = dmg.find(e => e.id === 'rule:dominion.seized')!;
    expect(seized.text!.join(' ')).toContain('vacant(?site)');
    expect(dmg.find(e => e.id === 'rule:dominion.tolls')!.rules!.join(' ')).toContain('toll');
  });
  it('count every entry in coverage.json once per book', () => {
    for (const book of handbooks.books) {
      const counts = coverage.books[book.id].counts;
      const placed = coverage.entries.filter(e => e.book === book.id).length;
      expect(Object.values(counts).reduce((a, n) => a + n, 0)).toBe(placed);
    }
  });
  it('ground every family of the capability audit in entries of the books', () => {
    const audit = CapabilityAudit.read(resolve(import.meta.dir, '..'));
    expect(audit.families.length).toBe(10);
    for (const f of audit.families) {
      const total = Object.values(CapabilityAudit.counts(f, coverage)).reduce((a, n) => a + n, 0);
      expect(`${f.id}: ${total > 0}`).toBe(`${f.id}: true`);
      expect((f.entries ?? []).filter(id => !index.has(id))).toEqual([]);
      for (const q of CapabilityAudit.questions) { expect((f[q[0]] as string).length).toBeGreaterThan(20); }
    }
  });
});
