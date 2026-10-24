import { describe, expect, it } from 'bun:test';
import { WorldAssembler } from '../src/world/world-assembler';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { PlaySession } from '../src/session/play-session';
import { Frontier } from '../src/world/frontier';
import { GeneratedWorld } from './support/generated';

// A module installed after a campaign began counts its days from when it was installed. Eighteen days in, the country
// east of the march is drawn when the company first stands there: beyond b2, with a child sick of a fever that kills
// her on the tenth day of its own telling, alive when the company arrives; beyond a1, with a brood that raids by its
// own clock.
class Late {
  static readonly fixed = /"name":"watch","args":\["clock"\]\},"right":\{"kind":"number","value":(\d+)/;
  static async beyond(seed: string) {
    const w = await WorldAssembler.assemble(seed, NodeBundleSource.shared);
    const s = await PlaySession.start(w.path, seed, w.source);
    (s.campaign as unknown as { current: { elapsed: number } }).current.elapsed = 18 * 144;
    GeneratedWorld.put(s, 'edge_east');
    await s.perform('wait');
    await new Frontier(seed, NodeBundleSource.shared).expand(s.campaign);
    return s;
  }
}
describe('a module installed late', () => {
  it('counts a fever\'s days from when it was installed', async () => {
    const s = await Late.beyond('b2');
    const timed = (s.campaign.module.rules ?? []).filter(r => r.id.startsWith('x1y0fever')
      && Late.fixed.test(JSON.stringify(r.when)));
    expect(timed.length).toBeGreaterThan(0);
    for (const rule of timed) {
      expect(Number(Late.fixed.exec(JSON.stringify(rule.when))![1])).toBeGreaterThan(18 * 144);
    }
    const said = await s.perform('wait') as { perceptions?: { text: string }[] };
    expect(said.perceptions?.some(p => /has died/.test(p.text)) ?? false).toBe(false);
  }, 120000);
  it('counts its own time from when it was installed', async () => {
    const s = await Late.beyond('a1'), fixed = Late.fixed;
    // What was installed with the campaign keeps the times it was written with.
    const home = (s.campaign.module.rules ?? []).find(r => r.id === 'drover__son_goes')!;
    expect(Number(fixed.exec(JSON.stringify(home.when))![1])).toBe(204);
    // And where it starts a measure the clock is compared with, it starts it from then too.
    const raids = s.campaign.world.measured('x1y0brood__raidAt');
    for (const m of raids) { expect(m.value).toBeGreaterThan(18 * 144); }
    const said = await s.perform('wait') as { perceptions?: { text: string }[] };
    expect(said.perceptions?.some(p => /has died|gone out on the road alone/.test(p.text)) ?? false).toBe(false);
  }, 120000);
});
