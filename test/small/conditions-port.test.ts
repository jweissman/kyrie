import { describe, expect, it } from 'bun:test';
import { Canon, FantasyRules } from '../../src/canon/canon';
import { Conditions } from '../../src/ports/conditions';
import { Installed, type InstalledDomain } from '../../src/ports/installed';
import { LevelDrain } from '../../src/rules/level-drain';
import type { Condition } from '../../src/rules/catalog-schema';

// The runtime asks its rules' conditions through a port a setting installs (platform-separation.md: small ports the
// lower layer owns, each with a second consumer): a made-up installation, not the fantasy canon's, answers the
// runtime's rules alike, within its own scope (src/ports/installed.ts, OR-520), and nothing installed is replaced.
const drain: Condition = { name: 'the grey sleep', description: 'A made-up drain.', lifetime: 'persistent',
  modifiers: {}, drains: true } as Condition;
const grey: InstalledDomain = { id: 'grey', conditions: {
  condition: (id: string) => id === 'grey' || id === 'grey sleep' ? drain : undefined,
  exact: (id: string) => id === 'grey' ? drain : undefined } };
describe('the conditions port', () => {
  it('answers the runtime from the installation in scope', () => {
    expect(Installed.within(grey, () => [LevelDrain.drains('grey'), LevelDrain.drains('grey sleep'),
      LevelDrain.drains('energy_drain'), Conditions.exact('grey sleep'), Conditions.name('grey sleep'),
      Conditions.resolve('grey sleep'), Conditions.tone('grey')]))
      .toEqual([true, true, false, undefined, 'the grey sleep', 'grey sleep', 'neutral']);
    expect(LevelDrain.drains('grey')).toBe(false);
  });
  it('is the fantasy canon\'s where the canon is loaded, and is not installed over', () => {
    const any = Object.keys(Canon.conditions)[0]!;
    expect(Conditions.exact(any)).toBe(Canon.conditions[any]);
    expect(Installed.rootId).toBe(FantasyRules.id);
    expect(() => Installed.base(FantasyRules)).not.toThrow();
    expect(() => Installed.base(grey)).toThrow(/cannot replace/);
  });
  it('says so of an installation that brings no conditions', () => {
    expect(() => Installed.within({ id: 'bare' }, () => Conditions.of('poisoned'))).toThrow(/bare installs no conditions/);
  });
  it('reads lost actions from the installed conditions and rejects unavailable statuses', () => {
    const statuses: Record<string, Condition> = {
      sleep: { ...drain, modifiers: { noActions: true } },
      unavailable: { ...drain, unsupported: { mechanic: 'Not implemented.' } },
    };
    const domain: InstalledDomain = { id: 'sleeping', conditions: {
      condition: id => statuses[id], exact: id => statuses[id] } };
    Installed.within(domain, () => {
      expect(Conditions.skips('sleep')).toBe(true);
      expect(() => Conditions.skips('missing')).toThrow('Unknown status missing');
      expect(() => Conditions.skips('unavailable')).toThrow('Unknown status unavailable');
    });
    expect(Installed.within(grey, () => Conditions.skips('grey'))).toBe(false);
  });
});
