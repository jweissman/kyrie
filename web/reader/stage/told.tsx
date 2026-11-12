import { useRef, type ReactNode } from 'react';
import type { Exchange, Frame } from '../../engine/protocol';
import type { SceneSubject } from '../../../src/ui/scene';
import type { ReaderApp, Travel } from '../reader-app';
import { Typography } from '../../../src/presentation/typography';
import { Narration } from '../../../src/presentation/narration';
import { Words } from '../words';
import { AimNear } from '../aim-near';
import { MenuModel } from '../menu-model';
import { Moments } from './moments';
import { Panorama } from './panorama';
import { PlaceStage } from './place-stage';
import { Stage } from './stage';
import { Journey } from './journey';
import { Check } from './check';
import { Scrolled } from './scrolled';

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
    // What the place says already is not told again as what came of coming here (the hiring line at the Stormy Horn
    // was told twice, once with the place and once, in italic, as the arrival: the builder's browser walk, 8 November).
    const placed = new Set(leaf.situation.map(t => Typography.curl(t)));
    const kept = exchange && { ...exchange, lines: exchange.lines.filter(l => !placed.has(Typography.curl(l.text))) };
    const told = !whole && kept && (kept.lines.length || kept.notes.length) ? kept : undefined;
    const stayed = !leaf.moved && !!told;
    // Hurt on the way in, what happened comes before the place (see Narration.placeFirst).
    const struck = !stayed && !!told && !Narration.placeFirst(true, told.lines);
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
      {headed && <Told.Heading frame={frame} app={app} />}
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
  static readonly harm = Narration.harm;
  // The chapter a place opens (a country come into, a story's chapter), the place's name, and where and when.
  static Heading({ frame, app }: { frame: Frame; app?: ReaderApp }) {
    const heading = frame.leaf.heading;
    return <>
      {heading && <p className={`chapter kind-${heading.kind}`}>{Typography.curl(heading.kind === 'country'
        ? `Into ${heading.title}` : heading.title)}</p>}
      <h1 className="place" data-id="place">{Typography.curl(Words.upper(frame.screen.place.name))}</h1>
      <Stage.When frame={frame} {...app ? { app } : {}} />
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
  // The place as it is, whole, wherever the company is at rest in it (the owner, 5 November, late: a place's telling is
  // never folded away, nor cut to its first sentence once something has been done there): what is said of it, then
  // who and what is about it, what someone here is doing told with them, not again.
  static Setting({ app }: { app: ReaderApp }) {
    const leaf = app.state.frame!.leaf, subjects = app.menu.scene?.subjects ?? [];
    const beside = new Set(subjects.flatMap(x => PlaceStage.danger(x) ? x.says?.slice(0, 1) ?? []
      : x.kind === 'person' ? x.says ?? [] : []).map(Typography.curl));
    // Nor what the opening's pages have just told (the road into the town, coming into sight), now that play begins on
    // the place it left the company in (Mission 20's amendment 1).
    const opened = Told.opened(app);
    const situation = Told.ranked(app, leaf.situation.filter(p => !beside.has(Typography.curl(p)) && !opened(p)))
      .slice(0, Told.situationAtRest);
    return <div className="setting" data-region="setting">
      {situation.map((p, i) => <p key={i} className={i ? undefined : 'lead'}>{Typography.curl(p)}</p>)}
      <Told.Presence app={app} lines={leaf.presence.slice(0, Told.presenceAtRest)} subjects={subjects} quiet={false} />
    </div>;
  }
  // How many of what is about the place the scene tells (the owner, 6 November: the scene still too busy); the rest is
  // what Look… shows.
  static readonly presenceAtRest = 1;
  // The place's own words first, then what bears on what the company holds an aim about (a name its aims say: the
  // bell gone to Seolforfyrd, for one told of Seolforfyrd), then the rest as told.
  static ranked(app: ReaderApp, lines: string[]): string[] {
    const said = (app.state.frame!.screen.aims ?? []).map(a => a.text).join(' ');
    const names = (l: string) => [...l.matchAll(/(?<=[a-z,;] )[A-Z][a-zà-ÿ]{4,}/g)].map(m => m[0]);
    const bears = (l: string) => names(l).some(n => said.includes(n));
    const [first, ...rest] = lines;
    return first === undefined ? [] : [first, ...rest.filter(bears), ...rest.filter(l => !bears(l))];
  }
  // Whether a line is one the opening's pages told, by its first sentence.
  static opened(app: ReaderApp): (line: string) => boolean {
    const beats = (app.state.opened ?? []).map(b => Typography.curl(b));
    return line => {
      const first = /^.*?[.!?’](?=\s|$)/.exec(Typography.curl(line))?.[0] ?? Typography.curl(line);
      return beats.some(b => b.includes(first));
    };
  }
  // And of what is going on there, the place's own words and the two after them that matter most: the landing at
  // Thornhaven had told seven at one weight, a bear, a rumour, a stolen bell, a gangway, a hull being tarred (Mission
  // 20's design A: one trouble in front, others mentioned, the rest found by looking).
  static readonly situationAtRest = 3;
  // What the place at rest leaves out of its telling, for Look… to tell (see AtHand.of).
  static surplus(app: ReaderApp): string[] {
    const leaf = app.state.frame!.leaf;
    return [...Told.ranked(app, leaf.situation).slice(Told.situationAtRest),
      ...leaf.presence.slice(Told.presenceAtRest).filter(l => !Told.roll(l))].map(l => Typography.curl(l));
  }
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
  // What can be gone to from what is seen: in a drawn country, by the map, which opens on it (the owner, 4 November:
  // no setting out from any page but the world map's); elsewhere, the journey there.
  private static going(app: ReaderApp | undefined) {
    const screen = app?.state.frame?.screen, map = !!screen && MenuModel.inside(screen);
    return [...screen?.destinations ?? [], ...screen?.roads ?? []]
      .map(d => ({ id: d.id, name: d.name, journey: map ? MenuModel.country : MenuModel.journey(d) }));
  }
  // Said where the company stands (said), it is brought into view in the column that holds it, the aims and levels it
  // gave with it (see Scrolled): they had lain under the foot of the column.
  // A fight was told on its own page, blow by blow, to how it ended: back at the place, it is not told again, nor what
  // was done to begin it; what else came of it is (the owner, 11 November late: the rats killed, "You attack the rats",
  // "The fight is won" and "The rats lie dead" had said one outcome three times). Its blows are the fight's log and
  // the Story's.
  static Happened({ exchange, said, ready, app }: { exchange: Exchange; said?: boolean; ready?: string; app?: ReaderApp }) {
    const fought = exchange.tone === 'fight', at = useRef<HTMLElement>(null);
    const echo = said && exchange.said && !fought ? Words.echo(Words.lastSaid(exchange.said)) : undefined;
    const moments = Moments.of(exchange.lines), { sights, ended, levels } = moments;
    const [plain, rest] = [moments.plain, moments.rest].map(ls => fought ? ls.filter(l => l.kind !== 'fight') : ls);
    // The aims it took up, from the aims themselves, by id: those the company holds (one folded into another is told
    // as something known of it: see folded); their notes are the narration's words for the terminal.
    const held = app?.state.frame?.screen.aims, taken = (exchange.aims ?? []).filter(a => !held || held.some(h => h.id === a.id));
    const notes = Told.few(Told.folded(app, Panorama.unsaid(exchange.notes, sights))
      .filter(n => !exchange.aims?.length || !Words.aimed.test(n)), taken.length);
    Scrolled.useNewest(at, exchange, !!said);
    if (fought && !plain!.length && !rest!.length && !sights.length && !ended && !levels.length && !notes.length) {
      return null;
    }
    return (
      <section ref={at} className={`happened tone-${exchange.tone}`} data-id="response" aria-live="polite">
        {echo && !Words.restates(echo, exchange.lines[0]?.text) && <p className="you">{Typography.curl(echo)}</p>}
        {plain!.map((l, i) => Check.of(l, i)
          ?? <p key={i} className={l.kind}>{Typography.curl(l.text)}</p>)}
        {sights.length > 0 && <Panorama.View sights={sights} going={Told.going(app)} choose={app && (c => app.choose(c))}
          onMap={!!app?.state.frame && MenuModel.inside(app.state.frame.screen)} />}
        {rest!.map((l, i) => Check.of(l, `r${i}`)
          ?? <p key={`r${i}`} className={l.kind}>{Typography.curl(l.text)}</p>)}
        {ended && <Moments.SeenThrough ended={ended} ready={ready} />}
        {levels.length > 0 && <Moments.Levelled levels={levels} />}
        {(notes.length > 0 || taken.length > 0) && <ul className="notes">
          {taken.length > 0 && <Told.Aims app={app} aims={taken} />}
          {notes.map(n => <li key={n} className={Words.noted.test(n) ? 'learned' : undefined}>{Words.noted.test(n)
            ? <><span className="label">{Words.label(n)}</span>{` ${Typography.curl(n.replace(Words.noted, ''))}`}</>
            : Typography.curl(n)}</li>)}</ul>}
      </section>
    );
  }
  // What came to be known, few enough to read before the choices: every new aim, first, then two things learned, and
  // how many more the Book holds (an arrival had stacked five notes over the choices, pushing them off the screen).
  static few(notes: string[], taken = 0): string[] {
    const aims = notes.filter(n => Words.aimed.test(n)), rest = notes.filter(n => !aims.includes(n));
    const room = aims.length || taken ? 1 : 2, more = rest.length - room;
    return [...aims, ...rest.slice(0, room), ...more > 0 ? [`And ${more === 1 ? 'one thing more' : `${more} things more`}, in the Book.`] : []];
  }
  // A place's own aim folded into an aim held for it is something known of where that aim leads, not an aim to follow
  // beside it (see Undertakings.folded).
  static folded(app: ReaderApp | undefined, notes: string[]): string[] {
    const about = new Set((app?.state.frame?.screen.aims ?? []).flatMap(a => a.about ?? []));
    return notes.map(n => /^Aim: /.test(n) && about.has(n.replace(Words.noted, '')) ? n.replace(/^Aim: /, 'Noted: ') : n);
  }
  // Several aims taken up at once (a notice of three jobs) are one note, a line each, not a block each (the
  // product-design review's PD-11: three quest paragraphs in the town's telling).
  // Those further off than the town the company is in are counted, not listed (see AimNear).
  // One aim is said whole; several by their first words.
  static Aims({ app, aims }: { app?: ReaderApp; aims: { id: string; text: string; now?: true }[] }) {
    const screen = app?.state.frame?.screen;
    const near = aims.filter(a => !screen || AimNear.near(screen, a)), far = aims.length - near.length;
    return <li className="learned aims-many"><span className="label">{near.length === 1 ? near[0]!.now ? 'The aim now'
      : 'A new aim' : near.length ? `${near.length} new aims` : 'Noted'}</span>
      <ul>{near.map(a => <li key={a.id}>{Typography.curl(near.length > 1 ? Told.title(a.text) : a.text)}
        {app && <Told.Follow app={app} id={a.id} />}</li>)}
        {far > 0 && <li className="far">{far === 1 ? 'One thing further off, in your notes.'
          : `${far} things further off, in your notes.`}</li>}</ul></li>;
  }
  // Several aims come at once are each said by their first words, to the first pause ("Clear the rats' nest"; "The
  // old ways under Millholm go on past the corn-store's cellar"); each is whole in the Book (the owner, 11 November
  // late: two aims had come as a block of their whole paragraphs over the place).
  static title(aim: string): string {
    return /^[^,;:.!?]+/.exec(aim)?.[0]?.trim() ?? aim;
  }
  // A new aim not followed (the company's own errand is, or another the player chose), to follow instead: as an
  // RPG's journal offers to track a quest just taken up (see Undertakings).
  static Follow({ app, id }: { app: ReaderApp; id: string }) {
    const held = app.state.frame?.screen.aims?.find(a => a.id === id);
    return held && !held.followed ? <button type="button" className="follow-aim" data-action="follow"
      onClick={() => app.follow(id)}>Follow this</button> : null;
  }
  // Something under way: said at once, in the player's words; a journey says where it goes and how long it is.
  static Working({ pending }: { pending: { said: string; travel?: Travel; stage?: string } }) {
    const t = pending.travel;
    const span = t ? t.minutes >= 60 ? `${Math.round(t.minutes / 6) / 10} hours` : `${t.minutes} minute${t.minutes === 1 ? '' : 's'}` : '';
    return (
      <section className="happened working" aria-live="polite">
        <p className="you">{Typography.curl(Words.echo(Words.lastSaid(pending.said)))}</p>
        {t && <p>By {Typography.curl(t.way)}, {span}.</p>}
        {pending.stage && <p>{pending.stage}.</p>}
      </section>
    );
  }
}
