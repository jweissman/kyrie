// `kyrie verify <adventure>`: the one check before an adventure is handed in, everything that holds it to what it
// should be (the owner, 20 November: an adventure-writing agent compiled, linted and hand-played one and missed
// verify, reach, voice repeats and the name lint; only on prompting did reachability show what was never reached).
// In the order an author meets them:
//   compiled  the campaign loads (its modules compile);
//   lint      its findings (an error fails it, and a warning in a campaign the game offers);
//   names     a person's or place's name another adventure gives already (one world holds them all);
//   repeats   its own phrases said again and again (`kyrie voice repeats`);
//   tests     test/<adventure>.test.ts and test/<adventure>-*.test.ts, its principal journeys among them;
//   traces    the plays kept of it (see Traces), played again to what they came to;
//   reach     a curious player's ordinary play of it (`kyrie reach`): what it offered and saw of what was written.
// It ends with what each kind of evidence is, kept apart and never standing for one another: compiled clean, tests
// passed, automated exploration (what reach and the traces came to), and human play, which is recorded only when the
// author says so (--played "who, when, how far"); then what no play answered: the topics, acts, observations,
// milestones and endings never reached. The author's path is doc/authoring/checklist.md.
//   bin/kyrie verify <adventure> [--steps n] [--played "who, when, how far"]
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { KyrLint } from './kyr-lint';
import { PlayTool } from './play-tool';
import { Traces, type Kept } from './traces';
import { Happened } from './happened';
import { AdventureNames } from './adventure-names';
import { CanonicalNames } from './canonical-names';
import { Repeats } from './repeats';
import { ReachTool } from './reach-tool';

