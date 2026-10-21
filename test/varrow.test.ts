import { describe, expect, it } from 'bun:test';
import { PlaySession } from '../src/session/play-session';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { PlayerView } from '../src/presentation/player-view';
import { ModuleWriter } from '../src/lang/module-writer';
import type { Change } from '../src/lang/module';

// The Varrow (data/regions/varrow): the valley road and the Gap road, the weather that floods the ford and snows
// over the goat path, and Hob raiders who come up out of the gorse at night.
class Varrow {
  static start(seed = 'varrow') {
    return PlaySession.start('data/campaigns/varrow.campaign.json', seed, NodeBundleSource.shared);
  }
  static legal(s: PlaySession) { return PlayerView.choices(s.campaign).map(c => c.choice.id); }
  static state(s: PlaySession, id: string) {
    return s.campaign.world.snapshot.relations.find(r => r.name === 'state' && r.args[0] === id)?.args[1];
  }
  static where(s: PlaySession) {
    return s.campaign.world.snapshot.relations.find(r => r.name === 'at' && r.args[0] === 'party')?.args[1];
  }
  // Puts the world in a state for a test: the weather, where the company stands, what it knows.
  static set(s: PlaySession, ...changes: Change[]) {
    const c = s.campaign as unknown as { world: { apply(c: Change[]): unknown }; commit(w: unknown): void };
    c.commit(c.world.apply(changes));
  }
  static assert(name: string, ...args: string[]): Change { return { kind: 'assert', call: ModuleWriter.call(name, ...args) }; }
  static async walk(s: PlaySession, commands: string[]) {
    for (const c of commands) { await s.perform(Varrow.legal(s).find(id => id.startsWith(c)) ?? c); }
  }
  static readonly toFord = ['go(varrow__valley_road', 'go(varrow__river_road', 'go(varrow__alder_lane'];
}

describe('the Varrow road', () => {
  it('takes most of a day from Hollin market to the Toll gate, by Two Barrows and Crake\'s Ford', async () => {
    const s = await Varrow.start();
    await Varrow.walk(s, [...Varrow.toFord, 'go(varrow__the_ford', 'go(varrow__gap_road', 'go(varrow__cairn_road',
      'go(varrow__toll_road']);
    expect(Varrow.where(s)).toBe('varrow__toll_gate');
    expect(s.campaign.state.elapsed).toBeGreaterThanOrEqual(9 * 6);
  }, 60000);
  it('keeps the goat path out of sight until a woodsman searches the switchbacks or Jory tells of it', async () => {
    const s = await Varrow.start();
    await Varrow.walk(s, [...Varrow.toFord, 'go(varrow__smithy_door', 'varrow__jory_path', 'go(varrow__smithy_door',
      'go(varrow__the_ford', 'go(varrow__gap_road']);
    expect(s.campaign.world.test(ModuleWriter.call('knows', 'party', 'varrow__goat_path_known'))).toBe(true);
    // Known now, but nobody in this company climbs and nobody carries a rope.
    expect(Varrow.legal(s).some(c => c.startsWith('go(varrow__goat_path'))).toBe(false);
  }, 60000);
});

describe('weather', () => {
  it('swells the ford in rain, so the Gap road cannot be reached from the valley', async () => {
    const s = await Varrow.start();
    await Varrow.walk(s, Varrow.toFord);
    expect(Varrow.legal(s)).toContain('go(varrow__the_ford,varrow__far_bank)');
    Varrow.set(s, Varrow.assert('state', 'varrow__sky', 'varrow__rain'));
    await s.perform('wait');
    expect(Varrow.state(s, 'varrow__spate')).toBe('varrow__swollen');
    expect(Varrow.legal(s)).not.toContain('go(varrow__the_ford,varrow__far_bank)');
    expect(PlayerView.observe(s.campaign).observations.map(o => o.text).join(' ')).toContain('in spate');
  }, 60000);
  it('fills the goat path with snow and slows the Gap road while it rains below', async () => {
    const s = await Varrow.start();
    Varrow.set(s, Varrow.assert('state', 'varrow__sky', 'varrow__rain'));
    await s.perform('wait');
    expect(Varrow.state(s, 'varrow__drifts')).toBe('varrow__drifted');
    expect(s.campaign.world.number(ModuleWriter.call('travelTime', 'varrow__gap_road'))).toBe(18);
  }, 60000);
  it('turns before dawn by the watch\'s die, the same way for the same seed', async () => {
    const skies = async (seed: string) => {
      const s = await Varrow.start(seed), seen: string[] = [];
      for (let day = 0; day < 6; day++) {
        await s.perform('camp(varrow__market)').catch(() => s.perform('wait_hour'));
        for (let h = 0; h < 24; h++) { await s.perform('wait_hour'); }
        seen.push(Varrow.state(s, 'varrow__sky')!);
      }
      return seen;
    };
    const a = await skies('weather'), b = await skies('weather');
    expect(a).toEqual(b);
    expect(new Set(a).size).toBeGreaterThan(1);
  }, 120000);
});

describe('raiders on the road', () => {
  it('fall on a company that waits by the barrows through the night', async () => {
    const s = await Varrow.start();
    await Varrow.walk(s, ['go(varrow__valley_road']);
    let event;
    for (let hour = 0; hour < 24 && !event?.prelude; hour++) { event = await s.perform('wait_hour'); }
    expect(event?.prelude?.response).toContain('Hob raiders');
    expect(event?.combat.some(e => e.type === 'end')).toBe(true);
  }, 120000);
  it('stay in the gorse by day in clear weather', async () => {
    const s = await Varrow.start();
    await Varrow.walk(s, ['go(varrow__valley_road']);
    for (let hour = 0; hour < 6; hour++) {
      const event = await s.perform('wait_hour');
      expect(event.prelude).toBeUndefined();
    }
  }, 60000);
});
