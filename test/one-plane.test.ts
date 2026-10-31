import { describe, expect, it } from 'bun:test';
import { ModuleBundle } from '../src/campaign/module-bundle';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { OverlayBundleSource } from '../src/campaign/overlay-bundle-source';
import { Journey } from '../src/session/journey';
import { Spatial } from '../src/spatial';

// Modules that name the canon (data/imbar) in their manifests extend it and do not redeclare it: two courts of the
// Plane of Fire, by two hands, are regions of one plane, joined to its one threshold; what one says of the canon's
// identities and events the other reads. A module declaring a canonical id of its own, or putting a law on a
// canonical place, is refused (test/fixtures/probes/one-fire).
class Fire {
  static readonly base = NodeBundleSource.shared;
  static start() { return Journey.start('test/fixtures/probes/one-fire/probe.campaign.json', 'fire'); }
  // A module of a few lines, loaded alone, as the loader reads it.
  static load(kyr: string, canon: string[]) {
    const files = { 'probe-r/module.json': JSON.stringify({ version: 1, source: 's.kyr', rules: ['world'], canon }),
      'probe-r/s.kyr': `Module r "R" { ${kyr} Goal false. }` };
    const source = new OverlayBundleSource(Fire.base, files);
    return ModuleBundle.load({ id: 'r', bundle: source.resolve('probe-r/module.json') }, { seed: 'r' }, source);
  }
}

describe('one Plane of Fire', () => {
  it('holds two modules\' courts as regions of the one plane, both walked to from its threshold', async () => {
    const j = await Fire.start(), entities = new Map(j.campaign.module.entities.map(e => [e.id, e]));
    expect(j.campaign.installed).toEqual(['canon', 'home', 'ember', 'cinder']);
    expect([...entities.keys()].filter(id => /(^|__)inner_fire$/.test(id))).toEqual(['inner_fire']);
    expect(entities.get('home__vale')?.space?.parent).toBe('imbar');
    const plane = (id: string) => Spatial.ancestry(entities, id).map(e => e.id).slice(-2);
    expect(plane('ember__ember_hall')).toEqual(['ember__ember_court', 'inner_fire']);
    expect(plane('cinder__cinder_stalls')).toEqual(['cinder__cinder_market', 'inner_fire']);
    await j.play('>inner_fire_threshold');
    expect(j.at('party')).toBe('inner_fire_threshold');
    expect(j.taken.at(-1)!.told).toContain('nothing in sight that is not burning');
    await j.play('>ember__ember_hall', '>cinder__cinder_stalls');
    expect(j.at('party')).toBe('cinder__cinder_stalls');
  }, 60000);

  it('reads in one module what another says of the canon: where the Rose is kept, and that it was made whole', async () => {
    const j = await Fire.start();
    expect([j.holds('seatOf', 'rose_of_the_winds', 'ember__ember_hall'), j.holds('cinder__roseKept')])
      .toEqual([true, true]);
    expect(j.holds('cinder__roseWhole')).toBe(false);
    await j.play('>ember__ember_hall', 'Set the last petal');
    expect([j.holds('befell', 'rose_made_whole'), j.holds('cinder__roseWhole')]).toEqual([true, true]);
    expect(await j.play('>cinder__cinder_stalls')).toContain('THE ROSE IS WHOLE');
  }, 60000);

  it('refuses a module that declares a canonical id, or puts a law on a canonical place', async () => {
    await expect(Fire.load('Place inner_fire "the Plane of Fire" is plane.', []))
      .rejects.toThrow('declares inner_fire, which is the canon\'s (data/imbar)');
    await expect(Fire.load('Place court "a court" is region within inner_fire.', ['inner_fyre']))
      .rejects.toThrow('names inner_fyre in its "canon", which data/imbar does not declare');
    const lawful = 'Place court "a court" is region within inner_fire. Entity unlit_law: law "the dead dark".';
    await expect(Fire.load(`${lawful} Initially Assert law(inner_fire_threshold, unlit_law).`, ['inner_fire']))
      .rejects.toThrow('law(inner_fire_threshold, unlit_law): a module puts no law on a place of the canon (data/imbar)');
    // Its own places within the plane are its own, and their laws its own.
    const own = await Fire.load(`${lawful} Initially Assert law(court, unlit_law).`, ['inner_fire']);
    expect(own.instance.module.entities.find(e => e.id === 'r__court')?.space?.parent).toBe('inner_fire');
  }, 60000);
});
