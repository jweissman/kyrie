import { Journey, type Taken } from '../../src/session/journey';
import { PlaySession, type SessionCheckpoint } from '../../src/session/play-session';
import { DrawnWorld } from '../../src/world/drawn-world';
import { Frontier } from '../../src/world/frontier';
import { NodeBundleSource } from '../../src/campaign/node-bundle-source';

type Drawn = Parameters<typeof DrawnWorld.start>[1];

// Journeys that begin alike are played alike once (Mission 21, Phase 0: an authored playthrough's tests each replayed
// the same prefix, the walk to the Row and two days' waiting, 96 % of a test's time in the Book of Faces). A journey
// is known by what it started from (campaign, seed, company) and the steps played on it, each play's steps in order;
// where those have been played before in this process, it is resumed from the checkpoint kept then (0.2 s) instead
// of played again. A resumed game is the same game: its canonical state, its record of steps and what each step told.
// Only within a process (a spec file, or a worker under --no-isolate); never on disk, which a change to src or data
// would have to invalidate. At most `most` kept (a checkpoint of Ombra is 9 MB), the longest-unused let go first.
export class Kept {
  static most = 16;
  private static readonly kept = new Map<string, { checkpoint: SessionCheckpoint; taken: Taken[] }>();
  static hits = 0;
  private key: string;
  // The world as the last kept play left it: changed since by anything else (a step played on the journey itself, a
  // fact put), the steps no longer say what the game is, and it is kept no more.
  private left: object;
  private constructor(public journey: Journey, start: string) { this.key = start; this.left = journey.campaign.world; }
  static async start(campaign: string, seed: string, options: Parameters<typeof Journey.start>[2] = {}): Promise<Kept> {
    const start = JSON.stringify([campaign, seed, options.party ?? null]);
    // A source of its own (a campaign laid over another) is not known by its path alone: never kept.
    if (options.source) { return new Kept(await Journey.start(campaign, seed, options), `${start}|${Math.random()}`); }
    const again = Kept.resumed(start);
    if (again) { return new Kept(again, start); }
    const journey = await Journey.start(campaign, seed, options);
    Kept.keep(start, journey);
    return new Kept(journey, start);
  }
  // A drawn world (a seed and who comes into it) begun alike is drawn once in a process, as a campaign is: the
  // silent lord's specs each drew a1 and waited nine days to reach the keep, 90 s a case before anything was tried.
  static async drawn(seed: string, drawn: Drawn): Promise<Kept> {
    const start = JSON.stringify(['drawn', seed, drawn]);
    const again = Kept.resumed(start);
    if (again) { return new Kept(again, start); }
    const journey = Journey.of(await DrawnWorld.start(seed, drawn, NodeBundleSource.shared));
    Kept.keep(start, journey);
    return new Kept(journey, start);
  }
  // The steps played, from where the longest of their beginnings was played before, if it was; kept again after any
  // step that took a while (a wait of days, a long walk) and at the end.
  async play(...steps: string[]): Promise<Journey> {
    if (this.journey.campaign.world !== this.left) { this.key = `${this.key}|${Math.random()}`; }
    let from = 0;
    for (let n = steps.length; n > 0 && !from; n--) {
      const again = Kept.resumed(this.at(steps, n));
      if (again) { this.journey = again; from = n; }
    }
    for (let i = from; i < steps.length; i++) {
      const began = performance.now();
      await this.journey.play(steps[i]!);
      const last = i === steps.length - 1;
      if (last || performance.now() - began > Kept.slow) { Kept.keep(this.at(steps, i + 1), this.journey); }
    }
    this.key = this.at(steps, steps.length); this.left = this.journey.campaign.world;
    return this.journey;
  }
  // A step slower than this is worth keeping where it leaves the game, in milliseconds.
  static slow = 250;
  private at(steps: string[], n: number): string { return `${this.key}|${JSON.stringify(steps.slice(0, n))}`; }
  private static resumed(key: string): Journey | undefined {
    const kept = this.kept.get(key);
    if (!kept) { return undefined; }
    this.kept.delete(key); this.kept.set(key, kept);
    this.hits++;
    // A drawn world's frontier (what it held back, drawn when the company goes there) is the world's again, as a
    // save resumed in the terminal has it (Kyrie.resume).
    const session = PlaySession.resume(kept.checkpoint), drawn = session.transcript.drawn;
    if (drawn) { session.extend(new Frontier(session.seed, NodeBundleSource.shared, DrawnWorld.options(drawn))); }
    const journey = Journey.of(session);
    journey.taken.push(...structuredClone(kept.taken));
    return journey;
  }
  private static keep(key: string, journey: Journey) {
    this.kept.set(key, { checkpoint: journey.session.checkpoint(), taken: structuredClone(journey.taken) });
    while (this.kept.size > this.most) { this.kept.delete(this.kept.keys().next().value!); }
  }
}
