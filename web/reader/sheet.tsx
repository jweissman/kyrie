import type { Entry, Frame } from '../engine/protocol';
import type { Screen } from '../../src/ui/screen-types';
import type { ReaderApp } from './reader-app';
import { Words } from './words';
import { Typography } from '../../src/presentation/typography';
import { CharacterPage } from './character-page';
import { BoardField } from './board-field';
import { Aims } from './aims';
import { PackGrid } from './pack-grid';
import { Followed } from './followed';
import { AimNear } from './aim-near';

// What takes the right-hand side's place when asked for: your notes (what is unfinished, what you know, and how sure
// you can be of it), the story so far, what you carry, the company. The book's head goes back to what is here (a back
// of its own under the head made two: play 7); the world stays.
// An aim as the notes list it: by its id where the company holds it; a deadline is only said.
interface Held { id?: string; text: string }
export class Sheet {
  static View({ app }: { app: ReaderApp }) {
    const s = app.state, frame = s.frame!, screen = frame.screen;
    const body = s.view === 'journal' ? Sheet.journal(app, frame) : s.view === 'story' ? Sheet.story(Sheet.whole(s.story, frame.entries))
      : s.view === 'company' ? <CharacterPage.View app={app} /> : Sheet.pack(app, screen);
    return (
      <section className={`sheet view-${s.view}`} data-region="details" aria-label={s.view}>
        {body}
      </section>
    );
  }
  // The notes as a journal, in layers (the cold review's REV-18 and REV-24): what is followed, then everything else the
  // company could take up, in sight; beside each other, what it has heard of and not yet seen, and what it knows;
  // under them what it has seen through. Nothing folded (Mission 20: both cold players found aims piled up behind a
  // fold and what was done lingering among the leads; the owner's M19 notes asked for no stacks of disclosures).
  private static journal(app: ReaderApp, frame: Frame) {
    const screen = frame.screen, facts = screen.knowledge.filter(k => !screen.objectives.includes(k.text));
    const leads = facts.filter(k => k.kind === 'reported'), known = facts.filter(k => k.kind !== 'reported');
    return (
      <article className="journal" data-region="knowledge">
        <h2>Notes</h2>
        <section className="notes-aims">
          <h3>What you mean to do</h3>
          {screen.objectives.length || screen.deadlines.length ? <Sheet.Aims app={app} /> : <p className="none">
            {Sheet.idle(screen, facts)}</p>}
        </section>
        {(leads.length > 0 || known.length > 0) && <div className="notes-columns">
          {leads.length > 0 && <section data-region="leads"><h3>Told you, not yet seen for yourself</h3>
            <Sheet.Facts list={leads} /></section>}
          {known.length > 0 && <section className="known" data-region="known"><h3>What you know</h3>
            <Sheet.Facts list={known} /></section>}
        </div>}
        {screen.done.length > 0 && <section className="done" data-region="done"><h3>Seen through</h3>
          <ul>{screen.done.map(d => <li key={d}>{Typography.curl(d)}</li>)}</ul></section>}
        {!facts.length && <p className="none">You know nothing here yet but what you see.</p>}
        <p className="keep">
          <button type="button" className="option" data-action="export" onClick={app.download}>Download a save file</button>
          <button type="button" className="option" data-action="title" onClick={app.opening.title}>Back to the title</button>
        </p>
      </article>
    );
  }
  // Notes, each with how it is known (seen, heard and since seen, known before).
  static Facts({ list }: { list: Screen['knowledge'] }) {
    return <ul>{list.map(k => <li key={k.text}>{k.text}{k.how && <span className="how"> — {k.how}</span>}</li>)}</ul>;
  }
  // An aim, and, when it names somewhere the company knows the way to, setting out for it there: the notes had been a
  // document of bullets (the owner's interim report).
  // The aim followed first, then the rest as the company took them up.
  // Each by its id where the company holds it (a deadline is only said), followed by that id.
  private static ordered(app: ReaderApp, aims: Held[]): Held[] {
    const followed = app.state.frame && Followed.held(app.state.frame.screen);
    const first = aims.find(a => a.id !== undefined && a.id === followed);
    return first ? [first, ...aims.filter(a => a !== first)] : aims;
  }
  // The aim followed, large; the rest under it, smaller, each a line with its own touches, so that a company newly come
  // is not handed ten things at once as equals (the owner, 4 November), and none of them is behind a fold.
  // The rest under it by where they are, so that what is to hand reads apart from what is only told of further off: a
  // cold player had about ten aims within minutes of talking to Tuck, as equals (Mission 20's second round). The aims'
  // places hold what they lie in (see Undertakings.places), so a job in the town names the town.
  static Aims({ app }: { app: ReaderApp }) {
    const screen = app.state.frame!.screen, held: Held[] = screen.aims?.map(a => ({ id: a.id, text: a.text }))
      ?? screen.objectives.map(text => ({ text }));
    const [first, ...rest] = Sheet.ordered(app, [...screen.deadlines.map(text => ({ text })), ...held]);
    const town = AimNear.town(screen), here = rest.filter(o => town && AimNear.near(screen, o.id ? { id: o.id } : o.text));
    const far = rest.filter(o => !here.includes(o));
    return <>
      <ul className="aims"><Sheet.Aim app={app} aim={first!} /></ul>
      {here.length > 0 && <div className="aims-more"><h3>{Typography.curl(`To hand in ${town!.name}`)}</h3>
        <ul className="aims rest">{here.map(o => <Sheet.Aim key={o.id ?? o.text} app={app} aim={o} />)}</ul></div>}
      {far.length > 0 && <div className="aims-more"><h3>{town ? 'Further off' : 'You could also take up'}</h3>
        <ul className="aims rest">{far.map(o => <Sheet.Aim key={o.id ?? o.text} app={app} aim={o} />)}</ul></div>}
    </>;
  }
  // An aim, to follow or not, and where it names a place the company knows, that place on the map: going anywhere is the
  // map's (the owner, 4 November: no setting out from any page but the world map's).
  static Aim({ app, aim: { id, text: aim } }: { app: ReaderApp; aim: Held }) {
    const screen = app.state.frame?.screen, held = id === undefined ? undefined : screen?.aims?.find(a => a.id === id);
    const following = !!held?.followed, place = screen && Aims.named(screen, screen.destinations ?? [], aim);
    // What is known of the place it is about, from the place's own aim folded into it (see Undertakings.folded).
    const about = held?.about ?? [];
    return <li className={`aim-card${following ? ' followed' : ''}`}><span>{Typography.curl(aim)}
      {about.map(t => <small key={t} className="aim-about">{Typography.curl(t)}</small>)}</span>
      <span className="aim-acts"><button type="button" className="option follow" data-action="follow"
        aria-pressed={following} disabled={following || !id} onClick={() => app.follow(id)}>
        {following ? 'Following' : 'Follow this'}</button>
      {place && <button type="button" className="option on-map" data-action="aim-map" data-id={place.id}
        onClick={() => { if (id) { app.follow(id); } app.chart(Sheet.charted(screen, place.id)); }}>{`${place.name}, on the map`}</button>}
      </span></li>;
  }
  // A place as the map knows it (its mark, its town, or the hex it lies in: see BoardField.whither).
  static charted(screen: Screen, id: string): string {
    return screen.region?.land ? BoardField.whither(screen.region, id) ?? id : id;
  }
  // Nothing asked: yet, or any more, now something has been seen through; and what has been heard of is there to
  // follow (the follow-up review read "Nothing is asked of you yet" over a family's story finished and a hall heard of).
  private static idle(screen: Screen, facts: Screen['knowledge']): string {
    const heard = facts.some(k => k.kind === 'reported') ? ', but what you have heard of is yours to follow' : '';
    return `${screen.done.length ? 'Nothing more is asked of you' : 'Nothing is asked of you yet'}${heard}.`;
  }
  // The story as asked for, and whatever has happened since it came.
  static whole(story: Entry[] | undefined, recent: Entry[]): Entry[] {
    const last = story?.at(-1)?.id ?? -1;
    return story ? [...story, ...recent.filter(e => e.id > last)] : recent;
  }
  // Everything so far, place by place; what was said before is not set down again (the owner, 3 November: the same
  // answer to the same question twice was two entries), only that it was.
  private static story(entries: Entry[]) {
    let place = '';
    const told = new Set<string>();
    return (
      <article className="story" aria-label="The story so far">
        <h2>The story so far</h2>
        {entries.length ? entries.map(e => {
          const chapter = e.place !== place ? <h3 key={`h${e.id}`}>{Words.upper(e.placeName)}</h3> : null;
          place = e.place;
          // A line of a few words (time passes, a door opens) is said again as often as it happens.
          const fresh = e.lines.filter(l => l.length < 60 || !told.has(l)), again = e.lines.length > 0 && !fresh.length;
          e.lines.forEach(l => told.add(l));
          return <div key={e.id}>{chapter}
            {e.said && !Words.restates(Words.echo(Words.lastSaid(e.said)), e.lines[0])
              && <p className="you">{Words.echo(Words.lastSaid(e.said))}</p>}
            {again ? <p className="again">The same as before.</p> : fresh.map((l, i) => <p key={i}>{l}</p>)}</div>;
        }) : <p className="none">Nothing has happened yet.</p>}
      </article>
    );
  }
  // When the company next eats, or that it is hungry: the ration clock had to be found out by resting and waiting
  // (the cold review's "rest and food are interesting but opaque", REV-14).
  static fed(screen: Screen): string | undefined {
    const e = screen.expedition;
    if (e.hungry) { return 'Hungry: a ration is eaten as soon as there is one.'; }
    return e.nextMeal ? `Fed until ${e.nextMeal}, when a ration is eaten, or at a rest that comes before.` : undefined;
  }
  // What each of you carries, and what can be done with each thing (see PackGrid).
  private static pack(app: ReaderApp, screen: Screen) {
    return (
      <article className="pack">
        <h2>What you carry</h2>
        <PackGrid.View app={app} screen={screen} />
        <p className="how">{screen.purse.coin} coin · {screen.purse.rations} {screen.purse.rations === 1 ? 'ration' : 'rations'}
          {screen.purse.other.length > 0 && ` · ${screen.purse.other.join(', ')}`}</p>
        {Sheet.fed(screen) && <p className="how" data-id="fed">{Sheet.fed(screen)}</p>}
      </article>
    );
  }
}
