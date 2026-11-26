import { ItemCatalog } from '../src/item-catalog';
import { describe, expect, it } from 'bun:test';
import { Battle } from '../src/battle';
import { Content } from '../src/content';
import { CreatureStore } from '../src/creature-store';
import { CombatTelling } from '../src/ui/combat-telling';
import type { Creature } from '../src/creature';
import type { CombatEvent } from '../src/model';

// Death Ward, what the SRD's wards (doc/architecture/mission-22/srd-proving-cases.md, case 8): no level is taken of the
// warded (a wraith's touch, any enervate), told as an immunity, and the dark's harm (necrotic: the Negative's law
// among it, GT-01) does not touch them. A wraith at a warded hero, the hero only waiting.
const c = new Content('death-ward');
const hero = (ward: boolean): Creature => {
  const x = c.createCreature(ItemCatalog.canon, 'hero', { raceId: 'human', classId: 'warrior', level: 5 }, 'hero');
  return { ...x, base: { ...x.base, maxHp: 300 }, state: { ...x.state, hp: 300,
    conditions: ward ? [{ id: 'death_ward', remaining: 999 }] : [] } };
};
const touched = (ward: boolean, seed = 'wraith') => {
  const s = new CreatureStore(ItemCatalog.canon, [hero(ward), c.createCreature(ItemCatalog.canon, 'wraith', { raceId: 'wraith', level: 3 }, 'wraith')]);
  const b = Battle.encounter(s, [{ creatureId: 'wraith', team: 'goblins' }, { creatureId: 'hero', team: 'fighters' }],
    { seed, maxTurns: 400 });
  // Until a touch has landed (a save against it, or a level gone): the drain is a touch that can miss since the
  // SRD's touches (cases 35 and 52), and the first two at this seed do.
  const drains = () => b.events.filter(e => e.type === 'action' && e.command.ability === 'energy_drain').length;
  const landed = () => b.events.some(e => e.type === 'save' && e.kind === 'drain')
    || s.get('hero').state.conditions.some(x => x.id === 'drained');
  for (let i = 0; i < 400 && !b.state.outcome && !landed() && drains() < 12; i++) {
    b.step(b.state.actor === 'hero' ? b.legalCommands().find(x => x.ability === 'wait')! : b.chosen());
  }
  const events = b.events, state = b.state;
  b.close();
  return { events, state, drained: s.get('hero').state.conditions.find(x => x.id === 'drained')?.remaining ?? 0 };
};
const on = (events: CombatEvent[], type: string) => events.filter(e => e.type === type && 'target' in e
  && e.target === 'hero');
describe('Death Ward', () => {
  it('keeps every level of the warded through a wraith\'s touch, told as an immunity', () => {
    const { events, state, drained } = touched(true);
    expect(events.filter(e => e.type === 'action' && e.command.ability === 'energy_drain').length).toBeGreaterThan(0);
    expect(drained).toBe(0);
    const kept = on(events, 'save').filter(e => e.type === 'save' && e.kind === 'drain');
    expect(kept.length).toBeGreaterThan(0);
    expect(kept.every(e => e.type === 'save' && e.immune && e.against === 'drained')).toBe(true);
    expect(CombatTelling.exchanges(events, state).map(t => t.text).join(' ')).toContain('cannot be drained.');
    // The unwarded hero, the same wraith and dice, is drained.
    expect(touched(false).drained).toBeGreaterThan(0);
  });
  // Its necrotic ward is held where the dark's harm is a place's (the Negative's law: test/small/planar-laws).
  it('wards the dark\'s harm whole, and keeps Orsino\'s bonus to the death save', () => {
    const ward = Content.statuses.death_ward!;
    expect(ward.modifiers).toMatchObject({ saves: { death: 5 }, resistances: { necrotic: 1 }, immune: ['drain'] });
  });
});
