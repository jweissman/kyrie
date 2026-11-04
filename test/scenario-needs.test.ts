import { describe, expect, it } from 'bun:test';
import { ScenarioTowns } from '../src/world/scenario-towns';
import type { Region } from '../src/world/region-writer';

// A scenario's settlement need of no known form is refused, saying which forms there are: an unknown one had been
// quietly taken for the first town (Wapshott's Circus friction 17, WPC-17).
describe('a scenario\'s settlement need', () => {
  it('of no known form is refused, with the forms there are', () => {
    const at = { region: { settlements: [] } as unknown as Region, bindings: {}, claimed: new Set<string>(), key: 'k',
      parts: [] };
    expect(() => ScenarioTowns.town('nextdoor:a', at))
      .toThrow("Unknown settlement need 'nextdoor:a': it is one of any, largest, along:role, near:role, toward:side");
  });
});
