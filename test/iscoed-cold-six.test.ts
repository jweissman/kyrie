import { describe, expect, it } from 'bun:test';
import { readFileSync } from 'node:fs';
import { PlayTool } from '../src/cli/play-tool';
import { Runner, type Said } from '../src/cli/runner';

// The sixth cold play of the golden route (mission-22/cold/cold-6-report.md), replayed by its own lines: the keeper of
// the vault under Porthalen paralysed Wenna with its first blow, she never had a turn, and of four rounds she was told
// only the last (CL-51: "Wenna takes 6 piercing damage (0 HP left). Wenna falls. The fight is lost.").
const lines = readFileSync('doc/architecture/mission-22/cold/cold-6-lines.txt', 'utf8').split('\n').filter(Boolean);
describe('the golden route, after the sixth cold play', () => {
  it('tells a fight the one who plays had no turn in, blow by blow', async () => {
    const { journey } = await PlayTool.start(PlayTool.parse(['--world', 'iscoed', '--as', 'human/warrior/Wenna']));
    const r = new Runner(journey.session);
    let last: Said | undefined;
    for (const line of lines) {
      if (/^\{"act":"attack\(region__s1_u_keeper\)"\}$/.test(line)) {
        const s = await r.ask(line);
        if ('error' in s) { throw new Error(s.error); }
        last = s;
        break;
      }
      await r.ask(line);
    }
    const told = last!.scene.lines.join(' ');
    expect(told).toContain('Wenna cannot move.');
    expect(told).toContain('The keeper of the vault hits Wenna.');
    expect(told).toContain('The fight is lost.');
  }, 240000);
});
