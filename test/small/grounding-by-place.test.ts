import { describe, expect, it } from 'bun:test';
import { ModuleCompiler, ModuleParser, ModuleWriter, World, type Change, type Operator } from '../../src/lang';
import { ActionSchemas } from '../../src/campaign/action-schemas';
import { KeptGroundings } from '../../src/campaign/kept-groundings';
import { Operators } from '../../src/campaign/operators';
import { Planner } from '../../src/campaign/planner';

// What a schema asks of the place the actor stands at, and apart from it (SchemaAsks, OR-1600): a schema whose need
// is unmet grounds to nothing, having read only what told it so, so that a move re-grounds only the schemas whose
// reads it changed. The kept groundings are held to grounding every action afresh in every world of a seeded walk of
// moves and of changes to what the schemas read (a door opened and shut, someone arriving and leaving, a lamp lit and
// put out, a thing dropped and taken up, a coin had and spent); and a move that changes nothing a schema reads leaves
// it ungrounded, its operators the same objects.
const module = new ModuleCompiler().instantiate(ModuleParser.parse(`Module rooms "Rooms" {
  Kind group. Kind place. Kind passage. Kind thing.
  Relation at(entity, place) exclusive. Relation connects(passage, place, place). Relation shut(passage).
  Relation lit(place). Relation portable(thing). Relation owns(group, thing). Relation coin(thing).
  Relation sells(group, thing). Relation keeper(group). Relation dangerous(place). Relation distinct(entity, entity).
  Entity party: group "Party". Entity bryn: group "Bryn".
  Entity hall: place "Hall". Entity yard: place "Yard". Entity cellar: place "Cellar".
  Entity door: passage "Door". Entity trap: passage "Trap". Entity gate: passage "Gate".
  Entity cup: thing "Cup". Entity lamp: thing "Lamp". Entity penny: thing "Penny". Entity ale: thing "Ale".
  Query here(g: group, p: place) means at(g, p) and lit(p).
  Initially Assert at(party, hall). Initially Assert at(bryn, yard). Initially Assert keeper(bryn).
  Initially Assert connects(door, hall, yard). Initially Assert connects(door, yard, hall).
  Initially Assert connects(trap, hall, cellar). Initially Assert connects(trap, cellar, hall).
  Initially Assert connects(gate, yard, cellar). Initially Assert shut(trap). Initially Assert lit(hall).
  Initially Assert portable(cup). Initially Assert portable(lamp). Initially Assert at(cup, yard).
  Initially Assert coin(penny). Initially Assert sells(bryn, ale). Initially Assert at(ale, yard).
  Action go(actor: group, way: passage, origin: place, destination: place) "Go by {way}" {
    Requires at(actor, origin) and connects(way, origin, destination) and not shut(way).
    On success { Assert at(actor, destination). }
  }
  Action open(actor: group, way: passage, site: place) "Open {way}" {
    Requires at(actor, site) and connects(way, site, ?beyond) and shut(way).
    On success { Retract shut(way). }
  }
  Action take(actor: group, thing: thing, site: place) "Take {thing}" {
    Requires here(actor, site) and at(thing, site) and portable(thing).
    On success { Assert owns(actor, thing). }
  }
  Action greet(actor: group, other: group, site: place) "Greet {other}" {
    Requires at(actor, site) and at(other, site) and keeper(other) and distinct(actor, other).
  }
  Action buy(actor: group, ware: thing, seller: group, money: thing, site: place) "Buy {ware}" {
    Requires at(actor, site) and at(seller, site) and sells(seller, ware) and owns(actor, money) and coin(money)
      and not dangerous(site).
    On success { Assert owns(actor, ware). }
  }
  Action rest(actor: group, site: place) "Rest" {
    Requires at(actor, site) and lit(site) and not dangerous(site).
  }
  Action count(actor: group, money: thing) "Count {money}" { Requires owns(actor, money) and coin(money). }
  Goal false.
}`), 'rooms').module;
const call = ModuleWriter.call;
const assert = (name: string, ...args: string[]): Change => ({ kind: 'assert', call: call(name, ...args) });
const retract = (name: string, ...args: string[]): Change => ({ kind: 'retract', call: call(name, ...args) });

