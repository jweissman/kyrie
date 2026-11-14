import { describe, expect, it } from 'bun:test';
import { Tiny } from '../support/tiny';

// A ford in spate is risked, not walked (data/generation/wild/roads.kyrt): a journey goes round by a bridge where there
// is one, and stops at the ford, saying why, where there is not. The adventure branch's silent-lord-turns had failed
// where rain put a ford in spate, its walk planned by ways that ignored the river (AI-02, integration notes §1); the
// walk (Journey.way) and the map's journey (Travel, by Itineraries.plan) are held to the same here. Two banks of a
// river, a ford straight across, and a bridge downstream, the longer way round, that a company come up from the lower
// bank knows of (a journey plans over the ways known: Itineraries).
const river = (bridge: boolean) => `
  Place vale "the vale" is wilderness.
  Place near "the near bank" is room within vale at 0, 0 outdoors.
  Place far "the far bank" is room within vale at 1, 0 outdoors.
  Place down "the lower bank" is room within vale at 0, 1 outdoors.
  Passage ford "the ford" is path between near and far.
  ${bridge ? `Passage lane "the lane" is path between near and down.
  Passage bridge "the bridge" is path between down and far.` : ''}
  Company party "You" of 1 at ${bridge ? 'down' : 'near'}.
  Hazard swept "Swept off the ford" means "Deal (1d6) physical damage to ally unless strength save against (12).".
  Thing water "the Fishwater" on ford is scenery {
    State low "The Fishwater runs knee-deep over the ford stones.".
    State spate dangerous "The Fishwater is in spate over the ford.".
    Hurts with swept when spate then spate.
  }
  Initially Assert state(water, spate).
  Goal false.`;

describe('a ford in spate', () => {
  it('is gone round by the bridge, by the map’s journey and by a walk', async () => {
    // Come up from the lower bank, the company knows the bridge (Itineraries plan over the ways known).
    const t = await Tiny.start(river(true));
    await t.perform('go(t__lane,t__near)');
    expect(t.journey.choices().some(c => c.command === 'go(t__ford,t__far)')).toBe(false);
    await t.session.leg('travel:t__far');
    expect([t.where(), t.session.journeyed?.legs.map(l => l.command)])
      .toEqual(['t__far', ['go(t__lane,t__down)', 'go(t__bridge,t__far)']]);
    const w = await Tiny.start(river(true));
    await w.perform('go(t__lane,t__near)');
    await w.play('>t__far');
    expect(w.where()).toBe('t__far');
  });
  it('stops the journey at the ford where there is no bridge, saying it is in spate, and leaves it to be risked', async () => {
    const t = await Tiny.start(river(false));
    await t.session.leg('travel:t__far');
    expect([t.where(), t.session.journeyed?.stopped]).toEqual(['t__near', expect.stringMatching(/spate/)]);
    expect(t.journey.choices().some(c => c.command.startsWith('risk(t__water,'))).toBe(true);
  });
});
