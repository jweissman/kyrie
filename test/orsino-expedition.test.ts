import { describe, expect, it } from 'bun:test';
import { WorldAssembler } from '../src/world/world-assembler';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { PlaySession } from '../src/session/play-session';
import { PlayerView } from '../src/presentation/player-view';
import { ModuleWriter } from '../src/lang/module-writer';
import type { CreatureStore } from '../src/creature-store';
import { GeneratedWorld } from './support/generated';

// Orsino's things through one expedition (the owner, 6 November: several Orsino-derived objects discovered, taken
// home, appraised, sold, equipped or used): h8's Delvers' mine holds a stone of Orsino's gemstone (a huge
// cushion-cut carnelian by the sealed stair, its worth by its cut, size and clarity) and, in the drowned furnace,
// Orsino's ring of
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
    if (!c) { throw new Error(`No choice like ${pattern}: ${PlayerView.choices(s.campaign).map(x => x.choice.name).join(" | ")}`); }
    return s.leg(c.choice.id);
  }
  static gold(s: PlaySession) { return s.campaign.world.number(ModuleWriter.call('quantity', 'party', 'gold')); }
  static kind(s: PlaySession, item: string) { return s.campaign.world.one('itemKind', `region__${item}`)!; }
  static async take(s: PlaySession, room: string, things: RegExp[]) {
    GeneratedWorld.put(s, room);
    // Whoever lives there taken out of it (the furnace's xill since OR-1230): the things are the subject.
    const c = s.campaign as unknown as { world: { apply(c: unknown[]): unknown }; commit(w: unknown): void };
    c.commit(c.world.apply(s.campaign.world.related('at').filter(r => r.args[1] === `region__${room}` && r.args[0] !== 'party'
      && s.campaign.module.entities.some(e => e.id === r.args[0] && e.type === 'group'))
      .map(r => ({ kind: 'retract', call: ModuleWriter.call('at', ...r.args) }))));
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
    const stone = s.campaign.catalog.definition(Expedition.kind(s, 'w9_haulage_seal_gem0'))!;
    expect(stone).toMatchObject({ name: 'a huge cushion-cut carnelian', rank: 'common', value: 30,
      portrait: 'gems/carnelian' });
    expect(stone.description).toBe('A common gemstone, cushion-cut, clear.');
    expect(s.campaign.catalog.definition(Expedition.kind(s, 'w9_drowned_furnace_find1'))!.source.orsino)
      .toBe('equipment:amulet_of_health');
    await Expedition.take(s, 'w9_haulage_seal', [/^Collect a huge cushion-cut carnelian/]);
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
    await Expedition.choose(s, /^Sell a huge cushion-cut carnelian to /);
    expect(Expedition.gold(s)).toBe(gold + 15);
    gold = Expedition.gold(s);
    await Expedition.choose(s, /^Sell an amulet of health to /);
    expect(Expedition.gold(s)).toBe(gold + Math.floor(s.campaign.catalog.definition('amulet_of_health')!.value! / 2));
  }, 240000);
});
