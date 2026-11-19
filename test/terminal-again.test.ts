import { describe, expect, it } from 'bun:test';
import { readFileSync } from 'node:fs';
import { PlayTool } from '../src/cli/play-tool';
import { Runner } from '../src/cli/runner';
import { Terminal } from '../src/cli/terminal';
import type { Asking } from '../src/cli/terminal-input';

// After a death the terminal had printed the ending, "Begun again, the country is as it was…", and left (cold play 6,
// CL-53): it offers now what the page and the runner do, to begin again in the same country from its first day, and
// begun, the play goes on there. The sixth cold play's lines to the sealed vault, then its keeper fought at the
// terminal: Wenna dies of it.
const lines = readFileSync('doc/architecture/mission-22/cold/cold-6-lines.txt', 'utf8').split('\n').filter(Boolean);
describe('the terminal, after a death', () => {
  it('offers to begin again in this country, and begins again from its first day', async () => {
    const { journey } = await PlayTool.start(PlayTool.parse(['--world', 'iscoed', '--as', 'human/warrior/Wenna']));
    const runner = new Runner(journey.session), at = runner.said().at, attack = '{"act":"attack(region__s1_u_keeper)"}';
    for (const line of lines.slice(0, lines.indexOf(attack))) { await runner.ask(line); }
    const answers = ['attack(region__s1_u_keeper)'], said: string[] = [], asked: string[] = [];
    let ended = false;
    const input: Asking = { close() { /* nothing held */ }, async ask(prompt: string) {
      asked.push(prompt);
      if (!prompt.startsWith('>')) { return 'auto'; }
      if (said.some(l => l.includes('The story has ended.')) && !ended) { ended = true; return '1'; }
      return answers.shift() ?? 'q';
    } };
    const log = console.log, table = console.table;
    console.log = (...a: unknown[]) => { said.push(a.join(' ')); }; console.table = () => undefined;
    try { await Terminal.play(journey.session, { input }); } finally { console.log = log; console.table = table; }
    const end = said.findIndex(l => l.includes('The story has ended.'));
    expect(end).toBeGreaterThan(0);
    expect(said.slice(end).join('\n')).toContain('1. Begin again in this country, from its first day');
    // Begun again, the landing at the first light, and the terminal asks for the next choice there.
    const after = said.slice(end + 1).join('\n');
    expect(after).toContain('Down the drove road');
    expect(at).toBe('region__s1_green');
    expect(asked.filter(p => p.startsWith('>')).length).toBeGreaterThan(2);
  }, 240000);
});
