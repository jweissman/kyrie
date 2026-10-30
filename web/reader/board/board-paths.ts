import {
  BufferAttribute, BufferGeometry, CatmullRomCurve3, Color, Float32BufferAttribute, type Material, Mesh,
  MeshStandardMaterial, type Scene, type ShaderMaterial, Vector3,
} from 'three';
import { BoardGround } from './board-ground';
import type { HexGrid } from './hex-grid';
import type { BoardLand } from './board-types';
import { Noise } from './noise';
import { PathReach } from './path-reach';

// A ribbon of river or road as laid once over the land, how many points it has across, and the hex under each of its
// points along.
interface Ribbon { mesh: Mesh; across: number; cells: (number | undefined)[] }
type Ground = (x: number, z: number) => number;
// Rivers and roads as the land's own: each goes from hex to hex in long curves, its corners cut, and wanders aside
// from that in slow bends along its length (a river further than a road), straightening as it comes into a town, so
// that a road goes through the middle of it. A river runs in the bed the ground has cut for it (see BoardGround), its
// water level from bank to bank and the banks rising out of it; a road is a worn track, the land's own earth showing
// through, soft at its edges. Both only where the land they cross stands known.
export class BoardPaths {
  private static readonly earth = new Color('#a08a63');
  readonly rivers: CatmullRomCurve3[];
  readonly roads: CatmullRomCurve3[];
  // How near a point of the land is to a river or a road: a bed and its banks, a verge worn, nothing growing on either.
  readonly reach: { rivers: PathReach; roads: PathReach };
  // The hexes a river's bed is cut into, whose tops are made the finer for it; and those a road crosses, where a
  // wood's canopy opens along it and is made finer too (made coarsely, the opening was a white saw's edge: OWN-49).
  readonly beds = new Set<number>();
  readonly tracks = new Set<number>();
  private ribbons?: Ribbon[];
  // The hexes the rivers and roads cross, whose standing is all that decides which lengths of them are drawn.
  private crossed: number[] = [];
  private drawn = '';
  constructor(private readonly grid: HexGrid, land: BoardLand, towns: Set<number>) {
    this.rivers = land.rivers.filter(r => r.length > 1).map((r, i) => this.meander(r, [0.2, 11 + i], towns));
    this.roads = Object.values(land.roads).filter(r => r.length > 1).map((r, i) => this.meander(r, [0.08, 31 + i],
      towns));
    this.reach = { rivers: BoardPaths.along(this.rivers, 0.02), roads: BoardPaths.along(this.roads, 0.05) };
    for (const c of this.roads) {
      for (const p of c.getSpacedPoints(Math.round(c.getLength() / 0.04))) {
        const cell = grid.cellAt(p.x, p.z);
        if (cell !== undefined) { this.tracks.add(cell); }
      }
    }
    for (const c of this.rivers) {
      for (const p of c.getSpacedPoints(Math.round(c.getLength() / 0.04))) {
        for (const [dx, dz] of [[0, 0], [0.09, 0], [-0.09, 0], [0, 0.09], [0, -0.09]] as const) {
          const cell = grid.cellAt(p.x + dx, p.z + dz);
          if (cell !== undefined) { this.beds.add(cell); }
        }
      }
    }
  }
  private static along(curves: CatmullRomCurve3[], step: number): PathReach {
    return new PathReach(curves.flatMap(c => c.getSpacedPoints(Math.max(8, Math.round(c.getLength() / step)))));
  }
  // A run of hexes as a way goes over them: its corners cut twice (but at its ends and in its towns), then wandered
  // aside along its length by so much at most, smoothly, the less the nearer a town.
  private meander(run: number[], [wander, seed]: [number, number], towns: Set<number>): CatmullRomCurve3 {
    let line = run.map(c => new Vector3(this.grid.centres[c]!.x, 0, this.grid.centres[c]!.y)),
      kept = run.map((c, i) => i === 0 || i === run.length - 1 || towns.has(c));
    [line, kept] = BoardPaths.cut(...BoardPaths.cut(line, kept));
    const base = new CatmullRomCurve3(line, false, 'centripetal'), length = base.getLength(),
      n = Math.max(4, Math.round(length / 0.08)), stops = run.filter(c => towns.has(c)).map(c => this.grid.centres[c]!);
    const points: Vector3[] = [];
    for (let i = 0; i <= n; i++) {
      const t = i / n, p = base.getPointAt(t), d = base.getTangentAt(t),
        town = Math.min(9, ...stops.map(s => Math.hypot(s.x - p.x, s.y - p.z)));
      const w = (Noise.value(t * length * 1.25 + seed * 7.3, seed) - 0.5) * 2 * wander
        * Math.min(1, Math.max(0, (town - 0.06) / 0.4)) * Math.min(1, i / 3, (n - i) / 3);
      points.push(p.add(new Vector3(-d.z, 0, d.x).multiplyScalar(w)));
    }
    return new CatmullRomCurve3(points, false, 'centripetal');
  }
  // A line's corners cut: each length's quarter and three-quarter points in place of its corners, but for the
  // corners to be kept.
  private static cut(line: Vector3[], keep: boolean[]): [Vector3[], boolean[]] {
    const out = [line[0]!.clone()], kept = [true];
    for (let i = 0; i < line.length - 1; i++) {
      const a = line[i]!, b = line[i + 1]!;
      if (i > 0 && keep[i]) { out.push(a.clone()); kept.push(true); }
      out.push(a.clone().lerp(b, 0.25), a.clone().lerp(b, 0.75)); kept.push(false, false);
    }
    out.push(line.at(-1)!.clone()); kept.push(true);
    return [out, kept];
  }
  // Laid over the land as it stands: the ribbons made the first time, and after only which lengths of them are drawn
  // changed, when a hex they cross has come to stand or fallen.
  lay(scene: Scene, ground: Ground, standing: (c: number) => boolean, water: ShaderMaterial): void {
    this.ribbons ??= this.make(scene, ground, water);
    const key = this.crossed.map(c => standing(c) ? 1 : 0).join('');
    if (key === this.drawn) { return; }
    this.drawn = key;
    for (const r of this.ribbons) { BoardPaths.open(r, standing); }
  }
  private make(scene: Scene, ground: Ground, water: ShaderMaterial): Ribbon[] {
    const track = new MeshStandardMaterial({ vertexColors: true, transparent: true, depthWrite: false, roughness: 1,
      polygonOffset: true, polygonOffsetFactor: -2 });
    water.side = 2;
    const ribbons = [...this.rivers.map(c => this.ribbon(c, 'river', ground, water)),
      ...this.roads.map(c => this.ribbon(c, 'road', ground, track))];
    for (const r of ribbons) { r.mesh.receiveShadow = true; scene.add(r.mesh); }
    this.crossed = [...new Set(ribbons.flatMap(r => r.cells))].filter((c): c is number => c !== undefined);
    return ribbons;
  }
  // A river level from bank to bank, a little below the land about it, in its bed; a road's track over the land as
  // it lies, its earth showing most along its middle and fading out at its edges, wider and narrower as it goes.
  private ribbon(curve: CatmullRomCurve3, kind: 'river' | 'road', ground: Ground, kit: Material): Ribbon {
    const river = kind === 'river', n = Math.max(8, Math.round(curve.getLength() / 0.025)),
      pts = curve.getSpacedPoints(n), across = river ? [-1, 1] : [-1, 0, 1], verts: number[] = [], col: number[] = [];
    pts.forEach((p, i) => {
      const t = curve.getTangentAt(Math.min(1, i / n)), s = new Vector3(-t.z, 0, t.x).normalize(),
        half = river ? 0.066 * Math.min(1, 0.3 + 2.8 * i / n) : 0.046 * (0.85 + Math.sin(i * 0.31) * 0.15),
        level = ground(p.x, p.z) + BoardGround.BED - 0.016;
      for (const k of across) {
        const q = p.clone().addScaledVector(s, k * half);
        verts.push(q.x, river ? level : ground(q.x, q.z) + 0.005, q.z);
        col.push(BoardPaths.earth.r, BoardPaths.earth.g, BoardPaths.earth.b, k ? 0 : 0.9);
      }
    });
    const g = new BufferGeometry(); g.setAttribute('position', new Float32BufferAttribute(verts, 3));
    if (!river) { g.setAttribute('color', new Float32BufferAttribute(col, 4)); }
    g.setIndex(new BufferAttribute(BoardPaths.strip(pts.length, across.length), 1)); g.computeVertexNormals();
    return { mesh: new Mesh(g, kit), across: across.length, cells: pts.map(p => this.grid.cellAt(p.x, p.z)) };
  }
  // The triangles of a ribbon so many points across, length by length.
  private static strip(along: number, across: number): Uint32Array {
    const index = new Uint32Array((along - 1) * (across - 1) * 6);
    for (let i = 1; i < along; i++) {
      for (let j = 0; j < across - 1; j++) {
        const a = (i - 1) * across + j, b = a + across;
        index.set([a, a + 1, b, a + 1, b + 1, b], ((i - 1) * (across - 1) + j) * 6);
      }
    }
    return index;
  }
  // Only the lengths between points over standing hexes drawn, written to the front of the ribbon's triangles.
  private static open(r: Ribbon, standing: (c: number) => boolean): void {
    const g = r.mesh.geometry, index = g.index!, at = index.array;
    let n = 0;
    for (let i = 1; i < r.cells.length; i++) {
      const a = r.cells[i - 1], b = r.cells[i];
      if (a === undefined || b === undefined || !standing(a) || !standing(b)) { continue; }
      for (let j = 0; j < r.across - 1; j++) {
        const v = (i - 1) * r.across + j, w = v + r.across;
        at.set([v, v + 1, w, v + 1, w + 1, w], n); n += 6;
      }
    }
    g.setDrawRange(0, n); index.needsUpdate = true;
  }
}
