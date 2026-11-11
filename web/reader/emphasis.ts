import type { Aspect } from '../../src/presentation/glance-types';

// How an opportunity's aspects are drawn (amendment 6, C): the page's one table of them. Meaning is the engine's
// (see Aspects); this is presentation only, and the only place a colour stands for an aspect. Gold is the aim the
// player follows and nothing else; silver what is worth exploring; green what is to be gained; blue what is to be
// learned; red a danger seen; violet the uncanny. What has none (a need, the way back, an ordinary control) is
// neutral. Every tone has its word, so that colour is never the only cue.
export type Tone = 'gold' | 'silver' | 'green' | 'blue' | 'red' | 'violet';
export class Emphasis {
  static readonly tones: Record<Aspect, Tone> = { undertaking: 'gold', exploration: 'silver', payoff: 'green',
    knowledge: 'blue', danger: 'red', wonder: 'violet' };
  static readonly words: Record<Aspect, string> = { undertaking: 'your aim', exploration: 'worth a look',
    payoff: 'to gain', knowledge: 'to learn', danger: 'danger', wonder: 'uncanny' };
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
  // Said beside it where nothing else says why: the chief aspect's word.
  static said(aspects: readonly Aspect[] | undefined, gilded = true): string | undefined {
    const first = this.drawn(aspects, gilded)[0];
    return first && this.words[first];
  }
}
