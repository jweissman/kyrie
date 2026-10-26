import type { MouseEvent, ReactNode } from 'react';
import type { Choice } from '../../../src/ui/choice-list';
import type { ReaderApp } from '../reader-app';
import type { View } from '../menu-model';
import { Typography } from '../../../src/presentation/typography';

// What every choice on the stage is drawn by: one button, known by the engine's command through its place in the
// menu (data-index), marked when the keys are on it, saying what it opens when it opens something. Its look is the
// stage's to give (the class it is handed); what it does is always the same.
export interface Draw { app: ReaderApp; index: Map<string, number>; open: Set<string> }
export class Act {
  static draw(app: ReaderApp): Draw {
    return { app, index: new Map(app.menu.choices.map((c, i) => [c.id, i])), open: new Set(app.state.open) };
  }
  static View({ choice: c, draw, className, children }: { choice: Choice; draw: Draw; className?: string;
    children?: ReactNode }) {
    const i = draw.index.get(c.id) ?? -1, s = draw.app.state, selected = !!s.keyed && i === s.cursor;
    const opens = !!c.children && !/#(talk|look)$/.test(c.id);
    const classes = ['act', className ?? '', selected ? 'sel' : '', c.risk ? 'risk' : '', c.grave ? 'grave' : '',
      c.disabled ? 'shut' : '', opens ? draw.open.has(c.id) ? 'opened' : 'opens' : ''].filter(Boolean).join(' ');
    return (
      <button type="button" className={classes} data-action="choice" data-choice={c.id} data-index={i}
        aria-current={selected || undefined} aria-disabled={c.disabled ? true : undefined}
        aria-expanded={opens ? draw.open.has(c.id) : undefined} onClick={Act.click.bind(null, draw.app)}>
        {children ?? <>{Typography.curl(c.label)}{c.note && <span className="note">{Typography.curl(c.note)}</span>}</>}
        {c.disabled && <span className="why">{Typography.curl(c.disabled)}</span>}
        {c.about && (c.risk || c.grave) && !children && <span className="about">{Typography.curl(c.about)}</span>}
        {c.grave && s.confirming === c.id && <span className="grave-said" role="alert">
          {Typography.curl(c.grave)} It cannot be undone. Choose it again to do it.</span>}
      </button>
    );
  }
  // A name in the telling, which is also a way into what it names: chosen as the choice it stands for, outside the
  // order the keys move through (the same choice is in the lines below the telling, where the keys find it).
  static Inline({ app, choice, children }: { app: ReaderApp; choice: Choice; children: ReactNode }) {
    return <button type="button" className="inline" data-action="name" data-choice={choice.id} tabIndex={-1}
      onClick={() => app.choose(choice)}>{children}</button>;
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
  // The books, which are read rather than lived: the character (from the start, whoever has joined), the notes,
  // what you carry, the map and the story so far. Each says the key that opens it.
  static Sheets({ app }: { app: ReaderApp }) {
    const many = (app.state.frame?.screen.party.length ?? 0) > 1;
    const sheets: [View, string, string][] = [['company', many ? 'Company' : 'Character', 'c'], ['journal', 'Notes', 'j'],
      ['pack', 'Pack', 'i'], ['map', 'Map', 'm'], ['story', 'Story', 'h']];
    return (
      <ul className="sheets" aria-label="Books">{sheets.map(([view, label, key]) => <li key={view}><button type="button"
        className="sheet-key" data-action="mode" data-view={view} data-key={key} aria-pressed={app.state.view === view}
        onClick={Act.open.bind(null, app)}>{label}<kbd>{key.toUpperCase()}</kbd></button></li>)}</ul>
    );
  }
  private static click(app: ReaderApp, e: MouseEvent<HTMLButtonElement>) {
    const i = Number(e.currentTarget.dataset.index), choice = app.menu.choices[i];
    if (choice) { app.setState({ cursor: i, keyed: false }); app.choose(choice); }
  }
  private static open(app: ReaderApp, e: MouseEvent<HTMLButtonElement>) { app.show(e.currentTarget.dataset.view as View); }
}
