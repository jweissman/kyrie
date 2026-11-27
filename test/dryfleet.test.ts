import { describe, expect, it } from 'bun:test';
import { Journey } from '../src/session/journey';
import { KyrLint } from '../src/cli/kyr-lint';
import steps from './fixtures/dryfleet/journey.json';

// The Sea Is Late, played by the labels a player sees. The company comes down the Landfall road at eight on the first
// morning; the sea returns at eighteen hundred on the third day. Where the company stands then, and what it did, is the ending.
const campaign = 'data/campaigns/dryfleet.campaign.json';
const S: typeof steps & Record<string, string[]> = steps;
describe("The Sea Is Late", () => {
  const start = async (...parts: string[]) => {
    const j = await Journey.start(campaign, "dryfleet");
    for (const p of parts) { await j.play(...S[p]!); }
    return j;
  };
  const ended = (j: Journey) => j.campaign.world.related('reached').map(r => String(r.args[0]).replace('dryfleet__', ''));
  // Everything done well: Tamsin brought, the slate turned, the Brightwork's hoard in the Pleasance, the lamp lit.
  const best = ['arrive', 'join', 'hesper', 'cross', 'rise', 'reunion', 'skellow', 'philomel', 'ballast', 'light'];

  it('lints clean', async () => {
    expect((await KyrLint.campaign(campaign)).filter(f => f.level === 'error' || f.level === 'warning')).toEqual([]);
  }, 60000);

  it('is played from the road onto the harbour wall', async () => {
    const j = await start('arrive');
    expect(j.at('party')).toBe('dryfleet__wall');
  }, 60000);

  it("two signs turn Hesper's slate from OUT to DRAWING, and it reads IN once the sea is back", async () => {
    const j = await start('arrive', 'join');
    await j.play('To the foot of the slipway', 'To the quay', 'To the harbour wall', 'Tell Hesper the stain');
    expect(j.holds('hesperBelieves', 'party')).toBe(false);
    await j.play('Tell Hesper the gulls');
    expect(j.holds('hesperBelieves', 'party')).toBe(true);
    await j.play('To the quay');
    expect(j.holds('state', 'slate', 'drawing')).toBe(true);
    await j.play('To the harbour wall', ...S.sea);
    expect(j.holds('state', 'slate', 'in')).toBe(true);
    expect(ended(j)).toContain('town_believed');
  }, 120000);

  it('a company in Landfall that never persuaded Hesper sees the harbour fill anyway', async () => {
    const j = await start('arrive', 'sea');
    expect(ended(j)).toContain('town_unbelieved');
  }, 120000);

  it('the Orlo ride crosses the marl when the wind is up', async () => {
    const j = await start('arrive', 'join');
    await j.play('To Carrick');
    j.assert('windUp', 'party');
    await j.play('Ask Orlo to run you out');
    expect(j.at('party')).toBe('dryfleet__landing');
    expect(j.at('orlo')).toBe('dryfleet__landing');
  }, 120000);

  it("Tamsin at the Wet Bar moves Samphire, who is otherwise angry for good", async () => {
    const j = await start('arrive', 'join', 'cross', 'reunion');
    expect(j.holds('samphireMoved', 'party')).toBe(true);
    await j.play(...S.sea);
    expect(ended(j)).toContain('bar_moved');
  }, 180000);

  it('the Wet Bar without Tamsin floats all the same', async () => {
    const j = await start('arrive', 'cross');
    await j.play('To the Wet Bar', ...S.sea);
    expect(ended(j)).toContain('bar_alone');
  }, 180000);

  it('the Pleasance without ballast goes over', async () => {
    const j = await start('arrive', 'cross', 'rise');
    await j.play('To the Pleasance', ...S.sea);
    expect(ended(j)).toContain('stage_over');
  }, 180000);

  it('Skellow gives up the hoard once he is caught out, and the Pleasance rides level with its last couplet', async () => {
    const j = await start('arrive', 'join', 'cross', 'rise', 'skellow', 'philomel', 'ballast');
    expect(j.holds('skellowAgreed', 'party')).toBe(true);
    expect(j.holds('pleasanceBallasted', 'party')).toBe(true);
    expect(j.holds('knows', 'party', 'plot_known')).toBe(true);
    await j.play('To the Pleasance', ...S.sea);
    expect(ended(j)).toContain('stage_up');
  }, 240000);

  it('the Tern Light lit, the sea comes to a lamp room with a beam in it', async () => {
    const j = await start(...best);
    expect(j.holds('state', 'tern_lamp', 'lit')).toBe(true);
    await j.play(...S.sea);
    expect(ended(j)).toContain('light_lit');
  }, 240000);

  it('the Tern Light dark: the Fleet goes onto the Teeth', async () => {
    const j = await start('arrive', 'cross', 'rise');
    await j.play('Into the Rise', ...S.sea);
    expect(ended(j)).toContain('light_dark');
  }, 180000);

  it('a company caught on the open flat is found in the spring', async () => {
    const j = await start('arrive', 'cross');
    await j.play(...S.sea);
    expect(ended(j)).toContain('caught');
  }, 180000);
});
