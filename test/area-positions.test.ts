import { describe, expect, it } from 'bun:test';
import { Battle } from '../src/arena';
import { Content } from '../src/content';
import { ItemCatalog } from '../src/item-catalog';
import { Positions } from '../src/rules/positions';
import { Tactics } from '../src/tactics';
import type { CombatEvent, Command, Fighter } from '../src/model';

// Areas keep where everyone stands (the owner, 7 November): a fireball or a dragon's breath catches whoever is where
// it is let loose, friend or foe, and where it is aimed decides who that is. Each side stands in a formation: who
// fights hand to hand in the press where the two fronts meet, who fights from a distance (a bow, a mage) in their
// side's rear.
const c = new Content('areas');
const hardy = (f: Fighter, level = 5): Fighter => ({ ...f, level, hp: 500, maxHp: 500 });
const bow = (f: Fighter): Fighter => ({ ...f, equipment: { ...f.equipment, weapon: ItemCatalog.weapon('shortbow') } });
// Fireball of the third level, as the SRD has it; saved against by Reflex.
const mage = (): Fighter => ({ ...hardy(c.character('mage', 'mage', 'fighters'), 7), abilities: ['fireball'],
  maxSlots: [0, 0, 1], slots: [0, 0, 1], prepared: [[], [], ['fireball']], ready: [[], [], ['fireball']] });
const battle = (combatants: Fighter[], seed: string) =>
  new Battle({ id: 'areas', combatants, abilities: Content.abilities }, seed, 200);
// Steps the fight until `who` is to act, everyone else of the company waiting and the other side doing as it would.
const until = (b: Battle, who: string) => {
  for (let i = 0; i < 40 && b.state.actor !== who; i++) {
    const legal = b.legalCommands();
    b.step(legal.find(x => x.ability === 'wait') ?? b.chosen());
  }
  expect(b.state.actor).toBe(who);
};
const hurt = (events: CombatEvent[], type: string) =>
  [...new Set(events.flatMap(e => e.type === 'damage' && e.damageType === type ? [e.target] : []))].sort();
const zone = (b: Battle, id: string) => Positions.zone(b.state.combatants.find(f => f.id === id)!, b.state.combatants);
const aim = (b: Battle, ability: string, at: string): Command => b.legalCommands()
  .find(x => x.ability === ability && zone(b, x.target) === zone(b, at))!;

describe('where everyone stands', () => {
  it('is set by formation: hand to hand in the press, a bow or a mage behind; the rear steps up when the front falls', () => {
    const fighters = [hardy(c.character('warrior', 'warrior', 'fighters')), mage(),
      hardy(c.character('warrior', 'g1', 'goblins')), bow(hardy(c.character('ranger', 'archer', 'goblins', 'goblin')))];
    expect(fighters.map(f => Positions.zone(f, fighters))).toEqual(['press', 'fighters', 'press', 'goblins']);
    const fallen = fighters.map(f => f.id === 'warrior' ? { ...f, hp: 0 } : f);
    expect(Positions.zone(fallen[1]!, fallen)).toBe('press');
  });
});

describe('a fireball', () => {
  const company = () => [hardy(c.character('warrior', 'warrior', 'fighters')), mage(),
    hardy(c.character('warrior', 'g1', 'goblins')), hardy(c.character('warrior', 'g2', 'goblins')),
    bow(hardy(c.character('ranger', 'archer', 'goblins', 'goblin')))];
  it('aimed into the press catches the company\'s own warrior with the foes there, and spares those elsewhere', () => {
    const b = battle(company(), 'press');
    until(b, 'mage');
    const into = aim(b, 'fireball', 'g1');
    expect(b.legalCommands().filter(x => x.ability === 'fireball').length).toBe(2);
    const events = b.step(into);
    expect(hurt(events, 'fire')).toEqual(['g1', 'g2', 'warrior']);
    // Each caught saves against it, the friend too; the mage and the archer behind are not touched.
    expect(events.filter(e => e.type === 'save' && e.kind === 'reflex').map(e => e.type === 'save' ? e.target : '').sort())
      .toEqual(['g1', 'g2', 'warrior']);
  });
  it('aimed over the press into the foe\'s rear catches only the archer there', () => {
    const b = battle(company(), 'rear');
    until(b, 'mage');
    expect(hurt(b.step(aim(b, 'fireball', 'archer')), 'fire')).toEqual(['archer']);
  });
  it('is not thrown where it would burn a friend, when there is somewhere else to throw it', () => {
    const b = battle(company(), 'choice');
    until(b, 'mage');
    const casts = b.legalCommands().filter(x => x.ability === 'fireball');
    const best = casts.sort((x, y) => Tactics.score(b.state, y) - Tactics.score(b.state, x))[0]!;
    expect(best.target).toBe('archer');
  });
});

describe('a dragon\'s breath', () => {
  const lair = () => [hardy(c.character('warrior', 'warrior', 'fighters')), mage(),
    { ...c.creature('dragon/red_lineage', 'dragon', 'goblins', 5), hp: 500, maxHp: 500 },
    hardy(c.character('warrior', 'kin', 'goblins'))];
  it('breathed into the press catches the warrior and the dragon\'s own fellow beside it, not the mage behind', () => {
    const b = battle(lair(), 'cone-press');
    until(b, 'dragon');
    const events = b.step(aim(b, 'breathe_fire', 'warrior'));
    expect(hurt(events, 'fire')).toEqual(['kin', 'warrior']);
    expect(events.some(e => e.type === 'attack' && e.actor === 'dragon')).toBe(false);
  });
  it('breathed at the company\'s rear passes through the press: everyone between, its fellow too, and never itself', () => {
    const b = battle(lair(), 'cone-rear');
    until(b, 'dragon');
    expect(hurt(b.step(aim(b, 'breathe_fire', 'mage')), 'fire')).toEqual(['kin', 'mage', 'warrior']);
  });
  it('alone, breathes on the company where the cone reaches them all', () => {
    const alone = lair().filter(f => f.id !== 'kin'), b = battle(alone, 'cone-alone');
    until(b, 'dragon');
    const breaths = b.legalCommands().filter(x => x.ability === 'breathe_fire');
    const best = breaths.sort((x, y) => Tactics.score(b.state, y) - Tactics.score(b.state, x))[0]!;
    expect(best.target).toBe('mage');
  });
});
