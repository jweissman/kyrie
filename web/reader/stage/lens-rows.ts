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
  // The witnesses of every mark the lens draws: the four's, gold where they carry the aim on; drawn by focus, each
  // unit's acts and each promoted row's; the rest bear none (see GlanceStage.LensRow).
  static marks(app: ReaderApp, lens: Lens, choice: Named): Witness[] {
    const g = app.state.frame?.leaf.glance, lensed = g?.lenses?.[lens];
    if (!lensed) { return []; }
    const drawn = LensRows.of(app, lens, lensed, choice), promoted = new Set(lensed.promoted.map(p => p.choice));
    if (!LensRows.focused(app, drawn)) {
      return drawn.promoted.flatMap(p => LensRows.witness(g, choice(app, p.choice), p.choice, !!p.continues) ?? []);
    }
    // As it opens, focused on nothing: a unit marked by every act in it, a row by its own where it was promoted.
    return LensFocus.of(drawn.all, [], s => s).rows.flatMap(r => LensFocus.unit(r)
      ? r.acts.flatMap(x => Attest.witness(g, x.choice) ?? [])
      : promoted.has(r.choice) ? LensRows.witness(g, choice(app, r.choice), r.choice, true) ?? [] : []);
  }
}
