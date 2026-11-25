#!/usr/bin/env bun
// The knowledge boundary's one door (OR-527; platform-separation.md, the trust thread, point 3, adopted by the owner
// on 25 November): only the projector reads the authoritative world for what the company knows and perceives
// (src/presentation/knowing.ts, with the parts the manifest names), and the player, the presentation, the page and
// the terminal read what it gives them. Every other read of the world as it is, from those layers, is counted here
// by file and by kind, and each count may only fall (test/small/knowledge-door, against
// doc/architecture/mission-22-beta/knowledge-door.json):
//   world      the campaign's world reached for (`campaign.world`, `c.world`, `context.world`)
//   facts      a world asked a question (`world.test(…)`, `w.related(…)`, `world.one(…)`)
//   creatures  the creature store read (`tickState.creatures`, `readout.creatures`)
//   rules      the module's rules read back (`module.rules`, `.observations`, `.pursuits`, `.relations`)
// Comments are not counted. A fall is written back with --write so that the count holds the gain.
//   bun scripts/knowledge-door.ts [--write] [--kinds]
import { readFileSync, writeFileSync } from 'node:fs';
import { Glob } from 'bun';

export type DoorKind = 'world' | 'facts' | 'creatures' | 'rules';
export type DoorCounts = Record<string, Partial<Record<DoorKind, number>>>;
export interface DoorFile {
  about: string;
  // The projector and its parts, and the diagnostic tools, whose reads are the door's own: by file, why.
  manifest: Record<string, string>;
  // The exported calls through which what the company knows and perceives crosses into the player layer.
  crossing: string[];
  counts: DoorCounts;
}
export class KnowledgeDoor {
  static readonly file = 'doc/architecture/mission-22-beta/knowledge-door.json';
  // The player layer: the presentation, the screen's model, the terminal's client parts and the page.
  static readonly scope = ['src/presentation/**/*.ts', 'src/ui/**/*.ts', 'src/cli/runner*.ts', 'src/cli/play-*.ts',
    'src/cli/playtext.ts', 'web/**/*.{ts,tsx}'];
  static readonly kinds: Record<DoorKind, RegExp> = {
    world: /\b(?:campaign|c|context)\.world\b(?!\s*[(:])/g,
    facts: /\b(?:world|w)\.(?:test|one|related|relatedTo|relates|measured|measuresOf|of|number|apply)\(/g,
    creatures: /\b(?:tickState|readout)\.creatures\b/g,
    rules: /\bmodule\.(?:rules|observations|pursuits|relations)\b/g,
  };
  static read(root = '.'): DoorFile { return JSON.parse(readFileSync(`${root}/${this.file}`, 'utf8')) as DoorFile; }
  // Each file's reads outside comments, by kind: "src/presentation/glance.ts" → { world: 12, facts: 3 }.
  static count(root = '.', manifest = this.read(root).manifest): DoorCounts {
    const out: DoorCounts = {};
    const files = [...new Set(this.scope.flatMap(g => [...new Glob(g).scanSync(root)]))].sort();
    for (const f of files.filter(f => !(f in manifest))) {
      const lines = readFileSync(`${root}/${f}`, 'utf8').split('\n').filter(l => !l.trim().startsWith('//'));
      const counts: Partial<Record<DoorKind, number>> = {};
      for (const [kind, re] of Object.entries(this.kinds) as [DoorKind, RegExp][]) {
        const n = lines.reduce((a, l) => a + [...l.matchAll(re)].length, 0);
        if (n) { counts[kind] = n; }
      }
      if (Object.keys(counts).length) { out[f] = counts; }
    }
    return out;
  }
  static total(counts: DoorCounts, kind?: DoorKind): number {
    return Object.values(counts).reduce((a, c) => a + Object.entries(c)
      .filter(([k]) => !kind || k === kind).reduce((b, [, n]) => b + n, 0), 0);
  }
  static main(args: string[]): number {
    const kept = this.read(), counts = this.count('.', kept.manifest);
    if (args.includes('--kinds') || !args.includes('--write')) {
      for (const [f, c] of Object.entries(counts)) {
        console.log(`${String(this.total({ [f]: c })).padStart(4)}  ${f}  ${JSON.stringify(c)}`);
      }
    }
    const by = (Object.keys(this.kinds) as DoorKind[]).map(k => `${k} ${this.total(counts, k)}`).join(', ');
    console.log(`outside the door: ${this.total(counts)} (${by}); was ${this.total(kept.counts)}`);
    if (args.includes('--write')) {
      writeFileSync(this.file, `${JSON.stringify({ ...kept, counts }, null, 1)}\n`);
      console.log(`written: ${this.file}`);
    }
    return 0;
  }
}

if (import.meta.main) { process.exit(KnowledgeDoor.main(process.argv.slice(2))); }
