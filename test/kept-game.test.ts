import { describe, expect, it } from 'bun:test';
import { WorldAssembler } from '../src/world/world-assembler';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { PlaySession } from '../src/session/play-session';
import { PlayerView } from '../src/presentation/player-view';
import { KeptGame } from '../web/engine/kept-game';

// A game kept in the browser is its state, kept after every command, and the world it is played in, kept once. Put
// back together, it is the game it was: every fact in the order the world held it, and the same things happen next.
class Kept {
  static async played(steps: number) {
    const w = await WorldAssembler.assemble('thorn', NodeBundleSource.shared,
      { origin: 'wanderer', party: [{ name: 'Wenna', raceId: 'human', classId: 'warrior' }] });
    const s = await PlaySession.start(w.path, 'thorn', w.source);
    await this.walk(s, steps, 0);
    return s;
  }
  // Commands chosen by their place in what is offered, so two sessions in the same state make the same choices.
  static async walk(s: PlaySession, steps: number, from: number) {
    const done: string[] = [];
    for (let i = from; i < from + steps; i++) {
      const ids = PlayerView.choices(s.campaign).map(c => c.choice.id)
        .filter(id => /^(go|wait|talk_to|take_leave|ask)/.test(id));
      const event = await s.perform(ids[(i * 7) % ids.length]!);
      done.push(JSON.stringify([event.action, event.changes]));
    }
    return done;
  }
}

describe('a game kept in the browser', () => {
  it('keeps its world once and its state after each command, and is the same game put back together', async () => {
    const s = await Kept.played(6), first = KeptGame.keyed(s.checkpoint());
    await Kept.walk(s, 12, 6);
    const checkpoint = s.checkpoint(), state = KeptGame.split(checkpoint, first, []);
    // Read from the world itself, relation by relation, it is the same state.
    expect(KeptGame.split(checkpoint, first, [], s.campaign.world)).toEqual(state);
    // The state is a small part of the whole: the world's facts are not in it, only how they differ.
    expect(JSON.stringify(state).length * 4).toBeLessThan(JSON.stringify(checkpoint).length);
    const whole = KeptGame.join(JSON.parse(JSON.stringify(state)), JSON.parse(first.text));
    // The same facts, in the order it held them (the order the world's rules read them in), and the state as it was.
    expect(whole.checkpoint.save.state.world.relations).toEqual(checkpoint.save.state.world.relations);
    expect(Object.keys(whole.checkpoint.save.state)).toEqual(Object.keys(checkpoint.save.state));
    // What happens next is what would have happened.
    const back = PlaySession.resume(whole.checkpoint);
    expect(back.canonical()).toBe(s.canonical());
    expect(await Kept.walk(back, 8, 18)).toEqual(await Kept.walk(s, 8, 18));
    // A world's key is its contents': the same text, the same key.
    expect(KeptGame.key(first.text)).toBe(first.key);
  }, 120000);
  // A thing given in play is made an entity of the module as it is given: the world kept before it is no longer the
  // world played in, and is kept again (Mission 19: a game in which Bask had given the corn-store key would not open).
  it('keeps its world again once something given has grown the module, and opens as it was', async () => {
    const w = await WorldAssembler.assemble('kite', NodeBundleSource.shared,
      { party: [{ name: 'Wenna', raceId: 'human', classId: 'warrior' }] });
    const s = await PlaySession.start(w.path, 'kite', w.source), first = KeptGame.keyed(s.checkpoint(true));
    for (const re of [/^Take Falkor's door/, /^Ask .* about the rats/]) {
      await s.leg(PlayerView.choices(s.campaign).find(x => re.test(x.choice.name))!.choice.id);
    }
    const checkpoint = s.checkpoint(true);
    expect(KeptGame.still(first, checkpoint)).toBe(false);
    // Kept beside the world from before the gift, as the browser had kept it, it would not open.
    const stale = KeptGame.join(JSON.parse(JSON.stringify(KeptGame.split(checkpoint, first, []))),
      JSON.parse(first.text));
    expect(() => PlaySession.resume(stale.checkpoint, { trusted: true })).toThrow(/creature facts/);
    const again = KeptGame.keyed(checkpoint), kept = JSON.parse(JSON.stringify(KeptGame.split(checkpoint, again, [])));
    const whole = KeptGame.join(kept, JSON.parse(again.text));
    expect(() => PlaySession.resume(whole.checkpoint, { trusted: true })).not.toThrow();
  }, 120000);
});
