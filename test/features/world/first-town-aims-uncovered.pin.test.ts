import { describe, expect, it } from 'bun:test';
import { NodeBundleSource } from '../../../src/campaign/node-bundle-source';
import { PlayerView } from '../../../src/presentation/player-view';
import { Journey } from '../../../src/session/journey';
import { DrawnWorld } from '../../../src/client/drawn-world';
import { Placed } from '../../support/placed';

const start = async () => Journey.of(await DrawnWorld.start('thorn', {
  origin: 'wanderer', party: [{ name: 'Wenna', raceId: 'human', classId: 'warrior' }]
}, NodeBundleSource.shared));
const hasAim = (j: Journey, id: string) => PlayerView.observe(j.campaign).objectives?.some(o => o.id === id) ?? false;

describe('World › First-town aims uncovered by investigation', () => {
  it('reveals the keep, the Walk and the career only after asking or searching', async () => {
    const j = await start();
    await j.play('To the landing', 'Read the notice on the well-post', 'Into .*', 'Out .*',
      '==day 2 09:00', '>s1_green');
    expect(Placed.holds(j, 'knows', 'party', 'keep__levy_called')).toBe(true);
    expect(Placed.holds(j, 'knows', 'party', 'keep__lord_unseen')).toBe(false);
    expect([hasAim(j, 'keep__keep_rumoured'), hasAim(j, 'walk__find_walk'), hasAim(j, 'career__dragon')])
      .toEqual([false, false, false]);

    const keeper = j.campaign.world.one('at', 'region__s1_innkeeper');
    expect(keeper).toBeDefined();
    Placed.at(j, keeper!);
    await j.play('Ask .* about the crier');
    expect(Placed.holds(j, 'knows', 'party', 'keep__lord_unseen')).toBe(true);
    expect(hasAim(j, 'keep__keep_rumoured')).toBe(true);

    await j.play('>walk__camp_a', 'Ask .* where the Walk is going');
    expect(hasAim(j, 'walk__find_walk')).toBe(true);

    await j.play('>s1_green');
    for (let tries = 0; tries < 20 && !hasAim(j, 'career__dragon'); tries++) {
      await j.play('Search under the notices for the Rì\'s commission');
    }
    expect(hasAim(j, 'career__dragon')).toBe(true);
  }, 300000);
});
