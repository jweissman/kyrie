import { describe, expect, it } from 'bun:test';
import { BgImport } from '../../scripts/bg-import';

// The owner's scene paintings kept in folders (the owner, 24 November: one for each terrain), each keeping the id it
// has for good: sources.json says every painting in assets/bg by its file and digest, so that one moved or renamed is
// followed by its bytes, and one kept under terrain/<t>/ is of that terrain. Where this fails, a painting was added,
// moved or painted over: `bun scripts/bg-import.ts` brings it in.
describe('the owner\'s scene paintings, by their sources', () => {
  it('names each painting by its folder and name, its terrain by its folder', () => {
    expect(BgImport.id('assets/bg/terrain/desert/sphinx.png')).toBe('scene-desert-sphinx');
    expect(BgImport.id('assets/bg/terrain/cave/cave-falls.png')).toBe('scene-cave-falls');
    expect(BgImport.id('assets/bg/house-of-doors/house-of-doors-air-portal.png')).toBe('scene-house-of-doors-air-portal');
    expect(BgImport.id('assets/bg/keep-dawn.png')).toBe('scene-keep-dawn');
    expect([BgImport.terrain('assets/bg/terrain/woodland/glade.png'), BgImport.terrain('assets/bg/keep-dawn.png')])
      .toEqual(['woodland', undefined]);
  });
  it('follows a painting moved or renamed by its bytes, and keeps its id', () => {
    const known = { 'scene-ruins-keep-dawn': { path: 'assets/bg/ruins-keep-dawn.png', sha1: 'a' },
      'scene-desert-arch': { path: 'assets/bg/desert-arch.png', sha1: 'b' } };
    const at = (path: string, sha1: string) => ({ path, sha1 });
    const found = [at('assets/bg/keep-dawn.png', 'a'), at('assets/bg/terrain/desert/arch.png', 'b'),
      at('assets/bg/terrain/desert/sphinx.png', 'c')];
    const pngs = BgImport.pngs, digest = BgImport.sha1;
    try {
      BgImport.pngs = () => found.map(f => f.path);
      BgImport.sha1 = (p: string) => found.find(f => f.path === p)!.sha1;
      const { sources, fresh } = BgImport.match(known);
      expect(Object.keys(sources).sort()).toEqual(['scene-desert-arch', 'scene-desert-sphinx', 'scene-ruins-keep-dawn']);
      expect(sources['scene-desert-arch']).toEqual({ path: 'assets/bg/terrain/desert/arch.png', sha1: 'b',
        terrain: 'desert' });
      expect(fresh).toEqual(['scene-desert-sphinx']);
    } finally { BgImport.pngs = pngs; BgImport.sha1 = digest; }
  });
  it('knows every painting in assets/bg as it is', () => {
    const { fresh, gone } = BgImport.match(BgImport.read());
    expect({ fresh, gone }).toEqual({ fresh: [], gone: [] });
  });
});
