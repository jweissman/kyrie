import { describe, expect, it } from 'bun:test';
import { PlaySession } from '../src/session/play-session';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { ModuleWriter } from '../src/lang/module-writer';
import { PlayerView } from '../src/presentation/player-view';
import { ScreenModel } from '../src/ui/screen-model';
import { Narrator } from '../src/presentation/narrator';
import { ActionFeedbackView } from '../src/presentation/action-feedback';
import type { Battle } from '../src/battle';
import type { Command } from '../src/model';

// People who fall on the company: a sentry who challenges trespassers and a patrol that hunts them
// (test/fixtures/watch-house).
class Watch {
  static start() {
    return PlaySession.start('test/fixtures/watch-house/campaign.json', 'watch', NodeBundleSource.shared);
  }
  static where(s: PlaySession) {
    return s.campaign.world.snapshot.relations.find(r => r.name === 'at' && r.args[0] === 'party')?.args[1];
  }
  static know(s: PlaySession, fact: string) {
    const c = s.campaign as unknown as { world: { apply(c: unknown[]): unknown }; commit(w: unknown): void };
    c.commit(c.world.apply([{ kind: 'assert', call: ModuleWriter.call('knows', 'party', fact) }]));
  }
  static run(this: void, battle: Battle): Promise<Command> {
    const legal = battle.legalCommands();
    return Promise.resolve(legal.find(c => c.ability === 'flee') ?? legal[0]!);
  }
}

describe('people who fall on the company', () => {
  it('a sentry falls on a company that comes through the gate without the word, and the fight is fought there', async () => {
    const s = await Watch.start();
    const event = await s.perform('go(world__gate,world__gatehouse)');
    expect(event.prelude?.response).toContain('comes at you');
    expect(event.combat.some(e => e.type === 'end')).toBe(true);
    expect(s.campaign.world.test(ModuleWriter.call('assails', 'world__sentry', 'party'))).toBe(false);
  }, 60000);
  it('lets by a company that knows the word', async () => {
    const s = await Watch.start();
    Watch.know(s, 'world__password');
    const event = await s.perform('go(world__gate,world__gatehouse)');
    expect([event.prelude, event.combat.length, Watch.where(s)]).toEqual([undefined, 0, 'world__gatehouse']);
  }, 60000);
  it('puts a company that runs from the fight back where it came from', async () => {
    const s = await Watch.start();
    const event = await s.perform('go(world__gate,world__gatehouse)', Watch.run);
    expect([event.fledTo, Watch.where(s)]).toEqual(['world__lane', 'world__lane']);
    // The sentry is still at his post, and will challenge them again.
    expect(s.campaign.world.test(ModuleWriter.call('at', 'world__sentry', 'world__gatehouse'))).toBe(true);
  }, 60000);
  // The sentry is seen as he moves: the company has its moment before he closes, and backs away the way it came for
  // certain (PT-10, M17-40: a guardian at its post fell on a lone ranger who had no turn to back away from it).
  it('gives the company a moment before the sentry closes, to get back the way it came', async () => {
    const s = await Watch.start();
    let opening: string | undefined;
    const event = await s.perform('go(world__gate,world__gatehouse)', battle => { opening ??= battle.opening; return Watch.run(battle); });
    expect(opening).toBe('seen');
    expect(event.combat.find(e => e.type === 'flee')).toMatchObject({ success: true });
    expect(Watch.where(s)).toBe('world__lane');
  }, 60000);
  // A fight that came at the company is not told as one it began: fleeing the wheel-keeper that fell on it in the
  // wheel-room, a fresh play read "You begin to attack the wheel-keeper. The wheel-keeper comes at you!" (play 7).
  it('tells the way the company took, not an attack it never made, when it is fallen on there', async () => {
    const s = await Watch.start(), before = PlayerView.observe(s.campaign);
    const event = await s.perform('go(world__gate,world__gatehouse)', Watch.run);
    const feedback = ActionFeedbackView.read(s.campaign, event, before);
    const leaf = Narrator.leaf(s.campaign, ScreenModel.build(s.campaign),
      { event, feedback, said: 'Through the gate', moved: true });
    expect(leaf.exchange?.said).toBe('Through the gate');
  }, 60000);
  // The cold playtest fled the cave spiders it had attacked, and was told "The ferocious cave spiders come at you!"
  // with nothing after: a company that runs from a fight it chose stayed where it stood, and what it ran from fell on
  // it again in the same command. It goes back the way it came, and nothing comes after it.
  it('puts a company that runs from a fight it chose back the way it came, and nothing falls on it there', async () => {
    const s = await PlaySession.start('data/campaigns/the-long-man.campaign.json', 'merrow', NodeBundleSource.shared);
    for (const way of [/Merrow green/, /Hall yard/, /crest/, /sinkhole/]) {
      await s.perform(PlayerView.choices(s.campaign).find(c => way.test(c.choice.name))!.choice.id);
    }
    expect(Watch.where(s)).toBe('longman__leak');
    const attack = PlayerView.choices(s.campaign).find(c => /^Attack the Wet/.test(c.choice.name))!.choice.id;
    const event = await s.perform(attack, Watch.run);
    expect(event.combat.filter(e => e.type === 'end').length).toBe(1);
    expect([event.fledTo, Watch.where(s)]).toEqual(['longman__crest', 'longman__crest']);
    expect(JSON.stringify(event)).not.toContain('comes down the gallery at you');
  }, 60000);
  it('sends the patrol after a company that gets into the yard, and they fall on it there', async () => {
    const s = await Watch.start();
    Watch.know(s, 'world__password');
    await s.perform('go(world__gate,world__gatehouse)');
    // Through the arch is a minute; the patrol comes while the company waits, and falls on it.
    let fought = await s.perform('go(world__arch,world__yard)');
    for (let n = 0; !fought.prelude && n < 3; n++) { fought = await s.perform('wait_hour'); }
    expect(fought.prelude?.response).toContain('yard patrol');
    expect(fought.combat.some(e => e.type === 'end')).toBe(true);
  }, 60000);
  it('replays an ambush to the same world from the transcript', async () => {
    const s = await Watch.start();
    await s.perform('go(world__gate,world__gatehouse)');
    const replay = await Watch.start();
    await replay.replay(s.transcript.steps);
    expect(replay.canonical()).toBe(s.canonical());
  }, 60000);
});
