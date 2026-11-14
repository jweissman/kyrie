import { Emphasis, type Tone } from './emphasis';
import { Signs } from './signs';
import type { Aspect } from './glance-types';

// One icon beside an act's words: its character, its plain one where there is no unicode, and what it says.
export interface Icon { sign: string; plain: string; said: string }
// An act's one indicator: its colour (the aspect it is chiefly, by Emphasis.precedence), at most two icons for what it
// is besides, and whatever else in its detail, in words.
export interface Indicated { aspect?: Aspect; tone?: Tone; icons: Icon[]; detail: string[] }
// What an act carries, as the engine typed it: its aspects (gilded where it is the followed aim's next step), whether
// it goes over into the next stretch of country, and whether it is done by holding.
export interface Carrying { aspects?: readonly Aspect[]; gilded?: boolean; crosses?: boolean; hold?: boolean }
// How a companion is drawn: as a colour like any aspect (rose), or as its icon alone (TP-03, an experiment).
export type Companion = 'colour' | 'icon';

// The indicator grammar every client draws by (the owner, 14 November: TP-02). The left-edge pip had broken down where
// an act was several things at once: a prism of three tones read as noise, and a fourth meaning had no room. Now one
// colour, from one precedence table; at most two icons; and the rest said on asking. Meaning never rests on colour
// alone: a client with none draws the colour's own sign in its place.
export class Indicator {
  static readonly icons = 2;
  static readonly hold: Icon = { sign: Signs.hold.sign, plain: '=', said: Signs.hold.said };
  static of(c: Carrying, companion: Companion = 'colour'): Indicated {
    const ranked = Emphasis.ranked(c.aspects, c.gilded ?? true);
    const apart = companion === 'icon' && ranked.includes('companionship');
    const coloured = apart ? ranked.filter(a => a !== 'companionship') : ranked;
    const [first, ...rest] = coloured;
    const besides: Icon[] = [...apart ? [this.icon('companionship')] : [], ...rest.map(a => this.icon(a)),
      ...c.crosses ? [Signs.crossing] : [], ...c.hold ? [this.hold] : []];
    return { ...first ? { aspect: first, tone: Emphasis.tones[first] } : {}, icons: besides.slice(0, this.icons),
      detail: besides.slice(this.icons).map(i => i.said) };
  }
  static icon(a: Aspect): Icon { return { ...Signs.aspects[a], said: Emphasis.words[a] }; }
}
