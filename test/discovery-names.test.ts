import { describe, expect, it } from 'bun:test';
import { WorldAssembler } from '../src/world/world-assembler';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { PlaySession } from '../src/session/play-session';
import { PlayerView } from '../src/presentation/player-view';
import { ObservationText } from '../src/lang/observation-text';
import { ModuleParser } from '../src/lang/module-parser';
import { ModuleWriter } from '../src/lang/module-writer';
import { GeneratedWorld } from './support/generated';
import { RegionGeography } from '../src/world/region-geography';

// A place is called what a stranger would call it (a lone tower, a grassed mound) until the company learns its name:
// from the people who live near it, or from the name cut over the door of an old site. Thorn: w1 is one of the
// Stone-Singers' halls, and the innkeeper of the settlement nearest it knows the name the folk call it by.
class Named {
  static world?: Awaited<ReturnType<typeof WorldAssembler.assemble>>;
  static async start() {
    const w = this.world ??= await WorldAssembler.assemble('thorn', NodeBundleSource.shared);
    return PlaySession.start(w.path, 'thorn', w.source);
  }
  // The settlement whose people know w1, and who keeps its inn.
  static near() {
    const region = this.world!.report.region;
    return RegionGeography.near(region, region.sites.find(w => w.id === 'w1')!);
  }
  static names(s: PlaySession) { return PlayerView.choices(s.campaign).map(c => c.choice.name); }
  static site() { return this.world!.report.region.sites.find(w => w.id === 'w1')!; }
  static seen(s: PlaySession) { return s.campaign.module.entities.find(e => e.id === 'region__w1')!.alias!.name; }
}

describe('a place the company has not learned the name of', () => {
  it('is said as it is seen, in choices and in text, until someone names it', async () => {
    const s = await Named.start(), town = Named.near(), site = Named.site(), seen = Named.seen(s);
    GeneratedWorld.put(s, `${town.id}_taproom`);
    await s.perform('wait');
    expect(ObservationText.label(s.campaign.world, 'region__w1')).toBe(seen);
    expect(Named.names(s)).toContain(`Ask ${town.innkeeper} about ${seen}`);
    expect(Named.names(s).some(n => n.includes(site.name))).toBe(false);
    const e = await s.perform('region__w1_asked');
    expect([e.response ?? '', ...(e.perceptions ?? []).map(p => p.text)].join(' ')).toContain(`'${site.name},'`);
    expect(ObservationText.label(s.campaign.world, 'region__w1')).toBe(site.name);
  }, 60000);
  it('is named by what is cut over the door of an old site, on arrival', async () => {
    const s = await Named.start();
    GeneratedWorld.put(s, 'w1');
    await s.perform('wait');
    expect(ObservationText.label(s.campaign.world, 'region__w1')).toBe(Named.site().name);
  }, 60000);
  it('is written as authored', () => {
    const source = 'Module m "M" {\n  Place hut "Ansel\'s hut" is room seen as "a hut in the trees" until hut_named.\n'
      + '  Discovery hut_named "The hut is Ansel\'s.".\n  Goal false.\n}';
    const hut = ModuleParser.parse(source).entities.find(e => e.id === 'hut')!;
    expect(hut.alias).toEqual({ name: 'a hut in the trees', until: 'hut_named' });
    expect(ModuleWriter.write(ModuleParser.parse(source))).toContain('seen as "a hut in the trees" until hut_named');
  });
});
