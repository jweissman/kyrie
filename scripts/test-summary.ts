// What a test run did, from bun's JUnit report: how many passed, failed and were skipped, and which were skipped or
// failed, by file and line. Written to the run's summary on GitHub (GITHUB_STEP_SUMMARY) as well as printed, so a
// skipped spec is seen, not just counted. With --none-skipped, any skip fails the run: for a job that sets up all a
// spec needs (a browser, a long run) and so should skip nothing.
//   bun test --reporter=junit --reporter-outfile=junit.xml; bun scripts/test-summary.ts junit.xml [--none-skipped]
import { appendFileSync, existsSync, readFileSync } from 'node:fs';

interface Case { name: string; file: string; line: string; outcome: 'passed' | 'failed' | 'skipped'; seconds: number }
export class TestSummary {
  static cases(xml: string): Case[] {
    const cases: Case[] = [];
    for (const m of xml.matchAll(/<testcase\b([^>]*?)(\/>|>([\s\S]*?)<\/testcase>)/g)) {
      const attributes = m[1]!, body = m[3] ?? '';
      // bun reports a skipped block's hooks (beforeAll, afterAll) as cases with no name: they are named by their block.
      const name = this.attribute(attributes, 'name'), block = this.attribute(attributes, 'classname');
      cases.push({ name: name === '(unnamed)' ? `(a hook of "${block}")` : name, file: this.attribute(attributes, 'file'),
        line: this.attribute(attributes, 'line'), seconds: Number(this.attribute(attributes, 'time')) || 0,
        outcome: /<(failure|error)\b/.test(body) ? 'failed' : /<skipped\b/.test(body) ? 'skipped' : 'passed' });
    }
    return cases;
  }
  private static attribute(attributes: string, name: string): string {
    const value = new RegExp(`\\b${name}="([^"]*)"`).exec(attributes)?.[1] ?? '';
    return value.replace(/&apos;/g, '\'').replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&');
  }
  static markdown(cases: Case[], title: string): string {
    const [passed, failed, skipped] = (['passed', 'failed', 'skipped'] as const)
      .map(o => cases.filter(c => c.outcome === o).length);
    const lines = [`### ${title}`, '', `${passed} passed, ${failed} failed, ${skipped} skipped`];
    for (const outcome of ['failed', 'skipped'] as const) {
      const these = cases.filter(c => c.outcome === outcome);
      if (!these.length) { continue; }
      lines.push('', `**${outcome}**`, '', ...these.map(c => `- \`${c.file}${c.line ? `:${c.line}` : ''}\` ${c.name}`));
    }
    lines.push(...this.overBudget(cases));
    return `${lines.join('\n')}\n`;
  }
  // What is over the budget a spec should keep to, said and not yet failed (Mission 20's landing: one spec file had
  // taken 53 CI-minutes; mission-20/test-loop.md §5b): a test over three minutes, a file over ten.
  static readonly budget = { test: 180, file: 600 };
  private static overBudget(cases: Case[]): string[] {
    const files = new Map<string, number>();
    for (const c of cases) { files.set(c.file, (files.get(c.file) ?? 0) + c.seconds); }
    const tests = cases.filter(c => c.seconds > TestSummary.budget.test).sort((a, b) => b.seconds - a.seconds);
    const long = [...files].filter(([, s]) => s > TestSummary.budget.file).sort((a, b) => b[1] - a[1]);
    if (!tests.length && !long.length) { return []; }
    const m = TestSummary.min;
    return ['', `**over budget** (a test over ${m(TestSummary.budget.test)}, a file over ${m(TestSummary.budget.file)}:`
      + ' reported, not yet failed)', '', ...long.map(([f, s]) => `- \`${f}\` ${m(s)} in all`),
    ...tests.map(c => `- \`${c.file}${c.line ? `:${c.line}` : ''}\` ${m(c.seconds)}: ${c.name}`)];
  }
  private static min(seconds: number): string { return `${Math.round(seconds / 60)} min`; }
  static main(args: string[]): number {
    const file = args[0];
    if (!file) { console.error('usage: bun scripts/test-summary.ts junit.xml [--none-skipped] [--title t]'); return 2; }
    const at = args.indexOf('--title'), title = at >= 0 ? args[at + 1] ?? file : file;
    if (!existsSync(file)) {
      const text = `### ${title}\n\nNo report: the specs did not run (a step before them failed).\n`;
      console.log(text);
      if (process.env.GITHUB_STEP_SUMMARY) { appendFileSync(process.env.GITHUB_STEP_SUMMARY, text); }
      return 1;
    }
    const cases = this.cases(readFileSync(file, 'utf8')), text = this.markdown(cases, title);
    console.log(text);
    if (process.env.GITHUB_STEP_SUMMARY) { appendFileSync(process.env.GITHUB_STEP_SUMMARY, `${text}\n`); }
    if (!cases.length) { console.error('No tests were reported.'); return 1; }
    if (cases.some(c => c.outcome === 'failed')) { return 1; }
    return args.includes('--none-skipped') && cases.some(c => c.outcome === 'skipped') ? 1 : 0;
  }
}
if (import.meta.main) { process.exitCode = TestSummary.main(process.argv.slice(2)); }
