import { describe, expect, it } from 'bun:test';
import { WorldAssembler } from '../src/world/world-assembler';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { PlaySession } from '../src/session/play-session';
import { PlayerView } from '../src/presentation/player-view';
import { ActionFeedbackView } from '../src/presentation/action-feedback';
import { ModuleWriter } from '../src/lang/module-writer';
import { ScreenModel } from '../src/ui/screen-model';
import type { Change } from '../src/lang/module';
import type { Region } from '../src/world/region-writer';

// A second purpose from the same generator (data/generation/deep/barrow.json): where a country's first makers were
// the Barrow-Kin and not the Delvers, its deep site is their king-barrow, built from what it was for and told in its
// own words. A portal stone on a counterweight where a mine has a cage on a wheel; a seal-stone across the king's
// door, with the makers' warning cut round it, where a mine has a wall across a stair; a robbers' tunnel round the
// door; a king who shrinks from the day where a mine's keeper shrinks from noon. A1 is a fen country of the water and
// bone arts, so it has a barrow; wren, with Delvers among its makers, keeps its mine.
class Barrow {
  static async world(seed: string) {
    const w = await WorldAssembler.assemble(seed, NodeBundleSource.shared,
      { origin: 'wanderer', party: [{ name: 'Wenna', raceId: 'human', classId: 'warrior' }] });
    const region = w.report.region as Region, deep = region.sites.find(s => s.work?.deep)!;
    return { s: await PlaySession.start(w.path, seed, w.source), deep, room: (r: string) => `region__${deep.id}_${r}` };
  }
  static names(s: PlaySession) { return PlayerView.choices(s.campaign).map(c => c.choice.name); }
  static set(s: PlaySession, changes: Change[]) {
    const c = s.campaign as unknown as { world: { apply(c: Change[]): unknown }; commit(w: unknown): void };
    c.commit(c.world.apply(changes));
  }
  // Puts the company in a room by light, with whoever lives there gone, as a test of the room and not of the fight.
  static enter(s: PlaySession, room: string) {
    const here = s.campaign.world.related('at').filter(r => r.args[1] === room && r.args[0] !== 'party'
      && s.campaign.module.entities.some(e => e.id === r.args[0] && e.type === 'group'));
    this.set(s, [...here.map(r => ({ kind: 'retract' as const, call: ModuleWriter.call('at', ...r.args) })),
      { kind: 'retract', call: ModuleWriter.call('unlit', room) }, { kind: 'assert', call: ModuleWriter.call('at', 'party', room) }]);
  }
  static async take(s: PlaySession, pattern: RegExp) {
    const c = PlayerView.choices(s.campaign).find(x => pattern.test(x.choice.name));
    if (!c) { throw new Error(`No ${pattern}: ${this.names(s).join(' | ')}`); }
    const before = PlayerView.observe(s.campaign), event = await s.perform(c.choice.id);
    const f = ActionFeedbackView.read(s.campaign, event, before);
    return [f.result, ...f.observations, ...f.events].join(' ');
  }
}

