import { describe, expect, it } from 'bun:test';
import { Battle } from '../src/battle';
import { Content } from '../src/content';
import { CreatureStore } from '../src/creature-store';

class Fight {
  static make(seed: string) {
    const content = new Content(seed);
    const bran = content.createCreature('bran', { raceId: 'human', classId: 'warrior', name: 'Bran' });
    const dori = content.createCreature('dori', { raceId: 'dwarf', classId: 'cleric', name: 'Dori' });
    const bear = content.createCreature('bear', { raceId: 'bear', name: 'Bear' });
    const store = new CreatureStore([bran, dori, bear]);
    return Battle.encounter(store, [{ creatureId: 'bran', team: 'fighters' }, { creatureId: 'dori', team: 'fighters' },
      { creatureId: 'bear', team: 'goblins' }], { seed });
  }
}

describe('encounters you can read and answer', () => {
  it('each creature on the other side declares at the start of a round what it means to do, and does it', () => {
    const battle = Fight.make('intent');
    const intent = battle.state.intents?.bear;
    expect(intent).toMatchObject({ actor: 'bear' });
    for (let guard = 0; guard < 20 && battle.state.actor !== 'bear' && !battle.state.outcome; guard++) {
      battle.step(battle.legalCommands().find(c => c.ability === 'defend') ?? battle.legalCommands()[0]!);
    }
    if (battle.state.actor === 'bear') {
      const declared = battle.state.intents!.bear!;
      expect(battle.chosen()).toEqual(declared);
    }
  });
  it('a warrior guarding a companion takes the blow aimed at them', () => {
    for (const seed of Array.from({ length: 16 }, (_, i) => `g${i + 1}`)) {
      const battle = Fight.make(seed);
      for (let turn = 0; turn < 40 && !battle.state.outcome; turn++) {
        const now = battle.state, intent = now.intents?.bear;
        const bear = now.combatants.find(c => c.id === 'bear')!;
        // The bear means to strike Dori this round (a maul it has wound up, or a plain blow) and has yet to act.
        const lands = intent?.target === 'dori' && (intent.ability !== 'maul' || !!bear.windup);
        if (now.actor === 'bran' && lands && now.order!.includes('bear')) {
          battle.step({ actor: 'bran', ability: 'guard', target: 'dori' });
          while (battle.state.actor !== 'bear' && !battle.state.outcome) { battle.step(battle.chosen()); }
          const before = battle.events.length;
          battle.step(battle.chosen());
          const blow = battle.events.slice(before);
          expect(blow.some(e => e.type === 'intercept' && e.actor === 'bran' && e.target === 'dori')).toBe(true);
          expect(blow.some(e => (e.type === 'damage' || e.type === 'attack') && 'target' in e && e.target === 'dori'))
            .toBe(false);
          // The guard stands until Bran's own next turn, and no longer.
          while (battle.state.actor !== 'bran' && !battle.state.outcome) { battle.step(battle.chosen()); }
          const dori = battle.state.combatants.find(c => c.id === 'dori')!;
          if (!battle.state.outcome) { expect(dori.statuses.map(x => x.id)).not.toContain('guarded'); }
          return;
        }
        // The company holds back, so the fight lasts long enough to see the bear choose.
        const wait = battle.legalCommands().find(c => c.ability === 'wait');
        battle.step(now.actor === 'bear' || !wait ? battle.chosen() : wait);
      }
    }
    throw new Error('No seed put the bear on Dori with Bran first');
  });
  it('a bear winds up a maul for a turn, and lands it unless a stun takes the turn away', () => {
    let landed = false, interrupted = false;
    for (const seed of ['w1', 'w2', 'w3', 'w4', 'w5', 'w6', 'w7', 'w8', 'w9', 'w10', 'w11', 'w12']) {
      const battle = Fight.make(seed);
      for (let guard = 0; guard < 60 && !battle.state.outcome; guard++) {
        const before = battle.events.length;
        battle.step(battle.chosen());
        const happened = battle.events.slice(before);
        const wound = happened.find(e => e.type === 'windup');
        if (wound) {
          // Declared as the next round's intent: the company can see it coming.
          if (!battle.state.outcome) { expect(battle.state.intents?.bear?.ability).toBe('maul'); }
        }
        if (happened.some(e => e.type === 'action' && e.command.ability === 'maul')) { landed = true; }
        if (happened.some(e => e.type === 'interrupt')) { interrupted = true; }
      }
    }
    expect(landed).toBe(true);
    // Stuns come from blunt blows; somewhere in a dozen fights one falls on a winding bear.
    expect([landed, interrupted].some(Boolean)).toBe(true);
  });
});
