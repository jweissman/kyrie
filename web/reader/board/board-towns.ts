import {
  BoxGeometry, type BufferGeometry, Color, ConeGeometry, CylinderGeometry, Group, InstancedMesh, type Material, Mesh,
  MeshBasicMaterial, MeshStandardMaterial, Object3D, type Scene, Vector3,
} from 'three';
import type { BoardGround } from './board-ground';
import type { BoardLook } from './board-look';
import type { BoardMark } from './board-types';
import { Noise } from './noise';

interface House {
  cell: number; x: number; z: number; w: number; h: number; d: number; turn: number; wall: Color; roof: Color;
}
// The towns: roofs close about a church tower, more of them where more roads meet, the larger behind a wall; a lamp
// lit in most windows and a glow over the whole at dusk. All the houses of the country are drawn as one.
export class BoardTowns {
  private static readonly walls = ['#cfc2a8', '#bdb099', '#d8ccb3', '#b9a88c'];
  private static readonly roofs = ['#7d3f2e', '#6b3a2c', '#8a4a33', '#5d4a3e'];
  readonly groups = new Map<number, Group[]>();
  private readonly stone = new MeshStandardMaterial({ color: '#a39c8d', flatShading: true, roughness: 1 });
  private readonly tile = new MeshStandardMaterial({ color: '#6b3a2c', roughness: 0.8 });
  private readonly houses: House[] = [];
  constructor(private readonly scene: Scene, private readonly ground: BoardGround, look: BoardLook,
    towns: BoardMark[]) {
    for (const t of towns) { this.town(t, look); }
    this.build();
  }
  private roads(c: number): number { return Object.values(this.ground.land.roads).filter(r => r.includes(c)).length; }
  private town(t: BoardMark, look: BoardLook): void {
    const p = this.ground.grid.centres[t.cell]!, n = 9 + this.roads(t.cell) * 7, reach = 0.1 + Math.sqrt(n) * 0.045,
      g = new Group();
    for (let k = 0; k < n; k++) {
      const a = k * 2.399 + Noise.hash(t.cell, k) * 0.6, r = 0.07 + Math.sqrt(k / n) * reach;
      const x = p.x + Math.cos(a) * r, z = p.y + Math.sin(a) * r, cell = this.ground.grid.cellAt(x, z);
      if (cell === undefined || this.ground.wet(cell)) { continue; }
      this.houses.push({ cell: t.cell, x, z, w: 0.055 + Noise.hash(k, t.cell) * 0.03, h: 0.04 + Noise.hash(k, 3) * 0.02,
        d: 0.045 + Noise.hash(t.cell, k + 7) * 0.015, turn: a + Math.PI / 2, wall: new Color(BoardTowns.walls[k % 4]!),
        roof: new Color(BoardTowns.roofs[(k + 1) % 4]!) });
    }
    g.add(BoardTowns.mesh(new BoxGeometry(0.06, 0.26, 0.06), this.stone, 0.13),
      BoardTowns.mesh(new ConeGeometry(0.055, 0.14, 4), this.tile, 0.33));
    if (this.roads(t.cell) >= 2) {
      g.add(BoardTowns.mesh(new CylinderGeometry(reach + 0.1, reach + 0.1, 0.05, 28, 1, true),
        new MeshStandardMaterial({ color: '#8f8878', roughness: 1, side: 2 }), 0.02));
    }
    g.add(look.glow(new Vector3(0, 0.12, 0), 0.9 + reach * 2, 0.32));
    g.position.set(p.x, this.ground.levels[t.cell]!, p.y); this.scene.add(g); this.groups.set(t.cell, [g]);
  }
  // The houses, their roofs and their lit windows, each as one instanced mesh.
  private build(): void {
    const box = new BoxGeometry(1, 1, 1).translate(0, 0.5, 0),
      roof = new ConeGeometry(0.75, 1, 4).rotateY(Math.PI / 4).translate(0, 0.5, 0);
    const lit = this.houses.filter((_, i) => Noise.hash(i, 5) < 0.6), o = new Object3D();
    this.instance([box, new MeshStandardMaterial({ roughness: 0.9 })], this.houses,
      h => [this.y(h) - 0.01, h.w, h.h + 0.01, h.d, h.wall]);
    this.instance([roof, new MeshStandardMaterial({ roughness: 0.8, flatShading: true })], this.houses,
      h => [this.y(h) + h.h, h.w * 1.05, h.h * 0.9, h.d * 1.25, h.roof]);
    const windows = this.instance([new BoxGeometry(1, 1, 1), new MeshBasicMaterial({ color: '#ffc46a' })], lit, h => {
      o.position.set(0, h.h * 0.5, h.d / 2 + 0.002).applyAxisAngle(new Vector3(0, 1, 0), h.turn);
      return [this.y(h) + o.position.y, 0.014, 0.012, 0.004, new Color('#ffffff'), o.position.x, o.position.z];
    });
    windows.castShadow = false;
  }
  private y(h: House): number { return this.ground.at(h.x, h.z); }
  private instance([geometry, material]: [BufferGeometry, Material], houses: House[],
    shape: (h: House) => [number, number, number, number, Color, number?, number?]): InstancedMesh {
    const m = new InstancedMesh(geometry, material, Math.max(1, houses.length)), o = new Object3D();
    m.count = houses.length;
    houses.forEach((h, i) => {
      const [y, sx, sy, sz, color, dx, dz] = shape(h);
      o.position.set(h.x + (dx ?? 0), y, h.z + (dz ?? 0)); o.rotation.set(0, h.turn, 0); o.scale.set(sx, sy, sz);
      o.updateMatrix();
      m.setMatrixAt(i, o.matrix); m.setColorAt(i, color);
    });
    m.castShadow = m.receiveShadow = true; this.scene.add(m);
    return m;
  }
  private static mesh(g: BufferGeometry, m: Material, y: number): Mesh {
    const o = new Mesh(g, m); o.position.y = y; o.castShadow = o.receiveShadow = true;
    if (g instanceof ConeGeometry) { o.rotation.y = Math.PI / 4; }
    return o;
  }
}
