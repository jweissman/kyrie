// `kyrie transcripts`: an adventure's journeys written out as the page told them, for its playtest and editorial
// evidence (the Grand Tour's friction X12: each adventure had written its own script for it, seven in all). Each step
// is labelled as the page offered it; waits that tell nothing are counted, not repeated.
//   bin/kyrie transcripts <campaign.json> --out <dir> [--seed s] <steps.json>...
// A steps file is a list of steps, or phases of them ({ "phase": [steps] }), played in their order.
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { basename, join } from 'node:path';
import { Journey } from '../session/journey';
import { TranscriptWriter } from './transcript-writer';

export class TranscriptsTool {
  static readonly usage = 'usage: kyrie transcripts <campaign.json> --out <dir> [--seed s] <steps.json>...';
  static async main(args: string[]): Promise<number> {
    const out = this.flag(args, '--out'), seed = this.flag(args, '--seed') ?? 'journey';
    const [campaign, ...files] = args.filter((a, i) => !a.startsWith('--') && !['--out', '--seed'].includes(args[i - 1]!));
    if (!campaign || !out || !files.length) { console.error(this.usage); return 2; }
    await mkdir(out, { recursive: true });
    for (const file of files) {
      const j = await Journey.start(campaign, seed), opening = TranscriptWriter.opening(j);
      await j.play(...this.steps(JSON.parse(await readFile(file, 'utf8'))));
      const name = basename(file, '.json');
      const heading = TranscriptWriter.heading(j, name, `Seed \`${seed}\`, steps \`${file}\``);
      await writeFile(join(out, `${name}.md`), [...heading, ...TranscriptWriter.lines(j, opening)].join('\n'));
      console.log(`${name}.md: ${j.taken.length} steps`);
    }
    return 0;
  }
  private static flag(args: string[], flag: string): string | undefined {
    const i = args.indexOf(flag);
    return i >= 0 ? args[i + 1] : undefined;
  }
  static steps(file: unknown): string[] {
    return Array.isArray(file) ? file.map(String)
      : Object.values(file as Record<string, unknown>).flatMap(v => this.steps(v));
  }
}
