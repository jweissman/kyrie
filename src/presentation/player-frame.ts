import type { Campaign } from '../campaign/campaign';
import type { Operator } from '../campaign/planner';
import { PlayerView } from './player-view';
import { Knowing } from './knowing';

// A row as the frame holds it, and the frame's rows: read by every consumer, changed by none (each is frozen).
export type FrameRow = ReturnType<typeof PlayerView.choices>[number];
export type FrameRows = readonly FrameRow[];

// The player's rows, worked out once for each player revision and read by every consumer (platform-separation.md, the
// trust thread, adopted by the owner on 25 November): the runner, the engine host, the screen, the glance, the
// narrator and the presentation helpers read the one row set, in the plan's directional order (runtime legality, then
// the rows and the question, then the screen, then the narration), and none asks PlayerView.choices for itself, so
// that what the player is offered means one thing everywhere. Each had derived its own from its own copy, some forty
// asks in twenty-seven files (eleven a turn on the golden walk), counted by scripts/frame-rows.ts.
//
// A revision is the campaign's world and the list on offer in it (Campaign.offered: a new world, a command under way
// or the game ended each give a new one). The session's own revisions (a talk opened or paged, a lens, the map put
// away) change what is drawn of the rows, never the rows, so the screen and the leaf built for them read the same
// frame. What a consumer derives from the rows it keeps here, by name (see reading), so that it is derived once.
export class PlayerFrame {
  private static readonly kept = new WeakMap<Campaign, PlayerFrame>();
  private readonly readings = new Map<string, unknown>();
  private constructor(readonly campaign: Campaign, readonly world: Campaign['world'], readonly offered: readonly Operator[],
    readonly rows: FrameRows) {}
  // The frame of the campaign as it is now: the one kept while its revision holds, else built.
  static of(campaign: Campaign): PlayerFrame {
    const offered = campaign.offered(), kept = this.kept.get(campaign);
    if (kept && kept.world === campaign.world && kept.offered === offered) { return kept; }
    // Worked out under the campaign's own rules (its installation, OR-520).
    const rows = Object.freeze(campaign.within(() => PlayerView.choices(campaign)).map(r => Object.freeze({ ...r,
      choice: Object.freeze(r.choice) })));
    const frame = new PlayerFrame(campaign, campaign.world, offered, rows);
    this.kept.set(campaign, frame);
    return frame;
  }
  // What the company knows and perceives in this revision (the projection the rows are worded and marked by: the
  // knowledge boundary's door, OR-527), for the consumers that read the frame.
  get knowing(): Knowing { return Knowing.of(this.campaign); }
  // The rows of someone to be spoken to (a talk's).
  get spoken(): FrameRows { return this.reading('spoken', () => this.rows.filter(r => r.action.speaker)); }
  // The row a command names, if offered (the first, as a search of the rows finds it).
  row(command: string): FrameRow | undefined { return this.byId.get(command); }
  private get byId(): Map<string, FrameRow> {
    return this.reading('by id', () => new Map([...this.rows].reverse().map(r => [r.choice.id, r])));
  }
  // Each choice's words, by its id.
  get names(): Map<string, string> {
    return this.reading('names', () => new Map(this.rows.map(r => [r.choice.id, r.choice.name])));
  }
  // What each row is done to, by its id: the ids its bindings name, but for the roles skipped (who does it, and the
  // site it is done at, unless where the site is what is to be acted on). One reading for the glance, the aim's
  // continuity and the runner's led rows, which had each worked it out.
  bound(skip: readonly string[] = PlayerFrame.doer): Map<string, string[]> {
    return this.reading(`bound but ${skip.join(',')}`, () => new Map(this.rows.map(r => [r.choice.id,
      Object.entries(r.action.bindings ?? {}).filter(([k]) => !skip.includes(k)).map(([, v]) => v)])));
  }
  static readonly doer: readonly string[] = ['actor', 'site'];
  // The rows of a few schemas alone, as the frame would hold them, without building it (PlayerView.only): for a reader
  // that asks for those and nothing else, a journey's leg.
  static only(campaign: Campaign, schemas: ReadonlySet<string>): FrameRows {
    return PlayerView.only(campaign, schemas);
  }
  // What a consumer derives from the rows, worked out once for this revision: its name says what it is and whose.
  reading<T>(name: string, derive: () => T): T {
    if (!this.readings.has(name)) { this.readings.set(name, derive()); }
    return this.readings.get(name) as T;
  }
}
