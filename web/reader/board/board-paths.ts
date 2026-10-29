import { BufferGeometry, CatmullRomCurve3, Float32BufferAttribute, type Material, Mesh, type Scene,
  Vector3 } from 'three';
import type { HexGrid } from './hex-grid';
import type { BoardLand } from './board-types';
import { Noise } from './noise';

// Rivers and roads as the land's own: a river wandering in long bends from hex to hex, a road keeping straighter but
// never ruled, through the middle of a town; both laid over the land, and only where it stands known.
export class BoardPaths {
  readonly rivers: CatmullRomCurve3[];
  readonly roads: CatmullRomCurve3[];
  readonly riverPoints: Vector3[];
  readonly roadPoints: Vector3[];
  private meshes: Mesh[] = [];
  private drawn = '';
  constructor(private readonly grid: HexGrid, land: BoardLand, towns: Set<number>) {
    this.rivers = land.rivers.filter(r => r.length > 1).map((r, i) => this.meander(r, [0.34, 11 + i], towns));
    this.roads = Object.values(land.roads).filter(r => r.length > 1).map((r, i) => this.meander(r, [0.14, 31 + i],
      towns));
    this.riverPoints = this.rivers.flatMap(c => c.getSpacedPoints(Math.max(8, Math.round(c.getLength() / 0.06))));
    this.roadPoints = this.roads.flatMap(c => c.getSpacedPoints(Math.max(8, Math.round(c.getLength() / 0.06))));
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
  // Laid again over the land as it stands, when what stands has changed.
  lay(scene: Scene, ground: (x: number, z: number) => number, standing: (c: number) => boolean, kit: Record<string,
    Material>): void {
    const key = this.grid.cells.map(c => standing(c) ? 1 : 0).join('');
    if (key === this.drawn) { return; }
    this.drawn = key;
    scene.remove(...this.meshes); for (const m of this.meshes) { m.geometry.dispose(); }
    this.meshes = [
      ...this.rivers.map(c => new Mesh(this.ribbon(c, [0.08, 0.008], ground, standing), kit.river)),
      ...this.roads.flatMap(c => [new Mesh(this.ribbon(c, [0.06, 0.004], ground, standing), kit.verge),
        new Mesh(this.ribbon(c, [0.03, 0.007], ground, standing), kit.road)]),
    ];
    for (const m of this.meshes) { m.receiveShadow = true; scene.add(m); }
  }
  private ribbon(curve: CatmullRomCurve3, [width, lift]: [number, number], ground: (x: number, z: number) => number,
    standing: (c: number) => boolean): BufferGeometry {
    const n = Math.max(8, Math.round(curve.getLength() / 0.025)), pts = curve.getSpacedPoints(n), verts: number[] = [],
      idx: number[] = [];
    const there = pts.map(p => { const c = this.grid.cellAt(p.x, p.z); return c !== undefined && standing(c); });
    pts.forEach((p, i) => {
      const t = curve.getTangentAt(Math.min(1, i / n)), s = new Vector3(-t.z, 0, t.x).normalize()
        .multiplyScalar(width / 2 * (0.85 + Math.sin(i * 0.37) * 0.15));
      for (const q of [p.clone().add(s), p.clone().sub(s)]) { verts.push(q.x, ground(q.x, q.z) + lift, q.z); }
      if (i && there[i] && there[i - 1]) { const a = (i - 1) * 2; idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2); }
    });
    const g = new BufferGeometry(); g.setAttribute('position', new Float32BufferAttribute(verts, 3)); g.setIndex(idx);
    g.computeVertexNormals();
    return g;
  }
}
