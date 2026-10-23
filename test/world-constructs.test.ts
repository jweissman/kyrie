import { describe, expect, it } from 'bun:test';
import { ModuleParser } from '../src/lang/module-parser';
import { ModuleWriter } from '../src/lang/module-writer';
import { ModuleCompiler } from '../src/lang/module-compiler';
import { World } from '../src/lang/world';

class Source {
  static readonly vocabulary = `
  Kind place. Kind passage. Kind condition. Kind change. Kind thing. Kind group. Kind fact. Kind ability. Kind good. Kind waykind.
  Relation passageKind(passage, waykind). Measure travelTime(passage).
  Relation at(entity, place) exclusive. Relation connects(passage, place, place). Relation on(entity, passage).
  Relation guards(group, passage). Relation state(entity, condition) exclusive. Relation blocksWhen(entity, condition).
  Relation harmsWhen(entity, condition). Relation hurtsWith(entity, ability). Relation hurtsInto(entity, condition).
  Relation revealedBy(passage, fact). Relation needs(entity, entity). Relation changeOf(change, entity).
  Relation changeFrom(change, condition). Relation changeTo(change, condition). Relation changeKnows(change, fact).
  Relation consumes(change, good). Relation knows(group, fact). Relation probeable(entity).
  Kind verb. Relation suits(entity, verb). Entity looking: verb "looked over". Entity prodding: verb "prodded".
  Entity prying: verb "pried at". Entity listening: verb "listened at". Entity pushing: verb "pushed".
  Query together(a: group, b: group) means at(a, ?p) and at(b, ?p).
  Query alone(a: group) means not (at(a, ?p) and at(?other, ?p) and distinctFrom(a, ?other)).
  Relation distinctFrom(group, group).`;
  static module(body: string) {
    return ModuleParser.parse(`Module t "Test" {${this.vocabulary}\n${body}\n  Goal false.\n}`);
  }
  static facts(body: string) {
    const m = this.module(body);
    return new World(m).apply(m.initial).describe();
  }
}

describe('first-class world declarations lower to ordinary facts', () => {
  it('a passage connects both ways unless declared one way, and records hidden and needed conditions', () => {
    const facts = Source.facts(`
  Place a "A" is room. Place b "B" is room. Place c "C" is room. Entity secret: fact "S". Entity rope: thing "Rope".
  Passage door "the door" between a and b.
  Passage chute "the chute" between b and c one way hidden until secret needing rope.`);
    expect(facts).toEqual(expect.arrayContaining(['connects(door, a, b)', 'connects(door, b, a)', 'connects(chute, b, c)',
      'revealedBy(chute, secret)', 'needs(chute, rope)']));
    expect(facts).not.toContain('connects(chute, c, b)');
  });
  it('a thing starts in its first state; flags, hazards, changes and descriptions become facts and anchored claims', () => {
    const m = Source.module(`
  Place a "A" is room. Place b "B" is room. Passage shaft "the shaft" between a and b. Entity fall: ability "Fall".
  Entity rope: thing "Rope".
  Thing ladder "the ladder" on shaft {
    State rotten dangerous "Rotten.". State braced "Braced.". State broken blocking "Broken.".
    Hurts with fall when rotten then broken.
    Change brace "Brace {self}" from rotten to braced needing rope.
  }`);
    const facts = new World(m).apply(m.initial).describe();
    expect(facts).toEqual(expect.arrayContaining(['on(ladder, shaft)', 'state(ladder, rotten)', 'harmsWhen(ladder, rotten)',
      'blocksWhen(ladder, broken)', 'hurtsWith(ladder, fall)', 'hurtsInto(ladder, broken)', 'changeOf(ladder_brace, ladder)',
      'changeFrom(ladder_brace, rotten)', 'changeTo(ladder_brace, braced)', 'needs(ladder_brace, rope)']));
    // A ladder in a shaft, that can rot and break across it, can be looked at, listened at, pushed, pried at, prodded.
    expect(facts.filter(f => f.startsWith('suits('))).toEqual(['suits(ladder, listening)', 'suits(ladder, looking)',
      'suits(ladder, prodding)', 'suits(ladder, prying)', 'suits(ladder, pushing)']);
    expect(m.observations!.map(o => [o.id, o.anchor, o.place])).toEqual([['ladder__rotten', 'beside', 'shaft'],
      ['ladder__braced', 'beside', 'shaft'], ['ladder__broken', 'beside', 'shaft']]);
    expect(m.entities.find(e => e.id === 'ladder_brace')?.name).toBe('Brace {ladder}');
  });
  it('survives the bundle write-and-reparse round trip with the same facts, rules and claims', () => {
    const m = Source.module(`
  Place a "A" is room at 1, 2. Place b "B" is room. Passage door "the door" between a and b.
  Thing gate "the gate" on door { State shut blocking "Shut.". State open "Open.". Change lift "Lift {self}" from shut to open. }
  Event noise beside door when state(gate, open) "The gate creaks." then { Assert at(gate, b). }
  Objective leave when state(gate, shut) "Get the gate open.".`);
    const again = ModuleParser.parse(ModuleWriter.write(m));
    expect(new World(again).apply(again.initial).key()).toBe(new World(m).apply(m.initial).key());
    expect(again.rules).toEqual(m.rules);
    expect(again.observations).toEqual(m.observations);
    expect(again.objectives).toEqual(m.objectives);
    expect(again.entities.find(e => e.id === 'a')?.space?.grid).toEqual([1, 2]);
  });
  it('an event fires once, when its condition first holds', () => {
    const m = Source.module(`
  Place a "A" is room. Place b "B" is room. Entity g: thing "G".
  Initially Assert at(g, a).
  Event moved at b when at(g, b) "It arrived.".`);
    const rule = m.rules![0]!;
    let world = new World(m).apply(m.initial).apply([{ kind: 'assert', call: ModuleWriter.call('at', 'g', 'b') }]);
    expect(world.test(rule.when)).toBe(true);
    world = world.apply(rule.effects);
    expect(world.test(rule.when)).toBe(false);
    expect(rule.say).toBe('It arrived.');
  });
});

