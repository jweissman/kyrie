import type { Choice } from '../../../src/ui/choice-list';
import type { ReaderApp } from '../reader-app';
import { Typography } from '../../../src/presentation/typography';
import { MenuModel } from '../menu-model';
import { Words } from '../words';
import { Act, type Draw } from './act';
import { PlaceStage } from './place-stage';

// What can be done from a place: your aim, or where you are bound and the next way there; the ways on; the places
// further off you know the way to; and yourself. Beside the scene on a desktop or a tablet held sideways, every way
// in a column. At the foot of a screen held upright the same, while they are few (a cellar's three ways and the
// tripwire on one); in a busy place (a town square's eight places and seven roads) the nearest few as tiles, and all
// of them a touch away, raised over the scene as a sheet of their own and put away again (Esc, or the cross).
export class WaysPane {
  static readonly sheet = 'ways:all';
  // More ways than this, and an upright screen shows the nearest few, and the rest raised.
  static readonly few = 5;
  static View({ app, draw }: { app: ReaderApp; draw: Draw }) {
    const scene = app.menu.scene!, frame = app.state.frame!, screen = frame.screen;
    const going = WaysPane.going(app), busy = going.length > WaysPane.few;
    const raised = app.state.open.includes(WaysPane.sheet);
    const from = `From ${screen.place.name.replace(/^The /, 'the ')}`;
    return (
      <div className={`on${busy ? ' busy' : ''}`}>
        <PlaceStage.Aim screen={screen} bound={!!frame.bound} />
        <PlaceStage.Bound app={app} draw={draw} />
        {busy && <WaysPane.Nearest app={app} draw={draw} going={going} />}
        <div className={`ways-all${raised ? ' raised' : ''}`} role={busy && raised ? 'dialog' : undefined}
          aria-label={busy ? `The ways ${from.toLowerCase()}` : undefined}>
          {busy && <div className="sheet-head">
            <p className="sheet-title">{Typography.curl(from)}</p>
            <button type="button" className="sheet-shut" aria-label="Put the ways away" data-action="ways"
              onClick={() => WaysPane.raise(app, false)}>
              <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M6 6l12 12M18 6L6 18" /></svg>
            </button>
          </div>}
          <PlaceStage.Ways screen={screen} near={scene.near} far={scene.far} draw={draw} around={app.menu.around} />
          <PlaceStage.Further app={app} draw={draw} />
        </div>
        <PlaceStage.You app={app} draw={draw} />
      </div>
    );
  }
  // Every way to go from here, in the order they are worth taking: those about the place not yet taken, the town's
  // other places, the roads out not yet travelled, then the rest; the places further off last.
  static going(app: ReaderApp): Choice[] {
    const scene = app.menu.scene!, screen = app.state.frame!.screen, bound = app.state.frame!.bound;
    const about = PlaceStage.ways(screen, scene.near), out = PlaceStage.ways(screen, scene.far);
    const first = (ws: typeof about, been: boolean) => ws.filter(w => !!w.exit.visited === been).map(w => w.choices[0]!);
    const across = scene.far.filter(c => !out.some(w => w.choices.includes(c)));
    const further = (app.menu.destinations ?? []).filter(c => c.id !== MenuModel.unbind && c.id !== `travel:${bound?.id}`);
    const all = [...first(about, false), ...app.menu.around ?? [], ...first(out, false), ...across, ...first(about, true),
      ...first(out, true), ...further];
    // Where the company's aim takes it before anything else (the bridge its father went out by).
    return [...all.filter(c => PlaceStage.aims(screen, c)), ...all.filter(c => !PlaceStage.aims(screen, c))];
  }
  // The nearest few, as tiles, each with how long it takes when that is more than a step (not by what way: the town's
  // other places had each said "by the bridge-foot at Wychmaere"), and the rest raised by one touch.
  static Nearest({ app, draw, going }: { app: ReaderApp; draw: Draw; going: Choice[] }) {
    const shown = going.slice(0, 3);
    return (
      <nav className="nearest" aria-label="The nearest ways">
        <ul className="tiles">{shown.map(c => <li key={c.id}><Act.View choice={c} draw={draw}
          className={`tile${PlaceStage.aims(app.state.frame!.screen, c) ? ' aimed' : ''}`}>
          <span className="n">{Typography.curl(WaysPane.short(c.label))}</span>
          {(c.minutes ?? 0) > 10 && <span className="t">{Words.span(c.minutes!)}</span>}</Act.View></li>)}</ul>
        <button type="button" className="all-ways" data-action="ways" aria-expanded={app.state.open.includes(WaysPane.sheet)}
          onClick={() => WaysPane.raise(app, true)}>
          <span>Every way from here</span><span className="count">{going.length}</span>
        </button>
      </nav>
    );
  }
  // "To Ilanis Xiloscient's provision-shop" is "Ilanis Xiloscient's provision-shop" on a tile that is a way already.
  static short(label: string): string {
    return Words.upper(label.replace(/ — .*$/, '').replace(/^(?:Set out (?:for|toward)|To|Into) /, ''));
  }
  static raise(app: ReaderApp, up: boolean) {
    const open = app.state.open.filter(id => id !== WaysPane.sheet);
    app.setState({ open: up ? [...open, WaysPane.sheet] : open });
  }
}
