import { describe, expect, it } from 'bun:test';
import { readFileSync } from 'node:fs';
import { Canon } from '../src/canon/canon';
import { CombatProjection } from '../src/combat-projection';
import { Content } from '../src/content';
import { CreatureFidelity } from '../src/cli/srd-creature-fidelity';
import { Effects } from '../src/effects';
import { ItemCatalog } from '../src/item-catalog';
import { PlayerView } from '../src/presentation/player-view';
import { Fighting } from '../src/rules/fighting';
import { Tiny } from './support/tiny';

const content = new Content('drove-dog');
const saves = ['fortitude', 'reflex', 'will'];

describe("the drover's dog by the SRD dog's numbers", () => {
  it('keeps its body and bite at every rank', () => {
    for (const level of [1, 2, 5]) {
      const dog = content.createCreature(ItemCatalog.canon, `dog${level}`, { raceId: 'dog/drove', level });
      const fighter = CombatProjection.fighter(ItemCatalog.canon, dog, 'goblins');
      const scores = Effects.scores(fighter) as Record<string, number>;
      const attacker = Effects.combatant(fighter);
      const target = { ...attacker, armorAc: 4, dexterity: 10, modifiers: {}, fixedToHit: undefined };
      expect(dog.base).toMatchObject({ maxHp: 6, strength: 13, dexterity: 17, constitution: 15,
        intelligence: 2, wisdom: 12, charisma: 6 });
      expect(Fighting.armorClass(attacker)).toBe(6);
      expect(saves.map(k => Fighting.statMod(scores[Canon.rules.saveKinds[k]!]!) + fighter.level
        + Effects.saveModifier(fighter, k))).toEqual([4, 5, 1]);
      expect(attacker.weapon).toMatchObject({ damage: '1d4', attackBonus: 2, damageBonus: 1 });
      expect(Fighting.chance(attacker, target)).toBe(0.4);
      expect([1, 4].map(roll => Fighting.weaponDamage(attacker, roll, false).amount)).toEqual([2, 5]);
    }
  });

  it('keeps the existing dog interaction and clue in the authored drover situation', async () => {
    const source = readFileSync('data/goings-on/drover/situation.kyr', 'utf8');
    const text = source.replace('Entity party: group "Your company".', 'Company party "Your company" of 1 at green.');
    expect(text).not.toBe(source);
    const t = await Tiny.start(text);
    expect(t.campaign.readout.creatures.find(c => c.id === 'drover__dog_person')?.raceId).toBe('dog/drove');
    const pet = PlayerView.choices(t.campaign).find(c => c.choice.name === 'Make much of the grey dog');
    expect(pet).toBeDefined();
    const event = await t.session.leg(pet!.choice.id);
    expect(event.voiced?.some(v => /^pet\.dog\./.test(v.id))).toBe(true);
    expect(event.perceptions?.some(p => p.id === 'drover__dog_tells')).toBe(true);
    expect(t.world.related('knows').some(r => r.args[0] === 'party' && r.args[1] === 'drover__dog_mud')).toBe(true);
  });

  it('passes the sampled census without claiming its omitted senses', () => {
    expect(CreatureFidelity.row('dog/drove').grades).toEqual({
      structural: 'pass', resolution: 'pass', identity: 'unassessed',
    });
  });
});
