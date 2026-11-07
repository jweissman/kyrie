import { afterAll, beforeAll, describe, expect, it } from 'bun:test';
import { Scrolled } from '../web/reader/stage/scrolled';

// The fresh playtest of 7 November read a notice and saw only the notice, its three new aims under the foot of the
// column; said a rite and missed the aim it gave; and slept at an inn without seeing that both had gained a level. What
// the player's own act did is brought into view in the column that holds it: the whole of it where there is room, clear
// of the fade at the column's foot; its beginning where there is not; and only that column is moved.
// A column, or what was told in it, at a place on the screen as the column now lies; a column scrolls unless it is
// said to be hidden.
class Box {
  scrollTop = 0;
  constructor(readonly top: number, readonly height: number, readonly parentElement: Box | null = null,
    readonly scrollHeight = height) {}
  overflowY = 'auto';
  get clientHeight() { return this.height; }
  getBoundingClientRect() { return { top: this.top, bottom: this.top + this.height, height: this.height }; }
  static column(top: number, height: number, scrollHeight: number, scrollTop = 0): Box {
    const box = new Box(top, height, null, scrollHeight);
    box.scrollTop = scrollTop;
    return box;
  }
  static reveal(told: Box) { Scrolled.reveal(told as unknown as HTMLElement); }
}
const style = globalThis.getComputedStyle;
beforeAll(() => { globalThis.getComputedStyle = ((el: Box) => ({ overflowY: el.overflowY })) as never; });
afterAll(() => { globalThis.getComputedStyle = style; });

describe('what the player just did', () => {
  it('is brought up whole from under the foot of the column, clear of its fade', () => {
    const page = new Box(0, 800), col = new Box(100, 600, page, 1000);
    page.overflowY = 'hidden';
    Box.reveal(new Box(500, 300, col));
    expect([col.scrollTop, page.scrollTop]).toEqual([100 + Scrolled.fade, 0]);
  });
  it('never past its own beginning', () => {
    const col = Box.column(100, 600, 1000);
    Box.reveal(new Box(120, 590, col));
    expect(col.scrollTop).toBe(20);
  });
  it('from its beginning where it is longer than the column', () => {
    const col = Box.column(100, 600, 2000);
    Box.reveal(new Box(400, 900, col));
    expect(col.scrollTop).toBe(300);
  });
  it('is left as it is when it is in view already', () => {
    const col = Box.column(100, 600, 1000, 40);
    Box.reveal(new Box(200, 200, col));
    expect(col.scrollTop).toBe(40);
  });
});
