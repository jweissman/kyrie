import { describe, expect, it } from 'bun:test';
import { PlaySession } from '../src/session/play-session';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { AutoplayRun } from '../src/autoplay/run';
import { AutoPlayer, type PolicyName } from '../src/autoplay/player';
import { Draw } from '../src/autoplay/draw';
import { Invariants, type Violation } from '../src/autoplay/invariants';
import { home } from './support/sennet';
import type { CreatureGenerationContext } from '../src/content';

// Sennet played by the autoplay laboratory's players (src/autoplay), as Calamy is: whatever the page offers, chosen by
// players of several tempers, every step checked against what play must keep true, and the run played again from its
// commands to the same game. Three storeys and four planes give a wandering player many ways to strand itself (under
// the bay without breath, up the chain when the gang strikes, in a court with no way home): none may.
async function explore(seed: string, policy: PolicyName, steps: number, party: CreatureGenerationContext[]) {
  const s = await PlaySession.start(home, seed, NodeBundleSource.shared, party);
  const player = new AutoPlayer(policy, new Draw(`${seed}:sennet:${policy}`)), metrics = AutoplayRun.empty();
  const failures: string[] = [];
  for (let step = 0; step < steps && s.campaign.running; step++) {
    const move = player.next(AutoplayRun.situation(s, step));
    if (!move) { failures.push(`softlock at ${step}`); break; }
    try { await AutoplayRun.apply(s, move, player, metrics); } catch (e) {
      failures.push(`step ${step} ${JSON.stringify(move)}: ${(e as Error).message}`); break;
    }
    const violations: Violation[] = [...Invariants.creatures(s), ...Invariants.offered(s), ...Invariants.party(s),
      ...step % 40 === 39 ? Invariants.roundtrip(s) : []];
    if (violations.length) { failures.push(`step ${step}: ${violations[0]!.kind} ${violations[0]!.message}`); break; }
  }
  const again = await PlaySession.start(home, seed, NodeBundleSource.shared, party);
  await again.replay(s.transcript.steps);
  return { failures, metrics, replayed: again.canonical() === s.canonical() };
}

describe('Sennet, explored', () => {
  const runs = [['gulls', 'mixed', 'bard'], ['tide', 'explore', 'thief'], ['ember', 'fight', 'warrior'],
    ['fern', 'explore', 'monk']] as const;
  for (const [seed, policy, classId] of runs) {
    it(`is played by a ${policy} player, a ${classId}, through its offered commands, and stays sound`, async () => {
      const r = await explore(seed, policy as PolicyName, 300,
        [{ name: 'Wren', raceId: 'human', classId } as CreatureGenerationContext]);
      expect(r.failures).toEqual([]);
      expect(r.replayed).toBe(true);
      expect(r.metrics.commands).toBeGreaterThan(20);
    }, 900000);
  }
});