describe('a king-barrow from the same generator as the mine', () => {
  it('stands where the makers were the Barrow-Kin, and is told of at the inn in its own words', async () => {
    const { s, deep } = await Barrow.world('a1');
    expect(deep.work?.art).toBe('bone');
    expect((await Barrow.world('wren')).deep.work?.art).toBe('deep');
    const topics = s.campaign.module.actions.filter(a => a.speaker?.endsWith('_innkeeper')).map(a => a.name);
    expect(topics.some(n => /about the king-barrow$/.test(n))).toBe(true);
  }, 90000);
  it('works its own gear: the portal stone freed, the king\'s door sealed, a robbers\' way round it', async () => {
    const { s, room } = await Barrow.world('a1');
    Barrow.enter(s, room('barrow_back_stone'));
    expect(Barrow.names(s).some(n => n.startsWith('Take the stair behind the portal stone'))).toBe(false);
    await Barrow.take(s, /^Lever the jammed counterweight free$/);
    expect(Barrow.names(s).some(n => n.startsWith('Take the stair behind the portal stone'))).toBe(true);
    Barrow.enter(s, room('halls_kings_door'));
    expect(Barrow.names(s)).toEqual(expect.arrayContaining(['Break the seal-stone',
      'Listen at the seal-stone across the king\'s door']));
    expect(Barrow.names(s).some(n => /^Take the king's door/.test(n))).toBe(false);
    Barrow.enter(s, room('halls_ossuary'));
    expect(Barrow.names(s).some(n => n.startsWith('Take the robbers\' tunnel to the king\'s treasury'))).toBe(true);
  }, 90000);
  it('has a king who cannot abide the day, and the embalmers\' jar of it two rooms from his door', async () => {
    const { s, room } = await Barrow.world('a1');
    Barrow.enter(s, room('halls_embalmers'));
    await Barrow.take(s, /^Collect a jar of noonlight/);
    await Barrow.take(s, /^Equip a jar of noonlight/);
    Barrow.enter(s, room('grave_antechamber'));
    expect(await Barrow.take(s, /^Take .* to the king's hall$/)).toContain('goes back from it, step by step, into the deep grave');
    expect(Barrow.names(s)).toContain('Collect the crown of the first king for Wenna');
  }, 90000);
  it('has a forecourt under the open sky, where a company may camp, as it may not in the passage', async () => {
    const { s, room } = await Barrow.world('a1');
    Barrow.enter(s, room('barrow_mouth'));
    expect(Barrow.names(s)).toContain('Make camp at the forecourt');
    Barrow.enter(s, room('barrow_passage'));
    expect(Barrow.names(s).some(n => n.startsWith('Make camp'))).toBe(false);
  }, 90000);
  it('lets the day in by its light-box, and by night the night air', async () => {
    const { s, room } = await Barrow.world('a1');
    const seen = () => PlayerView.observe(s.campaign).observations.map(o => o.text).join(' ');
    Barrow.enter(s, room('barrow_passage'));
    expect(seen()).toContain('A thread of grey daylight lies along the floor of the passage');
    await Barrow.take(s, /^Wait until dark$/);
    expect(seen()).toContain('A breath of night air comes along the floor of the passage');
    expect(seen()).not.toContain('daylight');
  }, 90000);
  // Played in cov13: a recess whose burned bones had "a bead or two among them" gave a search nothing.
  it('gives a search what a room\'s look promises', async () => {
    const { s, room } = await Barrow.world('cov13');
    Barrow.enter(s, room('barrow_recess2'));
    expect(await Barrow.take(s, /^Search the north recess$/)).toContain('a string of amber beads');
    expect(Barrow.names(s).some(n => /^Collect a string of amber beads/.test(n))).toBe(true);
    // Taken, they are no longer said to lie among the bones.
    await Barrow.take(s, /^Collect a string of amber beads/);
    expect(PlayerView.observe(s.campaign).observations.map(o => o.text).join(' ')).not.toContain('a string of amber beads');
  }, 60000);
  // Played in cov13: the robbers' captain "stands its ground", and "it is more than the company can take".
  it('speaks of one who is someone, not something, without "it"', async () => {
    const { s, room } = await Barrow.world('cov13');
    Barrow.set(s, [{ kind: 'retract', call: ModuleWriter.call('unlit', room('barrow_back_stone')) },
      { kind: 'assert', call: ModuleWriter.call('at', 'party', room('barrow_back_stone')) }]);
    const said = await Barrow.take(s, /^Wait a while$/);
    expect(said).toContain('captain stands and watches you, and will not have you here for long');
    const captain = ScreenModel.build(s.campaign).people.find(p => p.name.startsWith('the robbers\' captain'))!;
    expect(captain.reckoning?.text).toMatch(/\b([Tt]hey are|them)\b/);
  }, 60000);
  // Played in cov13: "Vines erupt to entangle" under a chalk mound where nothing grows.
  it('tells a trap under rock by what is there: roots, not vines', async () => {
    const { s, deep } = await Barrow.world('cov13');
    const said = (s.campaign.module.rules ?? []).filter(r => r.id.startsWith(`region__${deep.id}_`)).map(r => r.say ?? '');
    expect(said.filter(t => /^Vines/.test(t))).toEqual([]);
    expect(said.some(t => /^Roots burst out/.test(t))).toBe(true);
  }, 60000);
});
