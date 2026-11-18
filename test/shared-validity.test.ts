import { describe, expect, it } from 'bun:test';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { PlaySession } from '../src/session/play-session';
import { ModuleBundle } from '../src/campaign/module-bundle';
import { ModuleParser } from '../src/lang/module-parser';
import { ModuleCompiler } from '../src/lang/module-compiler';
import { RuntimeCapabilities } from '../src/campaign/runtime-capabilities';

// compile-once-plan.md step 2 (AX-03): the shared rules validated once for each edition, every install referring to
// them, is sound only if a shared declaration's validity does not depend on the module beside it. It does, both ways,
// so each install still checks the shared rules with its own module (validated once there, not twice: see
// ModuleAssembly.readOnly), and the plan stops at that.
describe('a shared declaration checked beside a module', () => {
  const module = (more: string) => `Module besideshared "Beside the shared rules" {
  Place field "a field" is wilderness.
  Place barley "the barley" is room within field at 0, 0.
  Company party "You" of 1 at barley.${more}
}`;
  const start = async (dir: string, text: string) => {
    writeFileSync(join(dir, 'site.kyr'), text);
    writeFileSync(join(dir, 'module.json'), JSON.stringify({ version: 1, source: ['site.kyr'], rules: ['world'],
      globals: ['party'], exports: { party: 'party' } }));
    writeFileSync(join(dir, 'probe.campaign.json'), JSON.stringify({ version: 1, name: 'Probe: beside',
      modules: [{ id: 'p', bundle: 'module.json' }], party: [{ name: 'Ama', raceId: 'human', classId: 'warrior' }] }));
    return PlaySession.start(join(dir, 'probe.campaign.json'), 'beside', new NodeBundleSource());
  };
  // A shared action's parameter (Lay to rest's site) is refused beside a module that names an entity so: what was valid
  // beside one module is invalid beside another. Validity is not monotone in the module.
  it('can be made invalid by what the module declares', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'kyrie-beside-'));
    try {
      expect((await start(dir, module(''))).campaign.module.actions.length).toBeGreaterThan(0);
      const site = module('\n  Place site "the old site" is room within field at 1, 0.');
      await expect(start(dir, site)).rejects.toThrow(/Parameter shadows entity site/);
    } finally { rmSync(dir, { recursive: true, force: true }); }
  }, 60000);
  // And the shared rules alone are not valid: what they say of the catalog's kinds (a pole, for prodding) is declared
  // only as a module is composed with them. Validity alone does not stand for validity beside a module either.
  it('is not valid without a module composed beside it', () => {
    const rules = ModuleBundle.world.map(n => ModuleParser.parse(readFileSync(`data/rules/${n}.kyr`, 'utf8')));
    const joined = { ...rules[0]!, entities: rules.flatMap(r => r.entities), kinds: rules.flatMap(r => r.kinds),
      relations: rules.flatMap(r => r.relations), measures: rules.flatMap(r => r.measures),
      queries: rules.flatMap(r => r.queries), initial: rules.flatMap(r => r.initial), actions: [],
      rules: [], observations: [], objectives: [], pursuits: [] };
    expect(() => new ModuleCompiler(RuntimeCapabilities.signatures).validate(joined))
      .toThrow(/Invalid argument pole in needs\(prodding, pole\)/);
  });
});
