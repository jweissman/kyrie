import type { Choice } from '../../../src/ui/choice-list';
import type { ReaderApp } from '../reader-app';
import { MenuModel } from '../menu-model';
import { Words } from '../words';
import type { Draw } from './act';
import { Drawer } from './drawer';
import { PlaceStage } from './place-stage';
import { Raised } from './raised';

// Every way from a place (OWN-19): a sheet raised over the glance by one touch (W), which rows the nearest few. Where
// you are bound and the next way there, and giving it up; across country, the six ways as the hexes about lie; the
// ways about the place, the town's other places, the roads out, each with how long and whether you have been; and the
// places further off you know the way to. Whatever your aims name says so.
export class WaysPane {
  static readonly sheet = Raised.ids.ways;
  static Sheet({ app, draw }: { app: ReaderApp; draw: Draw }) {
    const scene = app.menu.scene!, frame = app.state.frame!, screen = frame.screen;
    const from = `From ${screen.place.name.replace(/^The /, 'the ')}`;
    return (
      <Drawer.View app={app} sheet="ways" title={from} shut="ways">
        <div className="ways-all">
          <PlaceStage.Bound app={app} draw={draw} />
          <PlaceStage.Ways screen={screen} near={scene.near} far={scene.far} draw={draw} around={app.menu.around}
            aimed={PlaceStage.aimed(app)} />
          <PlaceStage.Further app={app} draw={draw} />
        </div>
      </Drawer.View>
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
    const aimed = PlaceStage.aimed(app);
    return [...all.filter(c => aimed.includes(c.id)), ...all.filter(c => !aimed.includes(c.id))];
  }
  // "To Ilanis Xiloscient's provision-shop" is "Ilanis Xiloscient's provision-shop" on a tile that is a way already.
  static short(label: string): string {
    return Words.upper(label.replace(/ — .*$/, '').replace(/^(?:Set out (?:for|toward)|To|Into) /, ''));
  }
  static raise(app: ReaderApp, up: boolean) { Raised.raise(app, up ? 'ways' : undefined); }
}
