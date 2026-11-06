import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { Canon } from '../canon/canon';
import { Challenge } from '../world/challenge';
import { Parties } from '../world/parties';
import { RegionEcology } from '../world/region-ecology';
import { WorldAssembler } from '../world/world-assembler';
import { NodeBundleSource } from '../campaign/node-bundle-source';
import { CreatureVariants } from '../creature-variants';
import abilities from '../../data/catalog/orsino/abilities.json';

// What of the bestiary ordinary generated play meets (the owner, 6 November: evidence that it is operational, not
// imported): countries made from seeds, every creature their generated text places counted by the way it came there
// (a den, a deep site's room or the party beside it, the open country, a meeting), with the variations laid on it;
// beside that, each kind's reachability decided from its record (whether some generation path can choose it), so a
// rare kind missing from a small sample is told apart from one nothing can reach.
type Way = 'den' | 'deep' | 'beside' | 'open' | 'meeting' | 'other';
interface Met { ways: Partial<Record<Way, number>>; variations: Map<string, number> }
export class BestiaryReport {
  static readonly purposes = ['barrow', 'deep', 'singing', 'waterworks'];
  static async main(seeds: string[]): Promise<number> {
    const met = await this.sample(seeds);
    console.log(this.markdown(seeds, met));
    return 0;
  }
  static async sample(seeds: string[]): Promise<Map<string, Met>> {
    const met = new Map<string, Met>();
    for (const seed of seeds) {
      const world = await WorldAssembler.assemble(seed, NodeBundleSource.shared, {});
      const files = (world.source as unknown as { files: Map<string, string> }).files;
      for (const text of files.values()) {
        for (const line of text.split('\n')) { this.read(line, met); }
      }
    }
    return met;
  }
  private static read(line: string, met: Map<string, Met>) {
    const kind = /Species (\w+)\./.exec(line)?.[1];
    if (!kind) { return; }
    const id = /Person (\w+)/.exec(line)?.[1] ?? '', m: Met = met.get(kind) ?? { ways: {}, variations: new Map() };
    const way: Way = /_beside$/.test(id) ? 'beside' : /_dwellers$/.test(id) ? 'deep' : /^wa\d+$/.test(id) ? 'open'
      : /^wm\d+_/.test(id) ? 'meeting' : /denned in|moved into/.test(line) ? 'den' : 'other';
    m.ways[way] = (m.ways[way] ?? 0) + 1;
    for (const v of line.matchAll(/(?:Variant|Undead|Aspect) (\w+)\./g)) {
      m.variations.set(v[1]!, (m.variations.get(v[1]!) ?? 0) + 1);
    }
    for (const v of Canon.creature(kind).variations ?? []) { m.variations.set(v, (m.variations.get(v) ?? 0) + 1); }
    met.set(kind, m);
  }
  // The ways generation can choose a kind, from its record alone.
  static reach(kind: string): string[] {
    const habitats = Object.keys(Canon.habitats), out: string[] = [];
    if (habitats.some(h => RegionEcology.recorded(h).some(r => r._key === kind))
      || Object.values(RegionEcology.tables.denBeast.groups).flat().some(r => r._key === kind)) { out.push('den'); }
    if (RegionEcology.seen(new Set(habitats)).some(([id]) => id === kind)) { out.push('open'); }
    const deep = this.purposes.flatMap(p => (JSON.parse(readFileSync(`data/generation/deep/${p}.json`, 'utf8')) as
      { dwellerHabitats?: string[] }).dwellerHabitats ?? []);
    // The deepest room's danger: a fourth level's elite (1 + 3 + 3, and 2 more).
    if (Parties.eligible(deep).some(([id]) => id === kind) && Challenge.of(kind) <= 2 * 9 * 4) { out.push('deep'); }
    if (this.written(kind)) { out.push('authored'); }
    if (JSON.stringify(abilities).includes(`"${kind}"`)) { out.push('summoned'); }
    return out;
  }
  private static texts?: string;
  private static written(kind: string): boolean {
    this.texts ??= ['data/adventures', 'data/goings-on', 'data/situations', 'data/generation'].flatMap(d => this.files(d))
      .map(f => readFileSync(f, 'utf8')).join('\n');
    return new RegExp(`\\b(Species ${kind}\\b|"species": "${kind}")`).test(this.texts);
  }
  private static files(dir: string): string[] {
    return readdirSync(dir).flatMap(f => { const p = join(dir, f);
      return statSync(p).isDirectory() ? this.files(p) : /\.(kyr|kyrt|json)$/.test(f) ? [p] : []; });
  }
  // Why nothing can choose a kind.
  static why(kind: string): string {
    const s = Canon.creature(kind);
    if (CreatureVariants.wanting(kind)) { return `met only with its ${s.requires} (its kinds are)`; }
    if (Canon.temperament(kind) === 'tame') { return 'tame: kept by people, placed with them'; }
    if (!s.habitats?.length) { return 'its record says nowhere it lives'; }
    if (!s.abundance) { return 'its record says where it lives but not how common it is'; }
    return 'beyond every danger generation composes';
  }
  static markdown(seeds: string[], met: Map<string, Met>): string {
    const kinds = Object.keys(Canon.species).sort(), rows = kinds.map(k => {
      const m = met.get(k), reach = this.reach(k), ways = m ? Object.entries(m.ways).map(([w, n]) => `${w} ${n}`).join(', ') : '';
      const varied = m ? [...m.variations].map(([v, n]) => `${v} ${n}`).join(', ') : '';
      const generated = reach.filter(r => ['den', 'open', 'deep'].includes(r));
      const state = m ? 'met'
        : generated.length ? 'eligible, not met in the sample' : reach.length ? `${reach.join(', ')} only` : 'unreachable';
      return `| ${k} | ${Challenge.measured(k) ? Challenge.of(k).toString() : '—'} | ${state} | ${ways} | ${varied} | `
        + `${reach.join(', ') || this.why(k)} |`;
    });
    const states = rows.map(r => r.split(' | ')[2]!);
    return [`Seeds: ${seeds.join(', ')}. ${states.filter(s => s === 'met').length} of ${kinds.length} kinds met by `
      + `generation in the sample; ${states.filter(s => s.startsWith('eligible')).length} more eligible; `
      + `${states.filter(s => s === 'unreachable').length} unreachable. Variations known: `
      + `${Object.keys(CreatureVariants.variations).length}.`, '',
    '| Kind | Challenge | In the sample | Met by | Varied by | Reachable by (or why not) |', '|---|---|---|---|---|---|',
    ...rows].join('\n');
  }
}