describe('existential variables', () => {
  it('join through shared variables and treat negation as "no binding exists"', () => {
    const m = Source.module(`
  Place a "A" is room. Place b "B" is room. Entity x: group "X". Entity y: group "Y". Entity z: group "Z".
  Initially Assert at(x, a). Initially Assert at(y, a). Initially Assert at(z, b).
  Initially Assert distinctFrom(x, y). Initially Assert distinctFrom(y, x).`);
    const world = new World(m).apply(m.initial);
    expect(world.test(ModuleWriter.call('together', 'x', 'y'))).toBe(true);
    expect(world.test(ModuleWriter.call('together', 'x', 'z'))).toBe(false);
    expect(world.test(ModuleWriter.call('alone', 'z'))).toBe(true);
    expect(world.test(ModuleWriter.call('alone', 'x'))).toBe(false);
    expect([...world.solve(ModuleWriter.call('at', '?who', 'a'), {})].map(b => b['?who']).sort()).toEqual(['x', 'y']);
  });
  it('answers a query asked of someone not yet known, binding them', () => {
    const m = Source.module(`Place a "A" is room. Entity x: group "X". Initially Assert at(x, a).`);
    const world = new World(m).apply(m.initial), asked = { kind: 'and' as const,
      left: ModuleWriter.call('at', '?g', 'a'), right: ModuleWriter.call('together', '?h', '?g') };
    expect(world.test(asked)).toBe(true);
    expect([...world.solve(asked, {})].map(b => b['?h'])).toEqual(['x']);
  });
});

describe('authoring errors the new constructs make detectable', () => {
  it.each([
    ['a change to an undeclared state', 'Place a "A" is room. Thing t "T" at a { State on "On.". Change c "C" from on to off. }', 'undeclared state'],
    ['a duplicate state', 'Place a "A" is room. Thing t "T" at a { State on "On.". State on "Again.". }', 'Duplicate state'],
    ['a passage that goes nowhere', 'Place a "A" is room. Passage p "P" between a and a.', 'two different places'],
    ['a hazard naming an unknown state', 'Place a "A" is room. Entity f: ability "F". Thing t "T" at a { State ok "Ok.". Hurts with f when bad then ok. }', 'undeclared state'],
  ])('rejects %s while parsing', (_label, body, message) => {
    expect(() => Source.module(body)).toThrow(message);
  });
  it.each([
    ['text naming an entity that does not exist', 'Place a "A" is room. Observe o at a when true "{ghost} waits.".', 'unknown entity {ghost}'],
    ['a claim beside something that is not a passage', 'Place a "A" is room. Observe o beside a when true "Here.".', 'beside anchor a'],
    ['an event near nothing', 'Place a "A" is room. Event e near nobody when true "Hi.".', 'near anchor nobody'],
    ['a rule comparing what nothing binds', 'Measure size(group). Rule r when size(?g) > 1 { Set size(?g) to 1. }',
      'Rule r compares ?g, which nothing in its condition binds'],
  ])('rejects %s when compiling', (_label, body, message) => {
    expect(() => new ModuleCompiler().validate(Source.module(body))).toThrow(message);
  });
});
