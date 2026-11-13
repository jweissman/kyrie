import { describe, expect, it } from 'bun:test';
import { Content } from '../../src/content';
import { CreatureStore } from '../../src/creature-store';
import { Battle } from '../../src/battle';
import { Tactics } from '../../src/tactics';
import { Canon } from '../../src/canon/canon';

// The odds a flight is drawn with are the odds it is rolled at: "sure, now" had failed at round five of a fight the
// company chose (round 10, S 105: R10-07, not reproduced). Over many fights in which the company tries again and again
// to get away, every try said to be sure gets away, and the odds said before each try are the rules' own for it (1 in
// 2, then 3 in 4, then sure), counted by the tries that failed. No world: the fight alone.
describe('getting away from a fight', () => {
  it('gets away whenever it was said to be sure, and is drawn at the odds it is rolled at', () => {
    const table = Canon.rules.combat.flee.map(o => Number(o.atMost) / Number(o.die.split('d')[1]));
    const wrong: string[] = [];
    let tries = 0, sure = 0;
    for (let seed = 0; seed < 60; seed++) {
      const content = new Content(`flee-${seed}`);
      const store = new CreatureStore([content.createCreature('ama', { raceId: 'human', classId: 'warrior' }),
        ...['w1', 'w2'].map(id => content.createCreature(id, { raceId: 'wolf' }))]);
      const battle = Battle.encounter(store, [{ creatureId: 'ama', team: 'fighters' },
        ...['w1', 'w2'].map(id => ({ creatureId: id, team: 'goblins' as const }))], { seed: `flee-${seed}` });
      let failed = 0;
      for (let turn = 0; turn < 60 && !battle.state.outcome; turn++) {
        const legal = battle.legalCommands(), flee = legal.find(c => c.ability === 'flee');
        if (battle.state.actor !== 'ama' || !flee) { battle.step(Tactics.choose(battle.state, legal)); continue; }
        const said = battle.flight(), expected = battle.opening ? 1 : table[failed] ?? 1;
        if (said !== expected) { wrong.push(`seed ${seed}: said ${said} after ${failed} failed, rules ${expected}`); }
        const events = battle.step(flee), away = events.some(e => e.type === 'flee' && e.success);
        tries++;
        if (said >= 1) { sure++; if (!away) { wrong.push(`seed ${seed}: sure, and held after ${failed} failed`); } }
        if (!away) { failed++; }
      }
    }
    expect(wrong).toEqual([]);
    expect([tries > 60, sure > 0]).toEqual([true, true]);
  });
});
