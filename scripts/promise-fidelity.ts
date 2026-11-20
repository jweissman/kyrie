#!/usr/bin/env bun
// Promise fidelity over generated worlds (the owner, 15 November: experiential pins by family): a curious walk, and on
// every turn each facet the glance draws checked by doing its act in a copy of the world (RunnerFidelity). Counts by
// facet, and every promise broken with where, for reading as traces. A measure, not a gate: the tiny pin is
// test/small/promises-kept. --as plays one protagonist (race/calling/Name[/background]) in place of the ranger; on
// iscoed, the past chosen as creation chooses it begins its life (a scholar's the weir: PlayTool.given), and without
// --as the drove, the golden route's (a world with no wanderer had thrown: the sprint audit, 19 November).
//   bun scripts/promise-fidelity.ts [worlds=a1,b2,c3,iscoed,laboratory] [turns=20] [--as elf/mage/Ilse/scholar]
//     [--origin pans]
import { PlayTool } from '../src/cli/play-tool';
import { Laboratory } from './laboratory';
import { Runner, type Offered, type Said } from '../src/cli/runner';
import { RunnerFidelity } from '../src/cli/runner-fidelity';
import { RunnerWalk } from '../src/cli/runner-walk';
import { PlaySession } from '../src/session/play-session';
import { ScreenModel } from '../src/ui/screen-model';
import { Narrator } from '../src/presentation/narrator';
import type { Glance } from '../src/presentation/glance-types';
import type { Campaign } from '../src/campaign/campaign';

const origins: Record<string, string> = { a1: 'order', b2: 'courier', c3: 'wanderer', iscoed: 'drove' };
const ranger = 'human/ranger/Aud';
interface Tally { drawn: number; broken: number }
export class PromiseFidelity {
  // as: who walks; given, their own past chooses the origin where the world gives one by it (iscoed), as the cold
  // plays began (CompatJourneys.cold), else the table's. origin: one named, to compare a life with the route's.
  static async walk(world: string, turns: number, as?: string, origin?: string)
    : Promise<{ tally: Record<string, Tally>; broken: string[]; chance: string[] }> {
    // The laboratory (scripts/laboratory.ts): a hand-written world with its fights and finds in reach of the start.
    const begun = origin ?? (as && world === 'iscoed' ? undefined : origins[world] ?? 'wanderer');
    const given = begun ? ['--origin', begun] : [];
    const { journey } = await PlayTool.start(PlayTool.parse(world === 'laboratory'
      ? [Laboratory.file, '--as', as ?? ranger, '--seed', 'a1']
      : ['--world', world, ...given, '--as', as ?? ranger]));
    const runner = new Runner(journey.session), tally: Record<string, Tally> = {}, broken: string[] = [];
    const chance: string[] = [];
    const chosen: Offered[] = [];
    let said: Said = runner.said();
    // Walk one turn at a time, as a curious walker does, reading each screen before the act as the player has it.
    for (let n = 0; n < turns && !said.end; n++) {
      const c = journey.session.campaign, glance = said.moment === 'fight' ? undefined
        : Narrator.leaf(c, ScreenModel.build(c)).glance;
      if (glance) { await this.read(`${world} turn ${n}`, glance, c, { tally, broken, chance }); }
      const pick = RunnerWalk.choose('curious', said, chosen, n + 1);
      const out = pick && await runner.ask(JSON.stringify({ act: pick.id }));
      if (!out || 'error' in out) { break; }
      chosen.push(pick); said = out;
    }
    return { tally, broken, chance };
  }
  private static async read(when: string, glance: Glance, c: Campaign,
    into: { tally: Record<string, Tally>; broken: string[]; chance: string[] }) {
    const { tally, broken, chance } = into, save = c.save(), at = c.world.one('at', c.playerActor ?? 'party') ?? '?';
    const read = await RunnerFidelity.of(glance, () => PlaySession.fromSave(structuredClone(save)));
    for (const a of read.drawn) { (tally[a] ??= { drawn: 0, broken: 0 }).drawn++; }
    read.broken.forEach((b, i) => {
      tally[/drawn (\w+)/.exec(b)![1]!]!.broken++;
      broken.push(`${when} at ${at}: ${b}${process.env.TRACE ? `\n    ${read.traces[i]}` : ''}`);
    });
    // A promise on a roll (an even chance) not kept on this one is not broken: told apart, not counted.
    for (const c of read.chance) { chance.push(`${when} at ${at}: (chance) ${c}`); }
  }
  static async main(argv: string[]) {
    const flags = new Map<string, string>(), args: string[] = [];
    for (let i = 0; i < argv.length; i++) {
      if (/^--(as|origin)$/.test(argv[i]!)) { flags.set(argv[i]!.slice(2), argv[++i]!); } else { args.push(argv[i]!); }
    }
    const worlds = (args[0] ?? 'a1,b2,c3').split(','), turns = Number(args[1] ?? 20);
    for (const world of worlds) {
      const t0 = performance.now(), { tally, broken, chance } = await this.walk(world, turns, flags.get('as'),
        flags.get('origin'));
      const row = Object.entries(tally).map(([a, t]) => `${a} ${t.drawn - t.broken}/${t.drawn}`).join(', ');
      console.log(`${world} (${Math.round(performance.now() - t0)} ms): kept ${row}`);
      for (const b of [...broken, ...chance]) { console.log(`  ${b}`); }
    }
  }
}
if (import.meta.main) { await PromiseFidelity.main(process.argv.slice(2)); }
