// The autoplay laboratory, from the terminal: generated worlds played by players of every temper through the game's
// own offered commands and journeys, each step checked against what play must keep true. A failure is written out
// with what makes it again (the seed and the world's draw, every command, the move that failed, the game as last
// kept), and with --shrink made small. The totals say how much play was had: commands, fights and their ends,
// journeys made, countries entered, places been, and the world's own hours, beside the time it took.
//   bun scripts/autoplay.ts [--seeds wren,a1] [--origins wanderer,kin] [--classes warrior,cleric]
//     [--policies mixed,fight] [--steps 200] [--keep 25] [--replay] [--no-frontier] [--out dir] [--shrink]
//   bun scripts/autoplay.ts --encounters 1000 [--seeds e1,e2]   fights alone, on the engine, many and fast
import { mkdirSync, writeFileSync } from 'node:fs';
import { AutoplayRun, type RunResult, type RunSpec } from '../src/autoplay/run';
import { Shrinker } from '../src/autoplay/shrink';
import { EncounterLab } from '../src/autoplay/encounters';
import type { PolicyName } from '../src/autoplay/player';
import { Canon } from '../src/canon/canon';

interface Options {
  seeds: string[]; origins: string[]; classes: string[]; policies: PolicyName[]; steps: number; keep: number;
  replay: boolean; frontier: boolean; out: string; shrink: boolean;
}
class Lab {
  static readonly races = ['human', 'dwarf', 'elf'];
  static value(argv: string[], flag: string, fallback: string): string {
    const i = argv.indexOf(flag);
    return i >= 0 && argv[i + 1] ? argv[i + 1]! : fallback;
  }
  static options(a: string[]): Options {
    return { seeds: this.value(a, '--seeds', 'wren,a1,b2').split(','),
      origins: this.value(a, '--origins', 'wanderer').split(','),
      classes: this.value(a, '--classes', 'warrior').split(','),
      policies: this.value(a, '--policies', 'mixed').split(',') as PolicyName[], steps: Number(this.value(a, '--steps', '150')),
      keep: Number(this.value(a, '--keep', '25')), replay: a.includes('--replay'), frontier: !a.includes('--no-frontier'),
      out: this.value(a, '--out', 'autoplay-out'), shrink: a.includes('--shrink') };
  }
  static specs(o: Options): RunSpec[] {
    return o.seeds.flatMap((seed, i) => o.origins.flatMap(origin => o.classes.flatMap(classId =>
      o.policies.map(policy => ({ seed, origin, policy, steps: o.steps, keep: o.keep, replay: o.replay,
        frontier: o.frontier, protagonist: { name: 'Wenna', raceId: this.people(classId, i), classId } })))));
  }
  // A people the calling is open to, turn about by the seed.
  static people(classId: string, i: number): string {
    const open = this.races.filter(r => Canon.ancestries[r]?.classes.includes(classId));
    return open[i % open.length] ?? 'human';
  }
  static build(): string {
    return Bun.spawnSync(['git', 'rev-parse', '--short', 'HEAD']).stdout.toString().trim() || 'unknown';
  }
  static line(r: RunResult): string {
    const m = r.metrics, s = r.spec;
    return `${s.seed} ${s.origin} ${s.protagonist.raceId} ${s.protagonist.classId} ${s.policy} | ${m.steps} steps, `
      + `${m.commands} commands, ${m.fights} fights (${m.won} won, ${m.lost} lost, ${m.fled} fled), `
      + `${m.arrivals}/${m.travels} journeys, ${m.countries} countries, ${m.places} places, `
      + `${(m.watches / 6).toFixed(0)} h | ${(m.ms / 1000).toFixed(1)} s${r.ended ? ' | ended' : ''}`
      + (r.failure ? ` | FAIL ${r.failure.kind}: ${r.failure.message.split('\n')[0]}` : '');
  }
  static async keep(o: Options, r: RunResult, build: string) {
    const f = r.failure!, s = r.spec, name = `${s.seed}-${s.origin}-${s.protagonist.classId}-${s.policy}-${f.kind}`;
    mkdirSync(`${o.out}/failures`, { recursive: true });
    const shrunk = o.shrink ? await Shrinker.shrink(s, r.steps, f) : undefined;
    writeFileSync(`${o.out}/failures/${name}.json`, JSON.stringify({ build, spec: s, failure: f, steps: r.steps,
      ...shrunk ? { shrunk } : {}, kept: r.kept }, null, 1));
    console.log(`   kept ${o.out}/failures/${name}.json${shrunk ? ` (${r.steps.length} commands made ${shrunk.length})` : ''}`);
  }
  // The nearest horizon: companies against the catalog's kinds, fight after fight, every creature checked after each.
  static encounters(seeds: string[], count: number) {
    for (const seed of seeds) {
      const r = EncounterLab.run(seed, count);
      console.log(`${seed} | ${r.fights} fights (${r.won} won, ${r.lost} lost, ${r.fled} fled, ${r.undecided} undecided), `
        + `${r.turns} turns, ${r.failures.length} failed | ${(r.ms / 1000).toFixed(1)} s`);
      for (const f of r.failures.slice(0, 5)) { console.log(`   ${f.seed} ${f.kind} (${f.company.join(', ')}): ${f.message}`); }
    }
  }
  static async main(argv: string[]) {
    const o = this.options(argv), build = this.build(), results: RunResult[] = [];
    if (argv.includes('--encounters')) { this.encounters(o.seeds, Number(this.value(argv, '--encounters', '200'))); return; }
    for (const spec of this.specs(o)) {
      let r: RunResult;
      try { r = await AutoplayRun.run(spec); } catch (error) {
        console.log(`${spec.seed} ${spec.origin} ${spec.protagonist.classId}: not begun (${(error as Error).message})`);
        continue;
      }
      results.push(r);
      console.log(this.line(r));
      if (r.failure) { await this.keep(o, r, build); }
    }
    this.totals(results);
  }
  static sum(results: RunResult[], k: 'commands' | 'fights' | 'arrivals' | 'countries' | 'places' | 'watches' | 'ms') {
    return results.reduce((n, r) => n + r.metrics[k], 0);
  }
  static totals(results: RunResult[]) {
    const sum = this.sum.bind(this, results);
    const kinds = new Set(results.flatMap(r => Object.keys(r.metrics.kinds))), failed = results.filter(r => r.failure);
    console.log(`\n${results.length} runs, ${failed.length} failed; ${sum('commands')} commands (${kinds.size} kinds), `
      + `${sum('fights')} fights, ${sum('arrivals')} journeys arrived, ${sum('countries')} countries entered, `
      + `${sum('places')} places, ${(sum('watches') / 144).toFixed(1)} days of the world, in `
      + `${(sum('ms') / 1000).toFixed(0)} s (${(sum('commands') / (sum('ms') / 1000)).toFixed(1)} commands a second)`);
  }
}
await Lab.main(process.argv.slice(2));
