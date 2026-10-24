import { describe, expect, it } from 'bun:test';
import { WorldAssembler } from '../src/world/world-assembler';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { PlaySession } from '../src/session/play-session';
import { PlayerView } from '../src/presentation/player-view';
import { ActionFeedbackView } from '../src/presentation/action-feedback';
import { ModuleWriter } from '../src/lang/module-writer';
import type { Change } from '../src/lang/module';
import type { Region } from '../src/world/region-writer';

// A fourth purpose from the same generator (data/generation/deep/singing.json): where a country's first makers were
// the Stone-Singers, its deep site is their hall, cut whole out of the hill by song. A pivot-door settled on its stone
// across the stair; a round door that opens to the note cut over it, for whoever reads the old script, and not to
// force; a crack the unsung stone opened round it; and in the last hall a keeper that is the singers' own last song,
// which the rites of the dead still, with the dirge bell their cantors kept. d4 is a high country of stone and sky,
// which had no deep site before.
class Hall {
  static async world(calling = 'warrior') {
    const w = await WorldAssembler.assemble('d4', NodeBundleSource.shared,
      { origin: 'wanderer', party: [{ name: 'Wenna', raceId: 'human', classId: calling }] });
    const region = w.report.region as Region, deep = region.sites.find(s => s.work?.deep)!;
    const s = await PlaySession.start(w.path, 'd4', w.source);
    return { s, deep, room: (r: string) => `region__${deep.id}_${r}` };
  }
  static names(s: PlaySession) { return PlayerView.choices(s.campaign).map(c => c.choice.name); }
  static set(s: PlaySession, changes: Change[]) {
    const c = s.campaign as unknown as { world: { apply(c: Change[]): unknown }; commit(w: unknown): void };
    c.commit(c.world.apply(changes));
  }
  // Empties the hall of all that lives there but the keeper, and lights the room the company is put in.
  static clear(s: PlaySession, deep: string) {
    const groups = s.campaign.module.entities.filter(e => e.type === 'group' && e.id.startsWith(`region__${deep}_`)
      && !e.id.endsWith('_keeper')).map(e => e.id);
    this.set(s, s.campaign.world.related('at').filter(r => groups.includes(r.args[0]!))
      .map(r => ({ kind: 'retract' as const, call: ModuleWriter.call('at', ...r.args) })));
  }
  static enter(s: PlaySession, room: string) {
    this.set(s, [{ kind: 'retract', call: ModuleWriter.call('unlit', room) },
      { kind: 'assert', call: ModuleWriter.call('at', 'party', room) }]);
  }
  static async take(s: PlaySession, pattern: RegExp) {
    const c = PlayerView.choices(s.campaign).find(x => pattern.test(x.choice.name));
    if (!c) { throw new Error(`No ${pattern}: ${this.names(s).join(' | ')}`); }
    const before = PlayerView.observe(s.campaign), event = await s.perform(c.choice.id);
    const f = ActionFeedbackView.read(s.campaign, event, before);
    return [f.result, ...f.observations, ...f.events].join(' ');
  }
}

describe('the Stone-Singers\' hall from the same generator as the mine', () => {
  it('stands where the makers were the Stone-Singers, and is told of at the inn', async () => {
    const { s, deep } = await Hall.world();
    expect(deep.work?.art).toBe('stone');
    const topics = s.campaign.module.actions.filter(a => a.speaker?.endsWith('_innkeeper')).map(a => a.name);
    expect(topics.some(n => /about the singing halls$/.test(n))).toBe(true);
  }, 90000);
  it('opens its round door to the note cut over it, for whoever reads the old script, and not to force', async () => {
    const warrior = await Hall.world();
    Hall.clear(warrior.s, warrior.deep.id);
    Hall.enter(warrior.s, warrior.room('porch_stair_head'));
    await Hall.take(warrior.s, /^Lift the settled door off its stone with a bar$/);
    expect(Hall.names(warrior.s)).toContain('Take the stair behind the pivot-door to the foot of the stair');
    Hall.enter(warrior.s, warrior.room('choir_deep_door'));
    expect(Hall.names(warrior.s).some(n => /^Sing the note/.test(n))).toBe(false);
    const mage = await Hall.world('mage');
    Hall.clear(mage.s, mage.deep.id);
    Hall.enter(mage.s, mage.room('choir_deep_door'));
    expect(await Hall.take(mage.s, /^Sing the note cut over the door$/)).toContain('rolled aside');
    expect(Hall.names(mage.s)).toContain('Take the singing door to the landing');
  }, 90000);
  it('has a keeper that the rites of the dead still, rung on the cantors\' own dirge bell', async () => {
    const { s, deep, room } = await Hall.world();
    Hall.clear(s, deep.id);
    await Hall.take(s, /^Light a torch$/);
    Hall.enter(s, room('choir_cantors'));
    await Hall.take(s, /^Collect a dirge bell/);
    await Hall.take(s, /^Equip a dirge bell/);
    await Hall.take(s, /^Take the crack in the unsung stone to the chorus$/);
    expect(await Hall.take(s, /^Take .* to the last hall$/)).toContain('goes back from you into the root of the hill');
    expect(Hall.names(s)).toContain('Collect the tuning-stone of the Stone-Singers for Wenna');
  }, 90000);
});
