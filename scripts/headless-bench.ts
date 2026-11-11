// A reproducible layer-by-layer baseline for a generated headless game. Unlike the browser profile, this separates
// world assembly, session creation, player projection, renderer-independent screen/narration, action, and persistence.
// Usage: bun scripts/headless-bench.ts [seed]
import { WorldAssembler } from '../src/world/world-assembler';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { PlaySession } from '../src/session/play-session';
import { PlayerView } from '../src/presentation/player-view';
import { ScreenModel } from '../src/ui/screen-model';
import { Narrator } from '../src/presentation/narrator';

const seed = process.argv[2] ?? 'wren';
const party = [{ name: 'Wenna', raceId: 'human', classId: 'warrior' }];
const rows: { phase: string; ms: number; heapMb: number; note?: string }[] = [];
class Bench {
  static async timed<T>(phase: string, work: () => T | Promise<T>, note?: (value: T) => string): Promise<T> {
    const before = performance.now(), value = await work();
    rows.push({ phase, ms: performance.now() - before, heapMb: process.memoryUsage.rss() / 1024 / 1024,
      ...note ? { note: note(value) } : {} });
    return value;
  }
}

const world = await Bench.timed('world assembly', () => WorldAssembler.assemble(seed, NodeBundleSource.shared,
  { origin: 'wanderer', party }), w => `${w.report.placements.length} scenarios`);
const session = await Bench.timed('session creation', () => PlaySession.start(world.path, seed, world.source));
const view = await Bench.timed('player projection', () => PlayerView.observe(session.campaign),
  v => `${v.choices.length} legal choices`);
const screen = await Bench.timed('screen projection', () => ScreenModel.build(session.campaign));
await Bench.timed('narrative + opportunities', () => Narrator.leaf(session.campaign, screen),
  leaf => `${leaf.glance?.acts.length ?? 0} promoted`);
const command = view.choices.find(c => !session.crosses(c.id) && !c.encounter)?.id ?? view.choices[0]!.id;
await Bench.timed('ordinary action', () => session.leg(command), () => command);
const checkpoint = await Bench.timed('checkpoint object', () => session.checkpoint());
const text = await Bench.timed('serialize checkpoint', () => JSON.stringify(checkpoint), value => `${value.length} bytes`);
const parsed = await Bench.timed('parse checkpoint', () => JSON.parse(text));
await Bench.timed('resume checkpoint', () => PlaySession.resume(parsed));
await Bench.timed('warm session creation', () => PlaySession.start(world.path, seed, world.source));
console.table(rows.map(r => ({ phase: r.phase, ms: r.ms.toFixed(1), rssMb: r.heapMb.toFixed(0), note: r.note ?? '' })));
