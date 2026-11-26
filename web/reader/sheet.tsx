import { News } from './news';
import type { Entry, Frame } from '../../src/creation/protocol';
import type { Screen } from '../../src/ui/screen-types';
import type { ReaderApp } from './reader-app';
import { useState } from 'react';
import { ChoiceRow } from './stage/choice-row';
import { Words } from '../../src/presentation/words';
import { StorySearch } from './story-search';
import { Told } from './stage/told';
import { Typography } from '../../src/presentation/typography';
import { CharacterPage } from './character-page';
import { BoardField } from './board-field';
import { Aims } from './aims';
import { PackGrid } from './pack-grid';
import { Followed } from './followed';
import { AimNear } from './aim-near';
import { PageFrame } from './page-frame';
import { Surfaces } from '../../src/presentation/surfaces';

// What takes the right-hand side's place when asked for: your notes (what is unfinished, what you know, and how sure
// you can be of it), the story so far, what you carry, the company. The book's head goes back to what is here (a back
// of its own under the head made two: play 7); the world stays.
// An aim as the notes list it: by its id where the company holds it; a deadline is only said.
interface Held { id?: string; text: string }
export class Sheet {
  static View({ app }: { app: ReaderApp }) {
    const s = app.state, frame = s.frame!, screen = frame.screen;
    const body = s.view === 'journal' ? <Sheet.Journal app={app} frame={frame} /> : s.view === 'story' ? Sheet.story(Sheet.whole(s.story, frame.entries))
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
  // One menu (the owner, 16 November night): the aims are what the page tells, one considered at a time by the hand
  // or the keys, as a step of a life's choices are; the menu does what can be done with it (follow it, see its place on
  // the map), then keeps or leaves the game. Each aim had carried a menu of its own.
  static Journal({ app, frame }: { app: ReaderApp; frame: Frame }) {
    const screen = frame.screen, facts = screen.knowledge.filter(k => !screen.objectives.includes(k.text));
    const leads = facts.filter(k => k.kind === 'reported'), known = facts.filter(k => k.kind !== 'reported');
    const all = Sheet.listed(app), [picked, pick] = useState<string>();
    const aim = all.find(a => Sheet.key(a) === picked) ?? all[0];
    return (
      <article className="journal" data-region="knowledge">
        <h2>Notes</h2>
        <News.Read items={app.state.reading ?? []} />
        <section className="notes-aims">
          <h3>What you mean to do</h3>
          {screen.objectives.length || screen.deadlines.length ? <Sheet.Aims app={app} picked={aim && Sheet.key(aim)}
            pick={pick} /> : <p className="none">
            {Sheet.idle(screen, facts)}</p>}
        </section>
        {(leads.length > 0 || known.length > 0) && <div className="notes-columns">
          {leads.length > 0 && <section data-region="leads"><h3>Told you, not yet seen for yourself</h3>
            <Sheet.Facts list={leads} /></section>}
          {known.length > 0 && <section className="known" data-region="known"><h3>What you know</h3>
            <Sheet.Facts list={known} /></section>}
        </div>}
        {(screen.deeds?.length ?? 0) > 0 && <section className="deeds" data-region="deeds"><h3>Deeds</h3>
          <ul>{screen.deeds!.map(d => <li key={d.id}><b>{d.title}</b> {Typography.curl(d.text)}</li>)}</ul></section>}
        {screen.done.length > 0 && <section className="done" data-region="done"><h3>Seen through</h3>
          <ul>{screen.done.map(d => <li key={d}>{Typography.curl(d)}</li>)}</ul></section>}
        {!facts.length && <p className="none">You know nothing here yet but what you see.</p>}
        <ol {...PageFrame.slot('menu')} className="led keep" aria-label="What can be done">
          {aim && <Sheet.AimActs app={app} aim={aim} />}
          <Sheet.Kept app={app} />
        </ol>
      </article>
    );
  }
  // The book's own rows, on its notes or, with no journal, on the company's one page (CompanyGoals): a save file, and
  // the game paused (OR-300): Options, its settings and Return to title, where this game stays kept for Continue and a
  // new game begins over it.
  static Kept({ app }: { app: ReaderApp }) {
    return <>
      <li><ChoiceRow.Button data={{ action: 'export' }} onClick={app.download} plain="neutral"
        label="Download a save file" /></li>
      <li><ChoiceRow.Button data={{ action: 'options' }} onClick={Sheet.options.bind(null, app)} plain="neutral"
        label="Options" /></li>
    </>;
  }
  // Options over the game, paused: the sheet put away beneath it, and back to it as it stood.
  static options(app: ReaderApp) { app.setState({ phase: 'options', view: 'here' }); }
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
  static listed(app: ReaderApp): Held[] {
    const screen = app.state.frame!.screen, held: Held[] = screen.aims?.map(a => ({ id: a.id, text: a.text }))
      ?? screen.objectives.map(text => ({ text }));
    return Sheet.ordered(app, [...screen.deadlines.map(text => ({ text })), ...held]);
  }
  static key(aim: Held): string { return aim.id ?? aim.text; }
  static stories(titles: (string | undefined)[]): string[] { return [...new Set(titles.filter(t => t !== undefined))]; }
  static Aims({ app, picked, pick }: { app: ReaderApp; picked?: string; pick: (key: string) => void }) {
    const screen = app.state.frame!.screen, [first, ...rest] = Sheet.listed(app);
    const card = (aim: Held) => <Sheet.Aim key={Sheet.key(aim)} app={app} aim={aim} picked={picked === Sheet.key(aim)}
      pick={pick} />;
    // Each story's aims under its title, then the rest (the owner, 18 November, OR-74: stories apart from simple aims).
    // The first's own story's other aims go under it, its title said once above it.
    const story = (aim?: Held) => aim && Sheet.held(app, aim)?.story?.title, own = story(first);
    const told = Sheet.stories(rest.map(story)).filter(t => t !== own), mine = own ? rest.filter(o => story(o) === own) : [];
    const loose = rest.filter(o => !story(o)), town = AimNear.town(screen);
    const here = loose.filter(o => town && AimNear.near(screen, o.id ? { id: o.id } : o.text));
    const far = loose.filter(o => !here.includes(o));
    return <>
      {own && <p className="aims-story kicker">{Typography.curl(own)}</p>}
      <ul className="aims">{card(first!)}</ul>
      {mine.length > 0 && <ul className="aims rest">{mine.map(card)}</ul>}
      {told.map(t => <div key={t} className="aims-more story"><h3>{Typography.curl(t)}</h3>
        <ul className="aims rest">{rest.filter(o => story(o) === t).map(card)}</ul></div>)}
      {here.length > 0 && <div className="aims-more"><h3>{Typography.curl(`To hand in ${town!.name}`)}</h3>
        <ul className="aims rest">{here.map(card)}</ul></div>}
      {far.length > 0 && <div className="aims-more"><h3>{town ? 'Further off' : 'You could also take up'}</h3>
        <ul className="aims rest">{far.map(card)}</ul></div>}
    </>;
  }
  // An aim, to follow or not, and where it names a place the company knows, that place on the map: going anywhere is the
  // map's (the owner, 4 November: no setting out from any page but the world map's).
  // An aim chosen to follow: the action the observation offers for it (Screen.aims[].follow), done as any act is.
  static take(app: ReaderApp, command?: string): Promise<void> {
    return command ? app.take(command) : Promise.resolve();
  }
  // An aim as the notes tell it, considered by the hand or the keys (the menu acts on it): a presentation gesture, as a
  // cell chosen on the map is, never an act.
  static Aim({ app, aim, picked, pick }: { app: ReaderApp; aim: Held; picked: boolean; pick: (key: string) => void }) {
    const held = Sheet.held(app, aim), about = held?.about ?? [], key = Sheet.key(aim);
    return <li className={`aim-card${held?.followed ? ' followed' : ''}`} data-considered={picked || undefined}>
      <button type="button" className="aim-pick" data-action="consider-aim" aria-pressed={picked} onClick={() => pick(key)}
        onMouseEnter={() => pick(key)} onFocus={() => pick(key)}>{Typography.curl(aim.text)}
        {about.map(t => <small key={t} className="aim-about">{Typography.curl(t)}</small>)}
        {(held?.parts ?? []).map(p => <small key={p.text} className="aim-part" data-done={p.done || undefined}>
          {Typography.curl(Sheet.part(p))}</small>)}</button></li>;
  }
  // A part of the aim, said done in words, never by colour alone (OR-468).
  static part(p: { text: string; done: boolean }): string {
    const said = p.text.charAt(0).toUpperCase() + p.text.slice(1);
    return p.done ? `${said}: done.` : `${said}.`;
  }
  private static held(app: ReaderApp, aim: Held) {
    return aim.id === undefined ? undefined : app.state.frame?.screen.aims?.find(a => a.id === aim.id);
  }
  // What can be done with the aim considered: follow it, and where it names a place the company knows, that place on
  // the map: going anywhere is the map's (the owner, 4 November: no setting out from any page but the world map's).
  static AimActs({ app, aim }: { app: ReaderApp; aim: Held }) {
    const screen = app.state.frame?.screen, held = Sheet.held(app, aim), following = !!held?.followed;
    const place = screen && Aims.named(screen, screen.destinations ?? [], aim.text);
    return <>
      <li><ChoiceRow.Button className="follow" data={{ action: 'follow' }} act={held?.follow} shut={following || !held?.follow}
        // Following is a choice made, not an opportunity: the chosen mark, no Atlas gold (the trust contracts).
        onClick={() => { void Sheet.take(app, held?.follow); }} plain={following ? 'chosen' : 'neutral'}
        label={following ? 'Following' : 'Follow this'} /></li>
      {place && Surfaces.has(screen, 'the_map') && <li><ChoiceRow.Button className="on-map" data={{ action: 'aim-map', id: place.id }} plain="neutral"
        label={`${place.name}, on the map`}
        onClick={() => { void Sheet.take(app, held?.follow).then(() => app.chart(Sheet.charted(screen, place.id))); }} /></li>}
    </>;
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
  private static story(entries: Entry[]) { return <Sheet.Story entries={entries} />; }
  static Story({ entries: all }: { entries: Entry[] }) {
    const [query, ask] = useState(''), entries = StorySearch.filter(all, query);
    let place = '';
    const told = new Set<string>();
    return (
      <article className="story" aria-label="The story so far">
        <h2>The story so far</h2>
        {/* Searched by the words, as the page's own find; a presentation operation, nothing in the game changes. */}
        <p className="story-search"><input type="search" value={query} placeholder="Search the story" aria-label="Search the story"
          data-action="story-search" onChange={e => ask(e.target.value)} />
          {query && <span className="how">{entries.length === 1 ? '1 entry' : `${entries.length} entries`}</span>}</p>
        {entries.length ? entries.map(e => {
          const chapter = e.place !== place ? <h3 key={`h${e.id}`}>{Words.upper(e.placeName)}</h3> : null;
          place = e.place;
          // A line of a few words (time passes, a door opens) is said again as often as it happens.
          const fresh = e.lines.filter(l => l.length < 60 || !told.has(l)), again = e.lines.length > 0 && !fresh.length;
          e.lines.forEach(l => told.add(l));
          return <div key={e.id}>{chapter}
            {e.said && !Words.restates(Words.echo(Words.lastSaid(e.said)), e.lines[0])
              && <p className="you">{Words.echo(Words.lastSaid(e.said))}</p>}
            {again ? <p className="again">The same as before.</p> : fresh.map((l, i) => <p key={i}><Told.Said text={l} /></p>)}</div>;
        }) : <p className="none">{query ? 'Nothing in the story says that.' : 'Nothing has happened yet.'}</p>}
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
        <p className="how">{screen.purse.coin} {screen.purse.currency ?? 'coin'} · {screen.purse.rations} {screen.purse.rations === 1 ? 'ration' : 'rations'}
          {screen.purse.other.length > 0 && ` · ${screen.purse.other.join(', ')}`}</p>
        {Sheet.fed(screen) && <p className="how" data-id="fed">{Sheet.fed(screen)}</p>}
      </article>
    );
  }
}
