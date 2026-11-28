import { describe, expect, it } from 'bun:test';
import { Tiny } from '../support/tiny';
import { PlayerView } from '../../src/presentation/player-view';
import { CrossingRefused } from '../../src/campaign/crossing-refused';
import { Crossing } from '../../src/campaign/crossing';
import { ModuleWriter } from '../../src/lang/module-writer';
import { CampaignLint } from '../../src/cli/campaign-lint';
import { CrossingLint } from '../../src/cli/crossing-lint';

// An act that is no way gone by and would put the company in another hex is never offered and is refused if sent; one
// that puts it somewhere else in its own hex is done as written; and the lint says the first is an error, in its own
// words (TR-20; the owner, 19 November: "I got from my quest destination back to town without the map"). A land of
// two stretches of fen drawn by hand, a quay and a boat-shed in the near one, the far bank in the other.
class Fen {
  static readonly land = `
    Place region "the Reedlands" is region.
    Place t0 "the near fen" is wilderness within region at 0, 0.
    Place t1 "the far fen" is wilderness within region at 1, 0.
    Place quay "the quay" is room within t0 outdoors.
    Place shed "the boat-shed" is room within t0 indoors.
    Place bank "the far bank" is room within t1 outdoors.
    Passage quay_shed "the shed door" is door between quay and shed.
    Company party "You" of 1 at quay.
    Action ferry_over(actor: group, site: place) "Take the ferry over the fen" {
      Requires at(actor, site) and at(actor, quay). On success { Retract at(actor, quay). Assert at(actor, bank). }
      Result "Over the fen.". }
    Action slip_in(actor: group, site: place) "Slip into the boat-shed by the slipway" {
      Requires at(actor, site) and at(actor, quay). On success { Retract at(actor, quay). Assert at(actor, shed). }
      Result "In.". }
    Goal false.`;
  static start() {
    return Tiny.start(this.land, { horizon: [], chart: { width: 2, height: 1, cover: '..', rivers: [], roads: {}, parts: {},
      places: { t0: 0, t1: 1 } } });
  }
  static offered(t: Tiny): string[] { return PlayerView.choices(t.campaign).map(r => r.action.schema ?? r.action.id); }
}
describe('an act that would cross into another hex', () => {
  it('is not offered, and is refused if sent, changing nothing', async () => {
    const t = await Fen.start(), clock = t.campaign.history.length;
    expect(Fen.offered(t)).not.toContain('t__ferry_over');
    const sent = t.session.perform('t__ferry_over(party,t__quay)');
    await expect(sent).rejects.toBeInstanceOf(CrossingRefused);
    expect([t.where(), t.campaign.history.length]).toEqual(['t__quay', clock]);
  });
  it('is refused where it is committed, should its words not have said it', async () => {
    const t = await Fen.start(), c = t.campaign, before = c.world;
    const after = before.apply([{ kind: 'retract', call: ModuleWriter.call('at', 'party', 't__quay') },
      { kind: 'assert', call: ModuleWriter.call('at', 'party', 't__bank') }]);
    const act = c.operators.get('t__slip_in(party,t__quay)')!;
    expect(act).toBeDefined();
    expect(() => Crossing.kept(c, act, before, after)).toThrow(CrossingRefused);
  });
  it('within its own hex is offered and done', async () => {
    const t = await Fen.start();
    expect(Fen.offered(t)).toContain('t__slip_in');
    await t.play('Slip into the boat-shed by the slipway');
    expect(t.where()).toBe('t__shed');
  });
  it('is an error of the lint, said in the act\'s own words', async () => {
    const t = await Fen.start(), lint = new CampaignLint('fen', t.session);
    CrossingLint.run(lint);
    expect(lint.findings.map(f => [f.level, f.check])).toEqual([['error', 'crossing']]);
    expect(lint.findings[0]!.message)
      .toMatch(/t__ferry_over "Take the ferry over the fen" puts the company at t__bank/);
  });
});
