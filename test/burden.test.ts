import { describe, expect, it } from 'bun:test';
import { WorldAssembler } from '../src/world/world-assembler';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { PlaySession } from '../src/session/play-session';
import { PlayerView } from '../src/presentation/player-view';
import { ActionFeedbackView } from '../src/presentation/action-feedback';
import { ModuleWriter } from '../src/lang/module-writer';
import { Burden } from '../src/rules/burden';
import type { Change } from '../src/lang/module';

// What a company carries weighs on it: each member carries what their gear and finds weigh (a lump of ore 2, a ring
// nothing, scale mail 8, the heart of the vein 30) against ten and twice their strength; carrying more, the company
// is laden, is told so, and goes at half its pace until it sets something down.
class Load {
  static async start() {
    const w = await WorldAssembler.assemble('wren', NodeBundleSource.shared,
      { origin: 'wanderer', party: [{ name: 'Wenna', raceId: 'human', classId: 'warrior' }] });
    return PlaySession.start(w.path, 'wren', w.source);
  }
  static set(s: PlaySession, changes: Change[]) {
    const c = s.campaign as unknown as { world: { apply(c: Change[]): unknown }; commit(w: unknown): void };
    c.commit(c.world.apply(changes));
  }
  static async take(s: PlaySession, pattern: RegExp) {
    const c = PlayerView.choices(s.campaign).find(x => pattern.test(x.choice.name));
    if (!c) { throw new Error(`No ${pattern}: ${PlayerView.choices(s.campaign).map(x => x.choice.name).join(' | ')}`); }
    const before = PlayerView.observe(s.campaign), event = await s.perform(c.choice.id);
    const f = ActionFeedbackView.read(s.campaign, event, before);
    return { said: [f.result, ...f.events, ...f.observations].join(' '), time: f.time };
  }
  static laden(s: PlaySession) { return s.campaign.world.test(ModuleWriter.call('laden', 'party')); }
}

describe('what a company carries', () => {
  it('is weighed by kind, against ten and twice the carrier\'s strength', async () => {
    const s = await Load.start(), r = s.campaign.readout, wenna = r.creatures.find(c => r.partyIds.includes(c.id))!;
    expect([Burden.mass('star_iron'), Burden.mass('delver_ring'), Burden.mass('scale')]).toEqual([2, 0, 8]);
    expect(Burden.capacity(wenna)).toBe(10 + 2 * wenna.base.strength);
    expect(Load.laden(s)).toBe(false);
  }, 60000);
  it('slows a company carrying more than it can: the heart of the vein, carried up, weighs it down', async () => {
    const s = await Load.start();
    Load.set(s, [{ kind: 'retract', call: ModuleWriter.call('at', 'region__w9_keeper', 'region__w9_breach_heart') },
      { kind: 'retract', call: ModuleWriter.call('unlit', 'region__w9_breach_heart') },
      { kind: 'retract', call: ModuleWriter.call('unlit', 'region__w9_breach_vault') },
      { kind: 'assert', call: ModuleWriter.call('at', 'party', 'region__w9_breach_heart') }]);
    const light = await Load.take(s, /^Take the gallery to the hollow vault$/);
    await Load.take(s, /^Take the gallery to the heart of the vein$/);
    const taken = await Load.take(s, /^Collect the heart of the vein/);
    expect(taken.said).toContain('What you carry drags at you');
    expect(Load.laden(s)).toBe(true);
    const heavy = await Load.take(s, /^Take the gallery to the hollow vault$/);
    expect([light.time.split(' · ')[0], heavy.time.split(' · ')[0]]).toEqual(['2 min', '4 min']);
    expect((await Load.take(s, /^Set down the heart of the vein/)).said).toContain('You go easier');
  }, 60000);
  it('is brought up when it first comes into daylight: out by night, at first light', async () => {
    const s = await Load.start(), raised = () => s.campaign.world.test(ModuleWriter.call('region__w9_raised'));
    await Load.take(s, /^Wait until dark$/);
    Load.set(s, [{ kind: 'retract', call: ModuleWriter.call('at', 'region__w9_keeper', 'region__w9_breach_heart') },
      { kind: 'retract', call: ModuleWriter.call('unlit', 'region__w9_breach_heart') },
      { kind: 'assert', call: ModuleWriter.call('at', 'party', 'region__w9_breach_heart') }]);
    await Load.take(s, /^Collect the heart of the vein/);
    Load.set(s, [{ kind: 'assert', call: ModuleWriter.call('at', 'party', 'region__w9') }]);
    await Load.take(s, /^Wait a while$/);
    expect(raised()).toBe(false);
    expect((await Load.take(s, /^Wait until first light$/)).said).toContain('In the daylight the heart of the vein');
    expect(raised()).toBe(true);
  }, 60000);
});
