import { describe, expect, it } from 'bun:test';
import { DrawnWorld } from '../src/world/drawn-world';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { Journey } from '../src/session/journey';
import { PlayerView } from '../src/presentation/player-view';
import { ScreenModel } from '../src/ui/screen-model';
import { Narrator } from '../src/presentation/narrator';
import { Undertakings } from '../src/presentation/undertakings';
import type { PlaySession } from '../src/session/play-session';

// The aim's gold where the aim is (round 7, both players): in the rats' nest, with the nest's aim followed and the
// old buck rat that keeps it in front of the company, the page had led "To the old drain, toward your aim" past it;
// and once it was dead, the aim gone on to the merchant owed word of it, nothing led back up toward him.
describe('the rats\' nest', () => {
  const choose = async (s: PlaySession, pattern: RegExp) => {
    const c = PlayerView.choices(s.campaign).find(x => pattern.test(x.choice.id));
    if (c) { await s.perform(c.choice.id); }
  };
  const glance = (s: PlaySession) => Narrator.leaf(s.campaign, ScreenModel.build(s.campaign)).glance!;
  it('leads at the buck rat for the aim, and then back up toward the one owed word of it', async () => {
    const s = await DrawnWorld.start('kahitude', { origin: 'debt', party: [{ name: 'Ralf', raceId: 'human',
      classId: 'warrior' }] }, NodeBundleSource.shared);
    const walk = async (to: string) => {
      for (const [passage, next] of Journey.way(s.campaign.world, s.campaign.world.one('at', 'party')!, to)) {
        if (!PlayerView.choices(s.campaign).some(x => x.choice.id === `go(${passage},${next})`)) {
          await choose(s, /unlock|open/);
        }
        await s.leg(`go(${passage},${next})`);
        if (/cellar/.test(next)) { await choose(s, /^light_item\(/); }
      }
    };
    await walk(s.campaign.world.one('at', 'region__s1_merchant')!);
    await choose(s, /rats_job_ask/);
    await walk('region__s1_u_warren');
    await s.perform('attack(region__s1_u_rats)');
    // The nest's aim followed, as both players chose it.
    Undertakings.follow(s.campaign, 'region__s1_u_rats_job_run');
    await choose(s, /nest_way/);
    await choose(s, /^light_item\(/);
    const before = glance(s), gold = before.acts.find(a => a.continues);
    expect(gold?.command).toBe('attack(region__s1_u_buck)');
    expect(before.acts.filter(a => a.why === 'toward')).toEqual([]);
    await s.perform('attack(region__s1_u_buck)');
    expect(glance(s).acts.find(a => a.continues)?.exit).toBe('exit:region__s1_u_warren');
  }, 120000);
});
