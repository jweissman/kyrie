import type { MouseEvent, ReactNode } from 'react';
import type { Choice } from '../../../src/ui/choice-list';
import type { Mark } from '../../../src/presentation/glance-types';
import type { ReaderApp } from '../reader-app';
import type { View } from '../menu-model';
import { Typography } from '../../../src/presentation/typography';
import { Words } from '../words';

// What every choice on the stage is drawn by: one button, known by the engine's command through its place in the
// menu (data-index), marked when the keys are on it, saying what it opens when it opens something. Its look is the
// stage's to give (the class it is handed); what it does is always the same.
export interface Draw { app: ReaderApp; index: Map<string, number>; open: Set<string> }
export class Act {
  static draw(app: ReaderApp): Draw {
    return { app, index: new Map(app.menu.choices.map((c, i) => [c.id, i])), open: new Set(app.state.open) };
  }
  // marked: what it risks said on it, as a tag (see Marks): a fight and how it would go, something heard in a way in,
  // a journey that ends after dark. What cannot be undone and a risk say so already.
  static View({ choice: c, draw, className, children, marked }: { choice: Choice; draw: Draw; className?: string;
    children?: ReactNode; marked?: boolean }) {
    const i = draw.index.get(c.id) ?? -1, s = draw.app.state, selected = !!s.keyed && i === s.cursor;
    const opens = !!c.children && !/#(talk|look)$/.test(c.id), asks = Act.asks(c);
    const classes = ['act', className ?? '', selected ? 'sel' : '', c.risk ? 'risk' : '', c.grave ? 'grave' : '',
      c.disabled ? 'shut' : '', opens ? draw.open.has(c.id) ? 'opened' : 'opens' : ''].filter(Boolean).join(' ');
    const tags = marked ? Act.tags(c) : [];
    return (
      <button type="button" className={classes} data-action="choice" data-choice={c.id} data-index={i}
        aria-current={selected || undefined} aria-disabled={c.disabled ? true : undefined}
        aria-expanded={opens ? draw.open.has(c.id) : undefined} onClick={Act.click.bind(null, draw.app)}>
        {children ?? <>{Typography.curl(Words.shown(c.label))}{c.note && <span className="note">{Typography.curl(c.note)}</span>}</>}
        {tags.map(m => <span key={m.kind} className={`mark-tag mark-${m.kind}`} title={Typography.curl(m.said)}>
          {Act.marks[m.kind]}</span>)}
        {c.disabled && <span className="why">{Typography.curl(c.disabled)}</span>}
        {c.about && (c.risk || c.grave) && !children && <span className="about">{Typography.curl(c.about)}</span>}
        {asks && s.confirming === c.id && <span className="grave-said" role="alert">
          {Typography.curl(Act.asked(asks, !!c.grave))}</span>}
      </button>
    );
  }
  // What a choice that is asked again says when it is chosen once: what it cannot undo, or how a fight would go.
  static asks(c: Choice): string | undefined { return c.grave ?? c.marks?.find(m => m.ask)?.said; }
  private static asked(said: string, grave: boolean): string {
    const whole = `${Words.upper(said)}${/[.!?]$/.test(said) ? '' : '.'}`;
    return `${whole}${grave ? ' It cannot be undone.' : ''} Choose it again to do it.`;
  }
  // Each kind of mark as its tag says it.
  static readonly marks: Record<Mark['kind'], string> = { 'one-way': 'no way back', grave: 'cannot be undone',
    fight: 'a fight', trap: 'a risk', unlooked: 'not looked at', heard: 'something heard', exposed: 'a cold night',
    warned: 'they will not wait', night: 'after dark' };
  // The tags a choice carries where it is drawn: not what its look says already (cannot be undone, a risk); a way
  // with no coming back says that, in place of cannot be undone.
  static tags(c: Choice): Mark[] {
    return (c.marks ?? []).filter(m => !(c.grave && ['grave', 'exposed'].includes(m.kind))
      && !(c.risk && m.kind === 'trap'));
  }
  // A name in the telling, which is also a way into what it names: chosen as the choice it stands for, outside the
  // order the keys move through (the same choice is in the lines below the telling, where the keys find it).
  static Inline({ app, choice, children }: { app: ReaderApp; choice: Choice; children: ReactNode }) {
    return <button type="button" className="inline" data-action="name" data-choice={choice.id} tabIndex={-1}
      onClick={() => app.choose(choice)}>{children}</button>;
  }
  // Choices in a row; what one of them opens, beneath, as a column.
  static List({ choices, draw, className, marked }: { choices: Choice[]; draw: Draw; className?: string;
    marked?: boolean }) {
    const opened = choices.find(c => c.children && draw.open.has(c.id));
    return <>
      <ul className={`acts ${className ?? ''}`}>{choices.map(c => <li key={c.id}>
        <Act.View choice={c} draw={draw} marked={marked} /></li>)}</ul>
      {opened && <ul className="opened-list" aria-label={opened.label}>{opened.children!.map(c => <li key={c.id}>
        <Act.View choice={c} draw={draw} marked={marked} />
        {c.children && draw.open.has(c.id) && <Act.List choices={c.children} draw={draw} className="column" marked={marked} />}
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
