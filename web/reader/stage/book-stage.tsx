import type { ReaderApp } from '../reader-app';
import { Sheet } from '../sheet';
import { MapView } from '../map-view';
import { Typography } from '../../../src/presentation/typography';
import { Act } from './act';
import { Stage } from './stage';

// What is read rather than lived: notes, the story so far, what the company carries, the company itself, the map.
// Each is a page of its own, with the way back to where you are; and the end, when no one is left standing.
export class BookStage {
  static View({ app }: { app: ReaderApp }) {
    const frame = app.state.frame!;
    return (
      <div className="book-page" id="page">
        {app.state.view === 'map' ? <MapView.View app={app} screen={frame.screen} /> : <Sheet.View app={app} />}
        <Act.Sheets app={app} />
      </div>
    );
  }
  // No one is left standing: how it came to that, and what can be done now.
  static Ending({ app }: { app: ReaderApp }) {
    const frame = app.state.frame!, ending = frame.ending ?? { title: 'No one is left standing', lines: [] };
    return (
      <div className="book-page ending fallen" id="page">
        <Stage.Status frame={frame} />
        <h1 className="place">{Typography.curl(ending.title)}</h1>
        {ending.lines.map((l, i) => <p key={i} className={i === 0 ? 'how' : undefined}>{Typography.curl(l)}</p>)}
        <ul className="acts">
          {frame.ending?.memorial && <li><button type="button" className="act" data-action="again"
            onClick={app.opening.again}>Begin again in this country</button></li>}
          <li><button type="button" className="act" data-action="new" onClick={app.opening.title}>Back to the title</button></li>
        </ul>
      </div>
    );
  }
}
