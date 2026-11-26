import { describe, expect, it } from 'bun:test';
import { readFileSync } from 'node:fs';
import { NameChain } from '../../src/cli/name-chain';
import { SuggestNames } from '../../src/cli/suggest-names';
import { SuggestPaintings } from '../../src/cli/suggest-paintings';
import { SuggestAdventures } from '../../src/cli/suggest-adventures';

// `kyrie suggest` (the owner, 24 November: authors roll up truly new names, duplicates of existing adventures
// excluded, none a prefix or part of one, shorter and well-sounding first; AU-54: the paintings nothing uses, by
// terrain and subject). A chain's names are none it learnt from and none excluded, the same for the same seed; drawn
// for an author, none is a name an adventure or the setting gives already.
describe('kyrie suggest', () => {
  it('draws new names from a chain, none learnt or excluded, the same by its seed', () => {
    const learnt = SuggestNames.corpus({ kind: 'given', people: 'human', sex: 'she' }), chain = new NameChain(learnt);
    const names = chain.draw(6, NameChain.random('x'), new Set(['abel']));
    expect(names.length).toBe(6);
    expect(names.filter(n => [...learnt, 'Abel'].some(l => l.toLowerCase() === n.toLowerCase()))).toEqual([]);
    expect(chain.draw(6, NameChain.random('x'), new Set(['abel']))).toEqual(names);
  });
  it('offers no beginning or part of a name given, nor one that holds one, and the shorter and smoother first', () => {
    const learnt = SuggestNames.corpus({ kind: 'given', people: 'human' }), chain = new NameChain(learnt);
    const given = [...learnt.map(n => n.toLowerCase()), 'abel'], ranked = chain.ranked(12, NameChain.random('y'));
    expect(ranked.filter(([n]) => given.some(e => e.startsWith(n.toLowerCase()) || e.includes(n.toLowerCase())
      || e.length >= 4 && n.toLowerCase().includes(e))).map(([n]) => n)).toEqual([]);
    expect(ranked.map(([, s]) => s)).toEqual(ranked.map(([, s]) => s).sort((a, b) => b - a));
    // Shorter and smoother than the chain draws unranked: three consonants together, or a long name, scores less.
    expect(chain.score('Hobin')).toBeGreaterThan(chain.score('Hobrstinnelda'));
  });
  it('gives an author names that no adventure and no table of the setting gives', () => {
    const taken = SuggestNames.excluded();
    for (const ask of [{ kind: 'given', people: 'human' }, { kind: 'given', people: 'dwarf' }, { kind: 'family', people: 'human' },
      { kind: 'place', people: 'human' }, { kind: 'family', people: 'human', like: 'quittance' }] as const) {
      const names = SuggestNames.draw(ask, { count: 8, seed: 'spec' });
      expect(names.length).toBeGreaterThan(4);
      expect(names.filter(n => taken.has(n.toLowerCase()))).toEqual([]);
    }
  });
  it('finds the paintings of places nothing uses, by terrain and subject', () => {
    const desert = SuggestPaintings.all().filter(p => p.terrain === 'desert');
    expect(desert.find(p => p.id === 'scene-desert-arch')).toMatchObject({ subject: 'wonder', used: false });
    expect(desert.find(p => p.id === 'scene-desert-oasis')?.used).toBe(true);
    expect(SuggestPaintings.report('desert')[0]).toMatch(/^desert: \d+ paintings, \d+ unused$/);
  });
  it('reads an adventure\'s shape from its Kyr, and suggests the least written of first', () => {
    const counts = SuggestAdventures.count(['  Person wet "the Wet" at leak {', '    Species mud_elemental.',
      '  }', '  Person ann "Ann" at hall {', '    Peaceable.', '  }', '  Discovery seen "x".', '  Topic t "y" {}'].join('\n'));
    expect([counts.combat, counts.investigation, counts.talk, counts.wonder]).toEqual([1, 1, 1, 0]);
    const shapes = SuggestAdventures.shapes();
    expect(shapes.length).toBeGreaterThan(30);
    // A Wonder is declared by few, and none holds enough of them for a wonder-tranche (Windfall's orchard, the Going
    // Bank's breathing wall, the Tail-Race's lit loch, Wet Drusilla's jars under the Silver, Over Exall's whale and the
    // Cleave's Cerise, the Mother glowing in her silk under the hub, the first).
    expect(shapes.filter(s => s.counts.wonder > 0).map(s => s.id)).toEqual(['cleave', 'goingbank', 'overexall',
      'tailrace', 'wetdrusilla', 'windfall']);
    expect(SuggestAdventures.report().join('\n')).toContain('a wonder-tranche: 0 of');
  });
  it('counts the owner\'s paintings by terrain and subject, the list of those wanted kept as it reads', () => {
    const table = SuggestPaintings.needed();
    expect(table[0]).toContain('| shelter | overview | town | city | wild | wonder |');
    expect(SuggestPaintings.principal.every(t => table.some(r => r.startsWith(`| ${t} |`)))).toBe(true);
    const text = readFileSync(SuggestPaintings.list, 'utf8');
    const kept = text.slice(text.indexOf('<!-- by-terrain -->') + 19, text.indexOf('<!-- /by-terrain -->')).trim();
    // Stale where the paintings changed and the list was not written again: `bin/kyrie suggest paintings --write`.
    expect(kept).toBe(table.join('\n'));
  });
});
