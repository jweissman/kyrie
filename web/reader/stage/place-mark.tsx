import type { ReaderApp } from '../reader-app';
import { Emblems } from '../../../src/presentation/emblems';
import { SceneKinds } from '../../../src/ui/scene-kinds';
import { Pip } from './pip';
import type { Attested } from '../../../src/presentation/attest';
import { Fold } from '../../../src/presentation/fold';
import { GlanceStage } from './glance';
import { Guidance } from '../guidance';
import { PlaceStage } from './place-stage';

// The place's mark at the head of its scene (the owner, 11 November): a short neutral dash before the place's line.
// It takes no Atlas tone (the owner, 25 November, OR-513: the Atlas's colours belong to the menu's action rows alone;
// a heading is text). What the company knows it can do here, gathered from what the glance leads with, is said in its
// words for a reader, and where the place has nothing new the dash is dim.
// Its kind (family: a glyph of emblems' places) is said in its words, and drawn only in the flows that open from the
// scene: a glyph in the title would compete with the pips (the owner, 11 November).
export class PlaceMark {
  static readonly families = (Emblems.sets.places as unknown as { kinds: Record<string, string[]> }).kinds;
  static readonly words: Record<string, string> = { town: 'a town', ruin: 'a ruin', shrine: 'a holy place',
    cave: 'under the ground', road: 'a road', wild: 'open country' };
  static View({ app }: { app: ReaderApp }) {
    const frame = app.state.frame!, family = PlaceMark.family(app), facets = PlaceMark.facets(app);
    const idle = frame.leaf.glance?.idle?.includes(frame.screen.place.id);
    const said = [PlaceMark.words[family], facets?.words].filter(Boolean).join(', ');
    return <span className={`place-mark${idle ? ' dim' : ''}`} aria-label={said} data-condition={Pip.condition({ idle })}
      role="img"><i className="pm-accent" aria-hidden="true" /></span>;
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
  // The fold of what the place leads with (Fold.led): each act by its leaves, an opener by its rows.
  static facets(app: ReaderApp): Attested | undefined {
    return Fold.mark(Fold.led(app.state.frame?.leaf.glance, GlanceStage.choice.bind(null, app)), Guidance.shown(app));
  }
}
