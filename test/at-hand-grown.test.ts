import { describe, expect, it } from 'bun:test';
import { AtHand, type Held } from '../web/reader/stage/at-hand';

// What only grows, and can only be gathered, is one thing to look at (the owner's play of 10 November: ten plants, each
// its own pane, before anything else at the edge of a wood).
describe('what grows at hand', () => {
  const plant = (name: string): Held => ({ id: name, name: `the ${name}`, seen: [], opens: [],
    choices: [{ id: `${name}:g`, label: `Gather some ${name}`, tone: 'item' }] });
  const cart: Held = { id: 'cart', name: 'the cart', seen: [], opens: [], choices: [{ id: 'c', label: 'Push', tone: 'item' }] };
  it('is one pane, named together, holding every gathering', () => {
    const held = AtHand.grown([cart, plant('willow'), plant('comfrey'), plant('hazel')]);
    expect(held.map(h => h.name)).toEqual(['the cart', 'What grows here']);
    expect(held[1]!.seen).toEqual(['Willow, comfrey and hazel.']);
    expect(held[1]!.choices).toHaveLength(3);
  });
  it('leaves one or two plants as they are', () => {
    expect(AtHand.grown([plant('willow'), cart]).map(h => h.name)).toEqual(['the willow', 'the cart']);
  });
});
