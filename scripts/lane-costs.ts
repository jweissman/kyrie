#!/usr/bin/env bun
// The cost ladder (the owner, 15 November: pay only for the semantics under test): what each rung of the test hierarchy
// costs, first call in a fresh process (cold: module loading and lazy set-up included) and then warm (the median of the
// calls after it), on the real implementation at every rung, never a simplified one.
//   load   the modules a rung reads, imported            (what a spec pays before it begins)
//   A      parse, validate: a Kyr fragment with no prelude, no Deem, no world (ModuleParser, ModuleCompiler)
//   B      create a creature; set up an encounter; one blow of the rules kernel (state + command + seed → events)
//   C      a whole fight, and the gauntlet: a calling against 1–4 rats over many seeds (a new character at each: a
//          population, not one set of rolls), the real kernel and tactics
//   D      a tiny world started, and the page's choices read from it (the player's workflow, Tiny)
//   E      a full country (--full; seconds, so not by default)
//   bun scripts/lane-costs.ts [--full] [--gauntlet 60] [--callings mage,warrior,thief,cleric]
// Run it in a fresh process for the cold column; a run is the same run again (every seed is fixed).
import { performance } from 'node:perf_hooks';

const fragment = `Module a "A" {
  Kind group. Kind place. Relation at(group, place) exclusive. Relation route(place, place). Relation been(group, place).
  Entity home: place "Home". Entity yard: place "Yard". Entity party: group "Party".
  Initially Assert at(party, home). Initially Assert route(home, yard).
  Query near(x: place, y: place) means route(x, y) or route(y, x).
  Rule seen when at(?c, ?p) and not been(?c, ?p) { Assert been(?c, ?p). }
  Action go(g: group, p: place, q: place) "Go to {q}" { Requires at(g, p) and near(p, q). On success { Assert at(g, q). } }
  Goal at(party, yard).
}`;
const world = `Place yard "the yard" is room at 0, 0 outdoors. Company party "You" of 1 at yard.`;

export class LaneCosts {
  // One unit of a rung's work.
  static async unit(rung: string): Promise<void> {
    if (rung === 'parse' || rung === 'validate') {
      const { ModuleParser } = await import('../src/lang/module-parser');
      const { ModuleCompiler } = await import('../src/lang/module-compiler');
      const parsed = ModuleParser.parse(fragment);
      if (rung === 'validate') { new ModuleCompiler([], false).validate(structuredClone(parsed)); }
    } else if (rung === 'creature') {
      const { Content } = await import('../src/content');
      new Content('ladder').createCreature('pc', { raceId: 'human', classId: 'mage', level: 1 } as never);
    } else if (rung === 'fight') {
      const { Gauntlet } = await import('../test/support/gauntlet');
      Gauntlet.fight({ calling: 'mage', foe: 'rat', count: 3 }, 'ladder');
    } else if (rung === 'tiny' || rung === 'choices') {
      const { Tiny } = await import('../test/support/tiny');
      const { PlayerView } = await import('../src/presentation/player-view');
      const t = await Tiny.start(world);
      if (rung === 'choices') { PlayerView.choices(t.campaign); }
    } else if (rung === 'a1') {
      const { PlayTool } = await import('../src/cli/play-tool');
      await PlayTool.start(PlayTool.parse(['--world', 'a1', '--origin', 'order', '--as', 'human/ranger/Aud']));
    }
  }
  // The first call and the median of the next few, in milliseconds.
  static async time(rung: string, repeats: number): Promise<{ first: number; warm: number }> {
    const began = performance.now();
    await this.unit(rung);
    const first = performance.now() - began, later: number[] = [];
    for (let i = 0; i < repeats; i++) {
      const at = performance.now();
      await this.unit(rung);
      later.push(performance.now() - at);
    }
    later.sort((a, b) => a - b);
    return { first, warm: later[Math.floor(later.length / 2)] ?? first };
  }
  static async load(label: string, ...paths: string[]): Promise<number> {
    const began = performance.now();
    await Promise.all(paths.map(p => import(p)));
    console.log(`${label.padEnd(10)}${(performance.now() - began).toFixed(0).padStart(7)} ms   (import)`);
    return performance.now() - began;
  }
  static async gauntlet(callings: string[], trials: number): Promise<void> {
    const { Gauntlet } = await import('../test/support/gauntlet');
    console.log(`\ngauntlet: a level-1 calling alone against 1–4 rats, ${trials} seeds each (won %, rounds, ms a fight)`);
    for (const calling of callings) {
      const cells: string[] = [];
      for (let rats = 1; rats <= 4; rats++) {
        const began = performance.now();
        const results = Array.from({ length: trials }, (_, i) => Gauntlet.fight({ calling, foe: 'rat', count: rats, who: `p${i}` }, `g${i}`));
        const won = results.filter(r => r.won).length, rounds = results.reduce((n, r) => n + r.rounds, 0) / trials;
        cells.push(`${rats}: ${String(Math.round(100 * won / trials)).padStart(3)}% ${rounds.toFixed(1).padStart(4)}r `
          + `${((performance.now() - began) / trials).toFixed(1).padStart(5)}ms`);
      }
      console.log(`  ${calling.padEnd(9)}${cells.join('   ')}`);
    }
  }
  static option(args: string[], flag: string, fallback: string): string {
    const at = args.indexOf(flag);
    return at < 0 ? fallback : args[at + 1] ?? fallback;
  }
  static async main(args: string[]): Promise<number> {
    console.log(`lane costs, load average ${(await import('node:os')).loadavg()[0]!.toFixed(1)}\n`);
    await this.load('A: lang', '../src/lang/module-parser', '../src/lang/module-compiler');
    await this.load('B: kernel', '../src/content', '../src/creature-store', '../src/battle', '../src/tactics');
    await this.load('D: world', '../test/support/tiny', '../src/presentation/player-view');
    console.log('\nrung                 first      warm');
    const rungs: [string, string][] = [['A  parse a fragment', 'parse'], ['A  parse + validate', 'validate'],
      ['B  create a creature', 'creature'], ['C  a whole fight (3 rats)', 'fight'], ['D  start a tiny world', 'tiny'],
      ['D  ... and read its choices', 'choices']];
    if (args.includes('--full')) { rungs.push(['E  a full country (a1)', 'a1']); }
    for (const [label, rung] of rungs) {
      const { first, warm } = await this.time(rung, rung === 'a1' ? 2 : 15);
      console.log(`${label.padEnd(26)}${first.toFixed(1).padStart(8)} ms${warm.toFixed(1).padStart(8)} ms`);
    }
    await this.gauntlet(this.option(args, '--callings', 'mage,warrior,thief,cleric').split(','),
      Number(this.option(args, '--gauntlet', '40')));
    return 0;
  }
}
if (import.meta.main) { process.exit(await LaneCosts.main(process.argv.slice(2))); }
