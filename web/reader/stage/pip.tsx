import type { CSSProperties } from 'react';
import type { Aspect } from '../../../src/presentation/glance-types';
import { Emphasis } from '../../../src/presentation/emphasis';

// The one semantic indicator beside a likeness, a mark of the rail or a way (the owner, 11 November: one canonical
// indicator, everything round it neutral): a small pip of the tone of what can be done, or running through several
// tones where several meet (OKLab). Soft where it is only perceived, off along a way (faint, not dim: dim is the whole
// mark lowered, with nothing new). It says in words what it is, for whoever cannot see the colour.
export class Pip {
  static fill(aspects: readonly Aspect[], gilded: boolean): string | undefined {
    const tone = Emphasis.of(aspects, gilded).tone;
    return Emphasis.prism(aspects, gilded)?.replace('180deg', '135deg') ?? (tone ? `var(--tone-${tone})` : undefined);
  }
  static words(aspects: readonly Aspect[], gilded: boolean): string {
    return Emphasis.drawn(aspects, gilded).map(a => Emphasis.words[a]).join(', ');
  }
  static View({ fill, faint, label }: { fill?: string; faint?: boolean; label?: string }) {
    if (!fill) { return null; }
    return <i className={`pip${faint ? ' faint' : ''}`} style={{ '--pip': fill } as CSSProperties}
      {...label ? { role: 'img', 'aria-label': label, title: label } : { 'aria-hidden': true }} />;
  }
}
