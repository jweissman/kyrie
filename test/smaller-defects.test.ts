import { describe, expect, it } from 'bun:test';
import { Content } from '../src/content';
import { Summoning } from '../src/summoning';
import { Expressions } from '../src/expressions';
import type { CombatEvent } from '../src/model';
import type { EffectContext } from '../src/effects';
import { PlaySession } from '../src/session/play-session';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { OverlayBundleSource } from '../src/campaign/overlay-bundle-source';
import { PlayerView } from '../src/presentation/player-view';
import { Membership } from '../src/campaign/membership';
import { CreatureStore } from '../src/creature-store';
import { ModuleParser } from '../src/lang/module-parser';
import { World } from '../src/lang/world';
import { ModuleAssembly } from '../src/campaign/module-assembly';

// The architecture review's A22, its smaller defects: a summon called after the oldest was sent away took the id of one
// still fighting (its probe combat-summon-ids), and a milestone met by others far from the company was worth the
// company's experience, where a module seen through so is not (its probe new-milestone-once); a group a recruit had
// left still counted one laid to rest among them; and an outcome called "resolved" was kept where its module's seeing
// through is.
class Smaller {
  static summoned() {
    const content = new Content('ids'), owner = content.character('warrior', 'owner', 'fighters');
    const fighters = [owner, content.character('warrior', 'foe', 'goblins')], events: CombatEvent[] = [];
    const context = { actor: owner, fighters, turn: 7, events, content, abilities: [], retreat: false, location: null,
      expressions: new Expressions('ids') } as EffectContext;
    for (let i = 0; i < Summoning.limit(owner) + 2; i++) {
      Summoning.call({ kind: 'summon', creature: 'wolf', target: 'self' } as never, owner, context);
    }
    return { fighters, events };
  }
  static files(): Record<string, string> {
    return {
      'ms/a.kyr': `Module a "Here" { Place field "Field" is wilderness. Place room "Room" is room within field at 0, 0.
        Company party "You" of 2 at room. Relation done(group).
        Action deed(actor: group, site: place) "Do the deed" { Requires at(actor, site) and at(actor, room)
          and not done(actor). Time 1 minute. On success { Assert done(actor). } }
        Milestone deed_done "did the deed" worth 100 when done(party). Goal false. }`,
      'ms/a.json': JSON.stringify({ version: 1, source: 'a.kyr', rules: ['world'], globals: ['party'],
        exports: { party: 'party' } }),
      'ms/b.kyr': `Module b "Yonder" { Place yonder "Yonder" is wilderness. Place far "Far away" is room within yonder
        at 0, 0. Relation happened(). Rule elsewhere when watch(clock) >= 3 and not happened() { Assert happened(). }
        Milestone far_off "something far away" worth 50 when happened(). Goal false. }`,
      'ms/b.json': JSON.stringify({ version: 1, source: 'b.kyr', rules: ['world'] }),
      'ms.campaign.json': JSON.stringify({ version: 1, name: 'ms', modules: [{ id: 'a', bundle: 'ms/a.json' },
        { id: 'b', bundle: 'ms/b.json' }], party: [{ name: 'Ama', raceId: 'human', classId: 'warrior' },
        { name: 'Bo', raceId: 'human', classId: 'cleric' }] }),
    };
  }
  static xp(s: PlaySession): number[] {
    const read = s.campaign.readout;
    return read.creatures.filter(c => read.partyIds.includes(c.id)).map(c => c.state.experience);
  }
}
describe('the smaller defects', () => {
  it('a summon has an id no other creature in the fight has had', () => {
    const { fighters, events } = Smaller.summoned(), ids = fighters.map(f => f.id);
    const called = events.filter(e => e.type === 'summon').map(e => (e as { target: string }).target);
    expect(new Set(ids).size).toBe(ids.length);
    expect(new Set(called).size).toBe(called.length);
  });
  it('a milestone met by others far from the company is not the company\'s', async () => {
    const source = new OverlayBundleSource(NodeBundleSource.shared, Smaller.files());
    const s = await PlaySession.start(source.resolve('ms.campaign.json'), 'seed', source);
    await s.perform(PlayerView.choices(s.campaign).find(c => c.choice.name === 'Do the deed')!.choice.id);
    expect(Smaller.xp(s)).toEqual([100, 100]);
    for (let i = 0; i < 4; i++) { await s.perform('wait'); }
    expect(s.campaign.world.test({ kind: 'call', name: 'achieved', args: ['b__far_off'] })).toBe(true);
    expect(Smaller.xp(s)).toEqual([100, 100]);
  }, 60000);
  it('a group a recruit left is who is in it now, not one laid to rest', () => {
    const module = ModuleParser.parse(`Module m "M" { Place yard "the yard" is room. Entity party: group "You".
      Relation at(entity, place). Relation memberOf(member, group). Relation joinedAs(member, group).
      Relation travelsWith(group, group). Relation fallen(member). Relation awake(member). Relation needsCare(member).
      Entity hal: group "Hal". Entity hal_m: member "Hal". Entity hob_m: member "Hob". }`);
    const content = new Content('left');
    const store = new CreatureStore(['hal_body', 'hob_body'].map(id => content.createCreature(id,
      { raceId: 'human', classId: 'warrior' })));
    module.entities.find(e => e.id === 'hal_m')!.creatureId = 'hal_body';
    module.entities.find(e => e.id === 'hob_m')!.creatureId = 'hob_body';
    const current = { partyIds: [] as string[], inhabitants: { hal: ['hal_body', 'hob_body'], party: [] as string[] } as
      Record<string, string[]>, enlisted: {} as Record<string, string>, released: [] as string[] };
    const base = [{ id: 'party', player: true, members: [] }, { id: 'hal', members: ['hal_body', 'hob_body'] }] as never[];
    let world = new World(module).apply(module.initial);
    world = Membership.enlist({ current, company: 'party', module, world, creatures: store }, 'hal', 'party');
    world = Membership.release({ current, company: 'party', module, world }, 'hob_m');
    Membership.depart({ current, company: 'party', module, world, creatures: store });
    expect(current.inhabitants.hal).toEqual(['hal_body']);
    expect(Membership.live(base, current).actors.find(a => (a as { id: string }).id === 'hal'))
      .toMatchObject({ members: ['hal_body'] });
  });
  it('an outcome is not called resolved', () => {
    const check = ModuleAssembly as unknown as { validate(...a: unknown[]): void };
    expect(() => check.validate([], [], [], { actors: [], creatures: [], pressures: [],
      outcomes: [{ id: 'resolved', predicate: { kind: 'boolean', value: true } }] })).toThrow('resolved');
  });
});
