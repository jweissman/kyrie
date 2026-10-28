import type { Entry, Frame } from '../engine/protocol';
import type { Screen } from '../../src/ui/screen-types';
import type { ReaderApp } from './reader-app';
import { Act } from './stage/act';
import { Words } from './words';
import { Typography } from '../../src/presentation/typography';
import { CharacterPage } from './character-page';
import { MenuModel } from './menu-model';
import { Aims } from './aims';

// What takes the right-hand side's place when asked for: your notes (what is unfinished, what you know, and how sure
// you can be of it), the story so far, what you carry, the company. The book's head goes back to what is here (a back
// of its own under the head made two: play 7); the world stays.
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
  private static journal(app: ReaderApp, frame: Frame) {
    const screen = frame.screen, facts = screen.knowledge.filter(k => !screen.objectives.includes(k.text));
    const kinds: [string, string][] = [['seen', 'Seen for yourself'], ['confirmed', 'Heard, and since seen'],
      ['reported', 'Heard, not yet seen'], ['known', 'Known before you set out']];
    return (
      <article className="journal" data-region="knowledge">
        <h2>Notes</h2>
        <h3>What you mean to do</h3>
        {screen.objectives.length || screen.deadlines.length
          ? <ul className="aims">{[...screen.deadlines, ...screen.objectives].map(o => <Sheet.Aim key={o} app={app} aim={o} />)}</ul>
          : <p className="none">{Sheet.idle(screen, facts)}</p>}
        <Sheet.Going app={app} />
        {screen.done.length > 0 && <div data-region="done"><h3>Seen through</h3>
          <ul>{screen.done.map(d => <li key={d}>{d}</li>)}</ul></div>}
        {kinds.map(([kind, title]) => {
          const list = facts.filter(k => k.kind === kind);
          return list.length ? <div key={kind}><h3>{title}</h3>
            <ul>{list.map(k => <li key={k.text}>{k.text}{k.how && <span className="how"> — {k.how}</span>}</li>)}</ul>
          </div> : null;
        })}
        {!facts.length && <p className="none">You know nothing here yet but what you see.</p>}
        <p className="keep">
          <button type="button" className="option" data-action="export" onClick={app.download}>Download a save file</button>
          <button type="button" className="option" data-action="title" onClick={app.opening.title}>Back to the title</button>
        </p>
      </article>
    );
  }
  // An aim, and, when it names somewhere the company knows the way to, setting out for it there: the notes had been a
  // document of bullets (the owner's interim report).
  static Aim({ app, aim }: { app: ReaderApp; aim: string }) {
    const place = Aims.named(app.state.frame?.screen.destinations ?? [], aim, 0);
    return <li className="aim-card"><span>{Typography.curl(aim)}</span>
      {place && <button type="button" className="act set-out" data-action="set-out" data-id={place.id}
        onClick={() => app.choose(MenuModel.journey(place))}>{`Set out for ${place.name}`}</button>}</li>;
  }
  // Where the company could set out for, nearest first, each with how long and setting out: the notes are a plan, not
  // a ledger (the play-structure investigation's PT-25).
  // The places heard of or been to first, then the towns the roads go to.
  static Going({ app }: { app: ReaderApp }) {
    const screen = app.state.frame?.screen, leads = screen?.destinations ?? [], roads = screen?.roads ?? [];
    if (!leads.length && !roads.length) { return null; }
    return <div className="going" data-region="going"><h3>Where you could go</h3>
      <ul>{[...leads, ...roads].map(d => <li key={d.id} className={roads.includes(d) ? 'road' : undefined}>
        <span className="to">{d.toward ? `Toward ${d.name}` : d.name}</span>
        <span className="how">{Words.span(d.minutes)}{d.toward ? `, as far as ${d.toward}` : ''}
          {roads.includes(d) ? ', by the roads' : ''}</span>
        <button type="button" className="act set-out" data-action="set-out" data-id={d.id}
          onClick={() => app.choose(MenuModel.journey(d))}>Set out</button></li>)}</ul></div>;
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
  // Everything so far, place by place.
  private static story(entries: Entry[]) {
    let place = '';
    return (
      <article className="story" aria-label="The story so far">
        <h2>The story so far</h2>
        {entries.length ? entries.map(e => {
          const chapter = e.place !== place ? <h3 key={`h${e.id}`}>{Words.upper(e.placeName)}</h3> : null;
          place = e.place;
          return <div key={e.id}>{chapter}
            {e.said && !Words.restates(Words.echo(Words.lastSaid(e.said)), e.lines[0])
              && <p className="you">{Words.echo(Words.lastSaid(e.said))}</p>}
            {e.lines.map((l, i) => <p key={i}>{l}</p>)}</div>;
        }) : <p className="none">Nothing has happened yet.</p>}
      </article>
    );
  }
  // What each of you carries, and what can be done with each thing.
  private static pack(app: ReaderApp, screen: Screen) {
    const menu = app.menu, draw = Act.draw(app);
    return (
      <article className="pack">
        <h2>What you carry</h2>
        {menu.sections.length ? menu.sections.map(sec => <section key={sec.id}>
          <h3>{sec.title}</h3>
          <Act.List choices={sec.choices} draw={draw} className="column" />
        </section>) : <p className="none">You carry nothing.</p>}
        <p className="how">{screen.purse.coin} coin · {screen.purse.rations} {screen.purse.rations === 1 ? 'ration' : 'rations'}
          {screen.purse.other.length > 0 && ` · ${screen.purse.other.join(', ')}`}</p>
      </article>
    );
  }
}
