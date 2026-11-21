import { type BufferGeometry, Group, type Object3D, type Scene, type ShaderMaterial, Vector3 } from 'three';
import { BoardFlora } from './board-flora';
import { BoardFringe } from './board-fringe';
import { BoardGround } from './board-ground';
import { BoardKit } from './board-kit';
import type { BoardKnowing } from './board-knowing';
import { BoardLabels } from './board-labels';
import type { BoardLook } from './board-look';
import { BoardPaths } from './board-paths';
import { BoardPlaces } from './board-places';
import { BoardTiles } from './board-tiles';
import { BoardTowns } from './board-towns';
import type { BoardLand, BoardMark } from './board-types';
import type { HexGrid } from './hex-grid';
import { Scatter } from './scatter';

// The land as the board lays it, made whole from a land (OR-91's rest): its ground, rivers and roads, its tiles, what
// grows on them and the masses past what is known, the towns and what stands for each place, and your lantern. Made in
// a group of its own on the board, not drawn until it is shown in place of the one before, so that the board goes on
// drawing the old while the new is made a part at a time (see Board.update: each part its own task, none holding the
// page long), and a board made new and a board updated lay the land by the same steps. What stands on each hex is kept
// with it (a town's church and wall, a place, your lantern), and all of it, for what is pointed at to be found among.
interface Made { look: BoardLook; knowing: BoardKnowing; river: ShaderMaterial }
export class BoardLayer {
  // Everything of it, wherever it is made (its parts are given it as the scene they stand in).
  readonly group = new Group();
  private readonly stage = this.group as unknown as Scene;
  paths!: BoardPaths;
  ground!: BoardGround;
  tiles!: BoardTiles;
  places!: BoardPlaces;
  readonly scatters: Scatter[] = [];
  readonly standing = new Map<number, Object3D[]>();
  readonly models: Object3D[] = [];
  private readonly made = new Map<string, Object3D>();
  private lamp?: Object3D;
  private constructor(private readonly grid: HexGrid, private readonly land: BoardLand, private readonly by: Made) {
    this.group.visible = false;
  }
  // Made at once (a board made new).
  static now(grid: HexGrid, land: BoardLand, by: Made): BoardLayer {
    const layer = new BoardLayer(grid, land, by);
    const parts = layer.parts();
    while (!parts.next().done) { /* each part made in turn */ }
    return layer;
  }
  // Made a part at a time, a task each, the page free between them (a board updated).
  static async soon(grid: HexGrid, land: BoardLand, by: Made): Promise<BoardLayer> {
    const layer = new BoardLayer(grid, land, by);
    const parts = layer.parts();
    // Each part measured (test/board-update-browser: none to hold the page as a board made again had).
    for (let at = performance.now(), done = false; !done; at = performance.now()) {
      done = !!parts.next().done; performance.measure('board:part', { start: at });
      if (!done) { await new Promise(resolve => setTimeout(resolve, 0)); }
    }
    return layer;
  }
  private *parts(): Generator<void> {
    const land = this.land, towns = land.marks.filter(m => m.town), { look, knowing } = this.by;
    this.paths = new BoardPaths(this.grid, land, new Set(towns.map(t => t.cell)));
    this.ground = new BoardGround(this.grid, land, this.paths.reach);
    yield;
    this.tiles = new BoardTiles(this.stage, this.ground, look.water(), { ...this.paths.reach, beds: this.paths.beds,
      tracks: this.paths.tracks });
    yield;
    new BoardFringe(this.stage, this.ground, c => knowing.will(c));
    const flora = new BoardFlora(this.ground, this.paths.reach, towns.map(t => t.cell));
    this.scatters.push(...Object.entries(flora.spots).map(([kind, spots]) => new Scatter(this.stage,
      BoardKit.make(kind), spots, (x, z) => this.ground.at(x, z))));
    const made = new BoardTowns(this.stage, this.ground, look, { towns, known: land.known });
    for (const [c, gs] of made.groups) { for (const g of gs) { this.stand(c, g); } }
    this.scatters.push(...made.scatters);
    this.places = new BoardPlaces(this.stage, this.ground, look);
    for (const m of land.marks) { this.mark(m); }
    this.lantern(land.here);
  }
  // What stands for a place made out (nothing for a town, whose church and wall are the towns', nor for a place only
  // heard of or not made out, whose sign is all there is of it), made again as it is now known.
  mark(m: BoardMark): void {
    const was = this.made.get(m.id);
    if (was) { this.unstand(was); this.made.delete(m.id); }
    if (m.town || BoardLabels.afar(m)) { return; }
    const g = this.places.place(m); this.stage.add(g); this.stand(m.cell, g); this.made.set(m.id, g);
  }
  unmark(id: string): void {
    const was = this.made.get(id);
    if (was) { this.unstand(was); this.made.delete(id); }
  }
  // Your lantern where you are: on a hex a town or a place stands on, toward the near side of it, in front of them;
  // where it stands, and how far aside.
  lantern(here: number | undefined, marks = this.land.marks): [Vector3, number] | undefined {
    if (this.lamp) { this.unstand(this.lamp); this.lamp = undefined; }
    if (here === undefined) { return undefined; }
    const aside = marks.some(m => m.cell === here) ? 0.28 : 0, lamp = this.lamp = this.places.lantern(here, aside);
    this.stage.add(lamp); this.stand(here, lamp);
    const p = this.grid.centres[here]!;
    return [new Vector3(p.x, this.ground.levels[here]! + 0.03, p.y + aside), aside];
  }
  // The places that have something standing for them.
  drawn(): string[] { return [...this.made.keys()].sort(); }
  // Shown on the board; or taken off it, its shapes given back (not what they are made of, which the look's glows and
  // water share).
  show(): void { this.group.visible = true; }
  off(): void {
    this.group.parent?.remove(this.group);
    this.group.traverse(x => (x as Object3D & { geometry?: BufferGeometry }).geometry?.dispose());
  }
  private stand(c: number, o: Object3D): void {
    this.standing.set(c, [...this.standing.get(c) ?? [], o]); this.models.push(o);
  }
  private unstand(o: Object3D): void {
    for (const [k, os] of this.standing) { if (os.includes(o)) { this.standing.set(k, os.filter(x => x !== o)); } }
    this.models.splice(this.models.indexOf(o), 1); o.parent?.remove(o);
    o.traverse(x => (x as Object3D & { geometry?: BufferGeometry }).geometry?.dispose());
  }
}
