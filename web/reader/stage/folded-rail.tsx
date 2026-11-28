import type { CSSProperties } from 'react';
import type { ReaderApp } from '../reader-app';
import type { Attested } from '../../../src/presentation/attest';
import { Surfaces } from '../../../src/presentation/surfaces';
import type { Tone } from '../../../src/presentation/emphasis';
import { Glyphs } from '../creation/glyphs';
import { Guidance } from '../guidance';

// The lenses folded behind one faceted diamond (OR-1084, the owner, 26 November: "fade the lenses rail in the resting
// scene, or at least let it be folded into a single icon"), always there (the owner, 27 November, late, OR-1880: "if
// there is nothing to emphasize it is just dim"). Whether the lenses stand unfolded beside it is the engine's
// (Rail.unfolded: after act I, or while one of them holds something); a press, Enter on it or F folds or unfolds them
// here, a lens opened keeps them so, and the engine's word holds again at a new place.
// The diamond glitters with what the folded lenses hold (the owner: the one designed element coloured so, the colour
// grammar's exception, AGENTS.md): its cut filled, still, with the Atlas colour of each opportunity their rows bear,
// as the engine says it (Rail.diamond, from the lenses' own rows: Lensed.aspects), never a list of the page's own: one
// colour for one, a restrained OKLab gradient across several, dim where there are none. Nothing in it moves or flashes.
export class Folded {
  // Unfolded: as the engine says, unless folded here; taken up here; or a lens of it open (the compass's Go is none).
  static open(app: ReaderApp): boolean {
    const s = app.state, here = s.frame?.screen.place.id, rail = s.frame?.leaf.glance?.rail;
    if (!rail?.lenses.length && !Folded.mapped(app)) { return false; }
    return (!!rail?.unfolded && s.folded !== here) || s.rail === here || (!!s.exploring && s.exploring !== 'go')
      || !!s.talking;
  }
  static toggle(app: ReaderApp) {
    const s = app.state, here = s.frame?.screen.place.id;
    if (!Folded.holds(app)) { return; }
    app.setState(Folded.open(app) ? { rail: undefined, folded: here, exploring: undefined, talking: false }
      : { rail: here, folded: undefined });
  }
  // Whether anything stands folded behind it: a lens had, or the world map once earned (outdoors).
  static holds(app: ReaderApp): boolean { return !!app.state.frame?.leaf.glance?.rail?.lenses.length || Folded.mapped(app); }
  private static mapped(app: ReaderApp): boolean {
    return !!app.state.frame?.screen.surfaces?.includes('the_map') && !app.state.frame?.leaf.glance?.enclosed;
  }
  // What the diamond holds, as the engine says it (Surfaces.diamond), the aim's gold only where the way is shown.
  static held(app: ReaderApp) { return Surfaces.diamond(app.state.frame?.leaf.glance?.rail, Guidance.shown(app)); }
  // Its fill: none (dim), one tone, or a restrained OKLab gradient across several, in the precedence they come in.
  static fill(tones: readonly Tone[]): string | undefined { return Folded.gradient([...tones]); }
  // A place-mark's fill, by the same rule, from its own leaves' marks (see PlaceMark).
  static glint(held: Attested[]): string | undefined {
    return Folded.gradient(held.flatMap(m => m.tone ?? []));
  }
  private static gradient(all: string[]): string | undefined {
    const tones = [...new Set(all)];
    if (tones.length < 2) { return tones[0] && `var(--tone-${tones[0]})`; }
    return `linear-gradient(135deg in oklab, ${tones.map(t => `var(--tone-${t})`).join(', ')})`;
  }
  static Mark({ app, open }: { app: ReaderApp; open: boolean }) {
    const held = Folded.held(app), glint = Folded.fill(held.tones), holds = Folded.holds(app);
    const said = !holds ? 'The lenses: none had yet'
      : `The lenses${held.words.length ? `: ${held.words.join('; ')}` : ''}`;
    return <button type="button" className={`rail-mark lenses-mark${glint ? ' glinting' : ' dim'}`} data-action="lenses"
      aria-expanded={open} aria-controls="lenses-fold" aria-label={said} aria-disabled={!holds || undefined}
      onClick={() => Folded.toggle(app)}>
      <i className="glint" aria-hidden="true" style={glint ? { '--glint': glint } as CSSProperties : undefined} />
      <svg className="rail-glyph facets" viewBox="0 0 48 48" aria-hidden="true" focusable="false">
        <path d={Folded.cut} vectorEffect="non-scaling-stroke" /></svg>
      {/* Someone who might join is an icon, never a colour (TP-03): carried as Go's mark carries it. */}
      {held.companion && <Glyphs.View id="companion" className="pip-icon companion" />}
    </button>;
  }
  // The diamond's cut, in the emblems' 48 units: its girdle, table and facets.
  static readonly cut = 'M16 9H32L40 19L24 40L8 19ZM8 19H40M20 19L24 9L28 19M20 19L24 40M28 19L24 40';
}
