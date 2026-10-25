import { describe, expect, it, spyOn } from 'bun:test';
import { ModuleParser } from '../src/lang/module-parser';
import { ModuleBundle } from '../src/campaign/module-bundle';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { OverlayBundleSource } from '../src/campaign/overlay-bundle-source';
import { Canon } from '../src/canon/canon';
import { LocalKinds } from '../src/canon/local-catalog';

// A module read ahead of its being drawn into the game in play (the country beyond a march, while the player reads)
// is parsed then, and found parsed when it is loaded; but the kinds of its own it declares are not left in the
// catalogs meanwhile, for a country never gone to has none in this world. (The probe declares a little ox of dreg,
// and a jar of the day like the old glossary.)
describe('a module prepared ahead', () => {
  it('leaves its own kinds out of the catalogs until it is loaded, and is loaded as it would have been', async () => {
    LocalKinds.reset();
    // A copy of the probe under a path no other spec reads, so that this one is the first to parse it.
    const base = NodeBundleSource.shared, text = await base.read(base.resolve('test/fixtures/probes/local-kind/site.kyr'));
    const files = { 'ahead/module.json': await base.read(base.resolve('test/fixtures/probes/local-kind/module.json')),
      'ahead/site.kyr': `${text}\n// read ahead` };
    const source = new OverlayBundleSource(base, files), path = source.resolve('ahead/module.json');
    await ModuleBundle.prepare(path, source);
    expect(Canon.items.dreg_ox).toBeUndefined();
    expect(Canon.items.day_jar).toBeUndefined();
    // Loaded, it is not parsed again: it was parsed ahead.
    const parse = spyOn(ModuleParser, 'parse');
    const draft = await ModuleBundle.load({ id: 'p', bundle: path }, { seed: 'ahead' }, source).finally(() => {
      expect(parse.mock.calls.some(([t]) => t === files['ahead/site.kyr'])).toBe(false);
      parse.mockRestore();
    });
    expect(Canon.items.dreg_ox?.name).toBe('a little ox of dreg, on a cord');
    expect(draft.instance.module.entities.some(e => e.id === 'p__dreg_ox' || e.id === 'dreg_ox')).toBe(true);
    LocalKinds.reset();
  });
  it('takes out only what was joined while it was read', () => {
    LocalKinds.reset();
    const kind = LocalKinds.item('kept', { id: 'kept_cup', name: 'a kept cup', base: { category: 'treasure' } });
    LocalKinds.install({ items: { kept_cup: kind } });
    LocalKinds.aside(() => {
      LocalKinds.install({ items: { read_cup: LocalKinds.item('read', { id: 'read_cup', name: 'a cup read ahead',
        base: { category: 'treasure' } }) } });
      expect(Canon.items.read_cup?.name).toBe('a cup read ahead');
    });
    expect(Canon.items.read_cup).toBeUndefined();
    expect(Canon.items.kept_cup?.name).toBe('a kept cup');
    LocalKinds.reset();
  });
});
