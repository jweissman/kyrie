import { describe, expect, it } from 'bun:test';
import { Journey } from '../src/session/journey';
import { ModuleParser } from '../src/lang/module-parser';
import { FictionalTime } from '../src/campaign/fictional-time';

// What an action takes and tells by the clock (test/fixtures/probes/the-hour): hours said as hours (Quittance's bg 16,
// QTC-A13), until an hour of the clock (Wapshott's Circus friction 10, WPC-10), and a Result for the moment it is done
// (the Grand Tour's friction 6, GTR-06).
describe('an action by the clock', () => {
  const action = (part: string) => ModuleParser.parse(`Module m "m" { Kind group. Relation r(group).
    Action a(actor: group) "A" { Requires r(actor). ${part} } }`).actions[0]!;

  it('takes hours, or until an hour of the clock, as written', () => {
    expect(action('Time 3 hours.').time).toBe(18);
    expect(action('Time 1 hour.').time).toBe(6);
    expect(action('Time until hour 19.').until).toEqual({ hour: 19 });
    expect(action('Time until day 2 hour 6.').until).toEqual({ day: 2, hour: 6 });
    expect(() => action('Time until hour 25.')).toThrow(/No such hour/);
    // From eight in the morning: eleven hours to seven; and from eight at night, the next morning's six is ten hours.
    expect(FictionalTime.untilHour(0, { hour: 19 })).toBe(66);
    expect(FictionalTime.untilHour(72, { hour: 6 })).toBe(60);
    expect(FictionalTime.untilHour(0, { day: 2, hour: 6 })).toBe(132);
  });

  it('waits until seven, then three hours more, and its Result is told for the hour', async () => {
    const j = await Journey.start('test/fixtures/probes/the-hour/probe.campaign.json', 'h');
    expect(await j.play('Ride the basket up')).toMatch(/middle of a fine afternoon/);
    await j.play('Wait for the show at seven');
    expect(FictionalTime.hour(j.watch())).toBe(19);
    expect(j.watch() % 6).toBe(0);
    expect(await j.play('Ride the basket up')).toMatch(/last of the evening light/);
    await j.play('Wait three hours');
    expect(FictionalTime.hour(j.watch())).toBe(22);
    // The first that holds: dark, before the evening's.
    expect(await j.play('Ride the basket up')).toMatch(/into the dark, and the stars/);
  }, 30000);
});
