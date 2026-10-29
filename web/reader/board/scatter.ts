import { type BufferGeometry, Color, InstancedMesh, type Material, Object3D, type Scene } from 'three';

// Where one small thing stands: its hex, its point, its size (and height, if not the same), its colour, its turn.
export interface Spot { cell: number; x: number; z: number; s: number; c: Color; r: number; sy?: number; y?: number }
// Many small things of one kind drawn as one, each belonging to its hex and moved or hidden with it.
export class Scatter {
  readonly mesh: InstancedMesh;
  constructor(scene: Scene, [geometry, material]: [BufferGeometry, Material], readonly spots: Spot[],
    private readonly ground: (x: number, z: number) => number) {
    this.mesh = new InstancedMesh(geometry, material, Math.max(1, spots.length)); this.mesh.count = spots.length;
    spots.forEach((p, i) => this.mesh.setColorAt(i, p.c));
    this.mesh.castShadow = this.mesh.receiveShadow = true; scene.add(this.mesh);
    this.place(() => [0, true]);
  }
  place(by: (cell: number) => [number, boolean]): void {
    const o = new Object3D();
    this.spots.forEach((p, i) => {
      const [dy, shown] = by(p.cell), s = shown ? p.s : 0.0001;
      o.position.set(p.x, (p.y ?? this.ground(p.x, p.z)) + dy, p.z); o.rotation.set(0, p.r, 0);
      o.scale.set(s, s * (p.sy ?? 1), s); o.updateMatrix(); this.mesh.setMatrixAt(i, o.matrix);
    });
    this.mesh.instanceMatrix.needsUpdate = true;
  }
  static spot(cell: number, [x, z]: [number, number], s: number, color: string): Spot {
    return { cell, x, z, s, c: new Color(color), r: (x * 7.1 + z * 3.3) % 6.28 };
  }
}
