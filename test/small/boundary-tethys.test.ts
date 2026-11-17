import { describe, expect, it } from 'bun:test';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { Tiny } from '../support/tiny';

// BX-01's tiny science-fiction expedition (test/fixtures/boundary/tethys.kyr; the register's BX-01), played by the
// labels a player sees on the platform's own journey and actions: from Halcyon Station's docking ring by the shuttle
// run to Tethys IV (six hours, one passage of the one travel system), into the survey outpost on its surface, the
// core brought back up, and home to report and to sell the log. A world of its own setting: the canon (data/imbar)
// is never installed in it ("canon": false, the repair this round landed).
const kyr = readFileSync(join(import.meta.dir, '../fixtures/boundary/tethys.kyr'), 'utf8');
describe('the Tethys expedition', () => {
  it('is played on the platform\'s journey and actions, two scales deep, to a report and a sale', async () => {
    const t = await Tiny.start(kyr, { own: true });
    t.journey.roll('pass');
    const start = t.campaign.readout.elapsed, purse = t.journey.measure('quantity', 'party', 'gold');
    await t.play('To the landing pad on Tethys IV');
    // One journey: the shuttle run is a passage of six hours, crossed as any road is.
    expect([t.journey.at('party'), t.campaign.readout.elapsed - start]).toEqual(['t__pad', 36]);
    await t.play('Into the survey outpost', 'To the outpost laboratory');
    expect(t.journey.choices().map(c => c.label)).toContain('Bring the outpost\'s core back up · an even chance');
    await t.play('Bring the outpost\'s core back up');
    expect(t.journey.holds('knows', 'party', 't__beacon_found')).toBe(true);
    await t.play('To the outpost airlock', 'Out to the landing pad on Tethys IV', 'To Halcyon\'s docking ring',
      'To the station concourse', 'To station operations', 'Talk to Chief Okafor', 'Tell Chief Okafor');
    expect(t.journey.holds('t__reported', 'party')).toBe(true);
    await t.play('To the station concourse', 'Talk to Ilse Varga', 'Sell Ilse Varga');
    expect(t.journey.measure('quantity', 'party', 'gold')).toBe(purse + 65);
  });
  it('is a world without Imbar: no plane, no city of the canon, its system in no plane', async () => {
    const t = await Tiny.start(kyr, { own: true }), ids = t.campaign.module.entities.map(e => e.id);
    expect(ids.filter(id => /^(imbar|dun_ri)$|^plane_(fire|water|air|earth)/.test(id))).toEqual([]);
    expect(t.campaign.module.entities.find(e => e.id === 't__system')?.space?.parent).toBeUndefined();
    const imbar = await Tiny.start(kyr);
    expect(imbar.campaign.module.entities.some(e => e.id === 'imbar')).toBe(true);
  });
});
