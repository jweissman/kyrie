import { describe, expect, it } from 'bun:test';
import { Battle } from '../src/arena';
import { Content } from '../src/content';
import type { CombatEvent, Fighter } from '../src/model';

// Command, the SRD's (doc/architecture/mission-22/srd-proving-cases.md, case 33): a first-level word of Law at one foe,
// a Will save at case 7's difficulty, and whoever fails falls prone and loses a turn (the SRD's "Fall", for a round),
// where Orsino's fifth-level Command made its foe flee the fight against a save of 20. This spec is its play-identity
// test.
const c = new Content('command');
const word = Content.abilities.find(a => a.id === 'command')!;
const hardy = (f: Fighter): Fighter => ({ ...f, level: 3, hp: 400, maxHp: 400 });
const cleric = (): Fighter => ({ ...hardy(c.character('cleric', 'cleric', 'fighters')), wisdom: 16,
  abilities: ['command'], maxSlots: [1], slots: [1], prepared: [['command']], ready: [['command']] });
const battle = (seed: string) => {
  const b = new Battle({ id: 'command', combatants: [hardy(c.character('warrior', 'warrior', 'fighters')), cleric(),
    hardy(c.character('warrior', 'g1', 'goblins')), hardy(c.character('warrior', 'g2', 'goblins'))],
  abilities: Content.abilities }, seed, 200);
  for (let i = 0; i < 40 && b.state.actor !== 'cleric'; i++) {
    b.step(b.legalCommands().find(x => x.ability === 'wait') ?? b.chosen());
  }
  return b;
};
const saves = (events: CombatEvent[]) => events.flatMap(e => e.type === 'save' && !e.against ? [e] : []);
describe('Command, by the SRD\'s numbers', () => {
  it('is a first-level enchantment of Law at one foe, saved against with Will at case 7\'s difficulty', () => {
    const e = word.effects[0] as { target?: string; save?: { kind: string }; status?: string; duration?: number };
    expect([word.spell, e.target, e.save?.kind, e.status, e.duration]).toEqual([
      { tradition: 'divine', level: 1, domain: 'law', school: 'enchantment', resistance: true }, 'enemy', 'will', 'prone',
      1]);
    const rolls = saves(battle('a').step({ actor: 'cleric', ability: 'command', target: 'g1' }));
    expect(rolls.map(r => r.type === 'save' && [r.target, r.difficulty])).toEqual([['g1', 15]]);
  });
  it('throws whoever fails down to lose its next turn, still in the fight, and spares whoever saves', () => {
    const seen = new Set<boolean>();
    for (const seed of ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']) {
      const b = battle(seed), cast = b.step({ actor: 'cleric', ability: 'command', target: 'g1' });
      const [roll] = saves(cast), failed = roll?.type === 'save' && !roll.success;
      seen.add(failed);
      // Its next turn, whether it comes in this round or the next, is lost, and only that one.
      const told = [...cast];
      for (let i = 0; i < 12; i++) { told.push(...b.step(b.legalCommands().find(x => x.ability === 'wait') ?? b.chosen())); }
      const lost = told.filter(e => e.type === 'skip' && e.actor === 'g1').length;
      const acted = told.some(e => e.type === 'action' && e.command.actor === 'g1');
      expect([lost, acted, b.state.departed ?? []]).toEqual([failed ? 1 : 0, true, []]);
    }
    expect([...seen].sort()).toEqual([false, true]);
  });
});
