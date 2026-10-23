import type { Entry, Frame } from '../engine/protocol';
import type { MemberRow, Screen } from '../../src/ui/screen-types';
import type { ReaderApp } from './reader-app';
import { RegionMap } from './region-map';
import { Words } from './words';

// What opens over the right-hand page when asked for: the journal (what is unfinished and what you know, and how
// sure you can be), the story so far, the map, a companion's sheet or a thing carried. The world stays on the left.
export class Sheet {
  static readonly numerals = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX'];
  static View({ app }: { app: ReaderApp }) {
    const s = app.state, frame = s.frame!, screen = frame.screen;
    const shown = app.menu.level.find(c => c.id === s.hovered) ?? app.menu.level[s.cursor];
    const body = s.view === 'journal' ? Sheet.journal(app, frame) : s.view === 'story' ? Sheet.story(frame.entries)
      : s.view === 'map' ? <RegionMap.View screen={screen} large />
        : s.view === 'company' ? Sheet.member(screen.party.find(m => m.id === (shown?.id ?? s.member))
          ?? screen.party.find(m => m.id === s.member) ?? screen.party[0]!, screen)
          : Sheet.thing(screen, shown?.id);
    return (
      <section className={`sheet view-${s.view}`} data-region="details" aria-label={s.view}>
        <button type="button" className="close" data-action="close" onClick={app.back} aria-label="Close">Close</button>
        {body}
      </section>
    );
  }
  private static journal(app: ReaderApp, frame: Frame) {
    const screen = frame.screen, facts = screen.knowledge.filter(k => !screen.objectives.includes(k.text));
    const kinds: [string, string][] = [['seen', 'Seen for yourself'], ['confirmed', 'Heard, and since seen'],
      ['reported', 'Heard, not yet seen']];
    return (
      <article className="journal" data-region="knowledge">
        <h2>Journal</h2>
        <h3>Unfinished</h3>
        {screen.objectives.length || screen.deadlines.length
          ? <ul>{[...screen.objectives, ...screen.deadlines].map(o => <li key={o}>{o}</li>)}</ul>
          : <p className="none">Nothing is asked of you yet.</p>}
        <h3>What you know</h3>
        {kinds.map(([kind, title]) => {
          const list = facts.filter(k => k.kind === kind);
          return list.length ? <div key={kind} className="known"><p className="kind">{title}</p>
            <ul>{list.map(k => <li key={k.text}>{k.text}{k.how && <span className="how"> — {k.how}</span>}</li>)}</ul>
          </div> : null;
        })}
        {!facts.length && <p className="none">Nothing yet.</p>}
        <p className="keep">
          <button type="button" data-action="export" onClick={app.download}>Download a save file</button>
          <button type="button" data-action="title" onClick={app.opening.title}>Back to the title</button>
        </p>
      </article>
    );
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
            {e.said && <p className="said">{Words.echo(Words.lastSaid(e.said))}</p>}
            {e.lines.map((l, i) => <p key={i}>{l}</p>)}</div>;
        }) : <p className="none">Nothing has happened yet.</p>}
      </article>
    );
  }
  private static member(m: MemberRow, screen: Screen) {
    const gear = screen.items.filter(i => i.owner === m.id);
    return (
      <article className="member-sheet">
        <h2>{m.name}</h2>
        <p className="line">{m.line}, level {m.level}{m.background ? `; once ${Words.article(m.background.toLowerCase())}` : ''}</p>
        <p className="line">{m.progress}</p>
        <p className="health">{Words.upper(Words.hurt(m.hp, m.maxHp))} ({m.hp} of {m.maxHp}){m.conditions.length > 0
          && `; ${m.conditions.join(', ')}`}{(m.boons ?? []).length > 0 && ` · ${m.boons!.join(', ')}`}</p>
        <p className="attrs">{Object.entries(m.attributes).map(([k, v]) => <span key={k} title={k}>{k.slice(0, 3)} <b>{v}</b></span>)}</p>
        {(m.spells ?? []).length > 0 && <><h3>Prepared today</h3><ul className="prepared">
          {[...new Set(m.spells!.map(x => x.level))].map(l => <li key={l}><b>{Sheet.numerals[l - 1]}</b>{' '}
            {m.spells!.filter(x => x.level === l).map(x => x.ready ? x.name : `(${x.name}, spent)`).join(', ')}</li>)}
        </ul></>}
        <h3>Can do</h3>
        <dl className="abilities">{m.abilities.map(a => <div key={a.id}><dt>{a.name}{a.price && <small> {a.price}</small>}</dt>
          <dd>{a.text}</dd></div>)}</dl>
        <h3>Carries</h3>
        <p>{gear.length ? Words.upper(gear.map(i => `${i.name}${i.equipped ? ' (in use)' : ''}`).join(', ')) : 'Nothing.'}</p>
      </article>
    );
  }
  private static thing(screen: Screen, id?: string) {
    const item = screen.items.find(i => i.id === id || id?.startsWith(`${i.id}/`));
    if (!item) {
      return <article className="member-sheet"><p className="none">{screen.items.length
        ? 'Choose a thing to use it, hand it over or set it down.' : 'You carry nothing yet.'}</p></article>;
    }
    return (
      <article className="member-sheet">
        <h2>{Words.upper(item.name.replace(/^(a|an|some) /i, ''))}</h2>
        <p className="line">Carried by {item.ownerName}{item.equipped ? ', in use' : ''}</p>
        <p>{item.description}</p>
      </article>
    );
  }
}
