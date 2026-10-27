import type { Exchange, Frame } from '../../engine/protocol';
import type { SceneSubject } from '../../../src/ui/scene';
import type { ReaderApp, Travel } from '../reader-app';
import { Typography } from '../../../src/presentation/typography';
import { Words } from '../words';
import { MenuModel } from '../menu-model';
import { Moments } from './moments';
import { Panorama } from './panorama';
import { PlaceStage } from './place-stage';

// What the place says and what just happened in it. Coming somewhere, the way there is told, then the place, then
// who is about; doing something where the company stands, what came of it is told first, and the place, already
// read, steps back to its first sentence.
export class Told {
  // With the journey (journey: false leaves the way here to the facing page, see Told.Travelled).
  static Place({ app, journey = true }: { app: ReaderApp; journey?: boolean }) {
    const s = app.state, frame = s.frame!, leaf = frame.leaf, screen = frame.screen, exchange = leaf.exchange;
    const told = exchange && (exchange.lines.length || exchange.notes.length) ? exchange : undefined;
    const stayed = !leaf.moved && !!told;
    const subjects = app.menu.scene?.subjects ?? [];
    // What someone here is doing is told with them, not again in the telling (an origin's greeting was told twice).
    const beside = new Set(subjects.filter(x => x.kind === 'person').flatMap(x => x.says ?? []).map(Typography.curl));
    const situation = leaf.situation.filter(p => !beside.has(Typography.curl(p)));
    return <>
      {leaf.heading && <p className={`chapter kind-${leaf.heading.kind}`}>{Typography.curl(leaf.heading.kind === 'country'
        ? `Into ${leaf.heading.title}` : leaf.heading.title)}</p>}
      <h1 className="place" data-id="place">{Typography.curl(Words.upper(screen.place.name))}</h1>
      {leaf.recap && (leaf.recap.aim || leaf.recap.last) && <Told.Recap recap={leaf.recap} />}
      {screen.dark && !Told.says(leaf, /\bdark\b/i) && <p className="dark-note">It is dark here. You have no light to see by.</p>}
      {s.pending && <Told.Working pending={{ ...s.pending, stage: s.stage }} />}
      {journey && <Told.Travelled app={app} />}
      {!s.pending && stayed && <Told.Happened exchange={told} said ready={Moments.ready(screen)} app={app} />}
      {situation.length > 0 && (stayed
        ? <p className="recall">{Typography.curl(Told.first(situation[0]!))}</p>
        : <div className="establish">{situation.map((p, i) => <p key={i}>{Typography.curl(p)}</p>)}</div>)}
      <Told.Presence app={app} lines={leaf.presence} subjects={subjects} quiet={stayed} />
      {leaf.changed.length > 0 && <div className="changed">
        <p className="label">Since you were last here</p>
        {leaf.changed.map((l, i) => <p key={i}>{Typography.curl(l)}</p>)}
      </div>}
      {!s.pending && told && !stayed && <Told.Happened exchange={told} ready={Moments.ready(screen)} app={app} />}
    </>;
  }
  // The way here, on arriving: a journey along known ways leg by leg, or what the way was like.
  static Travelled({ app }: { app: ReaderApp }) {
    const s = app.state, frame = s.frame!, leaf = frame.leaf;
    if (s.pending) { return null; }
    if (frame.travel) { return <Told.Journey travel={frame.travel} />; }
    return leaf.moved && leaf.journey && leaf.journey.length > 0 ? <div className="journey" aria-label="On the way">
      {leaf.journey.map((l, i) => <p key={i}>{Typography.curl(l)}</p>)}</div> : null;
  }
  // Where the company left off, taken up again: what it is about, and the last thing it did.
  static Recap({ recap }: { recap: NonNullable<Frame['leaf']['recap']> }) {
    return (
      <div className="recap" aria-label="Where you left off">
        <p className="label">Where you left off</p>
        {recap.aim && <p>{Typography.curl(recap.aim)}</p>}
        {recap.last && <p className="last"><span className="at">{recap.last.at}</span> {Typography.curl(
          `${recap.last.said}${/[.!?]$/.test(recap.last.said) ? '' : '.'} ${recap.last.told}`.trim())}</p>}
      </div>
    );
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
  // Whether the page already says it (the dark, in the place's own words), so it is not said twice.
  static says(leaf: Frame['leaf'], pattern: RegExp): boolean {
    return [...leaf.situation, ...leaf.exchange?.lines.map(l => l.text) ?? []].some(t => pattern.test(t));
  }
  // A paragraph's first sentence: the place, recalled while something is done in it.
  static first(text: string): string {
    return /^.*?[.!?](?=\s|$)/.exec(text)?.[0] ?? text;
  }
  // Who is about, as the narrator says it, where it is not said beside them on the facing page: what someone here is
  // doing is told once, with them, where they are turned to; the animals and the things stay in the telling (a town square named each of its people
  // twice, once in the telling and once among the people here: the play-structure investigation's PT-09). A line
  // that only names who is here ("Here are Fargrim, the innkeeper; and Thoradin.") is left to the names.
  static Presence({ lines, subjects, quiet }: { app: ReaderApp; lines: string[]; subjects: SceneSubject[];
    quiet: boolean }) {
    const beside = subjects.filter(s => s.kind === 'person' && !PlaceStage.danger(s)).flatMap(s => s.says ?? [])
      .map(Typography.curl);
    const told = lines.filter(l => !Told.roll(l)).map(l => beside.reduce((rest, said) => rest.replace(said, ''),
      Typography.curl(l)).replace(/\s{2,}/g, ' ').trim()).filter(Boolean);
    if (!told.length) { return null; }
    return <div className={`presence${quiet ? ' quiet' : ''}`}>
      <p>{told.map((l, i) => <span key={i}>{i > 0 && ' '}{Typography.curl(l)}</span>)}</p>
    </div>;
  }
  static roll(line: string): boolean {
    return /^Here (are|is) /.test(line) || /, (is|are) here\.$/.test(line) || /^[^,]+ (is|are) here\.$/.test(line);
  }
  // What came of something done: what the company did, when it did it where it stands, in its own words; then what
  // happened, and what it came to know or spent.
  static Happened({ exchange, said, ready, app }: { exchange: Exchange; said?: boolean; ready?: string; app?: ReaderApp }) {
    const echo = said && exchange.said ? Words.echo(Words.lastSaid(exchange.said)) : undefined;
    const { plain, rest, sights, ended, levels } = Moments.of(exchange.lines), notes = Panorama.unsaid(exchange.notes, sights);
    return (
      <section className={`happened tone-${exchange.tone}`} data-id="response" aria-live="polite">
        {echo && !Words.restates(echo, exchange.lines[0]?.text) && <p className="you">{Typography.curl(echo)}</p>}
        {plain.map((l, i) => <p key={i} className={l.kind}>{Typography.curl(l.text)}</p>)}
        {sights.length > 0 && <Panorama.View sights={sights} going={(app?.state.frame?.screen.destinations ?? [])
          .map(d => ({ id: d.id, name: d.name, journey: MenuModel.journey(d) }))} choose={app && (c => app.choose(c))} />}
        {rest.map((l, i) => <p key={`r${i}`} className={l.kind}>{Typography.curl(l.text)}</p>)}
        {ended && <Moments.SeenThrough ended={ended} ready={ready} />}
        {levels.length > 0 && <Moments.Levelled levels={levels} />}
        {notes.length > 0 && <ul className="notes">{notes.map(n => <li key={n}
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
