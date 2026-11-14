import { describe, expect, it } from 'bun:test';
import { Tiny } from '../support/tiny';
import { PlayerView } from '../../src/presentation/player-view';
import { PlaySession } from '../../src/session/play-session';

// The Landholder (the owner, 15 November: a player verb as a pin): acquire a small parcel, commission a change to it,
// go away, come back, and find the change has become part of the world, through a save and a load. Written in Kyr
// with what it already has (spending coin, a watch to wait on, a rule, a fact, an observation by state): nothing here
// is hardcoded in the engine, which is what is being asked. A hythe, its green, a plot by the stream, and a market to
// go to.
const hythe = `
  Place hythe "Hythe" is settlement.
  Place green "the green at Hythe" is room within hythe at 0, 0 outdoors.
  Place plot "the plot by the stream" is room within hythe at 1, 0 outdoors.
  Place market "the market" is room within hythe at 0, 1 outdoors.
  Passage footpath "the footpath" is door between green and plot.
  Passage lane "the market lane" is door between green and market.
  Company party "You" of 1 at green.
  Initially Set quantity(party, gold) to 40.
  Relation deeded(group, place). Relation building(place). Relation built(place). Measure raised_at(place).
  Action buy_plot(actor: group, site: place) "Buy the plot for 20 coin" {
    Requires able(actor) and at(actor, site) and at(actor, plot) and not deeded(actor, plot) and quantity(actor, gold) >= 20.
    Time 5.
    On success { Decrease quantity(actor, gold) by 20. Assert deeded(actor, plot). }
    Result "The deed is written and sealed: the plot is yours.".
  }
  Action raise_hut(actor: group, site: place) "Pay for a hut to be raised on the plot" {
    Requires able(actor) and at(actor, site) and at(actor, plot) and deeded(actor, plot) and not building(plot)
      and not built(plot) and quantity(actor, gold) >= 10.
    Time 5.
    On success { Decrease quantity(actor, gold) by 10. Assert building(plot). Set raised_at(plot) to watch(clock). }
    Result "The carpenter takes the coin, and says it will be done by the evening.".
  }
  Rule hut_raised when building(plot) and not built(plot) and watch(clock) >= raised_at(plot) + 30 {
    Retract building(plot). Assert built(plot).
  }
  Observe plot_bare at plot as fixture when not built(plot) "A bare plot by the stream, with reeds along its edge.".
  Observe plot_hut at plot as fixture when built(plot) "A hut of new timber stands by the stream, smoke at its chimney.".
  Goal false.`;

const seen = (c: Tiny['campaign']) => PlayerView.observe(c).observations.map(o => o.text).join(' | ');
const deeded = (t: Tiny) => t.world.related('t__deeded', 'party').length;
const built = (t: Tiny) => t.world.related('t__built').length;

describe('a landholder', () => {
  it('buys a plot, has a hut raised on it, goes away, and comes back to find it standing', async () => {
    const t = await Tiny.start(hythe);
    await t.play('To the plot by the stream');
    expect(t.journey.choices().some(c => /^Buy the plot for 20 coin/.test(c.label))).toBe(true);
    expect(t.journey.choices().some(c => /hut to be raised/.test(c.label))).toBe(false);
    expect(seen(t.campaign)).toMatch(/A bare plot/);
    await t.play('Buy the plot');
    expect([deeded(t), t.screen.purse.coin]).toEqual([1, 20]);
    expect(t.journey.choices().some(c => /^Buy the plot/.test(c.label))).toBe(false);
    await t.play('Pay for a hut to be raised');
    // Commissioned, not yet standing: the change takes time.
    expect([built(t), t.screen.purse.coin, seen(t.campaign)]).toEqual([0, 10, expect.stringMatching(/A bare plot/)]);
    await t.play('To the green', 'To the market');
    await t.play(...Array.from({ length: 6 }, () => 'Wait › An hour'));
    await t.play('To the green', 'To the plot by the stream');
    expect(built(t)).toBe(1);
    expect(seen(t.campaign)).toMatch(/hut of new timber/);
    expect(seen(t.campaign)).not.toMatch(/A bare plot/);
  });
  it('keeps it through a save and a load', async () => {
    const t = await Tiny.start(hythe);
    await t.play('To the plot by the stream', 'Buy the plot', 'Pay for a hut to be raised', 'To the green',
      ...Array.from({ length: 6 }, () => 'Wait › An hour'), 'To the plot by the stream');
    const again = PlaySession.fromSave(t.campaign.save(), 'tiny');
    expect(again.campaign.world.related('t__built').length).toBe(1);
    expect(again.campaign.world.related('t__deeded', 'party').length).toBe(1);
    expect(seen(again.campaign)).toMatch(/hut of new timber/);
  });
});
