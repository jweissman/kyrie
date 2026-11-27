#!/usr/bin/env bun
// The specs by horizon (OR-407; the owner, 24 November: "just testing a tiny rule doesn't pull in the universe"): what
// each spec file starts, by the dearest thing it starts, read from its text and from the test/support files it
// imports. Cheapest first:
//   none      no world at all: a parse, a fragment compiled, a function of the engine's
//   horizon   a tiny world on a declared horizon: the kernel of the shared rules and the packages named (Tiny's
//             horizon, or the rules named in part)
//   rules     a tiny world on the whole of the shared rules and the canon (Tiny as it was, SingleModule)
//   world     one world: a campaign or a fixture started (PlaySession, Campaign.load)
//   corpus    Westernesse, a drawn country, or the data corpus's campaigns and adventures
// A static reading, not a run: a start through a helper of src it does not name is not seen. Held as a ratchet by
// test/small/spec-horizons (the specs on a horizon do not fall; those on the whole shared rules do not rise).
//   bun scripts/spec-horizons.ts           the readings
//   bun scripts/spec-horizons.ts --files   and each file's tier
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join, normalize, relative } from 'node:path';
import { Glob } from 'bun';

export type Tier = 'none' | 'horizon' | 'rules' | 'world' | 'corpus';
export class SpecHorizons {
  static readonly root = join(import.meta.dir, '..');
  static readonly tiers: Tier[] = ['none', 'horizon', 'rules', 'world', 'corpus'];
  // The page in a browser (MonoBrowser), the page's engine (EngineHost) and the autoplayer play the whole game too.
  private static readonly corpus = new RegExp(['\\b(DrawnWorld|PlayTool|GoldenWalk|WorldDrawings|Westernesse',
    '|MonoBrowser|EngineHost|AutoplayRun)\\b|data\\/(campaigns|adventures|regions)\\/'].join(''));
  private static readonly world =
    /\b(PlaySession\.start|Campaign\.load|Journey\.start|ModuleBundle\.load)\b|test\/fixtures\//;
  private static readonly tiny = /\b(Tiny\.start|SingleModule\.source)\(/g;
  // A start on a horizon: Tiny's, or the shared rules named in part (never the whole set, "world").
  private static readonly declared = /\bhorizon: |\brules: \[(?!\s*'world')/g;
  // The fragment harness itself: what it starts is read from each call of it (Tiny.start, with its horizon or not).
  private static readonly harness = new Set(['test/support/tiny.ts', 'test/support/horizon.ts']);
  private static readonly memo = new Map<string, Tier>();
  // The spec files, as the lanes take them.
  static specs(): string[] {
    return [...new Glob('test/**/*.test.ts').scanSync(this.root)].sort();
  }
  // A file's own tier, and the dearest of the support files it imports.
  static of(file: string, seen = new Set<string>()): Tier {
    const kept = this.memo.get(file);
    if (kept) { return kept; }
    if (this.harness.has(file)) { return 'none'; }
    seen.add(file);
    const text = readFileSync(join(this.root, file), 'utf8');
    const own = this.own(text), imported = this.support(file, text).filter(f => !seen.has(f))
      .map(f => this.of(f, seen));
    const tier = [own, ...imported].reduce((a, b) => this.dearer(a, b));
    this.memo.set(file, tier);
    return tier;
  }
  // What its code starts, its comments aside (a comment may name Westernesse to say it is not in it).
  private static own(source: string): Tier {
    const text = source.replace(/^\s*\/\/.*$/gm, '');
    if (this.corpus.test(text)) { return 'corpus'; }
    if (this.world.test(text)) { return 'world'; }
    const starts = text.match(this.tiny)?.length ?? 0;
    if (!starts) { return 'none'; }
    return (text.match(this.declared)?.length ?? 0) >= starts ? 'horizon' : 'rules';
  }
  // The test/support files and scripts it imports, which may start what it does not name.
  private static support(file: string, text: string): string[] {
    return [...text.matchAll(/from '(\.[^']*)'/g)]
      .map(m => normalize(relative(this.root, join(this.root, dirname(file), m[1]!))))
      .map(p => p.endsWith('.ts') ? p : `${p}.ts`)
      .filter(p => /^(test\/support|scripts)\//.test(p) && existsSync(join(this.root, p)));
  }
  private static dearer(a: Tier, b: Tier): Tier { return this.tiers.indexOf(a) >= this.tiers.indexOf(b) ? a : b; }
  static census(): Record<Tier, number> {
    const counts = Object.fromEntries(this.tiers.map(t => [t, 0])) as Record<Tier, number>;
    for (const f of this.specs()) { counts[this.of(f)]++; }
    return counts;
  }
}
if (import.meta.main) {
  const counts = SpecHorizons.census(), total = Object.values(counts).reduce((a, b) => a + b, 0);
  console.log(`${total} spec files by the dearest thing each starts (OR-407):`);
  for (const t of SpecHorizons.tiers) {
    console.log(`  ${t.padEnd(8)} ${String(counts[t]).padStart(5)}  ${(100 * counts[t] / total).toFixed(1)}%`);
  }
  if (process.argv.includes('--files')) {
    for (const f of SpecHorizons.specs()) { console.log(`${SpecHorizons.of(f).padEnd(8)} ${f}`); }
  }
}
