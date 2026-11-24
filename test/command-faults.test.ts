import { afterEach, describe, expect, it } from 'bun:test';
import { PlaySession } from '../src/session/play-session';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { Campaign } from '../src/campaign/campaign';
import { RuleWords } from '../src/narrative/rule-words';
import { Telling } from '../src/narrative/telling';
import { Undertakings } from '../src/presentation/undertakings';
import { Digest } from '../src/session/digest';
import { CampaignTick } from '../src/campaign/campaign-tick';
import { Consequences } from '../src/campaign/consequences';
import { Arrivals } from '../src/campaign/arrivals';

// One command, one history (MT-24; BRIEF §5C; the architectural review's Finding C): a command commits exactly once or
// fails without changing anything, whichever of its phases fails. Each phase after the world's own act (what comes of
// it, the rules' words, the telling, the undertakings, the transcript's digest, the words marked told) is made to fail
// once, in turn; the game is then as it was before the command, its receipt says it was undone, and the command done
// again is the game in which the failure never happened. test/command-atomicity holds the first of them (what comes
// after, installing or not); this holds every one.
// A word with Tobu, which reaches every phase (a plain wait tells nothing, and marks no words told).
const source = NodeBundleSource.shared, ordinary = 'test/fixtures/probes/ordinary/ordinary.campaign.json';
const command = 'talk_to(o__tobu)';
type Phase = { name: string; target: object; key: string };
const phases: Phase[] = [
  { name: 'the rules\' words', target: RuleWords, key: 'tell' },
  { name: 'the telling', target: Telling, key: 'tell' },
  { name: 'the undertakings', target: Undertakings, key: 'after' },
  { name: 'the transcript\'s digest', target: Digest, key: 'of' },
  { name: 'the words marked told', target: Campaign.prototype, key: 'told' },
];
const restore: (() => void)[] = [];
afterEach(() => { while (restore.length) { restore.pop()!(); } });
// The phase made to fail once, the `after`-th time it is reached (0: the first); whether it was, said after.
const failOnce = ({ target, key }: Phase, after = 0): { failed: boolean } => {
  const t = target as Record<string, (...a: unknown[]) => unknown>, was = t[key]!, seen = { failed: false };
  let reached = 0;
  t[key] = function (this: unknown, ...a: unknown[]) {
    if (!seen.failed && reached++ === after) { seen.failed = true; throw new Error(`injected: ${key}`); }
    return was.apply(this, a);
  };
  restore.push(() => { t[key] = was; });
  return seen;
};

describe('a command that fails at any phase changes nothing', () => {
  for (const phase of phases) {
    it(`when ${phase.name} fails`, async () => {
      const s = await PlaySession.start(ordinary, 'faults', source), before = s.canonical();
      const seen = failOnce(phase);
      await expect(s.leg(command)).rejects.toThrow(/injected/);
      expect(seen.failed).toBe(true);
      expect(s.canonical()).toBe(before);
      expect([s.transcript.steps.length, s.campaign.history.length]).toEqual([0, 0]);
      expect(s.receipts).toEqual([{ id: command, revision: 0, outcome: 'undone' }]);
      // Done again, it is the game the failure never happened in.
      await s.leg(command);
      const plain = await PlaySession.start(ordinary, 'faults', source);
      await plain.perform(command);
      expect(s.canonical()).toBe(plain.canonical());
    }, 60000);
  }
});

// And within the act itself: an hour's wait passes six watches, each committing the world as its rules fire; a fault
// on the fourth, after three have committed, leaves nothing of any of them (the campaign's own checkpoint, restored on
// any throw: Campaign.executeAsync).
const within: Phase[] = [
  { name: 'the townsfolk acting', target: CampaignTick, key: 'npcs' },
  { name: 'the world\'s rules', target: CampaignTick, key: 'rules' },
  { name: 'what the world turns on the company', target: Consequences, key: 'strike' },
  { name: 'who arrives', target: Arrivals, key: 'tell' },
];
describe('a command that fails within its watches changes nothing', () => {
  for (const phase of within) {
    it(`when ${phase.name} fails on a later watch`, async () => {
      const s = await PlaySession.start(ordinary, 'faults', source), before = s.canonical();
      const seen = failOnce(phase, 3);
      await expect(s.leg('wait_hour')).rejects.toThrow(/injected/);
      expect(seen.failed).toBe(true);
      expect(s.canonical()).toBe(before);
      expect(s.receipts).toEqual([{ id: 'wait_hour', revision: 0, outcome: 'undone' }]);
      await s.leg('wait_hour');
      const plain = await PlaySession.start(ordinary, 'faults', source);
      await plain.perform('wait_hour');
      expect(s.canonical()).toBe(plain.canonical());
    }, 60000);
  }
});
