import { describe, expect, it } from 'bun:test';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { Tiny } from '../support/tiny';
import { Checks } from '../../src/rules/checks';

// The setting/framework boundary's verified leaks (BX-01, mission-22/boundary-brief.md and the register's row),
// each the smallest world that shows it: the Tethys expedition, a world of its own setting (no canon). Each is a
// failing pin (it.failing): it passes the day the leak is repaired, and must then be made an ordinary it. The one
// repaired this round (a campaign may keep the canon out) is held in boundary-tethys.
const kyr = readFileSync(join(import.meta.dir, '../fixtures/boundary/tethys.kyr'), 'utf8');
const own = () => Tiny.start(kyr, { own: true });
const labels = (t: Tiny) => t.journey.choices().map(c => c.label);
describe('the setting/framework boundary, as it leaks', () => {
  // L1: a company is made only of the catalog's ancestries and callings (Content.playableRaces, playableClasses);
  // nor can a module declare a kind of person (a module's Kind is a kind of item, of the catalog's bases).
  it.failing('lets a campaign of its own make a company of its own kinds of people', async () => {
    const t = await Tiny.start(kyr,
      { own: true, party: [{ name: 'Unit Seven', raceId: 'android', classId: 'engineer' }] });
    expect(t.campaign.readout.creatures.find(c => c.name === 'Unit Seven')).toBeDefined();
  });
  // L2: a company comes with its calling's kit: a warrior steps off a shuttle with a battleaxe, a torch, a candle and
  // a ten-foot pole (Overlays and the calling's gear, whatever the setting).
  it.failing('sets out with nothing the campaign did not give it', async () => {
    const t = await own();
    expect(labels(t).filter(l => /torch|candle|ten-foot pole|battleaxe/i.test(l))).toEqual([]);
  });
  // L3: the clock's day and night are the setting's (FictionalTime: 8 a.m. starts, a night of 21 to 6): a sealed
  // station's docking ring offers to wait until dark.
  it.failing('keeps no sun over a sealed station', async () => {
    const t = await own();
    expect(labels(t).some(l => /Until dark|first light/.test(l))).toBe(false);
  });
  // L4: money is gold and the purse coin (module-installations requires a shared gold; ScreenModel says coin).
  it.failing('says the campaign\'s own currency', async () => {
    const t = await own();
    expect(Object.keys(t.screen.purse)).not.toContain('coin');
  });
  // L5: a check rests on the catalog's skills (Checks.qualities from Canon.skills): a module's own capability is no
  // skill, so "Systems" rests on nothing of its own.
  it.failing('rests a check on a capability the campaign declares', () => {
    expect(Checks.qualities.systems).toBeDefined();
  });
  // L6: the shared rules carry the canon's names: a world without the canon still holds Plane Shift.
  it.failing('holds nothing of the canon\'s in a world without it', async () => {
    const t = await own();
    expect(t.campaign.module.entities.map(e => e.id).filter(id => /plane/.test(id))).toEqual([]);
  });
});
