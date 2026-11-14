import type { CSSProperties } from 'react';
import type { ReaderApp } from '../reader-app';
import type { Aspect } from '../../../src/presentation/glance-types';
import { Emblems } from '../../../src/presentation/emblems';
import { SceneKinds } from '../../../src/ui/scene-kinds';
import { Emphasis } from '../../../src/presentation/emphasis';
import { Pip } from './pip';
import { Guidance } from '../guidance';
import { PlaceStage } from './place-stage';

// The place's mark at the head of its scene (the owner, 11 November): a short accent in the tone of what the company
// knows it can do here now, gathered from what the glance
// leads with (each aspect as it is drawn, the aim's only where the way is shown). Most places have one, or none, and
// it stays quiet; where several kinds of thing meet it runs through their tones (OKLab), and where the place has
// nothing new it is dim. Nothing is gathered that the company does not know, or cannot do or look into from here.
// Its kind (family: a glyph of emblems' places) is said in its words, and drawn only in the flows that open from the
// scene: a glyph in the title would compete with the pips (the owner, 11 November).
export class PlaceMark {
  static readonly families = (Emblems.sets.places as unknown as { kinds: Record<string, string[]> }).kinds;
  static readonly words: Record<string, string> = { town: 'a town', ruin: 'a ruin', shrine: 'a holy place',
    cave: 'under the ground', road: 'a road', wild: 'open country' };
  static View({ app }: { app: ReaderApp }) {
    const frame = app.state.frame!, family = PlaceMark.family(app), facets = PlaceMark.facets(app);
    const idle = frame.leaf.glance?.idle?.includes(frame.screen.place.id);
    // One colour, as every indicator is (see Pip): what it is chiefly, by the one precedence; never through several.
    const fill = Pip.fill(facets, false), said = [PlaceMark.words[family], Pip.words(facets, false)].filter(Boolean).join(', ');
    return <span className={`place-mark${idle ? ' dim' : ''}`} aria-label={said}
      role="img" style={{ '--pm': fill ?? 'var(--faint)' } as CSSProperties}>
      <i className="pm-accent" aria-hidden="true" /></span>;
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
  static facets(app: ReaderApp): Aspect[] {
    const acts = app.state.frame?.leaf.glance?.acts ?? [], shown = Guidance.shown(app);
    const all = acts.flatMap(a => Emphasis.drawn(a.aspects, !!a.continues && shown));
    return all.filter((a, i) => all.indexOf(a) === i);
  }
}
