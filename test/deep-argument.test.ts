import { describe, expect, it } from 'bun:test';
import { WorldAssembler } from '../src/world/world-assembler';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { PlaySession } from '../src/session/play-session';
import { PlayerView } from '../src/presentation/player-view';
import { ActionFeedbackView } from '../src/presentation/action-feedback';
import { Narrator } from '../src/presentation/narrator';
import { ScreenModel } from '../src/ui/screen-model';
import { ModuleWriter } from '../src/lang/module-writer';
import type { Change } from '../src/lang/module';
import { DeepArgument } from '../src/world/deep/deep-argument';

// An argument with consequences (Proof B): Gothgiba's priest holds that the Delvers' wall must stay shut, and will not
// pray for, heal or raise whoever opens it. The company can argue it out, each way once, at odds the page states:
// with the makers' own words as evidence, by reading the grief behind the doctrine and speaking to it, by lying, by
// threatening. Won over, the priest tells what the shrine has kept of what is below; a promise to wall the stair
// again is held to; a threat, a lie found out, the stair opened in defiance or the promise broken shut the shrine
// to the company for good, and the shrine shows it.
class Shrine {
  static async start() {
    const w = await WorldAssembler.assemble('wren', NodeBundleSource.shared,
      { origin: 'wanderer', party: [{ name: 'Wenna', raceId: 'human', classId: 'warrior' }] });
    const s = await PlaySession.start(w.path, 'wren', w.source);
    await this.walk(s, [/^Take the road to the bailey/, /^Take the door of the Wooden Wolf/,
      /^Ask Fargrim about the old workings$/, /^Take the door of the Wooden Wolf/, /^Take the shrine porch in Gothgiba/,
      /^Ask Baern about the walled stair/]);
    return s;
  }
  static names(s: PlaySession) { return PlayerView.choices(s.campaign).map(c => c.choice.name); }
  static async take(s: PlaySession, pattern: RegExp) {
    const c = PlayerView.choices(s.campaign).find(x => pattern.test(x.choice.name));
    if (!c) { throw new Error(`No ${pattern}: ${this.names(s).join(' | ')}`); }
    const before = PlayerView.observe(s.campaign), event = await s.perform(c.choice.id);
    const f = ActionFeedbackView.read(s.campaign, event, before);
    return [f.result, ...f.observations, ...f.events, ...f.immediate, ...f.discoveries].join(' ');
  }
  static async walk(s: PlaySession, patterns: RegExp[]) { for (const p of patterns) { await this.take(s, p); } }
  static set(s: PlaySession, changes: Change[]) {
    const c = s.campaign as unknown as { world: { apply(c: Change[]): unknown }; commit(w: unknown): void };
    c.commit(c.world.apply(changes));
  }
  static test(s: PlaySession, name: string, ...args: string[]) {
    return s.campaign.world.test(ModuleWriter.call(name, ...args));
  }
  static wall(s: PlaySession) { return s.campaign.module.entities.find(e => e.name === 'the wall across the stair')!.id; }
  static readonly priest = 'region__s1_priest';
}

