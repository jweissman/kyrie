import { describe, expect, it } from 'bun:test';
import { WorldAssembler } from '../src/world/world-assembler';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { ModuleParser } from '../src/lang/module-parser';
import { LocalKinds } from '../src/canon/local-catalog';

// A generated country is written in several files, each read on its own, in order. Found measuring the browser:
// Begin on wren failed ("names a kind missing from the item catalog: abbey_chalice") and the page stayed on the
// creation page. Its files were cut by size, not by site, and one placed a kind of the country's own before the file
// that declared it; only kinds left over from another start had let it be read at all. The country's own kinds are
// now declared in its first file.
describe('a generated country', () => {
  it('is read file by file, in order, with no kinds but its own', async () => {
    const failed: string[] = [];
    for (const seed of ['wren', 'thorn', 'a1', 'd4', 'cov7']) {
      const w = await WorldAssembler.assemble(seed, NodeBundleSource.shared,
        { origin: 'kin', party: [{ name: 'Wenna', raceId: 'dwarf', classId: 'warrior' }] });
      const region = w.source.resolve(`world-${seed}/region/module.json`);
      const files = (JSON.parse(await w.source.read(region)) as { source: string[] }).source;
      LocalKinds.reset();
      for (const file of files) {
        try { ModuleParser.parse(await w.source.read(w.source.resolve(file, region))); }
        catch (error) { failed.push(`${seed} ${file}: ${(error as Error).message}`); }
      }
    }
    expect(failed).toEqual([]);
  }, 240000);
});
