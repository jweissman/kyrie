import { describe, expect, it } from 'bun:test';
import { RunnerOffer } from '../src/cli/runner-offer';
import { readFileSync } from 'node:fs';
import { PlayTool } from '../src/cli/play-tool';
import { Runner, type Said } from '../src/cli/runner';
import { BeforeRooms } from './support/before-rooms';

// The sixth cold play of the golden route (mission-22/cold/cold-6-report.md), replayed with the keeper's corrected
// SRD strike bonuses and OR-1396's hit points: Wenna is paralysed and dies in the exchange the warning calls grave.
const lines = readFileSync('doc/architecture/mission-22/cold/cold-6-lines.txt', 'utf8').split('\n').filter(Boolean);
describe('the golden route, after the sixth cold play', () => {
  it('tells a fight the one who plays had no turn in, blow by blow', async () => {
    const { journey } = await PlayTool.start(PlayTool.parse(['--world', 'iscoed', '--as', 'human/warrior/Wenna']));
    const r = new Runner(BeforeRooms.set(journey.session));
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
    // OR-1396: the fatal exchange keeps each blow and its consequence in the ending.
    expect(told).toContain('slashing damage');
    expect(told).toContain('piercing damage');
    expect(told).toContain('Wenna falls.');
    expect(told).toContain('The fight is lost.');
  }, 240000);
  // CL-54, CL-55 and CL-56, by the play's own lines to the book read and the undercroft lit: talk says something and is
  // one step; the man with the black candle has a question; the dead man's clues make an aim; his book is read; and
  // the lettered flag is an aim only once it is seen.
  it('talks in one step, and makes aims of what is found once it is found', async () => {
    const { journey } = await PlayTool.start(PlayTool.parse(['--world', 'iscoed', '--as', 'human/warrior/Wenna']));
    const r = new Runner(BeforeRooms.set(journey.session)), at: (Said | undefined)[] = [];
    for (const line of lines.slice(0, 39)) { const s = await r.ask(line); at.push('error' in s ? undefined : s); }
    const text = (n: number) => at[n - 1]!.scene.lines.join(' '), aims = (n: number) => at[n - 1]!.aims?.map(a => a.text)
      .join(' ') ?? '';
    expect(text(10)).not.toContain('someone else');
    // Among the engine's four, after its own lead to follow the held drover's aim (the runner had dropped that row:
    // MT-18, every client the engine's four).
    expect(at[9]!.offer.primary.map(o => RunnerOffer.act(o))).toContain('drove__clerk_short_t');
    expect(text(18)).toBe('Owain turns to you.');
    expect(aims(24)).toContain('Find out where Joss Hatherly was the night he drowned.');
    // The man with the black candle's question is among the four as the ossuary is come into, while his warning stands
    // (the engaged frame: no talk to him first), so the play's own talk_to (line 31) is no longer offered.
    expect(at[29]!.offer.primary.map(o => RunnerOffer.act(o))).toContain('region__s1_u_raiser_who');
    expect(text(34)).toContain('the warding line is left out');
    expect(aims(38)).not.toContain('lettered');
    expect(aims(38)).not.toContain('Something is under the floor');
    expect(aims(39)).toContain('Something is under the floor');
    // And the letters are pressed only where they can be seen: not in the undercroft's pitch dark, once the candle is.
    const all = (n: number) => [...at[n - 1]!.offer.primary, ...at[n - 1]!.offer.rest].map(o => RunnerOffer.act(o));
    expect(all(38)).not.toContain('region__s1_u_flag_pressed(party,region__s1_u_undercroft)');
    expect(all(39)).toContain('region__s1_u_flag_pressed(party,region__s1_u_undercroft)');
    // CL-55: the receipt, then what is read in it, in its own capitals; not read out again on coming back; the body,
    // then what it says.
    const receipt = at[3]!.scene.lines;
    expect(receipt[0]).toStartWith('RECEIVED OF THE FOLK OF PORTHALEN,');
    expect(receipt[1]).toBe('A wheel; no wing.');
    expect(text(14)).not.toContain('A wheel; no wing.');
    expect(at[23]!.scene.lines[0]).toStartWith('Under the cloth: Joss Hatherly');
  }, 240000);
});