describe('the walled stair, argued at the shrine', () => {
  it('tells the dice of a check apart from what came of it, so that a reader may leave them untold', async () => {
    const s = await Shrine.start(), c = PlayerView.choices(s.campaign).find(x => /^Watch Baern/.test(x.choice.name))!;
    const before = PlayerView.observe(s.campaign), event = await s.perform(c.choice.id);
    const feedback = ActionFeedbackView.read(s.campaign, event, before);
    const lines = Narrator.leaf(s.campaign, ScreenModel.build(s.campaign),
      { event, feedback, said: c.choice.name, moved: false }).exchange!.lines;
    expect(lines.filter(l => l.kind === 'roll').map(l => l.text))
      .toEqual([expect.stringMatching(/makes the insight check \(d20/)]);
    expect(lines.some(l => l.kind === 'telling' && /down there/.test(l.text))).toBe(true);
  }, 60000);
  it('is the priest\'s to forbid, and is argued at odds the page states', async () => {
    const s = await Shrine.start();
    expect(Shrine.names(s)).toEqual(expect.arrayContaining([
      'Argue with Baern that what is below should be met, not walled in · unlikely',
      'Watch Baern for what goes unsaid · an even chance',
      'Tell Baern the stair will be opened whatever is said · an even chance',
      'Promise Baern to shut the stair again when you come back up']));
    // Evidence is offered only to a company that has the makers' words to give.
    expect(Shrine.names(s).some(n => n.startsWith('Tell Baern what the words cut in the wall say'))).toBe(false);
  }, 90000);
  it('is won by seeing the grief behind the doctrine and speaking to it; won, the priest tells what is below', async () => {
    const s = await Shrine.start();
    expect(await Shrine.take(s, /^Watch Baern for what goes unsaid/)).toContain('insight check');
    expect(await Shrine.take(s, /^Speak to Baern of the brother/)).toContain('cannot bear the light of noon');
    expect(Shrine.test(s, 'knows', 'party', 'region__w9_bane')).toBe(true);
    expect(Shrine.names(s)).toContain('Ask Baern again about the walled stair');
  }, 90000);
  it('is lost for good by a threat: the shrine is shut to the company, and shows it', async () => {
    const s = await Shrine.start();
    expect(Shrine.names(s).some(n => /^Ask Baern for the shrine's care/.test(n))).toBe(true);
    await Shrine.take(s, /^Tell Baern the stair will be opened/);
    expect(Shrine.test(s, 'refusesService', Shrine.priest, 'party')).toBe(true);
    expect(Shrine.names(s).some(n => /^Ask Baern for the shrine's care/.test(n))).toBe(false);
    expect(await Shrine.take(s, /^Wait a while$/)).toBeDefined();
    expect(PlayerView.observe(s.campaign).observations.map(o => o.text).join(' ')).toContain('The shrine is shut to whoever');
  }, 90000);
  it('holds the company to its word: the stair opened against it, or a promise broken, shuts the shrine', async () => {
    const defied = await Shrine.start();
    Shrine.set(defied, [{ kind: 'retract', call: ModuleWriter.call('state', Shrine.wall(defied), 'region__standing') },
      { kind: 'assert', call: ModuleWriter.call('state', Shrine.wall(defied), 'region__broken') }]);
    await Shrine.take(defied, /^Wait a while$/);
    expect(Shrine.test(defied, 'refusesService', Shrine.priest, 'party')).toBe(true);
    const promised = await Shrine.start();
    await Shrine.take(promised, /^Promise Baern to shut the stair again/);
    expect(Shrine.test(promised, 'refusesService', Shrine.priest, 'party')).toBe(false);
    Shrine.set(promised, [{ kind: 'retract', call: ModuleWriter.call('state', Shrine.wall(promised), 'region__standing') },
      { kind: 'assert', call: ModuleWriter.call('state', Shrine.wall(promised), 'region__broken') }]);
    await Shrine.take(promised, /^Wait a while$/);
    // The wall open while the promise stands is no fault yet; the heart brought up with it still open is.
    expect(Shrine.test(promised, 'refusesService', Shrine.priest, 'party')).toBe(false);
    Shrine.set(promised, [{ kind: 'assert', call: ModuleWriter.call('region__w9_raised') }]);
    expect(await Shrine.take(promised, /^Wait a while$/)).toContain('You promised to shut it again');
    expect(Shrine.test(promised, 'refusesService', Shrine.priest, 'party')).toBe(true);
  }, 120000);
  // Found by an architecture review: the argument's words were the mine's for every deep site ("he went down for the
  // ore", "take the noon with you, and the brothers' lamp"), at a barrow, the cisterns and the singing hall alike.
  // Its words, and its ways of arguing, are public content (data/generation/deep/argument.json): one more way written
  // there is one more for the company to try, worded as written.
  it('is argued in the ways its public content names', async () => {
    DeepArgument.said.moves.push({ id: 'bell', label: 'Ring the shrine bell for {priest}', check: 'persuasion, dc_easy',
      yes: '{priest} listens to the bell.', no: '{priest} does not listen.' });
    try { expect(Shrine.names(await Shrine.start())).toContain('Ring the shrine bell for Baern · an even chance'); } finally {
      DeepArgument.said.moves.pop();
    }
  }, 120000);
  it('speaks of each site\'s own bane, not the mine\'s', async () => {
    for (const [seed, bane] of [['a1', 'noonlight'], ['thorn', 'oath-tablet'], ['d4', 'dirge bell'], ['wren', 'noonlight']]) {
      const w = await WorldAssembler.assemble(seed!, NodeBundleSource.shared,
        { origin: 'wanderer', party: [{ name: 'Wenna', raceId: 'human', classId: 'warrior' }] });
      const said = JSON.stringify((await PlaySession.start(w.path, seed!, w.source)).campaign.module.actions
        .filter(a => /_w\d+_(since|grief)$|^region__w\d+_(since|grief)$/.test(a.id)));
      expect([seed, said.includes(bane!)]).toEqual([seed, true]);
      expect([seed, /for the ore|the noon with you|brothers' lamp/.test(said)]).toEqual([seed, false]);
    }
  }, 120000);
});
