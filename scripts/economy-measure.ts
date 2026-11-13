// What a generated country's money comes to (PT-02's measure, kept for Mission 18's closure): for each country, what
// its places hold that a company can carry home (valuables lying or kept in them, at their worth and at what a dealer
// pays for them), the coin its own jobs, finds and rewards pay outright, against what its towns ask (every ware for
// sale, by its price) and what they teach (every lesson, by its fee, once each). The ratio that matters is what a
// company can bring home in coin against what there is to spend it on.
//   bun scripts/economy-measure.ts [--seeds a1,b2,…] [--out doc/history/missions/18/economy]
import { writeFileSync } from 'node:fs';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { ModuleWriter } from '../src/lang/module-writer';
import type { Change } from '../src/lang/module';
import type { World } from '../src/lang/world';
import { PlaySession } from '../src/session/play-session';
import { WorldAssembler } from '../src/world/world-assembler';

interface Row { seed: string; valuables: number; worth: number; sold: number; paid: number; wares: number;
  stock: number; lessons: number; taught: number; ratio: number }
class EconomyMeasure {
  static readonly seeds = ['a1', 'b2', 'c3', 'd4', 'e5', 'f6', 'g7', 'h8', 'kite', 'wren', 'thorn', 'ash'];
  static async row(seed: string): Promise<Row> {
    const w = await WorldAssembler.assemble(seed, NodeBundleSource.shared);
    const s = await PlaySession.start(w.path, seed, w.source), world = s.campaign.world;
    const lying = world.related('itemKind').map(r => r.args[0]!).filter(i => !this.holds(world, 'forSale', i)
      && this.holds(world, 'valuable', this.kind(world, i)));
    const wares = world.related('forSale').map(r => r.args[0]!);
    const teachers = [...new Set(world.related('teaches').map(r => r.args[0]!))];
    const paid = this.paid(s.campaign.module.rules ?? [], s.campaign.module.actions);
    const sold = this.sum(lying, i => this.n(world, 'dealerPays', this.kind(world, i)));
    const stock = this.sum(wares, i => this.n(world, 'price', i));
    const taught = this.sum(teachers, who => this.n(world, 'lessonFee', who) * world.related('teaches', who).length);
    return { seed, valuables: lying.length, worth: this.sum(lying, i => this.n(world, 'worth', this.kind(world, i))),
      sold, paid, wares: wares.length, stock, lessons: teachers.length, taught,
      ratio: Math.round(((sold + paid) / Math.max(1, stock + taught)) * 100) / 100 };
  }
  private static sum(ids: string[], f: (id: string) => number): number { return ids.reduce((t, id) => t + f(id), 0); }
  private static n(world: World, name: string, ...args: string[]): number {
    return world.number(ModuleWriter.call(name, ...args));
  }
  private static holds(world: World, name: string, ...args: string[]): boolean {
    return world.test(ModuleWriter.call(name, ...args));
  }
  private static kind(world: World, item: string): string { return world.one('itemKind', item) ?? ''; }
  // The coin a country's own rules and acts give the company outright: a job's pay, a cache found, a reward.
  static paid(rules: { id: string; effects: Change[] }[], actions: { id: string; success: Change[] }[]): number {
    return [...rules.filter(r => r.id.startsWith('region__')).flatMap(r => r.effects),
      ...actions.filter(a => a.id.startsWith('region__')).flatMap(a => a.success)].reduce((t, c) => t + this.gives(c), 0);
  }
  private static gives(c: Change): number {
    return c.kind === 'increase' && c.call.name === 'quantity' && c.call.args[1] === 'gold' && c.value.kind === 'number'
      ? c.value.value : 0;
  }
  private static median(rows: Row[], k: keyof Row): number {
    return [...rows.map(r => r[k] as number)].sort((a, b) => a - b)[Math.floor(rows.length / 2)]!;
  }
  static table(rows: Row[]): string[] {
    const cols: (keyof Row)[] = ['valuables', 'worth', 'sold', 'paid', 'wares', 'stock', 'lessons', 'taught', 'ratio'];
    return ['| Seed | Valuables | Their worth | A dealer pays | Paid outright | Wares | Their price | Teachers | '
      + 'All lessons | Home ÷ spend |', `|---|${cols.map(() => '---:').join('|')}|`,
    ...rows.map(r => `| ${r.seed} | ${cols.map(k => r[k]).join(' | ')} |`),
    `| median | ${cols.map(k => this.median(rows, k)).join(' | ')} |`];
  }
  static async main(args: string[]) {
    const at = args.indexOf('--seeds'), out = args[args.indexOf('--out') + 1] ?? '';
    const seeds = at >= 0 ? args[at + 1]!.split(',') : this.seeds, rows: Row[] = [];
    for (const seed of seeds) { rows.push(await this.row(seed)); console.error(`${seed} measured`); }
    const md = ['# The money of a country', '', 'Written by `bun scripts/economy-measure.ts`.', '', ...this.table(rows), ''];
    if (args.includes('--out')) {
      writeFileSync(`${out}.md`, md.join('\n'));
      writeFileSync(`${out}.json`, JSON.stringify(rows, null, 1));
    }
    console.log(md.join('\n'));
  }
}
await EconomyMeasure.main(process.argv.slice(2));
