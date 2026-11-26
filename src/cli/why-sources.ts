import { relative } from 'node:path';
import type { BundleSource } from '../campaign/bundle-source';
import { ModuleBundle, type BundleManifest, type CampaignManifest } from '../campaign/module-bundle';
import { Diagnostics } from '../lang/diagnostics';
import { NodeBundleSource } from '../campaign/node-bundle-source';
import { CanonVocabulary } from '../canon/canon-vocabulary';

// A line of an author's (or a generator's) Kyr: the file, as the repository or the world's overlay names it, its
// number, and its words.
export interface SourceLine { file: string; line: number; text: string }

// The Kyr a campaign was made of, read again as it was loaded (`kyrie inspect --why`): its manifest, with its kits
// composed by the campaign's seed as the load composed them (the same seed gives the same ledger and trace), and the
// files of each module it installs, generated ones too (a drawn world's region, read from its overlay). Read once.
export class WhySources {
  private files?: Map<string, SourceLine[][]>;
  private manifested?: Promise<CampaignManifest>;
  private readonly vocabulary = CanonVocabulary.context();
  constructor(readonly scenario: string, readonly source: BundleSource, readonly seed: string) {}
  manifest(): Promise<CampaignManifest> {
    return this.manifested ??= ModuleBundle.campaign(this.scenario, this.source, this.vocabulary, this.seed);
  }
  // Where a module's own id is declared (Person s1_merchant …, Rule lowes_comes …), by the keywords given, else any.
  async declared(id: string, keywords = Diagnostics.declares): Promise<SourceLine | undefined> {
    const { module, local } = WhySources.split(id);
    const re = new RegExp(`\\b(${keywords})\\s+${local}\\b`);
    return (await this.lines(module)).find(l => re.test(l.text));
  }
  // The lines of a module that say a fact holds at the outset (Initially Assert keyholder(…)), its arguments written
  // as the module writes them.
  async initially(name: string, args: (string | undefined)[]): Promise<SourceLine[]> {
    const owner = args.find(a => a?.includes('__')), module = owner ? WhySources.split(owner).module : undefined;
    const words = args.flatMap(a => a ? [WhySources.split(a).local] : []);
    const call = new RegExp(`\\bInitially\\b.*\\b${name}\\(`);
    return (await this.lines(module)).filter(l => call.test(l.text)
      && words.every(w => new RegExp(`\\b${w}\\b`).test(l.text)));
  }
  // Every line of a module's files; of all the campaign's modules where the id names none (a shared rule's).
  private async lines(module: string | undefined): Promise<SourceLine[]> {
    const files = await this.read();
    return (module && files.get(module) ? [files.get(module)!] : [...files.values()]).flat(2);
  }
  private async read(): Promise<Map<string, SourceLine[][]>> {
    if (this.files) { return this.files; }
    const files = new Map<string, SourceLine[][]>(), seen = new Set<string>();
    for (const request of (await this.manifest()).modules) {
      const bundle = JSON.parse(await this.source.read(request.bundle)) as BundleManifest;
      const own: SourceLine[][] = [];
      for (const file of [bundle.source].flat().map(f => this.source.resolve(f, request.bundle))) {
        if (seen.has(`${request.id} ${file}`)) { continue; }
        seen.add(`${request.id} ${file}`);
        const name = relative(NodeBundleSource.root, file);
        own.push((await this.source.read(file)).split('\n').map((text, i) => ({ file: name, line: i + 1, text })));
      }
      files.set(request.id, [...files.get(request.id) ?? [], ...own]);
    }
    return this.files = files;
  }
  // A namespaced id's module and its own name in it (region__s1_merchant: region, s1_merchant).
  static split(id: string): { module?: string; local: string } {
    const at = id.indexOf('__');
    return at < 0 ? { local: id } : { module: id.slice(0, at), local: id.slice(at + 2).split('@')[0]! };
  }
  static said(l: SourceLine, width = 110): string {
    const text = l.text.trim();
    return `${l.file}:${l.line}: ${text.length > width ? `${text.slice(0, width - 1)}…` : text}`;
  }
}
