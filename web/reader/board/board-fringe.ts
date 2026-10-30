import {
  CircleGeometry, Color, IcosahedronGeometry, InstancedMesh, Mesh, MeshLambertMaterial, Object3D, type Scene,
  type Vector2,
} from 'three';
import type { BoardGround } from './board-ground';
import { BoardUnder } from './board-under';
import { HexGrid } from './hex-grid';
import { Noise } from './noise';

// The country going on past what is known (the review's cartographic notes): next to the known land, a fringe of dim,
// shapeless masses, of wood and low ridge, sinking into the mist as they go further from it; and under all of it a
// ground reaching to the horizon, the colour of the land in general (water, where the country known is mostly
// water), lost in the haze long before it ends. Neither says anything true of the land not known: where the masses
// stand and how high is of no hex's own, only of where the known country ends, and the same each time it is drawn.
export class BoardFringe {
  // How far from the known land the masses go, in hexes.
  private static readonly REACH = 2.6;
  private static readonly tones = ['#3a4430', '#414634', '#47433a', '#373f37'].map(c => new Color(c));
  constructor(scene: Scene, ground: BoardGround, will: (c: number) => boolean) {
    const grid = ground.grid, known = grid.cells.filter(will).map(c => grid.centres[c]!);
    const wet = known.length > 0 && grid.cells.filter(c => will(c) && ground.wet(c)).length > known.length / 2;
    BoardFringe.horizon(scene, wet);
    const spots: [Vector2, number][] = [];
    for (let row = -3; row < grid.height + 3; row++) {
      for (let col = -3; col < grid.width + 3; col++) {
        const inside = col >= 0 && row >= 0 && col < grid.width && row < grid.height;
        if (inside && will(row * grid.width + col)) { continue; }
        const p = HexGrid.at(col, row), near = BoardFringe.nearest(p, known);
        if (near.d < BoardFringe.REACH && !(near.c !== undefined && ground.wet(grid.cellAt(near.c.x, near.c.y)!))) {
          spots.push([p, near.d]);
        }
      }
    }
    if (spots.length) { scene.add(BoardFringe.masses(spots)); }
  }
  // The known hex's centre nearest a point, and how far it is, in hexes.
  private static nearest(p: Vector2, known: Vector2[]): { d: number; c?: Vector2 } {
    let best: { d: number; c?: Vector2 } = { d: Infinity };
    for (const k of known) {
      const d = k.distanceTo(p);
      if (d < best.d) { best = { d, c: k }; }
    }
    return best;
  }
  // Three or four masses on each hex of the fringe, each lower the further it is from the known land, until it is
  // all but under the mist; some round and close as woods, some broad and low as the shoulders of hills.
  private static masses(spots: [Vector2, number][]): InstancedMesh {
    const material = new MeshLambertMaterial({ flatShading: true });
    const mesh = new InstancedMesh(new IcosahedronGeometry(1, 0).translate(0, 0.2, 0), material, spots.length * 4);
    const o = new Object3D();
    let n = 0;
    for (const [p, d] of spots) {
      const sink = Math.max(0, 1 - (d - 0.6) / (BoardFringe.REACH - 0.6));
      for (let k = 0; k < 4; k++) {
        const h = Noise.hash(p.x * 7.1 + k * 13, p.y * 5.3 - k * 7), wood = h > 0.45;
        if (Noise.hash(p.x * 3 + k, p.y * 3 - k) < 0.2) { continue; }
        const r = wood ? 0.13 + h * 0.08 : 0.24 + h * 0.14, tall = (wood ? 0.16 + h * 0.12 : 0.08 + h * 0.06) * sink;
        o.position.set(p.x + (Noise.hash(k, p.x * 9) - 0.5) * 0.7, BoardUnder.TOP - 0.06,
          p.y + (Noise.hash(p.y * 9, k) - 0.5) * 0.7);
        o.scale.set(r, Math.max(0.02, tall), r); o.rotation.y = h * 6.3; o.updateMatrix();
        mesh.setMatrixAt(n, o.matrix);
        mesh.setColorAt(n++, BoardFringe.tones[Math.floor(h * 3.99)]!.clone().multiplyScalar(0.8 + sink * 0.3));
      }
    }
    mesh.count = n; mesh.frustumCulled = false;
    return mesh;
  }
  // The ground under everything, out to the horizon and under the haze there.
  private static horizon(scene: Scene, wet: boolean): void {
    const ground = new Mesh(new CircleGeometry(400, 48).rotateX(-Math.PI / 2),
      new MeshLambertMaterial({ color: wet ? '#22303d' : '#2a2e24' }));
    ground.position.y = BoardUnder.TOP - 0.11; scene.add(ground);
  }
}
