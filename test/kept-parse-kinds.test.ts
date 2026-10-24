import { describe, expect, it } from 'bun:test';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { PlaySession } from '../src/session/play-session';
import { LocalKinds } from '../src/canon/local-catalog';
import { ModuleParser } from '../src/lang/module-parser';
import { ItemCatalog } from '../src/item-catalog';

// A kind declared in one file of a module is a kind of thing for the next, however the first came to be read. Found
// measuring the browser: Begin on wren failed ("names a kind missing from the item catalog: abbey_chalice"), and
// the page stayed on the creation page. Two of wren's works leave the same chalice, declared in one file of the
// region and placed in another; the files are read while the player reads the page, and a parse already made is
// kept. Kept, it no longer declared its kinds, and the file after it, read again, found its kind missing.
describe('a kind declared in one file of a module', () => {
  it('is known to the next file, though the first was read before and kept', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'kyrie-kinds-'));
    const site = (more: string) => `Module localkind "Two files" {
  Place field "a field" is wilderness.
  Place barley "the barley" is room within field at 0, 0.
  Company party "You" of 1 at barley.
  Item ox "a little ox of dreg" is dreg_ox at barley.${more}
}`;
    try {
      writeFileSync(join(dir, 'kinds.kyr'), 'Module localkind "Two files" {\n'
        + '  Kind dreg_ox "a little ox of dreg, on a cord" is treasure worth 2 weighing 1.\n}');
      writeFileSync(join(dir, 'site.kyr'), site(''));
      writeFileSync(join(dir, 'module.json'), JSON.stringify({ version: 1, source: ['kinds.kyr', 'site.kyr'],
        rules: ['world'], globals: ['party'], exports: { party: 'party' } }));
      writeFileSync(join(dir, 'probe.campaign.json'), JSON.stringify({ version: 1, name: 'Probe: kept kinds',
        modules: [{ id: 'p', bundle: 'module.json' }], party: [{ name: 'Ama', raceId: 'human', classId: 'warrior' }] }));
      const path = join(dir, 'probe.campaign.json');
      await PlaySession.start(path, 'kinds', NodeBundleSource.shared);
      // Another start meanwhile puts its own kinds in place of these; then this one is begun again, its first file
      // kept as it was read, the other read afresh.
      LocalKinds.reset();
      writeFileSync(join(dir, 'site.kyr'), site('\n  // read again'));
      const again = await PlaySession.start(path, 'again', NodeBundleSource.shared);
      expect(again.campaign.module.entities.some(e => e.id === 'p__ox')).toBe(true);
    } finally { rmSync(dir, { recursive: true, force: true }); }
  }, 60000);
  // The parser keeps what it has read too: what it gives back declares its kinds again.
  it('is declared again by the parser when it gives back a text it read before', () => {
    const text = 'Module localkind "One file" {\n  Kind dreg_ox "a little ox of dreg" is treasure worth 2 weighing 1.\n}';
    ModuleParser.parse(text);
    LocalKinds.reset();
    expect(ItemCatalog.definitions.dreg_ox).toBeUndefined();
    ModuleParser.parse(text);
    expect(ItemCatalog.definitions.dreg_ox?.name).toBe('a little ox of dreg');
  });
});
