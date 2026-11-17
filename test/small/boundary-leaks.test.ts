import { describe, expect, it } from 'bun:test';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { Tiny } from '../support/tiny';
import { Checks } from '../../src/rules/checks';

// The setting/framework boundary's verified leaks (BX-01, mission-22/boundary-brief.md and the register's row),
// each the smallest world that shows it: the Tethys expedition, a world of its own setting (no canon). Each is a
// failing pin (it.failing): it passes the day the leak is repaired, and must then be made an ordinary it. The first
// repaired (a campaign may keep the canon out) is held in boundary-tethys.
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
  // L2, repaired: a company came with its calling's kit, a warrior stepping off a shuttle with a battleaxe, a torch,
  // a candle and a pole; a member outfitted by the campaign alone ("outfit": "own") carries its gear and no more.
  it('sets out with nothing the campaign did not give it', async () => {
    const t = await Tiny.start(kyr, { own: true, party: [{ name: 'Ama', raceId: 'human', classId: 'warrior',
      outfit: 'own' }] });
    expect(labels(t).filter(l => /torch|candle|ten-foot pole|battleaxe/i.test(l))).toEqual([]);
  });
  // L3, repaired: the clock's night was the setting's (a night of 21 to 6), and a sealed station's docking ring offered
  // to wait until dark; a campaign may keep none ("night": "none"), and its months are data (data/imbar/calendar.json).
  it('keeps no sun over a sealed station', async () => {
    const t = await Tiny.start(kyr, { own: true, night: 'none' });
    expect(labels(t).some(l => /Until dark|first light/.test(l))).toBe(false);
  });
  // L4, repaired: money was gold and the purse coin; a campaign may name its own ("currency": "credit"), the word
  // the world's text and the purse say.
  it('says the campaign\'s own currency', async () => {
    const t = await Tiny.start(kyr, { own: true, currency: 'credit' });
    expect(t.screen.purse.currency).toBe('credit');
    expect(t.campaign.module.entities.find(e => e.id === 'gold')?.name).toBe('credit');
  });
  // L5, repaired: a check rested on the catalog's skills alone, a module's own capability on wisdom; it may say what it
  // rests on (restsOn), and its checks are made by that quality.
  it('rests a check on a capability the campaign declares', async () => {
    const t = await Tiny.start(`${kyr}\n  Initially Assert restsOn(systems, intelligence).`.replace(
      'check(actor, mending, dc_fair)', 'check(actor, systems, dc_fair)'), { own: true });
    t.journey.roll('pass');
    await t.play('To the landing pad on Tethys IV', 'Into the survey outpost', 'To the outpost laboratory',
      'Bring the outpost\'s core back up');
    expect(t.campaign.events.at(-1)!.combat!.find(e => e.type === 'check')).toMatchObject({ stat: 'intelligence' });
    expect(Checks.qualities.systems).toBeUndefined();
  });
  // L6, repaired: the shared rules carried the canon's names (data/rules/canon.kyr: Plane Shift, the planes'
  // thresholds, the world events that befall); a world without the canon is played by the shared rules without them.
  // (The catalog's spell of that name is the catalog's, L1's.)
  it('holds nothing of the canon\'s in a world without it', async () => {
    const t = await own(), m = t.campaign.module;
    expect(m.actions.map(a => a.name).filter(n => /plane/.test(n))).toEqual([]);
    expect(m.relations.map(r => r.name).filter(n => /^(thresholdOf|befell|seatOf|holdsOffice)$/.test(n))).toEqual([]);
    expect(m.kinds).not.toContain('identity');
  });
});
