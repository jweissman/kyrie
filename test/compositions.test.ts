import { beforeAll, describe, expect, test } from 'bun:test';
import { CompositionBuild } from '../scripts/compositions';
import { Proto, type ProtoState, type Recorded } from '../web/compositions/proto';
import { Offers } from '../web/compositions/offer';
import { Moments } from '../web/compositions/moments';

// The composition prototypes of Priority III (doc/architecture/mission-15/priority-iii/compositions.md) compare three
// ways of drawing one recorded journey. What keeps the comparison honest: every composition offers the same choices
// at every beat, and the record's own path through the six moments can be followed in each of them from the page.
let r: Recorded;
const start: ProtoState = { at: 0, attention: { kind: 'place' }, open: [], focus: 0, composition: 'a', marks: true };
beforeAll(async () => { r = await CompositionBuild.record(); }, 120_000);

describe('the composition prototypes', () => {
  test('every beat is a frame the engine drew at its step of the record', () => {
    for (const { beat } of Moments.beats()) {
      const frame = Proto.frame(r, beat);
      expect(frame.screen.place.name.length).toBeGreaterThan(0);
      if (beat.fight !== undefined) { expect(frame.combat).toBeDefined(); }
    }
    expect(Moments.all.map(m => m.title)).toEqual(['Arrival', 'Conversation', 'Travel', 'Investigation', 'Danger',
      'Return']);
  });

  test('the three compositions offer the same choices, in their own order', () => {
    for (let at = 0; at < Proto.beats.length; at++) {
      const s = Proto.go(r, start, at);
      const offer = Proto.offer(r, s), ids = Offers.all(offer).map(c => c.id).sort();
      for (const c of ['a', 'b', 'c'] as const) {
        expect(Offers.order(c, offer).map(x => x.id).sort()).toEqual(ids);
      }
    }
  });

  test('the record can be followed from the page through all six moments, as the keys follow it', () => {
    let s = Proto.go(r, start, 0);
    const reached = new Set<number>();
    for (let guard = 0; guard < 200 && s.at < Proto.beats.length - 1; guard++) {
      const offer = Proto.offer(r, s), next = Proto.toward(r, s, offer);
      expect(next, `beat ${s.at} (step ${Proto.beat(s).step}) offers nothing toward the record`).toBeDefined();
      s = Proto.choose(r, s, next!);
      expect(s.notice).toBeUndefined();
      reached.add(Proto.moment(s));
    }
    expect(s.at).toBe(Proto.beats.length - 1);
    expect(reached.size).toBe(Moments.all.length);
  });
});
