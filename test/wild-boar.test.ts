import { ItemCatalog } from '../src/item-catalog';
import { describe, expect, it } from 'bun:test';
import { readFileSync } from 'node:fs';
import { BestiaryTool } from '../src/cli/bestiary-tool';
import { Canon } from '../src/canon/canon';
import { CombatProjection } from '../src/combat-projection';
import { Content } from '../src/content';
import { CreatureFidelity } from '../src/cli/srd-creature-fidelity';
import { Effects } from '../src/effects';
import { Fighting } from '../src/rules/fighting';
import { StatBlockCheck } from '../src/canon/stat-block-check';
import { CreatureVariants } from '../src/creature-variants';
import { PlayTool } from '../src/cli/play-tool';
import { PlayerView } from '../src/presentation/player-view';
import { ScreenModel } from '../src/ui/screen-model';
import type { Creature } from '../src/creature';

// The wild boar by the SRD boar's numbers (mission-22/srd-proving-cases.md, case 65): a breed of Orsino's boar, whose
// scores are rolled, so the breed says its own six (scores) in place of them. Twenty-five hit points at any rank; a
// gore of 1d8 and its Strength at the SRD's +4; AC 16 as Westernesse 5; saves of +6, +3 and +2; ferocity omitted. It is
// the old boar of the open country's wood meetings, met away from the roads, seen by its rooting before it warns.
const c = new Content('wild-boar');
const kinds = ['fortitude', 'reflex', 'will'];
const sheet = (k: Creature) => {
  const f = CombatProjection.fighter(ItemCatalog.canon, k, 'goblins'), scores = Effects.scores(f) as Record<string, number>;
  return { hp: k.base.maxHp, armour: Fighting.armorClass(Effects.combatant(f)), blow: f.equipment.weapon.damage, scores,
    saves: kinds.map(s => Fighting.statMod(scores[Canon.rules.saveKinds[s]!]!) + f.level
      + Effects.saveModifier(f, s)) };
};
describe('the wild boar by the SRD\'s numbers', () => {
  it('is the same boar whoever it is and at every rank: its own six scores, 25, AC 5, a gore of 1d8, +6, +3, +2', () => {
    const boars = [['a', 1], ['b', 1], ['c', 3], ['d', 6]] as const;
    const made = boars.map(([id, level]) => sheet(c.createCreature(ItemCatalog.canon, id, { raceId: 'boar/wild', level })));
    for (const m of made.slice(1)) { expect(m).toEqual(made[0]!); }
    expect(made[0]).toMatchObject({ hp: 25, armour: 5, blow: '1d8', saves: [6, 3, 2], scores: { strength: 15,
      dexterity: 10, constitution: 17, intelligence: 2, wisdom: 13, charisma: 4 } });
    // Orsino's boar rolls its scores, each one its own.
    const rolled = ['a', 'b', 'c'].map(id => c.createCreature(ItemCatalog.canon, id, { raceId: 'boar' }).base.strength);
    expect(new Set(rolled).size).toBeGreaterThan(1);
  });
  it('says all six scores, beside Hit Dice and with no attributes of its own, or is refused', () => {
    const wild = CreatureVariants.variations.wild!;
    expect(StatBlockCheck.refused(wild)).toEqual([]);
    for (const wrong of [{ ...wild, scores: { strength: 15 } }, { ...wild, attributes: { strength: 1 } },
      { ...wild, hitDice: undefined }, { ...wild, scores: { ...wild.scores!, wisdom: 0 } }]) {
      expect(StatBlockCheck.refused(wrong)).toContain('scores are the six, each a whole number of one or more, beside Hit Dice and no attributes');
    }
  });
  it('is a fight a lone warrior of the first level mostly loses, and one of the second mostly wins', () => {
    expect(BestiaryTool.won('boar/wild', 1, { warrior: 1, foes: 1 })).toBeLessThan(0.5);
    expect(BestiaryTool.won('boar/wild', 1, { warrior: 2, foes: 1 })).toBeGreaterThanOrEqual(0.5);
    expect(BestiaryTool.won('boar', 1, { warrior: 1, foes: 1 })).toBeGreaterThanOrEqual(0.9);
  }, 60000);
  it('passes the census in structure and resolution; ferocity is the one special it lacks', () => {
    const row = CreatureFidelity.row('boar/wild');
    expect(row.grades).toMatchObject({ structural: 'pass', resolution: 'pass' });
    expect(row.specials).toEqual({ verdict: 'differs', ours: '', theirs: 'ferocity' });
  });
  it('is the wood meeting\'s old boar, named by its base and its breed', () => {
    expect(readFileSync('data/generation/wild/meetings.kyrt', 'utf8'))
      .toContain('Species boar. Variant wild. Numbers 1. Level 1. Temperament territorial.');
  });
  it('warns where it roots, and a way across country out of its stretch is there to take instead', async () => {
    const { journey: j } = await PlayTool.start(PlayTool.parse(['--world', 'kite', '--as', 'human/warrior/Wenna']));
    const boar = 'region__wm20_boar', tract = j.campaign.world.one('at', boar)!;
    expect(Canon.creature(j.campaign.readout.creatures.find(x => x.id.includes('wm20_boar'))?.raceId ?? '').name)
      .toBe('Wild marsh boar');
    j.put('party', tract);
    await j.step('?Wait a while');
    expect(j.latest).toContain('It does not mean to go round you.');
    const choices = PlayerView.choices(j.campaign).map(x => x.choice.name);
    expect(choices).toContain('Attack a boar');
    expect(choices.some(n => n.startsWith('Take the way across country'))).toBe(true);
    // Engaged (OR-163), the frame keeps the ways out of the stretch beside the boar itself.
    const screen = ScreenModel.build(j.campaign);
    expect(screen.warned?.id).toBe(boar);
    expect(screen.exits.length).toBeGreaterThan(0);
  }, 60000);
});
