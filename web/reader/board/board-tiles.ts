import {
  BufferGeometry, Color, CylinderGeometry, DataTexture, Float32BufferAttribute, FloatType, LineBasicMaterial,
    LineSegments,
  type Material, MathUtils, Mesh, MeshBasicMaterial, MeshStandardMaterial, type Object3D, RedFormat, RingGeometry,
    type Scene,
  type ShaderMaterial, type Vector3,
} from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { BoardGround } from './board-ground';
import { BoardKnowing } from './board-knowing';
import { HexGrid } from './hex-grid';
import { Noise } from './noise';

// The land as a table of hex tiles: each top in rings, so that it swells and is mottled in its land's colours, sand
// where it meets water, a darker bank by a river; each side a lip of turf, then soil, then the dark. All the tops are
// one mesh and all the sides another; a hex standing up as it comes to be known is done as it is drawn, from a small
// texture of how far each stands below where it belongs. What is glimpsed lies low and dim with its edge drawn.
export class BoardTiles {
  private static readonly RINGS = 4;
  private static readonly BASE = -0.55;
  private static readonly tones: Record<string,
    [string, string]> = { '.': ['#55653a', '#7d8748'], h: ['#5f5437', '#7c7045'],
    f: ['#5f4b53', '#7a6e50'], p: ['#55524e', '#6f6c66'], w: ['#22351d', '#304a29'], ',': ['#2f3b33', '#55634a'] };
  private static readonly sand = new Color('#9a8a62');
  private static readonly bank = new Color('#3b4632');
  private static readonly verge = new Color('#77684a');
  readonly pick: Mesh[];
  private readonly rise: Float32Array<ArrayBuffer>;
  private readonly riseTexture: DataTexture;
  private readonly rims = new Map<string, Mesh>();
  private ghosts: Object3D[] = [];
  constructor(private readonly scene: Scene, private readonly ground: BoardGround, water: ShaderMaterial,
    paths: { rivers: Vector3[]; roads: Vector3[] }) {
    const grid = ground.grid;
    this.rise = new Float32Array(grid.cells.length).fill(-4);
    this.riseTexture = new DataTexture(this.rise, grid.width, grid.height, RedFormat, FloatType);
    this.riseTexture.needsUpdate = true;
    const tops = grid.cells.filter(c => !ground.wet(c)).map(c => this.top(c, paths));
    const waters = grid.cells.filter(c => ground.wet(c)).map(c => this.cap(c));
    const sides = grid.cells.map(c => this.side(c));
    const meshes = [new Mesh(mergeGeometries(tops),
      this.risen(new MeshStandardMaterial({ vertexColors: true, roughness: 0.95,
      flatShading: true }))), new Mesh(mergeGeometries(sides), this.risen(new MeshStandardMaterial({ vertexColors: true,
      roughness: 1, flatShading: true }))), new Mesh(mergeGeometries(waters), this.risenWater(water))];
    for (const m of meshes) { m.receiveShadow = true; scene.add(m); }
    this.pick = [meshes[0]!, meshes[2]!];
    for (const [k, color, opacity] of [['here', '#f2bd4c', 0.95], ['dest', '#f2bd4c', 0.6],
      ['hover', '#ece6d9', 0.5]] as const) {
      this.rims.set(k, this.rim(color, opacity));
    }
  }
  // How far a hex stands below where it belongs: nothing when known, rising as it comes, far below when unknown.
  lift(c: number): number { return this.rise[c]!; }
  update(k: BoardKnowing): void {
    for (const c of this.ground.grid.cells) {
      const s = MathUtils.clamp((k.now[c]! - BoardKnowing.GLIMPSE) / (1 - BoardKnowing.GLIMPSE), 0, 1);
      this.rise[c] = s <= 0.001 ? -4 : (1 - (1 - s) ** 3) * 0.7 - 0.7;
    }
    this.riseTexture.needsUpdate = true;
    this.scene.remove(...this.ghosts);
    const glimpsed = this.ground.grid.cells.filter(c => k.now[c]! > 0.05 && this.rise[c]! <= -4);
    this.ghosts = glimpsed.length ? this.glimpsed(glimpsed) : [];
    if (this.ghosts.length) { this.scene.add(...this.ghosts); }
  }
  // A ring about a hex's rim: where you are, where you are bound, what is pointed at.
  mark(which: 'here' | 'dest' | 'hover', c: number | undefined): void {
    const m = this.rims.get(which)!, p = c === undefined ? undefined : this.ground.grid.centres[c];
    m.visible = c !== undefined && this.rise[c]! > -1;
    if (p && c !== undefined) { m.position.set(p.x, this.ground.levels[c]! + this.rise[c]! + 0.035, p.y); }
  }
  private top(c: number, paths: { rivers: Vector3[]; roads: Vector3[] }): BufferGeometry {
    const g = this.ground, p = g.grid.centres[c]!, level = g.levels[c]!,
      [lo, hi] = BoardTiles.tones[g.cover(c)] ?? BoardTiles.tones['.']!;
    const a = new Color(lo), b = new Color(hi), jitter = 0.92 + Noise.hash(c, 77) * 0.16;
    const shores = g.grid.neighbours(c).filter(n => g.wet(n)).map(n => Math.atan2(g.grid.centres[n]!.y - p.y,
      g.grid.centres[n]!.x - p.x));
    const { points, index } = BoardTiles.rings(), pos: number[] = [], col: number[] = [];
    for (const [lx, lz] of points) {
      const x = p.x + lx, z = p.y + lz, d = HexGrid.outward(lx, lz, 0.5 * BoardGround.GAP), facing = Math.atan2(lz, lx);
      const k = new Color().lerpColors(a, b,
        MathUtils.smoothstep(Noise.fbm(x * 4.3 + c, z * 4.3), 0.3, 0.75)).multiplyScalar(jitter);
      if (d > 0.6 && shores.some(w => Math.abs(Math.atan2(Math.sin(facing - w), Math.cos(facing - w))) < 0.75)) {
        k.lerp(BoardTiles.sand, MathUtils.smoothstep(d, 0.6, 0.95) * 0.75);
      }
      if (BoardTiles.near(paths.rivers, x, z) < 0.12) { k.lerp(BoardTiles.bank, 0.5); }
      else if (BoardTiles.near(paths.roads, x, z) < 0.07) { k.lerp(BoardTiles.verge, 0.35); }
      pos.push(x, level + g.swell(c, x, z), z); col.push(k.r, k.g, k.b);
    }
    const geom = BoardTiles.geometry(pos, col); geom.setIndex(index);
    const flat = geom.toNonIndexed(); flat.computeVertexNormals();
    return BoardTiles.of(flat, c);
  }
  private cap(c: number): BufferGeometry {
    const p = this.ground.grid.centres[c]!,
      g = new CylinderGeometry(HexGrid.R * BoardGround.GAP, HexGrid.R * BoardGround.GAP, 0.01, 6)
      .toNonIndexed();
    g.deleteAttribute('uv'); g.translate(p.x, this.ground.levels[c]!, p.y);
    return BoardTiles.of(g, c);
  }
  private side(c: number): BufferGeometry {
    const g = this.ground, p = g.grid.centres[c]!, top = g.levels[c]!,
      turf = g.wet(c) ? '#2b3a44' : (BoardTiles.tones[g.cover(c)] ?? ['#55653a'])[0];
    const rows: [number, Color][] = [[top, new Color(turf)], [top - 0.022, new Color('#4d3c2b')],
      [top - 0.11, new Color('#33281e')],
      [BoardTiles.BASE, new Color('#120f0c')]], pos: number[] = [], col: number[] = [], r = HexGrid.R * BoardGround.GAP;
    for (let s = 0; s < 6; s++) {
      const a = HexGrid.corner(s, r), b = HexGrid.corner(s + 1, r);
      for (let i = 0; i < 3; i++) {
        const [y0, k0] = rows[i]!, [y1, k1] = rows[i + 1]!;
        const q: [number, number, number, Color][] = [[a[0], y0, a[1], k0], [b[0], y0, b[1], k0], [a[0], y1, a[1], k1],
          [b[0], y1, b[1], k1]];
        for (const j of [0, 2, 1, 1, 2, 3]) { const v = q[j]!; pos.push(p.x + v[0], v[1], p.y + v[2]); col.push(v[3].r,
          v[3].g, v[3].b); }
      }
    }
    const geom = BoardTiles.geometry(pos, col); geom.computeVertexNormals();
    return BoardTiles.of(geom, c);
  }
  private glimpsed(cells: number[]): Object3D[] {
    const r = HexGrid.R * BoardGround.GAP, hexes: BufferGeometry[] = [], edges: number[] = [];
    for (const c of cells) {
      const p = this.ground.grid.centres[c]!, g = new CylinderGeometry(r, r, 0.02, 6).toNonIndexed();
      g.deleteAttribute('uv'); g.translate(p.x, 0.01, p.y); hexes.push(g);
      for (let k = 0; k < 6; k++) {
        const a = HexGrid.corner(k, r), b = HexGrid.corner(k + 1, r);
        edges.push(p.x + a[0], 0.025, p.y + a[1], p.x + b[0], 0.025, p.y + b[1]);
      }
    }
    return [new Mesh(mergeGeometries(hexes),
      new MeshBasicMaterial({ color: '#15181e', transparent: true, opacity: 0.7 })),
      new LineSegments(BoardTiles.geometry(edges),
        new LineBasicMaterial({ color: '#ece6d9', transparent: true, opacity: 0.12 }))];
  }
  private rim(color: string, opacity: number): Mesh {
    const m = new Mesh(new RingGeometry(HexGrid.R * 0.84, HexGrid.R * 0.95, 6, 1, Math.PI / 6),
      new MeshBasicMaterial({ color, transparent: true, opacity, depthWrite: false }));
    m.rotation.x = -Math.PI / 2; m.visible = false; m.renderOrder = 4; this.scene.add(m);
    return m;
  }
  private lifted(): string {
    const { width: w, height: h } = this.ground.grid;
    return `texture2D(uRise, vec2((mod(aCell, ${w}.) + .5) / ${w}., (floor(aCell / ${w}.) + .5) / ${h}.)).r`;
  }
  private readonly compile = (s: { uniforms: Record<string, { value: unknown }>; vertexShader: string }): void => {
    s.uniforms.uRise = { value: this.riseTexture };
    s.vertexShader = 'attribute float aCell; uniform sampler2D uRise;\n'
      + s.vertexShader.replace('#include <begin_vertex>', `#include <begin_vertex>\n transformed.y += ${this.lifted()};`);
  };
  private static cacheKey(): string { return 'risen'; }
  private risen<T extends Material>(m: T): T {
    m.onBeforeCompile = this.compile; m.customProgramCacheKey = BoardTiles.cacheKey;
    return m;
  }
  private risenWater(m: ShaderMaterial): ShaderMaterial {
    m.uniforms.uRise = { value: this.riseTexture };
    m.vertexShader = 'attribute float aCell; uniform sampler2D uRise;\n' + m.vertexShader.replace('vec4 w = modelMatrix * vec4(position, 1.0);',
      `vec3 q = position; q.y += ${this.lifted()}; vec4 w = modelMatrix * vec4(q, 1.0);`);
    return m;
  }
  private static near(points: Vector3[], x: number, z: number): number {
    return points.reduce((best, p) => Math.min(best, Math.hypot(p.x - x, p.z - z)), 9);
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
  // A hex top in rings about its centre, each ring's points along the hex's sides, and the triangles between rings.
  private static rings(): { points: [number, number][]; index: number[] } {
    const n = BoardTiles.RINGS, r = HexGrid.R * BoardGround.GAP, points: [number, number][] = [[0, 0]], start = [0],
      index: number[] = [];
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
    return { points, index };
  }
}
