import type { MouseEvent, PointerEvent } from 'react';
import type { Choice, Section } from '../../src/ui/choice-list';
import type { CombatScreen, Screen } from '../../src/ui/screen-types';
import type { ReaderApp } from './reader-app';
import { Words } from './words';

// The right-hand page: what you might do. Grouped by kind (speak, look, go, yourself), each group short; a person or
// a thing with several things to it opens in place, with the way back above it. What a highlighted choice means is
// said below the list, in one place, so nothing moves under the hand. The company is a quiet line at the foot.
export class Recto {
  static View({ app, title }: { app: ReaderApp; title: string }) {
    const s = app.state, menu = app.menu, counter = { n: 0 };
    const shown = menu.level.find(c => c.id === s.hovered) ?? menu.level[s.cursor];
    const gloss = shown ? shown.disabled ?? shown.about ?? '' : '';
    const groups = menu.trail.length ? [Recto.opened(app, counter)]
      : menu.sections.filter(sec => sec.choices.length).map(sec => Recto.group(app, sec, counter));
    return (
      <nav className={`intentions${s.pending ? ' busy' : ''}`} data-region="choices" aria-label={title}
        onPointerLeave={Recto.leave.bind(null, app)}>
        {groups.length ? groups : <p className="none">Nothing to be done here.</p>}
        <p className="gloss" data-id="detail" aria-live="polite">{gloss}</p>
      </nav>
    );
  }
  private static opened(app: ReaderApp, counter: { n: number }) {
    const menu = app.menu, head = menu.trail.at(-1)!;
    return (
      <div className="group opened" key="opened">
        <p className="label"><button type="button" className="back" data-action="back" onClick={app.back}>
          {menu.trail.length > 1 ? menu.trail.at(-2)!.label : 'Back'}</button></p>
        <p className="subject">{head.label}</p>
        <ol>{menu.level.map(c => Recto.choice(app, c, counter))}</ol>
      </div>
    );
  }
  private static group(app: ReaderApp, sec: Section, counter: { n: number }) {
    return (
      <div className={`group tone-${sec.tone}`} key={sec.id} data-section={sec.id}>
        <p className="label">{Words.short(sec.title)}</p>
        <ol>{sec.choices.map(c => Recto.choice(app, c, counter))}</ol>
      </div>
    );
  }
  private static choice(app: ReaderApp, c: Choice, counter: { n: number }) {
    const i = counter.n++, selected = i === app.state.cursor;
    const classes = ['choice', `tone-${c.tone}`, selected ? 'sel' : '', c.id === app.state.hovered ? 'hov' : '',
      c.risk ? 'risk' : '', c.disabled ? 'disabled' : '', c.children ? 'opens' : ''].filter(Boolean).join(' ');
    return (
      <li key={c.id}>
        <button type="button" className={classes} data-action="choice" data-choice={c.id} data-index={i}
          aria-current={selected} aria-disabled={c.disabled ? true : undefined}
          onClick={Recto.click.bind(null, app)} onPointerEnter={Recto.enter.bind(null, app)}>
          <span className="l">{c.label}</span>
          {(c.note || c.risk) && <span className="note">{c.note}{c.risk && <b className="risk-mark"> · risky</b>}</span>}
          {c.children && <span className="more" aria-hidden="true">›</span>}
        </button>
      </li>
    );
  }
  private static click(app: ReaderApp, e: MouseEvent<HTMLButtonElement>) {
    const i = Number(e.currentTarget.dataset.index), choice = app.menu.level[i];
    if (choice) { app.setState({ cursor: i }); app.choose(choice); }
  }
  private static enter(app: ReaderApp, e: PointerEvent<HTMLButtonElement>) {
    if (e.pointerType === 'mouse') { app.hover(e.currentTarget.dataset.choice); }
  }
  // Only a mouse leaving the list ends a hover: a finger lifting from the glass is not one.
  private static leave(app: ReaderApp, e: PointerEvent<HTMLElement>) {
    if (e.pointerType === 'mouse') { app.hover(undefined); }
  }
  // The company at the foot of the page: each companion and how they are, in words; and what is in the purse.
  static Company({ app, screen, combat }: { app: ReaderApp; screen: Screen; combat?: CombatScreen }) {
    const rows = combat ? combat.allies.map(a => ({ id: a.id, name: a.name, hp: a.hp, maxHp: a.maxHp, acting: a.acting,
      conditions: a.statuses })) : screen.party.map(m => ({ id: m.id, name: m.name, hp: m.hp, maxHp: m.maxHp,
      acting: false, conditions: m.conditions }));
    return (
      <footer className={`company${combat ? ' fighting' : ''}`} data-region="party" aria-label="The company">
        {rows.map(r => <button type="button" key={r.id} className={`member${r.hp ? '' : ' down'}${r.acting ? ' acting' : ''}`}
          data-member={r.id} disabled={!!combat} onClick={Recto.open.bind(null, app)} title={`${r.hp} of ${r.maxHp}`}>
          <b>{r.name}</b> <span className="how">{combat ? `${r.hp}/${r.maxHp}` : Words.hurt(r.hp, r.maxHp)}
            {r.conditions.length > 0 && `, ${[...new Set(r.conditions)].join(', ').toLowerCase()}`}</span>
        </button>)}
        {!combat && <span className="purse" data-id="purse">{screen.purse.coin} coin · {screen.purse.rations}
          {screen.purse.rations === 1 ? ' ration' : ' rations'}</span>}
      </footer>
    );
  }
  private static open(app: ReaderApp, e: MouseEvent<HTMLButtonElement>) {
    app.setState({ member: e.currentTarget.dataset.member! });
    if (app.state.view !== 'company') { app.show('company'); }
  }
}
