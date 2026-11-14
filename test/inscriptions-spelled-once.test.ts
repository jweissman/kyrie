import { describe, expect, it } from 'bun:test';
import { WorldAssembler } from '../src/world/world-assembler';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';

// A name cut in a drawn country's stone is spelled one way (the cold playtest's CO-04: MARMORISCAVUS over the cave
// mouth and MARMORISCAW two lines later). Every word cut in capitals across the country's written Kyr, grouped by
// its first seven letters; a plural's S aside, a group of two spellings is one name cut twice, differently. The
// works' old names had been taken from the folk's worn-down form in one place and the makers' own in another.
describe('a name cut in the old stone', () => {
  it('is spelled one way wherever it is cut', async () => {
    for (const seed of ['a1', 'thorn']) {
      const w = await WorldAssembler.assemble(seed, NodeBundleSource.shared, {});
      const files = (w.source as unknown as { files: Map<string, string> }).files;
      const cut = new Map<string, Set<string>>();
      for (const text of files.values()) {
        for (const m of text.matchAll(/\b[A-Z]{7,}\b/g)) {
          const word = m[0].replace(/S$/, '');
          (cut.get(word.slice(0, 7)) ?? cut.set(word.slice(0, 7), new Set()).get(word.slice(0, 7))!).add(word);
        }
      }
      expect([...cut.values()].filter(s => s.size > 1).map(s => [...s].join(' / ')), seed).toEqual([]);
    }
  }, 120_000);
});
