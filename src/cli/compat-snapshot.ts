// The compatibility harness's snapshot (the maturity track's step 6, MT-06): for the pinned worlds and journeys, what
// a revision makes of them, kept as data so that two revisions' can be compared and the difference said by its kind
// (see CompatCompare). A world: its places, its passages and their minutes, its people and where they are, and the
// placements its stories were set by. A journey: each step's line, whether it was taken, the rows offered after it
// (ids and labels, through the runner's offer), the scene's lines, and the digest; and its save, restored.
//   bun scripts/compat.ts snapshot [--quick] [--out snapshot.json] [--saves dir]
import type { Campaign } from '../campaign/campaign';
import { WorldAssembler, type Placement } from '../world/world-assembler';
import { DrawnWorld } from '../world/drawn-world';
import { NodeBundleSource } from '../campaign/node-bundle-source';
import { ActionTime } from '../campaign/action-time';
import type { PlaySession } from '../session/play-session';
import { CompatJourneys } from './compat-journeys';
import { PlayTool } from './play-tool';

// A world as it was drawn: ids sorted, each a line that says it (a passage: its ends and minutes; a person: where).
export interface WorldShot { name: string; places: string[]; passages: Record<string, string>;
  people: Record<string, string>; placements: Record<string, string> }
// One step of a journey: the line or step sent, whether it was taken (or why not), and what the turn then was.
export interface StepShot { line: string; ok: boolean; error?: string; rows: string[]; lines: string[];
  digest: string; at?: string }
// A save restored: in the build that kept it (same: its digest and its turn as before), and the file it was kept in.
export interface SaveShot { restores: boolean; why?: string; digest: string; turn: string[]; file?: string }
export interface JourneyShot { name: string; world: string; steps: StepShot[]; save: SaveShot }
export interface Snapshot { version: 1; label: string; quick: boolean; worlds: WorldShot[]; journeys: JourneyShot[] }
// A pinned world, by the play tool's own arguments, and the journey played in it, if any.
export interface Pin { name: string; args: string[]; quick?: boolean }

export class CompatSnapshot {
  // The worlds pinned with no journey of their own; iscoed's drove and weir are the cold plays' (CompatJourneys.cold),
  // each taken as its play begins.
  static readonly worlds: Pin[] = [
    { name: 'a1', args: ['--world', 'a1'], quick: true },
    { name: 'kite', args: ['--world', 'kite'] },
  ];
  // quick: a1, the first lines of the fourth cold play and the kept plays of a campaign, for the push lane.
  static async take(o: { quick: boolean; label: string; saves?: string }): Promise<Snapshot> {
    const worlds: WorldShot[] = [], journeys: JourneyShot[] = [];
    for (const pin of this.worlds.filter(p => !o.quick || p.quick)) {
      const { journey } = await PlayTool.start(PlayTool.parse(pin.args));
      worlds.push(await this.world(pin.name, journey.session));
    }
    for (const c of CompatJourneys.cold.filter(c => !o.quick || c.quick)) {
      const { journey } = await PlayTool.start(PlayTool.parse(c.args));
      worlds.push(await this.world(c.world, journey.session));
      journeys.push(await CompatJourneys.lines(c, journey.session, o));
    }
    journeys.push(...await CompatJourneys.traces(o));
    return { version: 1, label: o.label, quick: o.quick, worlds, journeys };
  }
  // A drawn world's layout, and its placements as the assembler made them (drawn again: it is deterministic).
  static async world(name: string, session: PlaySession): Promise<WorldShot> {
    const drawn = session.transcript.drawn, source = NodeBundleSource.shared;
    const placements = drawn
      ? (await WorldAssembler.assemble(session.seed, source, DrawnWorld.options(drawn))).report.placements : [];
    return { name, ...this.layout(session.campaign), placements: this.placed(placements) };
  }
  static layout(c: Campaign): Omit<WorldShot, 'name' | 'placements'> {
    const w = c.world, places = c.module.entities.filter(e => e.type === 'place').map(e => e.id).sort();
    const passages: Record<string, string> = {}, people: Record<string, string> = {};
    for (const r of [...w.related('connects')].sort((a, b) => a.args[0]!.localeCompare(b.args[0]!))) {
      const id = r.args[0]!;
      passages[id] = `${r.args[1]} - ${r.args[2]}, ${ActionTime.passage(w, id)} min`;
    }
    for (const id of c.readout.creatures.map(x => x.id).sort()) { people[id] = w.one('at', id) ?? 'nowhere'; }
    return { places, passages, people };
  }
  private static placed(ps: Placement[]): Record<string, string> {
    const out: Record<string, string> = {};
    for (const p of ps) {
      out[`${p.rid}:${p.scenario}#${p.instance}`] = Object.entries(p.bindings).sort(([a], [b]) => a.localeCompare(b))
        .map(([role, id]) => `${role}=${id}`).join(' ');
    }
    return out;
  }
}
