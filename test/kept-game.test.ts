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
  static byRelation(relations: { name: string; args: string[] }[]): Record<string, string[]> {
    const out: Record<string, string[]> = {};
    for (const r of relations) { (out[r.name] ??= []).push(r.args.join(',')); }
    return out;
  }
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
    // The same facts, each relation's in the order it held them (the order the world's rules read them in).
    expect(Kept.byRelation(whole.checkpoint.save.state.world.relations))
      .toEqual(Kept.byRelation(checkpoint.save.state.world.relations));
    // What happens next is what would have happened.
    const back = PlaySession.resume(whole.checkpoint);
    expect(await Kept.walk(back, 8, 18)).toEqual(await Kept.walk(s, 8, 18));
    // A world's key is its contents': the same text, the same key.
    expect(KeptGame.key(first.text)).toBe(first.key);
  }, 120000);
});
