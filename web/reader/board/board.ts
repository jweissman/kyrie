import {
  ACESFilmicToneMapping, type Material, MeshStandardMaterial, PCFShadowMap, Raycaster, Scene, SRGBColorSpace, Vector2,
    Vector3,
  WebGLRenderer,
} from 'three';
import { BoardCamera } from './board-camera';
import { BoardFlora } from './board-flora';
import { BoardGround } from './board-ground';
import { BoardKit } from './board-kit';
import { BoardKnowing } from './board-knowing';
import { BoardLabels } from './board-labels';
import { BoardLook } from './board-look';
import { BoardPaths } from './board-paths';
import { BoardPlaces } from './board-places';
import { BoardTiles } from './board-tiles';
import { BoardTowns } from './board-towns';
import type { BoardApi, BoardHooks, BoardLand } from './board-types';
import { HexGrid } from './hex-grid';
import { Scatter } from './scatter';

// The map's board (Mission 18, the owner's addendum): the country as a table of hex tiles in three dimensions, lit at
// dusk, the unknown under mist. Drawn only when something has changed (the mist drifting a few times a second when
// nothing has), its shadows cast once, its lamps glows rather than lights. A hex chosen, a place chosen, where you are
// and where you are bound are what it gives back and shows; going anywhere is the page's.
export class Board implements BoardApi {
  private readonly renderer = new WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
  private readonly scene = new Scene();
  private readonly grid: HexGrid;
  private readonly ground: BoardGround;
  private readonly knowing: BoardKnowing;
  private readonly look: BoardLook;
  private readonly paths: BoardPaths;
  private readonly tiles: BoardTiles;
  private readonly scatters: Scatter[];
  private readonly standing = new Map<number, { y: number }[]>();
  private readonly places: BoardPlaces;
  private readonly labels: BoardLabels;
  private readonly view: BoardCamera;
  private readonly kit: Record<string, Material>;
  private readonly watch: ResizeObserver;
  private readonly began = performance.now();
  private dirty = true;
  private drawn = 0;
  private frame = 0;
  private chosen?: string;
  private pointed?: number;
  private down?: [number, number];
  static mount(host: HTMLElement, land: BoardLand, hooks: BoardHooks,
    still: boolean): Board { return new Board(host, land, hooks, still); }
  constructor(private readonly host: HTMLElement, private readonly land: BoardLand, private readonly hooks: BoardHooks,
    private readonly still: boolean) {
    this.grid = new HexGrid(land.width, land.height); this.ground = new BoardGround(this.grid, land);
    this.knowing = new BoardKnowing(this.grid, land.known, land.key, land.here);
    if (still) { this.knowing.settle(); }
    this.renderer.setPixelRatio(Math.min(1.5, devicePixelRatio));
    this.renderer.setSize(host.clientWidth, host.clientHeight);
    Object.assign(this.renderer,
      { toneMapping: ACESFilmicToneMapping, toneMappingExposure: 1.3, outputColorSpace: SRGBColorSpace });
    Object.assign(this.renderer.shadowMap, { enabled: true, type: PCFShadowMap, autoUpdate: false });
    this.renderer.domElement.tabIndex = 0;
    this.renderer.domElement.setAttribute('aria-label', 'The country as far as you know it');
    host.appendChild(this.renderer.domElement);
    this.look = new BoardLook(this.scene, this.grid, this.knowing);
    const towns = land.marks.filter(m => m.town);
    this.paths = new BoardPaths(this.grid, land, new Set(towns.map(t => t.cell)));
    this.tiles = new BoardTiles(this.scene, this.ground, this.look.water(),
      { rivers: this.paths.riverPoints, roads: this.paths.roadPoints });
    const flora = new BoardFlora(this.ground, { rivers: this.paths.riverPoints, roads: this.paths.roadPoints },
      towns.map(t => t.cell));
    this.scatters = Object.entries(flora.spots).map(([kind, spots]) => new Scatter(this.scene, BoardKit.make(kind),
      spots, (x, z) => this.ground.at(x, z)));
    this.kit = { river: Object.assign(this.look.water(), { side: 2, polygonOffset: true, polygonOffsetFactor: -2 }),
      road: new MeshStandardMaterial({ color: '#a08a64', roughness: 1, side: 2, polygonOffset: true,
      polygonOffsetFactor: -2 }), verge: new MeshStandardMaterial({ color: '#5a4b36', roughness: 1, transparent: true,
        opacity: 0.55,
      depthWrite: false, side: 2, polygonOffset: true, polygonOffsetFactor: -1 }) };
    this.places = new BoardPlaces(this.scene, this.ground, this.look);
    this.labels = new BoardLabels(host, hooks, c => { this.view.to(this.grid.centres[c]!); this.dirty = true; });
    this.view = new BoardCamera(this.renderer.domElement, this.grid.centres[land.here ?? towns[0]?.cell ?? 0]!, still);
    this.furnish(new BoardTowns(this.scene, this.ground, this.look, towns));
    this.look.mist(0.3, 0.05, 0.62, 0.31); this.look.mist(0.75, 0.03, 0.22, 0.77);
    this.know();
    this.watch = new ResizeObserver(() => this.fit()); this.watch.observe(host);
    this.listen();
    this.frame = requestAnimationFrame(t => this.tick(t));
  }
  private furnish(towns: BoardTowns): void {
    for (const [c, gs] of towns.groups) { this.standing.set(c, gs.map(g => g.position)); }
    for (const m of this.land.marks) {
      const at = new Vector3(this.grid.centres[m.cell]!.x, this.ground.levels[m.cell]!, this.grid.centres[m.cell]!.y);
      if (m.town) { this.labels.town(m, at.clone().setY(at.y + 0.5)); continue; }
      const g = this.places.place(m); this.scene.add(g); this.stand(m.cell, g.position);
      this.labels.sign(m, at.clone().setY(at.y + (m.kind === 'tower' ? 0.78 : 0.36)));
    }
    if (this.land.here !== undefined) {
      const lamp = this.places.lantern(this.land.here); this.scene.add(lamp); this.stand(this.land.here, lamp.position);
      const p = this.grid.centres[this.land.here]!;
      this.labels.here(new Vector3(p.x, this.ground.levels[this.land.here]! + 0.26, p.y));
    }
  }
  private stand(c: number, p: { y: number }): void { this.standing.set(c, [...this.standing.get(c) ?? [], p]); }
  // Knowledge as it stands: the tiles standing up, what stands on them with them, the rivers and roads laid over them.
  private know(): void {
    this.tiles.update(this.knowing);
    for (const s of this.scatters) { s.place(c => [this.tiles.lift(c), this.tiles.lift(c) > -0.45]); }
    for (const [c, ps] of this.standing) {
      for (const p of ps) { p.y = this.ground.levels[c]! + Math.max(-4, this.tiles.lift(c)); }
    }
    this.paths.lay(this.scene, (x, z) => this.ground.at(x, z), c => this.tiles.lift(c) > -0.001, this.kit);
    if (this.land.here !== undefined) { this.tiles.mark('here', this.land.here); }
    this.renderer.shadowMap.needsUpdate = true; this.dirty = true;
  }
  show(chosen?: string, bound?: string): void {
    this.chosen = chosen;
    const cell = this.cellOf(chosen ?? bound);
    this.tiles.mark('dest', cell === this.land.here ? undefined : cell);
    const here = this.land.here;
    this.places.bound(here !== undefined && cell !== undefined && cell !== here ? this.grid.route(here, cell,
      (a, b) => this.ground.minutes(a, b),
        c => !this.ground.wet(c) && this.knowing.now[c]! > 0.2) : [], c => this.tiles.lift(c));
    if (cell !== undefined && chosen) { this.view.to(this.grid.centres[cell]!); }
    this.dirty = true;
  }
  zoom(by: number): void { this.view.zoom(by); this.dirty = true; }
  home(): void { this.view.back(); this.dirty = true; }
  dispose(): void {
    cancelAnimationFrame(this.frame); this.watch.disconnect(); this.view.dispose(); this.renderer.dispose();
    this.renderer.domElement.remove(); this.labels.layer.remove();
  }
  private cellOf(id?: string): number | undefined {
    if (!id) { return undefined; }
    const hex = /^hex:(\d+)$/.exec(id)?.[1];
    return hex !== undefined ? Number(hex) : this.land.marks.find(m => m.id === id)?.cell;
  }
  private fit(): void {
    this.renderer.setSize(this.host.clientWidth, this.host.clientHeight);
    this.view.fit(this.host.clientWidth, this.host.clientHeight);
    this.dirty = true;
  }
  // The known hex under the pointer, if any.
  private under(e: PointerEvent): number | undefined {
    const r = this.renderer.domElement.getBoundingClientRect(), ray = new Raycaster();
    ray.setFromCamera(new Vector2(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1),
      this.view.camera);
    const hit = ray.intersectObjects(this.tiles.pick, false)[0],
      c = hit ? this.grid.cellAt(hit.point.x, hit.point.z) : undefined;
    return c !== undefined && this.knowing.known(c) ? c : undefined;
  }
  private listen(): void {
    const el = this.renderer.domElement;
    el.addEventListener('pointerdown', e => { this.down = [e.clientX, e.clientY]; });
    el.addEventListener('pointerup', e => {
      const c = this.down && Math.hypot(e.clientX - this.down[0],
        e.clientY - this.down[1]) < 6 ? this.under(e) : undefined;
      this.down = undefined;
      if (c !== undefined) { this.hooks.choose(this.land.marks.find(m => m.cell === c && m.town)?.id ?? `hex:${c}`); }
    });
    el.addEventListener('pointermove', e => {
      if (e.pointerType !== 'mouse' || e.buttons) { return; }
      const c = this.under(e);
      if (c !== this.pointed) { this.pointed = c; this.tiles.mark('hover', c); this.dirty = true; }
    });
    this.view.controls.addEventListener('change', () => { this.dirty = true; });
  }
  private tick(now: number): void {
    const t = (now - this.began) / 1000;
    if (this.view.step(now)) { this.dirty = true; }
    if (this.knowing.arriving) { this.knowing.arrive(t); this.know(); }
    if (this.dirty || (!this.still && now - this.drawn > 120)) {
      this.look.air(this.view.distance, this.still ? 40 : t);
      this.renderer.render(this.scene, this.view.camera);
      if (this.dirty) { this.labels.place(this.view.camera, [this.host.clientWidth, this.host.clientHeight],
        [this.chosen, this.pointed]); }
      this.dirty = false; this.drawn = now;
    }
    this.frame = requestAnimationFrame(x => this.tick(x));
  }
}
