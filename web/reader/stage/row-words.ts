import { isValidElement, type ReactNode } from 'react';

// Every row that can be chosen says what it is in words a player can read (the owner, 20 November, P0: "the game
// displayed a selectable menu action with no visible text … the action for inviting my brother to join the company.
// The action apparently executed"; "Invalid or missing labels must be detected before display, with a clear
// diagnostic identifying the originating action and projection stage. A broken label must not silently produce a blank
// clickable row"). The one gate every row of the page passes before it is drawn (ChoiceRow, Act.View): a row with no
// words is not drawn, and is said, by the act it would have done and where it was being drawn; under test it throws.
export interface Refused { act: string; stage: string }
export class RowWords {
  // Under test, a row with no words fails the spec that draws it (set by the specs that render the page).
  static strict = false;
  static readonly refused: Refused[] = [];
  // The words a row's label says that can be seen: its text, never what is only for a reader of the page (sr-only),
  // nor a glyph (a glyph draws no letters).
  static of(node: ReactNode): string {
    if (node === null || node === undefined || typeof node === 'boolean') { return ''; }
    if (typeof node === 'string' || typeof node === 'number') { return String(node); }
    if (Array.isArray(node)) { return node.map(n => RowWords.of(n as ReactNode)).join(''); }
    if (!isValidElement(node)) { return ''; }
    // What is hidden from a reader of the page (aria-hidden) is still seen; what is only for one (sr-only) is not.
    const props = node.props as { className?: string; children?: ReactNode; label?: ReactNode; text?: ReactNode };
    if (typeof props.className === 'string' && /\bsr-only\b/.test(props.className)) { return ''; }
    // A component drawn inside a row (ChoiceRow.Parts, a told line) says what its words are by its label or text.
    return RowWords.of(typeof node.type === 'function' ? props.label ?? props.text ?? props.children : props.children);
  }
  // Whether it says anything a player can read: a letter or a digit, not only spaces and marks.
  static said(node: ReactNode): boolean { return /[\p{L}\p{N}]/u.test(RowWords.of(node)); }
  // A sign of its own in a row's words: an element that says no letters and is drawn only to be seen (hidden from a
  // reader of the page) or is an icon, an arrow, a sign or a glyph. A row's one icon is its glyph, given as such (the
  // owner, 24 November, OR-188: an arrow had stood in a row's words where its indicator should be).
  static signed(node: ReactNode): boolean {
    if (Array.isArray(node)) { return node.some(n => RowWords.signed(n as ReactNode)); }
    if (!isValidElement(node)) { return false; }
    const props = node.props as { className?: string; children?: ReactNode; 'aria-hidden'?: unknown };
    const decor = props['aria-hidden'] === true || props['aria-hidden'] === 'true'
      || (typeof props.className === 'string' && /\b[\w-]*(sign|arrow|icon|glyph)[\w-]*\b/.test(props.className));
    if (decor && !RowWords.said(node)) { return true; }
    return typeof node.type !== 'function' && RowWords.signed(props.children);
  }
  // Said (in play, the row still drawn) or refused (under test): a row's words carrying a sign of their own.
  static unsigned(act: string, stage: string): void {
    const said = `A row's words carried a sign of their own: ${act || '(no act)'}, at ${stage}`;
    RowWords.refused.push({ act, stage });
    if (RowWords.strict) { throw new Error(said); }
    console.error(said);
  }
  // Refused: not drawn, and said (the console's, and the specs': RowWords.refused), naming the act and the stage.
  static refuse(act: string, stage: string): null {
    const r = { act, stage };
    RowWords.refused.push(r);
    const said = `A row with no words was not drawn: ${act || '(no act)'}, at ${stage}`;
    if (RowWords.strict) { throw new Error(said); }
    console.error(said);
    return null;
  }
}
