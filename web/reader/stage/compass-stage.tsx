import type { Compass } from '../../../src/presentation/glance-types';
import type { ReaderApp } from '../reader-app';

// The compass inside an enclosed place (CN-02, CN-03; the owner, 14 November: inside a building the world map had
// opened, with a confusing Back and no way to the other places about). The engine's (Glance.compass): the rail's mark
// turns the places lens on where the map's would (see SceneRail.Books, and M at the keys). The way out is no row of the
// page's: it is the engine's own, among its offer (Compass, OR-188: the page had drawn the way out and the way on as
// rows of its own making beside the menu, an arrow where the indicator stands).
export class CompassStage {
  static of(app: ReaderApp): Compass | undefined {
    const g = app.state.frame?.leaf.glance;
    return g?.enclosed ? g.compass ?? { exhausted: false } : undefined;
  }
}
