import { describe, expect, it } from 'bun:test';
import { Journey } from '../src/session/journey';
import { KyrLint } from '../src/cli/kyr-lint';
import steps from './fixtures/windfall/journey.json';

// Windfall, played by the labels a player sees: an orchard that walks toward a churchyard over three nights, and the ways it can be stopped.
describe("Windfall", () => {
  const campaign = 'data/campaigns/windfall.campaign.json';
  const start = async () => Journey.start(campaign, "windfall");
  const reached = (j: Journey, ending: string) => j.holds('reached', 'windfall__' + ending);
  const wf = (id: string) => 'windfall__' + id;

  it('lints clean', async () => {
    expect((await KyrLint.campaign(campaign)).filter(f => f.level === 'error')).toEqual([]);
  }, 60000);

  it('is played from the sea-bank road to the commons, where a boy has named the trees', async () => {
    const j = await start();
    await j.play(...steps.arrive);
    expect(j.at('party')).toBe(wf('commons'));
    expect(j.page).toContain('Hobin');
  }, 60000);

  it('lets the orchard walk, a stage each night', async () => {
    const j = await start();
    await j.play(...steps.arrive, '=day 2 06:00');
    expect(j.measure('walked')).toBe(1);
    await j.play('=day 3 06:00');
    expect(j.measure('walked')).toBe(2);
  }, 60000);

  it('burns the orchard on the third night if nothing is done', async () => {
    const j = await start();
    await j.play(...steps.arrive, '=day 4 07:00');
    expect(j.holds('burning', 'party')).toBe(true);
    expect(reached(j, 'burned')).toBe(true);
    expect(j.page).toContain('black floor');
  }, 60000);

  it('will not cut Nance\'s pear for a stranger, and will for someone who knows what the orchard wants', async () => {
    const j = await start();
    await j.play(...steps.arrive, '=day 1 09:00', ...steps.gault, ...steps.yard);
    expect(j.offers("Ask Ellery for a cutting")).toBe(true);
    await j.play("Ask Ellery for a cutting");
    expect(j.page).toContain("I'll not cut her".replace("'", '’'));
    expect(j.holds('knows', 'party', wf('kin_known'))).toBe(false);
  }, 60000);

  it('grafts the scion onto the Mother Tree, and the orchard stops where it stands', async () => {
    const j = await start();
    await j.play(...steps.arrive, '=day 1 09:00', ...steps.gault, ...steps.yard, ...steps.orchard, ...steps.tell, ...steps.graft);
    expect(j.holds('grafted', 'party')).toBe(true);
    expect(j.holds('halted', 'party')).toBe(true);
    await j.play('=day 4 07:00');
    expect(j.measure('walked')).toBe(0);
    expect(reached(j, 'graft_only')).toBe(true);
    expect(j.page).toContain('same morning as the Mother Tree');
  }, 120000);

  it('crosses the Gault at the ebb and opens the sluice: salt out of the roots', async () => {
    const j = await start();
    await j.play(...steps.arrive, '=day 1 09:00', ...steps.gault, ...steps.yard, ...steps.orchard, ...steps.gate);
    expect(j.holds('state', wf('wheel'), wf('open'))).toBe(true);
    expect(j.holds('halted', 'party')).toBe(true);
    await j.play('=day 4 07:00');
    expect(reached(j, 'salt_out')).toBe(true);
  }, 120000);

  it('does both, and the orchard is held and fed', async () => {
    const j = await start();
    await j.play(...steps.arrive, '=day 1 09:00', ...steps.gault, ...steps.yard, ...steps.orchard, ...steps.tell, ...steps.graft, ...steps.gate, '=day 4 07:00');
    expect(reached(j, 'both_banks')).toBe(true);
  }, 120000);

  it('turns the writ aside by learning the orchard is the dike', async () => {
    const j = await start();
    await j.play(...steps.arrive, '=day 1 09:00', ...steps.gault, ...steps.yard, ...steps.orchard, ...steps.gate);
    expect(j.holds('knows', 'party', wf('dike_known'))).toBe(true);
  }, 120000);

  it('buys Bryony off with the prunings, and the orchard walks through the churchyard', async () => {
    const j = await start();
    await j.play(...steps.arrive, '=day 1 09:00', ...steps.pans, ...steps.prunings, ...steps.offer);
    expect(j.holds('bryonyEased', 'party')).toBe(true);
    await j.play('=day 4 07:00');
    expect(j.measure('walked')).toBe(3);
    expect(reached(j, 'midwinter')).toBe(true);
    expect(j.page).toContain('does not touch a stone');
  }, 120000);

  it('rolls the trail of windfalls so the orchard comes onto the commons', async () => {
    const j = await start();
    await j.play(...steps.arrive, '=day 1 09:00', ...steps.gault, ...steps.pans, ...steps.prunings, ...steps.offer, ...steps.trail, '=day 4 07:00');
    expect(j.holds('trailed', 'party')).toBe(true);
    expect(j.measure('walked')).toBe(4);
    expect(reached(j, 'green')).toBe(true);
  }, 120000);

  it('is hurt by the quick mud on the causeway unless a boy has said where the ground holds', async () => {
    const j = await start();
    await j.play(...steps.arrive, '=day 1 17:00');
    expect(j.holds('state', wf('mud'), wf('soft'))).toBe(true);
    await j.play(...steps.gault);
    expect(j.holds('state', wf('mud'), wf('marked'))).toBe(true);
  }, 60000);

  it('turns the writ with the marks in the sluice-house, and keeps the vigil as the orchard walks through the churchyard', async () => {
    const j = await start();
    await j.play(...steps.arrive, ...steps.gault, ...steps.marks, ...steps.reason);
    expect(j.holds('reprieved', 'party')).toBe(true);
    expect(j.holds('halted', 'party')).toBe(false);
    await j.play(...steps.vigil, '=day 4 05:00');
    expect(j.page).toContain('Is it?');
    await j.play('=day 4 07:00');
    expect(reached(j, 'midwinter')).toBe(true);
  }, 120000);
});
