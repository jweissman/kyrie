import { describe, expect, it } from 'bun:test';
import { readFileSync } from 'node:fs';
import { Tiny } from '../support/tiny';
import { ModuleBundle } from '../../src/campaign/module-bundle';
import { RulePackages, type RulePackageDeclaration } from '../../src/campaign/rule-packages';
import { OverlayBundleSource } from '../../src/campaign/overlay-bundle-source';
import { NodeBundleSource } from '../../src/campaign/node-bundle-source';
import { ModuleParser } from '../../src/lang/index';

// The shared rules as packages (BX-02): each file of data/rules declares, in data/rules/packages.json, the packages it
// reads beyond the kernel (places and ways, people and talk, what is known), and each is installed with only what it
// declares and played: a read of anything it did not declare fails its installation (Kyr's unknown relation, or MT-25's
// undeclared read, preloaded for every spec). The standard set is closed under what it reads, so a world installs as it
// always did.
const declaration = JSON.parse(readFileSync(RulePackages.path, 'utf8')) as RulePackageDeclaration;
const packages = RulePackages.from(declaration);
const yard = 'Place yard "the yard" is room at 0, 0 outdoors. Company party "You" of 1 at yard.';
const plotHolder = [{ name: 'Robin Ashe', raceId: 'human', classId: 'commoner', outfit: 'own' as const }];
class Declared {
  // What a rules file declares by name: its kinds, entities, relations, measures and queries.
  static names(name: string): Set<string> {
    const m = ModuleParser.parse(readFileSync(`data/rules/${name}.kyr`, 'utf8'));
    return new Set([...m.kinds, ...m.entities.map(e => e.id), ...m.relations.map(r => r.name),
      ...m.measures.map(r => r.name), ...m.queries.map(q => q.name)]);
  }
  // A world of one place on a package and what it declares it reads, installed from a source of the rules (the
  // standard one, or one whose declaration says less).
  static start(name: string, base = NodeBundleSource.shared): Promise<Tiny> {
    return Tiny.start(yard, { horizon: [name], own: true, night: 'none', base, party: plotHolder });
  }
}

describe('the shared rules, as packages', () => {
  it('declares every package of the standard set, in its order, and nothing else', () => {
    expect(packages.names).toEqual(ModuleBundle.ruleNames);
    expect(packages.kernel).toEqual(['core', 'passages', 'people', 'discovery']);
  });
  it('keeps the kernel reading nothing beyond itself: nothing of conflict, care, belongings or trade', () => {
    for (const k of packages.kernel) { expect(packages.requires(k)).toEqual([]); }
  });
  it('says truly what each package reads of another: names that package declares', () => {
    for (const name of packages.names) {
      for (const [other, reads] of Object.entries(declaration.packages[name]!)) {
        const named = reads.split(':')[0]!.split(',').map(s => s.trim()), declared = Declared.names(other);
        expect({ name, other, missing: named.filter(n => !declared.has(n)) }).toEqual({ name, other, missing: [] });
      }
    }
  });
  it('closes the standard set, with its canon and without, under what its packages read', () => {
    const world = new Set(ModuleBundle.world), canonless = ModuleBundle.world.filter(n => n !== 'canon');
    expect(packages.closure(ModuleBundle.world)).toEqual(ModuleBundle.world);
    expect(packages.closure(canonless)).toEqual(canonless);
    expect(packages.closure(ModuleBundle.ruleNames)).toEqual(ModuleBundle.ruleNames);
    for (const name of ModuleBundle.ruleNames) {
      expect(packages.requires(name).filter(r => !world.has(r))).toEqual([]);
    }
  });
  it('installs and plays each package with only what it declares', async () => {
    for (const name of packages.names) {
      const t = await Declared.start(name);
      expect({ name, at: t.where() }).toEqual({ name, at: 't__yard' });
    }
  });
  it('installs a package with its closure, in the standard order', async () => {
    expect(packages.closure(['making'])).toEqual(['core', 'passages', 'people', 'needs', 'discovery', 'care',
      'belongings', 'dominion', 'making']);
    expect(packages.closure(['inhabitants'])).toEqual(['core', 'passages', 'people', 'discovery', 'dominion',
      'inhabitants']);
    const t = await Declared.start('inhabitants');
    expect(t.campaign.module.relations.some(r => r.name === 'captured')).toBe(true);
    expect(t.campaign.module.relations.some(r => r.name === 'soldBy')).toBe(false);
  });
  it("brings the catalog's abilities only with the package that declares them (care's lessons)", async () => {
    const abilities = async (name: string) => (await Declared.start(name)).campaign.module.entities
      .filter(e => e.type === 'ability').length;
    expect(await abilities('core')).toBe(0);
    expect(await abilities('care')).toBeGreaterThan(300);
  });
  it('fails a package that reads what it does not declare: belongings without rule over places (keeps)', async () => {
    const less = structuredClone(declaration);
    delete less.packages.belongings!.dominion;
    const base = new OverlayBundleSource(NodeBundleSource.shared, { [RulePackages.path]: JSON.stringify(less) });
    await expect(Declared.start('belongings', base)).rejects.toThrow(/keeps/);
    expect((await Declared.start('belongings')).campaign.module.relations.some(r => r.name === 'keeps')).toBe(true);
  });
});
