// The compatibility harness (the maturity track's step 6, MT-06): what KIND of change a revision made to the pinned
// worlds and journeys (iscoed's drove and weir, a1, kite; the kept traces; the fourth and fifth cold plays' lines),
// said as additive, presentation-only, world-moving, replay-breaking or save-breaking, with the first few of each.
//   bun scripts/compat.ts --base origin/main [--quick]   the base drawn in a worktree of its own, against this tree
//   bun scripts/compat.ts --base /var/tmp/kyrie/wt-x     the base another worktree holds
//   bun scripts/compat.ts snapshot --out s.json [--saves dir] [--quick]
//   bun scripts/compat.ts compare base.json [now.json]   (no now: this tree's, drawn now; --out keeps it)
//   --findings f.json: every finding, not the first few; --examples n: how many of each world and journey
// A base revision has this tree's harness copied in (the harness reads only what the play tool and runner read).
import { existsSync } from 'node:fs';
import { cp, mkdir, readFile, rm, symlink, readdir, writeFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { CompatSnapshot, type Snapshot } from '../src/cli/compat-snapshot';
import { CompatCompare, type Reopened } from '../src/cli/compat-compare';
import { CompatJourneys } from '../src/cli/compat-journeys';

class Compat {
  static readonly own = ['scripts/compat.ts', 'src/cli/compat-snapshot.ts', 'src/cli/compat-journeys.ts',
    'src/cli/compat-compare.ts'];
  static async run(args: string[]): Promise<number> {
    const flag = this.flag.bind(this, args);
    const quick = args.includes('--quick'), label = flag('--label') ?? 'this tree';
    const [verb, ...files] = args.filter((a, i) => !a.startsWith('--') && !args[i - 1]?.match(/^--(?!quick)/));
    if (verb === 'snapshot') {
      const shot = await CompatSnapshot.take({ quick, label, saves: flag('--saves') });
      await writeFile(flag('--out') ?? 'compat-snapshot.json', JSON.stringify(shot));
      return 0;
    }
    const base = verb === 'compare' ? JSON.parse(await readFile(files[0]!, 'utf8')) as Snapshot
      : await this.drawn(flag('--base') ?? 'origin/main', quick);
    const now = verb === 'compare' && files[1] ? JSON.parse(await readFile(files[1], 'utf8')) as Snapshot
      : await CompatSnapshot.take({ quick: base.quick, label });
    if (verb !== 'snapshot' && flag('--out')) { await writeFile(flag('--out')!, JSON.stringify(now)); }
    const findings = CompatCompare.compare(base, now, await this.reopened(base));
    console.log(CompatCompare.report(findings, { base: base.label, now: now.label,
      examples: Number(flag('--examples') ?? 3) }).join('\n'));
    if (flag('--findings')) { await writeFile(flag('--findings')!, JSON.stringify(findings, null, 1)); }
    return 0;
  }
  private static flag(args: string[], f: string): string | undefined {
    const i = args.indexOf(f);
    return i < 0 ? undefined : args[i + 1];
  }
  // The base's snapshot, drawn by its own tree: a worktree path as it is, or a revision checked out for the purpose.
  private static async drawn(base: string, quick: boolean): Promise<Snapshot> {
    const scratch = resolve('/var/tmp/kyrie/compat'), dir = existsSync(base) ? resolve(base) : join(scratch, 'base');
    await mkdir(scratch, { recursive: true });
    const made = !existsSync(base);
    if (made) { await this.checkout(base, dir); }
    try {
      // The harness is always this tree's, so that a base is measured as this tree is (a base with an older harness had
      // kept no words, and was compared on fewer things).
      for (const f of this.own) { await cp(f, join(dir, f)); }
      const out = join(scratch, 'base.json'), saves = join(scratch, 'base-saves');
      await rm(saves, { recursive: true, force: true });
      const p = Bun.spawn(['bun', 'scripts/compat.ts', 'snapshot', '--out', out, '--saves', saves, '--label', base,
        ...quick ? ['--quick'] : []], { cwd: dir, stdout: 'inherit', stderr: 'inherit' });
      if (await p.exited !== 0) { throw new Error(`the base's snapshot failed in ${dir}`); }
      return JSON.parse(await readFile(out, 'utf8')) as Snapshot;
    } finally { if (made) { await this.git(['worktree', 'remove', '--force', dir]); } }
  }
  // A revision in a worktree of its own, its node_modules this tree's (all but the parse cache, which is its own).
  private static async checkout(rev: string, dir: string) {
    if (existsSync(dir)) { await this.git(['worktree', 'remove', '--force', dir]); }
    await this.git(['worktree', 'add', '-q', '--detach', dir, rev]);
    await mkdir(join(dir, 'node_modules'), { recursive: true });
    for (const e of (await readdir('node_modules')).filter(e => e !== '.cache')) {
      await symlink(resolve('node_modules', e), join(dir, 'node_modules', e));
    }
  }
  private static async git(args: string[]) {
    const p = Bun.spawn(['git', '-C', process.cwd(), ...args], { stdout: 'ignore', stderr: 'inherit' });
    if (await p.exited !== 0) { throw new Error(`git ${args.join(' ')} failed`); }
  }
  // The base's saves, where it kept them, opened by this build.
  private static async reopened(base: Snapshot): Promise<Reopened> {
    const out: Reopened = {};
    for (const j of base.journeys.filter(j => j.save.file && existsSync(j.save.file))) {
      out[j.name] = CompatJourneys.reopen(await readFile(j.save.file!, 'utf8'));
    }
    return out;
  }
}
process.exit(await Compat.run(process.argv.slice(2)));
