import { useState } from 'react';
import type { ReaderApp } from '../reader-app';
import { Sheet } from '../sheet';
import { MapView } from '../map-view';
import { PlanView } from '../plan-view';
import { Typography } from '../../../src/presentation/typography';
import { Stage } from './stage';
import { Act } from './act';

// What is read rather than lived: notes, the story so far, what the company carries, the company itself, the map.
// The book opens over the page: its tabs across its head, the one open marked, and the way back to the page first;
// each page of it scrolls within the frame. And the end, when no one is left standing.
export class BookStage {
  // The map is opened here too, though it is no page of the book (the owner, 11 November): with no tabs of the book's
  // over it. Under the ground, it is the plan of the level the company is on, which says what it is the plan of, and
  // the country's map is a touch from it, the site standing on it where the company is.
  static View({ app }: { app: ReaderApp }) {
    const frame = app.state.frame!, map = app.state.view === 'map', [country, toCountry] = useState(false);
    const plan = map && !country && PlanView.inside(frame.screen);
    return (
      <div className="book-frame" id="page">
        <header className="book-head">
          <button type="button" className="option back-to" data-action="back" onClick={app.back}>
            {`Back to ${Typography.curl(frame.screen.place.name)}`}</button>
          {!map && <Act.Sheets app={app} />}
          {plan && <button type="button" className="option to-country" data-action="country"
            onClick={() => toCountry(true)}>The country</button>}
        </header>
        <div className="book">
          <div className="book-page">
            {!map ? <Sheet.View app={app} /> : plan
              ? <PlanView.View screen={frame.screen} /> : <MapView.View app={app} screen={frame.screen} />}
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
