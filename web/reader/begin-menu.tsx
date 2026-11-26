import { useEffect, useState } from 'react';
import type { ReaderApp } from './reader-app';
import { ChoiceRow } from './stage/choice-row';
import { PressGuard } from './press-guard';
import { Typography } from '../../src/presentation/typography';
import type { Beginning } from '../../src/creation/first-choice';
import { OpeningPages, type EnginePage } from '../../src/creation/opening-pages';

// A question the title's own dark asks where its rows stood (OR-120, OR-1072, OR-1072): New Game (OpeningPages.begin:
// Create a character, A new life at once, where a country is kept the World it begins in, and Back), or the game put
// away by Quit (OpeningPages.closed: what is kept said under it, and Back to the title). The engine's page, its
// question and its rows, drawn as the title's are (ChoiceRow: a mark at the left and the words, one line each, what it
// is now beside a row that has one), taken at a press, never held (OR-169), and reached by the keys at once, the first
// lit. What the row the hand or the keys are on means is said under them in a sentence, never as a second line of the
// row (the owner, 15 November: no row with a subheader); a page with a line of its own says that instead. Escape goes
// back to the title.
export class BeginMenu {
  // The page asked now: New Game's, or the closing page's.
  static page(app: ReaderApp): EnginePage {
    return app.state.phase === 'closed' ? OpeningPages.closed(!!app.opening.kept())
      : OpeningPages.begin(app.opening.where());
  }
  // Each row as the engine asks it, and what pressing it does: the page draws these and nothing else, and a spec
  // presses one by its id as the row would (test/begin-flow).
  static rows(app: ReaderApp): { id: string; label: string; say: string; aside?: string; said?: string; every: boolean;
    go: () => void }[] {
    const opening = app.opening;
    const go = (id: string): (() => void) => id === 'back' || id === 'title' ? opening.title : opening.beginAs.bind(opening, id as Beginning);
    return BeginMenu.page(app).rows.map(row => ({ id: row.id, label: row.label, say: row.say ?? '',
      ...row.aside ? { aside: row.aside } : {}, ...row.said ? { said: row.said } : {}, every: !!row.every,
      go: go(row.id) }));
  }
  static View({ app }: { app: ReaderApp }) {
    const step = BeginMenu.page(app), rows = BeginMenu.rows(app), [lit, consider] = useState(step.chosen);
    useEffect(() => {
      if (!document.activeElement || document.activeElement === document.body) {
        document.querySelector<HTMLElement>(`[data-action="${step.chosen}"]`)?.focus({ preventScroll: true });
      }
    }, [step.chosen]);
    const line = step.line ?? rows.find(r => r.id === lit)?.say ?? '';
    const cls = `title-menu begin-menu${step.id === 'closed' ? ' closed-menu' : ''}`;
    return <nav className={cls} aria-label={Typography.plain(step.ask)}>
      <p className="begin-ask">{Typography.curl(step.ask)}</p>
      <ul>{rows.map(row => <li key={row.id}><ChoiceRow.Button className="way-in" data={{ action: row.id }}
        label={row.label} plain={row.every ? 'every' : 'neutral'} {...row.aside ? { aside: row.aside } : {}}
        own={{ ...PressGuard.once(row.go), 'data-nav': true, 'data-way': row.id,
          ...row.said ? { 'aria-label': row.said } : {},
          'data-considered': lit === row.id || undefined, 'aria-current': lit === row.id || undefined,
          onMouseEnter: consider.bind(null, row.id), onFocus: consider.bind(null, row.id) }} /></li>)}</ul>
      <p className="begin-line" aria-live="polite">{Typography.curl(line)}</p>
    </nav>;
  }
}
