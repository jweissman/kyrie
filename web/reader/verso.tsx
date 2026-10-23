import { memo } from 'react';
import type { Exchange, Leaf } from '../engine/protocol';
import type { Screen } from '../../src/ui/screen-types';
import type { Travel } from './reader-app';
import { Words } from './words';
import { Typography } from '../../src/presentation/typography';

// The left-hand page: the world. Where you are and what is here, told short and kept in place; what has changed if
// you have been here before; and what came of the last thing you did, which the next thing replaces. Someone's words
// are set as speech, where they were said.
export class Verso {
  static View({ screen, leaf, pending }: { screen: Screen; leaf: Leaf;
    pending?: { said: string; travel?: Travel; stage?: string } }) {
    return (
      <article className="verso-body" key={screen.place.id} aria-label={screen.place.name}>
        {leaf.heading && <header className={`heading kind-${leaf.heading.kind}`}>
          <p className="fleuron" aria-hidden="true">❧</p>
          <h1>{Typography.curl(leaf.heading.kind === 'country' ? `Into ${leaf.heading.title}` : leaf.heading.title)}</h1>
        </header>}
        <h2 className="place" data-id="place">{Typography.curl(Words.upper(screen.place.name))}</h2>
        {screen.dark && <p className="dark-note">You have no light.</p>}
        <Verso.Situation situation={leaf.situation} presence={leaf.presence} opening={!!leaf.heading} />
        {leaf.changed.length > 0 && <div className="changed">
          <p className="since">Since you were last here</p>
          {leaf.changed.map((l, i) => <p key={i}>{l}</p>)}
        </div>}
        {pending ? <Verso.Doing pending={pending} /> : leaf.exchange && <Verso.Told exchange={leaf.exchange} />}
      </article>
    );
  }
  static readonly Situation = memo(Verso.situation);
  private static situation({ situation, presence, opening }: { situation: string[]; presence: string[];
    opening: boolean }) {
    return (
      <div className="situation">
        {situation.map((p, i) => <p key={i} className={i === 0 && opening ? 'initial' : undefined}>{p}</p>)}
        {presence.length > 0 && <div className="presence">{presence.map((p, i) => <p key={i}>{p}</p>)}</div>}
      </div>
    );
  }
  // What came of it: what you did, in your own words, and then what happened and what was said.
  static readonly Told = memo(Verso.told);
  private static told({ exchange }: { exchange: Exchange }) {
    if (!exchange.lines.length && !exchange.said && !exchange.notes.length) { return null; }
    return (
      <section className={`exchange tone-${exchange.tone}`} data-id="response" aria-live="polite">
        {exchange.said && <p className="said">{Words.echo(Words.lastSaid(exchange.said))}</p>}
        {exchange.lines.map((l, i) => <p key={i} className={l.kind}>{l.text}</p>)}
        {exchange.notes.length > 0 && <p className="notes">{exchange.notes.map(n => <span key={n}>{n}</span>)}</p>}
      </section>
    );
  }
  static Doing({ pending }: { pending: { said: string; travel?: Travel; stage?: string } }) {
    const t = pending.travel;
    const span = t ? t.minutes >= 60 ? `${Math.round(t.minutes / 6) / 10} hours` : `${t.minutes} minutes` : '';
    return (
      <section className={`exchange pending${t ? ' journey' : ''}`} aria-live="polite">
        <p className="said">{Typography.curl(Words.echo(Words.lastSaid(pending.said)))}</p>
        {t && <p className="way">By {t.way}, {span}.</p>}
        {pending.stage && <p className="way">{pending.stage}…</p>}
        <p className="working" aria-hidden="true"><span /><span /><span /></p>
      </section>
    );
  }
}
