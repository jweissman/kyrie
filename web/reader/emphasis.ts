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
  // The tone it is chiefly drawn in, and the quieter cues of its other aspects.
  static of(aspects: readonly Aspect[] | undefined): { tone?: Tone; also: Tone[] } {
    const [first, ...rest] = aspects ?? [];
    return { ...first ? { tone: this.tones[first] } : {}, also: rest.map(a => this.tones[a]) };
  }
  // Said beside it where nothing else says why: the chief aspect's word.
  static said(aspects: readonly Aspect[] | undefined): string | undefined {
    const first = aspects?.[0];
    return first && this.words[first];
  }
}
