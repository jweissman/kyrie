import { describe, expect, it } from 'bun:test';
import { Content } from '../../src/content';
import { CreatureStore } from '../../src/creature-store';
import { Battle } from '../../src/battle';
import { Terminal } from '../../src/cli/terminal';
import type { TerminalInput } from '../../src/cli/terminal-input';

// The terminal's fight lists its moves in one order from turn to turn, a strike first and the rest by name, and names
// whoever fights, never an id: the list had changed its order each turn, so the key that was Cleave became Flee, and
// "region__s2_u_rats_person_2" stood in the table (cold review A, 12 November: T24-14); and the strike first was by
// its name, so "Melee Attack" came fifth (13 Nov). No world: the fight alone.
const said = async (battle: Battle, reverse: boolean): Promise<string[]> => {
  const lines: string[] = [], log = console.log, table = console.table;
  console.log = (...a: unknown[]) => { lines.push(a.join(' ')); };
  console.table = (rows: unknown) => { lines.push(JSON.stringify(rows)); };
  try {
    const legal = battle.legalCommands();
    await Terminal.command(battle.state, reverse ? [...legal].reverse() : legal, { ask: async () => 'q' } as unknown as TerminalInput);
  } finally { console.log = log; console.table = table; }
  return lines;
};

describe('the terminal\'s fight', () => {
  it('lists the moves in one order, a strike first, and names the fighters, never by id', async () => {
    const content = new Content('terminal-fight'), rats = 'region__s2_u_rats_person_2';
    const store = new CreatureStore([content.createCreature('ama', { raceId: 'human', classId: 'warrior' }),
      content.createCreature(rats, { raceId: 'wolf' })]);
    const battle = Battle.encounter(store, [{ creatureId: 'ama', team: 'fighters' }, { creatureId: rats, team: 'goblins' }],
      { seed: 'terminal-fight' });
    while (battle.state.actor !== 'ama') { battle.step(battle.legalCommands()[0]!); }
    const [one, other] = [await said(battle, false), await said(battle, true)];
    const moves = (lines: string[]) => lines.filter(l => /^\d+\. /.test(l));
    expect(moves(one).length).toBeGreaterThan(3);
    expect(moves(other)).toEqual(moves(one));
    expect(moves(one)[0]).toMatch(/^1\. Melee Attack/);
    expect(one.join('\n')).not.toContain(rats);
  });
});