// A seeded walk of changes (a move, as often as all the rest; a door, someone, a light, a thing, a coin, danger), and
// every schema grounded afresh at every binding of its parameters' types (the actor the party's), each tested whole.
class Rooms {
  static readonly places = ['hall', 'yard', 'cellar'];
  static readonly labels = ActionSchemas.labels(module);
  static next(seed: { n: number }, n: number): number {
    seed.n = (Math.imul(seed.n, 1103515245) + 12345) >>> 0;
    return seed.n % n;
  }
  static change(world: World, seed: { n: number }): Change[] {
    const p = this.places[this.next(seed, 3)]!, kinds: (() => Change[])[] = [
      this.move.bind(this, world, 'party', p), this.move.bind(this, world, 'party', p),
      this.move.bind(this, world, 'party', p), this.flip.bind(this, world, ['shut', 'trap']),
      this.flip.bind(this, world, ['shut', 'gate']), this.move.bind(this, world, 'bryn', p),
      this.flip.bind(this, world, ['lit', p]), this.flip.bind(this, world, ['owns', 'party', 'penny']),
      this.drop.bind(this, world, p), this.flip.bind(this, world, ['dangerous', p])];
    return kinds[this.next(seed, kinds.length)]!().filter(c => c.kind === 'assert' || world.holds(World.key(c.call)));
  }
  private static move(world: World, who: string, to: string): Change[] {
    return [retract('at', who, world.one('at', who)!), assert('at', who, to)];
  }
  private static flip(world: World, [name, ...args]: string[]): Change[] {
    return [world.holds(World.key(call(name!, ...args))) ? retract(name!, ...args) : assert(name!, ...args)];
  }
  private static drop(world: World, at: string): Change[] {
    return [retract('owns', 'party', 'cup'), retract('at', 'cup', world.one('at', 'cup') ?? at),
      assert('at', 'cup', at)];
  }
  static afresh(world: World): string[] {
    return module.actions.flatMap(schema => this.bindings(schema)
      .map(b => ActionSchemas.instance(schema, b, this.labels))
      .filter(op => Planner.applicable(world, op)).map(op => op.id));
  }
  private static bindings(schema: Operator): Record<string, string>[] {
    let rows: Record<string, string>[] = [{}];
    for (const p of schema.parameters ?? []) {
      const pool = p.name === 'actor' ? ['party'] : module.entities.filter(e => e.type === p.type).map(e => e.id);
      rows = rows.flatMap(row => pool.map(id => ({ ...row, [p.name]: id })));
    }
    return rows;
  }
}
const fresh = (world: World) => Rooms.afresh(world);

describe('a move re-grounds only the schemas whose reads it changed', () => {
  it('keeps every grounding equal to grounding afresh, over seeded walks of moves and of what the schemas read', () => {
    let checked = 0;
    for (const seed of [1, 7, 42, 1126, 2027]) {
      const r = { n: seed }, operators = new Operators(module);
      let world = new World(module).apply(module.initial);
      for (let step = 0; step < 120; step++) {
        expect({ seed, step, ids: operators.applicable(world, 'party').map(o => o.id) })
          .toEqual({ seed, step, ids: fresh(world) });
        checked++;
        world = world.apply(Rooms.change(world, r));
      }
    }
    expect(checked).toBe(600);
  });
  it('leaves a schema whose reads a move did not change as it was: not grounded again, the same operators', () => {
    const grounded: string[] = [], of = KeptGroundings.prototype.of;
    KeptGroundings.prototype.of = function (this: KeptGroundings, ...args: Parameters<KeptGroundings['of']>) {
      const [, schema, , ground] = args;
      return of.call(this, args[0], schema, args[2], () => { grounded.push(schema.id); return ground(); });
    };
    try {
      const operators = new Operators(module), start = new World(module).apply(module.initial);
      const rich = start.apply([assert('owns', 'party', 'penny')]);
      const before = operators.applicable(rich, 'party');
      const counted = before.filter(o => o.schema === 'count');
      expect(counted.map(o => o.id)).toEqual(['count(party,penny)']);
      // Poor, the company cannot buy anywhere: a need apart from the place, unmet, and read without where it stands.
      const poor = start, moved = poor.apply([retract('at', 'party', 'hall'), assert('at', 'party', 'yard')]);
      const walking = new Operators(module);
      walking.applicable(poor, 'party');
      grounded.length = 0;
      const there = walking.applicable(moved, 'party');
      expect(grounded).not.toContain('buy');
      expect(grounded).not.toContain('count');
      expect(grounded).toEqual(expect.arrayContaining(['greet', 'go', 'rest']));
      expect(there.map(o => o.id)).toEqual(fresh(moved));
      // Rich again where it stands, and moved: the coin it counts is the same operator, never grounded again.
      const richHere = moved.apply([assert('owns', 'party', 'penny')]);
      const counting = operators.applicable(richHere, 'party').filter(o => o.schema === 'count');
      grounded.length = 0;
      const back = richHere.apply([retract('at', 'party', 'yard'), assert('at', 'party', 'hall')]);
      const after = operators.applicable(back, 'party').filter(o => o.schema === 'count');
      expect(grounded).not.toContain('count');
      expect(after.length).toBe(1);
      expect(after[0]).toBe(counting[0]!);
      expect(after[0]).toBe(counted[0]!);
    } finally { KeptGroundings.prototype.of = of; }
  });
  it('asks a schema whose need of the place is unmet only what it asks of the place it moved to', () => {
    const operators = new Operators(module), start = new World(module).apply(module.initial);
    // Nothing to take in the dark: take asks here(actor, site) of a place, which the yard is not (unlit).
    const yard = start.apply([retract('at', 'party', 'hall'), assert('at', 'party', 'yard')]);
    const ids = (w: World) => operators.applicable(w, 'party').map((o: Operator) => o.id);
    expect(ids(yard)).not.toContain('take(party,cup,yard)');
    const lit = yard.apply([assert('lit', 'yard')]);
    expect(ids(lit)).toContain('take(party,cup,yard)');
    expect(ids(lit)).toEqual(fresh(lit));
  });
});
