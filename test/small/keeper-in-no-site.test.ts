import { describe, expect, it } from 'bun:test';
import { Tiny } from '../support/tiny';

// An aim waits on a keeper met in a room in no site (OR-481). On the weir route, Ilse the elf mage at 4 hp met the
// conger in the gate-well under Gatesend's gatehouse and reckoned it beyond her; the way down from the gatehouse was no
// longer led, and from the weir, the gate-yard and the sea-bank the sea-gate's aim led back to the gatehouse, round
// four times: AimAside had set an aim aside only for a keeper inside a site. A keeper the aim is itself about (the old
// buck rat of the nest the rats' job sends the company to clear) is the aim's own fight, and sets nothing aside.
const gate = (keeper: string, toward: string) => `
  Place hamlet "Gatesend" is settlement at 0, 0.
  Place bank "the sea-bank" is room within hamlet at 0, 0 outdoors.
  Place weir "the eel-weir" is room within hamlet at 1, 0 outdoors.
  Place gatehouse "the gatehouse" is room within hamlet at 0, 1 indoors.
  Place well "the gate-well" is room within hamlet at 0, 2.
  Passage weirpath "the weir path" is path between bank and weir.
  Passage gatedoor "the gatehouse door" is door between bank and gatehouse.
  Passage rungs "the iron rungs" is stair between gatehouse and well.
  Company party "You" of 1 at bank.
  Person ${keeper} "the conger in the gate-well" at well {
    Role "a sea-eel thicker than a man's arm". Species eel. Numbers 1. Level 5. Temperament territorial. Lair well.
    Warns "A grey back as long as you are rolls past the chain.".
  }
  Relation found(group).
  Objective pawl when not found(party) toward ${toward} by gatehouse "Find the sea-gate's lost pawl in the gate-well.".
  Initially Assert been(party, well). Initially Assert been(party, gatehouse).
  Goal false.`;
const party = [{ name: 'Ilse', raceId: 'elf' as const, classId: 'mage' as const }];
describe('an aim whose room in no site a keeper met bars', () => {
  it('is set aside from anywhere, and the need says why', async () => {
    const t = await Tiny.start(gate('conger', 'well'), { party });
    t.follow('pawl');
    expect(t.gold).toEqual([]);
    expect(t.glance.continuance).toMatchObject({ kind: 'frontier', need: true,
      said: expect.stringMatching(/^Your aim waits: The gate-well: the conger in the gate-well is beyond it/) });
    await t.perform('go(t__gatedoor,t__gatehouse)');
    t.follow('pawl');
    expect(t.gold).toEqual([]);
    expect(t.glance.acts.map(a => a.command)).not.toContain('go(t__rungs,t__well)');
    expect(t.glance.continuance?.kind).toBe('frontier');
  });
  it('is not set aside for a keeper it is itself about', async () => {
    const t = await Tiny.start(gate('conger', 'conger'), { party });
    t.follow('pawl');
    expect(String((t.glance.continuance as { said?: string } | undefined)?.said ?? '')).not.toMatch(/^Your aim waits/);
  });
});
