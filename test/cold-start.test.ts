import { afterEach, describe, expect, it, mock, spyOn } from 'bun:test';
import { EngineHost } from '../web/engine/engine-host';
import { ModuleParser } from '../src/lang/module-parser';
import { ParseCache } from '../src/lang/parse-cache';
import type { Frame, Message } from '../web/engine/protocol';

// OR-121: the start itself made cheap, a cold Set out now (nothing drawn ahead) on a country never drawn before in the
// process. Each text it reads is parsed once: a count of texts kept had let the country's own go while the rest of
// its world was read, and its start parsed the country again (3.5 s of place's 7.3). Who a topic is put to is parsed
// once, not for each of the country's thousand topics (1.0 s of its texts: TemplatedPredicates); and Kyr is read with
// KyrQuick (2.5 s of them). Measured after a warm-up (another country drawn first, so that what is timed is the start
// and not the process's first reading of its code); the budgets are about twice each stage as measured here on the
// second country (texts 3.3 s, place 4.5 s, the whole 8.5 s, 20 November), for CI.
class Cold {
  static readonly seed = 'velmoor';
  // CI's runners are slower than a desk (texts 7.1 s there on 20 November): their own budget, as test/act-budget's.
  static readonly budget = process.env.CI ? { texts: 14000, place: 18000, whole: 36000 }
    : { texts: 7000, place: 9000, whole: 18000 };
  static async click(seed: string) {
    const stamps: [string, number][] = [];
    const host = new EngineHost((m: Message) => {
      if (m.kind === 'progress' && !m.step) { stamps.push([m.stage, performance.now()]); }
    });
    await host.handle({ kind: 'world', seed });
    await host.handle({ kind: 'creation' });
    const began = performance.now();
    const frame = await host.handle({ kind: 'set-out', rolled: true, apart: true }) as Frame;
    return { frame, whole: performance.now() - began, stamps };
  }
}

describe('A cold set-out', () => {
  afterEach(() => { mock.restore(); });
  it('parses each text it reads once, and who each topic is put to once, within its budgets', async () => {
    const parsed = new Map<string, number>(), set = ParseCache.set.bind(ParseCache);
    spyOn(ParseCache, 'set').mockImplementation((key, module, ms) => {
      parsed.set(key, (parsed.get(key) ?? 0) + 1);
      set(key, module, ms);
    });
    // The warm-up is the coldest: the shared rules and the sites first read in it, as well as its country.
    await Cold.click('bakoru');
    const predicates = spyOn(ModuleParser, 'predicate');
    const { frame, whole, stamps } = await Cold.click(Cold.seed);
    expect(frame.leaf.prologue).toBeDefined();
    const twice = [...parsed].filter(([, n]) => n > 1).map(([key]) => key.slice(key.indexOf('\u0000') + 1, 60));
    expect(twice).toEqual([]);
    // The country's topics are a thousand and more, and each had been a predicate parsed: what is parsed for them now
    // is a template or two, beside some seven hundred small ones of the world's own (a dealer's price, a fee).
    expect(predicates.mock.calls.length).toBeLessThan(1000);
    // Its texts read (from the first "Drawing the world" to the second), then the start placed.
    const at = (stage: string, nth = 0) => stamps.filter(([s]) => s === stage)[nth]?.[1] ?? NaN;
    const texts = at('Drawing the world', 1) - at('Drawing the world'), place = frame.timing?.place ?? NaN;
    console.log(`  cold set-out: ${Math.round(whole)} ms (texts ${Math.round(texts)}, place ${place}, `
      + `${parsed.size} texts parsed, ${predicates.mock.calls.length} predicates)`);
    expect(texts).toBeLessThan(Cold.budget.texts);
    expect(place).toBeLessThan(Cold.budget.place);
    expect(whole).toBeLessThan(Cold.budget.whole);
  }, 180000);
});
