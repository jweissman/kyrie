import type { MouseEvent, PointerEvent, ReactNode } from 'react';
import type { Choice } from '../../../src/ui/choice-list';
import type { ReaderApp } from '../reader-app';
import type { View } from '../menu-model';
import { Typography } from '../../../src/presentation/typography';

// What every choice on the stage is drawn by: one button, known by the engine's command through its place in the
// menu (data-index), lit when the keys are on it, saying what it opens when it opens something. Its look is the
// stage's to give (the class it is handed); what it does is always the same.
export interface Draw { app: ReaderApp; index: Map<string, number>; open: Set<string> }
export class Act {
  static draw(app: ReaderApp): Draw {
    return { app, index: new Map(app.menu.choices.map((c, i) => [c.id, i])), open: new Set(app.state.open) };
  }
  static View({ choice: c, draw, className, children }: { choice: Choice; draw: Draw; className?: string;
    children?: ReactNode }) {
    const i = draw.index.get(c.id) ?? -1, s = draw.app.state, selected = !!s.keyed && i === s.cursor;
    const classes = ['act', className ?? '', selected ? 'sel' : '', c.risk ? 'risk' : '', c.disabled ? 'shut' : '',
      c.children && !/#(talk|look)$/.test(c.id) ? draw.open.has(c.id) ? 'opened' : 'opens' : ''].filter(Boolean).join(' ');
    return (
      <button type="button" className={classes} data-action="choice" data-choice={c.id} data-index={i}
        aria-current={selected} aria-disabled={c.disabled ? true : undefined}
        aria-expanded={c.children && !/#(talk|look)$/.test(c.id) ? draw.open.has(c.id) : undefined}
        title={c.disabled ?? c.about} onClick={Act.click.bind(null, draw.app)} onPointerEnter={Act.enter.bind(null, draw.app)}>
        {children ?? <>{Typography.curl(c.label)}{c.note && !c.minutes && <small className="note">{c.note}</small>}</>}
        {c.grave && s.confirming === c.id && <small className="grave" role="alert">
          {Typography.curl(c.grave)} It cannot be undone. Choose it again to do it.</small>}
      </button>
    );
  }
  // Choices in a row; what one of them opens, beneath, as a column.
  static List({ choices, draw, className }: { choices: Choice[]; draw: Draw; className?: string }) {
    const opened = choices.find(c => c.children && draw.open.has(c.id));
    return <>
      <ul className={`acts ${className ?? ''}`}>{choices.map(c => <li key={c.id}><Act.View choice={c} draw={draw} /></li>)}</ul>
      {opened && <ul className="opened-list" aria-label={opened.label}>{opened.children!.map(c => <li key={c.id}>
        <Act.View choice={c} draw={draw} />
        {c.children && draw.open.has(c.id) && <Act.List choices={c.children} draw={draw} className="column" />}
      </li>)}</ul>}
    </>;
  }
  // What can be looked at rather than done: the map, notes, what you carry, the company, the story so far.
  static Sheets({ app }: { app: ReaderApp }) {
    const screen = app.state.frame!.screen;
    const sheets: [View, string, string][] = [['map', 'Map', 'm'], ['journal', 'Notes', 'j'], ['pack', 'Pack', 'i'],
      ...screen.party.length > 1 ? [['company', 'Company', 'c'] as [View, string, string]] : [], ['story', 'Story', 'h']];
    return (
      <ul className="sheets">{sheets.map(([view, label, key]) => <li key={view}><button type="button" className="sheet-key"
        data-action="mode" data-view={view} data-key={key} aria-pressed={app.state.view === view}
        onClick={Act.open.bind(null, app)}>{label}</button></li>)}</ul>
    );
  }
  private static click(app: ReaderApp, e: MouseEvent<HTMLButtonElement>) {
    const i = Number(e.currentTarget.dataset.index), choice = app.menu.choices[i];
    if (choice) { app.setState({ cursor: i, keyed: false }); app.choose(choice); }
  }
  private static open(app: ReaderApp, e: MouseEvent<HTMLButtonElement>) { app.show(e.currentTarget.dataset.view as View); }
  // A finger is not a pointer that hovers: the mouse events a browser makes up after a touch light nothing.
  static touched = -Infinity;
  static down(e: PointerEvent<HTMLElement>) { if (e.pointerType !== 'mouse') { Act.touched = e.timeStamp; } }
  private static enter(app: ReaderApp, e: PointerEvent<HTMLButtonElement>) {
    if (e.pointerType === 'mouse' && e.timeStamp - Act.touched > 1500) { app.hover(e.currentTarget.dataset.choice); }
  }
  static leave(app: ReaderApp, e: PointerEvent<HTMLElement>) { if (e.pointerType === 'mouse') { app.hover(undefined); } }
}
