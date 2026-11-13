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
  static way(whither: string | undefined, shut = false): string {
    return shut ? this.shut : this.whither[whither ?? ''] ?? '·';
  }
  // What is perceived off along a way, said: "worth a look, that way".
  static sensed(aspect: Aspect): string { return `${Emphasis.words[aspect]}, that way`; }
  // An emblem as one character, where its set gives one.
  static emblem(id: string): string | undefined { return Object.hasOwn(this.texts, id) ? this.texts[id] : undefined; }
  static place(kind: string): string { return this.places[kind] ?? this.places.place!; }
}
