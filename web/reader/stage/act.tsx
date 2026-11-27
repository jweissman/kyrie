import type { MouseEvent, ReactNode } from 'react';
import type { Choice } from '../../../src/ui/choice-list';
import type { Mark } from '../../../src/presentation/glance-types';
import type { ReaderApp } from '../reader-app';
import type { View } from '../../../src/frame/menu-model';
import { Typography } from '../../../src/presentation/typography';
import { Words } from '../../../src/presentation/words';
import { Signs } from '../../../src/presentation/signs';
import { Grave } from '../../../src/presentation/grave';
import { RowAside } from './row-aside';
import { RowWords } from './row-words';
import { PageFrame } from '../page-frame';
import { Surfaces } from '../../../src/presentation/surfaces';

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
  // said: its name to a reader, where it is drawn by its picture alone (a reticle on a foe's card).
  // A choice the menu does not hold (a way of the Wayfinder's, the way into a town, a likeness's look) is drawn by it
  // too, and chosen as itself: the page draws no engine choice by a button of its own (OR-94).
  static View({ choice: c, draw, className, children, marked, quiet, number, variant = 'row', said }: { choice: Choice;
    draw: Draw; className?: string; children?: ReactNode; marked?: boolean; quiet?: boolean; number?: number;
    variant?: 'row' | 'glyph'; said?: string }) {
    const i = draw.index.get(c.id) ?? -1, s = draw.app.state, selected = !!s.keyed && i === s.cursor;
    // Every act commits at a tap or its key (IG-07; OR-185: nothing held), what it spends said on its row beforehand.
    const opens = !!c.children && !/#(talk|look)$/.test(c.id), asks = Act.asks(c);
    const classes = ['act', variant === 'row' ? 'choice-row' : 'act-glyph', className ?? '', selected ? 'sel' : '',
      c.risk ? 'risk' : '', c.grave ? 'grave' : '', c.disabled ? 'shut' : '',
      opens ? draw.open.has(c.id) ? 'opened' : 'opens' : ''].filter(Boolean).join(' ');
    const tags = marked && !quiet ? Act.tags(c) : [];
    // One aside to a row, never two half-said (M22's baseline: "the way yo… · The rats … wil…"): a risk or what cannot
    // be undone says so in place of the plain note.
    const warned = !!c.about && (c.risk || c.grave) && !children && !quiet;
    // The act taken, drawn so while the engine answers.
    const taken = s.pending?.taken === c.id || undefined;
    // Words a player can read, or the row is not drawn (RowWords; the owner, 20 November, P0): a row's own, else its
    // choice's whole words; a glyph (a likeness, the fight's reticle on its card) the words of the act it is the face
    // of, or what it is said to be.
    const words = c.alone?.trim() || Words.shown(c.label);
    if (!(variant === 'glyph' ? RowWords.said(said ?? words) : RowWords.said(children ?? words))) {
      return RowWords.refuse(c.id, 'Act.View');
    }
    return (
      <button type="button" className={classes} data-action="choice" data-choice={c.id} data-act={c.id} data-index={i}
        data-number={number}
        aria-current={selected || undefined} aria-disabled={c.disabled ? true : undefined}
        aria-expanded={opens ? draw.open.has(c.id) : undefined} data-taken={taken} aria-label={said}
        onClick={i >= 0 ? Act.click.bind(null, draw.app) : Act.direct.bind(null, draw.app, c)}>
        {children ?? <><span className="row-label">{Typography.curl(words)}</span>{c.note
          && !warned && <RowAside.View note>{Typography.curl(c.note)}</RowAside.View>}</>}
        {tags.map(m => <span key={m.kind} className={`mark-tag mark-${m.kind}${m.danger ? ` danger-${m.danger}` : ''}`}>
          {Signs.marks[m.kind]}</span>)}
        {c.disabled && !quiet && <span className="why">{Typography.curl(c.disabled)}</span>}
        {warned && <span className="about">{Typography.curl(c.about!)}</span>}
        {asks && s.confirming === c.id && <span className="grave-said" role="alert">
          {Typography.curl(Act.asked(asks, !!c.grave))}</span>}
      </button>
    );
  }
  // What a choice that is asked again says when it is chosen once: what it cannot undo, or how a fight would go.
  // The shared rule (Grave), as every client asks it.
  static asks(c: Choice): string | undefined { return Grave.asks(c); }
  static asked(said: string, grave: boolean): string { return Grave.asked(said, grave); }
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
      <ul {...PageFrame.slot('menu')} className={`acts ${className ?? ''}`}>{choices.map(c => <li key={c.id}>
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
  // The Book's pages in the order their tabs stand, which left and right go through (OR-306: ReaderKeys).
  static readonly backstage: readonly View[] = ['company', 'journal', 'pack', 'story'];
  // Those standing now: the notes and the story only with the journal earned (Surfaces, OR-1244); else the company,
  // and what it carries.
  // The backstage is your character (the owner's playtest of 27 November, OR-1492): one page, what is carried on it
  // with what can be done with each thing, and save and Options; the notes and the story beside it only with the
  // journal earned. Pack (its key, I) opens the same page.
  static pages(app: ReaderApp): readonly View[] {
    const journal = Surfaces.has(app.state.frame?.screen, 'the_journal');
    return Act.backstage.filter(view => view !== 'pack' && (journal || !['journal', 'story'].includes(view)));
  }
  static Sheets({ app }: { app: ReaderApp }) {
    const many = (app.state.frame?.screen.party.length ?? 0) > 1;
    const named: Record<string, [string, string]> = { company: [many ? 'Company' : 'Character', 'c'],
      journal: ['Notes', 'j'], pack: ['Pack', 'i'], story: ['Story', 'h'] };
    const sheets = Act.pages(app).map(view => [view, ...named[view]!] as [View, string, string]);
    // One page has no tabs.
    if (sheets.length < 2) { return null; }
    return (
      <ul {...PageFrame.slot('rail')} className="sheets" aria-label="Books">{sheets.map(([view, label, key]) => <li key={view}><button type="button"
        className="sheet-key" data-action="mode" data-view={view} data-key={key}
        aria-pressed={app.state.view === view}
        onClick={Act.open.bind(null, app)}>{label}<kbd>{key.toUpperCase()}</kbd></button></li>)}</ul>
    );
  }
  // Taken by its id, as the engine named it (data-choice), never by its place in the menu, which may have changed
  // since it was drawn (AT-07 I3: navigation by identity).
  private static click(app: ReaderApp, e: MouseEvent<HTMLButtonElement>) {
    const id = e.currentTarget.dataset.choice, i = app.menu.choices.findIndex(c => c.id === id), choice = app.menu.choices[i];
    if (choice) { app.setState({ cursor: i, keyed: false }); app.choose(choice); }
  }
  private static direct(app: ReaderApp, c: Choice) { app.choose(c); }
  private static open(app: ReaderApp, e: MouseEvent<HTMLButtonElement>) { app.show(e.currentTarget.dataset.view as View); }
}
