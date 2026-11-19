import { describe, expect, it } from 'bun:test';
import { Tiny } from '../support/tiny';
import { Offers } from '../../src/presentation/offer';
import { Promotion, type Candidate } from '../../src/ui/promotion';
import type { Promoted, Why } from '../../src/presentation/glance-types';

// The four fill only from what has a reason to be led, and are fewer rather than made up (GRAMMAR: "where there are
// fewer good choices, there are fewer, and none is made up"; the atlas study, Model A: AT-01). Offers.scene had filled
// them with any legal act of a type not yet shown: a quarter of the census's rows had no reason at all (waits, ways,
// talks, daylight torches, preparing spells), and in the study's tiny square, the aim followed, a reasoned act that
// Promotion's two-talk cap had passed over (listening to the crowd) gave way to "Wait a while" (report §5.3).
const square = `
  Place square "the market square" is room at 0, 0 outdoors.
  Place lockup "the lockup" is room at 1, 0.
  Passage lockdoor "the lockup door" is door between square and lockup.
  Company party "You" of 1 at square.
  Person reeve "Odda" at square { Role "the reeve". Ancestry human. Peaceable. Pronouns she. }
  Person cyril "Cyril" at square { Role "a sellsword". Ancestry human. Peaceable. Pronouns he. }
  Person crowd "the crowd at the well" at square { Role "townsfolk". Ancestry human. Peaceable. Pronouns they. }
  Person baker "Hamm" at square { Role "the baker". Ancestry human. Peaceable. Pronouns he. }
  Relation freed(group).
  Entity mood: fact "The square blames the reeve, not the boy.".
  Initially Assert established(mood).
  Initially Assert willing(cyril, party). Initially Set hire(cyril) to 5. Initially Set quantity(party, gold) to 20.
  Action plead_boy(actor: group, site: place) "Ask Odda to let the toll-boy out of the lockup" {
    Speaker reeve.
    Requires able(actor) and at(actor, site) and at(reeve, site) and not freed(actor).
    Time 10. Resolve check(actor, persuasion, dc_hard). On success { Assert freed(actor). }
    Result "Odda sighs, and sends for the key.". Otherwise "'He stays until the assize,' says Odda.".
  }
  Action sound_out(actor: group, site: place) "Listen to what the square is saying of the reeve" {
    Speaker crowd.
    Requires able(actor) and at(actor, site) and at(crowd, site) and not knows(actor, mood).
    Time 10. Resolve check(actor, insight, dc_fair). On success { Assert knows(actor, mood). }
    Result "The square blames the reeve, not the boy.". Otherwise "Nobody says anything to a stranger.".
  }
  Topic flour with baker "Ask Hamm how trade is" when true once { Says "'The miller short-weights us,' says Hamm.". }
  Objective boy when not freed(party) "The toll-boy is in the lockup for a toll he says he paid.".
  Goal false.`;
const party = [{ name: 'Aud', raceId: 'human', classId: 'bard' }];

const c = (choice: string, kind: Candidate['kind'], whys: Why[], order: number): Candidate =>
  ({ choice, label: choice, command: choice, kind, whys, order, marks: [] });

describe('the four, by reason', () => {
  it('fill from what has a reason, a reasoned act a cap passed over before none, and nothing reasonless', () => {
    // Led: one talk; passed over: a second talk with something to learn; reasonless: a wait, a way, a torch.
    const led: Promoted[] = Promotion.pick([c('cyril', 'talk', ['companion'], 0)], { threat: false, warned: false,
      dark: false, settled: true, open: false });
    const cands = [c('cyril', 'talk', ['companion'], 0), c('crowd', 'talk', ['asked'], 1), c('nap', 'wait', [], 2),
      c('door', 'way', [], 3), c('torch', 'light', [], 4)];
    const offer = Offers.scene(led, [], cands);
    expect(offer.primary.map(o => o.choice)).toEqual(['cyril', 'crowd']);
    expect(offer.rest.map(o => o.choice).sort()).toEqual(['door', 'nap', 'torch']);
  });
  it('holds no reasonless row in the study\'s square, the aim followed: fewer, none made up', async () => {
    const t = await Tiny.start(square, { party });
    t.follow('boy');
    // Each led for a reason (an act the glance leads with), or the glance's own leading way.
    const acts = new Set([...t.glance.acts.map(a => a.choice), ...t.glance.ways]), four = t.glance.offer!.primary;
    expect(four.length).toBeGreaterThan(0);
    expect(four.filter(o => !acts.has(o.choice)).map(o => o.label)).toEqual([]);
    expect(four.filter(o => o.type === 'wait')).toEqual([]);
  });
  it('keeps one wait where waiting is all there is to do', async () => {
    const t = await Tiny.start(`Place loft "the loft" is room at 0, 0. Company party "You" of 1 at loft.`);
    expect(t.glance.offer!.primary.filter(o => o.type === 'wait')).toHaveLength(1);
  });
});
