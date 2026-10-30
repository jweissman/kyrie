import type { ReactNode } from 'react';
import type { Exchange, Frame } from '../../engine/protocol';
import type { SceneSubject } from '../../../src/ui/scene';
import type { ReaderApp, Travel } from '../reader-app';
import { Typography } from '../../../src/presentation/typography';
import { Words } from '../words';
import { MenuModel } from '../menu-model';
import { Moments } from './moments';
import { Panorama } from './panorama';
import { PlaceStage } from './place-stage';
import { Stage } from './stage';
import { Journey } from './journey';

// What the place says and what just happened in it. Coming somewhere, the way there is told, then the place, then
// who is about; doing something where the company stands, what came of it is told first, and the place, already
// read, steps back to its first sentence.
export class Told {
  // With the journey (journey: false leaves the way here to the facing page, see Told.Travelled), and who and what is
  // here after the place's first paragraph (M17-05: a town's people had been under the whole telling, a scroll away).
  // Its heading (the chapter, the place's name, where and when) is the stage's own head where the stage draws one
  // (headed: false). Whole: the place told in full and without what just happened, which the glance has told (Look
  // about: see LookAbout).
  static Place({ app, journey = true, here, headed = true, whole }: { app: ReaderApp; journey?: boolean;
    here?: ReactNode; headed?: boolean; whole?: boolean }) {
    const s = app.state, frame = s.frame!, leaf = frame.leaf, screen = frame.screen, exchange = leaf.exchange;
    const told = !whole && exchange && (exchange.lines.length || exchange.notes.length) ? exchange : undefined;
    const stayed = !leaf.moved && !!told;
    // Hurt on the way in (a trap's blade), what happened comes before the place, whose telling says what it left (play
    // 9 read "The hidden switch has gone off, and is spent." before "A scything blade swings through the air.").
    const struck = !stayed && !!told && told.lines.some(l => Told.harm.test(l.text));
    const subjects = app.menu.scene?.subjects ?? [];
    // What someone here is doing is told with them, not again in the telling (an origin's greeting was told twice);
    // so is what a danger is doing, in its own block.
    const beside = new Set(subjects.flatMap(x => PlaceStage.danger(x) ? x.says?.slice(0, 1) ?? []
      : x.kind === 'person' ? x.says ?? [] : []).map(Typography.curl));
    const situation = leaf.situation.filter(p => !beside.has(Typography.curl(p)));
    // Taken up again, your aim is recalled only where the foot does not say it (on the road): said in both, a game
    // continued said it twice on one page, "Your father … did not come home" over and under the place (the opening's
    // critique).
    const recap = leaf.recap && { ...leaf.recap, aim: frame.bound ? leaf.recap.aim : undefined };
    return <>
      {headed && <Told.Heading frame={frame} />}
      {recap && (recap.aim || recap.last) && <Told.Recap recap={recap} />}
      {screen.dark && !Told.says(leaf, /\bdark\b/i) && <p className="dark-note">It is dark here. You have no light to see by.</p>}
      {s.pending && !whole && <Told.Working pending={{ ...s.pending, stage: s.stage }} />}
      {journey && <Told.Travelled app={app} />}
      {!s.pending && (stayed || struck) && <Told.Happened exchange={told!} said={stayed} ready={Moments.ready(screen)}
        app={app} />}
      {situation.length > 0 ? stayed
        ? <><p className="recall">{Typography.curl(Told.first(situation[0]!))}</p>{here}</>
        : <div className="establish"><p>{Typography.curl(situation[0]!)}</p>{here}
          {situation.slice(1).map((p, i) => <p key={i}>{Typography.curl(p)}</p>)}</div> : here}
      <Told.Presence app={app} lines={leaf.presence} subjects={subjects} quiet={stayed} />
      {leaf.changed.length > 0 && <div className="changed">
        <p className="label">Since you were last here</p>
        {leaf.changed.map((l, i) => <p key={i}>{Typography.curl(l)}</p>)}
      </div>}
      {!s.pending && told && !stayed && !struck && <Told.Happened exchange={told} ready={Moments.ready(screen)} app={app} />}
    </>;
  }
  static readonly harm = /\btakes? \d+ [a-z]+ damage\b/;
  // The chapter a place opens (a country come into, a story's chapter), the place's name, and where and when.
  static Heading({ frame }: { frame: Frame }) {
    const heading = frame.leaf.heading;
    return <>
      {heading && <p className={`chapter kind-${heading.kind}`}>{Typography.curl(heading.kind === 'country'
        ? `Into ${heading.title}` : heading.title)}</p>}
      <h1 className="place" data-id="place">{Typography.curl(Words.upper(frame.screen.place.name))}</h1>
      <Stage.When frame={frame} />
    </>;
  }
  // The way here, on arriving: a journey along known ways leg by leg, or what the way was like.
  static Travelled({ app }: { app: ReaderApp }) {
    const s = app.state, frame = s.frame!, leaf = frame.leaf;
    if (s.pending) { return null; }
    if (frame.travel) { return <Journey.View travel={frame.travel} />; }
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
    // A danger's first line is told in its own block, with how a fight would go ("A boar has rooted up the low path"
    // had been told there and again under it).
    const beside = subjects.flatMap(s => PlaceStage.danger(s) ? s.says?.slice(0, 1) ?? []
      : s.kind === 'person' ? s.says ?? [] : []).map(Typography.curl);
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
        {sights.length > 0 && <Panorama.View sights={sights} going={[...app?.state.frame?.screen.destinations ?? [],
          ...app?.state.frame?.screen.roads ?? []].map(d => ({ id: d.id, name: d.name, journey: MenuModel.journey(d) }))}
          choose={app && (c => app.choose(c))} />}
        {rest.map((l, i) => <p key={`r${i}`} className={l.kind}>{Typography.curl(l.text)}</p>)}
        {ended && <Moments.SeenThrough ended={ended} ready={ready} />}
        {levels.length > 0 && <Moments.Levelled levels={levels} />}
        {notes.length > 0 && <ul className="notes">{notes.map(n => <li key={n}
          className={Words.noted.test(n) ? 'learned' : undefined}>{Words.noted.test(n)
            ? <><span className="label">{Words.label(n)}</span>
              {` ${Typography.curl(n.replace(Words.noted, ''))}`}</>
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
