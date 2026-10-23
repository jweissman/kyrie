import { describe, expect, it } from 'bun:test';
import { RegionPeoples } from '../src/world/region-peoples';
import { RegionEcology } from '../src/world/region-ecology';
import { RegionWriter, type Region } from '../src/world/region-writer';
import { WorldAssembler } from '../src/world/world-assembler';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { PlaySession } from '../src/session/play-session';
import { PlayerView } from '../src/presentation/player-view';
import { ModuleWriter } from '../src/lang/module-writer';
import { GenerationSetting } from '../src/generation-setting';
import { GeneratedWorld } from './support/generated';

// Who lives in a generated region and what lives in its wild places: a mix of peoples that fits the country, each
// person of their own people and named in their way; and dens that hold what makes dens in that kind of country.
class Peopled {
  static region(seed: number): Region {
    const town = (id: string) => ({ id, name: `Town${id}`, size: 'village', trade: 'honey', inn: 'the Red Ram',
      innkeeper: 'x', priest: 'x', merchant: 'x', traveller: 'x', calling: 'pedlar' });
    return { name: `Holt${seed}`, terrain: 'forest', ancestry: 'human', domain: 'life', deity: 'Brigid',
      settlements: ['s1', 's2', 's3'].map(town), sites: [], wonder: { kind: 'stone', description: 'a stone.' } };
  }
}

describe('a generated region is peopled', () => {
  it('by a mix of peoples that fits its country, with another people\'s settlement and how they came there', () => {
    const regions = Array.from({ length: 12 }, (_, i) => RegionPeoples.settle(Peopled.region(i), `mix-${i}`));
    for (const r of regions) {
      expect(r.settlements[0]!.folk).toBe('human');
      expect(r.peoples![0]).toBe('human');
      // Forest country is shared with halflings and half-elves, or gnomes and elves: never with lizardfolk.
      expect(r.peoples!.every(p => ['human', 'halfling', 'half_elf', 'gnome', 'elf'].includes(p))).toBe(true);
      const names = r.settlements.flatMap(s => RegionPeoples.roles.map(role => s[role]));
      expect(new Set(names).size).toBe(names.length);
    }
    const other = regions.flatMap(r => r.settlements).find(s => s.folk !== 'human')!;
    expect(other.came).toBeTruthy();
    expect(RegionPeoples.told(other)).toContain(`The folk of ${other.name} `);
    // Each person is named as their own people name their children.
    const names = GenerationSetting.tables.townsfolkName.groups as Record<string, string[]>;
    expect(names[other.people!.innkeeper!]).toContain(other.innkeeper);
  });
  it('writes each townsperson as of their own people', () => {
    const region = RegionPeoples.settle(WorldAssembler.lay(Peopled.region(3), 'holt3'), 'mix-3');
    const source = RegionWriter.source(region);
    const s = region.settlements[1]!;
    // Whoever keeps travellers there (an innkeeper, an alehouse-keeper, whoever speaks for a hamlet) is of their own
    // people.
    expect(source).toMatch(new RegExp(`Person ${s.id}_innkeeper "${s.innkeeper}" at ${s.id}_\\w+ \\{ Role "[^"]+"\\. `
      + `Ancestry ${s.people!.innkeeper}\\.`));
    expect(RegionWriter.peoples(region)).toMatch(/^human folk, /);
  });
});

describe('a den holds what lives where it is', () => {
  it('draws the same beast for the same country in one region, and the dead for a barrow', () => {
    const region = Peopled.region(1);
    expect(RegionEcology.den(region, 'cave')).toEqual(RegionEcology.den(region, 'cave'));
    expect(RegionEcology.den(region, 'barrow')!.nature).toBe('unquiet');
    expect(RegionEcology.habitat(region, { id: 'w1', kind: 'bog', name: 'Bog', hours: 1 })).toBe('fen');
  });
  it('lets a cleric lay a barrow\'s ghoul to rest, where smoke would not move it', async () => {
    // c2: a marsh region with a barrow that has become a den of the unquiet dead.
    const world = await WorldAssembler.assemble('c2', NodeBundleSource.shared), s = await PlaySession.start(world.path,
      'c2', world.source);
    const placement = world.report.placements.find(p => p.scenario === 'den'
      && world.report.region.sites.find(w => w.id === p.bindings.den)?.kind === 'barrow')!, den = placement.bindings.den!;
    const module = placement.modules[0]!;
    expect(s.campaign.state.creatures.find(c => c.id === `${module}__beasts_person`)?.raceId).toBe('ghoul');
    await GeneratedWorld.hear(s, placement, world.report.placements.indexOf(placement) + 1);
    await GeneratedWorld.travel(s, den);
    const ids = PlayerView.choices(s.campaign).map(c => c.choice.id);
    expect(ids).not.toContain(`${module}__smoke_out(party,region__${den})`);
    await s.perform(`${module}__lay_to_rest(party,region__${den})`);
    expect(s.campaign.world.test(ModuleWriter.call(`${module}__laid`, `${module}__beasts`))).toBe(true);
    expect(PlayerView.choices(s.campaign).map(c => c.choice.id)).toContain(`${module}__plunder(party,region__${den})`);
  }, 60000);
});
