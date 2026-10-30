import type { ReaderApp } from '../reader-app';
import type { Draw } from './act';
import { Drawer } from './drawer';
import { HerePane } from './here-pane';
import { PlaceStage } from './place-stage';
import { Told } from './told';

// Looking about (OWN-18): the place told whole, as it was told before the glance: the way here, the place, everyone
// and everything here with all that can be done with them (danger first, whoever the company has a stake in large),
// what has changed, what there is to do of the place's own, and in a settlement where food, light, gear and remedies
// are found. Nothing written is lost; it is one deliberate touch away (L).
export class LookAbout {
  static Sheet({ app, draw }: { app: ReaderApp; draw: Draw }) {
    const screen = app.state.frame!.screen;
    return (
      <Drawer.View app={app} sheet="look" title={`About ${screen.place.name.replace(/^The /, 'the ')}`} shut="look-about">
        <div className="telling">
          <Told.Place app={app} headed={false} whole here={<PlaceStage.Here app={app} draw={draw} marked />} />
        </div>
        <HerePane.Doing app={app} draw={draw} />
        <HerePane.Services app={app} />
      </Drawer.View>
    );
  }
  // How many there are to look at (everyone and everything here), said on the key that opens them.
  static count(app: ReaderApp): number { return app.menu.scene?.subjects.length ?? 0; }
}
