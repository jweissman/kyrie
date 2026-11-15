#!/usr/bin/env bun
// The experiential matrix (the owner, 15 November): a class × ancestry grid walked by the lab's three players: the
// one who takes the page's first act (follow), who takes what is worth exploring (silver) and who follows an aim and
// takes its gold (gold). Each run is the lab's own (invariants every step) and says its guided steps. A failure prints
// the exact line that makes it again.   bun scripts/matrix-walk.ts [--seed a1] [--steps 60] [--classes ..] [--races ..]
import { AutoplayRun } from '../src/autoplay/run';
import type { PolicyName } from '../src/autoplay/player';

export class MatrixWalk {
  static readonly classes = ['warrior', 'mage', 'cleric', 'thief'];
  static readonly races = ['human', 'dwarf', 'elf'];
  static readonly policies: PolicyName[] = ['follow', 'silver', 'gold'];
  static option(argv: string[], flag: string, fallback: string): string {
    const at = argv.indexOf(flag);
    return at < 0 ? fallback : argv[at + 1] ?? fallback;
  }
  static async main(argv: string[]): Promise<number> {
    const seed = this.option(argv, '--seed', 'a1'), steps = Number(this.option(argv, '--steps', '60'));
    const classes = this.option(argv, '--classes', this.classes.join(',')).split(',');
    const races = this.option(argv, '--races', this.races.join(',')).split(',');
    const policies = this.option(argv, '--policies', this.policies.join(',')).split(',') as PolicyName[];
    let failed = 0;
    for (const [i, classId] of classes.entries()) {
      for (const policy of policies) {
        const raceId = races[i % races.length]!;
        const r = await AutoplayRun.run({ seed, origin: 'order', policy, steps,
          protagonist: { name: 'Wenna', raceId, classId } });
        const m = r.metrics;
        console.log(`${seed} ${raceId} ${classId} ${policy}: ${m.steps} steps, ${m.commands} commands, guided ${m.guided}`
          + `/${m.guided + m.unguided}, ${(m.ms / 1000).toFixed(1)} s${r.failure ? `  FAILED ${r.failure.kind}: ${r.failure.message}` : ''}`);
        if (r.failure) {
          failed++;
          console.log(`  again: bun scripts/matrix-walk.ts --seed ${seed} --classes ${classId} --races ${raceId} --policies ${policy} --steps ${steps}`);
        }
      }
    }
    return failed ? 1 : 0;
  }
}
if (import.meta.main) { process.exit(await MatrixWalk.main(process.argv.slice(2))); }
