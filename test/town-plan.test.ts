import { beforeAll, describe, expect, it } from 'bun:test';
import { DrawnWorld } from '../src/world/drawn-world';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { ScreenModel } from '../src/ui/screen-model';
import { ModuleWriter } from '../src/lang/module-writer';
import type { Campaign } from '../src/campaign/campaign';
import type { Plan } from '../src/ui/screen-types';

// The plan of the town the company is in (TownPlan): each place a cell of its own on the town's grid, a building one
// cell gone into by its door, the lanes between, and where the company is; from inside a building of a room or two,
// the town's plan with that building where it is; below ground, the rooms known down there and the ways up out of them
// (PD-09).
class Stood {
  static campaign: Campaign;
  static at(name: string): Plan | undefined {
    const c = this.campaign, party = c.playerActor ?? 'party', was = c.world.one('at', party)!;
    const to = c.module.entities.find(e => e.type === 'place' && e.space?.kind === 'room' && e.name === name)!;
    c.commitWorld(c.world.apply([{ kind: 'retract', call: ModuleWriter.call('at', party, was) },
      { kind: 'assert', call: ModuleWriter.call('at', party, to.id) }]));
    return ScreenModel.build(c).plan;
  }
}

describe('the plan of a town', () => {
  beforeAll(async () => {
    Stood.campaign = (await DrawnWorld.start('thorn', { origin: 'wanderer',
      party: [{ name: 'Wenna', raceId: 'human', classId: 'ranger' }] }, NodeBundleSource.shared)).campaign;
  }, 120000);
  it('sets each place it knows a way to in a cell of its own, the company where it stands', () => {
    const plan = Stood.at('the gate-yard of Sedgeminster')!;
    expect(plan).toMatchObject({ kind: 'settlement', name: 'Sedgeminster' });
    expect(plan.cells.filter(c => c.here).map(c => c.name)).toEqual(['the gate-yard of Sedgeminster']);
    expect(new Set(plan.cells.map(c => `${c.x},${c.y}`)).size).toBe(plan.cells.length);
    const house = plan.cells.find(c => c.building)!;
    expect(house).toMatchObject({ name: 'the brothers\' house at Sedgeminster', indoors: true });
    // Gone into by its door: the room of it the yard leads into.
    expect(house.id).not.toBe('region__s5_inn');
    const here = plan.cells.find(c => c.here)!.id;
    expect(plan.lanes.some(l => [l.from, l.to].includes(here) && [l.from, l.to].includes(house.id))).toBe(true);
  });
  it('from a building of a room or two, is the town\'s, with the building where the company is', () => {
    const plan = Stood.at('the guest-hall of Sedgeminster')!;
    expect(plan.kind).toBe('settlement');
    expect(plan.cells.filter(c => c.here)).toEqual([expect.objectContaining({ building: true })]);
  });
  // A site above ground is drawn as a town is, with its door out (NVR-16: inside the iron keep the Map had shown
  // nothing of where the company was).
  it('of a site above ground is the site\'s, with its way out', async () => {
    const keep = (await DrawnWorld.start('a1', { origin: 'wanderer',
      party: [{ name: 'Wenna', raceId: 'human', classId: 'ranger' }] }, NodeBundleSource.shared)).campaign;
    const [was, campaign] = [Stood.campaign, keep];
    Stood.campaign = campaign;
    const plan = Stood.at('the bailey')!;
    Stood.campaign = was;
    expect(plan).toMatchObject({ kind: 'site', name: 'the iron keep' });
    expect(plan.cells.map(c => c.name)).toEqual(expect.arrayContaining(['the bailey', 'the great hall', 'the wall-walk']));
    expect(plan.cells.filter(c => c.door)).toHaveLength(1);
  }, 120000);
  // Under a town, the rooms of its undertown the company knows, apart from the town above them, and the way up: a
  // dungeon's ways had been only a list (the product-design review's PD-09).
  it('below ground is of the rooms known down there, with the way up', () => {
    const plan = Stood.at('the rat-runs')!;
    expect(plan.kind).toBe('under');
    const names = plan.cells.map(cell => cell.name);
    expect(names).toEqual(expect.arrayContaining(['the rat-runs', 'the corn-store cellar']));
    expect(plan.cells.find(cell => cell.here)?.name).toBe('the rat-runs');
    expect(names).not.toContain('the green');
  });
});
