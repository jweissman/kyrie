import type { MouseEvent, PointerEvent } from 'react';
import type { Choice, Section } from '../../src/ui/choice-list';
import type { ReaderApp } from './reader-app';
import { Words } from './words';

// What can be done now. Each group is labelled in the margin by what it is about (a person, the ways on); the
// company's own routine (waiting, searching, preparing) sits last, smaller. A highlighted choice is explained below
// the list, in the same place whatever is chosen, so nothing moves under the pointer.
export class ChoiceMenu {
  static View({ app, title }: { app: ReaderApp; title: string }) {
    const s = app.state, menu = app.menu, counter = { n: 0 };
    const shown = menu.level.find(c => c.id === s.hovered) ?? menu.level[s.cursor];
    const gloss = shown ? shown.disabled ?? shown.about ?? '' : '';
    const groups = menu.trail.length ? [ChoiceMenu.opened(app, counter)]
      : menu.sections.filter(sec => sec.choices.length).map(sec => ChoiceMenu.group(app, sec, counter));
    return (
      <nav className={`choices${s.pending ? ' busy' : ''}`} data-region="choices" aria-label={title}
        onPointerLeave={ChoiceMenu.leave.bind(null, app)}>
        {groups.length ? groups : <p className="none">Nothing to do here.</p>}
        <p className="gloss" data-id="detail" aria-live="polite">{gloss}</p>
      </nav>
    );
  }
  private static opened(app: ReaderApp, counter: { n: number }) {
    const menu = app.menu;
    return (
      <div className="group opened" key="opened">
        <p className="label crumbs">
          <button type="button" className="back" onClick={app.back}>{menu.trail.map(c => c.label).join(' › ')}</button>
        </p>
        <ol>{menu.level.map(c => ChoiceMenu.choice(app, c, counter))}</ol>
      </div>
    );
  }
  private static group(app: ReaderApp, sec: Section, counter: { n: number }) {
    const routine = sec.tone === 'company';
    return (
      <div className={`group tone-${sec.tone}${routine ? ' routine' : ''}`} key={sec.id} data-section={sec.id}>
        <p className="label">{ChoiceMenu.label(sec)}</p>
        <ol>{sec.choices.map(c => ChoiceMenu.choice(app, c, counter))}</ol>
      </div>
    );
  }
  static label(sec: Section): string {
    if (sec.tone === 'way') { return 'Ways'; }
    if (sec.tone === 'company') { return 'Yourselves'; }
    return Words.short(sec.title);
  }
  private static choice(app: ReaderApp, c: Choice, counter: { n: number }) {
    const i = counter.n++, selected = i === app.state.cursor;
    const classes = ['choice', `tone-${c.tone}`, selected ? 'sel' : '', c.id === app.state.hovered ? 'hov' : '',
      c.risk ? 'risk' : '',
      c.disabled ? 'disabled' : '', c.children ? 'opens' : ''].filter(Boolean).join(' ');
    return (
      <li key={c.id}>
        <button type="button" className={classes} data-action="choice" data-choice={c.id} data-index={i}
          aria-current={selected} aria-disabled={c.disabled ? true : undefined}
          onClick={ChoiceMenu.click.bind(null, app)} onPointerEnter={ChoiceMenu.enter.bind(null, app)}>
          <kbd className="n">{i < 9 ? i + 1 : ''}</kbd>
          <span className="l">{c.label}</span>
          {(c.note || c.risk) && <span className="note">{c.note}{c.risk && <b className="risk-mark"> risky</b>}</span>}
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
  // Only a mouse leaving the list ends a hover: a finger lifting from the glass is not one, and redrawing the gloss
  // between a tap and its click would move the list under the finger.
  private static leave(app: ReaderApp, e: PointerEvent<HTMLElement>) {
    if (e.pointerType === 'mouse') { app.hover(undefined); }
  }
}
