import { describe, expect, it } from 'bun:test';
import { Battle } from '../src/arena';
import { Content } from '../src/content';
import type { CombatEvent, Fighter } from '../src/model';

// Hold Person, the SRD's (doc/architecture/mission-22/srd-proving-cases.md, case 18), and the shaking off it runs by
// (ShakingOff): one humanoid held, a Will save to negate, and on each turn the held one loses to it a new save, a
// success ending it. This spec is its play-identity test.
const c = new Content('hold');
const hold = Content.abilities.find(a => a.id === 'hold_person')!;
const hardy = (f: Fighter, level = 5): Fighter => ({ ...f, level, hp: 400, maxHp: 400 });
const cleric = (): Fighter => ({ ...hardy(c.character('cleric', 'cleric', 'fighters')), wisdom: 18,
  abilities: ['hold_person'], maxSlots: [0, 1], slots: [0, 1], prepared: [[], ['hold_person']], ready: [[], ['hold_person']] });
// The cleric's hold on a human warrior, and the fight on to its end or forty turns, everyone else waiting.
const held = (seed: string) => {
  const b = new Battle({ id: 'hold', combatants: [cleric(), hardy(c.character('warrior', 'g1', 'goblins'))],
    abilities: Content.abilities }, seed, 200);
  for (let i = 0; i < 20 && b.state.actor !== 'cleric'; i++) { b.step(b.legalCommands().find(x => x.ability === 'wait') ?? b.chosen()); }
  const events: CombatEvent[] = [...b.step(b.legalCommands().find(x => x.ability === 'hold_person')!)];
  for (let i = 0; i < 20 && !b.state.outcome; i++) {
    events.push(...b.step(b.legalCommands().find(x => x.ability === 'wait' || x.ability === 'defend') ?? b.chosen()));
  }
  return events;
};
const saves = (events: CombatEvent[]) => events.flatMap(e => e.type === 'save' && e.target === 'g1' && !e.against ? [e] : []);
describe('Hold Person, by the SRD\'s numbers', () => {
  it('is a second-level enchantment of Law on one humanoid, saved with Will, and saved again', () => {
    const e = hold.effects[0]!;
    expect([hold.spell!.level, hold.spell!.school, e.target, e.targetTrait, e.save?.kind, e.save?.again])
      .toEqual([2, 'enchantment', 'enemy', 'humanoid', 'will', true]);
  });
  it('lets the held one save again on each turn it loses, at the first save\'s difficulty, and a success frees it', () => {
    let freed = 0;
    for (const seed of ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']) {
      const events = held(seed), rolls = saves(events);
      if (!rolls.length || rolls[0]!.type !== 'save' || rolls[0]!.success) { continue; }
      // Held: every save after the first is a turn's effort, at the same difficulty, until one succeeds and it ends.
      const first = rolls[0]!, later = rolls.slice(1);
      expect(later.length).toBeGreaterThan(0);
      expect(later.every(r => r.type === 'save' && first.type === 'save' && r.difficulty === first.difficulty
        && r.kind === 'will')).toBe(true);
      const won = later.findIndex(r => r.type === 'save' && r.success);
      if (won >= 0) {
        freed++;
        expect(later.length).toBe(won + 1);
        expect(events.some(e => e.type === 'expire' && e.target === 'g1' && e.detail === 'paralyzed')).toBe(true);
      }
    }
    expect(freed).toBeGreaterThan(0);
  });
});
