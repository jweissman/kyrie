import type { Choice } from '../../../src/ui/choice-list';
import type { ExitRow, Screen } from '../../../src/ui/screen-types';
import { Scenery } from '../../../src/ui/scenery';
import type { ReaderApp } from '../reader-app';
import { PlaceStage } from './place-stage';

// A place as it is seen, the play's surface wherever the company is not out in the wild (the owner, 4 November,
// evening: the painting is the place; a graph of rooms is not a map). Its painting, always (the owner, 6 November:
// never words where the picture goes): of the country it stands in (a town, a site above ground), or of a room of its
// kind (a cave, a crypt, a dim room) under a roof or the ground; in the dark, the same barely seen, its shapes only.
// Nothing is set over the picture (it is sacrosanct); what is said of the place is beside it (see Told.Setting), and how
// deep it is at the page's head.
export class SceneSurface {
  static View({ screen }: { screen: Screen }) {
    const view = Scenery.seen(screen);
    return (
      <div className={`scene-surface painted${screen.dark ? ' unlit' : ''}${screen.place.underground ? ' under' : ''}`}
        data-region="scene-surface">
        <div className="scene-view"><PlaceStage.Country view={view} /></div>
      </div>
    );
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
