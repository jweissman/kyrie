import { describe, expect, it } from 'bun:test';
import { PlaySession } from '../src/session/play-session';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { PlayerView } from '../src/presentation/player-view';
import { ModuleWriter } from '../src/lang/module-writer';

// The Varrow going on without the company: three weeks in Hollin while the Lanthorn's crew eat, the carters go
// down to the ford, the hobs raid the farms, and the Unlight grows night by night until the dark reaches the
// brigands' hall and drives them off the Gap. Nobody is paid for that.
describe('the valley without the company', () => {
  it('runs its own course over three weeks, and the dark ends the Toll that nobody earned', async () => {
    const s = await PlaySession.start('data/campaigns/varrow.campaign.json', 'living', NodeBundleSource.shared);
    const fact = (name: string, ...args: string[]) => s.campaign.world.test(ModuleWriter.call(name, ...args));
    const number = (name: string, ...args: string[]) => s.campaign.world.number(ModuleWriter.call(name, ...args));
    let supplied = false, provisions = number('lanthorn__provisions', 'lanthorn__lanthorn');
    for (let day = 0; day < 21; day++) {
      for (let h = 0; h < 24; h++) { await s.perform('wait_hour'); }
      const now = number('lanthorn__provisions', 'lanthorn__lanthorn');
      supplied ||= now > provisions;
      provisions = now;
    }
    // The crew ate and were resupplied, by the carters from the ford or from Skerry by force.
    expect(supplied).toBe(true);
    // The hobs were at the ford's farms.
    expect(number('knotFolk__losses', 'varrow__ford_green')).toBeGreaterThan(0);
    // The dark spread up through the Wick, reached the chapter house, and the crew ran.
    expect([fact('lightless', 'lanthorn__bottle_cellar'), fact('lightless', 'lanthorn__chapter_house'),
      fact('lanthorn__lifted', 'lanthorn__toll'), fact('lanthorn__earned', 'party')]).toEqual([true, true, true, false]);
    // In Hollin the temple's lamps say so; the reeve has nothing to pay for.
    const c = s.campaign as unknown as { world: { apply(c: unknown[]): unknown }; commit(w: unknown): void };
    c.commit(c.world.apply([{ kind: 'assert', call: ModuleWriter.call('at', 'party', 'varrow__lamp_temple') }]));
    await s.perform('wait');
    expect(PlayerView.observe(s.campaign).observations.map(o => o.text).join(' ')).toContain('burn low and blue');
    c.commit(c.world.apply([{ kind: 'assert', call: ModuleWriter.call('at', 'party', 'varrow__reeve_hall') }]));
    expect(PlayerView.choices(s.campaign).some(x => x.choice.id === 'lanthorn__claim_bounty')).toBe(false);
  }, 300000);
});
