import { describe, expect, it } from 'bun:test';
import { Content } from '../../src/content';
import { CreatureStore } from '../../src/creature-store';
import { Battle } from '../../src/battle';
import { Terminal } from '../../src/cli/terminal';
import type { Asking, Picking, TerminalInput } from '../../src/cli/terminal-input';
import { CanonVocabulary } from '../../src/canon/canon-vocabulary';
import { LocalKinds } from '../../src/canon/local-catalog';
import { CombatProjection } from '../../src/combat-projection';

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
  it('offers and auto-chooses campaign-local consumables in typed and picked fights', async () => {
    const vocabulary = CanonVocabulary.scoped();
    vocabulary.install({ items: { local_tonic: vocabulary.item('context',
      { id: 'local_tonic', name: 'field tonic', base: { like: 'healing_potion' } }, new Set()) } });
    const content = new Content('terminal-scoped', undefined, vocabulary);
    const hero = content.createCreature('hero', { raceId: 'human', classId: 'warrior', gear: ['local_tonic'] });
    const foe = content.createCreature('foe', { raceId: 'wolf' });
    const battle = new Battle({ id: 'terminal-scoped', abilities: Content.abilities, vocabulary, combatants: [
      CombatProjection.fighter(hero, 'fighters', vocabulary), CombatProjection.fighter(foe, 'goblins', vocabulary),
    ] }, 'terminal-scoped');
    LocalKinds.reset();
    const log = console.log, table = console.table, lines: string[] = [];
    console.log = (...args: unknown[]) => { lines.push(args.join(' ')); };
    console.table = () => undefined;
    try {
      while (battle.state.actor !== 'hero') { battle.step(battle.legalCommands()[0]!); }
      const legal = battle.legalCommands();
      expect(legal.some(c => c.ability === 'item-local_tonic')).toBe(true);
      for (const answer of ['auto', 'end']) {
        let onward = false;
        const input: Asking = { ask: async () => answer, close: () => undefined };
        const chosen = await Terminal.command(battle.state, legal, input, { onward: () => { onward = true; }, battle });
        expect(chosen).toBeDefined();
        expect(onward).toBe(answer === 'end');
      }
      expect(lines.some(line => line.includes('field tonic'))).toBe(true);
      let asked = 0;
      const typed: Asking = { ask: async () => asked++ === 0 ? 'field tonic' : '1', close: () => undefined };
      expect((await Terminal.command(battle.state, legal, typed, { battle }))?.ability).toBe('item-local_tonic');
      for (const command of ['auto', 'end']) {
        let onward = false;
        const input: Picking = { ask: async () => null, close: () => undefined, pick: async () => ({ command }) };
        const chosen = await Terminal.command(battle.state, legal, input, { onward: () => { onward = true; }, battle });
        expect(chosen).toBeDefined();
        expect(onward).toBe(command === 'end');
      }
      const picked: Picking = { ask: async () => null, close: () => undefined, pick: async menu => {
        const row = [...menu.rows, ...menu.rest ?? []].find(item => item.label === 'field tonic');
        return { choice: row?.id ?? menu.rows[0]!.id };
      } };
      expect((await Terminal.command(battle.state, legal, picked, { battle }))?.ability).toBe('item-local_tonic');
    } finally { console.log = log; console.table = table; battle.close(); }
  });
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
