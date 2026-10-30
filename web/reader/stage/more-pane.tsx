import type { ReaderApp } from '../reader-app';
import { SceneModel } from '../../../src/ui/scene';
import { Act, type Draw } from './act';
import { Drawer } from './drawer';
import { PlaceStage } from './place-stage';
import { Stage } from './stage';

// More (OWN-19): yourself, and what you can do of yourself wherever you are (wait, search, camp, rest, tend, prepare
// spells, a development to spend), and your aim as it stands. They had stood across the foot of every place; now the
// glance leads with one of them when it is worth doing (camp at night in the open, search where the aim is), and the
// rest are here.
export class MorePane {
  static Sheet({ app, draw }: { app: ReaderApp; draw: Draw }) {
    const frame = app.state.frame!, scene = app.menu.scene!;
    return (
      <Drawer.View app={app} sheet="more" title="Yourself" shut="more">
        <section className="you" data-region="party" aria-label="Yourself">
          <Stage.Me screen={frame.screen} />
          <Act.List choices={scene.you.filter(c => !SceneModel.own(c))} draw={draw} className="column yours" marked />
        </section>
        <PlaceStage.Aim screen={frame.screen} bound={!!frame.bound} />
      </Drawer.View>
    );
  }
}
