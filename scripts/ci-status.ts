#!/usr/bin/env bun
// What CI is doing now, run by run: each unfinished run's jobs queued, running and done, and how long it has been
// waiting or going, with what may be stuck said plainly (the owner, 15 November: a queued run looks hung). A run
// queued past twenty minutes is waiting on the account's jobs at once, not on its own tests; a job running past
// twenty-five is past what a push shard takes.
//   bun scripts/ci-status.ts [--all]   (--all: the finished runs of the last hour too)
interface Job { name: string; status: string; startedAt: string }
interface Run { databaseId: number; headBranch: string; status: string; conclusion: string; createdAt: string;
  workflowName: string }
export class CiStatus {
  static gh(args: string[]): string {
    const out = Bun.spawnSync(['gh', ...args]);
    return out.stdout.toString();
  }
  static count(jobs: Job[], status: string): number { return jobs.filter(j => j.status === status).length; }
  static minutes(since: string): number { return Math.round((Date.now() - Date.parse(since)) / 60000); }
  static line(run: Run): string {
    const jobs = (JSON.parse(this.gh(['run', 'view', String(run.databaseId), '--json', 'jobs'])) as { jobs: Job[] }).jobs;
    const age = this.minutes(run.createdAt), long = jobs.filter(j => j.status === 'in_progress'
      && this.minutes(j.startedAt) > 25).map(j => j.name);
    const warn = run.status === 'queued' && age > 20 ? '  ⚠ queued past 20 min: waiting on other runs, not hung'
      : long.length ? `  ⚠ running past 25 min: ${long.join(', ')}` : '';
    return `${run.headBranch.padEnd(14)} ${run.workflowName.padEnd(6)} ${run.status.padEnd(11)} ${String(age).padStart(3)} min`
      + ` | queued ${this.count(jobs, 'queued')}, running ${this.count(jobs, 'in_progress')}, done ${this.count(jobs,
        'completed')}${warn}`;
  }
  static main(args: string[]): number {
    const runs = JSON.parse(this.gh(['run', 'list', '--limit', '40', '--json',
      'databaseId,headBranch,status,conclusion,createdAt,workflowName'])) as Run[];
    const shown = runs.filter(r => r.status !== 'completed' || (args.includes('--all') && this.minutes(r.createdAt) < 60));
    console.log(shown.length ? shown.map(r => this.line(r)).join('\n') : 'Nothing running or queued.');
    return 0;
  }
}
if (import.meta.main) { process.exit(CiStatus.main(process.argv.slice(2))); }
