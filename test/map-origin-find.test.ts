import { describe, expect, it } from 'bun:test';
import { DrawnWorld } from '../src/world/drawn-world';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { Journey } from '../src/session/journey';
import { PlayerView } from '../src/presentation/player-view';
import { ScreenModel } from '../src/ui/screen-model';

// What the dead man's map marked, found, is said and seen through: the cross on the map had given a box the catalog
// calls empty, with no word of it and nothing for the finding (round 7, K 139-142).
describe('the dead man\'s map, its cross dug', () => {
  it('tells what is in the box, and is seen through', async () => {
    const s = await DrawnWorld.start('kahitude', { origin: 'map', party: [{ name: 'Wisp', raceId: 'human',
      classId: 'thief' }] }, NodeBundleSource.shared);
    const c = s.campaign, there = c.world.one('at', 'origin__cache')!;
    // The map itself is in the pack from the first, a thing carried (round 10, S: "the origin's whole point" was not).
    expect(ScreenModel.build(c).items.map(i => i.name)).toContain('a dead man\'s map');
    for (const [p, to] of Journey.way(c.world, c.world.one('at', 'party')!, there)) { await s.leg(`go(${p},${to})`); }
    const choose = (re: RegExp) => PlayerView.choices(c).find(x => re.test(x.choice.id))?.choice.id;
    await s.perform(choose(/^search/)!);
    const xp = () => c.readout.creatures.find(x => c.readout.partyIds.includes(x.id))!.state.experience;
    const before = xp(), event = await s.leg(choose(/origin__cache/)!);
    const told = [...(event.perceptions ?? []).map(p => p.text), event.response ?? ''].join(' ');
    expect(told).toMatch(/fold of paper with the drover's mark/);
    expect(xp()).toBeGreaterThan(before);
  }, 120000);
});
