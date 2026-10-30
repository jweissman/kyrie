import {
  BufferGeometry, Color, CylinderGeometry, DataTexture, Float32BufferAttribute, FloatType, type Material, MathUtils,
  Mesh, MeshBasicMaterial, MeshStandardMaterial, RedFormat, RingGeometry, type Scene, type ShaderMaterial,
} from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { BoardGround } from './board-ground';
import { BoardKnowing } from './board-knowing';
import { HexGrid } from './hex-grid';
import { Noise } from './noise';
import type { PathReach } from './path-reach';

// The rivers' and roads' reach, and the hexes a river's bed is cut into.
export interface TileWays { rivers: PathReach; roads: PathReach; beds: Set<number> }
// The land as a table of hex tiles: each top in rings, finer where it swells into fells or a river's bed is cut into
// it, softly lit and mottled in its land's colours (lighter on a swell's crest; a wood's canopy lighter on its crowns,
// the floor of the wood showing where it opens), sand where it meets water, the earth of a bank where it falls to a
// river, worn by a road; each side a lip of turf, then soil, then the dark, its top edge following the top's rim down
// into a river's bed. All the tiles are one mesh and all the open water another; a hex standing up as it comes to be
// known is done as it is drawn, from a small texture of how far each stands below where it belongs. What is not known
// is not drawn at all (the land under the mist is BoardUnder's).
export class BoardTiles {
  private static readonly BASE = -0.55;
  private static readonly tones: Record<string, Color[]> = Object.fromEntries(Object.entries({
    '.': ['#56613a', '#7b7f47'], h: ['#5f5236', '#80704a'], f: ['#5b4f4a', '#7a6f57'], p: ['#57544f', '#77736b'],
    w: ['#1c2c1d', '#4a6436'], ',': ['#323d31', '#56603f'] }).map(([k, v]) => [k, v.map(c => new Color(c))]));
  private static readonly sand = new Color('#9a8a62');
  private static readonly bank = new Color('#4a4230');
  private static readonly floor = new Color('#3a3324');
  private static readonly verge = new Color('#7d6a4c');
  private static readonly earth = ['#4d3c2b', '#33281e', '#120f0c'].map(c => new Color(c));
  private static readonly made = new Map<number, { points: [number, number][]; index: number[]; rim: number }>();
  readonly pick: Mesh[];
  private readonly rise: Float32Array<ArrayBuffer>;
  private readonly riseTexture: DataTexture;
  private readonly rims = new Map<string, Mesh>();
  constructor(private readonly scene: Scene, private readonly ground: BoardGround, water: ShaderMaterial,
    private readonly ways: TileWays) {
    const grid = ground.grid;
    this.rise = new Float32Array(grid.cells.length).fill(-4);
    this.riseTexture = new DataTexture(this.rise, grid.width, grid.height, RedFormat, FloatType);
    this.riseTexture.needsUpdate = true;
    const land = this.laid(grid.cells.filter(c => !ground.wet(c)).flatMap(c => this.tile(c)),
      this.risen(new MeshStandardMaterial({ vertexColors: true, roughness: 0.95 })));
    this.laid(grid.cells.filter(c => ground.wet(c)).map(c => this.side(c, ...this.flat(c))),
      this.risen(new MeshStandardMaterial({ vertexColors: true, roughness: 1, flatShading: true })));
    const waters = this.laid(grid.cells.filter(c => ground.wet(c)).map(c => this.cap(c)), this.risenWater(water));
    this.pick = [land, waters].filter((m): m is Mesh => m !== undefined);
    for (const [k, color, opacity, band] of [['here', '#f2bd4c', 0.95, [0.84, 0.95]],
      ['dest', '#f2bd4c', 0.6, [0.84, 0.95]], ['chosen', '#ece6d9', 0.85, [0.7, 0.79]],
      ['hover', '#ece6d9', 0.5, [0.84, 0.95]]] as const) {
      this.rims.set(k, this.rim(color, opacity, band));
    }
  }
  // Many hexes' shapes as one mesh on the board; none where the land has no such hexes (most countries have no sea or
  // lake, some no dry land to speak of).
  private laid(shapes: BufferGeometry[], material: Material): Mesh | undefined {
    if (!shapes.length) { return undefined; }
    const m = new Mesh(mergeGeometries(shapes), material); m.receiveShadow = true; this.scene.add(m);
    for (const s of shapes) { s.dispose(); }
    return m;
  }
  // How far a hex stands below where it belongs: nothing when known, rising as it comes, far below when unknown.
  lift(c: number): number { return this.rise[c]!; }
  // Each hex stood as far as it is known; the hexes that have moved since, all that has to follow them.
  update(k: BoardKnowing): number[] {
    const moved: number[] = [];
    for (let c = 0; c < this.rise.length; c++) {
      const s = MathUtils.clamp((k.now[c]! - BoardKnowing.GLIMPSE) / (1 - BoardKnowing.GLIMPSE), 0, 1),
        r = Math.fround(s <= 0.001 ? -4 : (1 - (1 - s) ** 3) * 0.7 - 0.7);
      if (r !== this.rise[c]) { this.rise[c] = r; moved.push(c); }
    }
    if (moved.length) { this.riseTexture.needsUpdate = true; }
    return moved;
  }
  // A ring about a hex's rim: where you are, where you are bound, what is pointed at; within it, what is chosen.
  mark(which: 'here' | 'dest' | 'chosen' | 'hover', c: number | undefined): void {
    const m = this.rims.get(which)!, p = c === undefined ? undefined : this.ground.grid.centres[c];
    m.visible = c !== undefined && this.rise[c]! > -1;
    if (p && c !== undefined) { m.position.set(p.x, this.ground.levels[c]! + this.rise[c]! + 0.035, p.y); }
  }
  // How finely a hex's top is made: finest where a river's bed is cut into it, finer where it swells or a wood's
  // canopy is over it.
  private fine(c: number): number {
    const cover = this.ground.cover(c);
    return this.ways.beds.has(c) ? 12 : cover === 'w' ? 8 : 'fph'.includes(cover) ? 7 : 5;
  }
  // A dry hex: its top, swelling and mottled and smoothly lit, and its sides under its rim.
  private tile(c: number): BufferGeometry[] {
    const g = this.ground, p = g.grid.centres[c]!, level = g.levels[c]!, { points, index, rim } = this.rings(c);
    const shores = g.grid.neighbours(c).filter(n => g.wet(n)).map(n => Math.atan2(g.grid.centres[n]!.y - p.y,
      g.grid.centres[n]!.x - p.x)), pos: number[] = [], col: number[] = [];
    for (const [lx, lz] of points) {
      const x = p.x + lx, z = p.y + lz, at = g.point(c, x, z), k = this.colour(c, [x, z, lx, lz], [at, shores]);
      pos.push(x, level + at.y, z); col.push(k.r, k.g, k.b);
    }
    const top = BoardTiles.geometry(pos, col); top.setIndex(index); top.computeVertexNormals();
    const edge = [...Array(points.length - rim).keys()].map(i => i + rim);
    const side = this.side(c, edge.map(i => [pos[i * 3]!, pos[i * 3 + 1]!, pos[i * 3 + 2]!]),
      edge.map(i => new Color(col[i * 3]!, col[i * 3 + 1]!, col[i * 3 + 2]!)));
    return [BoardTiles.of(top, c), side];
  }
  // The colour of a point of a dry hex's top: its land's, mottled; toward sand where it meets water; the earth of a
  // bank as it falls to a river; worn by a road.
  private colour(c: number, [x, z, lx, lz]: [number, number, number, number],
    [{ y, bed: cut, crown }, shores]: [{ y: number; bed: number; crown: number }, number[]]): Color {
    const g = this.ground, [lo, hi] = BoardTiles.tones[g.cover(c)] ?? BoardTiles.tones['.']!,
      d = HexGrid.outward(lx, lz, 0.5 * BoardGround.GAP), facing = Math.atan2(lz, lx);
    const wood = g.cover(c) === 'w', k = lo!.clone().lerp(hi!,
      wood ? MathUtils.smoothstep(crown, 0.5, 1) : MathUtils.smoothstep(Noise.fbm(x * 4.3 + c, z * 4.3), 0.3, 0.75))
      .multiplyScalar(0.92 + Noise.hash(c, 77) * 0.16);
    if (wood) { k.lerp(BoardTiles.floor, 1 - MathUtils.smoothstep(crown, 0.1, 0.4)); }
    else { k.multiplyScalar(1 + Math.max(0, y) * 1.5); }
    if (d > 0.6 && shores.some(w => Math.abs(Math.atan2(Math.sin(facing - w), Math.cos(facing - w))) < 0.75)) {
      k.lerp(BoardTiles.sand, MathUtils.smoothstep(d, 0.6, 0.95) * 0.75);
    }
    const bed = cut / BoardGround.BED, road = this.ways.roads.distance(x, z, 0.08);
    if (bed > 0) { k.lerp(BoardTiles.bank, Math.min(1, bed * 1.8) * 0.85); }
    if (road < 0.08) { k.lerp(BoardTiles.verge, (1 - MathUtils.smoothstep(road, 0.02, 0.08)) * 0.3); }
    return k;
  }
  // The rim of a wet hex: its six corners, at the water's level.
  private flat(c: number): [[number, number, number][], Color[]] {
    const p = this.ground.grid.centres[c]!, r = HexGrid.R * BoardGround.GAP, level = this.ground.levels[c]!;
    return [[...Array(6).keys()].map(s => {
      const [x, z] = HexGrid.corner(s, r);
      return [p.x + x, level, p.y + z];
    }), Array(6).fill(new Color('#2b3a44')) as Color[]];
  }
  // A hex's sides under its rim (its points round from the top corner, so many to a side, and their colours): each
  // side a lip of turf, then soil, then the dark, lit as the side it is.
  private side(c: number, rim: [number, number, number][], turf: Color[]): BufferGeometry {
    const per = rim.length / 6, level = this.ground.levels[c]!, pos: number[] = [], col: number[] = [],
      nrm: number[] = [], index: number[] = [];
    for (let s = 0; s < 6; s++) {
      const mid = (s + 0.5) * Math.PI / 3, nx = Math.sin(mid), nz = Math.cos(mid), first = pos.length / 3;
      for (let j = 0; j <= per; j++) {
        const [x, y, z] = rim[(s * per + j) % rim.length]!, k = turf[(s * per + j) % rim.length]!;
        for (const [h, tone] of [[y, k], [y - 0.022, BoardTiles.earth[0]!], [level - 0.11, BoardTiles.earth[1]!],
          [BoardTiles.BASE, BoardTiles.earth[2]!]] as const) {
          pos.push(x, h, z); col.push(tone.r, tone.g, tone.b); nrm.push(nx, 0, nz);
        }
      }
      for (let j = 0; j < per; j++) {
        for (let row = 0; row < 3; row++) {
          const a = first + j * 4 + row, b = a + 4;
          index.push(a, a + 1, b, b, a + 1, b + 1);
        }
      }
    }
    const g = BoardTiles.geometry(pos, col); g.setAttribute('normal', new Float32BufferAttribute(nrm, 3));
    g.setIndex(index);
    return BoardTiles.of(g, c);
  }
  // Open water, one sheet from hex to hex (its sides, under its rim, seen only at a shore).
  private cap(c: number): BufferGeometry {
    const p = this.ground.grid.centres[c]!, g = new CylinderGeometry(HexGrid.R, HexGrid.R, 0.01, 6).toNonIndexed();
    g.deleteAttribute('uv'); g.translate(p.x, this.ground.levels[c]!, p.y);
    return BoardTiles.of(g, c);
  }
  // A ring in its own colour, as it is (not toned as the lit land is), over whatever stands on its hex: a wood's crowns
  // or a hill's swell do not hide where you are.
  private rim(color: string, opacity: number, [inner, outer]: readonly [number, number]): Mesh {
    const m = new Mesh(new RingGeometry(HexGrid.R * inner, HexGrid.R * outer, 6, 1, Math.PI / 6),
      new MeshBasicMaterial({ color, transparent: true, opacity, depthWrite: false, depthTest: false,
        toneMapped: false }));
    m.rotation.x = -Math.PI / 2; m.visible = false; m.renderOrder = 4; this.scene.add(m);
    return m;
  }
  private lifted(): string {
    const { width: w, height: h } = this.ground.grid;
    return `texture2D(uRise, vec2((mod(aCell, ${w}.) + .5) / ${w}., (floor(aCell / ${w}.) + .5) / ${h}.)).r`;
  }
  // A point of a hex stood as far below as its hex is; or, its hex sunk out of knowing, brought with all its hex's
  // other points to one, so that nothing of it is drawn (neither seen through the mist nor paid for).
  private stood(v: string): string {
    return `float hexRise = ${this.lifted()}; ${v}.y += hexRise; ${v} *= step(-3.5, hexRise);`;
  }
  private readonly compile = (s: { uniforms: Record<string, { value: unknown }>; vertexShader: string }): void => {
    s.uniforms.uRise = { value: this.riseTexture };
    s.vertexShader = 'attribute float aCell; uniform sampler2D uRise;\n'
      + s.vertexShader.replace('#include <begin_vertex>', `#include <begin_vertex>\n ${this.stood('transformed')}`);
  };
  private static cacheKey(): string { return 'risen'; }
  private risen<T extends Material>(m: T): T {
    m.onBeforeCompile = this.compile; m.customProgramCacheKey = BoardTiles.cacheKey;
    return m;
  }
  private risenWater(m: ShaderMaterial): ShaderMaterial {
    m.uniforms.uRise = { value: this.riseTexture };
    m.vertexShader = 'attribute float aCell; uniform sampler2D uRise;\n' + m.vertexShader.replace('vec4 w = modelMatrix * vec4(position, 1.0);',
      `vec3 q = position; ${this.stood('q')} vec4 w = modelMatrix * vec4(q, 1.0);`);
    return m;
  }
  private static geometry(pos: number[], col?: number[]): BufferGeometry {
    const g = new BufferGeometry(); g.setAttribute('position', new Float32BufferAttribute(pos, 3));
    if (col) { g.setAttribute('color', new Float32BufferAttribute(col, 3)); }
    return g;
  }
  private static of(g: BufferGeometry, c: number): BufferGeometry {
    return g.setAttribute('aCell',
      new Float32BufferAttribute(new Array<number>(g.attributes.position!.count).fill(c), 1));
  }
  private static on(start: number[], ring: number, i: number): number {
    return ring === 0 ? 0 : start[ring]! + (i % (6 * ring));
  }
  // A hex top in rings about its centre, each ring's points along the hex's sides, and the triangles between rings;
  // where its rim's points begin. Made once for each fineness.
  private rings(c: number): { points: [number, number][]; index: number[]; rim: number } {
    const n = this.fine(c), made = BoardTiles.made.get(n);
    if (made) { return made; }
    const r = HexGrid.R * BoardGround.GAP, points: [number, number][] = [[0, 0]], start = [0], index: number[] = [];
    for (let k = 1; k <= n; k++) {
      start.push(points.length);
      for (let s = 0; s < 6; s++) {
        const a = HexGrid.corner(s, r * k / n), b = HexGrid.corner(s + 1, r * k / n);
        for (let j = 0; j < k; j++) { points.push([a[0] + (b[0] - a[0]) * j / k, a[1] + (b[1] - a[1]) * j / k]); }
      }
    }
    for (let k = 1; k <= n; k++) {
      for (let s = 0; s < 6; s++) {
        for (let j = 0; j < k; j++) {
          const o0 = BoardTiles.on(start, k, s * k + j), o1 = BoardTiles.on(start, k, s * k + j + 1);
          const i0 = BoardTiles.on(start, k - 1, s * (k - 1) + j);
          index.push(o0, o1, i0);
          if (j < k - 1) { index.push(i0, o1, BoardTiles.on(start, k - 1, s * (k - 1) + j + 1)); }
        }
      }
    }
    const shape = { points, index, rim: start[n]! };
    BoardTiles.made.set(n, shape);
    return shape;
  }
}
