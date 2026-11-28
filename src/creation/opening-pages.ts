import { FirstChoice, type Kept, type Where } from './first-choice';
import { Identity } from '../presentation/identity';

// The pages before play as the engine's (the owner's ruling on OR-382, 24 November: "every screen in the app is just
// the engine telling the presentation layer what to do within a fixed, simple layout with different hints"): the
// title, how a life begins and Options, each a question, its rows and its hints, for every client alike. The page
// draws them in the one frame (the rows in its menu column), the terminal as numbered lines, and nothing on these
// screens is a client's own: the title's Options and Quit are its rows, as the ways in are.

// What a client may draw a page with, and may leave: what stands behind it (the embers going up in the dark; the black
// curtain with the embers before it, creation's; the dark alone; a country's painting), an instrument it is read
// through (the stars), and a heading (the game's own name).
// There is no placement hint: every page's rows stand in the frame's one column (the call on OR-382).
export type Backdrop = 'embers' | 'curtain' | 'dark' | 'country';
export type Instrument = 'stars';
// theme: the backstage's one folio (Folio.theme, OR-1073), which the frame applies to a page read rather than lived:
// the dark table, its head a quiet line on it, and one parchment leaf of one size; a page without it is the title's.
export interface PageHints { backdrop?: Backdrop; instrument?: Instrument; heading?: 'name'; theme?: 'folio' }
// A row: its id, its words, and as needed what it does said to a reader (said), what the row the keys are on means
// (say), what it is now (aside), the group it stands under, the address it opens apart (href: the encyclopedia), its
// emblem, and whether its mark holds every tone (the way into a new life, as the title has always drawn it).
export interface PageRow {
  id: string; label: string; said?: string; say?: string; aside?: string; group?: string; href?: string;
  glyph?: string; every?: true;
  // A setting this row sets, and to what (Options): read by its field, never from the row's id.
  setting?: { key: keyof Settings; value: string };
}
export type PageId = 'title' | 'begin' | 'options' | 'closed';
export interface EnginePage {
  id: PageId; ask: string; chosen: string; rows: PageRow[]; hints: PageHints;
  // A line said under the rows, plainly, never a row (a kept game this build could not open).
  told?: string;
  // A line set under the page's heading, small: the title's, what the game is (Identity.line, OR-529).
  line?: string;
}
// How the page is read (the settings Options sets): the size of its letters, and whether the dice are told.
export interface Settings { size: 'smaller' | 'usual' | 'larger'; rolls: 'shown' | 'hidden' }
type Value = { id: string; label: string; note: string };
type Setting = { key: keyof Settings; label: string; glyph: string; values: Value[] };

export class OpeningPages {
  // The title: the core four and nothing else (the owner, 26 November, OR-1072: "I was even a little taken aback by how
  // much complexity is creeping back into the title page"): New Game, Continue where a game is kept to continue,
  // Options and Quit, in that order (OR-1683: New Game at the top; test/features/interface/title-four.pin holds it).
  // What else it had offered has gone inside: the world a new life begins in is New Game's to ask, the encyclopedia
  // is Options' row, and the campaigns for testing are the address's alone (?campaign=). The game's name its heading
  // and its line under it, the embers behind it.
  static title(kept?: Kept): EnginePage {
    const step = FirstChoice.title(kept);
    return { id: 'title', ask: step.ask, chosen: step.chosen, hints: { backdrop: 'embers', heading: 'name' },
      line: Identity.line,
      rows: [...step.cards.map(c => ({ id: c.id, label: c.name, said: c.said, ...c.id === 'begin' ? { every: true as const } : {} })),
        { id: 'options', label: 'Options' },
        { id: 'quit', label: 'Quit', said: 'Quit: put the game away, kept as it is' }],
      ...step.told ? { told: step.told } : {} };
  }
  // New Game (FirstChoice.step): its question over its rows, over the embers; where a country is kept, which world.
  static begin(where: Where = {}): EnginePage {
    const step = FirstChoice.step(where);
    return { id: 'begin', ask: step.ask, chosen: step.chosen, hints: { backdrop: 'embers' },
      rows: step.cards.map(c => ({ id: c.id, label: c.name, say: c.say ?? c.line ?? '',
        ...c.aside ? { aside: c.aside, said: `${c.name}: ${c.aside}` } : {},
        ...c.id === 'build' ? { every: true as const } : {} })) };
  }
  // Quit (OR-1072): a page cannot close the browser's tab it is in, so Quit puts the game away and says so, honestly,
  // in the dark: what is kept stays kept, the page may be closed, and one row back to the title.
  static closed(kept: boolean): EnginePage {
    return { id: 'closed', ask: 'The game is put away', chosen: 'title', hints: { backdrop: 'dark' },
      line: kept ? 'It is kept in this browser as you left it. This page may be closed.' : 'This page may be closed.',
      rows: [{ id: 'title', label: 'Back to the title' }] };
  }
  static readonly settings: readonly Setting[] = [
    { key: 'size', label: 'Letters', glyph: 'look_about', values: [
      { id: 'smaller', label: 'Smaller', note: '' }, { id: 'usual', label: 'Usual', note: '' },
      { id: 'larger', label: 'Larger', note: '' }] },
    { key: 'rolls', label: 'Dice', glyph: 'search', values: [
      { id: 'shown', label: 'Told', note: 'what was rolled, and against what' },
      { id: 'hidden', label: 'Not told', note: 'only what came of it' }] }];
  // Options: each setting a row, what it is now beside it, taken to go on to its next value (option:<key>:<value>);
  // a save file opened; the encyclopedia, which opens apart (the title's row until OR-1072); and from a game paused its
  // two ways (FirstChoice.paused), else Back to the title. A page of the backstage's folio (OR-1073). The encyclopedia
  // only once the game in play has earned it, by a library stood in (compactification, OR-1243): never before a game.
  static options(now: Settings, paused: boolean, read = false): EnginePage {
    const set = OpeningPages.settings.map(s => {
      const at = s.values.findIndex(v => v.id === now[s.key]), value = s.values[Math.max(0, at)]!;
      const next = s.values[(Math.max(0, at) + 1) % s.values.length]!;
      return { id: `option:${s.key}:${next.id}`, label: s.label, glyph: s.glyph, group: 'Reading',
        setting: { key: s.key, value: next.id },
        aside: [value.label, value.note].filter(Boolean).join(': '), said: `${s.label}: ${value.label}` };
    });
    const ways: PageRow[] = paused ? FirstChoice.paused().cards.map(c => ({ id: c.id, label: c.name,
      ...c.id === 'back' ? { glyph: 'back' } : {} })) : [{ id: 'back', label: 'Back', glyph: 'back' }];
    return { id: 'options', ask: 'Options', chosen: set[0]!.id, hints: { backdrop: 'dark', theme: 'folio' },
      rows: [...set, { id: 'load-file', label: 'Open a save file', glyph: 'courier', group: 'Books',
        aside: 'Downloaded from this browser or another' },
      // The encyclopedia's mark is the knowledge blue, and it has no emblem (the owner, 18 November, OR-86).
      ...read ? [{ id: 'encyclopedia', label: 'The encyclopedia', group: 'Books',
        said: 'The encyclopedia, opens apart', href: 'encyclopedia/index.html' }] : [], ...ways] };
  }
  // A setting's row taken: the settings it makes, or none where the row sets none.
  static set(now: Settings, row: PageRow): Settings | undefined {
    const to = row.setting, s = to && OpeningPages.settings.find(x => x.key === to.key);
    return s && s.values.some(v => v.id === to!.value) ? { ...now, [s.key]: to!.value } as Settings : undefined;
  }
}
