import { describe, expect, it } from 'bun:test';
import { readFileSync } from 'node:fs';
import { ModuleBundle, type BundleManifest, type BundleRequest } from '../src/campaign/module-bundle';
import { ModuleExports } from '../src/campaign/module-exports';
import { ModuleNamespace } from '../src/campaign/module-namespace';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { OverlayBundleSource } from '../src/campaign/overlay-bundle-source';
import type { InstalledModule } from '../src/campaign/definition';
import { CanonVocabulary } from '../src/canon/canon-vocabulary';

// Typed exports (the maturity track's step 3, MT-03): a module's export may say the part it plays (fact, outcome,
// participant, place, capability), and a parent then composes with it from its manifest alone, without its Kyr. A
// role declared that its entity cannot play, or a parent's import of another role, fails at the load.
class Exporting {
  static readonly vocabulary = CanonVocabulary.context();
  static json(path: string): BundleManifest { return JSON.parse(readFileSync(path, 'utf8')) as BundleManifest; }
  // A child that keeps a word and a keeper, and a parent that hears a word; the child's roles as given.
  static source(word: string) {
    return new OverlayBundleSource(NodeBundleSource.shared, {
      'x/child.json': JSON.stringify({ version: 1, source: 'child.kyr', rules: ['world'],
        exports: { word: { entity: 'word', role: word }, keeper: { entity: 'keeper', role: 'participant' } } }),
      'x/child.kyr': 'Module child "Child" { Entity word: fact "A word.". Entity keeper: group "the keeper". Goal false. }',
      'x/parent.json': JSON.stringify({ version: 1, source: 'parent.kyr', rules: ['world'], imports: ['heard'],
        roles: { heard: { type: 'fact' } } }),
      'x/parent.kyr': 'Module parent "Parent" { Entity heard: fact "Heard.". Goal false. }' });
  }
  static async child(source: OverlayBundleSource): Promise<InstalledModule> {
    const draft = await ModuleBundle.load({ id: 'child', bundle: source.resolve('x/child.json') },
      { seed: 's', vocabulary: this.vocabulary }, source);
    return ModuleNamespace.record(draft, 0);
  }
  static parent(source: OverlayBundleSource, installed: InstalledModule[], from: string) {
    const request: BundleRequest = { id: 'parent', bundle: source.resolve('x/parent.json'), imports: { heard: from } };
    return ModuleBundle.load(request, { seed: 's', installed, vocabulary: this.vocabulary }, source);
  }
}

describe('typed exports', () => {
  it('compose the sea-gate with the held drove from their manifests alone', () => {
    const drove = Exporting.json('data/goings-on/iscoed-drove/module.json');
    const gate = Exporting.json('data/goings-on/iscoed-gate/module.json');
    const scenario = JSON.parse(readFileSync('data/scenarios/iscoed-gate.scenario.json', 'utf8')) as
      { modules: { id: string; imports: Record<string, string> }[] };
    const imports = scenario.modules.find(m => m.id === 'gate')!.imports;
    const exported = ModuleExports.declared(drove.exports);
    // What the gate takes of the drove, each by the role the gate asks and the role the drove says it has.
    expect(Object.entries(imports).filter(([, ref]) => ref.startsWith('drove.'))
      .map(([name, ref]) => [name, gate.roles![name]!.type, exported[ref.split('.')[1]!]]))
      .toEqual([['forged', 'fact', 'fact'], ['freedword', 'fact', 'outcome'], ['drovedrowned', 'fact', 'fact'],
        ['clerkgone', 'fact', 'outcome'], ['clerkkept', 'fact', 'outcome'],
        ['ruledword', 'fact', 'outcome']]);
    // And of the cold pans, installed before it (ST-04): the cut clear for the boat, and what came of the boat.
    const pans = ModuleExports.declared(Exporting.json('data/goings-on/iscoed-pans/module.json').exports);
    expect(Object.entries(imports).filter(([, ref]) => ref.startsWith('pans.'))
      .map(([name, ref]) => [name, gate.roles![name]!.type, pans[ref.split('.')[1]!]]))
      .toEqual([['poledword', 'fact', 'outcome'], ['saltwhole', 'fact', 'outcome'], ['saltshared', 'fact', 'outcome'],
        ['saltlost', 'fact', 'outcome'], ['cutclear', 'fact', 'fact']]);
    const installed = [{ id: 'drove', exported } as unknown as InstalledModule,
      { id: 'pans', exported: pans } as unknown as InstalledModule];
    expect(() => ModuleExports.bound('gate', gate.roles, imports, installed)).not.toThrow();
    // The drove's tally-book saying it was a participant, the gate's composition with it is refused by the roles.
    const wrong = [{ id: 'drove', exported: { ...exported, altered: 'participant' } } as unknown as InstalledModule];
    expect(() => ModuleExports.bound('gate', gate.roles, imports, wrong)).toThrow(
      'Module gate imports forged as fact from drove.altered, but drove exports altered as participant');
    // Every export of both says its role.
    expect([drove, gate].flatMap(m => Object.keys(m.exports!).filter(k => !ModuleExports.declared(m.exports)[k])))
      .toEqual([]);
  });
  it('load where the roles agree, and keep the child\'s for the modules after it', async () => {
    const source = Exporting.source('fact'), child = await Exporting.child(source);
    expect(child.exported).toEqual({ word: 'fact', keeper: 'participant' });
    const parent = await Exporting.parent(source, [child], 'child.word');
    expect(parent.roles).toEqual([{ role: 'heard', entity: 'child__word', type: 'fact', conditions: [] }]);
  });
  it('fail at the load where a declared role is not what its entity is', async () => {
    const source = Exporting.source('place');
    await expect(Exporting.child(source)).rejects.toThrow('Module child exports word as place, but word is a fact');
  });
  it('fail at the load where a parent imports an export as another role than it declares', async () => {
    const source = Exporting.source('fact'), child = await Exporting.child(source);
    await expect(Exporting.parent(source, [child], 'child.keeper')).rejects.toThrow(
      'Module parent imports heard as fact from child.keeper, but child exports keeper as participant');
  });
  it('stay valid written as strings, and refuse a role no one knows', () => {
    expect(ModuleExports.valid({ held: 'held', bran: { entity: 'bran', role: 'participant' }, b: { entity: 'b' } }))
      .toBe(true);
    expect(ModuleExports.valid({ held: { entity: 'held', role: 'clue' } })).toBe(false);
    expect(ModuleExports.valid({ held: { role: 'fact' } })).toBe(false);
    expect(ModuleExports.locals({ held: 'held', bran: { entity: 'bran_ap_ifor', role: 'participant' } }))
      .toEqual({ held: 'held', bran: 'bran_ap_ifor' });
  });
});
