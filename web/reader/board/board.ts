import {
  ACESFilmicToneMapping, type BufferGeometry, type Intersection, type Material, type Mesh, type Object3D,
  PCFShadowMap, Raycaster, Scene, type ShaderMaterial, SRGBColorSpace, type Texture, Vector2, Vector3, WebGLRenderer,
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
import { BoardPresses } from './board-presses';
import { BoardTiles } from './board-tiles';
import { BoardTowns } from './board-towns';
import { BoardUnder } from './board-under';
import type { BoardApi, BoardHooks, BoardLand } from './board-types';
import { HexGrid } from './hex-grid';
import { Scatter } from './scatter';

// The map's board (Mission 18, the owner's addendum): the country as a table of hex tiles in three dimensions, lit at
// dusk, the unknown under mist. Drawn only when something has changed (the mist drifting a few times a second when
// nothing has), its shadows cast again only when what casts them has moved, its lamps glows rather than lights. A
// hex chosen, a place chosen, where you are and where you are bound are what it gives back and shows, where you are
// bound kept apart from what is only chosen; going anywhere is the page's.
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
  // What stands on a hex, kept with it: a town's church and wall, a place, your lantern; and all of them, for what is
  // pointed at to be found among (see under).
  private readonly standing = new Map<number, Object3D[]>();
  private readonly models: Object3D[] = [];
  private readonly places: BoardPlaces;
  private readonly labels: BoardLabels;
  private readonly view: BoardCamera;
  private readonly river: ShaderMaterial;
  private readonly watch: ResizeObserver;
  // When newly known country began to arrive: once the board is made and first drawn, so that neither is counted in
  // it and the nearest hexes are seen to rise first, however long the making took.
  private began?: number;
  // Whether the shadows are owed a casting (something has moved since), and when they were last cast.
  private owed = false;
  private shaded = -Infinity;
  // What the board listens with on its canvas, all stopped at once when it is put away.
  private readonly listening = new AbortController();
  private lost?: ReturnType<typeof setTimeout>;
  private readonly presses = new BoardPresses();
  // What the arrow keys do over the land, told to whoever reads the page, and shown while the land has the keys.
  private readonly keys = document.createElement('p');
  private dirty = true;
  private drawn = 0;
  private frame = 0;
  private chosen?: string;
  private bound?: string;
  private pointed?: number;
  static mount(host: HTMLElement, land: BoardLand, hooks: BoardHooks,
    still: boolean): Board { return new Board(host, land, hooks, still); }
  constructor(private readonly host: HTMLElement, private readonly land: BoardLand, private readonly hooks: BoardHooks,
    private readonly still: boolean) {
    try {
      const towns = land.marks.filter(m => m.town);
      this.grid = new HexGrid(land.width, land.height);
      this.paths = new BoardPaths(this.grid, land, new Set(towns.map(t => t.cell)));
      this.ground = new BoardGround(this.grid, land, this.paths.reach);
      this.knowing = new BoardKnowing(this.grid, land.known, land.key, land.here);
      if (still) { this.knowing.settle(); }
      this.renderer.setPixelRatio(Math.min(1.5, devicePixelRatio));
      this.renderer.setSize(host.clientWidth, host.clientHeight);
      Object.assign(this.renderer,
        { toneMapping: ACESFilmicToneMapping, toneMappingExposure: 1.3, outputColorSpace: SRGBColorSpace });
      Object.assign(this.renderer.shadowMap, { enabled: true, type: PCFShadowMap, autoUpdate: false });
      this.offer(host);
      this.look = new BoardLook(this.scene, this.grid, this.knowing);
      this.tiles = new BoardTiles(this.scene, this.ground, this.look.water(), { ...this.paths.reach,
        beds: this.paths.beds });
      new BoardUnder(this.scene, this.ground);
      const flora = new BoardFlora(this.ground, this.paths.reach, towns.map(t => t.cell));
      this.scatters = Object.entries(flora.spots).map(([kind, spots]) => new Scatter(this.scene, BoardKit.make(kind),
        spots, (x, z) => this.ground.at(x, z)));
      this.river = this.look.water();
      this.places = new BoardPlaces(this.scene, this.ground, this.look);
      this.labels = new BoardLabels(host, hooks, c => this.heed(c), c => this.up(c));
      this.view = new BoardCamera(this.renderer.domElement, this.grid.centres[land.here ?? towns[0]?.cell ?? 0]!,
        still);
      this.furnish(new BoardTowns(this.scene, this.ground, this.look, towns));
      this.look.mist([0.16, 0.05, 0.31], [0.85, 0.64]); this.look.mist([0.62, 0.03, 0.77], [0.36, 0]);
      this.know(true);
      this.watch = new ResizeObserver(() => this.fit()); this.watch.observe(host);
      this.listen();
      this.frame = requestAnimationFrame(t => this.tick(t));
    } catch (e) {
      // A land the board cannot be made of: all it had begun let go at once (the view's controls, listening on the
      // whole page, among it), and what it had put on the page taken off, so that the flat map stands in its place
      // with nothing of the board held.
      const made = this as unknown as { view?: BoardCamera; watch?: ResizeObserver };
      this.listening.abort(); made.view?.dispose(); made.watch?.disconnect();
      this.scene.traverse(o => Board.release(o)); this.renderer.dispose(); this.renderer.forceContextLoss();
      this.renderer.domElement.remove(); this.keys.remove(); host.querySelector(':scope > .board-labels')?.remove();
      throw e;
    }
  }
  // The land as the keys and the readers of the page have it: a map to move about with the arrow keys, its places
  // reached by Tab.
  private offer(host: HTMLElement): void {
    const el = this.renderer.domElement;
    el.tabIndex = 0; el.setAttribute('role', 'application'); el.setAttribute('aria-roledescription', 'map');
    el.setAttribute('aria-label', 'The country as far as you know it');
    this.keys.className = 'board-keys'; this.keys.id = 'board-keys'; el.setAttribute('aria-describedby', 'board-keys');
    this.keys.textContent = 'The arrow keys move you about the map; Tab goes from place to place on it.';
    host.append(el, this.keys);
  }
  private furnish(towns: BoardTowns): void {
    for (const [c, gs] of towns.groups) { for (const g of gs) { this.stand(c, g); } }
    this.scatters.push(...towns.scatters);
    for (const m of this.land.marks) {
      // A town or a place on land not known stands over the mist, at no height of the land it stands on.
      const p = this.grid.centres[m.cell]!, low = !this.knowing.will(m.cell),
        at = new Vector3(p.x, low ? BoardUnder.TOP : this.ground.levels[m.cell]!, p.y);
      if (m.town) { this.labels.town(m, at.setY(at.y + (low ? 0.3 : 0.42))); continue; }
      // A place only heard of, or not made out, is its sign over the land and nothing standing there.
      if (!BoardLabels.afar(m)) { const g = this.places.place(m); this.scene.add(g); this.stand(m.cell, g); }
      this.labels.sign(m, at.setY(at.y + (low ? 0.2 : m.kind === 'tower' ? 0.78 : 0.36)));
    }
    const here = this.land.here;
    if (here !== undefined) {
      // On a hex a town or a place stands on, your lantern stands toward the near side of it, in front of them.
      const aside = this.land.marks.some(m => m.cell === here) ? 0.28 : 0, lamp = this.places.lantern(here, aside);
      this.scene.add(lamp); this.stand(here, lamp);
      const p = this.grid.centres[here]!;
      this.labels.here(new Vector3(p.x, this.ground.levels[here]! + 0.26, p.y + aside), here);
    }
  }
  private stand(c: number, o: Object3D): void {
    this.standing.set(c, [...this.standing.get(c) ?? [], o]); this.models.push(o);
  }
  // How far a hex stands below where it belongs, and whether what is on it is shown: not until the hex has come most
  // of the way up out of the mist (sunk out of knowing, the hex itself is not drawn at all).
  private up(c: number): [number, boolean] {
    const lift = this.tiles.lift(c);
    return [lift, lift > -0.45];
  }
  // Knowledge as it stands: the tiles standing up, what stands on them with them, the rivers and roads laid over them.
  // Only what is on the hexes that have moved since is moved with them (all of it, the first time).
  private know(all = false): void {
    const moved = this.tiles.update(this.knowing), cells = all ? undefined : moved;
    for (const s of this.scatters) { s.place(c => this.up(c), cells); }
    for (const c of cells ?? this.standing.keys()) {
      const [lift, shown] = this.up(c);
      for (const o of this.standing.get(c) ?? []) { o.position.y = this.ground.levels[c]! + lift; o.visible = shown; }
    }
    this.paths.lay(this.scene, (x, z) => this.ground.at(x, z), c => this.tiles.lift(c) > -0.001, this.river);
    this.rims(); this.shade(all || moved.length > 0); this.dirty = true;
  }
  // The rings about where you are, where you are bound, what is chosen and what is pointed at, each on its hex as it
  // now stands.
  private rims(): void {
    const here = this.land.here, bound = this.cellOf(this.bound);
    this.tiles.mark('here', here); this.tiles.mark('dest', bound === here ? undefined : bound);
    this.tiles.mark('chosen', this.cellOf(this.chosen)); this.tiles.mark('hover', this.pointed);
  }
  // The shadows cast again when what casts them has moved: while new country arrives, a few times a second (the
  // things on its hexes rising out of the mist), and once more when it has come.
  private shade(moved: boolean): void {
    this.owed ||= moved;
    const now = performance.now();
    if (!this.owed || this.knowing.arriving && now - this.shaded < 120) { return; }
    this.renderer.shadowMap.needsUpdate = true; this.owed = false; this.shaded = now;
  }
  // What is chosen, and where you are bound: each ringed, the ways to them laid, and the view drawn toward what is
  // newly chosen.
  show(chosen?: string, bound?: string): void {
    const cell = this.cellOf(chosen), glide = chosen !== this.chosen && cell !== undefined;
    this.chosen = chosen; this.bound = bound;
    this.lay(); this.rims();
    if (glide) { this.view.to(this.grid.centres[cell]!); }
    this.dirty = true;
  }
  // The ways over the land from where you are: to where you are bound, with its pennant, and paler to what is chosen
  // if that is elsewhere. Over the country known as it will stand once what is arriving has come: laid at once where
  // all of it already stands, and where any of it is still arriving, only once it has come.
  private lay(): void {
    const bound = this.cellOf(this.bound), chosen = this.cellOf(this.chosen);
    this.places.way('bound', this.route(bound), (x, z) => this.drawnAt(x, z));
    this.places.way('chosen', chosen === bound ? [] : this.route(chosen), (x, z) => this.drawnAt(x, z));
    // The pennant moved, its shadow cast where it now stands and taken from where it stood.
    this.shade(true); this.dirty = true;
  }
  private route(to?: number): number[] {
    const here = this.land.here;
    if (here === undefined || to === undefined || to === here) { return []; }
    const way = this.grid.route(here, to, (a, b) => this.ground.minutes(a, b),
      c => !this.ground.wet(c) && this.knowing.will(c));
    return way.every(c => this.knowing.still(c)) ? way : [];
  }
  // The height of the land at a point as it is drawn: a hex not known lies low under the mist (see BoardUnder).
  private drawnAt(x: number, z: number): number {
    const c = this.grid.cellAt(x, z), lift = c === undefined ? -4 : this.tiles.lift(c);
    return lift <= -1 ? BoardUnder.TOP + 0.012 : this.ground.at(x, z) + lift;
  }
  zoom(by: number): void { this.view.zoom(by); this.dirty = true; }
  home(): void { this.view.back(); this.dirty = true; }
  // The board put away: its listening stopped, all it put on the graphics card given back, and its drawing let go at
  // once, rather than whenever the browser next sweeps up a canvas no longer shown (a few openings of the map would
  // otherwise hold as many boards there, on a tablet enough to have the page reloaded).
  dispose(): void {
    this.listening.abort(); clearTimeout(this.lost); cancelAnimationFrame(this.frame); this.watch.disconnect();
    this.view.dispose(); this.scene.traverse(o => Board.release(o)); this.renderer.dispose();
    if (!this.renderer.getContext().isContextLost()) { this.renderer.forceContextLoss(); }
    this.renderer.domElement.remove(); this.keys.remove(); this.labels.layer.remove();
  }
  // What one thing on the board holds on the graphics card: its shape, what it is made of and the pictures on that,
  // and a light's shadow.
  private static release(o: Object3D): void {
    const held = o as Object3D & { geometry?: BufferGeometry; material?: Material | Material[]; dispose?: () => void };
    held.geometry?.dispose(); held.dispose?.();
    for (const m of [held.material ?? []].flat()) {
      const uniforms = Object.values((m as Partial<ShaderMaterial>).uniforms ?? {}).map(u => u.value as unknown);
      for (const v of [...Object.values(m), ...uniforms]) {
        if ((v as Partial<Texture> | null)?.isTexture) { (v as Texture).dispose(); }
      }
      m.dispose();
    }
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
  // The known hex under the pointer, if any: that of a town, a place or your lantern, or of the land itself. What is
  // not drawn there (a hex sunk out of knowing or glimpsed and lying low, or what stands on one not yet shown) is let
  // through to what is behind it.
  private under(e: PointerEvent): number | undefined {
    const r = this.renderer.domElement.getBoundingClientRect(), ray = new Raycaster();
    ray.setFromCamera(new Vector2(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1),
      this.view.camera);
    for (const hit of ray.intersectObjects([...this.tiles.pick, ...this.models], true)) {
      const c = this.struck(hit);
      if (c !== undefined) { return this.knowing.known(c) ? c : undefined; }
    }
    return undefined;
  }
  // The hex a thing hit stands for, if it is drawn there: the hex a model stands on, or the tile's own.
  private struck(hit: Intersection): number | undefined {
    if (!(hit.object as Partial<Mesh>).isMesh) { return undefined; }
    let o: Object3D | null = hit.object;
    while (o && o.userData.cell === undefined) { o = o.parent; }
    if (o) { return o.visible ? o.userData.cell as number : undefined; }
    const c = (hit.object as Mesh).geometry.getAttribute('aCell').getX(hit.face!.a);
    return this.tiles.lift(c) > -1 ? c : undefined;
  }
  // A tap: on a name or a sign, that place; on the land, the place on the hex (its town before anything else there),
  // or the hex.
  private tapped(e: PointerEvent): void {
    const tap = this.presses.up(e), marks = this.land.marks;
    if (!tap) { return; }
    const c = tap.id === undefined ? this.under(e) : undefined;
    const id = tap.id ?? (c === undefined ? undefined
      : marks.find(m => m.cell === c && m.town)?.id ?? marks.find(m => m.cell === c)?.id ?? `hex:${c}`);
    if (id) { this.hooks.choose(id); }
  }
  // A touch begun on a name or a sign, handed on to the land, so that it moves the land as a touch anywhere else
  // would; taken up where it was put down, it chooses that place.
  private handOn(e: PointerEvent): void {
    const l = this.labels.of(e.target), el = this.renderer.domElement;
    if (e.pointerType !== 'touch' || !l) { return; }
    this.presses.down(e, l.id); el.dispatchEvent(new PointerEvent('pointerdown', e));
    if (!el.hasPointerCapture(e.pointerId)) { el.setPointerCapture(e.pointerId); }
  }
  // What the pointer is over: its hex ringed, and the name of a place there shown.
  private point(c: number | undefined): void {
    if (c === this.pointed) { return; }
    this.pointed = c; this.tiles.mark('hover', c); this.dirty = true;
  }
  // A label given the keys' focus, the view drawn toward its place; or let go of it.
  private heed(c?: number): void {
    if (c !== undefined) { this.view.to(this.grid.centres[c]!); }
    this.dirty = true;
  }
  private listen(): void {
    const el = this.renderer.domElement, names = this.labels.layer, signal = this.listening.signal;
    el.addEventListener('pointerdown', e => this.presses.down(e), { signal });
    el.addEventListener('pointerup', e => this.tapped(e), { signal });
    el.addEventListener('pointercancel', e => this.presses.cancel(e), { signal });
    el.addEventListener('pointermove', e => {
      this.presses.move(e);
      if (e.pointerType === 'mouse' && !e.buttons) { this.point(this.under(e)); }
    }, { signal });
    // The mouse gone off the land: onto a place's name, that place pointed at; anywhere else, nothing.
    el.addEventListener('pointerleave', e => {
      if (e.pointerType === 'mouse') { this.point(this.labels.of(e.relatedTarget)?.cell); }
    }, { signal });
    names.addEventListener('pointerdown', e => this.handOn(e), { signal });
    names.addEventListener('pointerover', e => {
      if (e.pointerType === 'mouse') { this.point(this.labels.of(e.target)?.cell); }
    }, { signal });
    names.addEventListener('pointerout', e => {
      if (e.pointerType === 'mouse' && e.relatedTarget !== el) { this.point(this.labels.of(e.relatedTarget)?.cell); }
    }, { signal });
    this.keep(signal);
    this.view.controls.addEventListener('change', () => { this.dirty = true; });
  }
  // The drawing taken away (a tablet short of memory, its page put aside): given back soon, the shadows are cast
  // again and the board drawn again, still or not; not given back, the flat map stands in its place.
  private keep(signal: AbortSignal): void {
    const el = this.renderer.domElement;
    el.addEventListener('webglcontextlost', () => this.wait(), { signal });
    el.addEventListener('webglcontextrestored', () => {
      clearTimeout(this.lost); this.renderer.shadowMap.needsUpdate = true; this.dirty = true;
    }, { signal });
    document.addEventListener('visibilitychange', () => this.wait(), { signal });
  }
  // Given up on only after two seconds of the page being seen without its drawing: a page put aside is given it back
  // as it is shown again, and is not waited on until then.
  private wait(): void {
    clearTimeout(this.lost);
    if (document.visibilityState !== 'visible' || !this.renderer.getContext().isContextLost()) { return; }
    this.lost = setTimeout(() => this.hooks.lost?.(), 2000);
  }
  private tick(now: number): void {
    const t = this.began === undefined ? 0 : Math.max(0, now - this.began) / 1000;
    if (this.view.step(now)) { this.dirty = true; }
    if (this.knowing.arriving) {
      const moving = this.knowing.arrive(t); this.know();
      // The country come: the ways over it laid as it now stands.
      if (!moving) { this.lay(); }
    }
    if (this.dirty || (!this.still && now - this.drawn > 120)) {
      this.look.air(this.view.distance, this.still ? 40 : t);
      this.renderer.render(this.scene, this.view.camera); this.began ??= performance.now();
      if (this.dirty) { this.labels.place(this.view.camera, [this.host.clientWidth, this.host.clientHeight],
        [this.chosen, this.pointed]); }
      this.dirty = false; this.drawn = now;
    }
    this.frame = requestAnimationFrame(x => this.tick(x));
  }
}
