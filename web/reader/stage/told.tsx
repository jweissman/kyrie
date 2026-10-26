import type { ReactNode } from 'react';
import type { Exchange, Frame } from '../../engine/protocol';
import type { SceneSubject } from '../../../src/ui/scene';
import type { ReaderApp, Travel } from '../reader-app';
import { Typography } from '../../../src/presentation/typography';
import { Words } from '../words';
import { Act } from './act';
import { Moments } from './moments';

// What the place says and what just happened in it. Coming somewhere, the way there is told, then the place, then
// who is about; doing something where the company stands, what came of it is told first, and the place, already
// read, steps back to its first sentence.
export class Told {
  static Place({ app }: { app: ReaderApp }) {
    const s = app.state, frame = s.frame!, leaf = frame.leaf, screen = frame.screen, exchange = leaf.exchange;
    const told = exchange && (exchange.lines.length || exchange.notes.length) ? exchange : undefined;
    const stayed = !leaf.moved && !!told;
    const subjects = app.menu.scene?.subjects ?? [];
    return <>
      {leaf.heading && <p className={`chapter kind-${leaf.heading.kind}`}>{Typography.curl(leaf.heading.kind === 'country'
        ? `Into ${leaf.heading.title}` : leaf.heading.title)}</p>}
      <h1 className="place" data-id="place">{Typography.curl(Words.upper(screen.place.name))}</h1>
      {screen.dark && !Told.says(leaf, /\bdark\b/i) && <p className="dark-note">It is dark here. You have no light to see by.</p>}
      {s.pending && <Told.Working pending={{ ...s.pending, stage: s.stage }} />}
      {!s.pending && frame.travel && <Told.Journey travel={frame.travel} />}
      {!s.pending && !frame.travel && leaf.moved && leaf.journey && leaf.journey.length > 0 && <div className="journey"
        aria-label="On the way">{leaf.journey.map((l, i) => <p key={i}>{Typography.curl(l)}</p>)}</div>}
      {!s.pending && stayed && <Told.Happened exchange={told} said ready={Told.ready(screen)} />}
      {leaf.situation.length > 0 && (stayed
        ? <p className="recall">{Typography.curl(Told.first(leaf.situation[0]!))}</p>
        : <div className="establish">{leaf.situation.map((p, i) => <p key={i}>{Typography.curl(p)}</p>)}</div>)}
      <Told.Presence app={app} lines={leaf.presence} subjects={subjects} quiet={stayed} />
      {leaf.changed.length > 0 && <div className="changed">
        <p className="label">Since you were last here</p>
        {leaf.changed.map((l, i) => <p key={i}>{Typography.curl(l)}</p>)}
      </div>}
      {!s.pending && told && !stayed && <Told.Happened exchange={told} ready={Told.ready(screen)} />}
    </>;
  }
  // A journey along known ways: each leg as it went, under the time it came there; and, if it did not arrive, what
  // stopped it, said plainly where the eye goes next.
  static Journey({ travel }: { travel: NonNullable<Frame['travel']> }) {
    return (
      <section className="travelled" aria-label={`On the way to ${travel.to}`}>
        <ol>{travel.legs.map((l, i) => <li key={i}><p className="leg"><span className="at">{l.at.replace(/^Day \d+, /, '')}</span>
          {' '}{Typography.curl(Words.upper(l.place))}</p>
          {[...l.journey, ...l.lines].map((t, j) => <p key={j}>{Typography.curl(t)}</p>)}</li>)}</ol>
        {!travel.arrived && <p className="stopped">{Typography.curl(travel.stopped ?? 'The journey stops here')}.</p>}
      </section>
    );
  }
  // Who in the company has enough for their next level, and how it is taken up.
  static ready(screen: Frame['screen']): string | undefined {
    const m = screen.party.find(x => /^Ready for level/.test(x.progress ?? ''));
    return m && `${screen.party.length > 1 ? `${m.name}: ` : ''}${m.progress!.replace(/^Ready/, 'Enough')
      .replace(/: a night under a roof$/, ', taken up after a night under a roof')}`;
  }
  // Whether the page already says it (the dark, in the place's own words), so it is not said twice.
  static says(leaf: Frame['leaf'], pattern: RegExp): boolean {
    return [...leaf.situation, ...leaf.exchange?.lines.map(l => l.text) ?? []].some(t => pattern.test(t));
  }
  // A paragraph's first sentence: the place, recalled while something is done in it.
  static first(text: string): string {
    return /^.*?[.!?](?=\s|$)/.exec(text)?.[0] ?? text;
  }
  // Who is about, as the narrator says it, each person's name in their own line the way into speaking with them. A
  // line that only names who is here ("Here are Fargrim, the innkeeper; and Thoradin.") is left to the names below.
  static Presence({ app, lines, subjects, quiet }: { app: ReaderApp; lines: string[]; subjects: SceneSubject[];
    quiet: boolean }) {
    const told = lines.filter(l => !Told.roll(l));
    if (!told.length) { return null; }
    const linked = new Set<string>();
    return <div className={`presence${quiet ? ' quiet' : ''}`}>
      <p>{told.map((l, i) => <span key={i}>{i > 0 && ' '}{Told.linked(app, Typography.curl(l), subjects, linked)}</span>)}</p>
    </div>;
  }
  static roll(line: string): boolean {
    return /^Here (are|is) /.test(line) || /, (is|are) here\.$/.test(line) || /^[^,]+ (is|are) here\.$/.test(line);
  }
  // A line with the first mention of each person in it made a way into speaking with them.
  private static linked(app: ReaderApp, line: string, subjects: SceneSubject[], linked: Set<string>): ReactNode[] {
    const out: ReactNode[] = [];
    let rest = line;
    for (const subject of subjects) {
      const into = subject.choices.find(c => /#(talk|look)$/.test(c.id));
      const name = Words.short(subject.name).replace(/^(the|a|an) /i, '');
      if (!into || linked.has(subject.id) || name.length < 3) { continue; }
      const at = rest.indexOf(name);
      if (at < 0) { continue; }
      linked.add(subject.id);
      out.push(rest.slice(0, at), <Act.Inline key={subject.id} app={app} choice={into}>{name}</Act.Inline>);
      rest = rest.slice(at + name.length);
    }
    return [...out, rest];
  }
  // What came of something done: what the company did, when it did it where it stands, in its own words; then what
  // happened, and what it came to know or spent.
  static Happened({ exchange, said, ready }: { exchange: Exchange; said?: boolean; ready?: string }) {
    const echo = said && exchange.said ? Words.echo(Words.lastSaid(exchange.said)) : undefined;
    const { plain, ended, levels } = Moments.of(exchange.lines);
    return (
      <section className={`happened tone-${exchange.tone}`} data-id="response" aria-live="polite">
        {echo && !Words.restates(echo, exchange.lines[0]?.text) && <p className="you">{Typography.curl(echo)}</p>}
        {plain.map((l, i) => <p key={i} className={l.kind}>{Typography.curl(l.text)}</p>)}
        {ended && <Moments.SeenThrough ended={ended} ready={ready} />}
        {levels.length > 0 && <Moments.Levelled levels={levels} />}
        {exchange.notes.length > 0 && <ul className="notes">{exchange.notes.map(n => <li key={n}
          className={/^Noted: /.test(n) ? 'learned' : undefined}>{/^Noted: /.test(n)
            ? <><span className="label">You know now</span> {Typography.curl(n.replace(/^Noted: /, ''))}</>
            : Typography.curl(n)}</li>)}</ul>}
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
