import { MathUtils, PerspectiveCamera, Vector2, Vector3 } from 'three';
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
  constructor(element: HTMLElement, private readonly home: Vector2, private readonly still: boolean) {
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
  // Whether a point on the land is well within the view.
  sees(p: Vector2): boolean {
    const v = new Vector3(p.x, 0.4, p.y).project(this.camera);
    return v.z < 1 && Math.abs(v.x) < 0.82 && Math.abs(v.y) < 0.78;
  }
  // What is chosen brought into view only if it is not in it already: framed together with where you are, the view
  // standing off as far as it must for both to be seen, and no further.
  show(p: Vector2, here?: Vector2): void {
    if (this.sees(p)) { return; }
    if (!here) { this.to(p); return; }
    const mid = p.clone().add(here).multiplyScalar(0.5), half = p.distanceTo(here) / 2 + 1.4;
    const need = half / (Math.tan(MathUtils.degToRad(BoardCamera.FOV / 2)) * Math.min(1, this.camera.aspect));
    this.to(mid, Math.max(this.distance, Math.min(need, this.controls.maxDistance)));
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
