import {
  BoxGeometry, BufferAttribute, type BufferGeometry, CircleGeometry, Color, ConeGeometry, CylinderGeometry,
  DodecahedronGeometry, IcosahedronGeometry, type Material, MathUtils, MeshStandardMaterial,
} from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { Noise } from './noise';

// The forms of the country's small things, each made once: a broadleaf's crown of rounded masses on its trunk and a
// fir in three tiers, each darker below and lit at its top; a group of peaks
// in grey rock, scree at their feet and snow on their heads; a boulder, a tuft of heather, a reed, a field strip, a
// bush, a ewe, a length of wall or hedge, a farmstead with its barn and two fields, a pool.
export class BoardKit {
  static make(kind: string): [BufferGeometry, Material] {
    const plain = new MeshStandardMaterial({ roughness: 0.95, flatShading: true });
    const painted = new MeshStandardMaterial({ roughness: 0.95, flatShading: true, vertexColors: true });
    switch (kind) {
      case 'broadleaf': return [BoardKit.crown(), painted];
      case 'fir': return [BoardKit.lit(mergeGeometries([BoardKit.at(new ConeGeometry(0.065, 0.16, 7), 0.1),
        BoardKit.at(new ConeGeometry(0.05, 0.14, 7), 0.18), BoardKit.at(new ConeGeometry(0.032, 0.1, 7), 0.25)]),
      [0.5, 1.15]), painted];
      case 'massif': return [BoardKit.massif(), painted];
      case 'rock': return [new DodecahedronGeometry(0.05, 0).scale(1, 0.7, 1), plain];
      case 'heather': return [new IcosahedronGeometry(0.04, 0).scale(1.3, 0.5, 1.3), plain];
      case 'reed': return [BoardKit.at(new ConeGeometry(0.012, 0.1, 4), 0.05), plain];
      case 'strip': return [new BoxGeometry(0.17, 0.006, 0.055), plain];
      case 'bush': return [BoardKit.at(new IcosahedronGeometry(0.04, 0).scale(1.25, 0.8, 1.25), 0.022), plain];
      case 'sheep': return [BoardKit.tinted([[BoardKit.at(new DodecahedronGeometry(0.017, 0).scale(1.5, 1, 1), 0.022),
        '#e8e3d6'], [new BoxGeometry(0.012, 0.012, 0.012).translate(0.026, 0.026, 0), '#2a2622']]), painted];
      case 'wall': return [BoardKit.at(new BoxGeometry(0.34, 0.02, 0.014), 0.01), plain];
      case 'hedge': return [BoardKit.at(new BoxGeometry(0.3, 0.032, 0.026), 0.016), plain];
      case 'farm': return [BoardKit.farm(), painted];
      default: return [new CircleGeometry(0.05, 9).rotateX(-Math.PI / 2).translate(0, 0.004, 0),
        new MeshStandardMaterial({ roughness: 0.2, metalness: 0.1 })];
    }
  }
  // A broadleaf: a rounded mass of leaf with a lesser one at its side, on a short trunk, the trunk bark-dark.
  private static crown(): BufferGeometry {
    const leaf = mergeGeometries([BoardKit.at(new IcosahedronGeometry(0.074, 1), 0.135),
      BoardKit.at(new IcosahedronGeometry(0.056, 0), 0.1).translate(0.048, 0, 0.02)]);
    return mergeGeometries([BoardKit.lit(leaf, [0.5, 1.2]),
      BoardKit.tinted([[BoardKit.at(new CylinderGeometry(0.008, 0.012, 0.08, 4, 1, true), 0.04), '#4a3826']])]);
  }
  // A group of peaks, the highest in the middle and lesser ones about it, their flanks broken: each face rock, lighter
  // the higher it is, scree at the foot, and snow above a line that is not level.
  private static massif(): BufferGeometry {
    const peaks = [[0, 0, 0.2, 0.5], [0.17, 0.07, 0.15, 0.34], [-0.16, 0.06, 0.14, 0.3], [0.04, -0.15, 0.13, 0.27],
      [-0.06, 0.17, 0.11, 0.2]];
    return mergeGeometries(peaks.map(([x, z, r, h], i) => BoardKit.peak(r!, h!, i).translate(x!, 0, z!)));
  }
  private static peak(r: number, h: number, seed: number): BufferGeometry {
    const g = new ConeGeometry(r, h, 9, 4).translate(0, h / 2, 0).toNonIndexed(), pos = g.getAttribute('position');
    g.deleteAttribute('uv'); g.deleteAttribute('normal');
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i), y = pos.getY(i), z = pos.getZ(i), f = y / h,
        j = 1 + (Noise.hash(Math.round(Math.atan2(z, x) * 100) + seed * 7, Math.round(f * 100)) - 0.5) * 0.55 * (1 - f);
      pos.setXYZ(i, x * j, y, z * j);
    }
    const colour = new Float32Array(pos.count * 3), snow = new Color('#e9e6de'), rock = [new Color('#4b4845'),
      new Color('#7a756d')], scree = new Color('#5d574f');
    for (let t = 0; t < pos.count; t += 3) {
      const f = (pos.getY(t) + pos.getY(t + 1) + pos.getY(t + 2)) / 3 / h,
        line = 0.66 + (Noise.hash(t, seed + 3) - 0.5) * 0.22;
      const k = f > line ? snow : f < 0.14 ? scree : rock[0]!.clone().lerp(rock[1]!, MathUtils.smoothstep(f, 0.1, 0.7));
      for (let v = 0; v < 3; v++) { colour.set([k.r, k.g, k.b], (t + v) * 3); }
    }
    g.setAttribute('color', new BufferAttribute(colour, 3)); g.computeVertexNormals();
    return g;
  }
  // A form lit from above as the sky lights it: from so dark at its foot to so light at its head.
  private static lit(g: BufferGeometry, [low, high]: [number, number]): BufferGeometry {
    const pos = g.getAttribute('position');
    g.computeBoundingBox();
    const { min, max } = g.boundingBox!, shade = new Float32Array(pos.count * 3);
    for (let i = 0; i < pos.count; i++) {
      const k = MathUtils.lerp(low, high, MathUtils.smoothstep(pos.getY(i), min.y, max.y));
      shade.set([k, k, k], i * 3);
    }
    return g.setAttribute('color', new BufferAttribute(shade, 3));
  }
  private static farm(): BufferGeometry {
    return BoardKit.tinted([[new BoxGeometry(0.07, 0.04, 0.045).translate(0, 0.02, 0), '#cbbd9f'],
      [BoardKit.roof(0.056, 0.035).translate(0, 0.057, 0), '#7a3e2d'],
      [new BoxGeometry(0.06, 0.035, 0.04).translate(0.075, 0.0175, 0.04), '#6e5a44'],
      [BoardKit.roof(0.05, 0.03).translate(0.075, 0.05, 0.04), '#4d3a2c'],
      [new BoxGeometry(0.16, 0.004, 0.1).translate(-0.02, 0.002, -0.09), '#8c7d45'],
      [new BoxGeometry(0.16, 0.004, 0.1).translate(0.15, 0.002, -0.05), '#6a7a3a']]);
  }
  private static roof(w: number, h: number): BufferGeometry {
    return new ConeGeometry(w, h, 4).rotateY(Math.PI / 4).scale(1, 1, 0.75);
  }
  private static at(g: BufferGeometry, y: number): BufferGeometry {
    const n = g.index ? g.toNonIndexed() : g;
    if (n.getAttribute('uv')) { n.deleteAttribute('uv'); }
    return n.translate(0, y, 0);
  }
  // Parts of one form, each in its own colour.
  static tinted(parts: [BufferGeometry, string][]): BufferGeometry {
    return mergeGeometries(parts.map(([g, color]) => {
      const n = g.index ? g.toNonIndexed() : g, k = new Color(color), rgb = [k.r, k.g, k.b];
      if (n.getAttribute('uv')) { n.deleteAttribute('uv'); }
      n.setAttribute('color',
        new BufferAttribute(new Float32Array(n.attributes.position!.count * 3).map((_, i) => rgb[i % 3]!), 3));
      return n;
    }));
  }
}
