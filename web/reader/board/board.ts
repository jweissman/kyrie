import {
  ACESFilmicToneMapping, type BufferGeometry, type Intersection, type Material, type Mesh, type Object3D,
  PCFShadowMap, Raycaster, Scene, type ShaderMaterial, SRGBColorSpace, type Texture, Vector2, Vector3, WebGLRenderer,
} from 'three';
import { BoardCamera } from './board-camera';
import { BoardGround } from './board-ground';
import { BoardKnowing } from './board-knowing';
import { BoardLabels } from './board-labels';
import { BoardLook } from './board-look';
import { BoardPaths } from './board-paths';
import { BoardPlaces } from './board-places';
import { BoardPresses } from './board-presses';
import { BoardTiles } from './board-tiles';
import { BoardUnder } from './board-under';
import type { BoardApi, BoardHooks, BoardLand, BoardMark, Courses } from './board-types';
import { BoardModel, type BoardDrawn, type BoardState } from './board-model';
import { BoardLayer } from './board-layer';
import { HexGrid } from './hex-grid';

// The map's board (Mission 18, the owner's addendum): the country as a table of hex tiles in three dimensions, lit at
// dusk, the unknown under mist. Drawn only when something has changed (the mist drifting a few times a second when
// nothing has), its shadows cast again only when what casts them has moved, its lamps glows rather than lights. A
// hex chosen, a place chosen, where you are and where you are bound are what it gives back and shows, where you are
// bound kept apart from what is only chosen; going anywhere is the page's.
export class Board implements BoardApi {
  private readonly renderer = new WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
  private readonly scene = new Scene();
  private readonly grid: HexGrid;
  private readonly knowing: BoardKnowing;
  private readonly look: BoardLook;
  // The land as it is laid (see BoardLayer), and one being laid in its place.
  private layer: BoardLayer;
  private laying = Promise.resolve();
  private get ground(): BoardGround { return this.layer.ground; }
  private get paths(): BoardPaths { return this.layer.paths; }
  private get tiles(): BoardTiles { return this.layer.tiles; }
  private get places(): BoardPlaces { return this.layer.places; }
  private get standing(): Map<number, Object3D[]> { return this.layer.standing; }
  private get models(): Object3D[] { return this.layer.models; }
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
  // When the board last changed (a move, a touch, the country coming): the air over it drifts for a while after, and
  // then the board is drawn only when something changes (an idle map had kept four cores busy in software drawing).
  private active = 0;
  static readonly settles = 15000;
  private frame = 0;
  private chosen?: string;
  private bound?: string;
  private courses: Courses = {};
  private pointed?: number;
  // What the board draws, as plain data (see BoardModel).
  private state: BoardState;
  static mount(host: HTMLElement, land: BoardLand, hooks: BoardHooks,
    still: boolean): Board { return new Board(host, land, hooks, still); }
  constructor(private readonly host: HTMLElement, private land: BoardLand, private readonly hooks: BoardHooks,
    private readonly still: boolean) {
    try {
      const towns = land.marks.filter(m => m.town), made = performance.now(); this.state = BoardModel.of(land);
      this.grid = new HexGrid(land.width, land.height);
      this.knowing = new BoardKnowing(this.grid, land.known, land.key, land.here);
      if (still) { this.knowing.settle(); }
      this.renderer.setPixelRatio(Math.min(1.5, devicePixelRatio));
      this.renderer.setSize(host.clientWidth, host.clientHeight);
      Object.assign(this.renderer,
        { toneMapping: ACESFilmicToneMapping, toneMappingExposure: 1.3, outputColorSpace: SRGBColorSpace });
      Object.assign(this.renderer.shadowMap, { enabled: true, type: PCFShadowMap, autoUpdate: false });
      this.offer(host);
      this.look = new BoardLook(this.scene, this.grid, this.knowing);
      this.river = this.look.water();
      this.layer = BoardLayer.now(this.grid, land, this.by()); this.scene.add(this.layer.group); this.layer.show();
      new BoardUnder(this.scene, this.ground);
      this.labels = new BoardLabels(host, hooks, c => this.heed(c), c => this.up(c));
      this.view = new BoardCamera(this.renderer.domElement, this.grid.centres[land.here ?? towns[0]?.cell ?? 0]!,
        still);
      this.hold();
      this.labels.remember(land.key, land.marks);
      for (const m of land.marks) { this.label(m); }
      this.you();
      this.look.mist([0.16, 0.05, 0.31], [0.85, 0.64]); this.look.mist([0.62, 0.03, 0.77], [0.36, 0]);
      this.know(true);
      this.watch = new ResizeObserver(() => this.fit()); this.watch.observe(host);
      this.listen();
      // Where you are, framed clear of the card at once, once the page has laid it out.
      this.frame = requestAnimationFrame(t => { this.view.back(true); this.tick(t); });
      performance.measure('board:made', { start: made });
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
  private by() { return { look: this.look, knowing: this.knowing, river: this.river }; }
  // A place's label: a town by its name, anything else by its sign, over the land where it is, or over the mist.
  private label(m: BoardMark): void {
    // A town or a place on land not known stands over the mist, at no height of the land it stands on.
    const p = this.grid.centres[m.cell]!, low = !this.knowing.will(m.cell),
      at = new Vector3(p.x, low ? BoardUnder.TOP : this.ground.levels[m.cell]!, p.y);
    if (m.town) { this.labels.town(m, at.setY(at.y + (low ? 0.3 : 0.42))); return; }
    this.labels.sign(m, at.setY(at.y + (low ? 0.2 : m.kind === 'tower' ? 0.78 : 0.36)));
  }
  // Your mark where your lantern stands (see BoardLayer.lantern), or none.
  private you(): void {
    const lit = this.layer.lantern(this.land.here, this.land.marks), here = this.land.here;
    if (!lit || here === undefined) { this.labels.unhere(); return; }
    this.labels.here(lit[0], here, this.land.face);
  }
  // The land changed under the board in what an update can draw (what is known, where you are, the places known and
  // how): drawn again in place (see BoardModel); false where only a new board can draw it (another country, or its
  // shape). OR-91's rest: made again at each journey's end, the board had held the page 1.3-1.6 s without a GPU.
  // Where what is known or which places there are changed, the land is laid again a part at a time, a task each,
  // the old drawn until the new is shown; where only how places are known or where you are, those alone.
  update(land: BoardLand): boolean {
    const next = BoardModel.of(land), change = BoardModel.change(this.state, next);
    if (change.rebuild) { return false; }
    const at = performance.now(), t = this.began === undefined ? 0 : Math.max(0, at - this.began) / 1000;
    const relay = change.laid || change.known || change.towns;
    this.land = land; this.state = next;
    if (change.known) { this.knowing.learn(land.known, t, land.here); if (this.still) { this.knowing.settle(); } }
    this.labels.remember(land.key, land.marks);
    for (const id of change.marks) { this.labels.remove(id); }
    for (const m of land.marks.filter(x => change.marks.includes(x.id))) { this.label(m); }
    if (relay) {
      this.laying = this.laying.then(() => this.relay(land));
    } else {
      for (const id of change.marks) { this.layer.unmark(id); }
      for (const m of land.marks.filter(x => change.marks.includes(x.id))) { this.layer.mark(m); }
      this.you(); this.after();
    }
    performance.measure('board:update', { start: at });
    return true;
  }
  // The land laid again beside the old, a part a task, then shown in its place (unless a later land is laid since).
  private async relay(land: BoardLand): Promise<void> {
    const made = await BoardLayer.soon(this.grid, land, this.by());
    if (this.land !== land) { made.off(); return; }
    const at = performance.now();
    this.layer.off(); this.layer = made; this.scene.add(made.group); made.show();
    this.you(); this.after(); performance.measure('board:relaid', { start: at });
  }
  private after(): void { this.hold(); this.know(true); this.lay(); this.rims(); }
  // What the board draws now, read back from what it has drawn: for a check that an update draws what a new board
  // would (BoardModel.drawn of the same land).
  drawing(): BoardDrawn {
    const { labels, here } = this.labels.drawn();
    return { known: this.grid.cells.filter(c => this.knowing.will(c)), ...here === undefined ? {} : { here }, labels,
      models: this.layer.drawn() };
  }
  // Where your mark is now (the hex under it, walking or not), and the hexes the board shows known now (arriving
  // ones once they are most of the way): to follow a walk hex by hex, and what is lit as it goes.
  now(): { at?: number; seen: number[]; width: number; height: number } {
    const p = this.labels.at(), at = p ? this.grid.cellAt(p.x, p.z) : undefined;
    return { ...at === undefined ? {} : { at }, seen: this.grid.cells.filter(c => this.knowing.known(c)),
      width: this.grid.width, height: this.grid.height };
  }
  // Whether a land laid again is still being laid.
  get busy(): Promise<void> { return this.laying; }
  // The view kept to the country known (and where you are, and the places heard of), with some hexes to spare.
  private hold(): void {
    const g = this.grid, at = [...this.land.known, ...this.land.marks.map(m => m.cell), this.land.here ?? 0]
      .map(c => g.centres[c]!), mid = at.reduce((a, b) => a.clone().add(b)).multiplyScalar(1 / at.length);
    this.view.hold(mid, Math.max(...at.map(p => p.distanceTo(mid))) + 2);
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
    const at = performance.now(), moved = this.tiles.update(this.knowing), cells = all ? undefined : moved;
    for (const s of this.layer.scatters) { s.place(c => this.up(c), cells); }
    for (const c of cells ?? this.standing.keys()) {
      const [lift, shown] = this.up(c);
      for (const o of this.standing.get(c) ?? []) { o.position.y = this.ground.levels[c]! + lift; o.visible = shown; }
    }
    this.paths.lay(this.layer.group as unknown as Scene, (x, z) => this.ground.at(x, z),
      c => this.tiles.lift(c) > -0.001, this.river);
    this.rims(); this.shade(all || moved.length > 0); this.dirty = true; performance.measure('board:know', { start: at });
  }
  // The rings about where you are, what is chosen and what is pointed at, each on its hex as it now stands (where you
  // are bound has its pennant and the way there instead, so that it is not taken for where you are).
  private rims(): void {
    this.tiles.mark('here', this.land.here);
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
  // What is chosen, and where you are bound: each marked, the ways to them laid, and what is newly chosen brought into
  // view if it is out of it, with you (the view is not taken away from you to it).
  show(chosen?: string, bound?: string, courses: Courses = {}): void {
    const cell = this.cellOf(chosen), glide = chosen !== this.chosen && cell !== undefined;
    this.chosen = chosen; this.bound = bound; this.courses = courses;
    this.lay(); this.rims();
    if (glide) { this.view.show(this.grid.centres[cell]!, this.hereAt()); }
    this.dirty = true;
  }
  // The ways over the land from where you are: to where you are bound, with its pennant, and paler to what is chosen
  // if that is elsewhere. Over the country known as it will stand once what is arriving has come: laid at once where
  // all of it already stands, and where any of it is still arriving, only once it has come.
  private lay(): void {
    const bound = this.cellOf(this.bound), chosen = this.cellOf(this.chosen);
    // The way a journey would go where the page knows it (its stops), else the shortest over the land known.
    this.places.way('bound', this.courses.bound ?? this.route(bound), (x, z) => this.drawnAt(x, z), !!this.courses.aimed);
    this.places.way('chosen', chosen === bound ? [] : this.courses.chosen ?? this.route(chosen), (x, z) => this.drawnAt(x, z));
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
  // Your mark walked hex by hex along the way a journey went, the view brought to where it came; how long it takes, if
  // it walks at all (not where nothing moves: see still).
  // What the journey came to know (known) is lit as the mark goes by it.
  walk(way: number[], known?: number[]): number {
    const to = way.at(-1);
    if (to === undefined || way.length < 2 || this.still) { return 0; }
    const ms = this.labels.walk(way.map(c => new Vector3(this.grid.centres[c]!.x, this.ground.levels[c]! + 0.03,
      this.grid.centres[c]!.y)));
    const t = this.began === undefined ? 0 : Math.max(0, performance.now() - this.began) / 1000;
    if (known) { this.knowing.along(known, way, t, ms); }
    this.view.show(this.grid.centres[to]!, this.hereAt()); this.dirty = true;
    return ms;
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
    const tap = this.presses.up(e);
    if (!tap) { return; }
    const c = tap.id === undefined ? this.under(e) : undefined, id = tap.id ?? this.idAt(c);
    if (id) { this.hooks.choose(id); }
  }
  private idAt(c?: number): string | undefined {
    const marks = this.land.marks;
    return c === undefined ? undefined
      : marks.find(m => m.cell === c && m.town)?.id ?? marks.find(m => m.cell === c)?.id ?? `hex:${c}`;
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
    this.pointed = c; this.tiles.mark('hover', c); this.dirty = true; this.hooks.point?.(this.idAt(c));
  }
  private hereAt(): Vector2 | undefined {
    return this.land.here === undefined ? undefined : this.grid.centres[this.land.here];
  }
  // A label given the keys' focus, its place brought into view if it is out of it; or let go of it.
  private heed(c?: number): void {
    if (c !== undefined) { this.view.show(this.grid.centres[c]!, this.hereAt()); }
    this.dirty = true;
  }
  private listen(): void {
    const el = this.renderer.domElement, names = this.labels.layer, signal = this.listening.signal;
    // A press on the page beside the board (a row, Travel to): see pressing.
    window.addEventListener('pointerdown', this.beside.bind(this), { capture: true, signal });
    window.addEventListener('keydown', this.beside.bind(this), { capture: true, signal });
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
  // A press just made beside the board, not yet answered, or a command the page waits on (the stage busy).
  private waiting(): boolean { return this.pressing() || !!document.querySelector('.stage[aria-busy="true"]'); }
  // A press on the page's rows, a moment long: nothing is drawn meanwhile, so that its click is taken at once rather
  // than behind a drawing (a fifth of a second without a GPU): a hold had paused the board while it lasted (OR-91),
  // and nothing is held now (OR-185: a journey's Travel to, tapped on a phone, answered 244 ms after the finger, two
  // drift frames behind it). By then the stage is busy with the command, which pauses the drift as before.
  private pressed = -Infinity;
  private beside(e: Event): void { if (!this.host.contains(e.target as Node)) { this.pressed = performance.now(); } }
  private pressing(): boolean { return performance.now() - this.pressed < Board.press; }
  static readonly press = 300;
  private tick(now: number): void {
    const t = this.began === undefined ? 0 : Math.max(0, now - this.began) / 1000;
    if (this.view.step(now) || this.labels.step(now)) { this.dirty = true; }
    if (this.knowing.arriving) {
      const moving = this.knowing.arrive(t); this.know();
      // The country come: the ways over it laid as it now stands.
      if (!moving) { this.lay(); }
    }
    if (this.dirty) { this.active = now; }
    // The air's drift is drawn only while the page waits on nothing: a drawing can hold the page's one thread for a
    // fifth of a second where it is drawn without a GPU, and a hold's timer and the answer to a command waited behind
    // it (OR-91: a hold done 0.36 s late, every drift frame a long task on CI's headless Chromium).
    // So too what the camera's move or the labels ask in the moment a press is made: drawn once it is answered (OR-91:
    // a hold begun as a place viewed was flown to had waited behind each frame of the flight). A command waited on
    // still draws what moves: a journey's walk is drawn while the page waits on its end.
    const holding = this.pressing();
    const drifting = !this.still && now - this.active < Board.settles && !this.waiting();
    if ((this.dirty && !holding) || (drifting && now - this.drawn > 120)) {
      // Each drawing measured, by why (see test/input-answered-browser's TRACE).
      const at = performance.now(), why = this.dirty ? this.renderer.shadowMap.needsUpdate ? 'board:shaded'
        : 'board:draw' : 'board:drift';
      this.look.air(this.view.distance, this.still ? 40 : t);
      this.renderer.render(this.scene, this.view.camera); this.began ??= performance.now();
      if (this.dirty) { this.labels.place(this.view.camera, [this.host.clientWidth, this.host.clientHeight],
        [this.chosen, this.pointed, this.bound]); }
      this.dirty = false; this.drawn = now; performance.measure(why, { start: at });
    }
    this.frame = requestAnimationFrame(x => this.tick(x));
  }
}
