import { describe, expect, it } from 'bun:test';
import { DrawnWorld } from '../src/world/drawn-world';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { ScreenModel } from '../src/ui/screen-model';
import type { PlaySession } from '../src/session/play-session';
import { GeneratedWorld } from './support/generated';
import { Signals } from './support/signals';

// What someone's likeness is drawn for is found again inside (see Signals): here about a generated country's first
// town, a way at a time; test/small/signals.test.ts holds the rule itself on a green of three.
describe('a signal and what it is for', () => {
  let checked = 0;
  const missed = (s: PlaySession): string[] => {
    const found = Signals.missed(s.campaign);
    checked += found.checked.length;
    return found.missed;
  };
  for (const origin of ['debt', 'kin']) {
    it(`holds about the first town, come to by the ${origin} origin`, async () => {
      const s = await DrawnWorld.start('kahitude', { origin, party: [{ name: 'X', raceId: 'human', classId: 'warrior' }] },
        NodeBundleSource.shared);
      // The town's places, a way at a time from where the company starts, eight of them.
      const found: string[] = [], seen = [s.campaign.world.one('at', 'party')!];
      for (let i = 0; i < seen.length && i < 8; i++) {
        await GeneratedWorld.travel(s, seen[i]!);
        found.push(...missed(s));
        const screen = ScreenModel.build(s.campaign);
        if (screen.place.kind === 'region' || screen.place.underground) { continue; }
        seen.push(...screen.exits.filter(e => e.local && !e.blocked && !seen.includes(e.destination.id))
          .map(e => e.destination.id));
      }
      expect(seen.length).toBeGreaterThan(4);
      expect(found).toEqual([]);
      expect(checked).toBeGreaterThan(0);
    }, 240000);
  }
});
