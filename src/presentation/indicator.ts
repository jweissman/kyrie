import { Emphasis, type Tone } from './emphasis';
import { Signs } from './signs';
import type { Aspect } from './glance-types';

// One icon beside an act's words: its character, its plain one where there is no unicode, and what it says.
export interface Icon { sign: string; plain: string; said: string }
// An act's one indicator: its colour (the aspect it is chiefly, by Emphasis.precedence), at most two icons for what it
// is besides, and whatever else in its detail, in words.
export interface Indicated { aspect?: Aspect; tone?: Tone; icons: Icon[]; detail: string[] }
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
    const besides: Icon[] = [...drawn.includes('companionship') ? [this.icon('companionship')] : [], ...off,
      ...rest.map(a => this.icon(a)), ...c.crosses ? [Signs.crossing] : [], ...c.hold ? [this.hold] : []];
    return { ...first ? { aspect: first, tone: Emphasis.tones[first] } : {}, icons: besides.slice(0, this.icons),
      detail: besides.slice(this.icons).map(i => i.said) };
  }
  // Every aspect drawn, in words, its colour's first and a companion's last: what is said where there is no colour,
  // and on asking.
  static words(aspects: readonly Aspect[] | undefined, gilded = true): string[] {
    const drawn = Emphasis.drawn(aspects, gilded);
    return [...Emphasis.ranked(drawn), ...drawn.includes('companionship') ? ['companionship' as const] : []]
      .map(a => Emphasis.words[a]);
  }
  // Whether what is perceived along a way is its faint pip: the way has no colour of its own, and it is no companion.
  static faint(c: Carrying, tone = Emphasis.ranked(Emphasis.drawn(c.aspects, c.gilded ?? true))[0]): boolean {
    return !!c.sensed && !tone && c.sensed.aspect !== 'companionship';
  }
  static icon(a: Aspect): Icon { return { ...Signs.aspects[a], said: Emphasis.words[a] }; }
}
