import type { BundleSource } from '../../campaign/bundle-source';
import type { BundleManifest, BundleRequest } from '../../campaign/module-bundle';
import type { Module } from '../../lang/module';
import { ModuleParser } from '../../lang/module-parser';
import { ModuleSource } from '../../lang/module-source';
import { KeptParses } from '../../lang/kept-parses';
import { Vocabularies, type Vocabulary } from '../../lang/vocabulary';
import { Composer, type Placement } from './composer';
import { Geography } from './geography';
import { Kits } from './kit';
import { Ledger } from './ledger';
import { Trace } from './trace';
import { ModuleExports } from '../../campaign/module-exports';

// A campaign manifest entry that asks for a kit rather than naming a module: which kit, the installation id its
// modules are named under, and anything its author fixes (a slot bound to an exported place, a dimension's value).
export interface KitEntry { kit: string; id: string; fix?: Record<string, string>; optional?: boolean }
export type ManifestEntry = BundleRequest | KitEntry;
export interface Composed {
  modules: BundleRequest[]; ledger: Ledger; trace: Trace; placements: Placement[];
  // Optional kits that could not be placed, and why.
  refused: { id: string; reason: string }[];
}
// A module manifest may describe its module for assembly: the facts its author fixes about the places it exports.
export interface AssemblyNote { commitments?: string[][] }

