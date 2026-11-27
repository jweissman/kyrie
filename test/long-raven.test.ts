import { describe, expect, it } from 'bun:test';
import type { TickHost } from '../src/campaign/campaign-tick';
import { Consequences } from '../src/campaign/consequences';
import { Journey } from '../src/session/journey';
import { PlaySession } from '../src/session/play-session';
import { Placed } from './support/placed';
import { campaign, reflectedLanding } from './support/long-road';

describe('the raven among the panes', () => {
  it('brings the drawing news to Merren after a two-hour flight', async () => {
    const j = await Journey.start(campaign, 'mirror-message');
    j.assert('knows', 'party', 'lc_drawing_risk');
    Placed.at(j, 'tallow__green');
    await j.play('Sell the buyer a drawing of the entrances');
    const raid = j.measure('lcRaidAt', 'party');
    Placed.at(j, 'tallow__lc_ring');
    await j.play('Examine the balance beside the arch', 'Place the one-dot weight',
      'Place the three-dot weight', 'Place the five-dot weight',
      'Examine the pool beneath the balanced weights', 'To the reflected landing',
      'Lift the hook out of the standing water', 'To the room of panes', 'Ask the raven about the road');
    const food = j.measure('quantity', 'party', 'rations');
    await j.play('Give the raven a ration to carry news to Merren');
    expect(j.measure('quantity', 'party', 'rations')).toBe(food - 1);
    expect(j.measure('quantity', 'lc_mirror_raven', 'rations')).toBe(1);
    expect(j.holds('lcCrewSummoned', 'party')).toBe(false);
    const due = j.measure('lcRavenDue', 'party');
    expect(due - j.watch()).toBe(12);
    const resumed = Journey.of(PlaySession.resume(
      JSON.parse(JSON.stringify(j.session.checkpoint())), { trusted: true }));
    await resumed.play(`==${due - 1}`);
    expect(resumed.at('lc_mirror_raven')).not.toBe('tallow__taproom');
    expect(resumed.holds('lcCrewSummoned', 'party')).toBe(false);
    await resumed.play('==+1');
    expect(resumed.at('lc_mirror_raven')).toBe('tallow__taproom');
    expect(resumed.holds('lcCrewSummoned', 'party')).toBe(true);
    expect(resumed.measure('lcCrewStart', 'party')).toBe(due);
    expect(resumed.measure('lcRaidAt', 'party')).toBe(raid);
  }, 10000);

  it('does not deliver the message to a dead Merren', async () => {
    const j = await reflectedLanding('mirror-dead-merren');
    j.assert('lcStarted', 'party');
    await j.play('Lift the hook out of the standing water', 'To the room of panes', 'Ask the raven about the road',
      'Give the raven a ration to carry news to Merren');
    j.assert('struckDead', 'lc_quartermaster');
    Consequences.slay(j.campaign as unknown as TickHost);
    await j.play(`==${j.measure('lcRavenDue', 'party')}`);
    expect(j.at('lc_mirror_raven')).toBe('tallow__taproom');
    expect(j.holds('lcCrewSummoned', 'party')).toBe(false);
  }, 10000);
});
