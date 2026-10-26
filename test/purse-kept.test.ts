import { describe, expect, it } from 'bun:test';
import { Membership } from '../src/campaign/membership';
import { Content } from '../src/content';
import { CreatureStore } from '../src/creature-store';
import { ModuleParser } from '../src/lang/module-parser';
import { World } from '../src/lang/world';

// What a recruit had of their own stays theirs (the architecture review's A22): enlisting set their coin to nothing,
// though the comment beside it said it stayed theirs. It is put by while they are with the company, so the company
// cannot spend it, and is theirs again when they leave.
describe("a recruit's own coin", () => {
  it('is put by while they travel with the company, and theirs again when they leave', () => {
    const module = ModuleParser.parse(`Module m "M" { Place yard "the yard" is room. Entity party: group "You".
      Relation at(entity, place). Relation memberOf(member, group). Relation joinedAs(member, group).
      Relation travelsWith(group, group). Entity hal: group "Hal". Entity hal_m: member "Hal". }`);
    const content = new Content('purse'), hal = content.createCreature('hal_body', { raceId: 'human', classId: 'warrior' });
    hal.state.gold = 12;
    const store = new CreatureStore([hal]);
    module.entities.find(e => e.id === 'hal_m')!.creatureId = 'hal_body';
    const current = { partyIds: [] as string[], inhabitants: { hal: ['hal_body'], party: [] as string[] } as Record<string, string[]>,
      enlisted: {} as Record<string, string>, purses: undefined as Record<string, number> | undefined };
    const world = new World(module).apply(module.initial);
    const joined = Membership.enlist({ current, company: 'party', module, world, creatures: store }, 'hal', 'party');
    expect(store.get('hal_body').state.gold).toBe(0);
    expect(current.purses).toEqual({ hal_body: 12 });
    const back = Membership.depart({ current, company: 'party', module, world: joined, creatures: store });
    expect(back).toBeDefined();
    expect(store.get('hal_body').state.gold).toBe(12);
    expect(current.purses).toBeUndefined();
  });
});
