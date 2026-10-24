import { describe, expect, it } from 'bun:test';
import { WorldAssembler } from '../src/world/world-assembler';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { PlaySession } from '../src/session/play-session';
import { PlayerView } from '../src/presentation/player-view';
import { ActionFeedbackView } from '../src/presentation/action-feedback';
import { ModuleWriter } from '../src/lang/module-writer';
import type { Change } from '../src/lang/module';

// A lantern burns a flask of lamp oil at a time, and a company may carry more than one flask: each is offered by
// name, and filling from one spends that one. (A second flask once made two choices of one name, and play stopped.)
class Lamp {
  static async start() {
    const w = await WorldAssembler.assemble('wren', NodeBundleSource.shared,
      { origin: 'wanderer', party: [{ name: 'Wenna', raceId: 'human', classId: 'warrior' }] });
    const s = await PlaySession.start(w.path, 'wren', w.source);
    const c = s.campaign as unknown as { world: { apply(c: Change[]): unknown }; commit(w: unknown): void };
    c.commit(c.world.apply([{ kind: 'assert', call: ModuleWriter.call('at', 'party', 'region__s1_shop') }]));
    return s;
  }
  static names(s: PlaySession) { return PlayerView.choices(s.campaign).map(c => c.choice.name); }
  static async take(s: PlaySession, pattern: RegExp) {
    const c = PlayerView.choices(s.campaign).find(x => pattern.test(x.choice.name));
    if (!c) { throw new Error(`No ${pattern}: ${this.names(s).join(' | ')}`); }
    const before = PlayerView.observe(s.campaign), event = await s.perform(c.choice.id);
    const f = ActionFeedbackView.read(s.campaign, event, before);
    return [f.result, ...f.events, ...f.observations].join(' ');
  }
}

describe('a lantern and its oil', () => {
  it('is filled from any one of the flasks carried, and burns', async () => {
    const s = await Lamp.start();
    await Lamp.take(s, /^Buy a lantern for Wenna/);
    await Lamp.take(s, /^Buy a flask of lamp oil for Wenna/);
    await Lamp.take(s, /^Buy a flask of lamp oil for Wenna/);
    const fills = Lamp.names(s).filter(n => n === 'Fill a lantern from a flask of lamp oil and light it');
    expect(fills).toHaveLength(2);
    expect(await Lamp.take(s, /^Fill a lantern from a flask of lamp oil and light it$/))
      .toContain('fills a lantern and lights it');
    expect(Lamp.names(s).filter(n => n.startsWith('Fill a lantern'))).toHaveLength(1);
  }, 60000);
  it('is sold again once burned: at dawn what the smith sold and was spent is back on the shelf', async () => {
    const s = await Lamp.start();
    const flasks = () => Lamp.names(s).filter(n => /^Buy a flask of lamp oil for Wenna/.test(n));
    const stock = flasks().length;
    await Lamp.take(s, /^Buy a lantern for Wenna/);
    for (let i = 0; i < stock; i++) { await Lamp.take(s, /^Buy a flask of lamp oil for Wenna/); }
    expect(flasks()).toHaveLength(0);
    await Lamp.take(s, /^Fill a lantern from a flask of lamp oil and light it$/);
    const watch = () => s.campaign.world.number(ModuleWriter.call('watch', 'clock')), start = watch();
    while (watch() < start + 144) { await Lamp.take(s, /^Wait an hour$/); }
    // One was burned and is back; the rest are still in the pack, and are not.
    expect(flasks()).toHaveLength(1);
  }, 60000);
});
