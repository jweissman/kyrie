import type { ReaderApp } from '../reader-app';
import { Emblems } from '../../../src/presentation/emblems';
import { SceneKinds } from '../../../src/ui/scene-kinds';
import { Pip } from './pip';
import type { Attested } from '../../../src/presentation/attest';
import { Fold, type Leaf } from '../../../src/presentation/fold';
import { Folded } from './folded-rail';
import type { CSSProperties } from 'react';
import { Guidance } from '../guidance';
import { PlaceStage } from './place-stage';

// The place's mark at the head of its scene (the owner, 11 November): a short horizontal dash before the place's line,
// the action row's vertical indicator turned on its side. It carries the Atlas colours of every danger and opportunity
// in the place's area (the owner, 26 November, OR-1248: "horizontal and coloured, wherever a place is named"), one
// tone, or a restrained OKLab gradient across several, from the same leaves that mark what the place leads with
// (MenuTree's marks.place), never a list of its own; neutral where there are none. What they are is said in words for
// a reader, and where the place has nothing new the dash is dim. The words beside it stay text.
// Its kind (family: a glyph of emblems' places) is said in its words, and drawn only in the flows that open from the
// scene: a glyph in the title would compete with the pips (the owner, 11 November).
export class PlaceMark {
  static get families(): Record<string, string[]> {
    return (Emblems.sets.places as unknown as { kinds: Record<string, string[]> } | undefined)?.kinds ?? {};
  }
  static readonly words: Record<string, string> = { town: 'a town', ruin: 'a ruin', shrine: 'a holy place',
    cave: 'under the ground', road: 'a road', wild: 'open country' };
  static View({ app }: { app: ReaderApp }) {
    const frame = app.state.frame!, family = PlaceMark.family(app), facets = PlaceMark.facets(app);
    const idle = frame.leaf.glance?.idle?.includes(frame.screen.place.id);
    const said = [PlaceMark.words[family], facets?.words].filter(Boolean).join(', ');
    const glint = PlaceMark.glint(app, frame.menu.marks.place ?? []);
    return <span className={`place-mark${idle ? ' dim' : ''}`} aria-label={said} data-condition={Pip.condition({ idle })}
      role="img"><i className="pm-accent" aria-hidden="true"
        style={glint ? { '--pm': glint } as CSSProperties : undefined} /></span>;
  }
  // Each leaf's own tone, folded as the diamond folds the lenses' (Folded.glint): every danger and opportunity, once.
  static glint(app: ReaderApp, leaves: readonly Leaf[]): string | undefined {
    const shown = Guidance.shown(app);
    return Folded.glint(leaves.flatMap(l => Fold.mark([l], shown) ?? []));
  }
  // Another place named (a way's, the Book's way back): the same dash, by what is perceived of that place's area
  // along the way there (the frame's marks.places), or by the place's own leaves where the company stands.
  static Dash({ app, to }: { app: ReaderApp; to?: string }) {
    const frame = app.state.frame, here = !to || to === frame?.screen.place.id;
    const leaves = (here ? frame?.menu.marks.place : frame?.menu.marks.places?.[to]) ?? [];
    const glint = PlaceMark.glint(app, leaves);
    return <i className="place-dash" aria-hidden="true" style={glint ? { '--pm': glint } as CSSProperties : undefined} />;
  }
  // The kind of place: its scene's kind's family, else what the place is.
  static family(app: ReaderApp): string {
    const screen = app.state.frame!.screen, kind = SceneKinds.of(screen)?.kind.kind;
    const named = kind && Object.entries(PlaceMark.families).find(([, kinds]) => kinds.includes(kind))?.[0];
    if (named) { return named; }
    if (screen.place.underground) { return 'cave'; }
    return { settlement: 'town', site: 'ruin', wild: 'wild' }[PlaceStage.kind(screen)];
  }
  // What the company knows it can do here, by kind, each once, in the order led.
  // The fold of what the place leads with: each act by its leaves, an opener by its rows, as the frame holds them
  // (MenuTree's marks).
  static facets(app: ReaderApp): Attested | undefined {
    return Fold.mark(app.state.frame?.menu.marks.place ?? [], Guidance.shown(app));
  }
}
