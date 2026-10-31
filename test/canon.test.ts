import { describe, expect, it } from 'bun:test';
import { readFileSync } from 'node:fs';
import { Campaign } from '../src/campaign/campaign';
import { CanonInstall } from '../src/campaign/canon-install';
import { MemoryBundleSource } from '../src/campaign/memory-bundle-source';
import { ModuleBundle } from '../src/campaign/module-bundle';
import { ModuleCanon } from '../src/campaign/module-canon';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { OverlayBundleSource } from '../src/campaign/overlay-bundle-source';
import { ModuleWriter } from '../src/lang/module-writer';
import { PlaySession } from '../src/session/play-session';
import { WorldAssembler } from '../src/world/world-assembler';

// The canon (data/imbar) is every world's first installation: Imbar, the planes and their thresholds, the College of
// Dun Rì and its House of Doors, and the world events, there before anything names them (Mission 18's one universe).
class Canon {
  static readonly base = NodeBundleSource.shared;
  static manifest() {
    return JSON.parse(readFileSync('data/imbar/module.json', 'utf8')) as { globals: string[]; exports: Record<string, string> };
  }
  // A world made by a source that held no canon, as a game kept from before there was one was made.
  static async old(site: string, globals = ['party']): Promise<Campaign> {
    const rules = await Promise.all(ModuleBundle.world.map(async n => [`data/rules/${n}.kyr`,
      await Bun.file(`data/rules/${n}.kyr`).text()]));
    return Campaign.load('c.json', 'old', new MemoryBundleSource({ ...Object.fromEntries(rules),
      'c.json': JSON.stringify({ version: 1, name: 'Old', modules: [{ id: 'old', bundle: 'm.json' }],
        party: [{ name: 'Ama', raceId: 'human', classId: 'warrior' }] }),
      'm.json': JSON.stringify({ version: 1, source: 's.kyr', rules: ['world'], globals }), 's.kyr': site }));
  }
  static later(n: number) {
    const files = { [`later${n}/module.json`]: JSON.stringify({ version: 1, source: 's.kyr', rules: ['world'] }),
      [`later${n}/s.kyr`]: `Module later${n} "Later" { Place shed${n} "the shed" is site. Goal false. }` };
    const source = new OverlayBundleSource(Canon.base, files);
    return { request: { id: `later${n}`, bundle: source.resolve(`later${n}/module.json`) }, source };
  }
}

describe('the canon', () => {
  it('is in a fresh generated world before anything else, every id of it, and nothing has befallen', async () => {
    const w = await WorldAssembler.assemble('a1', Canon.base);
    const c = (await PlaySession.start(w.path, 'a1', w.source)).campaign;
    expect(c.installations[0]).toMatchObject({ id: ModuleCanon.id, installedAt: 0 });
    expect(c.installed.indexOf('region')).toBeGreaterThan(0);
    const entities = new Map(c.module.entities.map(e => [e.id, e])), { globals } = Canon.manifest();
    expect(globals.filter(id => !entities.has(id))).toEqual([]);
    expect(Object.values(c.installations[0]!.exports).sort()).toEqual([...globals].sort());
    // Each plane but Imbar has a region, and in it a threshold a company can stand in.
    expect(entities.get('inner_fire')?.space).toEqual({ kind: 'plane' });
    expect(entities.get('inner_fire_threshold')?.space?.kind).toBe('room');
    expect(entities.get('house_upper_threshold')?.name).toBe('the first gallery');
    expect(entities.get('outer_cthell')?.name).toBe('Cthell');
    expect(entities.get('court_of_waters')?.space?.parent).toBe('inner_water_region');
    // Orsino's outer planes carry their laws, and the elemental planes none.
    const law = (place: string, l: string) => c.world.test(ModuleWriter.call('law', place, l));
    expect([law('outer_gehenna', 'plane_gehenna'), law('outer_cthell', 'plane_cthelll')]).toEqual([true, true]);
    expect(c.world.related('law').filter(r => r.args[0]!.startsWith('inner_'))).toEqual([]);
    expect(c.world.test(ModuleWriter.call('partOf', 'house_of_doors', 'mages_college'))).toBe(true);
    expect(c.world.related('befell')).toEqual([]);
  }, 120000);

  it('lists every place, identity and event it declares among its globals and its exports', () => {
    const { globals, exports } = Canon.manifest(), declared = ['planes', 'outer', 'house', 'events']
      .flatMap(f => [...readFileSync(`data/imbar/${f}.kyr`, 'utf8')
        .matchAll(/(?:Place (\w+) "|Entity (\w+): (?:identity|fact) ")/g)].map(m => m[1] ?? m[2]!));
    expect([...globals].sort()).toEqual([...declared].sort());
    expect(Object.entries(exports).filter(([k, v]) => k !== v || !globals.includes(v))).toEqual([]);
  });

  it('is given to a world kept from before it, before its next module; one that cannot take it says so', async () => {
    const yard = 'Module old "Old" { Place yard "the yard" is site. Place gate "the gate" is room within yard at 0, 0.'
      + ' Company party "You" of 1 at gate. Goal false. }';
    const kept = Campaign.restore((await Canon.old(yard)).save());
    expect(kept.installed).toEqual(['old']);
    await kept.install({ id: 'ember', bundle: Canon.base.resolve('test/fixtures/probes/one-fire/ember/module.json') },
      Canon.base);
    expect(kept.installed).toEqual(['old', ModuleCanon.id, 'ember']);
    expect(kept.module.entities.find(e => e.id === 'ember__ember_court')?.space?.parent).toBe('inner_fire');
    // A world that already holds a name of the canon's as its own cannot take the canon: it goes on without it.
    const fire = yard.replace('Goal false.', 'Place inner_fire "an old fire" is plane. Goal false.');
    const clash = Campaign.restore((await Canon.old(fire, ['party', 'inner_fire'])).save());
    for (const n of [1, 2]) { const { request, source } = Canon.later(n); await clash.install(request, source); }
    expect(clash.installed).toEqual(['old', 'later1', 'later2']);
    expect(clash.conflicts).toEqual([expect.stringContaining(CanonInstall.refused)]);
    expect(clash.conflicts[0]).toContain('Duplicate entity inner_fire');
  }, 60000);
});
