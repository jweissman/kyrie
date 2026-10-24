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
    this.put(s, 'region__s1_shop');
    return s;
  }
  static put(s: PlaySession, place: string) {
    const c = s.campaign as unknown as { world: { apply(c: Change[]): unknown }; commit(w: unknown): void };
    c.commit(c.world.apply([{ kind: 'assert', call: ModuleWriter.call('at', 'party', place) }]));
  }
  // The mine with nobody in it, to keep the lamp's company and no other.
  static empty(s: PlaySession) {
    const groups = s.campaign.module.entities.filter(e => e.type === 'group' && e.id.startsWith('region__w9_')).map(e => e.id);
    const c = s.campaign as unknown as { world: { apply(c: Change[]): unknown }; commit(w: unknown): void };
    c.commit(c.world.apply(s.campaign.world.related('at').filter(r => groups.includes(r.args[0]!))
      .map(r => ({ kind: 'retract' as const, call: ModuleWriter.call('at', ...r.args) }))));
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
    // Two flasks alike are one choice: either will do.
    const fills = Lamp.names(s).filter(n => n === 'Fill a lantern from a flask of lamp oil and light it');
    expect(fills).toHaveLength(1);
    expect(await Lamp.take(s, /^Fill a lantern from a flask of lamp oil and light it$/))
      .toContain('fills a lantern and lights it');
    expect(s.campaign.readout.creatures.flatMap(c => c.state.inventory ?? [])
      .filter(i => i.definition === 'lamp_oil')).toHaveLength(1);
  }, 60000);
  it('burns only while it is wanted: not in a lit room, nor while the company sleeps', async () => {
    const s = await Lamp.start();
    await Lamp.take(s, /^Buy a lantern for Wenna/);
    await Lamp.take(s, /^Buy a flask of lamp oil for Wenna/);
    await Lamp.take(s, /^Fill a lantern from a flask of lamp oil and light it$/);
    const lit = () => s.campaign.readout.creatures.some(c => c.state.conditions.some(x => x.id === 'lamplit'));
    for (let i = 0; i < 7; i++) { await Lamp.take(s, /^Wait an hour$/); }
    expect(lit()).toBe(true);
    // Down in the dark it burns; put out to sleep, it does not, and is there to light again on waking. (With nothing
    // to eat, a rest is still offered, and says why it cannot be had.)
    Lamp.empty(s);
    Lamp.put(s, 'region__w9_haulage_hall');
    const c = s.campaign as unknown as { world: { apply(c: Change[]): unknown }; commit(w: unknown): void };
    c.commit(c.world.apply([{ kind: 'set', call: ModuleWriter.call('quantity', 'party', 'rations'), value: ModuleWriter.number(0) }]));
    expect(await Lamp.take(s, /^Rest and recover/)).toContain('a rest wants a ration');
    Lamp.put(s, 'region__s1_taproom');
    await Lamp.take(s, /^Buy one ration/);
    Lamp.put(s, 'region__w9_haulage_hall');
    // The one ration is the rest's meal, eaten once though a meal fell due in the six hours (it was taken twice, and
    // play stopped).
    await Lamp.take(s, /^Rest and recover/);
    expect(s.campaign.world.number(ModuleWriter.call('quantity', 'party', 'rations'))).toBe(0);
    expect(lit()).toBe(true);
    for (let i = 0; i < 6; i++) { await Lamp.take(s, /^Wait an hour$/); }
    expect(lit()).toBe(false);
  }, 60000);
  // With more than one ration it was eaten twice all the same, found playing cov2: the day's meal, due as the rest
  // began, eaten in its first watch, and the rest's own at its end.
  it('eats one ration for a rest, though the day\'s meal fell due while it slept', async () => {
    const s = await Lamp.start();
    Lamp.empty(s);
    Lamp.put(s, 'region__w9_haulage_hall');
    const c = s.campaign as unknown as { world: { apply(c: Change[]): unknown }; commit(w: unknown): void };
    const watch = s.campaign.world.number(ModuleWriter.call('watch', 'clock'));
    c.commit(c.world.apply([{ kind: 'set', call: ModuleWriter.call('quantity', 'party', 'rations'), value: ModuleWriter.number(3) },
      { kind: 'set', call: ModuleWriter.call('nextMeal', 'party'), value: ModuleWriter.number(watch) }]));
    await Lamp.take(s, /^Rest and recover/);
    for (let i = 0; i < 2; i++) { await Lamp.take(s, /^Wait a while$/); }
    expect(s.campaign.world.number(ModuleWriter.call('quantity', 'party', 'rations'))).toBe(2);
  }, 60000);
  it('is sold again once burned: at dawn what the smith sold and was spent is back on the shelf', async () => {
    const s = await Lamp.start();
    const flasks = () => s.campaign.world.number(ModuleWriter.call('shelf', 'region__s1_merchant', 'lamp_oil'));
    const stock = flasks();
    expect(stock).toBeGreaterThan(1);
    await Lamp.take(s, /^Buy a lantern for Wenna/);
    for (let i = 0; i < stock; i++) { await Lamp.take(s, /^Buy a flask of lamp oil for Wenna/); }
    expect([flasks(), Lamp.names(s).some(n => /^Buy a flask of lamp oil/.test(n))]).toEqual([0, false]);
    await Lamp.take(s, /^Fill a lantern from a flask of lamp oil and light it$/);
    const watch = () => s.campaign.world.number(ModuleWriter.call('watch', 'clock')), start = watch();
    while (watch() < start + 144) { await Lamp.take(s, /^Wait an hour$/); }
    // One was burned and is back; the rest are still in the pack, and are not.
    expect(flasks()).toBe(1);
  }, 60000);
});
