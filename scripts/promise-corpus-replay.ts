// The false-promise corpus replayed (see PromiseCorpus): each cold play's own lines played again on today's engine as
// they were meant (test/support/as-meant), every turn kept, and each of the play's cases checked on every turn.
import { readFileSync } from 'node:fs';
import { PlayTool } from '../src/cli/play-tool';
import { Runner, type Offered, type Said } from '../src/cli/runner';
import { AsMeant } from '../test/support/as-meant';
import { PromiseCorpus, type PromiseCase, type Turn } from './promise-corpus';

export interface CaseRead { id: string; play: string; status: 'still broken' | 'not seen'; at?: string }
export interface PlayRead { play: string; turns: number; refused: number; cases: CaseRead[] }

export class PromiseCorpusReplay {
  // Who each cold play played (their reports' headers; cold play 7 a dwarf cleric, its log).
  static readonly as: Record<string, string> = { 'cold-2': 'human/warrior/Wenna', 'cold-3': 'human/warrior/Wenna',
    'cold-4': 'human/warrior/Wenna', 'cold-5': 'elf/mage/Ilse/scholar', 'cold-6': 'human/warrior/Wenna',
    'cold-7': 'dwarf/cleric/Bryn', 'cold-8': 'human/warrior/Wenna' };
  static cases(file: string): PromiseCase[] {
    return (JSON.parse(readFileSync(file, 'utf8')) as { cases: PromiseCase[] }).cases;
  }
  static async play(play: string, cases: PromiseCase[]): Promise<PlayRead> {
    const lines = readFileSync(`doc/architecture/mission-22/cold/${play}-lines.txt`, 'utf8').split('\n').filter(Boolean);
    const { journey } = await PlayTool.start(PlayTool.parse(['--world', 'iscoed', '--as', this.as[play]!]));
    const r = new Runner(journey.session), turns: Turn[] = [];
    let before = r.said(), refused = 0, heard = PromiseCorpus.told(before).join(' ');
    for (const line of lines) {
      if (before.end) { break; }
      const after = await AsMeant.ask(r, line);
      if ('error' in after) { refused++; continue; }
      turns.push({ before, chosen: this.chosen(before, line), after, heard });
      heard += ` ${PromiseCorpus.told(after).join(' ')}`;
      before = after;
    }
    return { play, turns: turns.length, refused, cases: cases.map(c => this.read(c, turns)) };
  }
  private static read(c: PromiseCase, turns: Turn[]): CaseRead {
    for (const [i, t] of turns.entries()) {
      const why = PromiseCorpus.broken(c.check, t);
      if (why) { return { id: c.id, play: c.play, status: 'still broken', at: `turn ${i + 1}: ${why}` }; }
    }
    return { id: c.id, play: c.play, status: 'not seen' };
  }
  // The row the line took, where the scene before offered it (by its id or by what it does, its opener's rows too).
  private static chosen(s: Said, line: string): Offered | undefined {
    const act = (JSON.parse(line) as { act?: unknown }).act;
    if (typeof act !== 'string') { return undefined; }
    const all = [...s.offer.primary, ...s.offer.rest].flatMap(o => [o, ...o.opens ?? []]);
    return all.find(o => o.id === act) ?? all.find(o => o.does === act);
  }
  static async main(file: string): Promise<number> {
    const cases = this.cases(file), plays = [...new Set(cases.map(c => c.play))];
    for (const play of plays) {
      const read = await this.play(play, cases.filter(c => c.play === play));
      console.log(`${play}: ${read.turns} turns played, ${read.refused} lines refused`);
      for (const c of read.cases) { console.log(`  ${c.id} ${c.status}${c.at ? ` (${c.at})` : ''}`); }
    }
    return 0;
  }
}
