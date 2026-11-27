import { describe, expect, it } from 'bun:test';
import { Tiny } from '../support/tiny';
import { MenuTree } from '../../src/frame/menu-tree';
import { PlaceQuestion } from '../../src/frame/place-question';
import type { Frame } from '../../src/creation/protocol';
import { MenuCensus } from '../support/menu-census';

// One page, one menu, strict four (the owner's playtest of 27 November, OR-1490): the yard of test/small/offer-page,
// its well, pail, bench, hatch, dog, carter, gate and door. The page at rest draws one menu, from one source (the
// place's question): the engine's four, then Something else…, which turns to the next four of the scene's rows, the
// company's own page among them, and back to the first; every row of the scene stands on one of its pages, so nothing
// is out of reach, and nothing is drawn beside the menu. test/one-menu-census holds the same over the census walks.
const yard = `
  Place yard "the yard" is room at 0, 0 outdoors.
  Place lane "the lane" is room at 0, 1 outdoors.
  Place kitchen "the kitchen" is room at 1, 0.
  Passage gate "the yard gate" is path between yard and lane.
  Passage door "the back door" is path between yard and kitchen.
  Thing well "the well" at yard { State full "The well is full.". Change draw "Draw a bucket" from full to full. }
  Thing pail "a pail" at yard { State dry "A dry pail.". State wet "A wet pail.".
    Change dip "Dip the pail" from dry to wet. }
  Thing bench "a bench" at yard { State bare "A bench.". State swept "A swept bench.".
    Change sweep "Sweep the bench" from bare to swept. }
  Thing hatch "a hatch" at yard { State shut "A hatch, shut.". State open "A hatch, open.".
    Change lift "Lift the hatch" from shut to open. }
  Person dog "Fly" at yard { Role "the yard dog". Species dog. Peaceable. }
  Person wat "Wat" at yard { Role "the carter". Ancestry human. Peaceable. Pronouns he. }
  Company party "You" of 1 at yard.`;

describe('the place at rest', () => {
  it('is one menu: the engine\'s four, then the rest a page at a time, every row of the scene on a page', async () => {
    const t = await Tiny.start(yard);
    const framed = MenuTree.framed({ screen: t.screen, leaf: t.leaf } as unknown as Omit<Frame, 'menu'>);
    const page = (n: number) => ({ ...framed, question: MenuTree.question(framed, { kind: 'place', page: n }) }) as Frame;
    const first = page(0), asked = first.question!.place!;
    expect(asked.promoted).toBe(4);
    expect(asked.rows.slice(4).map(r => r.command)).toEqual(['focus:page:1']);
    const drawn = MenuCensus.count(MenuCensus.html(first));
    expect([drawn.menus, drawn.promoted, drawn.sources]).toEqual([1, 4, { offer: 4, question: 1 }]);
    // Turned page by page, round to the first: each a menu of its own rows, four at most and Something else….
    const seen = new Set<string>();
    for (let n = 1; n < asked.page.of; n++) {
      const p = page(n), rows = p.question!.place!.rows, c = MenuCensus.count(MenuCensus.html(p));
      expect([c.menus, c.promoted, c.rows]).toEqual([1, 0, rows.length]);
      expect(rows.length).toBeLessThanOrEqual(5);
      expect(rows.at(-1)!.command).toBe(`focus:page:${(n + 1) % asked.page.of}`);
      rows.slice(0, -1).forEach(r => seen.add(r.id));
    }
    expect(seen.has(PlaceQuestion.yourself.id)).toBe(true);
    // Every row of the scene, at one flat level, is one of the four or on a page after them.
    const four = new Set(asked.rows.slice(0, 4).flatMap(r => [r.id, r.command]));
    const missing = framed.menu.choices.filter(c => !seen.has(c.id) && !four.has(c.id) && !four.has(c.command));
    expect(missing.map(c => c.label)).toEqual([]);
  });
});
