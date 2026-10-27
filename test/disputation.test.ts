import { describe, expect, it } from 'bun:test';
import { WorldAssembler } from '../src/world/world-assembler';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { PlaySession } from '../src/session/play-session';
import { PlayerView } from '../src/presentation/player-view';
import { ActionFeedbackView } from '../src/presentation/action-feedback';
import { ModuleWriter } from '../src/lang/module-writer';
import type { Change } from '../src/lang/module';
import { ScreenModel } from '../src/ui/screen-model';

// The philosopher's capstone (Proof B): on the green at Harrehes (seed b2) a philosopher of the One and one of the
// Flow dispute, and a sophist argues for whoever pays. Belief is the world's own (data/rules/belief.kyr): who holds
// what, how firmly, and how they came to let it go. What the country's history says refutes each, for whoever has
// found it. A reason shakes a philosopher, who has an answer to it; met in turn, or given a second reason, the
// philosopher lets the claim go, and let go for a reason it stays let go: the philosopher comes round, and would come
// with the company (the follow-up independent review saw one example turn a philosopher). Argued away by rhetoric,
// or by the sophist, it is back by morning, and the one who did it is scorned. Someone in the company who reads
// people sees, without a roll, where the philosopher of the Flow keeps looking.
class Green {
  static async start(calling = 'mage') {
    const w = await WorldAssembler.assemble('b2', NodeBundleSource.shared,
      { origin: 'wanderer', party: [{ name: 'Wenna', raceId: 'human', classId: calling }] });
    const s = await PlaySession.start(w.path, 'b2', w.source);
    this.set(s, [{ kind: 'assert', call: ModuleWriter.call('at', 'party', 'region__s4_green') }]);
    return s;
  }
  static set(s: PlaySession, changes: Change[]) {
    const c = s.campaign as unknown as { world: { apply(c: Change[]): unknown }; commit(w: unknown): void };
    c.commit(c.world.apply(changes));
  }
  static know(s: PlaySession, ...facts: string[]) {
    this.set(s, facts.map(f => ({ kind: 'assert' as const, call: ModuleWriter.call('knows', 'party', `region__${f}`) })));
  }
  static names(s: PlaySession) { return PlayerView.choices(s.campaign).map(c => c.choice.name); }
  static seen(s: PlaySession) { return PlayerView.observe(s.campaign).observations.map(o => o.text); }
  static async take(s: PlaySession, pattern: RegExp) {
    const c = PlayerView.choices(s.campaign).find(x => pattern.test(x.choice.name));
    if (!c) { throw new Error(`No ${pattern}: ${this.names(s).join(' | ')}`); }
    const before = PlayerView.observe(s.campaign), event = await s.perform(c.choice.id);
    const f = ActionFeedbackView.read(s.campaign, event, before);
    return [f.result, ...f.immediate].join(' ');
  }
  static holds(s: PlaySession, name: string, ...args: string[]) {
    return s.campaign.world.test(ModuleWriter.call(name, ...args.map(a => `disputation__${a}`)));
  }
}

