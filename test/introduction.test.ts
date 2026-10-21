import { describe, expect, it } from 'bun:test';
import { PlaySession } from '../src/session/play-session';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { OverlayBundleSource } from '../src/campaign/overlay-bundle-source';
import { ModuleWriter } from '../src/lang/module-writer';
import { PlayerView } from '../src/presentation/player-view';
import type { BundleRequest } from '../src/campaign/module-bundle';
import { join } from 'node:path';

// A plane and a city brought into a campaign already under way: the Varrow played without them for a while, then the
// Unlit and Brack installed. What the company did and learnt stays done and learnt; the new country is reachable from
// where it already is, by the doors and roads the new modules declare.
class Later {
  static readonly varrow = 'data/campaigns/varrow.campaign.json';
  static async begin() {
    const source = NodeBundleSource.shared, path = source.resolve(this.varrow);
    const manifest = JSON.parse(await source.read(path)) as { modules: { id?: string }[] };
    // The held-back modules' bundles are named relative to the campaign file; installed directly, from the root.
    const held = (manifest.modules.filter(m => m.id === 'unlit' || m.id === 'brack') as BundleRequest[])
      .map(m => ({ ...m, bundle: join('data/campaigns', m.bundle!) }));
    manifest.modules = manifest.modules.filter(m => m.id !== 'unlit' && m.id !== 'brack');
    const at = source.resolve('data/campaigns/varrow-without.campaign.json');
    const s = await PlaySession.start(at, 'later', new OverlayBundleSource(source, { [at]: JSON.stringify(manifest) }));
    return { s, held, source };
  }
  static async walk(s: PlaySession, ...labels: string[]) {
    for (const label of labels) {
      const hit = PlayerView.choices(s.campaign).find(c => c.choice.name.startsWith(label));
      if (!hit) { throw new Error(`No "${label}"`); }
      await s.perform(hit.choice.id);
    }
  }
}

describe('a plane and a city introduced later', () => {
  it('keeps what the company did and learnt, and opens the new country from where it is', async () => {
    const { s, held, source } = await Later.begin();
    await Later.walk(s, 'Take the Wheatsheaf', 'Ask Wenna what is said', 'Take the Wheatsheaf', 'Take the Varrow road');
    const c = s.campaign;
    const before = { gold: c.world.number(ModuleWriter.call('quantity', 'party', 'gold')),
      where: c.world.snapshot.relations.find(r => r.name === 'at' && r.args[0] === 'party')!.args[1],
      knows: c.world.test(ModuleWriter.call('knows', 'party', 'varrow__barrow_lights')), elapsed: c.state.elapsed,
      relations: c.world.snapshot.relations.filter(r => !r.args.some(a => a.startsWith('unlit__') || a.startsWith('brack__'))).length };
    expect(before.knows).toBe(true);
    for (const request of held) { await c.install(request, source); }
    expect(c.world.number(ModuleWriter.call('quantity', 'party', 'gold'))).toBe(before.gold);
    expect(c.world.test(ModuleWriter.call('at', 'party', before.where!))).toBe(true);
    expect(c.world.test(ModuleWriter.call('knows', 'party', 'varrow__barrow_lights'))).toBe(true);
    expect(c.state.elapsed).toBe(before.elapsed);
    // Nothing the company had was lost; the new country only adds.
    const kept = c.world.snapshot.relations.filter(r => !r.args.some(a => a.startsWith('unlit__') || a.startsWith('brack__')));
    expect(kept.length).toBeGreaterThanOrEqual(before.relations);
    expect(c.world.module.entities.some(e => e.id === 'unlit__veil')).toBe(true);
    // The salt road now leaves Hollin market for Brack.
    await Later.walk(s, 'Take the Varrow road');
    expect(PlayerView.choices(c).some(ch => ch.choice.name.startsWith('Take the salt road'))).toBe(true);
  }, 180000);
});
