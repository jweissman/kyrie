import { describe, expect, it } from 'bun:test';
import '../../src/campaign/node-bundle-source';
import { WorldAssembler } from '../../src/world/world-assembler';
import { RegionWriter } from '../../src/world/region-writer';
import { ModuleParser } from '../../src/lang/module-parser';
import { Content } from '../../src/content';
import { DeclarationParses } from '../../src/lang/declaration-parses';
import { DeclarationShapes } from '../../src/lang/declaration-shapes';
import type { Declared } from '../../src/lang/module-source';

// A declaration filled from its shape is the declaration its own parse makes (AX-04: a new world's Kyr is some fifteen
// hundred shapes filled with its own names and words, parsed once and filled after). Two countries drawn, each of
// their texts read a declaration at a time with nothing kept by its text, so that what is not parsed is filled: the
// module each makes is the module its whole parse makes. The shared rules and adventures are held so in
// test/small/declaration-parses.
describe('a declaration filled from its shape', () => {
  it('marks a string and a drawn name, one mark to a value, and fills them back', () => {
    const shape = DeclarationShapes.of('Observe s2_well at s2_green when lit(s2_green) "The well is deep.".')!;
    expect(shape.text).toBe('Observe qz0zq at qz1zq when lit(qz1zq) "qz2zq".');
    expect(shape.values).toEqual(['s2_well', 's2_green', 'The well is deep.']);
    const field = { field: 'observation', value: { id: 'qz0zq', at: 'qz1zq', text: 'qz2zq', [`qz1zq_x`]: 1 } };
    expect(DeclarationShapes.fill(field, shape.values)).toEqual({ field: 'observation',
      value: { id: 's2_well', at: 's2_green', text: 'The well is deep.', s2_green_x: 1 } });
    // A value its parse let go is no filling.
    expect(DeclarationShapes.fill({ field: 'f', value: 'qz0zq' }, ['a', 'b'])).toBeUndefined();
  });
  it('is what the declaration parses to, in every text of two countries drawn', () => {
    let texts = 0;
    const differ: string[] = [];
    let filled = 0;
    for (const seed of ['shapes-a', 'shapes-b']) {
      filled = DeclarationShapes.fills;
      const vocabulary = Content.vocabulary();
      const files = RegionWriter.files(WorldAssembler.region(seed, [0, 0]), null, {}, Content.vocabulary());
      for (const [name, text] of Object.entries(files)) {
        if (!RegionWriter.readsAsKyr(name)) { continue; }
        const ir = files[`${name}.ir.json`];
        const declared = ir ? (JSON.parse(ir) as { declared: Declared[] }).declared : [];
        DeclarationParses.kept.clear();
        const split = ModuleParser.chunkedWithin(vocabulary.fork(), text, declared),
          whole = ModuleParser.wholeWithin(vocabulary.fork(), text, declared);
        vocabulary.install(whole.catalog);
        texts++;
        if (!split || JSON.stringify(split) !== JSON.stringify(whole)) { differ.push(`${seed} ${name}`); }
      }
    }
    filled = DeclarationShapes.fills - filled;
    expect(differ).toEqual([]);
    expect(texts).toBeGreaterThan(20);
    // Shapes became known, and were filled in the second country.
    expect([...DeclarationShapes.known.values()].filter(v => typeof v === 'object').length).toBeGreaterThan(300);
    expect(filled).toBeGreaterThan(1000);
  }, 60000);
});
