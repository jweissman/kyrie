import { describe, expect, it } from 'bun:test';
import { Tiny } from '../support/tiny';
import { MenuTree } from '../../src/frame/menu-tree';
import { Itineraries } from '../../src/ui/itinerary';
import type { Frame } from '../../src/creation/protocol';

// One flat level outside a fight (AGENTS.md: "Unfolding menus only in a fight. Elsewhere rows are one flat level"; the
// owner's playtest, 26 November, OR-1295: "Look at the bronze ring" opened its acts beneath it). The census: at every
// place of a small walk (a thing with acts of its own, someone to talk to, a way with something in it), no row the
// resting scene's frame holds carries rows of its own; a thing looked at and someone talked to are pages of their own.
const yard = `
  Place yard "the yard" is room at 0, 0 outdoors.
  Place hall "the hall" is room at 1, 0 indoors.
  Passage arch "the arch" is door between yard and hall.
  Thing ring "the bronze ring" at yard {
    State loose "A bronze ring lies in the grass.". State turned "The bronze ring lies turned over.".
    Change turn "Turn the bronze ring over" from loose to turned.
    Change polish "Rub the bronze ring clean" from loose to turned.
  }
  Thing slab "the fallen slab" on arch {
    State shut blocking "A fallen slab fills the arch.". State aside "The slab lies heaved aside.".
    Change heave "Heave the slab aside" from shut to aside.
  }
  Person wat "Wat" at yard { Role "a hedger". Ancestry human. Peaceable. }
  Company party "You" of 1 at yard.`;
const frame = (t: Tiny): Frame => MenuTree.framed({ title: '', screen: Itineraries.charted(t.campaign, t.screen),
  entries: [], leaf: t.leaf, opening: [], chronicle: [], transcript: { steps: [] } as unknown as Frame['transcript'] });
const nested = (t: Tiny) => frame(t).menu.choices.filter(c => c.children?.length).map(c => c.id);
describe('the resting scene\'s rows', () => {
  it('are one flat level wherever the walk goes', async () => {
    const t = await Tiny.start(yard);
    expect(frame(t).menu.choices.some(c => /ring/.test(c.id))).toBe(true);
    expect(nested(t)).toEqual([]);
    const heave = frame(t).menu.choices.find(c => /Heave the slab/.test(c.label));
    if (heave?.command) { await t.perform(heave.command); expect(nested(t)).toEqual([]); }
    const go = t.screen.exits.find(e => e.destination.id === 't__hall')?.acts[0]?.command;
    if (go) { await t.perform(go); expect(nested(t)).toEqual([]); }
  });
});
