import { readFileSync, writeFileSync } from 'node:fs';
import { PlayTool } from '../src/cli/play-tool';
import { Runner } from '../src/cli/runner';
import { ModuleWriter } from '../src/lang/module-writer';
import { PaintedSky, type Judged } from '../src/ui/painted-sky';
import { ScreenModel } from '../src/ui/screen-model';
import { Scenery } from '../src/ui/scenery';
import { SceneKinds } from '../src/ui/scene-kinds';
import type { Screen } from '../src/ui/screen-types';
import { AsMeant } from '../test/support/as-meant';
import { GoldenWalk } from '../test/support/golden-walk';

// Which places of a generated world have no painting, and under which sky (doc/design/paintings-needed.md): the company
// put at each place in turn, its screen built as play builds it, and the scene asked for (Scenery.seen) on a fair day,
// a rainy day, a fair evening, a fair night and a rainy night; each painting shown judged against that sky
// (PaintedSky: a clear day in rain, a sunlit room at night). A list of what to paint next, not a gate.
//   bun scripts/scene-census.ts [world] [out.json]   prints blanks and contradictions by kind; writes each place's row
// And the golden walk (BRIEF §3.4): the warrior's walk of Iscoed played headless, the scene at every turn judged
// against the world's own sky and hour (test/features/world/the-sky-in-the-painting.pin holds it at none).
//   bun scripts/scene-census.ts walk
interface Row { id: string; name: string; kind: string; roofed: boolean; blank: string[]; wrong: string[] }
export interface Turn extends Judged { turn: number; place: string; weather?: string; hour: string; line?: string }
type Sky = [name: string, weather: string, daylight: string];
export class SceneCensus {
  static readonly skies: Sky[] = [['fair day', 'fair', 'day'], ['rain by day', 'rainy', 'day'],
    ['fair evening', 'fair', 'evening'], ['fair night', 'fair', 'night'], ['rain by night', 'rainy', 'night']];
  static readonly walkFile = 'doc/architecture/mission-22/golden/warrior-walk.txt';
  static under(screen: Screen, [, weather, daylight]: Sky): Screen {
    return { ...screen, weather, dark: false, expedition: { ...screen.expedition, daylight } } as Screen;
  }
  static async rows(world: string): Promise<Row[]> {
    const { journey } = await PlayTool.start(PlayTool.parse(['--world', world, '--as', 'human/warrior/Wenna']));
    const c = journey.session.campaign;
    const places = c.world.module.entities.filter(e => e.type === 'place').map(e => e.id);
    const rows: Row[] = [];
    for (const id of places) {
      c.commitWorld(c.world.apply([{ kind: 'assert', call: ModuleWriter.call('at', 'party', id) }]));
      const screen = ScreenModel.build(journey.session.campaign);
      if (screen.place.id !== id) { continue; }
      const judged = this.skies.map(sky => [sky[0], PaintedSky.judge(this.under(screen, sky))] as const);
      rows.push({ id, name: screen.place.name, kind: SceneKinds.of(screen)?.kind.kind ?? '(none)',
        roofed: Scenery.roofed(screen), blank: judged.filter(([, j]) => j.fault === 'blank').map(([n]) => n),
        wrong: judged.filter(([, j]) => j.fault && j.fault !== 'blank').map(([n, j]) => `${n}: ${j.painting} (${j.why})`) });
    }
    return rows;
  }
  // The scene at the start and after every line of the golden walk, judged against the sky it is seen under.
  // Each screen judged is handed to seen, for a caller that would ask it under other skies.
  static async walk(lines = this.lines(), seen?: (screen: Screen) => void): Promise<Turn[]> {
    const { journey } = await PlayTool.start(PlayTool.parse(GoldenWalk.args()));
    const r = new Runner(journey.session), c = journey.session.campaign;
    // The way in first, the plate a new life opens on (Scenery.approach), under the sky it opens in.
    const first = ScreenModel.build(c);
    const turns: Turn[] = [{ ...this.turn(0, first, Scenery.approach(first)), place: 'the way in' }];
    turns.push(this.seen(0, ScreenModel.build(c), seen));
    for (const [i, line] of lines.entries()) {
      await AsMeant.ask(r, line);
      turns.push({ ...this.seen(i + 1, ScreenModel.build(c), seen), line });
    }
    return turns;
  }
  private static seen(turn: number, s: Screen, seen?: (screen: Screen) => void): Turn {
    seen?.(s);
    return this.turn(turn, s, Scenery.seen(s));
  }
  private static turn(turn: number, s: Screen, painting: string | undefined): Turn {
    return { turn, place: `${s.place.name} (${s.place.id})`, ...s.weather ? { weather: s.weather } : {},
      hour: s.expedition.daylight, ...PaintedSky.of(s, painting) };
  }
  static lines(): string[] {
    return readFileSync(this.walkFile, 'utf8').split('\n').filter(l => l.trim() && !l.startsWith('#'));
  }
  static report(rows: Row[]): string[] {
    const by = new Map<string, Row[]>();
    for (const r of rows.filter(x => x.blank.length || x.wrong.length)) {
      by.set(r.kind, [...by.get(r.kind) ?? [], r]);
    }
    return [...by].sort((a, b) => b[1].length - a[1].length).map(([kind, xs]) => `${kind}: ${xs.length} of `
      + `${rows.filter(r => r.kind === kind).length} | ` + this.skies.map(([n]) => this.faulted(xs, n)).join(' / ')
      + ` | ${[...new Set(xs.map(x => x.name))].slice(0, 6).join('; ')}`);
  }
  // How many of these places are blank, or painted against it, under this sky.
  private static faulted(xs: Row[], sky: string): number {
    return xs.filter(x => x.blank.includes(sky) || x.wrong.some(w => w.startsWith(sky))).length;
  }
  static async main(args: string[]): Promise<number> {
    if (args[0] === 'walk') { return this.walked(await this.walk()); }
    const rows = await this.rows(args[0] ?? 'iscoed');
    if (args[1]) { writeFileSync(args[1], JSON.stringify(rows, null, 1)); }
    console.log(`${rows.length} places: ${rows.filter(r => r.blank.length).length} blank in some sky, `
      + `${rows.filter(r => r.wrong.length).length} shown against it in some sky `
      + `(${this.skies.map(([n]) => n).join(' / ')})`);
    for (const line of this.report(rows)) { console.log(`  ${line}`); }
    return 0;
  }
  static walked(turns: Turn[]): number {
    const faults = turns.filter(t => t.fault);
    console.log(`${turns.length} turns: ${faults.length} at fault (${['blank', 'untold', 'weather', 'hour'].map(f =>
      `${f} ${faults.filter(t => t.fault === f).length}`).join(', ')}), ${turns.filter(t => t.dimmed).length} dimmed`);
    for (const t of turns.filter(x => x.fault || x.dimmed)) {
      console.log(`  ${t.turn} ${t.place}, ${t.weather ?? 'no sky'} by ${t.hour}: ${t.painting ?? '-'} `
        + `${t.fault ? `[${t.fault}] ${t.why}` : '(dimmed)'}`);
    }
    return 0;
  }
}
if (import.meta.main) { process.exit(await SceneCensus.main(process.argv.slice(2))); }
