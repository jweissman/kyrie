import type { Glance, Lens, LensAct, Lensed, Promoted } from '../../../src/presentation/glance-types';
import { Attest, type Witness } from '../../../src/presentation/attest';
import type { ReaderApp } from '../reader-app';
import type { Choice } from '../../../src/ui/choice-list';
import { LensFocus } from './lens-focus';
import { Selection } from './lens-selection';

// What a lens draws, row by row, and the witnesses of the marks those rows bear: one selection, read by the lens as
// it draws (GlanceStage.Lens) and by the rail's mark that opens it (SceneRail.go, SceneRail.look), so the mark can be
// made of nothing the lens does not draw (the owner, 18 November: Go… gold over a lens of "to the fellside" and "Open
// the world map", neither gold; the mark had been made from the page's own list of ways, Wayfinder.ways, and the lens
// drew the engine's).
export interface Drawn {
  promoted: Promoted[]; opened: Promoted[]; flat: LensAct[]; all: (Promoted | LensAct)[];
  inside: (a: LensAct) => LensAct[];
}
export type Named = (app: ReaderApp, id: string) => Choice | undefined;

export class LensRows {
  static readonly per = 4;
  // The lens's rows. An opener among them (a thing's look, with no act of its own) is drawn as what it opens, its
  // leaves, and what it opens that the lens gives already is not drawn twice (a door's words); an opener on a way whose
  // every act the lens gives itself (the speaking door's look) is not drawn as well.
  static of(app: ReaderApp, lens: Lens, lensed: Lensed, choice: Named): Drawn {
    const sel = new Selection(app, lensed, lens === 'things' ? lensed.leaves ?? {} : {}, choice);
    const promoted = lensed.promoted.filter(p => !sel.opens(p) && !sel.covered(p));
    const opened = lensed.promoted.filter(p => sel.opens(p) && sel.inside(p).length);
    const rest = lensed.rest.flatMap(a => sel.opens(a) ? sel.inside(a) : sel.covered(a) ? [] : [a]);
    const flat = LensRows.grouped(rest).flatMap(g => g.acts);
    const all = [...promoted, ...opened.flatMap(p => sel.inside(p)), ...flat];
    return { promoted, opened, flat, all, inside: sel.inside.bind(sel) };
  }
  // Whether the lens is drawn by focus (more than four, or something focused already: see LensFocused).
  static focused(app: ReaderApp, drawn: Drawn): boolean {
    return drawn.all.length > LensRows.per || !!app.state.focused?.length;
  }
  // A lens's rest by what it is done to (LensAct.subject): a thing's or someone's acts together under their name.
  static grouped(rest: LensAct[]): { subject?: string; acts: LensAct[] }[] {
    const out: { subject?: string; acts: LensAct[] }[] = [];
    for (const a of rest) {
      const prior = out.at(-1);
      if (prior && a.subject && prior.subject === a.subject) { prior.acts.push(a); continue; }
      out.push({ ...a.subject ? { subject: a.subject } : {}, acts: [a] });
    }
    return out;
  }
  // The witness a row is marked by: the glance's for its choice, or for what is within it; its gold only where the
  // row carries the aim on (gilded), as the four draw it.
  static witness(g: Glance | undefined, c: Choice | undefined, id: string, gilded: boolean): Witness | undefined {
    const w = Attest.witness(g, id) ?? Attest.within(g, c ?? { id, label: '' } as Choice)[0];
    return gilded ? w : Attest.less(w, 'undertaking');
  }
  // The one witness a lens's row is drawn with, wherever it is drawn (among the four, as a rest row, inside a thing
  // gathered by focus) and whatever reads it (the rail's mark, the strip's tile): the glance's for its choice, its
  // gold only where it carries the aim on (the owner, 19 November: a gathered row gold, and nothing gold once it was
  // opened; a companion on Go… and on no row of its lens: each drawer had made its own).
  // An act within an opener the menu does not hold unopened (a tablet's reading, gathered by focus) is known by the
  // lens's own command for it, so that what the opener is led for is found on it (AT-07: the gathered tablets plain).
  static borne(app: ReaderApp, lens: Lens, id: string, choice: Named): Witness | undefined {
    const g = app.state.frame?.leaf.glance, lensed = g?.lenses?.[lens];
    const on = [...g?.acts ?? [], ...lensed?.promoted ?? []].some(a => a.choice === id && a.continues);
    const command = Object.values(lensed?.leaves ?? {}).flat().find(a => a.choice === id)?.command;
    return LensRows.witness(g, choice(app, id) ?? (command ? { id, label: '', command } as Choice : undefined), id, on);
  }
  // The witnesses of a way or thing's rows in the lens (its choice, or the acts done to it): a tile over the painting
  // is marked by these where the lens is what opens, never by a derivation of its own.
  static about(app: ReaderApp, lens: Lens, key: string, choice: Named): Witness[] {
    const lensed = app.state.frame?.leaf.glance?.lenses?.[lens];
    if (!lensed) { return []; }
    return LensRows.of(app, lens, lensed, choice).all.filter(a => a.choice === key || a.subject === key)
      .flatMap(a => LensRows.borne(app, lens, a.choice, choice) ?? []);
  }
  // The witnesses of every mark the lens draws as it opens, focused on nothing: each row's, a row gathered by focus
  // marked by every act in it, on every page: a later page's are promised on the row that turns to it, which is marked
  // by their fold (AT-07 §5 step 3, I5; a mark had been lit by a row three pages on, and nothing in view said so).
  static marks(app: ReaderApp, lens: Lens, choice: Named): Witness[] {
    const lensed = app.state.frame?.leaf.glance?.lenses?.[lens];
    if (!lensed) { return []; }
    const drawn = LensRows.of(app, lens, lensed, choice);
    if (!LensRows.focused(app, drawn)) { return drawn.all.flatMap(a => LensRows.each(app, lens, choice, a)); }
    return LensFocus.of(drawn.all, [], s => s).rows.flatMap(r => LensFocus.unit(r)
      ? r.acts.flatMap(x => LensRows.each(app, lens, choice, x)) : LensRows.each(app, lens, choice, r));
  }
  private static each(app: ReaderApp, lens: Lens, choice: Named, a: { choice: string }): Witness[] {
    const w = LensRows.borne(app, lens, a.choice, choice);
    return w ? [w] : [];
  }
}
