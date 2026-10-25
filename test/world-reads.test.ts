import { describe, expect, it } from 'bun:test';
import { ModuleParser } from '../src/lang/module-parser';
import { ModuleCompiler } from '../src/lang/module-compiler';
import { ModuleWriter } from '../src/lang/module-writer';
import { CampaignTick } from '../src/campaign/campaign-tick';
import { Reads } from '../src/lang/reads';
import { World } from '../src/lang/world';

// What a world shares with the worlds forked from it, and how a reading of some names is held to a later world:
// what lets a watch's work follow only what has changed (Mission 15).
const module = new ModuleCompiler().instantiate(ModuleParser.parse(`Module roads "Roads" {
  Kind group. Kind place. Kind good. Relation at(group, place) exclusive. Relation route(place, place).
  Relation open(place). Relation alarmed(group). Measure quantity(group, good).
  Entity a: group "A". Entity b: group "B". Entity x: place "X". Entity y: place "Y". Entity z: place "Z".
  Entity coin: good "Coin".
  Query near(g: group, p: place) means at(g, ?q) and route(?q, p).
  Initially Assert route(x, y). Initially Assert route(y, z). Initially Assert at(a, x). Initially Assert at(b, y).
  Initially Set quantity(a, coin) to 2.
  Rule alarm when near(?g, y) and open(y) { Assert alarmed(?g). }
  Goal false.
}`), 'roads').module;
const start = new World(module).apply(module.initial);
const call = ModuleWriter.call;

describe('what a world shares with its forks', () => {
  it('is itself when nothing is changed', () => {
    expect(start.apply([])).toBe(start);
  });
  it('shares what was read of a relation until it writes that relation, and reads by first or second argument', () => {
    const routes = start.related('route'), next = start.apply([{ kind: 'assert', call: call('at', 'a', 'y') }]);
    expect(next.related('route')).toBe(routes);
    expect(next.related('at', 'a').map(c => c.args[1])).toEqual(['y']);
    expect(start.related('at', 'a').map(c => c.args[1])).toEqual(['x']);
    expect(next.relatedTo('at', 'y').map(c => c.args[0])).toEqual(['b', 'a']);
    expect(start.relatedTo('route', 'z').map(c => c.args[0])).toEqual(['y']);
    expect(start.relatedTo('open', 'y')).toEqual([]);
  });
  it('tells which facts and measures of some names differ from an earlier world, a measure gone to nothing among them', () => {
    const next = start.apply([{ kind: 'assert', call: call('at', 'a', 'y') }, { kind: 'assert', call: call('open', 'z') },
      { kind: 'set', call: call('quantity', 'a', 'coin'), value: ModuleWriter.number(0) }]);
    expect(next.differing(start, ['at', 'quantity']).map(c => World.format(c)).sort())
      .toEqual(['at(a, x)', 'at(a, y)', 'quantity(a, coin)']);
    expect(next.differing(start, ['route'])).toEqual([]);
  });
});

describe('a reading held to a later world', () => {
  it('agrees while nothing it read is written, and not after, nor with a world of another line', () => {
    const names = Reads.names(module, [call('near', 'a', 'y')]), stamped = start.stamped(names);
    expect(names).toEqual(['at', 'near', 'route']);
    expect(start.apply([{ kind: 'assert', call: call('open', 'y') }]).agrees(names, stamped)).toBe(true);
    expect(start.apply([{ kind: 'assert', call: call('at', 'b', 'z') }]).agrees(names, stamped)).toBe(false);
    expect(new World(module).apply(module.initial).agrees(names, stamped)).toBe(false);
  });
  it('lets a rule that held nowhere go unasked until something its condition reads is written', () => {
    const rule = module.rules!.find(r => r.id === 'alarm')!;
    expect(CampaignTick.instances(rule, start)).toEqual([]);
    const unrelated = start.apply([{ kind: 'set', call: call('quantity', 'b', 'coin'), value: ModuleWriter.number(1) }]);
    expect(CampaignTick.instances(rule, unrelated)).toEqual([]);
    const opened = unrelated.apply([{ kind: 'assert', call: call('open', 'y') }]);
    expect(CampaignTick.instances(rule, opened).map(([, binding]) => binding)).toEqual([{ '?g': 'a' }]);
  });
});
