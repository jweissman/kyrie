import { describe, expect, it } from 'bun:test';
import { Tiny } from '../support/tiny';
import { EngineHost } from '../../web/engine/engine-host';
import type { Frame } from '../../src/creation/protocol';
import type { PlaySession } from '../../src/session/play-session';
import type { Battle } from '../../src/battle';

// Foes in their likenesses (the owner, 26 November, the combat experiment's layout): where every foe has one, the
// engine says so (CombatScreen.stage 'portraits') and the page gives them most of the stage's left side, large; the
// hint is the engine's, every client alike, never the page's guess from its cards.
const fight = async (kyr: string): Promise<Frame> => {
  const t = await Tiny.start(kyr, { party: [{ name: 'Ilse', raceId: 'human', classId: 'mage' }] });
  const posts: Frame[] = [], host = new EngineHost(m => { if (m.kind === 'frame') { posts.push(m.frame); } });
  (host as unknown as { session: PlaySession }).session = t.session;
  void host.handle({ kind: 'perform', command: 'attack(t__band)' });
  for (let i = 0; i < 200 && !(host as unknown as { turn?: { battle: Battle } }).turn; i++) {
    await new Promise(r => setTimeout(r, 0));
  }
  return posts.at(-1)!;
};
describe('foes in their likenesses', () => {
  it('stand large where every foe has one', async () => {
    const f = await fight(`
      Place cellar "the cellar" is room at 0, 0 indoors.
      Person band "the rats" at cellar { Role "rats". Species rat. Numbers 2. Level 1. Lair cellar. }
      Company party "You" of 1 at cellar.`);
    expect(f.combat!.foes.every(x => !!x.face)).toBe(true);
    expect(f.combat!.stage).toBe('portraits');
  });
});
