import { describe, expect, it } from 'bun:test';
import { Tiny } from '../support/tiny';
import { FantasyRules } from '../../src/canon/canon';
import { Installed, type InstalledDomain } from '../../src/ports/installed';
import { LevelDrain } from '../../src/rules/level-drain';
import type { Condition } from '../../src/rules/catalog-schema';

// Two campaigns under two installations, in one process, alternating with nothing reset between their turns (the
// installed context, OR-520; platform-separation.md, the third review): each campaign's acts and frames ask only its
// own installation; each plays as it plays alone; a condition only one installation defines is that campaign's alone;
// and two installations' operations under way at once each ask their own through their awaits.
const shop = `
  Place shop "the shop" is room at 0, 0.
  Company party "You" of 1 at shop.
  Person mabel "Mabel" at shop { Role "a chandler". Ancestry human. Peaceable. Pronouns she.
    Sells torch for 1 coin from 6. Sells candle for 1 coin from 6. }
  Initially Set quantity(party, rations) to 4.
  Goal false.`;
const grey = { name: 'the grey sleep', description: 'A made-up drain.', lifetime: 'persistent', modifiers: {},
  drains: true } as Condition;
type Part = Exclude<keyof InstalledDomain, 'id'>;
class Asked {
  static readonly log: string[] = [];
  // The fantasy rules under another name, every question put to them written down by that name; some define the
  // grey sleep besides.
  static domain(id: string, greySleep = false): InstalledDomain {
    const parts = ['conditions', 'abilities', 'traits', 'callings'] as const;
    const domain: Record<string, unknown> = { id };
    for (const part of parts) { domain[part] = this.spied(id, part, FantasyRules[part] as object); }
    if (greySleep) {
      const own = domain.conditions as { condition(id: string): Condition | undefined };
      const asked = own.condition.bind(own);
      domain.conditions = { ...own, condition: (c: string) => c === 'grey' ? grey : asked(c) };
    }
    return domain as unknown as InstalledDomain;
  }
  private static spied(id: string, part: Part, given: object): object {
    return Object.fromEntries(Object.entries(given).map(([k, f]) => [k, (...a: unknown[]) => {
      this.log.push(id); return (f as (...x: unknown[]) => unknown)(...a);
    }]));
  }
  // Who was asked while a step ran.
  static async by(step: () => Promise<unknown>): Promise<string[]> {
    this.log.length = 0; await step(); return [...new Set(this.log)];
  }
}
const begin = (domain: InstalledDomain) => Installed.during(domain, () => Tiny.start(shop, { seed: domain.id }));
const steps = ['Wait a while', 'Wait an hour', 'Wait a while'];
const alone = async (domain: InstalledDomain): Promise<string> => {
  const t = await begin(domain);
  for (const step of steps) { await t.play(step); }
  return t.session.canonical();
};

describe('two installations in one process', () => {
  it('play alternately, each asking its own and playing as it plays alone', async () => {
    const a = Asked.domain('a'), b = Asked.domain('b', true);
    const [soloA, soloB] = [await alone(a), await alone(b)];
    const ta = await begin(a), tb = await begin(b);
    expect([ta.campaign.installation.id, tb.campaign.installation.id]).toEqual(['a', 'b']);
    for (const step of steps) {
      expect(await Asked.by(() => ta.play(step))).toEqual(['a']);
      expect(await Asked.by(() => tb.play(step))).toEqual(['b']);
    }
    expect([ta.session.canonical(), tb.session.canonical()]).toEqual([soloA, soloB]);
    expect([ta.campaign.within(() => LevelDrain.drains('grey')), tb.campaign.within(() => LevelDrain.drains('grey'))])
      .toEqual([false, true]);
  }, 30000);
  it('carries each through its awaits, two under way at once', async () => {
    const a = Asked.domain('a'), b = Asked.domain('b');
    let open: () => void = () => undefined;
    const gate = new Promise<void>(done => { open = done; });
    const seen = (d: InstalledDomain) => Installed.during(d, async () => {
      const before = Installed.current().id; await gate; return [before, Installed.current().id];
    });
    const both = Promise.all([seen(a), seen(b)]);
    open();
    expect(await both).toEqual([['a', 'a'], ['b', 'b']]);
  });
});
