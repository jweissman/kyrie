import { describe, expect, it } from 'bun:test';
import { PlaySession } from '../src/session/play-session';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { AutoplayRun } from '../src/autoplay/run';
import { AutoPlayer, type PolicyName } from '../src/autoplay/player';
import { Draw } from '../src/autoplay/draw';
import { Invariants, type Violation } from '../src/autoplay/invariants';
import { campaign } from './support/calamy';
import type { CreatureGenerationContext } from '../src/content';

// Calamy played by the autoplay laboratory's players (src/autoplay): whatever the page offers, chosen by players of
// several tempers, every step checked against what play must keep true (every creature sound, everything offered a
// legal command, the company whole, the game kept and opened again the same), and the whole run played again from its
// commands to the same game. It finds what prepared journeys do not: a rule that throws, a way that strands, a choice
// offered that cannot be taken.
async function explore(seed: string, policy: PolicyName, steps: number, party: CreatureGenerationContext[]) {
  const s = await PlaySession.start(campaign, seed, NodeBundleSource.shared, party);
  const player = new AutoPlayer(policy, new Draw(`${seed}:calamy:${policy}`)), metrics = AutoplayRun.empty();
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
  const again = await PlaySession.start(campaign, seed, NodeBundleSource.shared, party);
  await again.replay(s.transcript.steps);
  return { failures, metrics, replayed: again.canonical() === s.canonical(), places: s.campaign.world.related('been').length };
}

describe('Calamy, explored', () => {
  for (const [seed, policy, classId] of [['quay', 'mixed', 'bard'], ['bridge', 'explore', 'thief'], ['ashpit', 'fight', 'warrior']] as const) {
    it(`is played by a ${policy} player, a ${classId}, through its offered commands, and stays sound`, async () => {
      const r = await explore(seed, policy as PolicyName, 300, [{ name: 'Wren', raceId: 'human', classId } as CreatureGenerationContext]);
      expect(r.failures).toEqual([]);
      expect(r.replayed).toBe(true);
      expect(r.metrics.commands).toBeGreaterThan(20);
    }, 900000);
  }
});
