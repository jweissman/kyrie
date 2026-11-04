import { describe, expect, it } from 'bun:test';
import { Journey } from '../src/session/journey';
import { CompanyRecall } from '../src/presentation/company-recall';

// The Book of Faces' gate 4 (BOF-15): a service its host refused the company had gone from the page, and nothing said
// why. Refused, it is shown without its command, saying who will not serve the company; served again, it is offered
// (test/fixtures/probes/refused).
describe('a service refused', () => {
  it('is shown, saying who refuses it, and offered once they serve the company again', async () => {
    const j = await Journey.start('test/fixtures/probes/refused/probe.campaign.json', 'r');
    const bed = () => j.screen().people.find(p => p.name.startsWith('Joan'))!.acts.flatMap(a => a.children ?? [a])
      .find(a => /^Take a bed/.test(a.label));
    expect([bed()?.command, bed()?.disabled]).toEqual([undefined, 'Joan will not serve you.']);
    expect(j.offers('Take a bed under the eaves')).toBe(false);
    await j.play('Pay Joan for the broken window');
    expect(bed()?.disabled).toBeUndefined();
    expect(j.offers('Take a bed under the eaves')).toBe(true);
  }, 30000);
});

// Where the company last spoke with someone is its own to remember, for the plan of the place (spatial-play.md): a
// name on the place where it spoke with them, not where they are now.
describe('where the company spoke with someone', () => {
  it('is kept, by the place it was', async () => {
    const j = await Journey.start('test/fixtures/probes/refused/probe.campaign.json', 'r');
    await j.play('Pay Joan for the broken window');
    await j.play('Wait');
    expect(CompanyRecall.of(j.campaign).spokeAt('p__taproom')).toEqual(['p__joan']);
  }, 30000);
});
