#!/usr/bin/env bun
// Does an operation pay for its working set, or for the whole universe (the owner, 14 November)? One room of five
// things held constant, the cellar, while the world around it grows by rooms and things the cellar has no reason to
// touch: for each size, the cost of starting it, of the first observation (the screen and the glance), of deriving
// what can be done there, of doing one local act, of observing again, and of saving and restoring, with the heap it
// leaves. Each size in a fresh process. The production compiler, runtime and projections throughout (SingleModule,
// PlaySession, ScreenModel, Narrator, PlayerView).
//   bun scripts/scale-costs.ts [sizes=0,100,1000,4000]
import { Costs, type Tally } from '../src/costs';

interface Measure { size: number; facts: number; ms: Record<string, number>; heapMB: number; tally: Tally }
const cellar = `
  Place cellar "the cellar" is room at 0, 0.
  Place stair "the stair" is room at 0, 1.
  Passage steps "the steps" is path between cellar and stair.
  Thing barrel "a barrel" at cellar { State full "The barrel is full.". Change tap "Tap the barrel" from full to full. }
  Thing shelf "a shelf of jars" at cellar { }
  Thing sack "a sack of meal" at cellar { }
  Thing lamp "a hanging lamp" at cellar { }
  Thing crate "a broken crate" at cellar { }
  Company party "You" of 1 at cellar.`;
export class ScaleCosts {
  // So many rooms elsewhere, each with two things in it and a way to the next: none of them near the cellar.
  static elsewhere(rooms: number): string {
    const lines: string[] = [];
    for (let i = 0; i < rooms; i++) {
      lines.push(`Place far${i} "a far room ${i}" is room at ${10 + i}, 50.`,
        `Thing far${i}a "a stone ${i}" at far${i} { }`, `Thing far${i}b "a jar ${i}" at far${i} { }`);
      if (i) { lines.push(`Passage farway${i} "a far way ${i}" is path between far${i - 1} and far${i}.`); }
    }
    return lines.join('\n  ');
  }
  static async one(rooms: number): Promise<Measure> {
    const { SingleModule } = await import('../src/campaign/single-module');
    const { PlaySession } = await import('../src/session/play-session');
    const { ScreenModel } = await import('../src/ui/screen-model');
    const { Narrator } = await import('../src/presentation/narrator');
    const { PlayerView } = await import('../src/presentation/player-view');
    const ms: Record<string, number> = {}, mark = Costs.mark();
    const { source, campaign } = SingleModule.source(`${cellar}\n  ${this.elsewhere(rooms)}`);
    const session = await this.time(ms, 'start', () => PlaySession.start(campaign, 'scale', source));
    const c = session.campaign;
    await this.time(ms, 'observe', () => Narrator.leaf(c, ScreenModel.build(c)));
    const choices = await this.time(ms, 'choices', () => PlayerView.choices(c));
    const tap = choices.find(r => /^Tap the barrel/.test(r.choice.name))!;
    await this.time(ms, 'act', () => session.leg(tap.choice.id));
    await this.time(ms, 'observe again', () => Narrator.leaf(c, ScreenModel.build(c)));
    await this.time(ms, 'choices again', () => PlayerView.choices(c));
    const save = await this.time(ms, 'save', () => c.save());
    await this.time(ms, 'restore', () => PlaySession.fromSave(save));
    const facts = c.world.view.relations.length + c.world.view.measures.length;
    const heapMB = Math.round(process.memoryUsage().heapUsed / 1e6);
    return { size: rooms, facts, ms, heapMB, tally: Costs.since(mark) };
  }
  static async time<T>(ms: Record<string, number>, name: string, f: () => T | Promise<T>): Promise<T> {
    const t = performance.now(), r = await f();
    ms[name] = Math.round((performance.now() - t) * 10) / 10;
    return r;
  }
  static async main(args: string[]): Promise<number> {
    if (args[0] === '--one') { console.log(JSON.stringify(await this.one(Number(args[1])))); return 0; }
    const sizes = (args[0] ?? '0,100,1000,4000').split(',').map(Number);
    console.log('rooms facts | start observe choices act observe-again choices-again save restore (ms) | heap MB');
    for (const size of sizes) {
      const out = Bun.spawnSync(['bun', 'scripts/scale-costs.ts', '--one', String(size)]);
      const line = out.stdout.toString().trim().split('\n').at(-1) ?? '';
      try {
        const m = JSON.parse(line) as Measure;
        console.log(`${String(m.size).padStart(5)} ${String(m.facts).padStart(6)} | ${Object.values(m.ms).map(v =>
          String(v).padStart(7)).join(' ')} | ${m.heapMB}`);
      } catch { console.error(size, out.stderr.toString().slice(-600)); }
    }
    return 0;
  }
}
if (import.meta.main) { process.exit(await ScaleCosts.main(process.argv.slice(2))); }
