import type { CSSProperties } from 'react';
import type { ReaderApp } from '../reader-app';
import type { Attested } from '../../../src/presentation/attest';
import { SceneRail } from './scene-rail';
import { Glyphs } from '../creation/glyphs';

// The lenses folded at rest (OR-1084, the owner, 26 November: "fade the lenses rail in the resting scene, or at least
// let it be folded into a single icon"; the engine's hint, Glance.rail): one faceted diamond, the Atlas's facets, in
// the lenses' place on the rail. Taken up (a press, Enter on it, or F), the lenses
// stand beside it as they stood on the rail; a lens opened keeps them so, and they fold again at a new place.
// The diamond glitters with what the folded lenses hold (the owner: the one designed element coloured so, the colour
// grammar's exception, AGENTS.md): its cut filled, still, with the Atlas colour of each opportunity their marks bear
// unfolded, from the same derivation (SceneRail.go, SceneRail.look), never a list of its own: one colour for one, a
// restrained OKLab gradient across several, neutral where there are none. Nothing in it moves or flashes.
export class Folded {
  // Unfolded: taken up here, or a lens of it open.
  static open(app: ReaderApp): boolean {
    const s = app.state;
    return s.rail === s.frame?.screen.place.id || !!s.exploring || !!s.talking;
  }
  static toggle(app: ReaderApp) {
    const s = app.state, here = s.frame?.screen.place.id;
    app.setState(Folded.open(app) ? { rail: undefined, exploring: undefined, talking: false } : { rail: here });
  }
  // What the folded lenses hold: the marks of those that bear one, each as it is drawn unfolded.
  static held(app: ReaderApp): Attested[] {
    return [SceneRail.go(app), SceneRail.look(app)].flatMap(s => 'lit' in s && s.lit ? [s.lit] : []);
  }
  // Its fill: none (neutral), one tone, or a restrained OKLab gradient across several, in the precedence they come in.
  static glint(held: Attested[]): string | undefined {
    const tones = [...new Set(held.flatMap(m => m.tone ?? []))];
    if (tones.length < 2) { return tones[0] && `var(--tone-${tones[0]})`; }
    return `linear-gradient(135deg in oklab, ${tones.map(t => `var(--tone-${t})`).join(', ')})`;
  }
  static Mark({ app, open }: { app: ReaderApp; open: boolean }) {
    const held = Folded.held(app), glint = Folded.glint(held);
    const said = `The lenses${held.length ? `: ${[...new Set(held.map(m => m.words))].join('; ')}` : ''}`;
    return <button type="button" className={`rail-mark lenses-mark${glint ? ' glinting' : ''}`} data-action="lenses"
      aria-expanded={open} aria-controls="lenses-fold" aria-label={said} onClick={() => Folded.toggle(app)}>
      <i className="glint" aria-hidden="true" style={glint ? { '--glint': glint } as CSSProperties : undefined} />
      <svg className="rail-glyph facets" viewBox="0 0 48 48" aria-hidden="true" focusable="false">
        <path d={Folded.cut} vectorEffect="non-scaling-stroke" /></svg>
      {/* Someone who might join is an icon, never a colour (TP-03): carried as Go's mark carries it. */}
      {held.some(m => m.companion) && <Glyphs.View id="companion" className="pip-icon companion" />}
    </button>;
  }
  // The diamond's cut, in the emblems' 48 units: its girdle, table and facets.
  static readonly cut = 'M16 9H32L40 19L24 40L8 19ZM8 19H40M20 19L24 9L28 19M20 19L24 40M28 19L24 40';
}
