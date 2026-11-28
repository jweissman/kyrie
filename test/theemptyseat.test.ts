import { describe, expect, it } from 'bun:test';
import { Journey } from '../src/session/journey';
import { KyrLint } from '../src/cli/kyr-lint';
import { Consequence, Endings } from '../src/lang/index';
import steps from './fixtures/theemptyseat/journey.json';

describe("The Empty Seat", () => {
  const campaign = 'data/campaigns/theemptyseat.campaign.json';
  it('lints clean', async () => {
    expect((await KyrLint.campaign(campaign)).filter(f => f.level === 'error')).toEqual([]);
  });
  it('reveals the rival heir, stops the courier, and carries either evidence decision forward', async () => {
    for (const [choice, event] of [[steps.keepEvidence, 'ri_evidence_kept'],
      [steps.burnEvidence, 'ri_evidence_sacrificed']] as const) {
      const j = await Journey.start(campaign, 'succession', { strict: true });
      await j.play(...steps.succession, ...choice);
      expect(j.holds('befell', 'ri_succession_open')).toBe(true);
      expect(j.holds('knows', 'party', 'gareth_refuses')).toBe(true);
      expect(j.holds('befell', 'ri_heir_revealed')).toBe(true);
      expect(j.holds('courierStopped', 'party')).toBe(true);
      expect(j.holds('befell', 'ri_court_betrayed')).toBe(false);
      expect(j.holds('knows', 'party', 'aled_wants')).toBe(true);
      expect(j.holds('promiseMade', 'shelter_promise')).toBe(true);
      expect(j.holds('befell', event)).toBe(true);
      expect(Endings.reached(j.campaign.world)).toBeUndefined();
      expect(Consequence.census(j.campaign.module).filter(a => a.id.startsWith('theemptyseat__'))).toEqual([]);
    }
  });
  it('offers the Guild dues, skilled hireling, mathematical relic, and odd prize', async () => {
    const j = await Journey.start(campaign, 'guild', { strict: true });
    const gold = j.measure('quantity', 'party', 'gold');
    await j.play(...steps.guild);
    expect(j.holds('guild_member', 'party')).toBe(true);
    expect(j.holds('travelsWith', 'scout', 'party')).toBe(true);
    expect(j.holds('knows', 'party', 'ninefold_found')).toBe(true);
    expect(j.holds('recovered', 'ninefold_disk')).toBe(true);
    expect(j.holds('knows', 'party', 'goose_prize')).toBe(true);
    expect(j.measure('quantity', 'party', 'gold')).toBe(gold - 7);
  });
  it('lets the Ferryman learn the council place when the company lets an hour pass', async () => {
    const j = await Journey.start(campaign, 'deadline', { strict: true });
    await j.play(steps.succession[0]!, '=+6');
    expect(j.holds('befell', 'ri_court_betrayed')).toBe(true);
  });
  it('makes the earlier Guild expedition provide a costly alternative to the missing escorts', async () => {
    const j = await Journey.start(campaign, 'pressure', { strict: true });
    const ward = 'theemptyseat__ward';
    await j.play(...steps.guild, '>theemptyseat__square',
      ...steps.succession.filter(step => step !== "Tell Hest about Tarian's bargain"), ...steps.keepEvidence,
      '>theemptyseat__guild_hall', "Ask Tarian to carry the Queen's summons", '=until matterOpen(welcome)',
      'Send a wall escort to bring the detained visitor in',
      '>theemptyseat__oath_hall', '=until matterOpen(shelter)');
    expect(j.find('Commit the watch and stores to bring the refugee carts in')).toBeUndefined();
    expect(j.holds('carries', 'party', 'ninefold_disk')).toBe(true);
    await j.play('Spend the Ninefold Disk to hold the gate for the refugees', '=until matterOpen(war_command)',
      'Ask Aled to take the crown and answer for the open gate', '=until siegeSettled(party)');
    expect(Endings.reached(j.campaign.world)?.title).toBe('The beds without crowns');
    expect(j.holds('carries', 'party', 'ninefold_disk')).toBe(false);
    expect(j.holds('befell', 'ri_evidence_kept')).toBe(true);
    expect(j.measure('wardDefence', ward)).toBeGreaterThanOrEqual(j.measure('assaultStrength', ward));
  });
});
