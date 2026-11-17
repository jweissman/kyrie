import { Emphasis, type Tone } from './emphasis';
import { Signs } from './signs';
import type { Aspect } from './glance-types';

// One icon beside an act's words: its character, its plain one where there is no unicode, and what it says.
export interface Icon { sign: string; plain: string; said: string }
// An act's one indicator: its colour (the aspect it is chiefly, by Emphasis.precedence), at most two icons for what it
// is besides, and whatever else in its detail, in words.
export interface Indicated { aspect?: Aspect; tone?: Tone; icons: Icon[]; detail: string[] }
// How an opportunity stands, beside what kind it is (M22, doc/architecture/mission-22/indicator-appendix.md): the hue
// says the kind; the condition is said by value and shape, never by another hue. From what the engine knows and the
// company perceives, each a field it already gives: here and seen (present); perceived off along a way and not here
// (afar: Promoted.afar, Glance.sensed); known only by word, never seen (heard: a map mark's state); a place with
// nothing new to give for now (idle: Glance.idle); a question put already (spent). Novelty is apart, and only adds.
export type Condition = 'present' | 'afar' | 'heard' | 'idle' | 'spent';
export interface Standing { afar?: boolean; heard?: boolean; idle?: boolean; spent?: boolean; fresh?: boolean }
// What an act carries, as the engine typed it: its aspects (gilded where it is the followed aim's next step), whether
// it goes over into the next stretch of country, whether it is done by holding, and what is perceived off along it
// (Glance.sensed: a way's, never an act's).
export interface Carrying { aspects?: readonly Aspect[]; gilded?: boolean; crosses?: boolean; hold?: boolean;
  sensed?: { aspect: Aspect; far: number } }

// The indicator grammar every client draws by (the owner, 14 November: TP-02). The left-edge pip had broken down where
// an act was several things at once: a prism of three tones read as noise, and a fourth meaning had no room. Now one
// colour, from one precedence table; at most two icons; and the rest said on asking. Meaning never rests on colour
// alone: a client with none draws the colour's own sign in its place.
export class Indicator {
  static readonly icons = 2;
  static readonly hold: Icon = { sign: Signs.hold.sign, plain: '=', said: Signs.hold.said };
  // A companion is always its icon, the first of them, and never the colour (TP-03). What is perceived off along a way
  // is its faint pip where the way has no colour of its own and it is no companion (see faint); else its icon, said by
  // how far off it is: a way drawn silver had lost the companion perceived along it (the atlas characterized).
  static of(c: Carrying): Indicated {
    const drawn = Emphasis.drawn(c.aspects, c.gilded ?? true), [first, ...rest] = Emphasis.ranked(drawn);
    const off = c.sensed && !this.faint(c, first) ? [{ ...this.icon(c.sensed.aspect),
      said: Signs.sensed(c.sensed.aspect, c.sensed.far) }] : [];
    // A companion, and somewhere worth a look, are icons and no colour (TP-03; the owner, 15 November).
    const iconed = (['companionship', 'exploration'] as const).filter(a => drawn.includes(a)).map(a => this.icon(a));
    const besides: Icon[] = [...iconed, ...off,
      ...rest.map(a => this.icon(a)), ...c.crosses ? [Signs.crossing] : [], ...c.hold ? [this.hold] : []];
    return { ...first ? { aspect: first, tone: Emphasis.tones[first]! } : {}, icons: besides.slice(0, this.icons),
      detail: besides.slice(this.icons).map(i => i.said) };
  }
  // Every aspect drawn, in words, its colour's first and a companion's last: what is said where there is no colour,
  // and on asking.
  static words(aspects: readonly Aspect[] | undefined, gilded = true): string[] {
    const drawn = Emphasis.drawn(aspects, gilded);
    return [...Emphasis.ranked(drawn), ...drawn.includes('companionship') ? ['companionship' as const] : []]
      .map(a => Emphasis.words[a]);
  }
  // The words said unasked where there is no colour: what the player chose (the aim) and what is so of the act (a
  // danger seen, someone who could join); never the editorial ones (worth a look, to learn, to gain, uncanny), which
  // told the player where curiosity ought to be before the fiction had raised it (the owner's headless review,
  // 14 November). Those stay the act's colour, and are said on asking.
  static readonly unasked: readonly Aspect[] = ['undertaking', 'danger', 'companionship'];
  static said(aspects: readonly Aspect[] | undefined, gilded = true): string[] {
    const kept = (aspects ?? []).filter(a => this.unasked.includes(a));
    return this.words(kept, gilded);
  }
  // Whether what is perceived off along a way is said in words unasked: only what is so (a danger, someone), never
  // that it is worth a look.
  static tells(sensed: Aspect | undefined): boolean { return !!sensed && this.unasked.includes(sensed); }
  // Whether what is perceived along a way is its faint pip: the way has no colour of its own, and it is no companion.
  static faint(c: Carrying, tone = Emphasis.ranked(Emphasis.drawn(c.aspects, c.gilded ?? true))[0]): boolean {
    return !!c.sensed && !tone && !!Emphasis.tones[c.sensed.aspect];
  }
  // The condition an opportunity is drawn in: what is spent or idle withdraws first, whatever it is; then what is only
  // heard of; then what is perceived from here; else it is present. Fresh is said beside, never in place of these.
  static condition(s: Standing): { condition: Condition; fresh: boolean } {
    const condition: Condition = s.spent ? 'spent' : s.idle ? 'idle' : s.heard ? 'heard' : s.afar ? 'afar' : 'present';
    return { condition, fresh: !!s.fresh && condition === 'present' };
  }
  static icon(a: Aspect): Icon { return { ...Signs.aspects[a], said: Emphasis.words[a] }; }
}
