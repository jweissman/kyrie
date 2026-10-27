import { describe, expect, it } from 'bun:test';
import { AutoplayRun, type RunSpec } from '../src/autoplay/run';
import { Invariants } from '../src/autoplay/invariants';
import type { CampaignEvent } from '../src/campaign/campaign';

// The autoplay laboratory's invariants over varied worlds, origins and tempers (the register's COR-14): each step
// keeps every creature sound and the game offering something; each command tells something (what was seen or heard,
// a reply, a change or a fight) and takes the time the page said it would, where it says.
class Tempers {
  static readonly runs: Omit<RunSpec, 'steps'>[] = [
    { seed: 'b2', origin: 'debt', policy: 'investigate', protagonist: { name: 'Oda', raceId: 'human', classId: 'warrior' } },
    { seed: 'c3', origin: 'kin', policy: 'fight', protagonist: { name: 'Bryn', raceId: 'dwarf', classId: 'cleric' } },
    { seed: 'd4', origin: 'order', policy: 'care', protagonist: { name: 'Isolde', raceId: 'elf', classId: 'mage' } },
  ];
}

describe('the autoplay laboratory, over worlds, origins and tempers', () => {
  it('says so of a command that tells nothing, or takes another time than the page said', () => {
    const event = { action: 'wait', elapsed: 0, result: 'success', changes: [], combat: [] } as unknown as CampaignEvent;
    expect(Invariants.told(event).map(v => v.kind)).toEqual(['silent']);
    expect(Invariants.told({ ...event, response: 'The kettle sings.' })).toEqual([]);
    expect(Invariants.time(20, 10, event).map(v => v.message)).toEqual(['wait: said 20 minutes, took 10']);
    const cut = { ...event, cut: true as const };
    expect([Invariants.time(20, 20, event), Invariants.time(10, 1, event), Invariants.time(20, 10, cut)])
      .toEqual([[], [], []]);
  });
  for (const spec of Tempers.runs) {
    it(`keeps play sound, told and on time: ${spec.seed}, ${spec.origin}, ${spec.policy}`, async () => {
      const r = await AutoplayRun.run({ ...spec, steps: 60 });
      expect(r.failure).toBeUndefined();
      expect(r.metrics.commands).toBeGreaterThanOrEqual(r.metrics.steps);
    }, 240000);
  }
});
