import { describe, expect, it } from 'bun:test';
import { WorldAssembler } from '../src/world/world-assembler';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { PlaySession } from '../src/session/play-session';
import { PlayerView } from '../src/presentation/player-view';
import { ModuleWriter } from '../src/lang/module-writer';
import { Canon } from '../src/canon/canon';
import type { CreatureStore } from '../src/creature-store';
import { GeneratedWorld } from './support/generated';

// Orsino's things through one expedition (the owner, 6 November: several Orsino-derived objects discovered, taken
// home, appraised, sold, equipped or used): h8's Delvers' mine holds a stone of Orsino's gemstone (a large
// brilliant-cut rose quartz, its worth by its cut, size and clarity) and, in the drowned furnace, Orsino's ring of
// strength and amulet of health. The company takes them up, wears the ring and the amulet, walks home to the town at
// s1, and sells the stone to the jeweller as a valuable and the amulet as one of the rare things a jeweller buys back
// (sell_ware), each at half its worth.
class Expedition {
  static async start() {
    const w = await WorldAssembler.assemble('h8', NodeBundleSource.shared, { origin: 'wanderer',
      party: [{ name: 'Wenna', raceId: 'human', classId: 'warrior' }] });
    return PlaySession.start(w.path, 'h8', w.source);
  }
  static choose(s: PlaySession, pattern: RegExp) {
    const c = PlayerView.choices(s.campaign).find(x => pattern.test(x.choice.name));
    if (!c) { throw new Error(`No choice like ${pattern}`); }
    return s.leg(c.choice.id);
  }
  static gold(s: PlaySession) { return s.campaign.world.number(ModuleWriter.call('quantity', 'party', 'gold')); }
  static kind(s: PlaySession, item: string) { return s.campaign.world.one('itemKind', `region__${item}`)!; }
  static async take(s: PlaySession, room: string, things: RegExp[]) {
    GeneratedWorld.put(s, room);
    await s.leg('wait');
    if (PlayerView.choices(s.campaign).some(x => x.choice.name === 'Light a torch')) {
      await Expedition.choose(s, /^Light a torch$/);
    }
    for (const thing of things) { await Expedition.choose(s, thing); }
  }
}

describe('an expedition among Orsino\'s things', () => {
  it('finds a stone and two wonders below, wears them, and sells what is worth selling at home', async () => {
    const s = await Expedition.start();
    const stone = Canon.items[Expedition.kind(s, 'w9_haulage_hall_gem0')]!;
    expect(stone).toMatchObject({ name: 'a large brilliant-cut rose quartz', rank: 'common', value: 23,
      portrait: 'gems/rose_quartz' });
    expect(stone.description).toBe('A common gemstone, brilliant-cut, clear.');
    expect(Canon.items[Expedition.kind(s, 'w9_drowned_furnace_find1')]!.source.orsino)
      .toBe('equipment:amulet_of_health');
    await Expedition.take(s, 'w9_haulage_hall', [/^Collect a large brilliant-cut rose quartz/]);
    await Expedition.take(s, 'w9_drowned_furnace', [/^Collect a ring of strength/, /^Collect an amulet of health/]);
    await Expedition.choose(s, /^Equip a ring of strength on Wenna$/);
    await Expedition.choose(s, /^Equip an amulet of health on Wenna$/);
    const store = (s.campaign as unknown as { creatures: CreatureStore }).creatures;
    expect(store.get(s.campaign.state.partyIds[0]!).state.inventory?.filter(i => i.equipped).map(i => i.definition))
      .toEqual(expect.arrayContaining(['ring_of_strength', 'amulet_of_health']));
    // Home by the ways the world joins them, from the mine's mouth to the jeweller's.
    GeneratedWorld.put(s, 'w9_adit_adit');
    await s.leg('wait');
    await GeneratedWorld.travel(s, 's1_jewelry');
    expect(s.campaign.world.one('at', 'party')).toBe('region__s1_jewelry');
    let gold = Expedition.gold(s);
    await Expedition.choose(s, /^Sell a large brilliant-cut rose quartz to /);
    expect(Expedition.gold(s)).toBe(gold + 11);
    gold = Expedition.gold(s);
    await Expedition.choose(s, /^Sell an amulet of health to /);
    expect(Expedition.gold(s)).toBe(gold + Math.floor(Canon.items.amulet_of_health!.value! / 2));
  }, 240000);
});
