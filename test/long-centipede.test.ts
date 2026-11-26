import { ItemCatalog } from '../src/item-catalog';
import { describe, expect, it } from 'bun:test';
import { readFileSync } from 'node:fs';
import { AbilityUse } from '../src/ability-use';
import { Battle } from '../src/arena';
import { Canon } from '../src/canon/canon';
import { CombatProjection } from '../src/combat-projection';
import { Content } from '../src/content';
import { CreatureFidelity } from '../src/cli/srd-creature-fidelity';
import { Effects, type EffectContext } from '../src/effects';
import { Expressions } from '../src/expressions';
import { Fighting } from '../src/rules/fighting';
import type { Creature } from '../src/creature';
import type { Fighter } from '../src/model';

// The long centipede by the SRD Medium monstrous centipede's numbers (mission-22/srd-proving-cases.md, case 63): a
// breed of Orsino's centipede, the old drain's under the first town. Four hit points at any rank; a bite of 1d6 at the
// SRD's +2; AC 14 as Westernesse 7; saves of +2, +2 and +0; its poison a save against 10 or 1d3 off Dexterity (Numbed,
// a day on the world's clock), and a watch later a second save or 1d3 more, which accrues.
const c = new Content('long-centipede');
const kinds = ['fortitude', 'reflex', 'will'];
const sheet = (k: Creature) => {
  const f = CombatProjection.fighter(ItemCatalog.canon, k, 'goblins'), scores = Effects.scores(f) as Record<string, number>;
  return { hp: k.base.maxHp, armour: Fighting.armorClass(Effects.combatant(f)), blow: f.equipment.weapon.damage,
    saves: kinds.map(s => Fighting.statMod(scores[Canon.rules.saveKinds[s]!]!) + f.level + Effects.saveModifier(f, s)),
    abilities: k.base.abilities };
};
// One bitten, hardy enough to take bites, and frail in the Constitution a poison is saved by.
const bitten = (): Fighter => ({ ...c.character('warrior', 'w', 'fighters'), hp: 400, maxHp: 400, constitution: 3 });
const field = (f: Fighter, seed: string): EffectContext => ({ fighters: [f], turn: 1, events: [],
  expressions: new Expressions(seed), lapse: AbilityUse.lapse.bind(AbilityUse), content: c, abilities: [],
  retreat: false, location: null });
// A fight until the centipede's bite has laid its venom, and the one it bit as the fight leaves them.
const bite = (seed: string): Fighter | undefined => {
  const b = new Battle({ id: 'drain', combatants: [bitten(), c.creature('centipede/long', 'g', 'goblins', 2)],
    abilities: Content.abilities }, seed, 200);
  for (let i = 0; i < 40; i++) {
    const w = b.state.combatants.find(f => f.id === 'w')!;
    if (w.statuses.some(s => s.id === 'centipede_venom')) { return w; }
    if (b.state.actor === 'w') { b.step(b.legalCommands().find(x => x.ability === 'wait') ?? b.chosen()); }
    else { b.step(b.chosen()); }
  }
  return undefined;
};
describe('the long centipede by the SRD\'s numbers', () => {
  it('is the same centipede at every rank: 4, AC 7, a bite of 1d6, saves +2, +2, +0, without Orsino\'s venom', () => {
    const ranks = [1, 2, 5].map(level => sheet(c.createCreature(ItemCatalog.canon, `k${level}`, { raceId: 'centipede/long', level })));
    expect(ranks[1]).toEqual(ranks[0]!);
    expect(ranks[2]).toEqual(ranks[0]!);
    expect(ranks[0]).toMatchObject({ hp: 4, armour: 7, blow: '1d6', saves: [2, 2, 0] });
    expect(ranks[0]!.abilities).not.toContain('venomous_bite');
  });
  it('lays its venom where its bite lands: Numbed unless saved, and the venom working on, both on the world\'s clock', () => {
    const struck = 'abcdefgh'.split('').map(bite).filter((w): w is Fighter => !!w);
    expect(struck.length).toBeGreaterThan(0);
    for (const w of struck) {
      expect(w.statuses.find(s => s.id === 'centipede_venom')).toMatchObject({ remaining: 1, clock: 'world-time' });
      const numbed = w.statuses.find(s => s.id === 'numbed');
      if (!numbed) { continue; }
      expect(numbed).toMatchObject({ remaining: 144, clock: 'world-time' });
      expect(numbed.amount).toBeGreaterThanOrEqual(1);
      expect(Effects.scores(w).dexterity).toBe(Math.max(1, bitten().dexterity - numbed.amount!));
    }
    expect(struck.some(w => w.statuses.some(s => s.id === 'numbed'))).toBe(true);
  });
  it('works on a watch later, a second save or more off Dexterity added to what it took, and all of it back in a day', () => {
    const w: Fighter = { ...bitten(), statuses: [{ id: 'numbed', remaining: 144, clock: 'world-time', amount: 2 },
      { id: 'centipede_venom', remaining: 1, clock: 'world-time' }] };
    const ctx = field(w, 'watch');
    Effects.advance(w, 'world-time', ctx);
    const save = ctx.events.find(e => e.type === 'save');
    expect(save).toMatchObject({ kind: 'poison', difficulty: 10 });
    const numbed = w.statuses.filter(s => s.id === 'numbed');
    expect(numbed.length).toBe(1);
    const more = numbed[0]!.amount! - 2;
    expect(save!.success ? more === 0 : more >= 1 && more <= 3).toBe(true);
    // A second dose is a day from now; none, and the first runs on.
    expect(numbed[0]!.remaining).toBe(save!.success ? 143 : 144);
    expect(w.statuses.some(s => s.id === 'centipede_venom')).toBe(false);
    for (let i = 0; i < 144; i++) { Effects.advance(w, 'world-time', ctx); }
    expect(w.statuses).toEqual([]);
    expect(Effects.scores(w).dexterity).toBe(bitten().dexterity);
  });
  it('is ended before it works by what ends a poison by its kind (Cleanse), and what it laid stays', () => {
    const cleanse = (Canon.abilities.cleanse!.effects ?? []).find(e => e.kind === 'remove')!;
    if (cleanse.kind !== 'remove') { throw new Error('Cleanse removes'); }
    expect([Effects.removes(cleanse, 'centipede_venom'), Effects.removes(cleanse, 'numbed')]).toEqual([true, false]);
  });
  it('is the old drain\'s centipede under the first town, named by its base and its breed', () => {
    const drain = readFileSync('data/generation/town/undertown.kyrt', 'utf8');
    expect(drain).toContain('Species centipede. Variant long. Numbers 1. Level 2. Temperament territorial. Lair {t}_u_drain.');
    expect(drain).not.toContain('great_centipede');
  });
  it('passes the census in structure and resolution, its poison carried; Orsino\'s great centipede does not', () => {
    const row = CreatureFidelity.row('centipede/long');
    expect(row.grades).toEqual({ structural: 'pass', resolution: 'pass', identity: 'proved' });
    expect(row.specials.verdict).toBe('exact');
    expect(CreatureFidelity.row('centipede/great').grades.resolution).toBe('fail');
  });
});
