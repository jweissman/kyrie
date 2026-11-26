import type { PlaySession } from '../session/play-session';
import type { Screen } from '../ui/screen-types';

// The oracle (OR-1151, the owner, 26 November: "an oracle ball somewhere in dev builds that shows the world seed, the
// played commit, any other metadata … with a little copy button"): what a developer needs to reproduce what the player
// sees, the engine's to say (the page asks it, { kind: 'about' }, and draws it; the terminal asks the same, its
// `oracle`). Only the page's own facts are the page's: its size, its browser, how long it took to draw the last act.
export interface OracleAct {
  label: string; command: string;
  // The engine's share, in milliseconds: the act settled, the screen built, the telling (Frame.timing).
  timing?: { engine: number; screen?: number; narrative?: number };
}
export interface OracleReport {
  build: { commit: string; stamp: string };
  world?: { seed: string; scenario: string; installed: string[]; terrain?: string };
  life?: { name: string; calling?: string; origin?: string; level?: number };
  where?: { place: string; name: string; region?: string; hex?: number; clock: string; elapsed: number; turn: number };
  // The surfaces the company has earned (Screen.surfaces), and so what it has not: the developer's, all of them, by the
  // address's ?earned (compactification, OR-1245: "or accessible through oracle").
  surfaces?: string[];
  last?: OracleAct;
  save: { checkpoint: number; kept: number };
}
// The page's facts beside the engine's: its viewport, its browser, and how long the last act took it to draw.
export interface OraclePage { viewport: string; agent: string; draw?: number; total?: number }
export class Oracle {
  // The checkpoint's version (SessionCheckpoint) and the browser's kept game's (KeptGame's version 2).
  static readonly versions = { checkpoint: 1, kept: 2 } as const;
  // build: the commit and the engine's stamp (BuildStamp), or where it runs unbuilt, the checkout's commit.
  static of(build: OracleReport['build'], session?: PlaySession, screen?: Screen, last?: OracleAct): OracleReport {
    const base = { build, save: { ...Oracle.versions }, ...last ? { last } : {} };
    if (!session) { return base; }
    const campaign = session.campaign, transcript = session.transcript, drawn = transcript.drawn;
    const lead = screen?.party[0], party = drawn?.party[0] ?? transcript.party?.[0];
    const region = screen?.path.find(p => p.kind === 'region');
    return { ...base,
      world: { seed: session.seed, scenario: session.scenario, installed: campaign.installations.map(i => i.id),
        ...drawn?.terrain ? { terrain: drawn.terrain } : {} },
      life: { name: lead?.name ?? party?.name ?? '', ...lead?.calling ?? party?.classId ? { calling: lead?.calling ?? party?.classId } : {},
        ...drawn?.origin ? { origin: drawn.origin } : {}, ...lead ? { level: lead.level } : {} },
      ...screen ? { where: { place: screen.place.id, name: screen.place.name, ...region ? { region: region.id } : {},
        ...screen.region?.land?.here !== undefined ? { hex: screen.region.land.here } : {},
        clock: screen.clock, elapsed: screen.elapsed, turn: campaign.history.length } } : {},
      ...screen?.surfaces ? { surfaces: screen.surfaces } : {} };
  }
  // The last act's engine timings, once its frame is built (Frame.timing); kept as they were until another act.
  static timed(last: OracleAct | undefined, timing: OracleAct['timing']): OracleAct | undefined {
    return !last || last.timing || !timing ? last
      : { ...last, timing: { engine: timing.engine, screen: timing.screen, narrative: timing.narrative } };
  }
  // The report as plain text, a fact a line, as it is copied: what the page shows and what the terminal prints.
  static text(report: OracleReport, page?: OraclePage): string {
    const { build, world, life, where, last, save } = report;
    const lines = [`commit ${build.commit} · engine ${build.stamp}`];
    if (world) {
      lines.push(`seed ${world.seed} · scenario ${world.scenario}${world.terrain ? ` · terrain ${world.terrain}` : ''}`,
        `installed ${world.installed.join(', ') || '(none)'}`);
    }
    if (life) {
      lines.push(`life ${life.name}${life.calling ? `, ${life.calling}` : ''}${life.level ? ` ${life.level}` : ''}`
        + `${life.origin ? ` · origin ${life.origin}` : ''}`);
    }
    if (where) {
      lines.push(`at ${where.name} (${where.place})${where.region ? ` · region ${where.region}` : ''}`
        + `${where.hex !== undefined ? ` · hex ${where.hex}` : ''}`,
      `time ${where.clock} (tick ${where.elapsed}) · turn ${where.turn}`);
    }
    if (last) {
      const t = last.timing;
      lines.push(`last ${last.label || '(unnamed)'} · ${last.command}`
        + `${t ? ` · engine ${t.engine} ms` : ''}${t?.screen !== undefined ? `, screen ${t.screen} ms` : ''}`
        + `${t?.narrative !== undefined ? `, telling ${t.narrative} ms` : ''}`
        + `${page?.draw !== undefined ? ` · page ${page.draw} ms` : ''}${page?.total !== undefined ? ` · total ${page.total} ms` : ''}`);
    }
    if (report.surfaces) { lines.push(`earned ${report.surfaces.join(', ') || '(nothing yet)'} · ?earned earns every one`); }
    lines.push(`save checkpoint v${save.checkpoint} · kept v${save.kept}`);
    if (page) { lines.push(`viewport ${page.viewport}`, `agent ${page.agent}`); }
    return lines.join('\n');
  }
}
