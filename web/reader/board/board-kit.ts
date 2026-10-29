import {
  BoxGeometry, BufferAttribute, type BufferGeometry, CircleGeometry, Color, ConeGeometry, CylinderGeometry,
    DodecahedronGeometry,
  IcosahedronGeometry, type Material, MeshStandardMaterial,
} from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';

// The forms of the country's small things, each made once: a broadleaf (a crown on a trunk), a fir in three tiers, a
// boulder, a tuft of heather, a reed, a field strip, a small mountain capped with snow, a bush, a ewe, a length of
// wall or hedge, a farmstead with its barn and two fields, a pool.
export class BoardKit {
  static make(kind: string): [BufferGeometry, Material] {
    const plain = new MeshStandardMaterial({ roughness: 0.95, flatShading: true });
    const painted = new MeshStandardMaterial({ roughness: 0.95, flatShading: true, vertexColors: true });
    switch (kind) {
      case 'broadleaf': return [mergeGeometries([BoardKit.at(new IcosahedronGeometry(0.08, 0).scale(1, 1.2, 1), 0.15),
        BoardKit.at(new CylinderGeometry(0.009, 0.014, 0.09, 5), 0.045)]), plain];
      case 'fir': return [mergeGeometries([BoardKit.at(new ConeGeometry(0.065, 0.16, 7), 0.1),
        BoardKit.at(new ConeGeometry(0.05, 0.14, 7), 0.18),
        BoardKit.at(new ConeGeometry(0.032, 0.1, 7), 0.25)]), plain];
      case 'rock': return [new DodecahedronGeometry(0.05, 0).scale(1, 0.7, 1), plain];
      case 'heather': return [new IcosahedronGeometry(0.04, 0).scale(1.3, 0.5, 1.3), plain];
      case 'reed': return [BoardKit.at(new ConeGeometry(0.012, 0.1, 4), 0.05), plain];
      case 'strip': return [new BoxGeometry(0.17, 0.006, 0.055), plain];
      case 'peak': return [BoardKit.tinted([[BoardKit.at(new ConeGeometry(0.2, 0.42, 7), 0.21), '#6c6d72'],
        [BoardKit.at(new ConeGeometry(0.095, 0.2, 7), 0.32), '#dcdde0']]), painted];
      case 'bush': return [BoardKit.at(new IcosahedronGeometry(0.04, 0).scale(1.25, 0.8, 1.25), 0.022), plain];
      case 'sheep': return [BoardKit.tinted([[BoardKit.at(new DodecahedronGeometry(0.017, 0).scale(1.5, 1, 1), 0.022),
        '#e8e3d6'],
        [new BoxGeometry(0.012, 0.012, 0.012).translate(0.026, 0.026, 0), '#2a2622']]), painted];
      case 'wall': return [BoardKit.at(new BoxGeometry(0.34, 0.02, 0.014), 0.01), plain];
      case 'hedge': return [BoardKit.at(new BoxGeometry(0.3, 0.032, 0.026), 0.016), plain];
      case 'farm': return [BoardKit.farm(), painted];
      default: return [new CircleGeometry(0.05, 9).rotateX(-Math.PI / 2).translate(0, 0.004, 0),
        new MeshStandardMaterial({ roughness: 0.2, metalness: 0.1 })];
    }
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
    n.deleteAttribute('uv');
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
