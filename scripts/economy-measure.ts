// What a generated country's money comes to (PT-02's measure, kept for Mission 18's closure): for each country, what
// its places hold that a company can carry home (valuables lying or kept in them, at their worth and at what a dealer
// pays for them), the coin its own jobs, finds and rewards pay outright, against what its towns ask (every ware for
// sale, by its price) and what they teach (every lesson, by its fee, once each). The ratio that matters is what a
// company can bring home in coin against what there is to spend it on. A valuable some buyer pays more for by its kind
// than a dealer does (a mine's ore, at its merchant) is counted at that price, which is what a company is paid (SI-07).
//   bun scripts/economy-measure.ts [--seeds a1,b2,…] [--out doc/history/missions/18/economy]
import { writeFileSync } from 'node:fs';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { ModuleWriter } from '../src/lang/module-writer';
import type { Change } from '../src/lang/module';
import type { World } from '../src/lang/world';
import type { Campaign } from '../src/campaign/campaign';
import { PlaySession } from '../src/session/play-session';
import { WorldAssembler } from '../src/world/world-assembler';

interface Row { seed: string; valuables: number; worth: number; sold: number; paid: number; wares: number;
  stock: number; lessons: number; taught: number; ratio: number }
export class EconomyMeasure {
  static readonly seeds = ['a1', 'b2', 'c3', 'd4', 'e5', 'f6', 'g7', 'h8', 'kite', 'wren', 'thorn', 'ash'];
  static async row(seed: string): Promise<Row> {
    const w = await WorldAssembler.assemble(seed, NodeBundleSource.shared);
    return this.read(seed, (await PlaySession.start(w.path, seed, w.source)).campaign);
  }
  // A country as a campaign begun in it holds it (scripts/quantity reads the same of the worlds it walks).
  static read(seed: string, campaign: Campaign): Row {
    const s = { campaign }, world = campaign.world;
    const lying = world.related('itemKind').map(r => r.args[0]!).filter(i => !this.holds(world, 'forSale', i)
      && this.holds(world, 'valuable', this.kind(world, i)));
    const wares = world.related('forSale').map(r => r.args[0]!);
    const teachers = [...new Set(world.related('teaches').map(r => r.args[0]!))];
    const paid = this.paid(s.campaign.module.rules ?? [], s.campaign.module.actions);
    const best = this.best(world);
    const sold = this.sum(lying, i => Math.max(this.n(world, 'dealerPays', this.kind(world, i)),
      best.get(this.kind(world, i)) ?? 0));
    const stock = this.sum(wares, i => this.n(world, 'price', i));
    const taught = this.sum(teachers, who => this.n(world, 'lessonFee', who) * world.related('teaches', who).length);
    return { seed, valuables: lying.length, worth: this.sum(lying, i => this.n(world, 'worth', this.kind(world, i))),
      sold, paid, wares: wares.length, stock, lessons: teachers.length, taught,
      ratio: Math.round(((sold + paid) / Math.max(1, stock + taught)) * 100) / 100 };
  }
  // What a company can bring home within reach of the start (far: minutes to every place, NoviceCountry.distances):
  // valuables lying in a place that near, at the best a buyer pays; and what the rules and acts of the parts of the
  // country that near pay outright (a part by its id, region__s1_… the first town's; the nearest of its places), a
  // job's full pay, half and rest one payment (the most of them), not three.
  static within(campaign: Campaign, far: Map<string, number>, reach: number): { sold: number; paid: number } {
    const world = campaign.world, best = this.best(world), near = new Map<string, number>();
    for (const [place, minutes] of far) {
      const part = /^region__([a-z]+\d+)/.exec(place)?.[1];
      if (part && minutes < (near.get(part) ?? Infinity)) { near.set(part, minutes); }
    }
    const lying = world.related('itemKind').map(r => r.args[0]!).filter(i => !this.holds(world, 'forSale', i)
      && this.holds(world, 'valuable', this.kind(world, i)) && (far.get(world.one('at', i) ?? '') ?? Infinity) <= reach);
    const sold = this.sum(lying, i => Math.max(this.n(world, 'dealerPays', this.kind(world, i)),
      best.get(this.kind(world, i)) ?? 0));
    const pays = new Map<string, number>(), rules = campaign.module.rules ?? [];
    for (const r of [...rules.map(x => ({ id: x.id, effects: x.effects })),
      ...campaign.module.actions.map(a => ({ id: a.id, effects: a.success }))]) {
      const part = /^region__([a-z]+\d+)/.exec(r.id)?.[1], gives = r.effects.reduce((t, c) => t + this.gives(c), 0);
      if (!part || !gives || (near.get(part) ?? Infinity) > reach) { continue; }
      const stem = r.id.replace(/_(paid|half|rest)$/, '');
      pays.set(stem, Math.max(pays.get(stem) ?? 0, gives));
    }
    return { sold, paid: [...pays.values()].reduce((t, v) => t + v, 0) };
  }
  // The most any buyer pays for a kind (pays(buyer, kind)).
  private static best(world: World): Map<string, number> {
    const best = new Map<string, number>();
    for (const m of world.measured('pays')) {
      const kind = m.call.args[1];
      if (kind && m.call.args.length === 2) { best.set(kind, Math.max(best.get(kind) ?? 0, m.value)); }
    }
    return best;
  }
  private static sum(ids: string[], f: (id: string) => number): number { return ids.reduce((t, id) => t + f(id), 0); }
  private static n(world: World, name: string, ...args: string[]): number {
    return world.number(ModuleWriter.call(name, ...args));
  }
  private static holds(world: World, name: string, ...args: string[]): boolean {
    return world.test(ModuleWriter.call(name, ...args));
  }
  static kind(world: World, item: string): string { return world.one('itemKind', item) ?? ''; }
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
if (import.meta.main) { await EconomyMeasure.main(process.argv.slice(2)); }
