import type { MemberRow, Screen } from '../../src/ui/screen-types';
import type { Frame } from '../engine/protocol';
import type { ReaderApp } from './reader-app';
import { Words } from './words';

// What the company is and has, shown beside the page when asked for (on a narrow screen, at the head of the page):
// a companion's sheet, a thing carried, or the journal (what people want of the company, and what it knows and how
// sure it can be). The story so far has its own page.
export class DetailsPane {
  static readonly numerals = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX'];
  static View({ app, inline }: { app: ReaderApp; inline?: boolean }) {
    const s = app.state, frame = s.frame!, screen = frame.screen;
    const shown = app.menu.level.find(c => c.id === s.hovered) ?? app.menu.level[s.cursor];
    const body = s.view === 'company' ? DetailsPane.sheet(screen.party.find(m => m.id === (shown?.id ?? s.member))
      ?? screen.party.find(m => m.id === s.member) ?? screen.party[0]!, screen)
      : s.view === 'pack' ? DetailsPane.thing(screen, shown?.id) : DetailsPane.journal(app, frame);
    return (
      <section className={`details view-${s.view}${inline ? ' inline' : ''}`} {...inline ? {} : { 'data-region': 'details' }}
        aria-label={s.view}>
        <button type="button" className="close" onClick={app.back} aria-label="Close">Esc</button>
        {body}
      </section>
    );
  }
  private static sheet(m: MemberRow, screen: Screen) {
    const gear = screen.items.filter(i => i.owner === m.id);
    return (
      <article className="sheet">
        <h1>{m.name}</h1>
        <p className="where">{m.line}, level {m.level}{m.background ? `, once a ${m.background.toLowerCase()}` : ''}</p>
        <p className="where">{m.progress}</p>
        <p className="health">{m.hp} of {m.maxHp} hit points{m.conditions.length > 0 && `, ${m.conditions.join(', ')}`}
          {(m.boons ?? []).length > 0 && ` · ${m.boons!.join(', ')}`}</p>
        <p className="attrs">{Object.entries(m.attributes).map(([k, v]) => <span key={k} title={k}>
          {k.slice(0, 3)} <b>{v}</b></span>)}</p>
        {(m.spells ?? []).length > 0 && <><h3>Prepared today</h3><ul className="prepared">
          {[...new Set(m.spells!.map(x => x.level))].map(l => <li key={l}><b>{DetailsPane.numerals[l - 1]}</b>{' '}
            {m.spells!.filter(x => x.level === l).map(x => x.ready ? x.name : `(${x.name}, spent)`).join(', ')}</li>)}
        </ul></>}
        <h3>Can do</h3>
        <dl className="abilities">{m.abilities.map(a => <div key={a.id}><dt>{a.name}{a.price && <small> {a.price}</small>}</dt>
          <dd>{a.text}</dd></div>)}</dl>
        <h3>Carries</h3>
        <p>{gear.length ? Words.upper(gear.map(i => `${i.name}${i.equipped ? ' (in use)' : ''}`).join(', ')) : 'Nothing.'}</p>
        {(m.overlays ?? []).length > 0 && <><h3>Where they come from</h3>{m.overlays!.map(o =>
          <p key={o.id}><b>{o.name}</b> <small>{o.role}</small>: {o.grants.join(', ')}</p>)}</>}
        {screen.capabilities.length > 0 && <><h3>The company can</h3><p>{screen.capabilities.join('; ')}.</p></>}
      </article>
    );
  }
  private static thing(screen: Screen, id?: string) {
    const item = screen.items.find(i => i.id === id || id?.startsWith(`${i.id}/`));
    if (!item) {
      return <article className="sheet"><p>{screen.items.length ? 'Choose a thing to use it, hand it over or set it down.'
        : 'The company carries nothing yet.'}</p></article>;
    }
    return (
      <article className="sheet">
        <h1>{Words.upper(item.name.replace(/^(a|an|some) /i, ''))}</h1>
        <p className="where">{item.kind.toLowerCase() === item.name.replace(/^(a|an|some|the) /i, '').toLowerCase() ? 'Carried'
          : `${item.kind}, carried`} by {item.ownerName}{item.equipped ? ', in use' : ''}</p>
        <p>{item.description}</p>
      </article>
    );
  }
  private static journal(app: ReaderApp, frame: Frame) {
    const screen = frame.screen, facts = screen.knowledge.filter(k => !screen.objectives.includes(k.text));
    const kinds: [string, string][] = [['seen', 'Seen for yourselves'], ['confirmed', 'Heard, and since seen'],
      ['reported', 'Heard, not yet seen']];
    return (
      <article className="sheet journal" data-region="knowledge">
        <h1>Journal</h1>
        <h3>What people want</h3>
        {screen.objectives.length ? <ul>{screen.objectives.map(o => <li key={o}>{o}</li>)}</ul>
          : <p className="none">Nobody has asked anything of you yet.</p>}
        {screen.deadlines.length > 0 && <><h3>Days named</h3><ul>{screen.deadlines.map(d => <li key={d}>{d}</li>)}</ul></>}
        <h3>What you know</h3>
        <div className="known">{kinds.map(([kind, title]) => {
          const list = facts.filter(k => k.kind === kind);
          return list.length ? <div key={kind}><p className="kind">{title}</p>
            <ul>{list.map(k => <li key={k.text}>{k.text}{k.how && <span className="how"> {k.how}</span>}</li>)}</ul></div>
            : null;
        })}</div>
        <p className="save">
          <button type="button" data-action="export" onClick={app.download}>Download a save file</button>{' '}
          <button type="button" data-action="title" onClick={app.opening.title}>Back to the title</button>
        </p>
      </article>
    );
  }
}
