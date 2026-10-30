import type { ReaderApp } from './reader-app';
import { Stage } from './stage/stage';
import { Notices } from './notices';

// Play: the stage for what the company is doing (see Stage), and what is said over it (see Notices), unless the map
// is open over everything, when that is said on the map.
export class PlayPage {
  static View({ app }: { app: ReaderApp }) {
    return <>
      <Stage.View app={app} />
      {!Stage.mapped(app) && <Notices.View app={app} />}
    </>;
  }
}
