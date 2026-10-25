import { describe, expect, it } from 'bun:test';
import { WorldAssembler } from '../src/world/world-assembler';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { PlaySession } from '../src/session/play-session';
import { PlayerView } from '../src/presentation/player-view';
import { ActionFeedbackView } from '../src/presentation/action-feedback';
import { ScreenModel } from '../src/ui/screen-model';
import { ModuleWriter } from '../src/lang/module-writer';
import type { Change } from '../src/lang/module';
import type { Region } from '../src/world/region-writer';

// A fourth purpose from the same generator (data/generation/deep/singing.json): where a country's first makers were
// the Stone-Singers, its deep site is their hall, cut whole out of the hill by song. A pivot-door settled on its stone
// across the stair; a round door that opens to the note cut over it, for whoever reads the old script, and not to
// force; a crack the unsung stone opened round it, for a climber or a rope; and in the last hall a keeper that is the
// singers' own last song, which their own knell stills, rung on the dirge bell the last of the cantors took down to
// the unfinished hall below the chorus, and not a priest's prayers for the dead. d4 is a high country of stone and
// sky, which had no deep site before. Played there first, the hall was too easy (doc/architecture/mission-14/
// report.md): three short levels, nobody in the still halls but the keeper, the bell beside an open crack round the
// door, and a pilgrim's rites enough without it.
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
  // In d4 a glyph is drawn on the way into the last hall; a test of the keeper is not a test of the glyph.
  static safe(s: PlaySession, glyph: string) {
    this.set(s, [{ kind: 'retract', call: ModuleWriter.call('state', glyph, 'primed') },
      { kind: 'assert', call: ModuleWriter.call('state', glyph, 'made_safe') }]);
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
  it('goes round the round door by the crack only for a climber or with a rope', async () => {
    const { s, deep, room } = await Hall.world();
    Hall.enter(s, room('choir_cantors'));
    expect(Hall.names(s).some(n => n.startsWith('Take the crack in the unsung stone'))).toBe(false);
    expect(ScreenModel.build(s.campaign).exits.find(e => e.name === 'the hall of echoes')?.blocked)
      .toMatch(/climbing or a coil of rope/);
    const monk = await Hall.world('monk');
    Hall.clear(monk.s, deep.id);
    Hall.enter(monk.s, monk.room('choir_cantors'));
    expect(Hall.names(monk.s)).toContain('Take the crack in the unsung stone to the hall of echoes');
  }, 90000);
  it('has a keeper that the singers\' knell stills, rung on the bell the last cantor took down', async () => {
    const cleric = await Hall.world('cleric');
    Hall.clear(cleric.s, cleric.deep.id);
    Hall.enter(cleric.s, cleric.room('still_nave'));
    Hall.safe(cleric.s, `${cleric.room('still_heart')}_snare`);
    expect(await Hall.take(cleric.s, /^Take .* to the last hall$/)).not.toContain('goes back from you');
    const { s, deep, room } = await Hall.world();
    Hall.clear(s, deep.id);
    await Hall.take(s, /^Light a torch$/);
    Hall.enter(s, room('still_unfinished'));
    expect(PlayerView.observe(s.campaign).observations.map(o => o.text).join(' '))
      .toContain('what is left of a cantor who did not go into the stone with the rest');
    await Hall.take(s, /^Collect a dirge bell/);
    await Hall.take(s, /^Equip a dirge bell/);
    await Hall.take(s, /^Take .* to the long hall$/);
    Hall.safe(s, `${room('still_heart')}_snare`);
    expect(await Hall.take(s, /^Take .* to the last hall$/)).toContain('goes back from you into the root of the hill');
    expect(Hall.names(s)).toContain('Collect the tuning-stone of the Stone-Singers for Wenna');
  }, 90000);
  // The follow-up independent review: the listening-room's prose invited listening, and offered none.
  it('carries what is about its business in the upper hall to whoever listens at the listening-room\'s bowl', async () => {
    const { s, deep, room } = await Hall.world();
    Hall.enter(s, room('porch_listening'));
    const heard = await Hall.take(s, /^Listen at the bowl in the floor$/);
    expect(heard).toContain('the whole of the upper hall is in it');
    expect(heard).toMatch(/as if at your shoulder: something that moves softly, and stops to listen, in the /);
    Hall.clear(s, deep.id);
    expect(PlayerView.observe(s.campaign).observations.map(o => o.text).join(' ')).not.toContain('at your shoulder');
  }, 90000);
});
