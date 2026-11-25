import { describe, expect, it } from 'bun:test';
import { Canon } from '../../src/canon/canon';
import { Conditions } from '../../src/ports/conditions';
import { LevelDrain } from '../../src/rules/level-drain';
import type { Condition } from '../../src/rules/catalog-schema';

// The runtime asks its rules' conditions through a port a setting installs (platform-separation.md: small ports the
// lower layer owns, each with a second consumer): a made-up domain, not the fantasy canon's, answers the runtime's
// rules alike.
// The canon installs its own again after.
const drain: Condition = { name: 'the grey sleep', description: 'A made-up drain.', lifetime: 'persistent',
  modifiers: {}, drains: true } as Condition;
describe('the conditions port', () => {
  it('answers the runtime from whichever domain is installed', () => {
    try {
      Conditions.install({ condition: id => id === 'grey' || id === 'grey sleep' ? drain : undefined,
        exact: id => id === 'grey' ? drain : undefined });
      expect([LevelDrain.drains('grey'), LevelDrain.drains('grey sleep'), LevelDrain.drains('energy_drain')])
        .toEqual([true, true, false]);
      expect(Conditions.exact('grey sleep')).toBeUndefined();
    } finally {
      Conditions.install({ condition: Canon.conditionOf.bind(Canon), exact: Canon.conditionExact.bind(Canon) });
    }
  });
  it('is the fantasy canon\'s where the canon is loaded', () => {
    const any = Object.keys(Canon.conditions)[0]!;
    expect(Conditions.exact(any)).toBe(Canon.conditions[any]);
  });
});
