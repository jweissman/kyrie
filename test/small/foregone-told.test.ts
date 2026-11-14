import { describe, expect, it } from 'bun:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Tiny } from '../support/tiny';
import { PlayerView } from '../../src/presentation/player-view';
import { Told } from '../../web/reader/stage/told';

// A foregone fight is told over the place it was fought in (OP-03, the owner's play of 15 November: "I could have
// sworn I clicked fight in two cases and it actually took me back out"). Fought through as one act with no page of its
// own (Foregone), its blows and its end had every one been dropped from the place's telling, as a fight held on its
// page is (told there), and the place came back with nothing said. A warrior of the tenth level and a rat in a cellar.
const cellar = `
  Place cellar "the cellar" is room at 0, 0.
  Observe c at cellar when true "A low cellar, barrels along one wall.".
  Person foe "a rat" at cellar { Role "what is in the cellar". Species rat. }
  Company party "You" of 1 at cellar.`;

describe('a foregone fight, in the page', () => {
  it('is told over the place, how it ended among it; one held on its own page is not told again', async () => {
    const t = await Tiny.start(cellar, { party: [{ name: 'Wat', raceId: 'human', classId: 'warrior', level: 10 }] });
    await t.perform(PlayerView.choices(t.campaign).find(r => r.action.schema === 'attack')!.choice.id);
    const exchange = t.leaf.exchange!;
    expect(exchange.tone).toBe('fight');
    const told = renderToStaticMarkup(createElement(Told.Happened, { exchange, said: true }));
    expect(told).toContain('A rat falls.');
    expect(told).toContain('The fight is won.');
    const held = renderToStaticMarkup(createElement(Told.Happened,
      { exchange: { ...exchange, held: true }, said: true }));
    expect(held).not.toContain('The fight is won.');
  });
});
