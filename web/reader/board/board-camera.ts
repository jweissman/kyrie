import { MathUtils, PerspectiveCamera, Vector2, Vector3 } from 'three';
import { MapControls } from 'three/examples/jsm/controls/MapControls.js';

// The view over the board: low over the land as from a hill, toward where you are; dragged or touched to move about,
// pinched or wheeled nearer, turned by two fingers or the right button; to a place chosen it glides, or for whoever
// has asked for less motion goes at once. The player's own moving of it, by hand or by the arrow keys, is theirs: a
// glide under way gives way to it.
export class BoardCamera {
  readonly camera: PerspectiveCamera;
  readonly controls: MapControls;
  private glide?: { from: Vector3; to: Vector3; start: number };
  // The page the board is on, as it was when the view was made (see dispose).
  private readonly page: Node;
  private readonly listening = new AbortController();
  constructor(element: HTMLElement, private readonly home: Vector2, private readonly still: boolean) {
    this.page = element.getRootNode();
    const aspect = element.clientWidth / Math.max(1, element.clientHeight), tall = Math.max(1, 1.45 / aspect) ** 0.5;
    this.camera = new PerspectiveCamera(32, aspect, 0.05, 300);
    const look = new Vector3(home.x, 0.4, home.y - 1.6), d = 13 * tall;
    this.camera.position.copy(look).add(new Vector3(0, Math.cos(1.13) * d, Math.sin(1.13) * d));
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
      const k = Math.min(1, (now - this.glide.start) / 900), o = this.camera.position.clone().sub(this.controls.target);
      this.controls.target.lerpVectors(this.glide.from, this.glide.to, 1 - (1 - k) ** 3);
      this.camera.position.copy(this.controls.target).add(o);
      if (k >= 1) { this.glide = undefined; }
      moving = true;
    }
    return this.controls.update() || moving;
  }
  to(p: Vector2): void {
    const at = new Vector3(p.x, 0.4, p.y);
    if (this.still) {
      const o = this.camera.position.clone().sub(this.controls.target);
      this.controls.target.copy(at); this.camera.position.copy(at).add(o);
      return;
    }
    this.glide = { from: this.controls.target.clone(), to: at, start: performance.now() };
  }
  back(): void { this.to(new Vector2(this.home.x, this.home.y - 1.6)); }
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
