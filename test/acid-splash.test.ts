import { describe, expect, it } from 'bun:test';
import { Battle } from '../src/battle';
import { Canon } from '../src/canon/canon';
import { Content } from '../src/content';
import { CreatureStore } from '../src/creature-store';
import { MechanicsText } from '../src/presentation/mechanics-text';
import { SpellSelection } from '../src/rules/spell-selection';
import { SpellResistance } from '../src/rules/spell-resistance';
import { ChoiceList } from '../src/ui/choice-list';
import { CombatModel } from '../src/ui/combat-model';
import { Creation } from '../web/engine/creation';
import { Laboratory } from '../scripts/laboratory';
import { Tiny } from './support/tiny';

const fight = (seed: string) => {
  const content = new Content(seed);
  const mage = content.createCreature('mage', { raceId: 'human', classId: 'mage', traits: ['conjurer'] });
  const pixie = content.createCreature('pixie', { raceId: 'pixie' });
  const battle = Battle.encounter(new CreatureStore([mage, pixie]),
    [{ creatureId: 'mage', team: 'fighters' }, { creatureId: 'pixie', team: 'goblins' }], { seed });
  for (let i = 0; i < 40 && battle.state.actor !== 'mage'; i++) {
    battle.step(battle.legalCommands().find(c => c.ability === 'wait') ?? battle.chosen());
  }
  return battle;
};

describe('Acid Splash', () => {
  it('is learned by a conjurer and added to generated enemy casters without changing their leveled picks', () => {
    const conjurer = Canon.traits.conjurer!;
    const shown = Creation.catalog().callings.find(c => c.id === 'mage')!.specializations.find(s => s.id === 'conjurer')!;
    expect(shown.spells!.find(s => s.id === 'acid_splash')).toMatchObject({ name: 'Acid Splash', level: 0 });
    expect(SpellSelection.plan(conjurer).cantrips).toContain('acid_splash');
    const prepared = SpellSelection.prepare(conjurer, 1, SpellSelection.ranked('srd-world-sample'));
    expect(prepared).toContain('acid_splash');
    expect(prepared.filter(id => Canon.abilities[id]?.spell?.level !== 0)).toEqual(['summon_vermin']);
    expect(Content.abilities.find(a => a.id === 'acid_splash')!.spell)
      .toEqual({ tradition: 'arcane', level: 0, school: 'conjuration' });
  });
  it('reaches the hostile mage placed in the generated first-town undercroft', async () => {
    const t = await Tiny.start(Laboratory.text(), { seed: 'a' });
    const raiser = t.campaign.readout.creatures.find(c => c.id === 'lab__low_u_raiser_person');
    expect(raiser?.classId).toBe('mage');
    expect(raiser?.base.abilities).toContain('acid_splash');
    expect(raiser?.base.abilities).toContain('disrupt_undead');
  });
  it('does not describe an acid burn it cannot cause', () => {
    const splash = Content.abilities.find(a => a.id === 'acid_splash')!;
    const effect = splash.effects[0]!;
    expect(MechanicsText.full(splash)).not.toMatch(/acid burn/i);
    expect(MechanicsText.triggered({ ...effect, triggers: undefined }).map(([id]) => id)).toContain('acid_burn');
  });
  it('offers a ranged touch at a foe, dealing only 1d3 acid on a hit even through spell resistance', () => {
    let hits = 0, misses = 0;
    for (const seed of 'abcdefghijklmnop') {
      const battle = fight(seed);
      expect(battle.state.actor).toBe('mage');
      expect(SpellResistance.of(battle.state.combatants.find(c => c.id === 'pixie')!)).toBeGreaterThan(0);
      const spells = ChoiceList.combat(CombatModel.build(battle)).find(c => c.id === 'spells')!;
      expect(JSON.stringify(spells)).toContain('Acid Splash');
      const command = battle.legalCommands().find(c => c.ability === 'acid_splash' && c.target === 'pixie');
      expect(command).toBeDefined();
      const before = JSON.stringify(battle.state.combatants.find(c => c.id === 'mage')!.ready);
      const events = battle.step(command!);
      const touch = events.find(e => e.type === 'attack' && e.touch);
      expect(touch).toMatchObject({ touch: 'ranged', target: 'pixie' });
      const hit = touch?.type === 'attack' && touch.success;
      const damage = events.flatMap(e => e.type === 'damage' && e.target === 'pixie' ? [e] : []);
      expect(damage.length).toBe(hit ? 1 : 0);
      for (const e of damage) {
        expect(e).toMatchObject({ damageType: 'acid' });
        expect([1, 2, 3]).toContain(e.rolled);
      }
      expect(events.some(e => (e.type === 'resist' || e.type === 'save') && e.target === 'pixie')).toBe(false);
      expect(events.some(e => e.type === 'status' && e.target === 'pixie' && e.detail === 'acid_burn')).toBe(false);
      expect(JSON.stringify(battle.state.combatants.find(c => c.id === 'mage')!.ready)).toBe(before);
      if (hit) { hits++; } else { misses++; }
    }
    expect(hits).toBeGreaterThan(0);
    expect(misses).toBeGreaterThan(0);
  });
});
