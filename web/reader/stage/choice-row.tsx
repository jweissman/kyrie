import type { AnchorHTMLAttributes, ButtonHTMLAttributes, CSSProperties, MouseEvent, ReactNode, Ref } from 'react';
import type { Choice } from '../../../src/ui/choice-list';
import { Act, type Draw } from './act';
import type { Attested } from '../../../src/presentation/attest';
import { Glyphs } from '../creation/glyphs';
import { RowWords } from './row-words';

// The one row every choice is drawn as (Mission 21's design system, proposal step 1: the M20 screens study's
// proposal A): the scene's acts, a place's things that can change the world, a conversation's questions, its leave and
// Trade, and a fight's moves. One indicator at the left in the tone of what it is (or none), its words, a quiet line
// under them, and the number it is pressed by at the right. What it does stays the button's own: an engine choice is
// drawn by Act.View (data-choice, data-index, its number), anything else by a plain button with its data-action.
// Its look is menu.css's alone; the pages lay rows out, they do not style them.
// A row that is no opportunity is one of these, never a colour of its own: nothing in particular (a faint line), the
// option chosen in creation or Options, a fight's blow, and the title's two ways in (the owner's).
export type Plain = 'neutral' | 'chosen' | 'blow' | 'every' | 'knowing';
export interface RowParts {
  // Its indicator: an opportunity's, made only of the glance's witnesses (Attest); or a plain kind; or none.
  indicator?: Attested; plain?: Plain;
  label: ReactNode; aside?: ReactNode; number?: number; extra?: ReactNode;
  // An emblem drawn in ink before its words (a spell's school: see Glyphs), never a tone.
  glyph?: string;
}
export class ChoiceRow {
  static readonly cls = 'choice-row';
  // Each plain kind's fill (menu.css): none of them an Atlas tone but the title's, which is the owner's own.
  private static readonly plains: Record<Plain, string> = { neutral: 'var(--row-neutral)', chosen: 'var(--accent, #d9b46a)',
    blow: 'var(--ember)', knowing: 'var(--tone-blue)',
    every: 'linear-gradient(to bottom, var(--tone-gold), var(--tone-red), var(--tone-blue), var(--tone-green), var(--tone-violet))' };
  // A row's mark from an indicator: it, where it has a tone or a companion; the neutral line under it, or alone.
  static mark(indicator: Attested | undefined): Pick<RowParts, 'indicator' | 'plain'> {
    return { ...indicator ? { indicator } : {}, plain: 'neutral' };
  }
  private static nothing(): void { /* a shut row says why, and does nothing */ }
  // The inside, the same everywhere; the older classes kept beside the new so that what reads them still finds them.
  // Every row has its indicator: its tone's, its plain kind's, or the neutral line (the owner, 24 November, OR-188: a
  // row with none, an arrow at its left instead, had been drawn beside the menu).
  static Parts({ indicator, plain, label, aside, number, extra, glyph }: RowParts) {
    const fill = indicator?.tone ? `var(--tone-${indicator.tone})` : ChoiceRow.plains[plain ?? 'neutral'];
    return <>
      <i className={`prism-bar row-mark${!indicator?.tone && (plain ?? 'neutral') === 'neutral' ? ' neutral' : ''}`}
        style={{ '--prism': fill } as CSSProperties} data-witness={indicator?.witnesses.map(w => w.id).join(' ') || undefined}
        {...indicator?.tone ? { role: 'img', 'aria-label': indicator.words } : { 'aria-hidden': true }} />
      {/* A companion is its icon alone, beside the words, wherever the row's indicator has one (TP-03). */}
      <span className="n row-label">{glyph && <Glyphs.View id={glyph} className="row-glyph" />}{label}
        {indicator?.companion && <Glyphs.View id="companion" className="led-icon" label="could join you" />}</span>
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
    if (!RowWords.said(parts.label)) { return RowWords.refuse(choice.id, 'ChoiceRow.Act'); }
    if (RowWords.signed(parts.label)) { RowWords.unsigned(choice.id, 'ChoiceRow.Act'); }
    return <Act.View choice={choice} draw={draw} quiet={quiet} number={number}
      className={`${ChoiceRow.cls}${className ? ` ${className}` : ''}`}>
      <ChoiceRow.Parts {...parts} glyph={parts.glyph ?? choice.emblem}
        {...drawn !== undefined ? { number: drawn } : {}} /></Act.View>;
  }
  // Anything else that is chosen as a row (a fight's move, Trade): a button with its own data.
  // act: the id of the act it does, where it does one (the action system's mark: data-act); none for what only opens
  // or turns attention (a fight's Abilities, a lens).
  // events: what the row tells its page as the hand comes to it (a fight says what a move does, in its own place).
  // own: the rest of what the row's page gives it (whether it is held to be done, considered, the one chosen before:
  // data-considered, aria-current), spread as given; onClick is then its own or none.
  static Button({ className, data, onClick, expanded, act, events, shut, own, ref, ...parts }: RowParts & {
    className?: string; data: Record<string, string | undefined>; onClick?: (e: MouseEvent<HTMLButtonElement>) => void;
    expanded?: boolean; act?: string; shut?: boolean; own?: ButtonHTMLAttributes<HTMLButtonElement> & Record<string, unknown>;
    ref?: Ref<HTMLButtonElement>;
    events?: Pick<ButtonHTMLAttributes<HTMLButtonElement>, 'onMouseEnter' | 'onMouseLeave' | 'onFocus'> }) {
    const id = act ?? data.choice ?? data.action ?? '';
    if (!RowWords.said(parts.label)) { return RowWords.refuse(id, 'ChoiceRow.Button'); }
    if (RowWords.signed(parts.label)) { RowWords.unsigned(id, 'ChoiceRow.Button'); }
    return <button ref={ref} type="button" data-control="row" className={ChoiceRow.classes(className, shut)} {...ChoiceRow.data(data, act)}
      {...shut ? { 'aria-disabled': true } : {}}
      {...expanded !== undefined ? { 'aria-expanded': expanded } : {}} {...events} {...own}
      {...shut ? { onClick: ChoiceRow.nothing } : onClick ? { onClick } : {}}><ChoiceRow.Parts {...parts} /></button>;
  }
  // A row that is a way out of the game (the encyclopedia, in a new tab): a link drawn as the one row.
  static Link({ className, data, href, own, ...parts }: RowParts & { className?: string;
    data: Record<string, string | undefined>; href: string; own?: AnchorHTMLAttributes<HTMLAnchorElement> & Record<string, unknown> }) {
    if (!RowWords.said(parts.label)) { return RowWords.refuse(data.action ?? href, 'ChoiceRow.Link'); }
    return <a className={ChoiceRow.classes(className)} href={href} {...ChoiceRow.data(data)} {...own}>
      <ChoiceRow.Parts {...parts} /></a>;
  }
  private static classes(className?: string, shut?: boolean): string {
    return `${ChoiceRow.cls}${className ? ` ${className}` : ''}${shut ? ' shut' : ''}`;
  }
  private static data(data: Record<string, string | undefined>, act?: string): Record<string, string> {
    return Object.fromEntries(Object.entries({ ...data, act }).filter(([, v]) => v !== undefined)
      .map(([k, v]) => [`data-${k}`, v!]));
  }
}
