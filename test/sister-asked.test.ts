import { describe, expect, it } from 'bun:test';
import { DrawnWorld } from '../src/world/drawn-world';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { Journey } from '../src/session/journey';
import { PlayerView } from '../src/presentation/player-view';
import type { PlaySession } from '../src/session/play-session';

// A sister gone under can be asked after at home, and what is found of her is said and seen through: followed, the
// hook had gone quiet at Seolforfyrd with no one to ask (round 6, the register's US-01).
describe('a sister gone under', () => {
  it('is asked after at the inn, and her cloak-pin found where the light gives out is told', async () => {
    const s = await DrawnWorld.start('kahitude', { origin: 'lost', party: [{ name: 'Gunnvor', raceId: 'dwarf',
      classId: 'cleric' }] }, NodeBundleSource.shared);
    const c = s.campaign, walk = async (to: string) => {
      for (const [p, next] of Journey.way(c.world, c.world.one('at', 'party')!, to)) { await s.leg(`go(${p},${next})`); }
    };
    const choose = (re: RegExp) => PlayerView.choices(c).find(x => re.test(x.choice.id))?.choice.id;
    const told = (e: Awaited<ReturnType<PlaySession['leg']>>) =>
      [...(e.perceptions ?? []).map(p => p.text), e.response ?? ''].join(' ');
    // Whoever keeps the inn of the town the company comes into (its merchant where it has none).
    const town = /^region__(.+)_approach$/.exec(c.world.one('at', 'party')!)![1]!;
    const keeper = [`region__${town}_innkeeper`, `region__${town}_merchant`].find(k => c.world.one('at', k))!;
    await walk(c.world.one('at', keeper)!);
    const asked = await s.leg(choose(/origin__sister/)!);
    expect(told(asked)).toMatch(/where the light gives out/);
    await walk(c.world.one('at', 'origin__pin')!);
    await s.perform(choose(/^search/)!);
    const xp = () => c.readout.creatures.find(x => c.readout.partyIds.includes(x.id))!.state.experience;
    const before = xp(), taken = await s.leg(choose(/origin__pin/)!);
    expect(told(taken)).toMatch(/her mark and the day/);
    expect(xp()).toBeGreaterThan(before);
  }, 120000);
});
