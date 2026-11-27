import { describe, expect, it } from 'bun:test';
import type { TickHost } from '../src/campaign/campaign-tick';
import { Consequences } from '../src/campaign/consequences';
import { Journey } from '../src/session/journey';
import { PlaySession } from '../src/session/play-session';
import { reflectedLanding } from './support/long-road';

describe('the water behind the measure', () => {
  it('lets the company free the guardian and use the panes to see real road positions', async () => {
    const j = await reflectedLanding('mirror-mercy');
    expect(j.at('party')).toBe('tallow__lc_mirror_landing');
    expect(j.at('lc_mirror_guard')).toBe('tallow__lc_mirror_landing');
    expect(j.holds('able', 'lc_mirror_guard')).toBe(true);
    await j.play('Lift the hook out of the standing water', 'To the room of panes');
    expect(j.at('lc_mirror_guard')).toBe('tallow__lc_mirror_depths');
    expect(j.holds('tolerates', 'lc_mirror_guard', 'party')).toBe(true);
    expect(j.seen()).toContain('show no road guard');

    j.put('lc_vanguard', 'calx_portal');
    j.put('lc_crew', 'calx_portal');
    expect(j.seen()).toContain('armed people beside the western portal');
    expect(j.seen()).toContain('the masons and their cart are visible');
    j.put('lc_vanguard', 'calx_way');
    expect(j.seen()).toContain('armed people on the old road');
    expect(j.seen()).not.toContain('armed people beside the western portal');
    j.put('lc_vanguard', 'gate_house');
    expect(j.seen()).toContain('armed people at the Calx Gate');
    j.assert('struckDead', 'lc_vanguard');
    Consequences.slay(j.campaign as unknown as TickHost);
    j.campaign.refreshProjection();
    expect(j.seen()).toContain('show no road guard');
    expect(j.seen()).not.toContain('armed people at the Calx Gate');

    await j.play('Study the terraces in the panes');
    expect(j.holds('knows', 'party', 'lc_mirror_city')).toBe(true);
    const resumed = Journey.of(PlaySession.resume(
      JSON.parse(JSON.stringify(j.session.checkpoint())), { trusted: true }));
    await resumed.play('To the reflected landing');
    expect(resumed.seen()).toContain('hook lies open');
    expect(resumed.seen()).not.toContain('held to the floor by a black hook');
    await resumed.play('To the drowned ring');
    expect(resumed.at('party')).toBe('tallow__lc_ring');
    expect(resumed.at('lc_mirror_guard')).toBe('tallow__lc_mirror_depths');
  }, 10000);

  it('can be fought instead of released', async () => {
    const j = await reflectedLanding('mirror-fight');
    await j.fight('Attack');
    expect(j.taken.at(-1)!.event.combat.some(e => e.type === 'initiative')).toBe(true);
    expect(j.holds('lcMirrorReleased', 'party')).toBe(false);
  }, 10000);

});
