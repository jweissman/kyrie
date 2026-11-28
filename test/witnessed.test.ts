import { describe, expect, it } from 'bun:test';
import { Tiny } from './support/tiny';
import { PlayerView } from '../src/presentation/player-view';
import { ActionFeedbackView } from '../src/presentation/action-feedback';

// The company is told only what it saw, as it happened (the architecture review's A6, from its probe
// know-witness-offscreen): on a two-hour road it was told "You witness: Old Bede sweeps the camp clean" of what was
// done at the camp in the road's first minutes, and a hermit's curse laid on the camp from his far hermitage.
describe('what the company witnesses', () => {
  it('is what was done where it was, while it was there', async () => {
    const kyr = `Module m "Witness probe" {
  Place camp "the camp" is room.
  Place keep "the keep" is room.
  Place hermitage "the far hermitage" is room.
  Passage road "the long road" is road between keep and camp taking 2 hours.
  Company party "You" of 1 at keep.
  Person bede "Old Bede" at camp { Role "a miller". Ancestry human. Peaceable. }
  Person hermit "the hermit" at hermitage { Role "a hermit". Ancestry human. Peaceable. }
  Relation swept(place). Relation cursed(place).
  Action sweep(actor: group, site: place) "Sweep {site}" {
    Requires able(actor) and at(actor, site) and not swept(site).
    On success { Assert swept(site). }
    Seen "{actor} sweeps {site} clean.".
  }
  Action curse(actor: group, target: place, home: place) "Lay a curse on {target}" {
    Requires able(actor) and at(actor, home) and not cursed(target).
    On success { Assert cursed(target). }
  }
  Pursuit tidy for bede "keeping {camp} tidy" priority 10 when true seeks swept(camp) using sweep.
  Pursuit spite for hermit "cursing {camp}" priority 10 when true seeks cursed(camp) using curse.
  Goal false.
}`;
    const t = await Tiny.start(kyr, { seed: 'witness', horizon: [] }), s = t.session, c = s.campaign;
    const go = PlayerView.choices(c).find(r => r.action.schema === 'go')!, before = PlayerView.observe(c);
    const e = await s.leg(go.choice.id);
    // Both were done, as the road began; the company saw neither.
    expect((e.npc ?? []).length).toBe(2);
    expect((e.npc ?? []).map(n => [n.actor, n.goal])).toEqual([['m__bede', 'tidy'], ['m__hermit', 'spite']]);
    expect(ActionFeedbackView.read(c, e, before).immediate.filter(t => t.startsWith('You witness'))).toEqual([]);
    expect(PlayerView.chronicle(c).filter(x => x.kind === 'npc')).toEqual([]);
  }, 60000);
});
