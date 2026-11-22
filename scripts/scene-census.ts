import { writeFileSync } from 'node:fs';
import { PlayTool } from '../src/cli/play-tool';
import { ModuleWriter } from '../src/lang/module-writer';
import { ScreenModel } from '../src/ui/screen-model';
import { Scenery } from '../src/ui/scenery';
import { SceneKinds } from '../src/ui/scene-kinds';
import type { Screen } from '../src/ui/screen-types';

// Which places of a generated world have no painting, and under which sky (doc/design/scene-needs.md): the company
// put at each place in turn, its screen built as play builds it, and the scene asked for (Scenery.seen) on a fair day,
// a rainy day, a fair evening and a fair night. A list of what to paint next, not a gate.
//   bun scripts/scene-census.ts [world] [out.json]      prints blanks by kind; writes each place's row
interface Row { id: string; name: string; kind: string; roofed: boolean; blank: string[] }
export class SceneCensus {
  static readonly skies: [string, string, string][] = [['fair day', 'fair', 'day'], ['rain by day', 'rainy', 'day'],
    ['fair evening', 'fair', 'evening'], ['fair night', 'fair', 'night']];
  static async rows(world: string): Promise<Row[]> {
    const { journey } = await PlayTool.start(PlayTool.parse(['--world', world, '--as', 'human/warrior/Wenna']));
    const c = journey.session.campaign;
    const places = c.world.module.entities.filter(e => e.type === 'place').map(e => e.id);
    const rows: Row[] = [];
    for (const id of places) {
      c.commitWorld(c.world.apply([{ kind: 'assert', call: ModuleWriter.call('at', 'party', id) }]));
      const screen = ScreenModel.build(journey.session.campaign);
      if (screen.place.id !== id) { continue; }
      const blank = this.skies.filter(([, weather, daylight]) => !Scenery.seen({ ...screen, weather, dark: false,
        expedition: { ...screen.expedition, daylight } } as Screen)).map(([n]) => n);
      rows.push({ id, name: screen.place.name, kind: SceneKinds.of(screen)?.kind.kind ?? '(none)',
        roofed: Scenery.roofed(screen), blank });
    }
    return rows;
  }
  static report(rows: Row[]): string[] {
    const by = new Map<string, Row[]>();
    for (const r of rows.filter(x => x.blank.length)) { by.set(r.kind, [...by.get(r.kind) ?? [], r]); }
    return [...by].sort((a, b) => b[1].length - a[1].length).map(([kind, xs]) => `${kind}: ${xs.length} of `
      + `${rows.filter(r => r.kind === kind).length} | ` + this.skies.map(([n]) => xs.filter(x => x.blank.includes(n))
      .length).join(' / ') + ` | ${[...new Set(xs.map(x => x.name))].slice(0, 6).join('; ')}`);
  }
  static async main(args: string[]): Promise<number> {
    const rows = await this.rows(args[0] ?? 'iscoed');
    if (args[1]) { writeFileSync(args[1], JSON.stringify(rows, null, 1)); }
    console.log(`${rows.length} places, ${rows.filter(r => r.blank.length).length} blank in some sky `
      + `(${this.skies.map(([n]) => n).join(' / ')})`);
    for (const line of this.report(rows)) { console.log(`  ${line}`); }
    return 0;
  }
}
if (import.meta.main) { process.exit(await SceneCensus.main(process.argv.slice(2))); }
