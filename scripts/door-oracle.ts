#!/usr/bin/env bun
// The knowledge door's oracle: what the golden walk tells and perceives, turn by turn, written to a file and read
// against another (a slice of the door moves reads behind it with no change of behaviour: OR-741). Each turn: the
// runner's scene and offer as the player has them, the narrator's leaf and the glance's perception beyond the place.
//   bun scripts/door-oracle.ts --write <file>      bun scripts/door-oracle.ts --against <file>
import { readFileSync, writeFileSync } from 'node:fs';
import { PlayTool } from '../src/cli/play-tool';
import { Runner } from '../src/cli/runner';
import { ScreenModel } from '../src/ui/screen-model';
import { Narrator } from '../src/presentation/narrator';
import { Perception } from '../src/presentation/perception';
import { AsMeant } from '../test/support/as-meant';
import { GoldenWalk } from '../test/support/golden-walk';

export class DoorOracle {
  static async walked(): Promise<string[]> {
    const { journey } = await PlayTool.start(PlayTool.parse(GoldenWalk.args()));
    const r = new Runner(journey.session), out: string[] = [];
    for (const line of GoldenWalk.lines()) {
      const x = await AsMeant.ask(r, line), c = journey.session.campaign, screen = ScreenModel.build(c);
      const sensed = Perception.sensed(c, screen), leaf = Narrator.leaf(c, screen);
      out.push(JSON.stringify({ line, x, sensed, notes: Perception.notes(c, sensed), leaf }, DoorOracle.plain));
    }
    return out;
  }
  // Sets and maps as their entries, so that what they hold is compared.
  static plain(this: void, _: string, v: unknown): unknown {
    return v instanceof Set ? [...v] : v instanceof Map ? [...v] : v;
  }
  static async main(args: string[]): Promise<number> {
    const turns = await this.walked(), at = args.indexOf('--write'), against = args.indexOf('--against');
    if (at >= 0) { writeFileSync(args[at + 1]!, `${turns.join('\n')}\n`); console.log(`${turns.length} turns written`); }
    if (against < 0) { return 0; }
    const kept = readFileSync(args[against + 1]!, 'utf8').split('\n').filter(Boolean);
    const differ = turns.flatMap((t, i) => t === kept[i] ? [] : [i]);
    console.log(`${turns.length} turns against ${kept.length}: ${differ.length ? `differ at ${differ.join(', ')}` : 'the same'}`);
    return differ.length || turns.length !== kept.length ? 1 : 0;
  }
}

if (import.meta.main) { process.exit(await DoorOracle.main(process.argv.slice(2))); }
