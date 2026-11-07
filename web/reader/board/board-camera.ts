import { MathUtils, PerspectiveCamera, Vector2, Vector3 } from 'three';

// A part of the view something lies over, from -1 to 1 across (left to right) and up (bottom to top).
interface Box { x0: number; x1: number; y0: number; y1: number }
import { MapControls } from 'three/examples/jsm/controls/MapControls.js';

// The view over the board: north up and looking well down on the land, as a map is read, over where you are; dragged
// or touched to move about, pinched or wheeled nearer, tilted and turned by two fingers or the right button (to enjoy
// the country from low over it); to a place chosen out of view it glides, or for whoever has asked for less motion
// goes at once. The player's own moving of it, by hand or by the arrow keys, is theirs: a glide under way gives way
// to it. Taken far from the country known, it is drawn back to it, harder the further it goes.
export class BoardCamera {
  // How far from overhead the view looks (about forty-five degrees), how wide, how far off it stands, and how far
  // beyond where you are it looks, so that you stand a little into the nearer half of it.
  private static readonly TILT = 0.8;
  private static readonly FOV = 36;
  private static readonly FAR = 12;
  private static readonly AHEAD = 0.5;
  readonly camera: PerspectiveCamera;
  readonly controls: MapControls;
  private glide?: { from: Vector3; to: Vector3; start: number; near: number; far: number };
  // The country known, as a middle and a reach, past which the view is drawn back.
  private bounds?: { at: Vector2; reach: number };
  // The page the board is on, as it was when the view was made (see dispose).
  private readonly page: Node;
  private readonly listening = new AbortController();
  // What lies over the board on the page: its own tools, and the card that says what is chosen or where you are.
  static readonly covers = '.field-head, .field-tools, .field-map .plan, .field-shut, .world-page.scale-board .focus';
  constructor(private readonly element: HTMLElement, private readonly home: Vector2, private readonly still: boolean) {
    this.page = element.getRootNode();
    const aspect = element.clientWidth / Math.max(1, element.clientHeight), tall = Math.max(1, 1.45 / aspect) ** 0.5;
    this.camera = new PerspectiveCamera(BoardCamera.FOV, aspect, 0.05, 300);
    const look = new Vector3(home.x, 0.4, home.y - BoardCamera.AHEAD), d = BoardCamera.FAR * tall;
    this.camera.position.copy(look).add(new Vector3(0, Math.cos(BoardCamera.TILT) * d, Math.sin(BoardCamera.TILT) * d));
    this.camera.lookAt(look);
    this.controls = new MapControls(this.camera, element);
    Object.assign(this.controls,
      { enableDamping: !still, dampingFactor: 0.12, screenSpacePanning: false, minDistance: 2.5,
      maxDistance: 34, maxPolarAngle: 1.32, minPolarAngle: 0.35, zoomToCursor: true, keyPanSpeed: 22 });
    this.controls.target.copy(look); this.controls.listenToKeyEvents(element); this.controls.update();
    this.controls.addEventListener('start', () => this.stop());
    element.addEventListener('keydown', e => { if (e.key.startsWith('Arrow')) { this.stop(); } },
      { signal: this.listening.signal });
  }
  get distance(): number { return this.camera.position.distanceTo(this.controls.target); }
  // Whether the view is still moving (a glide, or the drag's easing out).
  step(now: number): boolean {
    let moving = false;
    if (this.glide) {
      const g = this.glide, k = Math.min(1, (now - g.start) / 900), e = 1 - (1 - k) ** 3;
      const o = this.camera.position.clone().sub(this.controls.target).setLength(MathUtils.lerp(g.near, g.far, e));
      this.controls.target.lerpVectors(g.from, g.to, e);
      this.camera.position.copy(this.controls.target).add(o);
      if (k >= 1) { this.glide = undefined; }
      moving = true;
    }
    return this.controls.update() || this.held() || moving;
  }
  // The country known, past which the view is drawn back.
  hold(at: Vector2, reach: number): void { this.bounds = { at, reach }; }
  // The view drawn back toward the country known when it has been taken past it: a little of the way at each step
  // (all of it, for whoever has asked for less motion), so that it gives the more the further it is taken.
  private held(): boolean {
    const b = this.bounds, t = this.controls.target;
    if (!b || this.glide) { return false; }
    const off = new Vector2(t.x - b.at.x, t.z - b.at.y), over = off.length() - b.reach;
    if (over <= 0.01) { return false; }
    off.setLength(over * (this.still ? 1 : 0.18));
    t.x -= off.x; t.z -= off.y; this.camera.position.x -= off.x; this.camera.position.z -= off.y;
    return true;
  }
  // Whether a point on the land is well within the view, and not under anything over it.
  sees(p: Vector2, over: Box[] = []): boolean {
    const v = new Vector3(p.x, 0.4, p.y).project(this.camera);
    return v.z < 1 && Math.abs(v.x) < 0.82 && Math.abs(v.y) < 0.78 && !BoardCamera.under(v, over, 0.02);
  }
  // What is chosen brought into view only if it is not in it already: framed together with where you are, the view
  // standing off as far as it must for both to be seen, and no further; and never left under the card that says it
  // (a lone tower heard of, chosen from the Notes, had stood under "You are at Karir": the playtest of 7 November).
  show(p: Vector2, here?: Vector2): void {
    const over = this.covered();
    if (this.sees(p, over)) { return; }
    if (!here) { this.to(this.clear(p, p, this.distance, over)); return; }
    const mid = p.clone().add(here).multiplyScalar(0.5), half = p.distanceTo(here) / 2 + 1.4;
    const need = half / (Math.tan(MathUtils.degToRad(BoardCamera.FOV / 2)) * Math.min(1, this.camera.aspect));
    const far = Math.max(this.distance, Math.min(need, this.controls.maxDistance));
    this.to(this.clear(p, mid, far, over), far);
  }
  // The parts of the view covered by what lies over the board.
  private covered(): Box[] {
    const r = this.element.getBoundingClientRect();
    if (!r.width || !r.height || typeof document === 'undefined') { return []; }
    return [...document.querySelectorAll(BoardCamera.covers)].map(e => e.getBoundingClientRect())
      .filter(b => b.width && b.height).map(b => ({ x0: (b.left - r.left) / r.width * 2 - 1,
        x1: (b.right - r.left) / r.width * 2 - 1, y0: 1 - (b.bottom - r.top) / r.height * 2,
        y1: 1 - (b.top - r.top) / r.height * 2 }));
  }
  // The box a point is under, or too near the left of to have its name read (a chosen place's name is to the right
  // of its sign: see BoardLabels).
  private static under(v: Vector3, over: Box[], margin: number): Box | undefined {
    return over.find(b => v.x > b.x0 - margin - BoardCamera.NAME && v.x < b.x1 + margin && v.y > b.y0 - margin
      && v.y < b.y1 + margin);
  }
  // About how much of the view a place's name takes, across.
  private static readonly NAME = 0.25;
  // Where to look so that a point is clear of what covers the view: looking at the target given, unless the point
  // would be under something there; then moved the least way that brings it out beside it (left of a card at the
  // right, above one along the foot), along the ground as the view is turned.
  private clear(p: Vector2, target: Vector2, far: number, over: Box[]): Vector2 {
    const at = this.seen(p, target, far), box = BoardCamera.under(at, over, 0.06);
    if (!box) { return target; }
    const m = 0.1, left = box.x0 - m - BoardCamera.NAME;
    const moves = [[left - at.x, 0], [box.x1 + m - at.x, 0], [0, box.y0 - m - at.y], [0, box.y1 + m - at.y]]
      .filter(([dx, dy]) => Math.abs(at.x + dx!) < 0.85 && Math.abs(at.y + dy!) < 0.85)
      .sort((a, b) => Math.hypot(a[0]!, a[1]!) - Math.hypot(b[0]!, b[1]!));
    const [dx, dy] = moves[0] ?? [0, 0];
    // How the point moves on the view as the target moves a step to the view's right and a step away along the
    // ground; the step that moves it as wanted, from those two.
    const right = new Vector3(1, 0, 0).applyQuaternion(this.camera.quaternion).setY(0).normalize();
    const ahead = this.camera.getWorldDirection(new Vector3()).setY(0).normalize();
    const a = this.seen(p, target.clone().add(new Vector2(right.x, right.z)), far).sub(at);
    const b = this.seen(p, target.clone().add(new Vector2(ahead.x, ahead.z)), far).sub(at);
    const det = a.x * b.y - a.y * b.x;
    if (Math.abs(det) < 1e-6) { return target; }
    const s = (dx! * b.y - dy! * b.x) / det, t = (a.x * dy! - a.y * dx!) / det;
    return target.clone().add(new Vector2(right.x * s + ahead.x * t, right.z * s + ahead.z * t));
  }
  // Where a point would be on the view, looking at a target from as far off as given, the view turned as it is.
  private seen(p: Vector2, target: Vector2, far: number): Vector3 {
    const eye = this.camera.clone(), off = this.camera.position.clone().sub(this.controls.target).setLength(far);
    eye.position.set(target.x, 0.4, target.y).add(off); eye.updateMatrixWorld(true);
    return new Vector3(p.x, 0.4, p.y).project(eye);
  }
  to(p: Vector2, far = this.distance): void {
    const at = new Vector3(p.x, 0.4, p.y);
    if (this.still) {
      const o = this.camera.position.clone().sub(this.controls.target).setLength(far);
      this.controls.target.copy(at); this.camera.position.copy(at).add(o);
      return;
    }
    this.glide = { from: this.controls.target.clone(), to: at, start: performance.now(), near: this.distance, far };
  }
  back(): void { this.to(new Vector2(this.home.x, this.home.y - BoardCamera.AHEAD)); }
  // The glide given up where it has got to.
  stop(): void { this.glide = undefined; }
  zoom(by: number): void {
    const o = this.camera.position.clone().sub(this.controls.target);
    o.setLength(MathUtils.clamp(o.length() * by, this.controls.minDistance, this.controls.maxDistance));
    this.camera.position.copy(this.controls.target).add(o);
  }
  fit(width: number, height: number): void {
    this.camera.aspect = width / Math.max(1, height); this.camera.updateProjectionMatrix();
  }
  // The controls stopped. They listen on the whole page for the Control key, and look for the page again when they
  // stop; a board already taken off the page finds none there, and would leave them listening, and the whole board
  // held, for as long as the page is open. So the page they listened on is told here as well.
  dispose(): void {
    const c = this.controls as unknown as Record<'_interceptControlDown' | '_interceptControlUp', EventListener>;
    this.controls.dispose(); this.listening.abort();
    this.page.removeEventListener('keydown', c._interceptControlDown, { capture: true });
    this.page.removeEventListener('keyup', c._interceptControlUp, { capture: true });
  }
}
