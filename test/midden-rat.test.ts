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

// The midden rat by the SRD dire rat's numbers (mission-22/srd-proving-cases.md, case 64): a breed of the catalog's
// rat, the old buck rat that keeps the corn-store's nest under the first town. Five hit points at any rank; a bite of
// 1d4 at the SRD's +4; AC 15 as Westernesse 6; saves of +3, +5 and +3; its filth fever a disease save against 11 on a
// bite, coming on after 1d3 days on the world's clock as Fevered, 1d3 off Dexterity and Constitution for a day.
const c = new Content('midden-rat');
const kinds = ['fortitude', 'reflex', 'will'];
const sheet = (k: Creature) => {
  const f = CombatProjection.fighter(ItemCatalog.canon, k, 'goblins'), scores = Effects.scores(f) as Record<string, number>;
  return { hp: k.base.maxHp, armour: Fighting.armorClass(Effects.combatant(f)), blow: f.equipment.weapon.damage,
    saves: kinds.map(s => Fighting.statMod(scores[Canon.rules.saveKinds[s]!]!) + f.level
      + Effects.saveModifier(f, s)) };
};
// One bitten, hardy enough to take bites, and frail in the Constitution a disease is saved by.
const bitten = (): Fighter => ({ ...c.character('warrior', 'w', 'fighters'), hp: 400, maxHp: 400, constitution: 3 });
const field = (f: Fighter, seed: string): EffectContext => ({ fighters: [f], turn: 1, events: [],
  expressions: new Expressions(seed), lapse: AbilityUse.lapse.bind(AbilityUse), content: c, abilities: [],
  retreat: false, location: null });
// A fight until a bite has given the fever, and the one it bit as the fight leaves them.
const bite = (seed: string): Fighter | undefined => {
  const b = new Battle({ id: 'nest', combatants: [bitten(), c.creature('rat/midden', 'g', 'goblins', 2)],
    abilities: Content.abilities }, seed, 200);
  for (let i = 0; i < 40; i++) {
    const w = b.state.combatants.find(f => f.id === 'w')!;
    if (w.statuses.some(s => s.id === 'filth_fever')) { return w; }
    b.step(b.state.actor === 'w' ? b.legalCommands().find(x => x.ability === 'wait') ?? b.chosen() : b.chosen());
  }
  return undefined;
};
describe('the midden rat by the SRD\'s numbers', () => {
  it('is the same rat at every rank: 5, AC 6, a bite of 1d4, saves +3, +5, +3', () => {
    const ranks = [1, 2, 5].map(level => sheet(c.createCreature(ItemCatalog.canon, `r${level}`, { raceId: 'rat/midden', level })));
    expect(ranks[1]).toEqual(ranks[0]!);
    expect(ranks[2]).toEqual(ranks[0]!);
    expect(ranks[0]).toMatchObject({ hp: 5, armour: 6, blow: '1d4', saves: [3, 5, 3] });
  });
  it('gives its fever where its bite lands and the save against 11 fails, coming on in one to three days', () => {
    const struck = 'abcdefghijkl'.split('').map(bite).filter((w): w is Fighter => !!w);
    expect(struck.length).toBeGreaterThan(0);
    for (const w of struck) {
      const fever = w.statuses.find(s => s.id === 'filth_fever')!;
      expect(fever.clock).toBe('world-time');
      expect([144, 288, 432]).toContain(fever.remaining);
    }
    // The save it was given on: a disease's, against 11.
    const gnaw = Canon.creature('rat/midden').statistics!.riders!.gnaw![0]!;
    expect(gnaw.kind === 'apply' && gnaw.save).toEqual({ kind: 'disease', difficulty: { kind: 'literal', value: 11 } });
  });
  it('comes on as Fevered when its days are out: Dexterity and Constitution down for a day, and back', () => {
    const w: Fighter = { ...bitten(), constitution: 12, statuses: [{ id: 'filth_fever', remaining: 1, clock: 'world-time' }] };
    const ctx = field(w, 'fever'), before = Effects.scores(w);
    Effects.advance(w, 'world-time', ctx);
    const fevered = w.statuses.find(s => s.id === 'fevered')!;
    expect(fevered).toMatchObject({ remaining: 144, clock: 'world-time' });
    expect(fevered.amount).toBeGreaterThanOrEqual(1);
    expect(fevered.amount).toBeLessThanOrEqual(3);
    const now = Effects.scores(w);
    expect([now.dexterity, now.constitution]).toEqual([before.dexterity - fevered.amount!,
      before.constitution - fevered.amount!]);
    for (let i = 0; i < 144; i++) { Effects.advance(w, 'world-time', ctx); }
    expect(w.statuses).toEqual([]);
  });
  it('is cured before it comes on by what cures a disease, and the fever it has laid is not', () => {
    const cure = (Canon.abilities.cure_disease!.effects ?? []).find(e => e.kind === 'remove')!;
    if (cure.kind !== 'remove') { throw new Error('Cure Disease removes'); }
    expect([Effects.removes(cure, 'filth_fever'), Effects.removes(cure, 'fevered')]).toEqual([true, false]);
  });
  it('is the old buck rat in the corn-store\'s nest under the first town, named by its base and its breed', () => {
    const nest = readFileSync('data/generation/town/undertown.kyrt', 'utf8');
    expect(nest).toContain('Species rat. Variant midden. Numbers 1. Level 2. Temperament territorial. Lair {t}_u_nest.');
    expect(nest).not.toContain('great_rat');
  });
  it('passes the census in structure and resolution, its disease carried; the great rat does not', () => {
    const row = CreatureFidelity.row('rat/midden');
    expect(row.grades).toEqual({ structural: 'pass', resolution: 'pass', identity: 'proved' });
    expect(row.specials.verdict).toBe('exact');
    expect(CreatureFidelity.row('rat/great').grades.resolution).toBe('fail');
  });
});
