#!/usr/bin/env bun
// What a world start holds, and what it spends its time on (doc/architecture/mission-22-beta/memory-2026-11-27.md): a
// new life on a drawn world begun as the terminal begins one (PlayTool.start, then the runner's first frame), timed
// phase by phase and install by install, and the heap it keeps afterwards taken apart by peeling (world-memory-peel).
// Each module's own share is also read as the heap it added as it was installed (--heap: collected before and after
// each install, which slows the start, so its times are not the start's).
//   scripts/machine/heavy.sh bun scripts/performance/world-memory.ts [--world s0] [--as human/warrior/Wenna] [--heap]
//   [--no-frame] [--hold <regex>] [--json]
// --hold: the modules whose installation ids match left out of the world as it loads (what installing them lazily
// would save, as a measured estimate: their absence, not a lazy install).
// --no-frame: the life begun but no frame told (a frame keeps the life past its letting go: see the note).
import { gcAndSweep, heapStats } from 'bun:jsc';
import { PlayTool } from '../../src/cli/play-tool';
import { Runner } from '../../src/cli/runner';
import { Campaign } from '../../src/campaign/campaign';
import { ModuleBundle } from '../../src/campaign/module-bundle';
import { Costs } from '../../src/costs';
import { Content } from '../../src/content';
import { Creation } from '../../web/engine/creation';
import { Stopwatch } from '../../src/stopwatch';
import { WorldMemoryPeel, type Report } from './world-memory-peel';

interface Install { id: string; ms: number; loadMs: number; kb?: number }
type Open = Record<string, unknown>;
type Installing = (this: Campaign, ...a: unknown[]) => Promise<void>;
class WorldMemory {
  static readonly installs: Install[] = [];
  private static heap = false;
  private static installing = 0;
  private static install?: Installing;
  private static load?: typeof ModuleBundle.load;
  // The heap kept, collected and swept, after a turn of the event loop: until the loop turns, what an async function
  // just finished with is still held (the life's 56 MB had stayed held across the whole peel).
  static async kb(): Promise<number> {
    await Bun.sleep(1); gcAndSweep(); return Math.round(heapStats().heapSize / 1024);
  }
  static rss(): number { return Math.round(process.memoryUsage().rss / 1024 / 1024); }
  // An install timed whole (Campaign.install: compiled, joined, populated, settled).
  static async installed(campaign: Campaign, a: unknown[]): Promise<void> {
    const id = (a[0] as { id: string }).id, before = this.heap ? await this.kb() : 0, t = performance.now();
    this.installing++;
    try { return await this.install!.apply(campaign, a); } finally {
      this.installing--;
      const done = this.installs.findLast(i => i.id === id)!;
      done.ms = performance.now() - t;
      if (this.heap) { done.kb = await this.kb() - before; }
    }
  }
  // A load timed alone (ModuleBundle.load, which the first module, installed by CampaignAssembly, has alone).
  static async loaded(...a: Parameters<typeof ModuleBundle.load>) {
    const before = this.heap && !this.installing ? await this.kb() : 0, t = performance.now();
    try { return await this.load!(...a); } finally {
      const ms = performance.now() - t;
      this.installs.push({ id: a[0].id, ms, loadMs: ms, ...before ? { kb: await this.kb() - before } : {} });
    }
  }
  private static applied(_target: Installing, campaign: Campaign, a: unknown[]): Promise<void> {
    return this.installed(campaign, a);
  }
  // Modules held back from the campaign as it loads (--hold).
  private static held?: RegExp;
  private static async manifest(...a: Parameters<typeof ModuleBundle.campaign>) {
    const m = await this.campaign!(...a);
    return { ...m, modules: m.modules.filter(r => !this.held!.test(r.id)) };
  }
  private static campaign?: typeof ModuleBundle.campaign;
  private static watch(): void {
    if (this.held) {
      this.campaign = ModuleBundle.campaign.bind(ModuleBundle);
      (ModuleBundle as unknown as Open).campaign = this.manifest.bind(this);
    }
    const proto = Campaign.prototype as unknown as Open;
    this.install = proto.install as Installing; this.load = ModuleBundle.load.bind(ModuleBundle);
    proto.install = new Proxy(this.install, { apply: this.applied.bind(this) });
    (ModuleBundle as unknown as Open).load = this.loaded.bind(this);
  }
  private static flag(args: string[], name: string, fallback: string): string {
    const i = args.indexOf(name);
    return i >= 0 ? args[i + 1]! : fallback;
  }
  static async main(args: string[]): Promise<number> {
    this.heap = args.includes('--heap');
    if (args.includes('--hold')) { this.held = new RegExp(`^(${this.flag(args, '--hold', '')})$`); }
    const imported = await this.kb(), rssImported = this.rss();
    // The catalogs: the canon's vocabulary and creation's catalog, read as a start first reads them.
    Content.vocabulary(); Creation.catalog();
    const catalogs = await this.kb() - imported;
    this.watch();
    const begun = await this.begin(this.flag(args, '--world', 's0'), this.flag(args, '--as', 'human/warrior/Wenna'),
      !args.includes('--no-frame'));
    const { holder, ...told } = begun, held = await this.kb();
    const modules = WorldMemoryPeel.modules((holder.session as { campaign: Campaign }).campaign);
    const peel = await WorldMemoryPeel.peel(holder, this.kb.bind(this));
    const report: Report = { ...told, imported, catalogs, rssImported, held, modules, peel,
      installs: this.installs.map(i => ({ ...i, ms: Math.round(i.ms), loadMs: Math.round(i.loadMs) })) };
    if (args.includes('--json')) { console.log(JSON.stringify(report, null, 1)); return 0; }
    WorldMemoryPeel.print(report);
    return 0;
  }
  // The life begun and its first frame told; what keeps it, in one holder the peel empties.
  private static async begin(world: string, as: string, framed: boolean) {
    const watch = new Stopwatch(undefined, true), mark = Costs.mark(), t0 = performance.now();
    const o = PlayTool.parse(['--world', world, '--as', as]);
    const { journey } = await PlayTool.start(o, watch);
    const startMs = Math.round(performance.now() - t0), runner = new Runner(journey.session);
    if (framed) { await watch.time('First frame', () => runner.said()); }
    const firstFrameMs = Math.round(performance.now() - t0), rssAfter = this.rss();
    return { world, startMs, firstFrameMs, rssAfter, tally: Costs.since(mark),
      phases: watch.phases.map(p => ({ label: p.label, ms: Math.round(p.ms) })),
      holder: { session: journey.session, journey, runner } as Open };
  }
}
if (import.meta.main) { process.exit(await WorldMemory.main(process.argv.slice(2))); }
