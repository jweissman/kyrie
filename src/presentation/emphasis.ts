import type { Aspect, Promoted } from './glance-types';
import type { Choice } from '../ui/choice-list';

// How an opportunity's aspects are drawn (amendment 6, C): the page's one table of them. Meaning is the engine's
// (see Aspects); this is presentation only, and the only place a colour stands for an aspect. Gold is the aim the
// player follows and nothing else; silver what is worth exploring; green what is to be gained; blue what is to be
// learned; red a danger seen; violet the uncanny; rose someone who could join the company (the owner, 11 November).
// What has none (a need, the way back, an ordinary control) is neutral. Every tone has its word, so that colour is
// never the only cue.
export type Tone = 'gold' | 'silver' | 'green' | 'blue' | 'red' | 'violet' | 'rose';
export class Emphasis {
  static readonly tones: Record<Aspect, Tone> = { undertaking: 'gold', exploration: 'silver', payoff: 'green',
    knowledge: 'blue', danger: 'red', wonder: 'violet', companionship: 'rose' };
  // Each tone as the page's own tokens give it (web/reader/foundations.css, glance.css: --tone-*), for a client with
  // no stylesheet (the terminal's true colour); coral, given in OKLCH, is its sRGB. Held to the tokens by a spec.
  static readonly rgb: Record<Tone, readonly [number, number, number]> = { gold: [242, 189, 76],
    silver: [215, 219, 228], green: [95, 211, 182], blue: [121, 174, 247], red: [255, 107, 69],
    violet: [180, 156, 255], rose: [247, 124, 137] };
  static readonly words: Record<Aspect, string> = { undertaking: 'your aim', exploration: 'worth a look',
    payoff: 'to gain', knowledge: 'to learn', danger: 'danger', wonder: 'uncanny', companionship: 'a companion' };
  // Which of an act's aspects is its one colour, where it has several (the owner, 14 November: TP-02, one dominant
  // colour per act from one table that every client reads). The followed aim's gold strictly first, and only where it
  // is drawn at all (see drawn); then a danger seen; then the rest in the atlas's own order. What it is besides is said
  // by at most two icons, or in its detail (see Indicator).
  static readonly precedence: readonly Aspect[] = ['undertaking', 'danger', 'exploration', 'payoff', 'knowledge',
    'wonder', 'companionship'];
  // Its aspects as drawn, in that order: the first is its colour.
  static ranked(aspects: readonly Aspect[] | undefined, gilded = true): Aspect[] {
    const drawn = this.drawn(aspects, gilded);
    return this.precedence.filter(a => drawn.includes(a));
  }
  // The aspects as drawn: the aim's only on the one choice that carries it on, and only where the page shows the way
  // (see Guidance); elsewhere such a choice is drawn as what else it is (somewhere worth exploring), or neutral.
  static drawn(aspects: readonly Aspect[] | undefined, gilded = false): Aspect[] {
    return (aspects ?? []).filter(a => a !== 'undertaking' || gilded);
  }
  // The tone it is chiefly drawn in, and the quieter cues of its other aspects.
  static of(aspects: readonly Aspect[] | undefined, gilded = true): { tone?: Tone; also: Tone[] } {
    const [first, ...rest] = this.drawn(aspects, gilded);
    return { ...first ? { tone: this.tones[first] } : {}, also: rest.map(a => this.tones[a]) };
  }
  // Several aspects at once (a fight that is the aim's, a find that teaches): a gradient through their tones, mixed in
  // OKLab so that it passes through no muddy middle; none for one. Only the aspects the choice has, as drawn, never a
  // colour for its own sake (the owner, 11 November: a restrained prismatic treatment for what is several things).
  static prism(aspects: readonly Aspect[] | undefined, gilded = true): string | undefined {
    const tones = this.drawn(aspects, gilded).map(a => `var(--tone-${this.tones[a]})`);
    return tones.length > 1 ? `linear-gradient(in oklab 180deg, ${tones.join(', ')})` : undefined;
  }
  // What an act within an opener (a topic in a talk, a taking up in Look…) is, from what the glance leads with that
  // opens it (see Promoted.inside), and what it says of itself (that it teaches); the aim's only where it is the aim's
  // next step: so that whatever the likeness or the mark outside was drawn as is found again on the act it is for (the
  // owner, 12 November: blue pips with no blue question, a rose pip and the recruiting unmarked).
  static within(acts: readonly Promoted[] | undefined, c: Choice, also: Aspect[] = []): Aspect[] {
    const next = (acts ?? []).some(a => a.continues && this.is(c, a.for));
    const all = [...next ? ['undertaking' as const] : [],
      ...(acts ?? []).flatMap(a => (a.inside ?? []).filter(x => this.is(c, x.command)).flatMap(x => x.aspects)),
      ...also];
    return all.filter((a, i) => all.indexOf(a) === i);
  }
  // Whether a choice does a command, or holds one that does (a group of questions).
  private static is(c: Choice, command?: string): boolean {
    return !!command && (c.command === command || !!c.children?.some(k => k.command === command));
  }
  // The fill of the one indicator at a choice's left edge: through its tones where several meet, else its tone.
  static bar(aspects: readonly Aspect[] | undefined, gilded = true): string | undefined {
    const tone = this.of(aspects, gilded).tone;
    return this.prism(aspects, gilded) ?? (tone ? `var(--tone-${tone})` : undefined);
  }
  // Said beside it where nothing else says why: the chief aspect's word.
  static said(aspects: readonly Aspect[] | undefined, gilded = true): string | undefined {
    const first = this.drawn(aspects, gilded)[0];
    return first && this.words[first];
  }
}
