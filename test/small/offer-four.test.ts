import { describe, expect, it } from 'bun:test';
import { Tiny } from '../support/tiny';
import { Terminal } from '../../src/cli/terminal';
import { PlayerView } from '../../src/presentation/player-view';

// Four promoted, everywhere, and the same four in both clients (the owner, 14 November: TB-01, TB-02): where a scene
// has four or more choices to be had it offers exactly four, each a different kind of act, and keeps every other in
// the rest; where it has fewer it offers what there is and invents none; and the terminal leads with the very four the
// engine offers. A yard with a well, a pail, a dog, a gate and a door, and a bare loft.
const yard = `
  Place yard "the yard" is room at 0, 0 outdoors.
  Place lane "the lane" is room at 0, 1 outdoors.
  Place kitchen "the kitchen" is room at 1, 0.
  Passage gate "the yard gate" is path between yard and lane.
  Passage door "the back door" is path between yard and kitchen.
  Thing well "the well" at yard { State full "The well is full.". Change draw "Draw a bucket" from full to full. }
  Person dog "Fly" at yard { Role "the yard dog". Species dog. Peaceable. }
  Person wat "Wat" at yard { Role "the carter". Ancestry human. Peaceable. Pronouns he. }
  Company party "You" of 1 at yard.`;
describe('the scene\'s offer', () => {
  it('is four of four kinds where there are more, every other kept, the terminal leading with the same four', async () => {
    const t = await Tiny.start(yard), offer = t.glance.offer!;
    expect(offer.primary).toHaveLength(4);
    expect(new Set(offer.primary.map(o => o.type)).size).toBe(4);
    const legal = new Set(PlayerView.choices(t.campaign).map(r => r.choice.id));
    // The rest keeps what is not among the four, and nothing is offered twice.
    const all = [...offer.primary, ...offer.rest].map(o => o.choice);
    expect(new Set(all).size).toBe(all.length);
    expect(offer.rest.length).toBeGreaterThan(0);
    // The terminal's four are the engine's, each a command the company can do now.
    const led = Terminal.led(t.glance, t.screen);
    expect(led).toHaveLength(4);
    expect(led.filter(id => !legal.has(id) && !id.startsWith('travel:'))).toEqual([]);
  });
  it('offers what there is where there is less, and nothing made up', async () => {
    const t = await Tiny.start(`Place loft "the loft" is room at 0, 0. Company party "You" of 1 at loft.`);
    const offer = t.glance.offer!, legal = PlayerView.choices(t.campaign).length;
    expect(offer.primary.length).toBe(Math.min(4, legal));
    expect(offer.primary.length + offer.rest.length).toBeLessThanOrEqual(legal);
  });
});
