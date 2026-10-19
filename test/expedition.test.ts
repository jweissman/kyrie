import { describe, expect, it } from 'bun:test';
import { PlaySession } from '../src/session/play-session';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { PlayerView } from '../src/presentation/player-view';
import { ModuleWriter } from '../src/lang/module-writer';

class Trip {
  static async start(...commands: string[]) {
    const s = await PlaySession.start('data/caught-below/river.campaign.json', 'expedition', NodeBundleSource.shared);
    for (const c of commands) { await s.perform(c); }
    return s;
  }
  static n(s: PlaySession, name: string, ...args: string[]) {
    return s.campaign.world.number(ModuleWriter.call(name, ...args));
  }
  static fact(s: PlaySession, name: string, ...args: string[]) {
    return s.campaign.world.test(ModuleWriter.call(name, ...args));
  }
  static legal(s: PlaySession) { return PlayerView.choices(s.campaign).map(c => c.choice.id); }
  static coins(s: PlaySession) { return s.campaign.state.creatures.reduce((sum, c) => sum + c.state.gold, 0); }
  static async waitUntil(s: PlaySession, tick: number) { while (s.campaign.state.elapsed < tick) { await s.perform('wait'); } }
}

describe('time follows distance', () => {
  it('a doorway takes ten minutes, the causeway path an hour, the low path half an hour', async () => {
    const s = await Trip.start();
    const times = PlayerView.choices(s.campaign).filter(c => c.action.schema === 'go').map(c => [c.choice.id, c.choice.time]);
    expect(times).toContainEqual(['go(world__oar_door,world__taproom)', 1]);
    expect(times).toContainEqual(['go(world__causeway_path,world__causeway)', 6]);
    await s.perform('go(world__causeway_path,world__causeway)');
    expect(s.campaign.state.elapsed).toBe(6);
    await s.perform('go(world__low_path,world__drain_mouth)');
    expect(s.campaign.state.elapsed).toBe(9);
  }, 30000);
  it('a person walking an hour-long road arrives an hour later, not at once', async () => {
    const s = await Trip.start('go(world__causeway_path,world__causeway)', 'go(world__low_path,world__drain_mouth)',
      'go(world__culvert,world__workshop)', 'change_thing(world__padlock_pick)', 'go(world__stores_door,world__stores)',
      'take_item(rescue__bar,world__member_party_2)', 'go(world__stores_door,world__workshop)', 'go(world__gallery_steps,world__gallery)',
      'change_thing(world__hound_soothe)', 'go(world__hoist_passage,world__hoist)', 'rescue__lever_free(party,world__hoist)',
      'lead(rescue__guest)', 'go(world__hoist_passage,world__gallery)', 'go(world__gallery_steps,world__workshop)',
      'go(world__culvert,world__drain_mouth)', 'go(world__low_path,world__causeway)');
    const before = s.campaign.state.elapsed;
    await s.perform('go(world__causeway_path,world__quay)');
    const arrival = s.campaign.events.at(-1)!.npc!.find(d => d.actor === 'rescue__guest')!;
    expect(arrival.elapsed).toBe(before + 6);
    expect(arrival.goal).toBe('continuing');
  }, 60000);
});

describe('food and rest', () => {
  it('the company eats a ration each evening; without one it goes hungry and cannot sleep rough', async () => {
    const s = await Trip.start('go(world__causeway_path,world__causeway)');
    expect(Trip.n(s, 'quantity', 'party', 'rations')).toBe(1);
    expect(Trip.legal(s)).toContain('camp(world__causeway)');
    await Trip.waitUntil(s, 72);
    expect(Trip.n(s, 'quantity', 'party', 'rations')).toBe(0);
    expect(Trip.fact(s, 'hungry', 'party')).toBe(false);
    expect(Trip.n(s, 'nextMeal', 'party')).toBe(216);
    await Trip.waitUntil(s, 216);
    expect(Trip.fact(s, 'hungry', 'party')).toBe(true);
    expect(Trip.legal(s)).not.toContain('camp(world__causeway)');
  }, 120000);
  it('camping is for open country, not the town or the inside of a building', async () => {
    const town = await Trip.start(), inside = await Trip.start('go(world__oar_door,world__taproom)');
    expect(Trip.legal(town).some(c => c.startsWith('camp'))).toBe(false);
    expect(Trip.legal(inside).some(c => c.startsWith('camp'))).toBe(false);
  }, 60000);
  it('an inn sells a night: coin goes to the innkeeper, the company eats, sleeps eight hours and recovers', async () => {
    const s = await Trip.start('go(world__causeway_path,world__causeway)', 'go(world__low_path,world__drain_mouth)',
      'go(world__culvert,world__workshop)', 'go(world__gallery_steps,world__gallery)', 'change_thing(world__hound_soothe)',
      'go(world__hoist_passage,world__hoist)', 'rescue__heave_free(world__member_party_2)');
    const bran = () => s.campaign.state.creatures.find(c => c.name === 'Bran')!;
    expect(bran().state.hp).toBeLessThan(bran().base.maxHp);
    for (const c of ['go(world__hoist_passage,world__gallery)', 'go(world__gallery_steps,world__workshop)', 'go(world__culvert,world__drain_mouth)',
      'go(world__low_path,world__causeway)', 'go(world__causeway_path,world__quay)', 'go(world__oar_door,world__taproom)']) { await s.perform(c); }
    const coins = Trip.coins(s), maud = () => s.campaign.state.creatures.find(c => c.name === 'Maud')!.state.gold;
    const maudBefore = maud(), started = s.campaign.state.elapsed;
    await s.perform('take_lodging(world__maud_lodging,world__maud)');
    expect(s.campaign.state.elapsed - started).toBe(48);
    expect(Trip.coins(s)).toBe(coins);
    expect(maud() - maudBefore).toBe(3);
    expect(bran().state.hp).toBe(bran().base.maxHp);
  }, 90000);
  it('goods are counted stock: buying moves coin to the seller and one ration to the company', async () => {
    const s = await Trip.start('go(world__shop_door,world__shop_floor)');
    const coins = Trip.coins(s), stock = Trip.n(s, 'quantity', 'world__nera', 'rations');
    await s.perform('buy_goods(rations,world__nera)');
    expect(Trip.coins(s)).toBe(coins);
    expect(Trip.n(s, 'quantity', 'world__nera', 'rations')).toBe(stock - 1);
    expect(Trip.n(s, 'quantity', 'party', 'rations')).toBe(2);
  }, 30000);
});
