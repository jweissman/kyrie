import { describe, expect, it } from 'bun:test';
import { PlaySession } from '../src/session/play-session';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { OverlayBundleSource } from '../src/campaign/overlay-bundle-source';
import { ModuleWriter } from '../src/lang/module-writer';

// What a module does not export is its own (the architecture review's A7, from its probe state-namespace). A file a
// manifest named among its rules kept its names, as the named rules do: one module's "rules" declared another's
// private relation and wrote it, another redeclared a shared relation with another arity, and a third gave a rule the
// id of another's, which was dropped unsaid. Such a file is now the module's own, read as its sources are.
class Privacy {
  static readonly files: Record<string, string> = {
    'ns/a/site.kyr': `Module a "A" { Place field "Field" is wilderness. Place room "Room" is room within field at 0, 0.
      Place nook "Nook" is room within field at 1, 0. Company party "You" of 1 at room.
      Relation secret(place). Initially Assert secret(nook). Goal false. }`,
    'ns/a/module.json': JSON.stringify({ version: 1, source: 'site.kyr', rules: ['world'], globals: ['party'] }),
    'ns/b/site.kyr': 'Module b "B" { Place yard "Yard" is site. Goal false. }',
    'ns/b/evil.kyr': `Module evil "Evil rules" { Relation a__secret(place). Relation leaked(place).
      Rule wipe when a__secret(?x) { Retract a__secret(?x). Assert leaked(?x). } }`,
    'ns/b/module.json': JSON.stringify({ version: 1, source: 'site.kyr', rules: ['world', 'evil.kyr'] }),
    'ns/c/site.kyr': `Module c "C" { Place yard "Yard" is site.
      Action poke(actor: group, p: place) "Poke" { Requires able(actor, p). Time 1. } Goal false. }`,
    'ns/c/redef.kyr': 'Module redef "Redefining rules" { Relation able(group, place). }',
    'ns/c/module.json': JSON.stringify({ version: 1, source: 'site.kyr', rules: ['world', 'redef.kyr'] }),
    'ns/d/site.kyr': 'Module d "D" { Place yard "Yard" is site. Goal false. }',
    'ns/d/other.kyr': 'Module other "D rules" { Relation marker(). Rule wipe when true { Assert marker(). } }',
    'ns/d/module.json': JSON.stringify({ version: 1, source: 'site.kyr', rules: ['world', 'other.kyr'] }),
    'ns/ab.campaign.json': JSON.stringify({ version: 1, name: 'ab', modules: [{ id: 'a', bundle: 'a/module.json' }],
      party: [{ name: 'Ama', raceId: 'human', classId: 'warrior' }] }),
  };
  static readonly overlay = new OverlayBundleSource(NodeBundleSource.shared, Privacy.files);
  static async start() {
    return (await PlaySession.start(this.overlay.resolve('ns/ab.campaign.json'), 'seed', this.overlay)).campaign;
  }
  static bundle(id: string) { return { id, bundle: this.overlay.resolve(`ns/${id}/module.json`) }; }
}
describe('a module', () => {
  it('cannot reach another\'s private relation by a rules file of its own', async () => {
    const c = await Privacy.start();
    await c.install(Privacy.bundle('b'), Privacy.overlay);
    c.execute(c.offered().find(o => o.schema === 'wait')!.id);
    expect(c.world.test(ModuleWriter.call('a__secret', 'a__nook'))).toBe(true);
    expect(c.module.relations.some(r => r.name === 'leaked')).toBe(false);
  }, 60000);
  it('leaves a shared relation as it is, and keeps its own rule beside another\'s of the same name', async () => {
    const c = await Privacy.start();
    await c.install(Privacy.bundle('c'), Privacy.overlay);
    expect(c.module.relations.find(r => r.name === 'able')!.types).toEqual(['group']);
    await c.install(Privacy.bundle('b'), Privacy.overlay);
    await c.install(Privacy.bundle('d'), Privacy.overlay);
    c.execute(c.offered().find(o => o.schema === 'wait')!.id);
    expect((c.module.rules ?? []).map(r => r.id).filter(id => id.endsWith('wipe')).sort()).toEqual(['b__wipe', 'd__wipe']);
    expect(c.world.test(ModuleWriter.call('d__marker'))).toBe(true);
  }, 60000);
});
