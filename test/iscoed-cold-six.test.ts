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
  // CL-54, CL-55 and CL-56, by the play's own lines to the book read and the undercroft lit: talk says something and is
  // one step; the man with the black candle has a question; the dead man's clues make an aim; his book is read; and
  // the lettered flag is an aim only once it is seen.
  it('talks in one step, and makes aims of what is found once it is found', async () => {
    const { journey } = await PlayTool.start(PlayTool.parse(['--world', 'iscoed', '--as', 'human/warrior/Wenna']));
    const r = new Runner(journey.session), at: (Said | undefined)[] = [];
    for (const line of lines.slice(0, 39)) { const s = await r.ask(line); at.push('error' in s ? undefined : s); }
    const text = (n: number) => at[n - 1]!.scene.lines.join(' '), aims = (n: number) => at[n - 1]!.aims?.map(a => a.text)
      .join(' ') ?? '';
    expect(text(10)).not.toContain('someone else');
    expect(at[9]!.offer.primary[0]!.id).toBe('drove__clerk_short_t');
    expect(text(18)).toBe('Owain turns to you.');
    expect(aims(24)).toContain('Find out where Joss Hatherly was the night he drowned.');
    expect(at[30]!.offer.primary.map(o => o.id)).toContain('region__s1_u_raiser_who');
    expect(text(34)).toContain('the warding line is left out');
    expect(aims(38)).not.toContain('lettered');
    expect(aims(38)).not.toContain('Something is under the floor');
    expect(aims(39)).toContain('Something is under the floor');
    // CL-55: the receipt, then what is read in it, in its own capitals; not read out again on coming back; the body,
    // then what it says.
    const receipt = at[3]!.scene.lines;
    expect(receipt[0]).toStartWith('RECEIVED OF THE FOLK OF PORTHALEN,');
    expect(receipt[1]).toBe('A wheel; no wing.');
    expect(text(14)).not.toContain('A wheel; no wing.');
    expect(at[23]!.scene.lines[0]).toStartWith('Under the cloth: Joss Hatherly');
  }, 240000);
});
