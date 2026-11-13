import { describe, expect, it } from 'bun:test';
import { Discovery } from '../src/information/discovery';
import { World } from '../src/lang/world';
import { ModuleWriter } from '../src/lang/module-writer';
import type { Change, Module } from '../src/lang/module';

// The check of a world's discovery sources, as each crossing makes it of the whole joined world, costs what the world
// holds and not that times its sources (T24-11: every source had gone through every installation's initial facts
// again, half a second of a province's install by the tenth and growing as their square). And it still refuses a
// source said to be nowhere, or in two places.
class Sources {
  static module(sources: number, others: number, where: (i: number) => string[] = () => ['hall']): Module {
    const assert = (name: string, ...args: string[]): Change => ({ kind: 'assert', call: ModuleWriter.call(name, ...args) });
    const initial = [...Array.from({ length: sources }, (_, i) => [assert('reveals', `s${i}`, `f${i}`),
      assert('established', `f${i}`), ...where(i).map(place => assert('at', `s${i}`, place))]).flat(),
    ...Array.from({ length: others }, (_, i) => assert('at', `thing${i}`, 'hall'))];
    return { relations: [{ name: 'reveals', types: ['source', 'fact'], exclusive: false },
      { name: 'established', types: ['fact'], exclusive: false }, { name: 'at', types: ['thing', 'place'], exclusive: false }],
    measures: [], queries: [], actions: [], initial,
    entities: Array.from({ length: sources }, (_, i) => ({ id: `s${i}`, type: 'source', name: `a source ${i}` })) } as
      unknown as Module;
  }
  static check(module: Module) {
    Discovery.validate(module, new World(module, { relations: module.initial.map(c => c.call), measures: [] }));
  }
}

describe('a world\'s discovery sources, checked as a country joins it', () => {
  it('are checked in time that grows with the world, not with the world times its sources', () => {
    // Among 50,000 other things said to be somewhere, eight times the sources take about the same time to check, not
    // eight times as long (read per source, 2,000 sources were a hundred million comparisons). A ratio, not a
    // budget: it holds on a slow machine as on a fast one.
    const time = (sources: number) => {
      const module = Sources.module(sources, 50000);
      const world = new World(module, { relations: module.initial.map(c => c.call), measures: [] });
      const t = performance.now();
      Discovery.validate(module, world);
      return performance.now() - t;
    };
    time(250);
    expect(time(2000) / Math.max(time(250), 1)).toBeLessThan(3);
  });
  it('still refuses a source that is said to be nowhere, or in two places', () => {
    expect(() => Sources.check(Sources.module(3, 0, i => i === 1 ? [] : ['hall']))).toThrow('one initial location');
    expect(() => Sources.check(Sources.module(3, 0, i => i === 2 ? ['hall', 'yard'] : ['hall']))).toThrow('one initial location');
    expect(() => Sources.check(Sources.module(3, 10, i => i === 2 ? ['hall', 'hall'] : ['hall']))).not.toThrow();
  });
});
