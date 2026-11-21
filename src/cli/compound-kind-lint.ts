import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import type { Finding } from './kyr-lint';

// A Deem creature table names the base kind, never a compound one (OR-158, the owner, 20 November: a skeletal dog is
// a canid with the undead aspect, a frost wolf the wolf with the winter variant, the overlay chosen at generation by
// habitat, region, haunt and season). A compound kind is one the catalog resolves to a base and a variation
// (data/catalog/aliases.json's species: frost_wolf to wolf/winter_variant). Read where generation names a creature:
// every `species` in data/generation (a deep's dwellers, elites and keeper), the rows of the tables drawn as
// creatures (ecology's denBeast), and a generation template's `Species` (a work's or an undertown's); a table drawn
// as words (wildSign's stag, an inn's stag's head) is prose, not a kind.
// The uses found when the lint was written are the baseline (doc/architecture/mission-22/compound-kinds-baseline.json):
// each goes when generation chooses the overlay, and a new one is an error, as is one the baseline keeps after its use
// is gone, so that the baseline only shrinks.
export interface CompoundUse { where: string; kind: string }
export class CompoundKindLint {
  static readonly baseline = 'doc/architecture/mission-22/compound-kinds-baseline.json';
  // The tables whose rows are creatures, by file and table, keyed by `_key`.
  private static readonly creatureTables: Record<string, string[]> = { 'tables/ecology.json': ['denBeast'] };
  static compound(root: string): Set<string> {
    const aliases = JSON.parse(readFileSync(join(root, 'data/catalog/aliases.json'), 'utf8')) as {
      species: Record<string, string> };
    return new Set(Object.entries(aliases.species).filter(([, to]) => to.includes('/')).map(([name]) => name));
  }
  // Each place generation names a compound kind, as `<file> <part>: <kind>` (one for each use).
  static uses(root: string): CompoundUse[] {
    const compound = this.compound(root), dir = join(root, 'data/generation'), out: CompoundUse[] = [];
    for (const file of this.files(dir, '.kyrt')) {
      const species = readFileSync(file, 'utf8').matchAll(/\bSpecies ([a-z_]+)\b/g);
      const where = relative(dir, file);
      out.push(...[...species].filter(m => compound.has(m[1]!)).map(m => ({ where, kind: m[1]! })));
    }
    for (const file of this.files(dir, '.json')) {
      const name = relative(dir, file), data = JSON.parse(readFileSync(file, 'utf8')) as Record<string, unknown>;
      for (const [part, value] of Object.entries(data)) {
        const keyed = this.creatureTables[name]?.includes(part) ?? false;
        for (const kind of this.named(value, keyed)) {
          if (compound.has(kind)) { out.push({ where: `${name} ${part}`, kind }); }
        }
      }
    }
    return out.sort((a, b) => `${a.where} ${a.kind}`.localeCompare(`${b.where} ${b.kind}`));
  }
  static findings(uses: CompoundUse[], known: string[]): Finding[] {
    const left = [...known], out: Finding[] = [];
    for (const use of uses) {
      const said = `${use.where}: ${use.kind}`, i = left.indexOf(said);
      if (i >= 0) { left.splice(i, 1); continue; }
      out.push(this.finding(`${said} names a compound kind: name the base kind, and let generation choose the`
        + ' variation (OR-158)'));
    }
    return [...out, ...left.map(said => this.finding(`${said} is in ${this.baseline} but no longer used: take it out`
      + ' of the baseline'))];
  }
  static run(root: string): Finding[] {
    const known = existsSync(join(root, this.baseline))
      ? JSON.parse(readFileSync(join(root, this.baseline), 'utf8')) as string[] : [];
    return this.findings(this.uses(root), known);
  }
  private static finding(message: string): Finding {
    return { level: 'error', check: 'compound-kind', where: 'data/generation', message };
  }
  // The kinds a part names: every `species`, and a creature table's `_key`s.
  private static named(value: unknown, keyed: boolean): string[] {
    if (Array.isArray(value)) { return value.flatMap(v => this.named(v, keyed)); }
    if (!value || typeof value !== 'object') { return []; }
    return Object.entries(value).flatMap(([k, v]) => (k === 'species' || (keyed && k === '_key'))
      && typeof v === 'string' ? [v] : this.named(v, keyed));
  }
  private static files(dir: string, ext: string): string[] {
    return readdirSync(dir, { withFileTypes: true }).flatMap(e => e.isDirectory() ? this.files(join(dir, e.name), ext)
      : e.name.endsWith(ext) ? [join(dir, e.name)] : []).sort();
  }
}
