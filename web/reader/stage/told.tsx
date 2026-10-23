import type { Exchange } from '../../engine/protocol';
import type { ReaderApp, Travel } from '../reader-app';
import { Typography } from '../../../src/presentation/typography';
import { Words } from '../words';

// What the place says and what just happened in it. Coming somewhere, the way there is told, then the place; doing
// something where the company stands, what came of it is told first, and the place, already read, steps back.
export class Told {
  static Place({ app }: { app: ReaderApp }) {
    const s = app.state, frame = s.frame!, leaf = frame.leaf, screen = frame.screen, exchange = leaf.exchange;
    const told = exchange && (exchange.lines.length || exchange.notes.length) ? exchange : undefined;
    const stayed = !leaf.moved && !!told;
    return <>
      {leaf.heading && <p className="chapter">{Typography.curl(leaf.heading.kind === 'country'
        ? `Into ${leaf.heading.title}` : leaf.heading.title)}</p>}
      {screen.dark && <p className="dark-note">You have no light.</p>}
      {s.pending && <Told.Working pending={{ ...s.pending, stage: s.stage }} />}
      {!s.pending && leaf.moved && leaf.journey && <div className="journey" aria-label="On the way">
        {leaf.journey.map((l, i) => <p key={i}>{l}</p>)}</div>}
      {!s.pending && stayed && <Told.Happened exchange={told} />}
      {leaf.situation.length > 0 && <div className={`establish${stayed ? ' receded' : ''}`}>
        {leaf.situation.map((p, i) => <p key={i}>{p}</p>)}</div>}
      {leaf.changed.length > 0 && <div className="changed">
        <p className="label">Since you were last here</p>
        {leaf.changed.map((l, i) => <p key={i}>{l}</p>)}
      </div>}
      {!s.pending && told && leaf.moved && <Told.Happened exchange={told} />}
    </>;
  }
  static Happened({ exchange }: { exchange: Exchange }) {
    return (
      <section className={`happened tone-${exchange.tone}`} data-id="response" aria-live="polite">
        {exchange.lines.map((l, i) => <p key={i} className={l.kind}>{l.text}</p>)}
        {exchange.notes.length > 0 && <p className="notes">{exchange.notes.map(n => <span key={n}>{n}</span>)}</p>}
      </section>
    );
  }
  // Something under way: said at once, in the player's words; a journey says where it goes and how long it is.
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
}
