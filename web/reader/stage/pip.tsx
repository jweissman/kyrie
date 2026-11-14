import type { CSSProperties } from 'react';
import type { Aspect } from '../../../src/presentation/glance-types';
import { Emphasis, type Tone } from '../../../src/presentation/emphasis';
import { Glyphs } from '../creation/glyphs';
import { Indicator, type Indicated } from '../../../src/presentation/indicator';

// The one semantic indicator beside a likeness, a mark of the rail or a way, and at a row's left (the owner, 11
// November: one canonical indicator, everything round it neutral; 14 November, TP-02): one colour, the act's chief
// aspect by the precedence every client reads (Indicator: the aim's gold, then red, green, blue, violet, silver), never
// a gradient through several. A companion is its icon alone, never a colour (TP-03); nothing is held (IG-07). Soft
// where it is only perceived, off along a way (faint, not dim: dim is the whole mark lowered, with nothing new). It
// says in words what it is, for whoever cannot see the colour.
export class Pip {
  // Its colour as Indicator gives it, a companion apart: the page draws the companion's icon itself (see View), and
  // so asks no companion of Indicator, whose way of drawing one has varied by client (TP-03).
  static of(aspects: readonly Aspect[] | undefined, gilded: boolean): Indicated {
    return Indicator.of({ aspects: (aspects ?? []).filter(a => a !== 'companionship'), gilded });
  }
  static tone(aspects: readonly Aspect[] | undefined, gilded: boolean): Tone | undefined {
    return Pip.of(aspects, gilded).tone;
  }
  static fill(aspects: readonly Aspect[] | undefined, gilded: boolean): string | undefined {
    const tone = Pip.tone(aspects, gilded);
    return tone && `var(--tone-${tone})`;
  }
  // The tone of what is perceived off along a way: a companion's is none (its icon, or its words, say it).
  static sensed(aspect: Aspect | undefined): Tone | undefined {
    return aspect && aspect !== 'companionship' ? Emphasis.tones[aspect] : undefined;
  }
  // All it is, in words, its colour's first.
  static words(aspects: readonly Aspect[] | undefined, gilded: boolean): string {
    return Emphasis.ranked(aspects, gilded).map(a => Emphasis.words[a]).join(', ');
  }
  // Its pip, and a companion's icon beside it or alone (the words said once, on whichever is drawn first).
  static View({ fill, faint, label, companion }: { fill?: string; faint?: boolean; label?: string;
    companion?: boolean }) {
    if (!fill && !companion) { return null; }
    const said = (first: boolean) => label && first ? { role: 'img', 'aria-label': label } : { 'aria-hidden': true };
    return <>
      {fill && <i className={`pip${faint ? ' faint' : ''}`} style={{ '--pip': fill } as CSSProperties} {...said(true)} />}
      {companion && <Glyphs.View id="companion" className={`pip-icon${faint ? ' faint' : ''}`}
        {...label && !fill ? { label } : {}} />}
    </>;
  }
}
