import {
  BufferAttribute, Color, CylinderGeometry, InstancedBufferAttribute, InstancedMesh, MathUtils, MeshLambertMaterial,
  Object3D, type Scene,
} from 'three';
import { BoardGround } from './board-ground';
import { HexGrid } from './hex-grid';
import { Noise } from './noise';

// The land the company does not know, and the land past the country's edge: low, dim tiles with nothing on them,
// under the mist, all of them one mesh. Their tones are a country's in general and not their own hex's (the unknown
// gives nothing away of what it is), mottled, each a little higher or lower than the next; past the edge they go on,
// fainter and fainter, until they are lost in the haze, and are water where the shore known at the edge is water.
// What is known stands up over them, its tiles rising out of them as it comes to be known.
export class BoardUnder {
  static readonly TOP = 0.03;
  // How many hexes past the country's edge the land goes on before it is lost in the haze.
  static readonly REACH = 12;
  private static readonly lands = ['#2f3527', '#3a3828', '#2b322b', '#3d372a'].map(c => new Color(c));
  private static readonly water = new Color('#2b3c4b');
  readonly mesh: InstancedMesh;
  private readonly known: Set<number>;
  constructor(scene: Scene, private readonly ground: BoardGround) {
    const grid = ground.grid, n = BoardUnder.REACH, spots: [number, number][] = [];
    this.known = new Set(ground.land.known);
    for (let row = -n; row < grid.height + n; row++) {
      for (let col = -n; col < grid.width + n; col++) { spots.push([col, row]); }
    }
    const material = new MeshLambertMaterial({ vertexColors: true });
    material.onBeforeCompile = BoardUnder.faded;
    this.mesh = new InstancedMesh(BoardUnder.slab(), material, spots.length);
    const fade = new Float32Array(spots.length), o = new Object3D();
    spots.forEach(([col, row], i) => {
      const p = HexGrid.at(col, row), far = this.beyond(col, row), wet = far > 0 && this.shore(col, row);
      o.position.set(p.x, BoardUnder.TOP + (wet ? -0.006 : (Noise.hash(col + 99, row + 99) - 0.5) * 0.022), p.y);
      o.updateMatrix(); this.mesh.setMatrixAt(i, o.matrix);
      this.mesh.setColorAt(i, wet ? BoardUnder.water : BoardUnder.tone(p.x, p.y));
      fade[i] = MathUtils.smoothstep(far, 0.5, n - 1.5) ** 0.8;
    });
    this.mesh.geometry.setAttribute('aFade', new InstancedBufferAttribute(fade, 1));
    this.mesh.frustumCulled = false; scene.add(this.mesh);
  }
  // How many hexes past the country's edge a hex lies (none, on the land).
  private beyond(col: number, row: number): number {
    const g = this.ground.grid;
    return Math.max(0, -col, col - (g.width - 1), -row, row - (g.height - 1));
  }
  // Whether the hex of the edge nearest to one past it is known for water, so that the sea goes on past the edge.
  private shore(col: number, row: number): boolean {
    const g = this.ground.grid, c = MathUtils.clamp(row, 0, g.height - 1) * g.width
      + MathUtils.clamp(col, 0, g.width - 1);
    return this.known.has(c) && this.ground.wet(c);
  }
  // Land in general, in the country's own muted earth, mottled across many hexes and a little from one to the next.
  private static tone(x: number, z: number): Color {
    const k = BoardUnder.lands, f = Noise.fbm(x * 0.21 + 3, z * 0.21) * (k.length - 1), i = Math.floor(f);
    return k[i]!.clone().lerp(k[Math.min(k.length - 1, i + 1)]!, f - i)
      .multiplyScalar(0.9 + Noise.hash(Math.round(x * 2), Math.round(z * 2)) * 0.2);
  }
  // One low tile: its top lit, its short sides darker toward the foot, a little narrower than a known one's, so
  // that a known tile standing over it hides it whole.
  private static slab(): CylinderGeometry {
    const r = HexGrid.R * BoardGround.GAP * 0.985, g = new CylinderGeometry(r, r, 0.1, 6).translate(0, -0.05, 0);
    const normal = g.getAttribute('normal'), pos = g.getAttribute('position'), shade = new Float32Array(pos.count * 3);
    for (let i = 0; i < pos.count; i++) {
      const k = normal.getY(i) > 0.5 ? 1 : 0.55 + pos.getY(i) * 3;
      shade.set([k, k, k], i * 3);
    }
    g.setAttribute('color', new BufferAttribute(shade, 3));
    return g;
  }
  // Each tile past the edge going into the haze as far as it lies past it, as if it were that much further off.
  private static faded(s: { vertexShader: string; fragmentShader: string }): void {
    s.vertexShader = s.vertexShader.replace('#include <common>', '#include <common>\nattribute float aFade; varying float vFade;')
      .replace('#include <begin_vertex>', '#include <begin_vertex>\nvFade = aFade;');
    s.fragmentShader = s.fragmentShader.replace('#include <common>', '#include <common>\nvarying float vFade;')
      .replace('#include <fog_fragment>', '#include <fog_fragment>\n#ifdef USE_FOG\ngl_FragColor.rgb = mix(gl_FragColor.rgb, fogColor, vFade);\n#endif');
  }
}
