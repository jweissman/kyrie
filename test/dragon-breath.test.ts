import { describe, expect, it } from 'bun:test';
import { Battle } from '../src/arena';
import { Content } from '../src/content';
import type { CombatEvent, Fighter } from '../src/model';

// A dragon met as the old games meet one (the owner, 6 November): its breath a breath weapon over all its foes, each
// caught making a save vs breath by their own statistics (Orsino's save: d20 and the category's quality and level
// against a number), halved on a success, with no attack roll; the breath given back only after it recharges; and
// between breaths its claws and bite, each its own roll. A dragon of each lineage breathes its own (see menagerie).
const fight = (lineage: string, seed: string) => {
  const content = new Content(`dragon-${seed}`);
  const company: Fighter[] = [content.character('warrior', 'warrior', 'fighters'),
    content.character('cleric', 'cleric', 'fighters')].map(f => ({ ...f, level: 5, hp: 400, maxHp: 400 }));
  const dragon = { ...content.creature(`dragon/${lineage}_lineage`, 'dragon', 'goblins', 5), hp: 400, maxHp: 400 };
  return new Battle({ id: 'dragon', combatants: [...company, dragon], abilities: Content.abilities }, seed, 60);
};
const run = (b: Battle, rounds = 12) => {
  for (let i = 0; i < rounds * 3 && !b.state.outcome; i++) { b.step(b.chosen()); }
};
// The dragon's turns, each its events: what it did, and what came of it.
const turns = (events: CombatEvent[]) => {
  const out: CombatEvent[][] = [];
  for (const e of events) {
    if (e.type === 'action' && e.command.actor === 'dragon') { out.push([e]); continue; }
    if (e.type === 'action') { out.push([]); continue; }
    out.at(-1)?.push(e);
  }
  return out.filter(t => t[0]?.type === 'action');
};

describe('a dragon', () => {
  it('breathes over all its foes, each saving vs breath, with no roll to hit', () => {
    const b = fight('red', 'breath'); run(b);
    const breaths = turns(b.events).filter(t => t[0]!.type === 'action' && t[0]!.command.ability === 'breathe_fire');
    expect(breaths.length).toBeGreaterThan(0);
    for (const t of breaths) {
      expect(t.filter(e => e.type === 'attack')).toEqual([]);
      // One save vs breath for each caught (and, the breath being fire, one against catching alight).
      const saves = t.filter((e): e is Extract<CombatEvent, { type: 'save' }> => e.type === 'save' && e.kind === 'breath');
      expect(saves.map(s => s.target).sort()).toEqual(['cleric', 'warrior']);
      // A save made halves what it does.
      for (const s of saves) {
        const hurt = t.find(e => e.type === 'damage' && e.target === s.target && e.damageType === 'fire');
        expect(hurt?.type === 'damage' ? !!hurt.modifiers?.halfSave : undefined).toBe(!!s.success);
      }
    }
  });
  it('does not breathe again until its breath comes back, and claws twice and bites between', () => {
    const b = fight('red', 'routine'); run(b, 16);
    const mine = turns(b.events), at = mine.map((t, i) => [t, i] as const)
      .filter(([t]) => t[0]!.type === 'action' && t[0]!.command.ability === 'breathe_fire').map(([, i]) => i);
    for (let i = 1; i < at.length; i++) { expect(at[i]! - at[i - 1]!).toBeGreaterThanOrEqual(3); }
    const blows = mine.filter(t => t[0]!.type === 'action' && t[0]!.command.ability === 'melee');
    expect(blows.length).toBeGreaterThan(0);
    const weapons = blows[0]!.filter((e): e is Extract<CombatEvent, { type: 'attack' }> => e.type === 'attack').map(e => e.weapon);
    expect(weapons).toEqual(['claws', 'claws', 'bite']);
  });
  it('breathes cold as a white, through the same breath', () => {
    const b = fight('white', 'white'); run(b);
    const used = b.events.filter(e => e.type === 'action' && e.command.actor === 'dragon').map(e => e.type === 'action' ? e.command.ability : '');
    expect(used).toContain('breathe_cold');
    expect(b.events.some(e => e.type === 'save' && e.kind === 'breath')).toBe(true);
  });
});
