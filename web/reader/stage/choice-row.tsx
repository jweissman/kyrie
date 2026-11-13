import type { CSSProperties, MouseEvent, ReactNode } from 'react';
import type { Choice } from '../../../src/ui/choice-list';
import { Act, type Draw } from './act';

// The one row every choice is drawn as (Mission 21's design system, proposal step 1: the M20 screens study's
// proposal A): the scene's acts, a place's things that can change the world, a conversation's questions, its leave and
// Trade, and a fight's moves. One indicator at the left in the tone of what it is (or none), its words, a quiet line
// under them, and the number it is pressed by at the right. What it does stays the button's own: an engine choice is
// drawn by Act.View (data-choice, data-index, its number), anything else by a plain button with its data-action.
// Its look is menu.css's alone; the pages lay rows out, they do not style them.
export interface RowParts {
  // The indicator's fill: a tone (var(--tone-…)) or an OKLab prism; none, no indicator.
  mark?: string; markLabel?: string; markClass?: string;
  label: ReactNode; aside?: ReactNode; number?: number; extra?: ReactNode;
}
export class ChoiceRow {
  static readonly cls = 'choice-row';
  // The indicator of a row that is nothing in particular: a faint neutral line (menu.css), not a colour.
  static readonly neutral = 'var(--row-neutral)';
  // The inside, the same everywhere; the older classes kept beside the new so that what reads them still finds them.
  static Parts({ mark, markLabel, markClass, label, aside, number, extra }: RowParts) {
    return <>
      {mark && <i className={`prism-bar row-mark${markClass ? ` ${markClass}` : ''}`}
        style={{ '--prism': mark } as CSSProperties} {...markLabel ? { role: 'img', 'aria-label': markLabel } : { 'aria-hidden': true }} />}
      <span className="n row-label">{label}</span>
      {aside && <span className="why-said row-aside">{aside}</span>}
      {extra}
      {number !== undefined && <kbd className="key row-key" aria-hidden="true">{number}</kbd>}
    </>;
  }
  // An engine choice as a row. number: the key it is pressed by where that is held apart from its place among the
  // choices (a conversation's; see Act.View); shown: a number drawn only (the scene's 1, 2, 3, its place).
  static Act({ choice, draw, className, number, shown, quiet, ...parts }: Omit<RowParts, 'number'> & { choice: Choice;
    draw: Draw; className?: string; quiet?: boolean; number?: number; shown?: number }) {
    const drawn = number ?? shown;
    return <Act.View choice={choice} draw={draw} quiet={quiet} number={number}
      className={`${ChoiceRow.cls}${className ? ` ${className}` : ''}`}>
      <ChoiceRow.Parts {...parts} {...drawn !== undefined ? { number: drawn } : {}} /></Act.View>;
  }
  // Anything else that is chosen as a row (a fight's move, Trade): a button with its own data.
  // act: the id of the act it does, where it does one (the action system's mark: data-act); none for what only opens
  // or turns attention (a fight's Abilities, a lens).
  static Button({ className, data, onClick, expanded, act, ...parts }: RowParts & { className?: string;
    data: Record<string, string | undefined>; onClick: (e: MouseEvent<HTMLButtonElement>) => void; expanded?: boolean;
    act?: string }) {
    const attrs = Object.fromEntries(Object.entries({ ...data, act }).filter(([, v]) => v !== undefined)
      .map(([k, v]) => [`data-${k}`, v]));
    return <button type="button" className={`${ChoiceRow.cls}${className ? ` ${className}` : ''}`} {...attrs}
      {...expanded !== undefined ? { 'aria-expanded': expanded } : {}} onClick={onClick}><ChoiceRow.Parts {...parts} /></button>;
  }
}
