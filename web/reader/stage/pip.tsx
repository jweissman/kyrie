import type { CSSProperties } from 'react';
import { Glyphs } from '../creation/glyphs';
import { Indicator, type Condition, type Standing } from '../../../src/presentation/indicator';
import type { Attested } from '../../../src/presentation/attest';

// The one semantic indicator beside a likeness, a mark of the rail or a way, and at a row's left (the owner, 11
// November: one canonical indicator, everything round it neutral; 14 November, TP-02): one colour, the act's chief
// aspect by the precedence every client reads (Indicator: the aim's gold, then red, green, blue, violet, silver), never
// a gradient through several. A companion is its icon alone, never a colour (TP-03); nothing is held (IG-07). Soft
// where it is only perceived, off along a way (faint, not dim: dim is the whole mark lowered, with nothing new). It
// says in words what it is, for whoever cannot see the colour.
export class Pip {
  // How an opportunity stands, for the page's data-condition (indicator-appendix.md): none where it is present, so
  // that only what is far, heard of, idle or spent is marked, each drawn by its one value (row.css).
  static condition(s: Standing): Condition | undefined {
    const c = Indicator.condition(s).condition;
    return c === 'present' ? undefined : c;
  }
  // The pip's fill, from an indicator alone.
  static fill(mark: Attested | undefined): string | undefined { return mark?.tone && `var(--tone-${mark.tone})`; }
  // Its pip, and a companion's icon beside it or alone (the words said once, on whichever is drawn first): only of an
  // indicator, which is made only of the glance's witnesses (Attest); a page cannot draw one of a colour of its own
  // (the owner's trust contracts, 18 November: "no semantic pip can be constructed without an authoritative witness").
  static View({ mark, label }: { mark?: Attested; label?: string }) {
    if (!mark) { return null; }
    const said = (first: boolean) => first ? { role: 'img', 'aria-label': label ?? mark.words } : { 'aria-hidden': true };
    const witness = mark.witnesses.map(w => w.id).join(' ');
    return <>
      {mark.tone && <i className={`pip${mark.faint ? ' faint' : ''}`} data-condition={Pip.condition({ afar: mark.faint })}
        data-witness={witness} style={{ '--pip': Pip.fill(mark) } as CSSProperties} {...said(true)} />}
      {mark.companion && <Glyphs.View id="companion" className={`pip-icon companion${mark.faint ? ' faint' : ''}`}
        {...!mark.tone ? { label: label ?? mark.words } : {}} />}
    </>;
  }
}
