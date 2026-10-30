import {
  BoxGeometry, type BufferGeometry, CatmullRomCurve3, CircleGeometry, ConeGeometry, CylinderGeometry,
    DodecahedronGeometry, DoubleSide,
  Group, IcosahedronGeometry, InstancedMesh, type Material, Mesh, MeshBasicMaterial, MeshStandardMaterial, Object3D,
    PlaneGeometry, type Scene,
  SphereGeometry, TorusGeometry, Vector3,
} from 'three';
import type { BoardGround } from './board-ground';
import type { BoardLook } from './board-look';
import type { BoardMark } from './board-types';
import { Noise } from './noise';

// Each place known stands on its hex in its own form, half again as large as life so that it reads from the height
// of the map: a tower with its battlements, a lit window and a pennant; broken walls about an arch; a cave's mouth in
// its rocks; stepping-stones; a standing stone; a camp's tent and fire; a cairn where wild country is entered. You are
// a lantern on a staff; where you are bound, a gold pennant, the way there dotted over the land in gold; the way to
// what is only chosen, dotted paler.
export class BoardPlaces {
  private readonly stone = new MeshStandardMaterial({ color: '#a39c8d', flatShading: true, roughness: 1 });
  private readonly timber = new MeshStandardMaterial({ color: '#4a3826', roughness: 0.9 });
  private readonly gold = new MeshBasicMaterial({ color: '#f2bd4c', side: DoubleSide });
  private readonly pale = new MeshBasicMaterial({ color: '#ece6d9', transparent: true, opacity: 0.6 });
  private readonly ways: Record<'bound' | 'chosen', Object3D[]> = { bound: [], chosen: [] };
  constructor(private readonly scene: Scene, private readonly ground: BoardGround, private readonly look: BoardLook) {}
  place(m: BoardMark): Group {
    const g = new Group(), kind = m.kind;
    if (kind === 'tower') { this.tower(g, /square/.test(m.name)); }
    else if (kind === 'ruin') { this.ruin(g, m.cell); }
    else if (kind === 'cave') { this.cave(g, m.cell); }
    else if (kind === 'ford') { for (let k = 0; k < 7; k++) { g.add(this.put(new CylinderGeometry(0.022, 0.026, 0.03,
      6), [k * 0.045 - 0.135, 0.01, (k % 2) * 0.03 - 0.015])); } }
    else if (kind === 'stone') { const s = this.put(new BoxGeometry(0.05, 0.24, 0.035),
      [0, 0.11, 0]); s.rotation.set(0, 0.4, 0.07); g.add(s); }
    else if (kind === 'camp') {
      g.add(this.put(new ConeGeometry(0.08, 0.12, 5), [0, 0.06, 0], new MeshStandardMaterial({ color: '#8a7550' })),
        this.look.glow(new Vector3(0.1, 0.05, 0.06), 0.4, 0.6));
    } else { this.lesser(g, kind, m.cell); }
    return this.stand(g, m.cell);
  }
  // A shrine under its roof, a barrow with its door, a tarn, a crag, a grove; else a cairn where a way goes in.
  private lesser(g: Group, kind: string, cell: number): void {
    if (kind === 'shrine') {
      g.add(this.put(new BoxGeometry(0.08, 0.07, 0.06), [0, 0.035, 0]),
        this.put(new ConeGeometry(0.07, 0.06, 4).rotateY(Math.PI / 4), [0, 0.1, 0],
          new MeshStandardMaterial({ color: '#6b3a2c' })));
    } else if (kind === 'barrow') {
      g.add(this.put(new SphereGeometry(0.13, 12, 6, 0, Math.PI * 2, 0, Math.PI / 2).scale(1, 0.55, 1), [0, 0, 0],
        new MeshStandardMaterial({ color: '#55653a', flatShading: true })), this.put(new BoxGeometry(0.035, 0.04,
          0.02), [0, 0.02, 0.115]));
    } else if (kind === 'tarn') {
      g.add(this.put(new CircleGeometry(0.13, 14).rotateX(-Math.PI / 2), [0, 0.006, 0],
        new MeshStandardMaterial({ color: '#2a5878', roughness: 0.2 })));
    } else if (kind === 'crag') {
      for (let k = 0; k < 4; k++) { g.add(this.put(new DodecahedronGeometry(0.06 + Noise.hash(k, cell) * 0.04,
        0).scale(0.8, 1.6, 0.8), [(k - 1.5) * 0.06, 0.07, (k % 2) * 0.04])); }
    } else if (kind === 'grove') {
      for (let k = 0; k < 6; k++) {
        const a = k * Math.PI / 3,
          crown = this.put(new IcosahedronGeometry(0.06, 0), [Math.cos(a) * 0.11, 0.13, Math.sin(a) * 0.11],
          new MeshStandardMaterial({ color: '#3f6a3e', flatShading: true }));
        const trunk = new CylinderGeometry(0.008, 0.012, 0.09, 5);
        g.add(crown, this.put(trunk, [Math.cos(a) * 0.11, 0.045, Math.sin(a) * 0.11], this.timber));
      }
    } else { for (let k = 0; k < 6; k++) { g.add(this.put(new DodecahedronGeometry(0.04 - k * 0.005, 0),
      [0, 0.03 + k * 0.045, 0])); } }
  }
  private tower(g: Group, square: boolean): void {
    g.add(this.put(square ? new BoxGeometry(0.11, 0.52, 0.11) : new CylinderGeometry(0.05, 0.065, 0.52, 10),
      [0, 0.26, 0]));
    for (let k = 0; k < 8; k++) { g.add(this.put(new BoxGeometry(0.024, 0.04, 0.024),
      [Math.cos(k * Math.PI / 4) * 0.05, 0.54, Math.sin(k * Math.PI / 4) * 0.05])); }
    g.add(this.put(new BoxGeometry(0.016, 0.026, 0.004), [0, 0.4, square ? 0.056 : 0.06],
      new MeshBasicMaterial({ color: '#ffc46a' })),
      this.put(new CylinderGeometry(0.004, 0.004, 0.16, 5), [0, 0.62, 0], this.timber),
      this.put(new PlaneGeometry(0.07, 0.04), [0.035, 0.67, 0],
        new MeshStandardMaterial({ color: '#7a2e24', side: DoubleSide })));
  }
  private ruin(g: Group, cell: number): void {
    for (let k = 0; k < 6; k++) {
      const h = 0.05 + Noise.hash(k, cell) * 0.14,
        w = this.put(new BoxGeometry(0.16, h, 0.03), [Math.cos(k * 1.05) * 0.1, h / 2, Math.sin(k * 1.05) * 0.1]);
      w.rotation.y = k * 1.05 + 1.57; g.add(w);
    }
    g.add(this.put(new TorusGeometry(0.05, 0.014, 6, 10, Math.PI), [0, 0.12, 0.1]),
      this.put(new BoxGeometry(0.03, 0.12, 0.03), [-0.05, 0.06, 0.1]),
      this.put(new BoxGeometry(0.03, 0.12, 0.03), [0.05, 0.06, 0.1]));
  }
  private cave(g: Group, cell: number): void {
    for (let k = 0; k < 5; k++) {
      const r = this.put(new DodecahedronGeometry(0.07 + Noise.hash(k, cell) * 0.05, 0),
        [(k - 2) * 0.055, 0.04 + (k % 2) * 0.04, -0.03 - (k % 2) * 0.03]);
      r.scale.set(1.1, 0.9, 1); g.add(r);
    }
    const mouth = this.put(new CircleGeometry(0.06, 14, 0, Math.PI), [0, 0.005, 0.035],
      new MeshBasicMaterial({ color: '#07080a' }));
    mouth.castShadow = false; g.add(mouth);
  }
  // Where you are: on a hex a town or a place stands on, set toward the near side of it, so as not to be lost in it.
  lantern(cell: number, aside: number): Group {
    const g = new Group(),
      gem = this.put(new CylinderGeometry(0, 0.045, 0.06, 4), [0, 0.26, 0],
        new MeshBasicMaterial({ color: '#ffd27a' }));
    g.add(gem, this.put(new CylinderGeometry(0.006, 0.006, 0.24, 6), [0, 0.12, 0], this.timber),
      this.look.glow(new Vector3(0, 0.25, 0), 0.7, 0.85));
    this.stand(g, cell).position.z += aside;
    return g;
  }
  // A way over the land as it is drawn (at): where you are bound, or to what is chosen. The way shown before is taken
  // away, and its shapes given back (what they are made of is kept for the next).
  way(which: 'bound' | 'chosen', cells: number[], at: (x: number, z: number) => number): void {
    this.scene.remove(...this.ways[which]);
    for (const o of this.ways[which]) { o.traverse(x => BoardPlaces.free(x)); }
    this.ways[which] = [];
    if (cells.length < 2) { return; }
    const grid = this.ground.grid, end = grid.centres[cells.at(-1)!]!;
    const curve = new CatmullRomCurve3(cells.map(c => new Vector3(grid.centres[c]!.x, 0, grid.centres[c]!.y)), false,
      'centripetal');
    const n = Math.round(curve.getLength() / 0.15), o = new Object3D(),
      dots = new InstancedMesh(new CircleGeometry(0.028, 10), which === 'bound' ? this.gold : this.pale, n);
    for (let i = 0; i < n; i++) {
      const p = curve.getPointAt((i + 0.5) / n);
      o.position.set(p.x, at(p.x, p.z) + 0.02, p.z); o.rotation.set(-Math.PI / 2, 0, 0);
      o.updateMatrix(); dots.setMatrixAt(i, o.matrix);
    }
    dots.renderOrder = 5; this.ways[which] = [dots];
    if (which === 'bound') {
      const flag = new Group();
      flag.add(this.put(new CylinderGeometry(0.006, 0.006, 0.5, 6), [0, 0.25, 0], this.timber),
        this.put(new PlaneGeometry(0.15, 0.09), [0.075, 0.45, 0], this.gold));
      flag.position.set(end.x, at(end.x, end.y), end.y); this.ways.bound.push(flag);
    }
    this.scene.add(...this.ways[which]);
  }
  private static free(o: Object3D): void {
    (o as Partial<Mesh>).geometry?.dispose();
    if (o instanceof InstancedMesh) { o.dispose(); }
  }
  private stand(g: Group, cell: number): Group {
    const p = this.ground.grid.centres[cell]!; g.position.set(p.x, this.ground.levels[cell]!, p.y);
    g.userData.cell = cell;
    return g;
  }
  private put(g: BufferGeometry, [x, y, z]: [number, number, number], m: Material = this.stone): Mesh {
    const o = new Mesh(g, m); o.position.set(x, y, z); o.castShadow = o.receiveShadow = true;
    return o;
  }
}
