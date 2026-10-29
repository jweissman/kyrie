import { MathUtils, PerspectiveCamera, Vector2, Vector3 } from 'three';
import { MapControls } from 'three/examples/jsm/controls/MapControls.js';

// The view over the board: low over the land as from a hill, toward where you are; dragged or touched to move about,
// pinched or wheeled nearer, turned by two fingers or the right button; to a place chosen it glides, or for whoever
// has asked for less motion goes at once.
export class BoardCamera {
  readonly camera: PerspectiveCamera;
  readonly controls: MapControls;
  private glide?: { from: Vector3; to: Vector3; start: number };
  constructor(element: HTMLElement, private readonly home: Vector2, private readonly still: boolean) {
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
  zoom(by: number): void {
    const o = this.camera.position.clone().sub(this.controls.target);
    o.setLength(MathUtils.clamp(o.length() * by, this.controls.minDistance, this.controls.maxDistance));
    this.camera.position.copy(this.controls.target).add(o);
  }
  fit(width: number, height: number): void {
    this.camera.aspect = width / Math.max(1, height); this.camera.updateProjectionMatrix();
  }
  dispose(): void { this.controls.dispose(); }
}
