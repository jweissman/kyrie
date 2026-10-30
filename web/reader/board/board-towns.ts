import {
  BoxGeometry, type BufferGeometry, Color, ConeGeometry, CylinderGeometry, Group, type Material, Mesh,
  MeshBasicMaterial, MeshStandardMaterial, type Scene, Vector3,
} from 'three';
import type { BoardGround } from './board-ground';
import type { BoardLook } from './board-look';
import type { BoardMark } from './board-types';
import { Noise } from './noise';
import { Scatter, type Spot } from './scatter';

interface House {
  cell: number; x: number; z: number; w: number; h: number; d: number; turn: number; wall: Color; roof: Color;
}
// The towns: roofs close about a church tower, more of them where more roads meet, the larger behind a wall; a lamp
// lit in most windows and a glow over the whole at dusk. All the houses of the country are drawn as one, each standing
// up out of the mist with the hex it is on, as the country's growing things do; none on a hex the company does not
// know (about a town known only by hearsay), where it would never be seen.
export class BoardTowns {
  private static readonly walls = ['#cfc2a8', '#bdb099', '#d8ccb3', '#b9a88c'];
  private static readonly roofs = ['#7d3f2e', '#6b3a2c', '#8a4a33', '#5d4a3e'];
  readonly groups = new Map<number, Group[]>();
  // The houses, their roofs and their lit windows.
  readonly scatters: Scatter[];
  private readonly stone = new MeshStandardMaterial({ color: '#a39c8d', flatShading: true, roughness: 1 });
  private readonly tile = new MeshStandardMaterial({ color: '#6b3a2c', roughness: 0.8 });
  private readonly houses: House[] = [];
  private readonly known: Set<number>;
  constructor(private readonly scene: Scene, private readonly ground: BoardGround, look: BoardLook,
    towns: BoardMark[]) {
    this.known = new Set(ground.land.known);
    for (const t of towns) { this.town(t, look); }
    this.scatters = this.build();
  }
  private roads(c: number): number { return Object.values(this.ground.land.roads).filter(r => r.includes(c)).length; }
  private town(t: BoardMark, look: BoardLook): void {
    const p = this.ground.grid.centres[t.cell]!, n = 9 + this.roads(t.cell) * 7, reach = 0.1 + Math.sqrt(n) * 0.045,
      g = new Group();
    for (let k = 0; k < n; k++) {
      const a = k * 2.399 + Noise.hash(t.cell, k) * 0.6;
      const [x, z, cell] = this.lot(t.cell, a, 0.07 + Math.sqrt(k / n) * reach);
      if (cell === undefined || this.ground.wet(cell)) { continue; }
      this.houses.push({ cell, x, z, w: 0.055 + Noise.hash(k, t.cell) * 0.03, h: 0.04 + Noise.hash(k, 3) * 0.02,
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
    g.position.set(p.x, this.ground.levels[t.cell]!, p.y); g.userData.cell = t.cell;
    this.scene.add(g); this.groups.set(t.cell, [g]);
  }
  // Where a house stands: so far out from the town's middle at its turn about it; or, where that is on a hex the
  // company does not know, drawn in onto the town's own (within the hex's width, with room for the house).
  private lot(town: number, a: number, r: number): [number, number, number | undefined] {
    const p = this.ground.grid.centres[town]!, x = p.x + Math.cos(a) * r, z = p.y + Math.sin(a) * r;
    const cell = this.ground.grid.cellAt(x, z);
    if (cell === undefined || cell === town || this.known.has(cell) || r <= 0.42) { return [x, z, cell]; }
    return this.lot(town, a, 0.42);
  }
  // The houses, their roofs and their lit windows, each kind as one scatter, every house kept with the hex it is on.
  private build(): Scatter[] {
    const box = new BoxGeometry(1, 1, 1).translate(0, 0.5, 0),
      roof = new ConeGeometry(0.75, 1, 4).rotateY(Math.PI / 4).translate(0, 0.5, 0), up = new Vector3(0, 1, 0);
    const lit = this.houses.filter((_, i) => Noise.hash(i, 5) < 0.6), white = new Color('#ffffff');
    const walls = this.scatter([box, new MeshStandardMaterial({ roughness: 0.9 })],
      this.houses.map(h => this.spot(h, [0, -0.01, 0], [h.w, h.h + 0.01, h.d], h.wall)));
    const roofs = this.scatter([roof, new MeshStandardMaterial({ roughness: 0.8, flatShading: true })],
      this.houses.map(h => this.spot(h, [0, h.h, 0], [h.w * 1.05, h.h * 0.9, h.d * 1.25], h.roof)));
    const windows = this.scatter([new BoxGeometry(1, 1, 1), new MeshBasicMaterial({ color: '#ffc46a' })], lit.map(h => {
      const at = new Vector3(0, h.h * 0.5, h.d / 2 + 0.002).applyAxisAngle(up, h.turn);
      return this.spot(h, [at.x, at.y, at.z], [0.014, 0.012, 0.004], white);
    }));
    windows.mesh.castShadow = false;
    return [walls, roofs, windows];
  }
  // One part of a house: set off from where the house stands on the ground, so wide, high and deep, in its colour.
  private spot(h: House, [dx, dy, dz]: [number, number, number], [w, tall, deep]: [number, number, number],
    c: Color): Spot {
    return { cell: h.cell, x: h.x + dx, z: h.z + dz, y: this.ground.at(h.x, h.z) + dy, s: w, sy: tall / w, sz: deep / w,
      c, r: h.turn };
  }
  private scatter(kit: [BufferGeometry, Material], spots: Spot[]): Scatter {
    return new Scatter(this.scene, kit, spots, (x, z) => this.ground.at(x, z));
  }
  private static mesh(g: BufferGeometry, m: Material, y: number): Mesh {
    const o = new Mesh(g, m); o.position.y = y; o.castShadow = o.receiveShadow = true;
    if (g instanceof ConeGeometry) { o.rotation.y = Math.PI / 4; }
    return o;
  }
}