// Turns a campaign's kit entries into ordinary module requests. Modules listed before a kit that describe
// themselves for assembly (regions) are read into the ledger; each kit is then placed against what is committed by
// then, in the order listed, with the campaign's seed. An authored campaign that cannot be composed does not load.
export class Composition {
  static readonly vocabularyPath = 'data/assembly/vocabulary.kyr';
  private static vocabularies = new WeakMap<BundleSource, Promise<string>>();
  static isKit(entry: ManifestEntry): entry is KitEntry { return 'kit' in entry; }
  // A composition made already for a campaign's manifest, as a world's assembler makes it to write the inn's count
  // after the kits are placed (WorldAssembler.held), kept for the campaign that loads it from the same source, path
  // and seed: the same entries against the same country as written, but for the count, which the ledger does not read.
  // Taken once: a second campaign from the same world composes its own (campaign isolation).
  private static readonly made = new WeakMap<BundleSource, Map<string, { composed: Composed; vocabulary: string }>>();
  private static key(vocabulary: Vocabulary): string | undefined {
    const fingerprint = vocabulary.fingerprint?.();
    return fingerprint === undefined ? undefined : JSON.stringify([vocabulary.id, fingerprint]);
  }
  static keep(source: BundleSource, path: string, composed: Composed,
    at: { seed: string; vocabulary: Vocabulary }): void {
    const key = this.key(at.vocabulary);
    if (key === undefined) { return; }
    const kept = this.made.get(source) ?? new Map<string, { composed: Composed; vocabulary: string }>();
    kept.set(`${path}\u0000${at.seed}`, { composed, vocabulary: key });
    this.made.set(source, kept);
  }
  static take(source: BundleSource, path: string, seed: string, vocabulary: Vocabulary = Vocabularies):
    Composed | undefined {
    const kept = this.made.get(source), key = `${path}\u0000${seed}`, found = kept?.get(key);
    if (!found || found.vocabulary !== this.key(vocabulary)) { return undefined; }
    kept!.delete(key);
    return found.composed;
  }
  static async vocabulary(source: BundleSource, vocabulary: Vocabulary = Vocabularies): Promise<Module> {
    let cached = this.vocabularies.get(source);
    if (!cached) {
      cached = source.read(source.resolve(this.vocabularyPath));
      this.vocabularies.set(source, cached);
    }
    return KeptParses.of(await cached, [], ModuleParser.parse.bind(ModuleParser), vocabulary);
  }
  static async expand(entries: ManifestEntry[],
    at: { seed: string; source: BundleSource; vocabulary?: Vocabulary }): Promise<Composed> {
    const { seed, source } = at;
    const vocabulary = (at.vocabulary ?? Vocabularies).fork?.();
    if (!vocabulary) { throw new Error('Composition requires a forkable vocabulary'); }
    const ledger = new Ledger(await this.vocabulary(source, vocabulary));
    const modules: BundleRequest[] = [], placements: Placement[] = [], refused: Composed['refused'] = [];
    let composer: Composer | undefined;
    for (const entry of entries) {
      if (!this.isKit(entry)) { modules.push(entry); await this.region(ledger, entry, source, vocabulary); continue; }
      composer ??= new Composer(ledger, { seed, source, context: this.context(ledger) });
      const kit = await Kits.load(source, entry.kit);
      const placement = composer.place(kit, { kit: kit.manifest.id, id: entry.id,
        ...(entry.fix ? { fix: entry.fix } : {}) });
      if (!placement) {
        const reason = composer.trace.refusals().at(-1) ?? 'refused';
        if (entry.optional) { refused.push({ id: entry.id, reason }); continue; }
        throw new Error(`Cannot place ${entry.id}: ${reason}`);
      }
      placements.push(placement);
      modules.push(...placement.modules);
    }
    return { modules, ledger, trace: composer?.trace ?? new Trace(), placements, refused };
  }
  // Places a kit into a campaign already composed: the campaign's own composition is made again (the same seed gives
  // the same ledger), and the new kit is placed against it, so it can take nothing already taken. The modules it
  // returns are installed into the running campaign as they are.
  static async introduce(path: string, entry: KitEntry,
    at: { seed: string; source: BundleSource; vocabulary?: Vocabulary }):
    Promise<{ placement?: Placement; trace: Trace; ledger: Ledger }> {
    const { seed, source } = at, raw = JSON.parse(await source.read(path)) as { modules: ManifestEntry[] };
    const entries = raw.modules.map(m => Composition.isKit(m) ? { ...m, kit: source.resolve(m.kit, path) }
      : { ...m, bundle: source.resolve(m.bundle, path) });
    const before = await this.expand(entries, at);
    const composer = new Composer(before.ledger, { seed, source, context: this.context(before.ledger) });
    const kit = await Kits.load(source, source.resolve(entry.kit, path));
    const placement = composer.place(kit, { kit: kit.manifest.id, id: entry.id,
      ...(entry.fix ? { fix: entry.fix } : {}) });
    return { ...(placement ? { placement } : {}), trace: composer.trace, ledger: before.ledger };
  }
  // A module that describes itself for assembly contributes its places and ways to the ledger.
  static async region(ledger: Ledger, entry: BundleRequest, source: BundleSource,
    vocabulary: Vocabulary = Vocabularies): Promise<void> {
    const manifest = JSON.parse(await source.read(entry.bundle)) as BundleManifest & { assembly?: AssemblyNote };
    if (!manifest.assembly) { return; }
    // A module in several files (a generated region) is read whole: its places and ways are in all of them.
    const files = Array.isArray(manifest.source) ? manifest.source : [manifest.source];
    // Each with what was declared for it as values (ModuleSource), as the module is loaded: its ways across country
    // are among them (AX-04: read without them, the composer had placed the raiders' hold elsewhere).
    const texts = await Promise.all(files.map(f => source.read(source.resolve(f, entry.bundle))));
    const sources = await ModuleSource.sources(manifest, entry.bundle, source);
    // Read, never changed: the parses as they are kept, uncopied (KeptParses).
    const parse = ModuleParser.parse.bind(ModuleParser);
    const parts = KeptParses.together(texts, vocabulary, text => text,
      (text, i) => KeptParses.of(text, sources[i]?.declared ?? [], parse, vocabulary));
    const company = parts.find(m => m.company)?.company;
    const module = { ...parts[0]!, ...company ? { company } : {}, entities: parts.flatMap(m => m.entities),
      initial: parts.flatMap(m => m.initial) };
    Geography.read(ledger, { install: entry.id, module, exports: ModuleExports.locals(manifest.exports),
      ...(manifest.assembly.commitments ? { commitments: manifest.assembly.commitments } : {}) });
  }
  // The region's context for Deem: its terrain, as committed.
  static context(ledger: Ledger): Record<string, string> {
    const terrain = ledger.solve(ModuleParser.predicate('terrain(?r, ?t)'))[0]?.['?t'];
    return terrain ? { terrain } : {};
  }
}
