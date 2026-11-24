import { describe, expect, it } from 'bun:test';
import { Compass } from '../../src/presentation/compass';
import type { Offer, Offered } from '../../src/presentation/offer';
import type { Route } from '../../src/presentation/glance-types';

// The way out of an enclosed place is a row of the engine's own offer (OR-188; CN-02, CN-03), drawn as every row is:
// the page had drawn it as a row of its own making beside the menu, an arrow where the indicator stands. Its words and
// time the journey's own; no marks of its own, so its indicator is the quiet one; always the last of the four (where
// they are full, what it displaces the first of the rest); never twice; and nothing offered where something bars it.
const out: Route = { to: 'yard', name: 'the churchyard', ways: ['the stair', 'the crypt door'], minutes: 4,
  command: 'travel:yard' };
const act = (choice: string): Offered => ({ choice, label: choice, type: 'other', aspects: [], marks: [] });
const offer = (n: number, rest: Offered[] = []): Offer => ({ primary: Array.from({ length: n }, (_, i) => act(`a${i}`)),
  rest });

describe('the way out, in the engine offer', () => {
  it('is the last of the four where there is room, a journey with its time and no marks of its own', () => {
    const got = Compass.offered(offer(2), out)!;
    expect(got.primary.map(o => o.choice)).toEqual(['a0', 'a1', 'travel:yard']);
    expect(got.primary[2]).toEqual({ choice: 'travel:yard', command: 'travel:yard', label: 'Out to the churchyard',
      type: 'journey', aspects: [], marks: [], minutes: 4 });
  });
  it('takes the last of four that are full, what it displaces the first of the rest', () => {
    const got = Compass.offered(offer(4, [act('r0')]), out)!;
    expect([got.primary.map(o => o.choice), got.rest.map(o => o.choice)])
      .toEqual([['a0', 'a1', 'a2', 'travel:yard'], ['a3', 'r0']]);
  });
  it('in a house of a town, takes no place from four that are full (CL-25)', () => {
    const full = offer(4, [act('r0')]);
    expect(Compass.offered(full, out, false)).toBe(full);
    expect(Compass.offered(offer(2), out, false)!.primary.map(o => o.choice)).toEqual(['a0', 'a1', 'travel:yard']);
  });
  it('is never offered twice, nor where something bars it', () => {
    const led = offer(1); led.primary.push({ ...act('x'), command: 'travel:yard' });
    expect(Compass.offered(led, out)).toBe(led);
    const rest = Compass.offered(offer(1, [{ ...act('x'), command: 'travel:yard' }]), out)!;
    expect([rest.primary.map(o => o.choice), rest.rest]).toEqual([['a0', 'x'], []]);
    const plain = offer(1);
    expect(Compass.offered(plain, { ...out, command: undefined, barred: 'The crypt door is locked.' })).toBe(plain);
  });
});
