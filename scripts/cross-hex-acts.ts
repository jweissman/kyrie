#!/usr/bin/env bun
// What could take the company into another hex of a drawn world otherwise than by the engine's travel (TR-20; the
// owner, 19 November: "I got from my quest destination back to town without the map"). Three readings:
//   acts: each authored act whose changes put the company somewhere, from where its condition (or the one it is put to)
//     has it, with each end's hex: "crosses" is what the engine withholds (Crossing.carried) and the lint reports;
//   rules: each rule that puts the company somewhere, the world's doing (a captor, a wagon, a way out of the lost);
//   offered: the company put at every place the land draws, each act open to it there (before the engine withholds
//     any) whose own changes cross, and how many ways into another hex are offered for the map's journeys.
//   bun scripts/cross-hex-acts.ts [a1,iscoed,kite]
import { WorldAssembler } from '../src/world/world-assembler';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { PlaySession } from '../src/session/play-session';
import { HexBoundary } from '../src/hex-boundary';
import { ModuleWriter } from '../src/lang/module-writer';
import { Crossing } from '../src/campaign/crossing';
import type { Campaign } from '../src/campaign/campaign';
import type { Change, Module, Predicate } from '../src/lang/module';

export class CrossHexActs {
  static readonly company = new Set(['party', 'actor']);
  static hex(m: Module, id: string): string { return HexBoundary.hex(m, id) ?? 'no hex'; }
  // Where the changes put the company.
  static puts(changes: Change[]): string[] {
    return changes.flatMap(c => c.kind === 'assert' && c.call.name === 'at' && this.company.has(c.call.args[0]!)
      ? [c.call.args[1]!] : []);
  }
  // Where a condition asks the company to be (not under a not).
  static asks(p: Predicate): string[] {
    if (p.kind === 'call') { return p.name === 'at' && this.company.has(p.args[0]!) ? [p.args[1]!] : []; }
    return p.kind === 'and' || p.kind === 'or' ? [...this.asks(p.left), ...this.asks(p.right)] : [];
  }
  static said(m: Module, from: string[], to: string): string {
    const crosses = from.some(f => HexBoundary.crosses(m, f, to)) ? 'crosses' : 'within';
    return `${crosses}: ${from.map(f => `${f} (${this.hex(m, f)})`).join(', ') || 'anywhere'} → ${to} (${this.hex(m, to)})`;
  }
  static acts(c: Campaign): string[] {
    const m = c.module;
    return m.actions.filter(a => !a.movement).flatMap(a => this.puts([...a.success, ...a.failure]).map(to => {
      const asked = this.asks(a.requires), speaker = a.speaker ? c.world.one('at', a.speaker) : undefined;
      return `act ${a.id} "${a.name}" ${this.said(m, asked.length ? asked : speaker ? [speaker] : [], to)}`;
    })).filter(l => !/ → [?a-z_]+ \(no hex\)$/.test(l) || / crosses: /.test(l));
  }
  static rules(c: Campaign): string[] {
    const m = c.module;
    return (m.rules ?? []).flatMap(r => this.puts(r.effects)
      .map(to => `rule ${r.id} ${this.said(m, this.asks(r.when), to)}`))
      .filter(l => / crosses: /.test(l) || !/\(no hex\)$/.test(l));
  }
  static offered(c: Campaign): string[] {
    const m = c.module, actor = c.playerActor ?? 'party', held = c as unknown as { commit(w: unknown): void };
    const out = new Set<string>();
    let ways = 0;
    for (const p of m.entities.filter(e => e.type === 'place' && HexBoundary.hex(m, e.id)).map(e => e.id)) {
      held.commit(c.world.apply([{ kind: 'retract', call: ModuleWriter.call('at', actor, c.world.one('at', actor)!) },
        { kind: 'assert', call: ModuleWriter.call('at', actor, p) }]));
      for (const a of c.operators.applicable(c.world, actor)) {
        const to = Crossing.whither(a);
        const carried = Crossing.carried({ module: m, world: c.world, playerActor: actor }, a);
        if (to && HexBoundary.crosses(m, p, to)) { ways++; }
        if (!carried) { continue; }
        out.add(`offered ${a.schema ?? a.id} at ${p} (${this.hex(m, p)}) → ${carried.to} (${this.hex(m, carried.to)})`);
      }
    }
    return [...out, `offered: ${ways} ways into another hex, for the map's journeys`];
  }
  static async main(argv: string[]): Promise<number> {
    let crossing = 0;
    for (const seed of (argv[0] ?? 'a1,iscoed,kite').split(',')) {
      const w = await WorldAssembler.assemble(seed, NodeBundleSource.shared, {});
      const c = (await PlaySession.start(w.path, seed, w.source)).campaign;
      const lines = [...this.acts(c), ...this.rules(c), ...this.offered(c)];
      crossing += lines.filter(l => / crosses: |^offered \S+ at /.test(l)).length;
      console.log(`== ${seed}\n${lines.map(l => `  ${l}`).join('\n')}`);
    }
    return crossing ? 1 : 0;
  }
}
if (import.meta.main) { process.exit(await CrossHexActs.main(process.argv.slice(2))); }
