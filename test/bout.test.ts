import { describe, expect, it } from 'bun:test';
import { Journey } from '../src/session/journey';
import { ModuleWriter } from '../src/lang/module-writer';
import { DangerSense } from '../src/presentation/danger-sense';

// A fight that is not to the death, when its author says so (core.kyr: yields, breaks). Three village lads with their
// fists killed or were killed (Fair Weather's FWR-17); a sparring bout could only be a roll (the Quiet in the Sky's
// QIS-04); a fight outlived its decision (the cold review's REV-16). Neither is any band's by default: authored fights
// wait on a band's fall.
class Bout {
  static start(seed: string) { return Journey.start('test/fixtures/probes/bout/probe.campaign.json', seed); }
  static holds(j: Journey, name: string, ...args: string[]) {
    return j.campaign.world.test(ModuleWriter.call(name, ...args));
  }
  static hp(j: Journey, name: string) {
    return j.campaign.readout.creatures.filter(c => c.name.startsWith(name)).map(c => c.state.hp);
  }
}
describe('a bout, and a band that breaks', () => {
  it('is over at the first fall: the lads beaten get up, are routed, plead, and go to their refuge', async () => {
    const j = await Bout.start('b');
    // Reckoned before it, it is said to be a bout (QIS-04: the label misstated what was at stake).
    expect(DangerSense.reckon(j.campaign, 'p__lads')?.text).toContain(DangerSense.bout);
    await j.play('Attack');
    expect(Bout.hp(j, 'Human').every(n => n > 0)).toBe(true);
    expect([Bout.holds(j, 'routed', 'p__lads'), Bout.holds(j, 'at', 'p__lads', 'p__slip')]).toEqual([true, true]);
    // What their plea and the author's rule on routed said is on the fight's own page (GOS-13).
    expect(j.latest).toContain('The Cawse lads back off with their hands up');
    expect(j.latest).toContain('Up on the slip somebody laughs at them.');
  }, 60000);

  it('beaten, the company yields and lives, and is yielded to its victor', async () => {
    const j = await Bout.start('b');
    await j.play('To the yard', 'Attack');
    expect(j.latest).toContain('You are beaten, and yield.');
    expect(j.latest).not.toContain('The fight is lost.');
    expect(Bout.hp(j, 'Ama')).toEqual([1]);
    expect(Bout.holds(j, 'yielded', 'party', 'p__bruiser')).toBe(true);
  }, 60000);

  it('a band that breaks runs once half of it is down, and is routed', async () => {
    const j = await Bout.start('b');
    await j.play('To the lane', 'Attack');
    const end = j.taken.at(-1)!.event.combat.find(e => e.type === 'end');
    expect(end).toMatchObject({ outcome: 'fighters', reason: 'routed' });
    expect(Bout.hp(j, 'Four footpads').filter(n => n > 0).length).toBe(2);
    expect(Bout.holds(j, 'routed', 'p__pads')).toBe(true);
  }, 60000);
});
