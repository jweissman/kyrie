import type { MouseEvent, ReactNode } from 'react';
import { Hold } from './hold';
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
  // quiet: its label alone, what more there is to say of it said elsewhere (a way's detail line, see GlanceStage.Row).
  // number: the number it is pressed by, where that is held apart from its place among the choices (see TalkStage.n).
  // variant: how the one action system draws it (Mission 21's CN-04: every act in the world one system, never a link):
  // a row (ChoiceRow's look: the default), or a glyph (a likeness, a rail mark, a thing in the pack), which keeps its
  // own picture but carries the same marks (data-act, its id).
  // holdTone: the tone of the edge a held act fills with (its own indicator's), where it has one (see Hold).
  static View({ choice: c, draw, className, children, marked, quiet, number, variant = 'row', holdTone }: { choice: Choice;
    draw: Draw; className?: string; children?: ReactNode; marked?: boolean; quiet?: boolean; number?: number;
    variant?: 'row' | 'glyph'; holdTone?: string }) {
    const i = draw.index.get(c.id) ?? -1, s = draw.app.state, selected = !!s.keyed && i === s.cursor;
    // An act of time and commitment (Choice.hold, the engine's) is held rather than touched, where the page holds.
    const hold = Hold.use(c.hold && !c.disabled && Hold.on() ? Hold.ms.sustained : undefined, () => {
      draw.app.setState({ cursor: i, keyed: false }); draw.app.choose(c);
    });
    const opens = !!c.children && !/#(talk|look)$/.test(c.id), asks = Act.asks(c);
    const classes = ['act', variant === 'row' ? 'choice-row' : 'act-glyph', className ?? '', selected ? 'sel' : '',
      c.risk ? 'risk' : '', c.grave ? 'grave' : '', c.disabled ? 'shut' : '',
      opens ? draw.open.has(c.id) ? 'opened' : 'opens' : ''].filter(Boolean).join(' ');
    const tags = marked && !quiet ? Act.tags(c) : [];
    return (
      <button type="button" className={classes} data-action="choice" data-choice={c.id} data-act={c.id} data-index={i}
        data-number={number}
        aria-current={selected || undefined} aria-disabled={c.disabled ? true : undefined}
        aria-expanded={opens ? draw.open.has(c.id) : undefined} onClick={Act.click.bind(null, draw.app)} {...hold.props}>
        <Hold.Edge held={hold.held} {...holdTone ? { tone: holdTone } : {}} />
        {'data-hold' in hold.props && <span className="sr-only">{`, ${Hold.said}`}</span>}
        {children ?? <><span className="row-label">{Typography.curl(c.alone ?? Words.shown(c.label))}</span>{c.note
          && <span className="note row-aside">{Typography.curl(c.note)}</span>}</>}
        {tags.map(m => <span key={m.kind} className={`mark-tag mark-${m.kind}${m.danger ? ` danger-${m.danger}` : ''}`} title={Typography.curl(m.said)}>
          {Act.marks[m.kind]}</span>)}
        {c.disabled && !quiet && <span className="why">{Typography.curl(c.disabled)}</span>}
        {c.about && (c.risk || c.grave) && !children && !quiet && <span className="about">{Typography.curl(c.about)}</span>}
        {asks && s.confirming === c.id && <span className="grave-said" role="alert">
          {Typography.curl(Act.asked(asks, !!c.grave))}</span>}
      </button>
    );
  }
  // What a choice that is asked again says when it is chosen once: what it cannot undo, or how a fight would go.
  static asks(c: Choice): string | undefined { return c.grave ?? c.marks?.find(m => m.ask)?.said; }
  static asked(said: string, grave: boolean): string {
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
  // what you carry and the story so far. Each says the key that opens it. The map is not one of them: it is its own,
  // opened from the scene's rail or by M (the owner, 11 November: the map had been in the book as well).
  static Sheets({ app }: { app: ReaderApp }) {
    const many = (app.state.frame?.screen.party.length ?? 0) > 1;
    const sheets: [View, string, string][] = [['company', many ? 'Company' : 'Character', 'c'], ['journal', 'Notes', 'j'],
      ['pack', 'Pack', 'i'], ['story', 'Story', 'h']];
    return (
      <ul className="sheets" aria-label="Books">{sheets.map(([view, label, key]) => <li key={view}><button type="button"
        className="sheet-key" data-action="mode" data-view={view} data-key={key}
        aria-pressed={app.state.view === view}
        onClick={Act.open.bind(null, app)}>{label}<kbd>{key.toUpperCase()}</kbd></button></li>)}</ul>
    );
  }
  private static click(app: ReaderApp, e: MouseEvent<HTMLButtonElement>) {
    const i = Number(e.currentTarget.dataset.index), choice = app.menu.choices[i];
    if (choice) { app.setState({ cursor: i, keyed: false }); app.choose(choice); }
  }
  private static open(app: ReaderApp, e: MouseEvent<HTMLButtonElement>) { app.show(e.currentTarget.dataset.view as View); }
}
