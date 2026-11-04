import { describe, expect, it } from 'bun:test';
import { Glanced } from './support/glanced';
import { PlayerView } from '../src/presentation/player-view';
import { Undertakings } from '../src/presentation/undertakings';

// What the page leads with is what the aim followed asks (the owner, 4 November: talking to Theren about the rats
// was not marked while the rats job was followed, and the first thing on each page was). Family leads while the
// company's own errand is followed (see glance-kite); while a job is, the job's way leads, and the brother after it.
describe('the aim followed leads', () => {
  it('a job followed puts its way first, ahead of a brother on the rail', async () => {
    const g = await Glanced.country('kite'), c = g.campaign;
    const take = async (re: RegExp) => {
      const row = PlayerView.choices(c).find(x => re.test(x.choice.name));
      if (!row) { throw new Error(`No ${re}`); }
      return g.perform(row.choice.id);
    };
    // The rats are under the town the company comes to first, its brother's.
    await g.to('region__s2_shop');
    await take(/^Ask .* about the rats/);
    Undertakings.follow(c, 'region__s2_u_rats_job_aim');
    const glance = await g.to('region__s2_green');
    const brother = glance.acts.find(a => a.choice === 'drover__son#talk');
    expect(glance.acts[0]!.choice).not.toBe('drover__son#talk');
    expect(brother?.why).not.toBe('kin');
  }, 120000);
});
