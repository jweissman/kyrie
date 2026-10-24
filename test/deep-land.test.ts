import { describe, expect, it } from 'bun:test';
import { WorldAssembler } from '../src/world/world-assembler';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { PlaySession } from '../src/session/play-session';
import { PlayerView } from '../src/presentation/player-view';
import { ModuleWriter } from '../src/lang/module-writer';
import type { Change } from '../src/lang/module';
import type { CreatureStore } from '../src/creature-store';

// The land round a deep site shows what keeps its bottom (data/generation/deep, land): a blight anyone sees at its
// door while the keeper is there; what a skill reads in it, which says something of what the keeper cannot bear (in
// wren's mine, the ravens come down onto the spoil only at noon, with the sun full on the hill); and the land coming
// back once the keeper is gone.
class Door {
  static async start(calling: string) {
    const w = await WorldAssembler.assemble('wren', NodeBundleSource.shared,
      { origin: 'wanderer', party: [{ name: 'Wenna', raceId: 'human', classId: calling }] });
    const s = await PlaySession.start(w.path, 'wren', w.source);
    const c = s.campaign as unknown as { world: { apply(c: Change[]): unknown }; commit(w: unknown): void };
    c.commit(c.world.apply([{ kind: 'assert', call: ModuleWriter.call('at', 'party', 'region__w9') }]));
    return s;
  }
  static seen(s: PlaySession) { return PlayerView.observe(s.campaign).observations.map(o => o.text).join(' '); }
}

describe('the land at a deep site\'s door', () => {
  it('shows anyone that something is wrong, and someone who reads wild country what it is', async () => {
    const warrior = await Door.start('warrior'), ranger = await Door.start('ranger');
    for (const s of [warrior, ranger]) { expect(Door.seen(s)).toContain('The heather stops a long stride short'); }
    expect(Door.seen(warrior)).not.toContain('the ravens come down');
    expect(Door.seen(ranger)).toContain('Only at noon, with the sun full on the hillside, do the ravens come down');
  }, 60000);
  it('comes back once what keeps the bottom is gone', async () => {
    const s = await Door.start('warrior');
    const lease = (s.campaign as unknown as { creatures: CreatureStore }).creatures.acquire(['region__w9_keeper_person']);
    try { lease.creatures[0]!.state.hp = 0; lease.commit(lease.creatures); } finally { lease.release(); }
    await s.perform('wait');
    expect(Door.seen(s)).toContain('a wheatear has a nest in the spoil');
    expect(Door.seen(s)).not.toContain('The heather stops a long stride short');
  }, 60000);
});
