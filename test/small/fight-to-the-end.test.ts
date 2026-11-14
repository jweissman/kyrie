import { describe, expect, it } from 'bun:test';
import { Tiny } from '../support/tiny';
import { Foregone } from '../../src/ui/foregone';
import { Terminal } from '../../src/cli/terminal';
import { PlayerView } from '../../src/presentation/player-view';
import type { Asking } from '../../src/cli/terminal-input';

// A fight of some danger is the player's, turn by turn; once they judge it settled, one input presses it on to its end
// by the company's tactics, unless it turns (the owner's headless review, 14 November, HP-05: after calling Edda,
// `auto` played routine blows turn by turn, the whole table printed each time). A warrior of the third level and four
// rats: not foregone, and five turns of his played out one by one, so its first turn is asked.
const cellar = () => Tiny.start(`
  Place cellar "the cellar" is room at 0, 0.
  Person foe "a rat" at cellar { Role "what is in the cellar". Species rat. Numbers 4. }
  Company party "You" of 1 at cellar.`, { party: [{ name: 'Wat', raceId: 'human', classId: 'warrior', level: 3 }] });
const play = async (t: Tiny, answers: string[]) => {
  const asked: string[] = [], said: string[] = [], input = { close: () => undefined, ask: async (q: string) => {
    asked.push(q); return answers.shift() ?? 'q';
  } } as Asking;
  const log = console.log, table = console.table;
  console.log = (...a: unknown[]) => { said.push(a.join(' ')); }; console.table = () => undefined;
  try { await Terminal.play(t.session, { input }); } finally { console.log = log; console.table = table; }
  return { asked, said };
};

describe('a fight pressed on to its end', () => {
  it('asks no further turn once the player says end, unless it turns', async () => {
    const t = await cellar(), attack = PlayerView.choices(t.campaign).find(r => r.action.schema === 'attack')!.choice;
    expect(Foregone.is(t.screen, attack.id)).toBe(false);
    const { asked, said } = await play(t, [attack.name, 'end']);
    const turns = asked.filter(q => /^Action number/.test(q)), turned = said.filter(l => /fight turns/.test(l));
    expect(turns[0]).toContain(', end,');
    expect(turns.length).toBe(1 + turned.length);
    expect(said.some(l => /The fight is won/.test(l))).toBe(true);
  });
});
