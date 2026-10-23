import { describe, expect, it } from 'bun:test';
import { WorldAssembler } from '../src/world/world-assembler';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { PlaySession } from '../src/session/play-session';
import { PlayerView } from '../src/presentation/player-view';
import { ModuleWriter } from '../src/lang/module-writer';

// What the company does to a power, the power answers. In a1 a lord's customs-men keep the toll on the road from
// Faennslím to Wǽttún, and Faennslím's inn feeds them. Walk on past the bar without paying and the lord hears of
// it: the inn bars its door, and riders go out to Faennslím to wait for the company. There they warn it: twenty coin
// for the toll-house, or come with them. Paid, they go home, and the inn serves the company again.
class Lord {
  static async start() {
    const w = await WorldAssembler.assemble('a1', NodeBundleSource.shared);
    return PlaySession.start(w.path, 'a1', w.source);
  }
  static change(s: PlaySession, ...calls: [string, string, ...string[]][]) {
    const c = s.campaign as unknown as { world: { apply(c: unknown[]): unknown }; commit(w: unknown): void };
    c.commit(c.world.apply(calls.map(([kind, name, ...args]) => kind === 'set'
      ? { kind, call: ModuleWriter.call(name, ...args.slice(0, -1)), value: ModuleWriter.number(Number(args.at(-1))) }
      : { kind, call: ModuleWriter.call(name, ...args) })));
  }
  static told(e: { perceptions?: { text: string }[] }) { return (e.perceptions ?? []).map(p => p.text).join(' '); }
  static fact(s: PlaySession, name: string, ...args: string[]) {
    return s.campaign.world.test(ModuleWriter.call(name, ...args));
  }
}

describe('a power answering the company', () => {
  it('sends riders after a company that runs the lord\'s toll, who take his fine and go home', async () => {
    const s = await Lord.start();
    Lord.change(s, ['assert', 'at', 'party', 'region__s2_green']);
    await s.perform('wait');
    const stopped = await s.perform('go(region__road_s2_s3,region__s2_s3_way)');
    expect(Lord.told(stopped)).toContain('The lord\'s toll');
    const ran = await s.perform('go(region__road_s2_s3_on,region__s3_green)');
    expect(Lord.fact(s, 'hostile', 'tollKeepers__chief', 'party')).toBe(true);
    expect(Lord.told(ran)).toContain('riders out to');
    expect(s.campaign.world.one('at', 'tollKeepers__riders')).toBe('region__s2_green');
    // At Faennslím the riders are waiting, and say what they want.
    Lord.change(s, ['assert', 'at', 'party', 'region__s2_green'], ['set', 'quantity', 'party', 'gold', '30']);
    const met = await s.perform('wait');
    expect(Lord.told(met)).toContain('Twenty coin for his toll-house');
    expect(Lord.fact(s, 'refusesService', 'region__s2_innkeeper', 'party')).toBe(true);
    await s.perform(PlayerView.choices(s.campaign).find(c => c.choice.id.startsWith('tollKeepers__pay_fine'))!.choice.id);
    expect([Lord.fact(s, 'hostile', 'tollKeepers__chief', 'party'), Lord.fact(s, 'refusesService', 'region__s2_innkeeper', 'party'),
      s.campaign.world.one('at', 'tollKeepers__riders')]).toEqual([false, false, 'tollKeepers__hall']);
  }, 120000);
});
