import { describe, expect, it } from 'bun:test';
import { NameChain } from '../../src/cli/name-chain';
import { SuggestNames } from '../../src/cli/suggest-names';
import { SuggestPaintings } from '../../src/cli/suggest-paintings';

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
});