describe('the disputation on the green', () => {
  it('is argued with reasons by those who know the country\'s history, and otherwise only by argument or for coin', async () => {
    const s = await Green.start();
    expect(Green.seen(s).some(t => /Two philosophers are disputing/.test(t))).toBe(true);
    await Green.take(s, /^Ask Orion what the One is$/);
    await Green.take(s, /^Ask Kestrel what the Flow is$/);
    expect(Green.names(s).filter(n => /^(Answer|Tell) (Kestrel|Orion)/.test(n))).toEqual([]);
    expect(Green.names(s).filter(n => /^(Argue|Pay)/.test(n))).toHaveLength(4);
    Green.know(s, 'history_deep', 'history_deep_fate', 'history_successors');
    expect(Green.names(s).filter(n => /^(Answer|Tell) (Kestrel|Orion)/.test(n)).map(n => n.split(' · ')[0])).toEqual([
      'Answer Kestrel with the makers\' own marks, which still read though they are gone',
      'Tell Orion how the first makers ended', 'Tell Orion of the kingdom that came after the makers, and how it fell']);
  }, 60000);
  it('given a reason, is shaken and answers it; let go when the answer is met, it stays let go', async () => {
    const s = await Green.start('bard');
    Green.know(s, 'history_successors');
    await Green.take(s, /^Ask Orion what the One is$/);
    expect(await Green.take(s, /^Tell Orion of the kingdom that came after/)).toContain('Twice, then');
    expect([Green.holds(s, 'believes', 'one', 'oneness'), Green.holds(s, 'reasoned', 'one', 'oneness')]).toEqual([true, true]);
    expect(Green.seen(s).some(t => /it was once, seen twice/.test(t))).toBe(true);
    // Shaken, the philosopher is no longer to be argued down or bought off, and is not yet coming with anyone.
    expect(Green.names(s).filter(n => /^(Argue Orion|Pay Dart two coin to argue Orion|Ask Orion to join)/.test(n)))
      .toEqual([]);
    expect(await Green.take(s, /^Ask Orion to say the fallen kingdom's names/)).toContain('Nobody here has ever heard');
    expect([Green.holds(s, 'believes', 'one', 'oneness'), Green.holds(s, 'reasoned', 'one', 'oneness')]).toEqual([false, true]);
    expect(Green.seen(s).some(t => /Orion no longer teaches the One/.test(t))).toBe(true);
    expect(Green.names(s)).toContain('Ask Orion to join the company');
    await Green.take(s, /^Wait until dark$/);
    await Green.take(s, /^Wait until first light$/);
    expect(Green.holds(s, 'believes', 'one', 'oneness')).toBe(false);
  }, 60000);
  it('comes round on a second reason when the answer to the first was not met', async () => {
    const s = await Green.start();
    Green.know(s, 'history_deep_fate', 'history_successors');
    await Green.take(s, /^Ask Orion what the One is$/);
    await Green.take(s, /^Tell Orion how the first makers ended/);
    expect(Green.seen(s).some(t => /You have not told me that anything was lost/.test(t))).toBe(true);
    expect(await Green.take(s, /^Ask Orion why the makers cut their own end in stone/)).toContain('what seeming looks like');
    expect(Green.holds(s, 'believes', 'one', 'oneness')).toBe(true);
    await Green.take(s, /^Tell Orion of the kingdom that came after/);
    expect(Green.holds(s, 'believes', 'one', 'oneness')).toBe(false);
    expect(Green.names(s)).toContain('Ask Orion to join the company');
  }, 60000);
  it('argued away for coin, is back by morning, and the one who paid is not listened to again', async () => {
    const s = await Green.start();
    Green.know(s, 'history_deep');
    await Green.take(s, /^Ask Kestrel what the Flow is$/);
    Green.set(s, [{ kind: 'assert', call: ModuleWriter.call('knows', 'party', 'disputation__dispute') }]);
    expect(await Green.take(s, /^Pay Dart two coin to argue Kestrel/)).toContain('it will all be believed again');
    expect(Green.seen(s).some(t => /The crowd has gone over from Kestrel today/.test(t))).toBe(true);
    // Won for the day, the dispute is not settled, and is still the company's to settle (its PT-25: it had gone
    // from the notes).
    expect(ScreenModel.build(s.campaign).objectives.join(' ')).toContain('Two philosophers dispute at');
    await Green.take(s, /^Wait until dark$/);
    await Green.take(s, /^Wait until first light$/);
    expect([Green.holds(s, 'believes', 'flow', 'flux'), s.campaign.world.test(ModuleWriter.call('scorns',
      'disputation__flow', 'party'))]).toEqual([true, true]);
    // The reason the company had is no use now: Kestrel will not hear it from them.
    expect(Green.names(s).some(n => /^Answer Kestrel/.test(n))).toBe(false);
    expect(Green.seen(s)).toContain('Kestrel turns away from you.');
  }, 60000);
  // Told badly, a reason was gone for good (the play-structure investigation's PT-05): what the country's history
  // says is still so, and it can be told again the next day.
  it('told a reason badly, hears it again the next day', async () => {
    const s = await Green.start();
    Green.know(s, 'history_deep_fate');
    await Green.take(s, /^Ask Orion what the One is$/);
    await Green.take(s, /^Tell Orion how the first makers ended/);
    const lost = /^Ask Orion why the makers cut their own end in stone/;
    expect(await Green.take(s, lost)).toContain('Another day, you might find the words.');
    expect(Green.names(s).some(n => lost.test(n))).toBe(false);
    await Green.take(s, /^Wait until dark$/);
    await Green.take(s, /^Wait until first light$/);
    expect(Green.names(s).some(n => lost.test(n))).toBe(true);
  }, 60000);
  it('is seen through without a roll by someone who reads people: where the philosopher of the Flow keeps looking', async () => {
    const s = await Green.start('cleric');
    expect(Green.seen(s).some(t => /you see where Kestrel.s eyes go/.test(t))).toBe(true);
    // Seen, it is known: what is seen is a reason to put to Kestrel, which a mage with no eye for people lacks.
    await Green.take(s, /^Ask Kestrel what the Flow is$/);
    expect(Green.names(s).some(n => /^Ask Kestrel why the old stones draw the eye/.test(n))).toBe(true);
    const mage = await Green.start('mage');
    await Green.take(mage, /^Ask Kestrel what the Flow is$/);
    expect(Green.names(mage).some(n => /^Ask Kestrel why the old stones draw the eye/.test(n))).toBe(false);
  }, 60000);
});
