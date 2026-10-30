// A press on the board: where it was put down, whether it has moved since, and the place whose name or sign it was put
// down on, if any.
interface Press { x: number; y: number; moved: boolean; id?: string }
// The presses on the board told apart. A tap (one finger, or the main button, put down and taken up again where it
// was) chooses what is under it; a drag, a pinch or a turn with two fingers, or a press of the other buttons, moves
// the view and chooses nothing, however it ends.
export class BoardPresses {
  private readonly held = new Map<number, Press>();
  // Whether more than one finger has been down since all were last taken up.
  private many = false;
  // Put down (once: a press begun on a name and handed on to the land is the same press).
  down(e: PointerEvent, id?: string): void {
    if (this.held.has(e.pointerId)) { return; }
    this.held.set(e.pointerId, { x: e.clientX, y: e.clientY, moved: e.button !== 0, id });
    this.many ||= this.held.size > 1;
  }
  move(e: PointerEvent): void {
    const p = this.held.get(e.pointerId);
    if (p && Math.hypot(e.clientX - p.x, e.clientY - p.y) >= 6) { p.moved = true; }
  }
  // Taken up: the press, if it was a tap.
  up(e: PointerEvent): Press | undefined {
    const p = this.held.get(e.pointerId), tap = p && !p.moved && !this.many && e.button === 0 ? p : undefined;
    this.cancel(e);
    return tap;
  }
  // Taken away (the browser has the touch for itself): forgotten, and chooses nothing.
  cancel(e: PointerEvent): void {
    this.held.delete(e.pointerId);
    if (!this.held.size) { this.many = false; }
  }
}
