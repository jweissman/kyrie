import { describe, expect, it } from 'bun:test';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { OverlayBundleSource } from '../src/campaign/overlay-bundle-source';
import { ModuleParser } from '../src/lang/module-parser';
import { Bringing } from '../src/lang/bringing';
import { Journey } from '../src/session/journey';

// The Imbar author's friction 2 (M19-94): a fight that follows a failed act had to be someone parked nowhere and moved
// in by `On failure { Assert at(pinmen, pantry). }`, the room written out again in each act that could fail there.
// `Bring pinmen.` brings them to where the one who acts stands; `Bring watch to party.` to another, from a rule.
const site = `Module br "Brought" { Place hill "the Hill" is settlement.
  Place yard "the yard" is room within hill at 0, 0 outdoors. Place pantry "the pantry" is room within hill at 1, 0.
  Passage pantry_door "the pantry door" is door between yard and pantry.
  Company party "You" of 1 at yard.
  Person pinmen "the pin-men" nowhere { Role "the Jarl's pin-men". Ancestry human. Calling warrior. Level 1.
    Temperament territorial. }
  Person watchman "the watchman" nowhere { Role "a watchman with a lantern". Ancestry human. Peaceable. }
  Initially Assert onslaught(pinmen, pin_comes).
  Entity pin_comes: fact "The pin-men come at you out of the dark between the shelves.".
  Relation lifted(group). Relation rung(group).
  Action lift(actor: group, site: place) "Lift the pot from behind the throne" {
    Requires able(actor) and company(actor) and at(actor, site) and at(actor, pantry) and not lifted(actor).
    Time 1.
    On success { Assert lifted(actor). Assert assails(pinmen, actor). Bring pinmen. }
    On failure { Assert lifted(actor). Bring pinmen. }
  }
  Rule bell when hour(clock) >= 9 and not rung(party) { Assert rung(party). Bring watchman to party. }
  Observe yard_scene at yard when true "A yard of cobbles.".
  Goal false. }`;
describe('someone brought', () => {
  it('is a fact the act writes, and one rule of the module\'s own that moves them', () => {
    const module = ModuleParser.parse(site);
    const lift = module.actions.find(a => a.id === 'lift')!;
    expect(lift.failure).toContainEqual(Bringing.change('pinmen', 'actor'));
    expect(module.rules?.find(r => r.id === 'bell')?.effects).toContainEqual(Bringing.change('watchman', 'party'));
    expect(module.rules?.filter(r => r.id === Bringing.rule)).toHaveLength(1);
    expect(module.rules?.[0]?.id).toBe(Bringing.rule);
    expect(module.relations.filter(r => r.name === Bringing.relation)).toHaveLength(1);
  });
  it('is not lowered where nobody is brought', () => {
    const module = ModuleParser.parse('Module none "None" { Relation x(group). Goal false. }');
    expect([module.rules ?? [], module.relations.map(r => r.name)]).toEqual([[], ['x']]);
  });
  it('is refused from a rule that does not say to whom', () => {
    expect(() => ModuleParser.parse(`Module r "R" { Relation done(group).
      Rule bell when not done(party) { Assert done(party). Bring watchman. } Goal false. }`))
      .toThrow(/bell brings someone to where the one who acts stands, and nobody acts in it: say to whom/);
  });
  it('comes to where the company stands, and falls on it', async () => {
    const j = await start();
    expect(j.at('p__pinmen')).toBeUndefined();
    await j.play('^To the pantry$');
    const told = await j.play('Lift the pot from behind the throne');
    expect(j.at('p__pinmen')).toBe('p__pantry');
    expect(j.holds('bringing', 'p__pinmen', 'party')).toBe(false);
    expect(told).toMatch(/pin-men/);
  }, 60000);
  it('comes from a rule to whom it names', async () => {
    const j = await start();
    expect(j.at('p__watchman')).toBeUndefined();
    await j.play('=9:10');
    expect(j.at('p__watchman')).toBe('p__yard');
    await j.play('^To the pantry$', 'Wait');
    expect(j.at('p__watchman')).toBe('p__yard');
  }, 60000);
});
async function start(): Promise<Journey> {
  const source = new OverlayBundleSource(NodeBundleSource.shared, { 'br/site.kyr': site,
    'br/module.json': JSON.stringify({ version: 1, source: 'site.kyr', rules: ['world'], globals: ['party'],
      exports: { party: 'party' } }),
    'br.campaign.json': JSON.stringify({ version: 1, name: 'br', modules: [{ id: 'p', bundle: 'br/module.json' }],
      party: [{ name: 'Ama', raceId: 'human', classId: 'warrior' }] }) });
  return Journey.start(source.resolve('br.campaign.json'), 'br', { source });
}
