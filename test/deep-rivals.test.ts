import { describe, expect, it } from 'bun:test';
import { WorldAssembler } from '../src/world/world-assembler';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { PlaySession } from '../src/session/play-session';
import { PlayerView } from '../src/presentation/player-view';
import { ActionFeedbackView } from '../src/presentation/action-feedback';
import { ModuleWriter } from '../src/lang/module-writer';
import type { Change } from '../src/lang/module';
import type { CreatureStore } from '../src/creature-store';

// Someone else is after the deep site's prize (data/generation/deep/powers.json, data/rules/ambitions.kyr). In wren
// the kingdom after the Delvers was an order of monks, and their brothers are still at Gothgiba: the prior wants the
// heart of the vein put where it can do no harm, pays for it, and stands the company an advance. On the second
// morning the brothers go up to Aurumtener themselves, and go down a level every two days, leaving their mark. At
// the bottom the keeper breaks them, if it is still there, and what they carried is left lying; if it is not, they
// bring the heart up, and the company's errand is over.
class Rivals {
  static readonly id = 'region__w9_rivals';
  static async start(seed = 'wren') {
    const w = await WorldAssembler.assemble(seed, NodeBundleSource.shared,
      { origin: 'wanderer', party: [{ name: 'Wenna', raceId: 'human', classId: 'warrior' }] });
    return PlaySession.start(w.path, seed, w.source);
  }
  static set(s: PlaySession, changes: Change[]) {
    const c = s.campaign as unknown as { world: { apply(c: Change[]): unknown }; commit(w: unknown): void };
    c.commit(c.world.apply(changes));
  }
  // The company somewhere, in light enough to see it.
  static put(s: PlaySession, place: string) {
    this.set(s, [{ kind: 'assert', call: ModuleWriter.call('at', 'party', place) },
      { kind: 'retract', call: ModuleWriter.call('unlit', place) }]);
  }
  static stage(s: PlaySession, n: number) {
    this.set(s, [{ kind: 'set', call: ModuleWriter.call('stage', this.id), value: { kind: 'number', value: n } }]);
  }
  // Where an observation of the rivals' is seen: their mark on a level, or where they fell.
  static where(s: PlaySession, observation: string): string {
    return s.campaign.module.observations!.find(o => o.id === `${this.id}_${observation}`)!.place;
  }
  static test(s: PlaySession, name: string, ...args: string[]) {
    return s.campaign.world.test(ModuleWriter.call(name, ...args));
  }
  static pays(s: PlaySession) { return s.campaign.world.number(ModuleWriter.call('pays', 'region__w9_head', 'star_iron_heart')); }
  static names(s: PlaySession) { return PlayerView.choices(s.campaign).map(c => c.choice.name); }
  static seen(s: PlaySession) { return PlayerView.observe(s.campaign).observations.map(o => o.text).join(' '); }
  static async take(s: PlaySession, pattern: RegExp) {
    const c = PlayerView.choices(s.campaign).find(x => pattern.test(x.choice.name));
    if (!c) { throw new Error(`No ${pattern}: ${this.names(s).join(' | ')}`); }
    const before = PlayerView.observe(s.campaign), event = await s.perform(c.choice.id);
    const f = ActionFeedbackView.read(s.campaign, event, before);
    return [f.result, ...f.immediate, ...(event.perceptions ?? []).map(p => p.text)].join(' ');
  }
  static slay(s: PlaySession, creature: string) {
    const lease = (s.campaign as unknown as { creatures: CreatureStore }).creatures.acquire([creature]);
    try { lease.creatures[0]!.state.hp = 0; lease.commit(lease.creatures); } finally { lease.release(); }
  }
}

