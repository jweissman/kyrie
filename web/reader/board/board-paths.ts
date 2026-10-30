import { BufferAttribute, BufferGeometry, CatmullRomCurve3, Float32BufferAttribute, type Material, Mesh, type Scene,
  Vector3 } from 'three';
import type { HexGrid } from './hex-grid';
import type { BoardLand } from './board-types';
import { Noise } from './noise';
import { PathReach } from './path-reach';

// A ribbon of river or road as laid once over the land, with the hex under each of its points.
interface Ribbon { mesh: Mesh; cells: (number | undefined)[] }
// Rivers and roads as the land's own: a river wandering in long bends from hex to hex, a road keeping straighter but
// never ruled, through the middle of a town; both laid over the land, and only where it stands known.
export class BoardPaths {
  readonly rivers: CatmullRomCurve3[];
  readonly roads: CatmullRomCurve3[];
  // How near a point of the land is to a river or a road: a bank darker, a verge worn, nothing growing on either.
  readonly reach: { rivers: PathReach; roads: PathReach };
  private ribbons?: Ribbon[];
  // The hexes the rivers and roads cross, whose standing is all that decides which lengths of them are drawn.
  private crossed: number[] = [];
  private drawn = '';
  constructor(private readonly grid: HexGrid, land: BoardLand, towns: Set<number>) {
    this.rivers = land.rivers.filter(r => r.length > 1).map((r, i) => this.meander(r, [0.34, 11 + i], towns));
    this.roads = Object.values(land.roads).filter(r => r.length > 1).map((r, i) => this.meander(r, [0.14, 31 + i],
      towns));
    this.reach = { rivers: BoardPaths.along(this.rivers), roads: BoardPaths.along(this.roads) };
  }
  private static along(curves: CatmullRomCurve3[]): PathReach {
    return new PathReach(curves.flatMap(c => c.getSpacedPoints(Math.max(8, Math.round(c.getLength() / 0.06)))));
  }
  private meander(run: number[], [wander, seed]: [number, number], towns: Set<number>): CatmullRomCurve3 {
    const points: Vector3[] = [];
    run.forEach((c, i) => {
      const p = this.grid.centres[c]!, j = towns.has(c) ? 0 : wander * 0.7, n = run[i + 1];
      points.push(new Vector3(p.x + (Noise.hash(c, seed) - 0.5) * j, 0, p.y + (Noise.hash(c, seed + 1) - 0.5) * j));
      if (n === undefined) { return; }
      const q = this.grid.centres[n]!, dx = q.x - p.x, dz = q.y - p.y, len = Math.hypot(dx, dz);
      for (const [f, k] of [[0.3, 2], [0.5, 3], [0.7, 4]] as const) {
        const w = (Noise.hash(c * 7 + n, seed + k) - 0.5) * wander * (f === 0.5 ? 1.2 : 0.8);
        points.push(new Vector3(p.x + dx * f - dz / len * w, 0, p.y + dz * f + dx / len * w));
      }
    });
    return new CatmullRomCurve3(points, false, 'centripetal');
  }
  // Laid over the land as it stands: the ribbons made the first time, and after only which lengths of them are drawn
  // changed, when a hex they cross has come to stand or fallen.
  lay(scene: Scene, ground: (x: number, z: number) => number, standing: (c: number) => boolean, kit: Record<string,
    Material>): void {
    this.ribbons ??= this.make(scene, ground, kit);
    const key = this.crossed.map(c => standing(c) ? 1 : 0).join('');
    if (key === this.drawn) { return; }
    this.drawn = key;
    for (const r of this.ribbons) { BoardPaths.open(r, standing); }
  }
  private make(scene: Scene, ground: (x: number, z: number) => number, kit: Record<string, Material>): Ribbon[] {
    const ribbons = [
      ...this.rivers.map(c => this.ribbon(c, [0.08, 0.008], ground, kit.river!)),
      ...this.roads.flatMap(c => [this.ribbon(c, [0.06, 0.004], ground, kit.verge!),
        this.ribbon(c, [0.03, 0.007], ground, kit.road!)]),
    ];
    for (const r of ribbons) { r.mesh.receiveShadow = true; scene.add(r.mesh); }
    this.crossed = [...new Set(ribbons.flatMap(r => r.cells))].filter((c): c is number => c !== undefined);
    return ribbons;
  }
  private ribbon(curve: CatmullRomCurve3, [width, lift]: [number, number], ground: (x: number, z: number) => number,
    kit: Material): Ribbon {
    const n = Math.max(8, Math.round(curve.getLength() / 0.025)), pts = curve.getSpacedPoints(n), verts: number[] = [],
      index = new Uint32Array((pts.length - 1) * 6);
    pts.forEach((p, i) => {
      const t = curve.getTangentAt(Math.min(1, i / n)), s = new Vector3(-t.z, 0, t.x).normalize()
        .multiplyScalar(width / 2 * (0.85 + Math.sin(i * 0.37) * 0.15));
      for (const q of [p.clone().add(s), p.clone().sub(s)]) { verts.push(q.x, ground(q.x, q.z) + lift, q.z); }
      if (i) { const a = (i - 1) * 2; index.set([a, a + 1, a + 2, a + 1, a + 3, a + 2], (i - 1) * 6); }
    });
    const g = new BufferGeometry(); g.setAttribute('position', new Float32BufferAttribute(verts, 3));
    g.setIndex(new BufferAttribute(index, 1)); g.computeVertexNormals();
    return { mesh: new Mesh(g, kit), cells: pts.map(p => this.grid.cellAt(p.x, p.z)) };
  }
  // Only the lengths between points over standing hexes drawn, written to the front of the ribbon's triangles.
  private static open(r: Ribbon, standing: (c: number) => boolean): void {
    const g = r.mesh.geometry, index = g.index!, at = index.array;
    let n = 0;
    for (let i = 1; i < r.cells.length; i++) {
      const a = r.cells[i - 1], b = r.cells[i], v = (i - 1) * 2;
      if (a === undefined || b === undefined || !standing(a) || !standing(b)) { continue; }
      at.set([v, v + 1, v + 2, v + 1, v + 3, v + 2], n); n += 6;
    }
    g.setDrawRange(0, n); index.needsUpdate = true;
  }
}
