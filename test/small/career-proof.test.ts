import { describe, expect, it } from 'bun:test';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { Tiny } from '../support/tiny';
import { Consequences } from '../../src/campaign/consequences';
import type { TickHost } from '../../src/campaign/campaign-tick';
import { PlaySession } from '../../src/session/play-session';

// The hunter's career, its smallest proof (CR-01; doc/architecture/mission-22/career-phase1.md): a royal posting at
// Hollow Ford, a dragon on the Crag above it, wolves at the fold whose bounty arises from what they take, and the
// royal game-warden at Dun Rìerdan (test/fixtures/career/career.kyr). The four things the brief asks tested. The
// fixture's Scathe is a dragon; where a fight with it is to be won here, it is a wyrmling, for a deed is proved by
// the fight that did it, whatever the odds (the engine's felled, kept for a module that declares it).
const kyr = readFileSync(join(import.meta.dir, '../fixtures/career/career.kyr'), 'utf8');
class Career {
  static start(winnable = false) {
    const text = winnable ? kyr.replace('Species dragon. Level 2.', 'Species wyrmling. Level 2.') : kyr;
    return Tiny.start(text,
      { party: [{ name: 'Aud', raceId: 'human', classId: 'warrior', level: 6 }] });
  }
  // A night and a day gone by, as a player lets them go: camped where that can be done, else waited out.
  static async night(t: Tiny) {
    const l = t.journey.choices().map(c => c.label);
    await t.play(l.find(x => /^Make camp/.test(x)) ?? l.find(x => /Until first light/.test(x)) ?? 'Wait › Until dark');
  }
  static async attack(t: Tiny, who: string) {
    await t.perform(t.journey.choices().find(c => c.command === `attack(t__${who})`)!.command);
  }
  static offered(t: Tiny, label: RegExp): boolean { return t.journey.choices().some(c => label.test(c.label)); }
}
describe('the hunter\'s career', () => {
  it('goes on while the commission is ignored: the dragon raids, and the wolves\' bounty arises from what they take', async () => {
    const t = await Career.start();
    await t.play('Read the royal proclamation');
    expect(t.journey.holds('knows', 'party', 't__bounty')).toBe(false);
    for (let i = 0; i < 3; i++) { await Career.night(t); }
    expect(t.journey.measure('lost', 'fold')).toBeGreaterThanOrEqual(3);
    expect(t.journey.holds('knows', 'party', 't__bounty')).toBe(true);
    expect(t.screen.aims?.map(a => a.text)).toEqual(expect.arrayContaining([
      expect.stringMatching(/^Slay Scathe, the dragon of the Crag/),
      expect.stringMatching(/^Kill the wolves taking/)]));
    // Nothing of it was the company's doing: the dragon is where it was, alive.
    expect([t.journey.at('t__scathe'), t.journey.holds('able', 't__scathe')]).toEqual(['t__crag', true]);
  });
  it('knows the right creature\'s fate: not another beast\'s, not a death by any other hand, and Scathe\'s by the company\'s', async () => {
    const other = await Career.start(true);
    await other.play('Read the royal proclamation', 'To the sheepfold', 'To the warm stones');
    await Career.attack(other, 'adder');
    expect(other.journey.holds('t__felled', 'party', 't__adder')).toBe(true);
    expect(other.journey.holds('t__felled', 'party', 't__scathe')).toBe(false);
    // Struck dead by something else (a Slay), Scathe lies dead, and nobody's deed is recorded: no head to take.
    other.journey.assert('struckDead', 't__scathe');
    Consequences.slay(other.campaign as unknown as TickHost);
    other.campaign.refreshProjection();
    expect([other.journey.holds('dead', 't__scathe'), other.journey.holds('knows', 'party', 't__head_seen')])
      .toEqual([true, false]);
    const t = await Career.start(true);
    await t.play('Read the royal proclamation', 'To the sheepfold', 'To the Crag');
    await Career.attack(t, 'scathe');
    expect(t.journey.holds('t__felled', 'party', 't__scathe')).toBe(true);
    expect(t.journey.holds('knows', 'party', 't__head_seen')).toBe(true);
  });
  it('pays a claim once, and knights the one whose deed it is', async () => {
    const t = await Career.start(true);
    await t.play('Read the royal proclamation', 'To the sheepfold', 'To the Crag');
    await Career.attack(t, 'scathe');
    await t.perform(t.journey.choices().find(c => /^take_item\(.*t__head/.test(c.command))!.command);
    await t.play('To the sheepfold', 'To the green at Hollow Ford', 'To the royal game-warden');
    const purse = t.journey.measure('quantity', 'party', 'gold');
    await t.play('Lay Scathe\'s head before Master Cadell');
    expect(t.journey.measure('quantity', 'party', 'gold')).toBe(purse + 500);
    expect(t.journey.holds('t__knighted', 'party')).toBe(true);
    // Not again: the claim is spent, and the head with it.
    expect(Career.offered(t, /^Lay Scathe's head/)).toBe(false);
    // A knight: the register is opened, and the reeve says so.
    expect(Career.offered(t, /^Ask Master Cadell what else the register holds$/)).toBe(true);
    await t.play('To the green at Hollow Ford');
    expect(t.leaf.presence.join(' ') + JSON.stringify(t.screen)).toMatch(/calls you Sir/);
  });
  it('remembers a bounty paid: the fold spared, said where it is, and kept in a save', async () => {
    const t = await Career.start();
    for (let i = 0; i < 3; i++) { await Career.night(t); }
    await t.play('To the sheepfold');
    await Career.attack(t, 'wolves');
    await t.play('To the green at Hollow Ford');
    const purse = t.journey.measure('quantity', 'party', 'gold');
    await t.play('Tell Odda the wolves at the fold are dead');
    expect(t.journey.measure('quantity', 'party', 'gold')).toBe(purse + 30);
    expect(Career.offered(t, /^Tell Odda the wolves/)).toBe(false);
    const kept = PlaySession.resume(JSON.parse(JSON.stringify(t.session.checkpoint())));
    expect(kept.campaign.world.test({ kind: 'call', name: 't__spared', args: ['t__fold'] })).toBe(true);
    await t.play('To the sheepfold');
    expect(JSON.stringify(t.screen)).toContain('The hurdles are mended');
  });
});
