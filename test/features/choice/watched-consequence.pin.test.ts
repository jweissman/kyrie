import { describe, expect, it } from 'bun:test';
import { Tiny } from '../../support/tiny';
import { ModuleWriter } from '../../../src/lang';

// Feature pins: see test/features/choice/consequence.pin.test.ts. Choice & Consequence › A consequence that turns on
// the world (OR-1333's first slice; AU-57): one act whose consequence is what the world makes of it, written in the
// act as `If <condition>, <change>.` where authors had written the act twice, once for each way the world might stand
// (the last sea-gate's boat, let through under the reeve's eyes or not: four acts, now two). The same row, taken with
// the reeve come out to the gate and without her: she sees it and says so only where she was there to see it.
const gate = (reeve: string) => `
  Place gatehouse "the gatehouse" is room at 0, 0 indoors.
  Place green "the green" is room at 1, 0 outdoors.
  Company party "You" of 1 at gatehouse.
  Person annis "the reeve" at ${reeve} { Role "the reeve". Ancestry human. Peaceable. Pronouns she. }
  Relation letThrough(group). Relation reeveSaw(group).
  Action let_through(actor: group) "Wind the gate up and let the boat through" {
    Requires at(actor, gatehouse) and not letThrough(actor).
    Result "The boat slides through on the last of the flood. Nobody else sees it.".
    Result "The boat slides through under the reeve's eyes. 'So that is who,' she says, and rides back to the green."
      when reeveSaw(actor).
    On success {
      Assert letThrough(actor).
      If at(annis, gatehouse), Assert reeveSaw(actor).
      If at(annis, gatehouse), Assert at(annis, green).
    }
  }
  Goal false.`;
describe('Choice & Consequence › A consequence that turns on the world', () => {
  it('does what the world as it stands makes of one act, and says so in its own words', async () => {
    const watched = await Tiny.start(gate('gatehouse'), { horizon: [] });
    const alone = await Tiny.start(gate('green'), { horizon: [] });
    for (const t of [watched, alone]) { await t.play('Wind the gate up and let the boat through'); }
    expect(watched.campaign.events.at(-1)!.response).toContain('So that is who');
    expect(alone.campaign.events.at(-1)!.response).toContain('Nobody else sees it');
    const saw = ModuleWriter.call('t__reeveSaw', 'party');
    expect([watched.world.test(saw), alone.world.test(saw)]).toEqual([true, false]);
    expect([watched.world.one('at', 't__annis'), alone.world.one('at', 't__annis')]).toEqual(['t__green', 't__green']);
  });
});
