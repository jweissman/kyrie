import { type BufferGeometry, Color, InstancedMesh, type Material, Object3D, type Scene } from 'three';

// Where one small thing stands: its hex, its point, its size (and height and depth, if not the same), its colour, its
// turn, and the ground under it.
export interface Spot {
  cell: number; x: number; z: number; s: number; c: Color; r: number; sy?: number; sz?: number; y?: number;
}
// Many small things of one kind drawn as one, each belonging to its hex and moved or hidden with it; kept hex by hex,
// so that when some hexes move only their things are moved, and only those sent again to be drawn.
export class Scatter {
  readonly mesh: InstancedMesh;
  private readonly spots: Spot[];
  // Where each hex's things lie among them all: the first, and how many.
  private readonly runs = new Map<number, [number, number]>();
  private readonly o = new Object3D();
  constructor(scene: Scene, [geometry, material]: [BufferGeometry, Material], spots: Spot[],
    ground: (x: number, z: number) => number) {
    this.spots = [...spots].sort((a, b) => a.cell - b.cell);
    this.mesh = new InstancedMesh(geometry, material, Math.max(1, spots.length)); this.mesh.count = spots.length;
    this.spots.forEach((p, i) => {
      p.y ??= ground(p.x, p.z); this.mesh.setColorAt(i, p.c);
      const run = this.runs.get(p.cell);
      if (run) { run[1]++; } else { this.runs.set(p.cell, [i, 1]); }
    });
    this.mesh.castShadow = this.mesh.receiveShadow = true; scene.add(this.mesh);
  }
  // The things of the given hexes (of every hex, if none are given) stood as far up or down as their hex, or hidden.
  place(by: (cell: number) => [number, boolean], cells?: number[]): void {
    const matrix = this.mesh.instanceMatrix;
    for (const c of cells ?? this.runs.keys()) {
      const run = this.runs.get(c);
      if (!run) { continue; }
      const [dy, shown] = by(c);
      for (let i = run[0]; i < run[0] + run[1]; i++) { this.put(i, dy, shown); }
      if (cells) { matrix.addUpdateRange(run[0] * 16, run[1] * 16); }
      matrix.needsUpdate = true;
    }
    if (!cells && this.spots.length) { matrix.addUpdateRange(0, this.spots.length * 16); }
  }
  private put(i: number, dy: number, shown: boolean): void {
    const p = this.spots[i]!, s = shown ? p.s : 0.0001, o = this.o;
    o.position.set(p.x, p.y! + dy, p.z); o.rotation.set(0, p.r, 0); o.scale.set(s, s * (p.sy ?? 1), s * (p.sz ?? 1));
    o.updateMatrix(); this.mesh.setMatrixAt(i, o.matrix);
  }
  static spot(cell: number, [x, z]: [number, number], s: number, color: string): Spot {
    return { cell, x, z, s, c: new Color(color), r: (x * 7.1 + z * 3.3) % 6.28 };
  }
}
