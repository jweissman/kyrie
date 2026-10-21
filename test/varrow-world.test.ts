import { describe, expect, it } from 'bun:test';
import { PlaySession } from '../src/session/play-session';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { PlayerView } from '../src/presentation/player-view';
import { ModuleWriter } from '../src/lang/module-writer';
import type { CreatureStore } from '../src/creature-store';

// The Varrow as one world: the Heron's meal feeds the crew on credit, the Toll keeps Skerry hungry and Hollin short
// of silver, a path round the Toll is watched once it is seen used, and an emptied Lanthorn is taken by the hobs who
// covet it. Each link is a shared fact (credit, owes, tolls, losses, vacant, covets, holds), read by the modules
// that care, never a flag one module sets for another.
class World {
  static start(seed = 'dry1') { return PlaySession.start('data/campaigns/varrow.campaign.json', seed, NodeBundleSource.shared); }
  static change(s: PlaySession, ...changes: unknown[]) {
    const c = s.campaign as unknown as { world: { apply(c: unknown[]): unknown }; commit(w: unknown): void };
    c.commit(c.world.apply(changes));
  }
  // A person's coin is on the person, as everyone's is; the world's quantity is read from it.
  static purse(s: PlaySession, member: string, gold: number) {
    const store = (s.campaign as unknown as { creatures: CreatureStore }).creatures, lease = store.acquire([member]);
    try {
      lease.creatures[0]!.state.gold = gold;
      lease.commit(lease.creatures);
    } finally { lease.release(); }
  }
  static put(s: PlaySession, place: string) { this.change(s, { kind: 'assert', call: ModuleWriter.call('at', 'party', place) }); }
  static fact(s: PlaySession, name: string, ...args: string[]) {
    return s.campaign.world.test(ModuleWriter.call(name, ...args));
  }
  static num(s: PlaySession, name: string, ...args: string[]) {
    return s.campaign.world.number(ModuleWriter.call(name, ...args));
  }
  static seen(s: PlaySession) { return PlayerView.observe(s.campaign).observations.map(o => o.text).join(' '); }
  static legal(s: PlaySession) { return PlayerView.choices(s.campaign).map(c => c.choice.id); }
  static async hours(s: PlaySession, n: number, each?: (h: number) => Promise<void>) {
    for (let h = 0; h < n; h++) { await each?.(h); await s.perform('wait_hour'); }
  }
  // Ninefingers is given the First Light and leaves the Gap with her crew.
  static async liftToll(s: PlaySession) {
    this.change(s, { kind: 'retract', call: ModuleWriter.call('at', 'lanthorn__first', 'lanthorn__first_vault') },
      { kind: 'assert', call: ModuleWriter.call('keeps', 'lanthorn__ninefingers', 'lanthorn__first') });
    await s.perform('wait');
  }
}

describe('a settlement that feeds a power', () => {
  it('sells the crew its meal on credit; bought up, the crew go hungry and take Skerry\'s instead', async () => {
    const fed = await World.start();
    await World.hours(fed, 120);
    expect([World.num(fed, 'owes', 'lanthorn__ninefingers', 'varrow__bryony'), World.num(fed, 'losses', 'varrow__square')])
      .toEqual([8, 0]);
    const starved = await World.start();
    World.put(starved, 'varrow__heron');
    World.purse(starved, starved.campaign.state.partyIds[0]!, 60);
    await World.hours(starved, 120, async () => {
      for (let id; (id = World.legal(starved).find(x => x.startsWith('buy_goods(rations,varrow__bryony)')));) {
        await starved.perform(id);
      }
    });
    expect(World.num(starved, 'owes', 'lanthorn__ninefingers', 'varrow__bryony')).toBe(0);
    expect(World.num(starved, 'losses', 'varrow__square')).toBeGreaterThanOrEqual(3);
    expect(World.seen(starved)).toContain('meal bin behind the bar stands open and empty');
  }, 300000);
});

describe('a power that tolls a road', () => {
  it('keeps Skerry\'s grain dear and Hollin\'s goldsmith short of silver until the Gap is open', async () => {
    const s = await World.start();
    World.purse(s, 'varrow__iselde_person', 100);
    await World.hours(s, 24);
    expect([World.num(s, 'goodsPrice', 'varrow__keld', 'rations'), World.num(s, 'quantity', 'varrow__iselde', 'gold')])
      .toEqual([3, 100]);
    World.put(s, 'varrow__market');
    await s.perform('wait');
    expect(World.seen(s)).toContain('going nowhere');
    await World.liftToll(s);
    await World.hours(s, 24);
    expect(World.num(s, 'goodsPrice', 'varrow__keld', 'rations')).toBe(2);
    expect(World.num(s, 'quantity', 'varrow__iselde', 'gold')).toBe(130);
    expect(World.seen(s)).toContain('Grain wagons are going out');
  }, 120000);
});

describe('a way round the Toll', () => {
  it('is watched once it is seen used: the watch on the cairn field takes the Toll and keeps the Skerry road', async () => {
    const s = await World.start();
    World.put(s, 'varrow__shoulder');
    const [seen] = [await s.perform('wait')];
    expect((seen.perceptions ?? []).map(p => p.text).join(' ')).toContain('goes down the stair in a hurry');
    await World.hours(s, 24);
    expect(World.fact(s, 'tolls', 'lanthorn__lookouts', 'varrow__cairn_field')).toBe(true);
    const down = await s.perform(World.legal(s).find(x => x.startsWith('go(varrow__shoulder_down'))!);
    expect((down.perceptions ?? []).map(p => p.text).join(' ')).toContain('six coin this side too');
    expect(World.legal(s).some(x => x.startsWith('go(varrow__skerry_road'))).toBe(false);
    await s.perform('lanthorn__pay_watch(party,varrow__cairn_field)');
    expect(World.legal(s)).toContain('go(varrow__skerry_road,varrow__square)');
  }, 120000);
});

describe('a stronghold left empty', () => {
  it('is taken by the hobs who covet it, and the company coming back finds them in the gate passage', async () => {
    const s = await World.start();
    await World.liftToll(s);
    expect(World.fact(s, 'vacant', 'lanthorn__gate_passage')).toBe(true);
    await World.hours(s, 30);
    // The same band that waylays the valley road and keeps the Hob-Knot, not a copy.
    expect([World.fact(s, 'holds', 'knotFolk__gaffer', 'lanthorn__gate_passage'),
      World.fact(s, 'at', 'knotFolk__raiders', 'lanthorn__gate_passage')]).toEqual([true, true]);
    World.put(s, 'varrow__toll_gate');
    await s.perform('wait');
    expect(World.seen(s)).toContain('Somebody has moved into the Lanthorn');
    const inside = await s.perform('go(lanthorn__outer_gate,lanthorn__gate_passage)');
    expect(JSON.stringify(inside)).toContain('Small shapes come boiling out');
  }, 120000);
});
