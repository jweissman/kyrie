import { memo } from 'react';
import type { Exchange, Frame, Leaf } from '../engine/protocol';
import type { ReaderApp, Travel } from './reader-app';
import { FictionalTime } from '../../src/presentation/fictional-time';
import { Typography } from '../../src/presentation/typography';
import { Words } from './words';

// The world: the country and the hour, where you are, and what is here to be seen; what has changed since you were
// last here; what just happened. At the same place, what just happened comes first, under the place's name, where
// the eye already is; on coming somewhere new, the place comes first and anything that happened on the way after it.
export class WorldView {
  static View({ frame, pending }: { frame: Frame; pending?: { said: string; travel?: Travel; stage?: string } }) {
    const screen = frame.screen, leaf = frame.leaf, exchange = leaf.exchange;
    const told = exchange && (exchange.lines.length || exchange.notes.length) ? exchange : undefined;
    const first = !pending && told && !leaf.moved;
    return (
      <article className="world-body" key={screen.place.id} aria-label={screen.place.name}>
        <p className="where"><span className="title">{frame.title}</span><span data-id="clock">{WorldView.when(frame)}</span></p>
        <h1 className="place" data-id="place">{Typography.curl(Words.upper(screen.place.name))}</h1>
        {leaf.heading && <p className="chapter">{Typography.curl(leaf.heading.kind === 'country'
          ? `Into ${leaf.heading.title}` : leaf.heading.title)}</p>}
        {screen.dark && <p className="dark-note">You have no light.</p>}
        {pending && <WorldView.Working pending={pending} />}
        {!pending && leaf.moved && leaf.journey && <section className="journey" aria-label="On the way">
          {leaf.journey.map((l, i) => <p key={i}>{l}</p>)}</section>}
        {first && <WorldView.Told exchange={told} />}
        <WorldView.Situation leaf={leaf} />
        {leaf.changed.length > 0 && <div className="changed">
          <p className="label">Since you were last here</p>
          {leaf.changed.map((l, i) => <p key={i}>{l}</p>)}
        </div>}
        {!pending && told && leaf.moved && <WorldView.Told exchange={told} after />}
      </article>
    );
  }
  // "Morning · rain · 20 Leaffall": the hour as people say it, the sky, and the day.
  static when(frame: Frame): string {
    const s = frame.screen;
    return [Words.upper(FictionalTime.part(s.elapsed)), s.weather, s.date?.short].filter(Boolean).join(' · ');
  }
  static readonly Situation = memo(WorldView.situation);
  private static situation({ leaf }: { leaf: Leaf }) {
    return (
      <div className="situation">
        {leaf.situation.map((p, i) => <p key={i}>{p}</p>)}
        {leaf.presence.length > 0 && <div className="presence">{leaf.presence.map((p, i) => <p key={i}>{p}</p>)}</div>}
      </div>
    );
  }
  // What came of it: what you did, in a word, and then what happened and what was said.
  static readonly Told = memo(WorldView.told);
  private static told({ exchange, after }: { exchange: Exchange; after?: boolean }) {
    return (
      <section className={`happened tone-${exchange.tone}${after ? ' after' : ''}`} data-id="response" aria-live="polite">
        {exchange.said && <p className="you">{Words.echo(Words.lastSaid(exchange.said))}</p>}
        {exchange.lines.map((l, i) => <p key={i} className={l.kind}>{l.text}</p>)}
        {exchange.notes.length > 0 && <p className="notes">{exchange.notes.map(n => <span key={n}>{n}</span>)}</p>}
      </section>
    );
  }
  // A command under way: said at once, in the player's words; a journey says where it is going and how long it is,
  // and a country being drawn says so. Nothing is held on the screen for its own sake.
  static Working({ pending }: { pending: { said: string; travel?: Travel; stage?: string } }) {
    const t = pending.travel;
    const span = t ? t.minutes >= 60 ? `${Math.round(t.minutes / 6) / 10} hours` : `${t.minutes} minutes` : '';
    return (
      <section className="happened working" aria-live="polite">
        <p className="you">{Typography.curl(Words.echo(Words.lastSaid(pending.said)))}</p>
        {t && <p>By {Typography.curl(t.way)}, {span}.</p>}
        {pending.stage && <p>{pending.stage}.</p>}
      </section>
    );
  }
  // No one is left standing: how it came to that, and what can be done now.
  static Ending({ app, frame }: { app: ReaderApp; frame: Frame }) {
    const ending = frame.ending ?? { title: 'No one is left standing', lines: [] };
    return (
      <article className="world-body fallen" data-mode="fallen">
        <p className="where"><span className="title">{frame.title}</span><span>{WorldView.when(frame)}</span></p>
        <h1 className="place">{Typography.curl(ending.title)}</h1>
        {ending.lines.map((l, i) => <p key={i} className={i === 0 ? 'how' : undefined}>{Typography.curl(l)}</p>)}
        <ul className="acts">
          {frame.ending?.memorial && <li><button type="button" className="act" data-action="again"
            onClick={app.opening.again}>Begin again in this country</button></li>}
          <li><button type="button" className="act" data-action="new" onClick={app.opening.title}>Back to the title</button></li>
        </ul>
      </article>
    );
  }
}
