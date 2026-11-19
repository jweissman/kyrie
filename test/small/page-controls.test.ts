import { describe, expect, it } from 'bun:test';
import { Glob } from 'bun';

// The page plays what the engine offers: its controls are the engine's rows (the one row, ChoiceRow and Act), the
// lenses and the books, and nothing else (the owner, 18 November: "the webapp should not be inventing flows/buttons
// but ideally just be a simple player of what the engine is specifying ... any buttons outside of menu items ...
// should be strictly forbidden"). A "Back out to the map" of the page's own stood beside the engine's "Open the world
// map". The buttons the page still makes are counted here, file by file, and may only go down (OR-94 burns them down).
const ceiling: Record<string, number> = {
  'web/reader/board-field.tsx': 3, 'web/reader/campaign-page.tsx': 2, 'web/reader/character-page.tsx': 1,
  'web/reader/companion-card.tsx': 1, 'web/reader/company-page.tsx': 5,
  'web/reader/creation/composed-creation.tsx': 1, 'web/reader/encyclopedia-overlay.tsx': 1,
  'web/reader/map-view.tsx': 1, 'web/reader/pack-grid.tsx': 1, 'web/reader/route-card.tsx': 1,
  'web/reader/sheet.tsx': 1, 'web/reader/stage/act.tsx': 2, 'web/reader/stage/book-stage.tsx': 2,
  'web/reader/stage/choice-row.tsx': 1, 'web/reader/stage/explorer.tsx': 2, 'web/reader/stage/fight-stage.tsx': 3,
  'web/reader/stage/lenses.tsx': 1, 'web/reader/stage/scene-rail.tsx': 8, 'web/reader/stage/stage.tsx': 2,
  'web/reader/stage/thing-stage.tsx': 1, 'web/reader/stage/told.tsx': 1, 'web/reader/stage/wayfinder.tsx': 2,
  'web/reader/stage/world-stage.tsx': 3, 'web/reader/title-page.tsx': 1, 'web/reader/toast.tsx': 1,
};

describe('the page\'s own controls', () => {
  it('are no more than they were, file by file', async () => {
    const over: string[] = [];
    for await (const f of new Glob('web/reader/**/*.tsx').scan('.')) {
      const n = (await Bun.file(f).text()).split('<button').length - 1;
      // And no ceiling left above what is drawn: one burnt down is lowered with it, so the count only goes down.
      if (n !== (ceiling[f] ?? 0)) { over.push(`${f}: ${n} buttons, the ceiling ${ceiling[f] ?? 0}`); }
    }
    expect(over).toEqual([]);
    expect(Object.keys(ceiling).filter(f => !Bun.file(f).size)).toEqual([]);
  });
});
