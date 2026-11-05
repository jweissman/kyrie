import type { Choice } from '../../../src/ui/choice-list';
import type { ExitRow, Screen } from '../../../src/ui/screen-types';
import { Scenery } from '../../../src/ui/scenery';
import type { ReaderApp } from '../reader-app';
import { PlaceStage } from './place-stage';

// A place as it is seen, the play's surface wherever the company is not out in the wild (the owner, 4 November,
// evening: the painting is the place; a graph of rooms is not a map). Its painting: of the country it stands in (a
// town, a site above ground), or of a room of its kind (a dim room, a vault) under a roof or the ground; in the dark,
// only the dark. Nothing is set over the picture (the owner, 4 November evening: it is sacrosanct); what is said of the
// place, and its ways, are beside it, in the focus (see GlanceStage.Row).
export class SceneSurface {
  static View({ screen }: { screen: Screen }) {
    const view = screen.dark ? undefined : Scenery.of(screen) ?? Scenery.inside(screen);
    return (
      <div className={`scene-surface ${view ? 'painted' : 'unpainted'}${screen.place.underground ? ' under' : ''}`}
        data-region="scene-surface">
        {view ? <div className="scene-view"><PlaceStage.Country view={view} /></div>
          : <div className="scene-dark"><SceneSurface.Bearings screen={screen} /></div>}
      </div>
    );
  }
  // In the dark, or where a place has no picture, what the company can still tell of where it is: how deep, and where
  // (the owner, 4 November, late: an interior without artwork as deliberate a scene as one with). Not its ways: they
  // are the explorer's (5 November: no route on the scene).
  static Bearings({ screen }: { screen: Screen }) {
    return <div className="bearings">
      {screen.place.depth ? <p className="deep">{screen.place.depth === 1 ? 'One storey down' : `${screen.place.depth} storeys down`}</p> : null}
      <p className="here">{screen.place.name}</p>
    </div>;
  }
  // A way's direction as a mark: up, down, in, out, away, on.
  static glyph(whither: string): string {
    return { Up: '↑', Down: '↓', Into: '→', Out: '←', Away: '⇢', On: '→' }[whither] ?? '·';
  }
  // The choices that take the company somewhere from here: its ways, and the walks about its town.
  static choices(app: ReaderApp): Choice[] {
    const scene = app.menu.scene!;
    return [...scene.near, ...scene.far, ...app.menu.around ?? []];
  }
  // The ways from here, each its way's own choice (not an act on it): every one, at once (the owner, 4 November
  // evening: no way a sheet away), those the glance ranks first leading.
  static open(screen: Screen, ways: Choice[], ranked: string[]): { c: Choice; exit?: ExitRow }[] {
    const rank = (c: Choice) => { const i = ranked.findIndex(r => r === c.id || r.startsWith(`${c.id}/`)); return i < 0 ? 99 : i; };
    // Each way's own going: its choice, or the first of its acts where it has several (a locked door's "Go").
    const byExit = screen.exits.flatMap(exit => {
      const c = SceneSurface.going(ways, exit.id);
      return c ? [{ c, exit }] : [];
    });
    const walks = ways.filter(c => c.id.startsWith('travel:')).map(c => ({ c, exit: undefined }));
    return [...byExit, ...walks].map((x, i) => ({ ...x, i })).sort((a, b) => rank(a.c) - rank(b.c) || a.i - b.i);
  }
  static going(ways: Choice[], exit: string): Choice | undefined {
    return ways.find(w => w.id === exit || w.id.startsWith(`${exit}/`));
  }
  // Which way it goes, from here, by what the world says of it (its transition), never by its words.
  static whither(exit?: ExitRow): string {
    const t = exit?.transition;
    return t === 'ascend' ? 'Up' : t === 'descend' ? 'Down' : t === 'enter' ? 'Into' : t === 'leave' ? 'Out'
      : t === 'travel' ? 'Away' : t === 'level' ? 'On' : 'To';
  }
}
