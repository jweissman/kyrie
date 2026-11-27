import { describe, expect, it, spyOn } from 'bun:test';
import { Tiny } from '../support/tiny';
import { EngineHost } from '../../web/engine/engine-host';
import { DangerSense } from '../../src/presentation/danger-sense';
import type { Frame } from '../../src/creation/protocol';
import type { PlaySession } from '../../src/session/play-session';
import type { Battle } from '../../src/battle';

// A blow answered at once (OR-1351): the frame that answers it is sent with the fight's standing as it is known (a blow
// ago, where it has moved), never with its trials played out between the blow and the frame (some 85 ms of them had
// made a blow's p95 355 ms in a1's rats: scripts/performance/fight-engine.ts); they are played after the frame has
// gone, and the frame sent again where the standing moved.
describe('a blow in a fight', () => {
  it('is answered before its standing is reckoned, and the standing sent after', async () => {
    const t = await Tiny.start(`
      Place cellar "the cellar" is room at 0, 0 indoors.
      Person rats "the rats" at cellar { Role "rats, fat and bold". Species rat. Numbers 4. Level 1. Lair cellar. }
      Company party "You" of 1 at cellar.`, { party: [{ name: 'Ilse', raceId: 'human', classId: 'mage' }] });
    const posts: { frame: Frame; reckoned: number }[] = [], reckon = spyOn(DangerSense, 'of');
    const host = new EngineHost(m => { if (m.kind === 'frame') { posts.push({ frame: m.frame, reckoned: reckon.mock.calls.length }); } });
    (host as unknown as { session: PlaySession }).session = t.session;
    try {
      void host.handle({ kind: 'perform', command: 'attack(t__rats)' });
      const turn = () => (host as unknown as { turn?: { battle: Battle } }).turn;
      for (let i = 0; i < 200 && !turn(); i++) { await new Promise(r => setTimeout(r, 0)); }
      const b = turn()!.battle, blow = b.legalCommands().find(c => c.actor === b.state.actor && c.target)!;
      const before = posts.length, calls = reckon.mock.calls.length;
      await host.handle({ kind: 'fight', choice: `${blow.ability}>${blow.target}` });
      for (let i = 0; i < 200 && posts.length === before; i++) { await Promise.resolve(); }
      const answer = posts[before]!;
      expect([!!answer.frame.combat, !answer.frame.combat?.outcome]).toEqual([true, true]);
      expect(answer.reckoned).toBe(calls);
      for (let i = 0; i < 50 && reckon.mock.calls.length === calls; i++) { await new Promise(r => setTimeout(r, 1)); }
      expect(reckon.mock.calls.length).toBeGreaterThan(calls);
    } finally { reckon.mockRestore(); }
  });
});
