import emblems from '../../data/paintings/emblems.json';
import { Emphasis } from './emphasis';
import type { Aspect, MarkKind } from './glance-types';

// The game's signs, as text: what every client draws beside an act's words, from one table, so that the page and the
// terminal cannot say them differently (the owner, 14 November: the terminal and the browser drawing from one shared
// game definition, glyphs representable as unicode or emoji, the terminal a fallback for every text-adjacent
// treatment). A way's direction, a way shut, what a choice risks, an act done by holding, what is perceived along a
// way, a way with nothing new; and each emblem and kind of place as one character, where the page draws a line glyph
// (data/paintings/emblems.json, its `text`; the board's own signs, below). Colour is Emphasis's.
export class Signs {
  // A way's direction: up, down, in, out, away, on.
  static readonly whither: Record<string, string> = { Up: '↑', Down: '↓', Into: '→', Out: '←', Away: '⇢', On: '→' };
  static readonly shut = '⊘';
  // Each kind of mark as its tag says it.
  static readonly marks: Record<MarkKind, string> = { 'one-way': 'no way back', grave: 'cannot be undone',
    fight: 'a fight', trap: 'a risk', unlooked: 'not looked at', heard: 'something heard', exposed: 'a cold night',
    warned: 'they will not wait', night: 'after dark' };
  // An act done by holding rather than a touch (a search, a wait, a rest): the page's ring, said or signed.
  static readonly hold = { sign: '⧗', said: 'hold to do it' };
  // A way to a place with nothing new to give for now (Glance.idle): drawn dim, and said so where nothing dims.
  static readonly idle = 'nothing new';
  // The board's kinds of place, as the map's own signs draw them (web/reader/board/board-glyphs), one character each.
  static readonly places: Record<string, string> = { tower: '♜', ruin: '◫', cave: '◠', stone: '▮', ford: '≋',
    way: '⇢', camp: '△', shrine: '☩', barrow: '◓', tarn: '◯', crag: '▲', grove: '♣', place: '◆', unknown: '?' };
  private static readonly texts: Record<string, string> = Object.assign({},
    ...Object.values(emblems.sets as Record<string, { text?: Record<string, string> }>).map(s => s.text ?? {}));
  // Each aspect as one character, and as a plain one where a terminal has no unicode: drawn where colour is not (an
  // act's indicator without colour), and for what an act is besides its colour (see Indicator). A companion is the
  // emblem the page draws beside such an act (acts.companion).
  static readonly aspects: Record<Aspect, { sign: string; plain: string }> = {
    undertaking: { sign: '✦', plain: '*' }, danger: { sign: '⚠', plain: '!' }, exploration: { sign: '◇', plain: '+' },
    payoff: { sign: '¤', plain: '$' }, knowledge: { sign: 'ℹ', plain: 'i' }, wonder: { sign: '✧', plain: '~' },
    companionship: { sign: Signs.texts.companion!, plain: '&' } };
  // Going over into the next stretch of country (the page's journey emblem), and its plain sign.
  static readonly crossing = { sign: Signs.texts.journey!, plain: '>', said: 'into the next stretch of country' };
  static way(whither: string | undefined, shut = false): string {
    return shut ? this.shut : this.whither[whither ?? ''] ?? '·';
  }
  // What is perceived off along a way, said: "worth a look, that way".
  // Graduated by how far off it is: one place off, what kind of thing and which way; farther, only perhaps (the page's
  // wayfinder had said so in words of its own: "perhaps someone, farther on").
  static sensed(aspect: Aspect, far = 1): string {
    return far > 1 ? `perhaps ${Emphasis.words[aspect]}, farther on` : `${Emphasis.words[aspect]}, that way`;
  }
  // An emblem as one character, where its set gives one.
  static emblem(id: string): string | undefined { return Object.hasOwn(this.texts, id) ? this.texts[id] : undefined; }
  static place(kind: string): string { return this.places[kind] ?? this.places.place!; }
}
