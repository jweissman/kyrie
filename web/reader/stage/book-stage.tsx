import { useState } from 'react';
import type { ReaderApp } from '../reader-app';
import { Sheet } from '../sheet';
import { MapView } from '../map-view';
import { PlanView } from '../plan-view';
import { Typography } from '../../../src/presentation/typography';
import { Signs } from '../../../src/presentation/signs';
import { Stage } from './stage';
import { Act } from './act';
import { ChoiceRow } from './choice-row';
import { PageFrame } from '../page-frame';

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
          {/* The way back to the place, a quiet word with its sign (the shared signs' out), not a boxed button over the
              book (Mission 21's scenes: the Pack's head had read as a web page's bar). */}
          <button type="button" className="quiet-word back-to" data-action="back" onClick={app.back}>
            <span className="back-sign" aria-hidden="true">{Signs.way('Out')}</span>
            {Typography.curl(frame.screen.place.name)}</button>
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
  // No one is left standing (the owner, 17 November: the page "doesn't reflect anything useful or interesting about the
  // character", its text grey on a blurred picture, and it did not use the menu): who they were (the name made at
  // creation, their people and calling, how far they had come), how it ended in plain bright words, what they did
  // there, who fell with them, and the two things that can be done, as the menu's own rows.
  static Ending({ app }: { app: ReaderApp }) {
    const frame = app.state.frame!, ending = frame.ending ?? { title: 'No one is left standing', lines: [] };
    const screen = frame.screen, you = screen.party[0], others = screen.party.slice(1);
    const did = [...screen.done ?? [], ...(screen.deeds ?? []).map(d => d.text)];
    return (
      <div className="ending-page" id="page">
        <header className="ending-head">
          <p className="eyebrow">{Typography.curl(ending.title)}</p>
          <h1 className="who">{Typography.curl(you?.name ?? 'You')}</h1>
          {you && <p className="what">{Typography.curl(`${you.line}, level ${you.level}`)}</p>}
          <Stage.When frame={frame} />
        </header>
        <div className="ending-col">
          <div className="ending-told">
            {ending.lines.map((l, i) => <p key={i} className={i === 0 ? 'how' : undefined}>{Typography.curl(l)}</p>)}
          </div>
          {did.length > 0 && <section className="ending-did" aria-label="What you did">
            <h2>What you did</h2>
            <ul>{did.map(d => <li key={d}>{Typography.curl(d)}</li>)}</ul>
          </section>}
          {others.length > 0 && <p className="ending-fellows">
            {Typography.curl(`With you: ${others.map(o => `${o.name}, ${o.line}`).join('; ')}.`)}</p>}
          <ol {...PageFrame.slot('menu')} className="led ending-menu" aria-label="What can be done now">
            {frame.ending?.memorial && <li><ChoiceRow.Button className="led-act" data={{ action: 'again' }}
              onClick={app.opening.again} mark={ChoiceRow.neutral} markClass="neutral"
              label="Begin again in this country, from its first day" /></li>}
            <li><ChoiceRow.Button className="led-act" data={{ action: 'new' }} onClick={app.opening.title}
              mark={ChoiceRow.neutral} markClass="neutral" label="Back to the title" /></li>
          </ol>
        </div>
      </div>
    );
  }
}
