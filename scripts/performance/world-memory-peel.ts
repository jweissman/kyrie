// What a world start keeps, taken apart (see world-memory.ts): the parts of the life, then the process's caches, each
// let go in turn and the heap collected, each charged what no later one shares; and the joined module's share of each
// installed module, by the size of what it holds of it as JSON (an estimate: a share is not a heap's bytes).
import { Campaign } from '../../src/campaign/campaign';
import { CompiledModules } from '../../src/campaign/compiled-modules';
import { ModuleBundle } from '../../src/campaign/module-bundle';
import { ModuleCanon } from '../../src/campaign/module-canon';
import { Agency } from '../../src/campaign/agency';
import { DeclarationParses, KeptPredicates, KeptReading, ParseCache, TemplatedPredicates, type Module }
  from '../../src/lang';
import { WorldGrid } from '../../src/world/world-grid';
import { WorldDrawings } from '../../src/world/world-drawings';
import { Composition } from '../../src/world/compose/composition';
import { KeptParts } from '../../src/ui/kept-parts';
import { Deem } from 'deem';

export interface Peeled { label: string; kb: number }
type Open = Record<string, unknown>;
export interface Peel { life: Peeled[]; caches: Peeled[]; left: number }
export interface Report {
  world: string; imported: number; catalogs: number; rssImported: number; startMs: number; firstFrameMs: number;
  phases: { label: string; ms: number }[]; tally: object; rssAfter: number; held: number;
  installs: { id: string; ms: number; loadMs: number; kb?: number }[]; peel: Peel; modules: Peeled[];
}
// A cache let go: the owner's fields emptied.
type Cache = [label: string, owner: object, ...fields: string[]];
export class WorldMemoryPeel {
  // The process's own, kept between lives (each held strongly, or by the shared bundle source, which lives as long).
  static readonly caches: Cache[] = [
    ['KeptParts (the frame\'s parts)', KeptParts, 'by', 'tokens'],
    ['KeptReading (readings kept by world)', KeptReading, 'memoed', 'diffs'],
    ['Agency.fruitless (plans that came to nothing, by their module)', Agency, 'fruitless'],
    ['Campaign.loads (the loaded campaign each life is a fork of)', Campaign, 'loads'],
    ['ParseCache (parses of Kyr texts, in the process)', ParseCache, 'parsed'],
    ['ModuleBundle.parses and rulesets (parses kept by text)', ModuleBundle, 'parses', 'rulesets', 'drawn'],
    ['CompiledModules (modules compiled before, by their texts)', CompiledModules, 'kept'],
    ['ModuleCanon (the canon\'s declarations)', ModuleCanon, 'parsed', 'sources'],
    ['WorldGrid.draws (countries drawn)', WorldGrid, 'draws'],
    ['WorldDrawings (the first country as drawn)', WorldDrawings, 'kept'],
    ['Composition (kits composed, their vocabulary)', Composition, 'made', 'vocabularies'],
    ['KeptPredicates (predicates parsed, by text)', KeptPredicates, 'kept'],
    ['TemplatedPredicates (templated predicates parsed)', TemplatedPredicates, 'parsed'],
    ['DeclarationParses (declarations parsed)', DeclarationParses, 'kept'],
    // Deem's, outside the engine: each expression's ohm match kept whole, its matcher's memo table with it.
    ['Deem.parsed (Deem expressions\' matches, memo tables and all)', Deem, 'parsed']];
  // The session's own, in the order let go: each part of the campaign charged what no later part shares.
  static readonly parts = ['grounding', 'projection', 'log', 'observations', 'creatures', 'committed', 'current',
    'definition', 'compiled', 'vocabulary'];
  private static empty(value: unknown): unknown {
    if (value instanceof WeakMap) { return new WeakMap(); }
    if (value instanceof Map) { return new Map(); }
    if (value && typeof value === 'object') { return new (value.constructor as new () => unknown)(); }
    return undefined;
  }
  private static was = 0;
  private static async step(into: Peeled[], label: string, kb: () => Promise<number>): Promise<void> {
    const now = await kb(); into.push({ label, kb: this.was - now }); this.was = now;
  }
  // holder: what keeps the life (its session, journey and runner). The life's parts first, each charged what no later
  // part shares, then the life whole, then the process's caches in turn (each charged what it alone keeps of the rest).
  static async peel(holder: Open, kb: () => Promise<number>): Promise<Peel> {
    const life: Peeled[] = [], caches: Peeled[] = [];
    this.was = await kb();
    delete holder.runner; await this.step(life, 'the runner and its first frame', kb);
    await this.parted(holder, life, kb);
    for (const key of Object.keys(holder)) { delete holder[key]; }
    await this.step(life, 'the rest of the life (the campaign, its session and journey)', kb);
    for (const [label, owner, ...fields] of this.caches) {
      for (const f of fields) { const o = owner as Open; o[f] = this.empty(o[f]); }
      await this.step(caches, label, kb);
    }
    return { life, caches, left: this.was };
  }
  // The campaign's parts let go in turn, in a frame of their own: a campaign held by the peel's own frame had kept the
  // life (what is kept by it, WeakMap<Campaign, …>, a framed life's readings and revision) to the peel's end, so that a
  // framed life seemed to keep 70 MB that its letting go frees (OR-1740).
  private static async parted(holder: Open, life: Peeled[], kb: () => Promise<number>): Promise<void> {
    const campaign = (holder.session as { campaign: Campaign }).campaign as unknown as Open;
    for (const part of this.parts) { campaign[part] = undefined; await this.step(life, `campaign.${part}`, kb); }
  }
  // Each installed module's share of the joined module (entities, actions, rules, people, observations, initial
  // facts, queries), by the JSON of what is its own (its ids begin with its installation's).
  static modules(campaign: Campaign): Peeled[] {
    const m = campaign.module as unknown as Record<string, unknown>, ids = campaign.installed;
    const shares = new Map<string, number>(ids.map(id => [id, 0])), other = { n: 0 };
    for (const key of ['entities', 'actions', 'rules', 'people', 'observations', 'initial', 'queries', 'objectives',
      'pursuits']) {
      for (const item of (m[key] ?? []) as { id?: string; args?: string[] }[]) {
        const by = this.owner(ids, item.id ?? item.args?.find(a => this.owner(ids, a)) ?? '');
        const n = JSON.stringify(item).length;
        if (by) { shares.set(by, shares.get(by)! + n); } else { other.n += n; }
      }
    }
    for (const [id, chart] of Object.entries((campaign.module as Module).charts ?? {})) {
      const by = this.owner(ids, id);
      if (by) { shares.set(by, shares.get(by)! + JSON.stringify(chart).length); }
    }
    return [...[...shares].map(([label, n]) => ({ label, kb: Math.round(n / 1024) })),
      { label: '(no installation\'s own: kinds, relations, the canon)', kb: Math.round(other.n / 1024) }]
      .sort((a, b) => b.kb - a.kb);
  }
  private static owner(ids: readonly string[], id: string): string | undefined {
    return ids.find(i => id.startsWith(`${i}__`));
  }
  private static mb(kb: number): string { return `${(kb / 1024).toFixed(1)} MB`; }
  private static list(title: string, ps: Peeled[]): void {
    console.log(title);
    for (const p of ps) { console.log(`  ${p.label.padEnd(64)} ${this.mb(p.kb).padStart(9)}`); }
  }
  static print(r: Report): void {
    console.log(`world ${r.world}: started in ${r.startMs} ms, first frame at ${r.firstFrameMs} ms`);
    console.log(`heap after imports ${this.mb(r.imported)} (rss ${r.rssImported} MB), the catalogs read `
      + `${this.mb(r.catalogs)}; after the start ${this.mb(r.held)} (rss ${r.rssAfter} MB)`);
    for (const p of r.phases) { console.log(`  phase ${p.label.padEnd(24)} ${String(p.ms).padStart(6)} ms`); }
    console.log(`  costs: ${Object.entries(r.tally).map(([s, c]) => `${s} ${(c as { n: number }).n}`
      + ` (${Math.round((c as { ms: number }).ms)} ms)`).join(' · ')}`);
    console.log(`installs (${r.installs.length}), dearest first:`);
    for (const i of [...r.installs].sort((a, b) => b.ms - a.ms)) {
      console.log(`  ${i.id.padEnd(28)} ${String(i.ms).padStart(6)} ms (load ${String(i.loadMs).padStart(5)} ms)`
        + `${i.kb === undefined ? '' : ` +${this.mb(i.kb)}`}`);
    }
    this.list('the life, peeled in order:', r.peel.life);
    this.list('the process\'s caches, once the life is let go, in turn:', r.peel.caches);
    console.log(`left once all is let go: ${this.mb(r.peel.left)} (the code, the catalogs, what no cache here names)`);
    console.log('the joined module by installation (JSON):');
    for (const p of r.modules.slice(0, 30)) { console.log(`  ${p.label.padEnd(40)} ${String(p.kb).padStart(7)} KB`); }
  }
}