type Print = (line: string) => void;
// What each check came to: held or not, and what it found, in a word.
interface Ran { check: string; held: boolean; said: string }
interface Unreached {
  topics: string[]; acts: string[]; observations: string[]; milestones: string[]; endings: string[];
}
export class VerifyTool {
  static readonly usage = 'usage: kyrie verify <adventure> [--steps n] [--played "who, when, how far"]'
    + ' (with data/campaigns/<adventure>.campaign.json; the author\'s path: doc/authoring/checklist.md)';
  static readonly checklist = 'doc/authoring/checklist.md';
  static async main(args: string[], root = process.cwd(), print: Print = console.log): Promise<number> {
    const [adventure] = args, campaign = `data/campaigns/${adventure}.campaign.json`;
    if (!adventure || adventure.startsWith('--') || !existsSync(join(root, campaign))) { print(this.usage); return 1; }
    const steps = Number(this.flag(args, 'steps') ?? 400), played = this.flag(args, 'played');
    const ran: Ran[] = [], compiled = await this.lint(root, campaign, print);
    ran.push(...compiled);
    if (!compiled[0]!.held) { return this.summary(adventure, { ran, ...played ? { played } : {} }, print); }
    ran.push(...this.names(root, adventure, print), this.repeats(root, adventure, print),
      this.tests(root, adventure, print));
    const traced = await this.traces(root, adventure, campaign, print);
    ran.push(traced.ran);
    const reach = await this.reach(root, campaign, { steps, own: this.declared(root, adventure) }, print);
    ran.push(reach.ran);
    // An ending or milestone a kept trace came to is answered, though reach never came to it.
    const unreached = traced.never ? { ...reach.unreached,
      endings: reach.unreached.endings.filter(e => traced.never!.endings.includes(e)),
      milestones: reach.unreached.milestones.filter(m => traced.never!.milestones.includes(m)) } : reach.unreached;
    return this.summary(adventure, { ran, unreached, ...played ? { played } : {} }, print);
  }
  // Loaded, then linted: one that does not load has nothing else to check.
  private static async lint(root: string, campaign: string, print: Print): Promise<Ran[]> {
    let findings;
    try { findings = await KyrLint.campaign(join(root, campaign)); } catch (e) {
      print(`compiled: failed: ${(e as Error).message.split('\n')[0]}`);
      return [{ check: 'compiled', held: false, said: 'failed to load' }];
    }
    const recommended = KyrLint.recommended.includes(campaign);
    const failing = findings.filter(f => f.level === 'error' || (recommended && f.level === 'warning'));
    for (const f of failing) { print(`  lint ${f.level}: ${f.where}: ${f.message}`); }
    const advice = findings.filter(f => f.level === 'advice').length;
    print(`lint: ${failing.length ? `${failing.length} to fix` : 'clean'}${advice ? `, ${advice} to look at` : ''}`);
    // Beside lint's, how many telling rules are heard wherever the company is, each by name (AU-36: advice).
    const everywhere = findings.filter(f => f.check === 'everywhere');
    if (everywhere.length) {
      print(`heard everywhere: ${everywhere.length} telling ${everywhere.length === 1 ? 'rule' : 'rules'} with no anchor`);
      for (const f of everywhere) { print(`  ${f.message}`); }
    }
    return [{ check: 'compiled', held: true, said: 'loads' },
      { check: 'lint', held: !failing.length, said: failing.length ? `${failing.length} to fix` : 'clean' }];
  }
  // A name this adventure gives that another gives too (`kyrie names`, the cross-adventure lint).
  // And a module id another adventure declares (AU-19), which fails as a clash does; and first names another adventure
  // gives, advisory (AU-21).
  private static names(root: string, adventure: string, print: Print): Ran[] {
    const dir = join(root, 'data/adventures');
    const clashes = [...AdventureNames.clashes(dir).filter(c => c.includes(`(${adventure})`)),
      ...AdventureNames.twice(dir).filter(t => t.split(': ')[1]!.split(', ').includes(adventure))
        .map(t => `two adventures of one module id, ${t}`)];
    // And its own names against the canon's and each other (AU-35): a relation, measure or query shadowing the shared
    // rules' or the engine's, and a rule and an ending of one name, said here before lint says them.
    const own = join(dir, adventure), canon = [...CanonicalNames.shadows(own), ...CanonicalNames.doubled(own)];
    for (const c of clashes) { print(`  name: ${c}`); }
    for (const c of canon) { print(`  name: ${c}`); }
    print(`names: ${clashes.length ? `${clashes.length} given by another adventure too` : 'none shared'}${canon.length
      ? `; ${canon.length} of the canon's or doubled` : ''}`);
    clashes.push(...canon);
    const firsts = AdventureNames.sharedFirsts(adventure, dir);
    for (const f of firsts) { print(`  first name (advisory): ${f}`); }
    return [{ check: 'names', held: !clashes.length, said: clashes.length ? `${clashes.length} reused` : 'none shared' },
      { check: 'firsts', held: true, said: firsts.length ? `${firsts.length} first names another adventure gives`
        : 'none shared' }];
  }
  // The adventure's own phrases said more than once: found, not failed (a refrain may be meant).
  private static repeats(root: string, adventure: string, print: Print): Ran {
    const dir = join(root, 'data/adventures', adventure);
    const found = existsSync(dir) ? Repeats.find(Repeats.texts([dir], root), 5) : [];
    for (const r of found) { print(`  ${r.count}× “${r.phrase}”  ${r.at.slice(0, 3).join(', ')}`); }
    print(`repeats: ${found.length ? `${found.length} phrases said more than once (kyrie voice repeats)` : 'none'}`);
    return { check: 'repeats', held: true, said: found.length ? `found ${found.length}` : 'none' };
  }
  private static tests(root: string, adventure: string, print: Print): Ran {
    const files = readdirSync(join(root, 'test')).filter(f => f === `${adventure}.test.ts`
      || (f.startsWith(`${adventure}-`) && f.endsWith('.test.ts'))).map(f => `test/${f}`);
    if (!files.length) {
      print('tests: none (test/<adventure>.test.ts, test/<adventure>-*.test.ts)');
      return { check: 'tests', held: true, said: 'none written' };
    }
    const run = Bun.spawnSync(['bun', 'test', ...files], { cwd: root, stdout: 'pipe', stderr: 'pipe' });
    const said = `${run.stdout.toString()}${run.stderr.toString()}`;
    for (const line of said.split('\n').filter(l => l.startsWith('(fail)'))) { print(`  ${line}`); }
    const pass = this.count(said, 'pass'), fail = this.count(said, 'fail');
    print(`tests: ${pass} passed, ${fail} failed, in ${files.length} ${files.length === 1 ? 'file' : 'files'}`);
    return { check: 'tests', held: run.exitCode === 0, said: `${pass} passed, ${fail} failed` };
  }
  private static count(said: string, word: string): number {
    return Number(new RegExp(`(\\d+) ${word}`).exec(said)?.[1] ?? 0);
  }
  // The traces kept of the adventure: those played by its campaign, or into its scenes and people.
  private static async traces(root: string, adventure: string, campaign: string, print: Print):
    Promise<{ ran: Ran; never?: { endings: string[]; milestones: string[] } }> {
    const dir = join(root, Traces.dir), kept = existsSync(dir) ? readdirSync(dir)
      .filter(f => f.endsWith('.json') && !f.endsWith('.transcript.json'))
      .map(f => ({ name: Traces.named(f), k: JSON.parse(readFileSync(join(dir, f), 'utf8')) as Kept }))
      .filter(({ k }) => k.play?.includes(campaign) || (k.play?.includes('--in') && k.play.includes(adventure))) : [];
    let held = 0;
    const happened = new Happened();
    for (const { name, k } of kept) {
      // A trace that cannot be played again (its steps file gone, kept from a scratch path) is said, not thrown.
      const came = await PlayTool.again(k.play!, happened).catch((e: Error) => e);
      if (came instanceof Error) { print(`  trace ${name}: cannot be played again: ${came.message}`); continue; }
      const same = came.at === k.at && came.watch === k.watch && came.told === k.told;
      if (same) { held++; continue; }
      print(`  trace ${name}: came to ${came.at} at watch ${came.watch}, not ${k.at} at ${k.watch}`
        + `${came.told === k.told ? '' : ', and was told otherwise'}`);
    }
    print(`traces: ${held} of ${kept.length} come to what they came to`);
    if (kept.length) { for (const line of happened.lines()) { print(`  in none of them: ${line}`); } }
    const ran = { check: 'traces', held: held === kept.length, said: `${held} of ${kept.length} hold` };
    return kept.length ? { ran, never: happened.never() } : { ran };
  }
  // A curious player's ordinary play: what of what was written it was offered or saw, and what never happened.
  private static async reach(root: string, campaign: string, at: { steps: number; own: Set<string> }, print: Print):
    Promise<{ ran: Ran; unreached: Unreached }> {
    const run = await ReachTool.run(join(root, campaign), 'verify', at.steps), { reach, happened } = run;
    // What the adventure's own files declare, not what the world installs beside it (Imbar's planes, the rules').
    const mine = VerifyTool.mine.bind(VerifyTool, at.own);
    const written = { rooms: mine(run.written.rooms), topics: mine(run.written.topics), acts: mine(run.written.acts),
      observations: mine(run.written.observations) };
    const never = happened.never(), not = VerifyTool.not.bind(VerifyTool);
    const unreached = { topics: not(reach.topicsOffered, written.topics), acts: not(reach.actsOffered, written.acts),
      observations: not(reach.observed, written.observations), milestones: never.milestones, endings: never.endings };
    const said = `topics ${ReachTool.ratio(reach.topicsOffered, written.topics)}, acts ${ReachTool.ratio(reach.actsOffered,
      written.acts)}, seen ${ReachTool.ratio(reach.observed, written.observations)}, rooms ${ReachTool.ratio(reach.rooms,
      written.rooms)}`;
    // It takes the first way that ends the story and says little after (AU-32): which it took, and that the others
    // want journeys of their own.
    const ended = happened.endingsReached().map(id => id.replace(/^\w+?__/, ''));
    const by = ended.length ? `ended by ${ended.join(', ')}` : `ended: ${reach.ended ?? 'steps'}`;
    const others = never.endings.length ? `; ${never.endings.length} other ending${never.endings.length > 1 ? 's' : ''}`
      + ' want journeys of their own (reach is greedy: it takes the first way that ends it)' : '';
    print(`reach: in ${reach.steps} steps of a curious player, ${said}; ${by}${others}`);
    return { ran: { check: 'reach', held: true, said: `${said}; ${by}` }, unreached };
  }
  // The four kinds of evidence, each as it is; then what no play answered; and whether it holds.
  private static summary(adventure: string, at: { ran: Ran[]; unreached?: Unreached; played?: string },
    print: Print): number {
    const { ran, unreached, played } = at, of = VerifyTool.of.bind(VerifyTool, ran);
    const failed = ran.filter(r => !r.held);
    print('');
    print(`${adventure}: the evidence, each kind for itself`);
    print(`  compiled:   ${of('lint')?.held ? 'clean' : of('compiled')?.held ? `loads; lint ${of('lint')?.said}`
      : 'does not load'}${of('names') && !of('names')!.held ? `; names ${of('names')!.said}` : ''}`);
    print(`  tests:      ${of('tests')?.said ?? 'not run'}`);
    print(`  explored:   ${of('reach') ? `reach ${of('reach')!.said}; traces ${of('traces')!.said}` : 'not run'}`);
    print(`  human play: ${played ? `recorded: ${played}` : 'no human play recorded'}`);
    if (of('firsts')) { print(`  advisory:   ${of('firsts')!.said} (first names may be shared; distinctive ones read as kin)`); }
    if (unreached) {
      print('  unanswered by reach or the kept traces (never offered, seen or reached; the tests are not read):');
      for (const [kind, ids] of Object.entries(unreached) as [keyof Unreached, string[]][]) {
        print(`    ${kind}: ${ids.length ? ids.map(id => id.replace(/^\w+?__/, '')).join(' ') : '-'}`);
      }
    }
    print(failed.length ? `${adventure}: ${failed.map(r => `${r.check} (${r.said})`).join(', ')} to mend`
      : `${adventure}: every check holds (see ${this.checklist} for what none of them proves)`);
    return failed.length ? 1 : 0;
  }
  // The names an adventure's own .kyr files declare: its places, people, topics, acts and observations.
  private static declared(root: string, adventure: string): Set<string> {
    const dir = join(root, 'data/adventures', adventure), out = new Set<string>();
    for (const file of existsSync(dir) ? readdirSync(dir).filter(f => f.endsWith('.kyr')) : []) {
      for (const m of readFileSync(join(dir, file), 'utf8').matchAll(/^\s*(?:Place|Person|Topic|Action|Observe)\s+(\w+)/gm)) {
        out.add(m[1]!);
      }
    }
    return out;
  }
  // Of ids, the adventure's own (by the name after its module's prefix); a topic's "again" is its topic's.
  private static mine(own: Set<string>, ids: string[]): string[] {
    return ids.filter(id => own.has(id.replace(/^\w+?__/, '')));
  }
  private static not(got: Set<string>, of: string[]): string[] { return of.filter(x => !got.has(x)); }
  private static of(ran: Ran[], check: string): Ran | undefined { return ran.find(r => r.check === check); }
  private static flag(args: string[], name: string): string | undefined {
    const i = args.indexOf(`--${name}`);
    return i < 0 ? undefined : args[i + 1];
  }
}
