// `kyrie verify <adventure>`: everything that holds an adventure to what it should be, in one: its campaign linted
// (an error fails it, and a warning in a campaign the game offers), its tests (test/<adventure>.test.ts and every
// test/<adventure>-*.test.ts, as `kyrie new` names a part's), and the traces kept of it (see Traces) played again to
// what they came to. What fails is said, and the rest counted.
//   bin/kyrie verify <adventure>
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { KyrLint } from './kyr-lint';
import { PlayTool } from './play-tool';
import { Traces, type Kept } from './traces';

export class VerifyTool {
  static async main(args: string[], root = process.cwd(), print: (line: string) => void = console.log):
    Promise<number> {
    const [adventure] = args, campaign = `data/campaigns/${adventure}.campaign.json`;
    if (!adventure || !existsSync(join(root, campaign))) {
      print('usage: kyrie verify <adventure> (with data/campaigns/<adventure>.campaign.json)'); return 1;
    }
    const failed = [await this.lint(root, campaign, print), this.tests(root, adventure, print),
      await this.traces(root, adventure, campaign, print)].filter(ok => !ok).length;
    print(failed ? `${adventure}: ${failed} of 3 checks failed` : `${adventure}: lint, tests and traces all hold`);
    return failed ? 1 : 0;
  }
  private static async lint(root: string, campaign: string, print: (line: string) => void): Promise<boolean> {
    const findings = await KyrLint.campaign(join(root, campaign)), recommended = KyrLint.recommended.includes(campaign);
    const failing = findings.filter(f => f.level === 'error' || (recommended && f.level === 'warning'));
    for (const f of failing) { print(`  lint ${f.level}: ${f.where}: ${f.message}`); }
    const advice = findings.filter(f => f.level === 'advice').length;
    print(`lint: ${failing.length ? `${failing.length} to fix` : 'clean'}${advice ? `, ${advice} to look at` : ''}`);
    return !failing.length;
  }
  private static tests(root: string, adventure: string, print: (line: string) => void): boolean {
    const files = readdirSync(join(root, 'test')).filter(f => f === `${adventure}.test.ts`
      || (f.startsWith(`${adventure}-`) && f.endsWith('.test.ts'))).map(f => `test/${f}`);
    if (!files.length) { print('tests: none (test/<adventure>.test.ts, test/<adventure>-*.test.ts)'); return true; }
    const run = Bun.spawnSync(['bun', 'test', ...files], { cwd: root, stdout: 'pipe', stderr: 'pipe' });
    const said = `${run.stdout.toString()}${run.stderr.toString()}`;
    for (const line of said.split('\n').filter(l => l.startsWith('(fail)'))) { print(`  ${line}`); }
    print(`tests: ${this.count(said, 'pass')} passed, ${this.count(said, 'fail')} failed,`
      + ` in ${files.length} ${files.length === 1 ? 'file' : 'files'}`);
    return run.exitCode === 0;
  }
  private static count(said: string, word: string): number {
    return Number(new RegExp(`(\\d+) ${word}`).exec(said)?.[1] ?? 0);
  }
  // The traces kept of the adventure: those played by its campaign, or into its scenes and people.
  private static async traces(root: string, adventure: string, campaign: string, print: (line: string) => void):
    Promise<boolean> {
    const dir = join(root, Traces.dir), kept = existsSync(dir) ? readdirSync(dir)
      .filter(f => f.endsWith('.json') && !f.endsWith('.transcript.json'))
      .map(f => ({ name: Traces.named(f), k: JSON.parse(readFileSync(join(dir, f), 'utf8')) as Kept }))
      .filter(({ k }) => k.play?.includes(campaign) || (k.play?.includes('--in') && k.play.includes(adventure))) : [];
    let held = 0;
    for (const { name, k } of kept) {
      const came = await PlayTool.again(k.play!);
      const same = came.at === k.at && came.watch === k.watch && came.told === k.told;
      if (same) { held++; continue; }
      print(`  trace ${name}: came to ${came.at} at watch ${came.watch}, not ${k.at} at ${k.watch}`
        + `${came.told === k.told ? '' : ', and was told otherwise'}`);
    }
    print(`traces: ${held} of ${kept.length} come to what they came to`);
    return held === kept.length;
  }
}
