import { useEffect, useState } from 'react';
import type { ReaderApp } from './reader-app';
import { ChoiceRow } from './stage/choice-row';
import { Hold } from './instrument/hold';
import { Typography } from '../../src/presentation/typography';
import { FirstChoice, type Beginning } from '../../src/creation/first-choice';

// How a new game begins (OR-120), asked where the title's ways in stood, under the same name and over the same dark:
// the engine's question and its two rows (FirstChoice), Build a character and Set out now, drawn as the ways in are
// drawn (ChoiceRow: a mark at the left and the words, one line each), held or pressed as they are, and reached by the
// keys at once, the first lit. What the row the hand or the keys are on means is said under them in a sentence, never
// as a second line of the row (the owner, 15 November: no row with a subheader). Escape goes back to the title.
export class BeginMenu {
  // Each row as the engine asks it, and what pressing it does: the page draws these and nothing else, and a spec
  // presses one by its id as the row would (test/small/begin-flow).
  static rows(app: ReaderApp): { id: Beginning; label: string; say: string; go: () => void }[] {
    return FirstChoice.step().cards.map(card => ({ id: card.id, label: card.name, say: card.say ?? card.line ?? '',
      go: app.opening.beginAs.bind(app.opening, card.id) }));
  }
  static View({ app }: { app: ReaderApp }) {
    const step = FirstChoice.step(), rows = BeginMenu.rows(app), [lit, consider] = useState<Beginning>(step.chosen);
    useEffect(() => {
      if (!document.activeElement || document.activeElement === document.body) {
        document.querySelector<HTMLElement>(`[data-action="${step.chosen}"]`)?.focus({ preventScroll: true });
      }
    }, [step.chosen]);
    return <nav className="title-menu begin-menu" aria-label={Typography.plain(step.ask)}>
      <p className="begin-ask">{Typography.curl(step.ask)}</p>
      <ul>{rows.map(row => <li key={row.id}><ChoiceRow.Button className="way-in" data={{ action: row.id }}
        label={row.label} plain={row.id === 'build' ? 'every' : 'neutral'}
        own={{ ...Hold.bind(row.go), 'data-nav': true, 'data-way': row.id,
          'data-considered': lit === row.id || undefined, 'aria-current': lit === row.id || undefined,
          onMouseEnter: consider.bind(null, row.id), onFocus: consider.bind(null, row.id) }} /></li>)}</ul>
      <p className="begin-line" aria-live="polite">{Typography.curl(rows.find(r => r.id === lit)?.say ?? '')}</p>
    </nav>;
  }
}
