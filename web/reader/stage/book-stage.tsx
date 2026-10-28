import type { ReaderApp } from '../reader-app';
import { Sheet } from '../sheet';
import { MapView } from '../map-view';
import { Typography } from '../../../src/presentation/typography';
import { Stage } from './stage';
import { Act } from './act';

// What is read rather than lived: notes, the story so far, what the company carries, the company itself, the map.
// The book opens over the page: its tabs across its head, the one open marked, and the way back to the page first;
// each page of it scrolls within the frame. And the end, when no one is left standing.
export class BookStage {
  static View({ app }: { app: ReaderApp }) {
    const frame = app.state.frame!;
    return (
      <div className="book-frame" id="page">
        <header className="book-head">
          <button type="button" className="option back-to" data-action="back" onClick={app.back}>
            {`Back to ${Typography.curl(frame.screen.place.name)}`}</button>
          <Act.Sheets app={app} />
        </header>
        <div className="book">
          <div className="book-page">
            {app.state.view === 'map' ? <MapView.View app={app} screen={frame.screen} /> : <Sheet.View app={app} />}
          </div>
        </div>
      </div>
    );
  }
  // No one is left standing: how it came to that, and what can be done now.
  static Ending({ app }: { app: ReaderApp }) {
    const frame = app.state.frame!, ending = frame.ending ?? { title: 'No one is left standing', lines: [] };
    return (
      <div className="book-page ending fallen" id="page">
        <h1 className="place">{Typography.curl(ending.title)}</h1>
        <Stage.When frame={frame} />
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
