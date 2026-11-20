import { describe, expect, it } from 'bun:test';
import { Glob } from 'bun';

// The page plays what the engine offers: its controls are the engine's rows (the one row, ChoiceRow and Act), the
// lenses and the books, and nothing else (the owner, 18 November: "the webapp should not be inventing flows/buttons
// but ideally just be a simple player of what the engine is specifying ... any buttons outside of menu items ...
// should be strictly forbidden"). A "Back out to the map" of the page's own stood beside the engine's "Open the world
// map". Every <button the page still writes is named here by its kind (its data-control, else its data-action), file
// by file, with why it is allowed: a new kind of button fails, and so does one burnt and left listed (OR-94).
type Why = 'row' | 'lens' | 'map' | 'book' | 'before play' | 'notice' | 'unreached';
const why: Record<Why, string> = {
  row: 'the one row: an engine choice (Act.View) or a row of the menu (ChoiceRow.Button), its kinds pinned below',
  lens: 'a lens\'s instrument: its mark on the rail, a tile of its strip, a likeness of who is here',
  map: 'the map\'s instrument: its mark, its tools (nearer, further, here), a cell let go of, the map put away',
  book: 'the book\'s instrument: its mark and tabs, the way out of it, what is read in it (an ability, an aim, a ware, '
    + 'an entry, the fight\'s log, the dice)',
  'before play': 'the title, the choice of a campaign and of a company, creation\'s rail: no engine of play yet',
  notice: 'an error said, put away',
  unreached: 'drawn by no page since the panel over a place went (Wayfinder.View, rendered only by specs: AT-07 I6)',
};
const allowed: Record<string, [string, Why][]> = {
  'web/reader/stage/act.tsx': [['choice', 'row'], ['mode', 'book']],
  'web/reader/stage/choice-row.tsx': [['row', 'row']],
  'web/reader/stage/scene-rail.tsx': [['lens', 'lens'], ['explore', 'lens'], ['explore', 'lens'], ['map-mark', 'map'],
    ['book', 'book']],
  'web/reader/stage/lenses.tsx': [['lens-tile', 'lens']],
  'web/reader/stage/world-stage.tsx': [['likeness-still', 'lens']],
  'web/reader/board-field.tsx': [['map-nearer', 'map'], ['map-further', 'map'], ['map-here', 'map']],
  'web/reader/route-card.tsx': [['map-unchoose', 'map']],
  'web/reader/map-view.tsx': [['close', 'map']],
  'web/reader/stage/book-stage.tsx': [['back', 'book'], ['country', 'map']],
  'web/reader/sheet.tsx': [['consider-aim', 'book']],
  'web/reader/pack-grid.tsx': [['consider-item', 'book']],
  'web/reader/character-page.tsx': [['ability', 'book']],
  'web/reader/encyclopedia-overlay.tsx': [['close-entry', 'book']],
  'web/reader/stage/fight-stage.tsx': [['fight-log', 'book']],
  'web/reader/stage/told.tsx': [['dice', 'book']],
  'web/reader/toast.tsx': [['dismiss', 'notice']],
  'web/reader/title-page.tsx': [['skip', 'before play']],
  'web/reader/campaign-page.tsx': [['back-to-title', 'before play'], ['campaign', 'before play']],
  'web/reader/company-page.tsx': [['back-to-campaigns', 'before play'], ['preset', 'before play'],
    ['alone', 'before play'], ['start', 'before play'], ['campaigns', 'before play']],
  'web/reader/companion-card.tsx': [['change-companion', 'before play']],
  'web/reader/creation/composed-creation.tsx': [['creation-mark', 'before play']],
  'web/reader/stage/wayfinder.tsx': [['way-row', 'unreached']],
};
// The rows of the one row that are no engine choice of their own, by kind (data.action, else the data's first key),
// file by file: the menu's turns (a page, a focus, out of one, a kind of move opened), a talk's Trade, the map's
// card, creation's and the title's own. A new kind fails here as a new button does above.
const rows: Record<string, string[]> = {
  // How a new game begins: the engine's two rows (FirstChoice), each by its own id (OR-120).
  'web/reader/begin-menu.tsx': ['action'],
  'web/reader/creation/composed-creation.tsx': ['whole-sky'],
  'web/reader/creation/composed-row.tsx': ['option'],
  'web/reader/map-menu.tsx': ['put-away-map', 'go-on', 'enter', 'set-out', 'action', 'put-away-map'],
  'web/reader/notices.tsx': ['download'],
  'web/reader/options-page.tsx': ['option', 'load-file', 'back'],
  'web/reader/sheet.tsx': ['export', 'title', 'follow', 'aim-map'],
  'web/reader/stage/at-hand.tsx': ['pick'],
  'web/reader/stage/attention.tsx': ['pick', 'lens-page'],
  'web/reader/stage/book-stage.tsx': ['again', 'new'],
  'web/reader/stage/compass-stage.tsx': ['action', 'action'],
  'web/reader/stage/fight-moves.tsx': ['attack', 'panel', 'whom', 'move', 'more-moves', 'action'],
  'web/reader/stage/glance.tsx': ['choice', 'aim-map', 'choice', 'choice'],
  'web/reader/stage/lens-focused.tsx': ['defocus', 'lens-page', 'focus'],
  'web/reader/stage/next-pull.tsx': ['next'],
  'web/reader/stage/panorama.tsx': ['set-out'],
  'web/reader/stage/prologue-stage.tsx': ['answer', 'action'],
  'web/reader/stage/talk-stage.tsx': ['trade-back', 'more-talk', 'trade', 'unbought', 'unbought'],
  'web/reader/title-page.tsx': ['continue', 'begin', 'options', 'campaign'],
};
class Source {
  // The opening tag from `at`, to its `>` outside braces and quotes.
  static tag(src: string, at: number): string {
    let depth = 0, quote = '';
    for (let i = at; i < src.length; i++) {
      const ch = src[i]!;
      if (quote) { if (ch === quote) { quote = ''; } continue; }
      if (ch === '"' || ch === '\'' || ch === '`') { quote = ch; } else if (ch === '{') { depth++; }
      else if (ch === '}') { depth--; } else if (ch === '>' && depth === 0) { return src.slice(at, i); }
    }
    return src.slice(at);
  }
  static tags(src: string, open: string): string[] {
    const out: string[] = [];
    for (let i = src.indexOf(open); i >= 0; i = src.indexOf(open, i + 1)) { out.push(Source.tag(src, i)); }
    return out;
  }
  static button(t: string): string {
    return /data-control="([^"]+)"/.exec(t)?.[1] ?? /data-action="([^"]+)"/.exec(t)?.[1]
      ?? /'data-action': '([^']+)'/.exec(t)?.[1] ?? '(unnamed)';
  }
  static row(t: string): string {
    return /action: '([^']+)'/.exec(t)?.[1] ?? /data=\{\{ (\w+)/.exec(t)?.[1] ?? '(unnamed)';
  }
  static async scan(read: (src: string) => string[]): Promise<Record<string, string[]>> {
    const out: Record<string, string[]> = {};
    for await (const f of new Glob('web/reader/**/*.tsx').scan('.')) {
      const kinds = read(await Bun.file(f).text());
      if (kinds.length) { out[f] = kinds; }
    }
    return out;
  }
  static sorted(m: Record<string, string[]>): Record<string, string[]> {
    return Object.fromEntries(Object.entries(m).filter(([, v]) => v.length).sort(([a], [b]) => a.localeCompare(b))
      .map(([f, v]) => [f, [...v].sort()]));
  }
}

describe('the page\'s own controls', () => {
  it('are the allowed set, by name, file by file', async () => {
    const drawn = await Source.scan(src => Source.tags(src, '<button').map(t => Source.button(t)));
    expect(Source.sorted(drawn)).toEqual(Source.sorted(Object.fromEntries(Object.entries(allowed)
      .map(([f, ks]) => [f, ks.map(([k]) => k)]))));
    expect(Object.values(allowed).flat().filter(([, w]) => !why[w])).toEqual([]);
  });
  it('count no more than they did: 70 in 28 files on 18 November, 53 on the 19th, 35 now', async () => {
    const drawn = await Source.scan(src => Source.tags(src, '<button').map(t => Source.button(t)));
    expect(Object.values(drawn).flat().length).toBe(35);
  });
  it('make rows of the one row of no kind not named', async () => {
    const drawn = await Source.scan(src => Source.tags(src, '<ChoiceRow.Button').map(t => Source.row(t)));
    expect(Source.sorted(drawn)).toEqual(Source.sorted(rows));
  });
});