describe('rivals for a deep site\'s prize', () => {
  it('are told of by their head, who pays for the prize and stands the company an advance against it', async () => {
    const s = await Rivals.start();
    Rivals.put(s, 'region__s1_green');
    expect(await Rivals.take(s, /^Ask the prior about the old workings$/))
      .toMatch(/The brothers of Ísenheald kept that place once.*we can give 1000 coin/);
    expect([Rivals.test(s, 'knows', 'party', `${Rivals.id}_offer`), Rivals.test(s, 'knows', 'party', 'region__w9_named')])
      .toEqual([true, true]);
    expect(await Rivals.take(s, /^Ask the prior for something to go down with$/)).toContain('ten coin');
    expect(Rivals.pays(s)).toBe(990);
  }, 60000);
  it('set out on the second morning, as the talk has it, and leave their mark on each level they pass', async () => {
    const s = await Rivals.start();
    Rivals.put(s, 'region__s1_taproom');
    await Rivals.take(s, /^Wait until dark$/);
    expect(await Rivals.take(s, /^Wait until first light$/)).toContain('The talk is all of the brothers');
    expect(s.campaign.world.number(ModuleWriter.call('stage', Rivals.id))).toBe(1);
    Rivals.stage(s, 3);
    for (const [mark, shown] of [['trace0', true], ['trace1', true], ['trace2', false]] as const) {
      Rivals.put(s, Rivals.where(s, mark));
      expect(Rivals.seen(s).includes('Someone else has been this way: a cross is scratched')).toBe(shown);
    }
  }, 60000);
  it('are broken at the bottom by a keeper still there, while the company is not, and the price goes up', async () => {
    const s = await Rivals.start(), bottom = Rivals.where(s, 'fallen');
    Rivals.stage(s, 5);
    Rivals.put(s, bottom);
    await s.perform('wait');
    expect(Rivals.test(s, 'foiled', Rivals.id)).toBe(false);
    Rivals.put(s, 'region__s1_green');
    await s.perform('wait');
    expect(Rivals.test(s, 'foiled', Rivals.id)).toBe(true);
    expect(Rivals.pays(s)).toBe(1500);
    expect(await Rivals.take(s, /^Ask the prior what became of the brothers$/)).toContain('find 1500 coin for it');
    // Where they fell, they lie, and what they carried is there to be taken.
    Rivals.put(s, bottom);
    expect(Rivals.seen(s)).toContain('Here the brothers met whatever is below');
    expect(Rivals.names(s).some(n => /^Collect a lantern for Wenna$/.test(n))).toBe(true);
  }, 60000);
  it('bring the prize up to their head when the keeper is gone, and the company\'s errand is over', async () => {
    const s = await Rivals.start();
    Rivals.slay(s, 'region__w9_keeper_person');
    Rivals.stage(s, 5);
    Rivals.put(s, 'region__s1_green');
    await s.perform('wait');
    expect([Rivals.test(s, 'won', Rivals.id), Rivals.test(s, 'keeps', 'region__w9_head', 'region__w9_heart'),
      Rivals.test(s, 'region__w9_raised')]).toEqual([true, true, true]);
    expect(Rivals.seen(s)).toContain('The heart of the vein lies in Gothgiba now, under a cloth');
  }, 60000);
  it('take the prize from the company for what their head said, and say what becomes of it', async () => {
    const s = await Rivals.start();
    Rivals.set(s, [{ kind: 'assert', call: ModuleWriter.call('at', 'region__w9_heart', 'region__s1_green') }]);
    Rivals.put(s, 'region__s1_green');
    await Rivals.take(s, /^Collect the heart of the vein for Wenna$/);
    expect(await Rivals.take(s, /^Sell the heart of the vein to the prior$/)).toContain('carried away under a cloth');
    expect(Rivals.test(s, 'won', Rivals.id)).toBe(true);
    expect(Rivals.seen(s)).not.toContain('the brothers brought it up');
  }, 60000);
  it('are the heirs of whatever kingdom came after the makers: in b2, the warlords\' castellan at their fort', async () => {
    const s = await Rivals.start('b2'), head = s.campaign.module.entities.find(e => e.id === 'region__w8_head')!;
    expect([head.name, s.campaign.world.one('at', head.id)])
      .toEqual(['the castellan, who holds Ramavor for the house of Aergodríce', 'region__s1_green']);
    expect(s.campaign.module.entities.find(e => e.id === 'region__s1')!.name).toBe('Ramavor');
  }, 60000);
});
