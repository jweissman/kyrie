import { describe, expect, it } from 'bun:test';
import { Journey } from '../src/session/journey';
import { ModuleParser } from '../src/lang/module-parser';
import { ModuleWriter } from '../src/lang/module-writer';

// A watch kept in the dark is broken off by what comes to it, told as it is heard there, not as a light giving out:
// sitting with Agnes in the dark, the moth's coming was told "Your light gives out" (Half the Hive's friction 15).
describe('an activity broken off', () => {
  it('in the dark, by what comes, is told as what is heard of it', async () => {
    const j = await Journey.start('test/fixtures/probes/interrupted/probe.campaign.json', 'k');
    await j.play('Sit in the dark');
    expect(j.taken.at(-1)!.page).toBe('Something pats along the wall in the dark, and stops close by.');
    expect(j.watch()).toBe(2);
  }, 60000);
});

// The Lull's F2 (LUL-02): what an act says holds while its time passes (Meanwhile asleep(actor)) holds for its watches
// and not after, so a rule for a company awake at midnight neither fires in a night slept nor is told on waking.
describe('what holds meanwhile', () => {
  it('holds while the act runs, and not after', async () => {
    const j = await Journey.start('test/fixtures/probes/meanwhile/probe.campaign.json');
    await j.play('=22:00', 'Lie down on the green');
    expect(j.taken.at(-1)!.page).not.toContain('The stars go out');
    expect([j.holds('sawStars', 'party'), j.holds('asleep', 'party')]).toEqual([false, false]);
    const k = await Journey.start('test/fixtures/probes/meanwhile/probe.campaign.json');
    await k.play('=22:00', 'Wait › An hour', 'Wait › An hour', 'Wait › An hour');
    expect(k.holds('sawStars', 'party')).toBe(true);
    // And the shared camp sleeps as the act of the module's own does (Mission 19: rest, camp and a bed say it).
    const c = await Journey.start('test/fixtures/probes/meanwhile/probe.campaign.json');
    await c.play('=22:00');
    c.campaign.commitWorld(c.campaign.world.apply([{ kind: 'retract', call: ModuleWriter.call('hungry', 'party') }]));
    await c.play('Make camp');
    expect(c.taken.at(-1)!.page).not.toContain('The stars go out');
    expect([c.holds('sawStars', 'party'), c.holds('asleep', 'party')]).toEqual([false, false]);
  }, 60000);
  it('is written as it was read', () => {
    const m = ModuleParser.parse('Module m "M" { Relation dozing(group). Action nap(actor: group) "Nap" { '
      + 'Requires true. Time 6. Meanwhile dozing(actor), asleep(actor). } Goal false. }');
    expect(m.actions[0]!.meanwhile?.map(c => c.name)).toEqual(['dozing', 'asleep']);
    expect(ModuleWriter.write(m)).toContain('Meanwhile dozing(actor), asleep(actor).');
  });
});

