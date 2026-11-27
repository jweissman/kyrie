import { PresentationResources } from '../ports/presentation-resources';
import { Emblems } from './emblems';
import { Emphasis } from './emphasis';
import type { Aspect, MarkKind } from './glance-types';
import type { Bearing, Offer } from './offer';

// The game's signs, as text: what every client draws beside an act's words, from one table, so that the page and the
// terminal cannot say them differently (the owner, 14 November: the terminal and the browser drawing from one shared
// game definition, glyphs representable as unicode or emoji, the terminal a fallback for every text-adjacent
// treatment). A way's direction, a way shut, what a choice risks, what is perceived along a way, a way
// with nothing new; and each emblem and kind of place as one character, where the page draws a line glyph
// (data/paintings/emblems.json, its `text`; the board's own signs, below). Colour is Emphasis's.
export class Signs {
  // A way's direction: up, down, in, out, away, on.
  static readonly whither: Record<string, string> = { Up: '↑', Down: '↓', Into: '→', Out: '←', Away: '⇢', On: '→' };
  static readonly shut = '⊘';
  // Each kind of mark as its tag says it.
  static readonly marks: Record<MarkKind, string> = { 'one-way': 'no way back', grave: 'cannot be undone',
    fight: 'a fight', trap: 'a risk', unlooked: 'not looked at', heard: 'something heard', lurks: 'something waits',
    exposed: 'a cold night',
    warned: 'they will not wait', night: 'after dark', gutters: 'the light gives out' };
  // A way to a place with nothing new to give for now (Glance.idle): drawn dim, and said so where nothing dims.
  static readonly idle = 'nothing new';
  // A way's bearing in a site (Offers.borne, EX-02): the frontier, not yet taken, its contents unknown; or back to
  // familiar ground, the retreat the company came by or a return to somewhere been (EX-02 tells the two apart from
  // the frontier, not from each other). Signed by direction (in, out), never by colour, and said in a plain word.
  static readonly bearings: Record<Bearing, { sign: string; said: string }> = {
    frontier: { sign: Signs.whither.Into!, said: 'unexplored' }, retreat: { sign: Signs.whither.Out!, said: 'back' },
    return: { sign: Signs.whither.Out!, said: 'back' } };
  // The bearing of the offered act a row does (by its command or its choice), as both clients read it.
  static bearing(glance: { offer?: Offer } | undefined, id: string): { sign: string; said: string } | undefined {
    const o = [...glance?.offer?.primary ?? [], ...glance?.offer?.rest ?? []]
      .find(x => x.bearing && (x.command === id || x.choice === id));
    return o?.bearing ? this.bearings[o.bearing] : undefined;
  }
  // The board's kinds of place, as the map's own signs draw them (web/reader/board/board-glyphs), one character each.
  static readonly places: Record<string, string> = { tower: '♜', ruin: '◫', cave: '◠', stone: '▮', ford: '≋',
    way: '⇢', camp: '△', shrine: '☩', barrow: '◓', tarn: '◯', crag: '▲', grove: '♣', place: '◆', unknown: '?' };
  private static readonly derived = new WeakMap<object, {
    texts: Record<string, string>; aspects: Record<Aspect, { sign: string; plain: string }>;
    acts: Record<string, string> }>();
  private static maps(): { texts: Record<string, string>; aspects: Record<Aspect, { sign: string; plain: string }>;
    acts: Record<string, string> } {
    const domain = PresentationResources.domain(), kept = this.derived.get(domain);
    if (kept) { return kept; }
    const texts = Object.assign({}, ...Object.values(Emblems.sets).map(s => s.text ?? {}));
    const aspects: Record<Aspect, { sign: string; plain: string }> = {
      undertaking: { sign: '✦', plain: '*' }, danger: { sign: '⚠', plain: '!' }, exploration: { sign: '◇', plain: '+' },
      payoff: { sign: '¤', plain: '$' }, knowledge: { sign: 'ℹ', plain: 'i' }, wonder: { sign: '✧', plain: '~' },
      companionship: { sign: texts.companion ?? '&', plain: '&' } };
    const acts = { talk: texts.someone ?? '·', fight: '⚔', act: '◆', search: texts.search ?? '?',
      go: texts.go_on ?? '→', journey: texts.journey ?? '⇢', light: '☀', wait: texts.wait ?? '·', care: '✚',
      study: '✎', other: '·' };
    const made = { texts, aspects, acts };
    this.derived.set(domain, made);
    return made;
  }
  // Each aspect as one character, and as a plain one where a terminal has no unicode: drawn where colour is not (an
  // act's indicator without colour), and for what an act is besides its colour (see Indicator). A companion is the
  // emblem the page draws beside such an act (acts.companion).
  static get aspects(): Record<Aspect, { sign: string; plain: string }> { return this.maps().aspects; }
  // Each kind of act (Offers' types) as one character, drawn before its words in a list (the terminal's rows), the
  // emblems' own where they have one.
  static get acts(): Record<string, string> { return this.maps().acts; }
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
  static emblem(id: string): string | undefined {
    const texts = this.maps().texts;
    return Object.hasOwn(texts, id) ? texts[id] : undefined;
  }
  static place(kind: string): string { return this.places[kind] ?? this.places.place!; }
}
