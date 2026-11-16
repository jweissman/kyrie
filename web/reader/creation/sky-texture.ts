import { SkyRng } from './sky-rng';

// The starfield, as a sky is seen (the owner, 15 November: it read cheaply; make the stars worth looking at in
// themselves, before anything else): tens of thousands of stars drawn once to a canvas and held as an image, with
// the brightness of a real sky (nearly all faint, a few bright, the brightest with a halo and fine spikes), the
// colours stars really are (hot blue-white to cool orange), placed with sub-pixel softness so that they shimmer
// and do not tile, and thicker along a faint galactic band (no cloud, no paint: only more stars). Deterministic:
// the same sky every time. Canvas drawing only where there is a document (a static render has none, and draws the
// sky without it).
interface Star { x: number; y: number; power: number; rgb: readonly number[]; spikes?: boolean }
export class SkyTexture {
  // The textured region, in the sky's units (see Observatory): x from cx-1760 to cx+1760, y from cy-2150 to cy-950.
  static readonly width = 3520;
  static readonly height = 1200;
  // Spectral colours, hot to cool (r, g, b), and the proportion they are seen (most stars are cool and dim).
  static readonly stars: readonly (readonly [number, number, number])[] = [[170, 195, 255], [200, 218, 255],
    [240, 240, 255], [255, 246, 228], [255, 226, 180], [255, 199, 148], [255, 178, 122]];
  static readonly mix: readonly number[] = [3, 2, 3, 4, 4, 5, 3, 1, 4, 6, 3, 0, 4, 3];
  static colour(i: number): string {
    const [r, g, b] = this.stars[this.mix[i % this.mix.length]!]!;
    return `rgb(${r},${g},${b})`;
  }
  private static url?: string;
  // How bright a star is by its place in the sky's order: nearly all faint, very few bright (the real distribution).
  static size(u: number, big = 1.9): number { return .45 + big * u ** 7; }
  // One star soft on the pixel grid: its light shared between the four pixels it falls among.
  private static splat(g: CanvasRenderingContext2D, star: Star) {
    const ix = Math.floor(star.x), iy = Math.floor(star.y), fx = star.x - ix, fy = star.y - iy, [r, gr, b] = star.rgb;
    g.fillStyle = `rgb(${r},${gr},${b})`;
    const shares = [[0, 0, (1 - fx) * (1 - fy)], [1, 0, fx * (1 - fy)], [0, 1, (1 - fx) * fy],
      [1, 1, fx * fy]] as const;
    for (const [dx, dy, w] of shares) {
      g.globalAlpha = Math.min(1, star.power * w * 1.6); g.fillRect(ix + dx, iy + dy, 1, 1);
    }
  }
  private static bright(g: CanvasRenderingContext2D, star: Star) {
    const { x, y, power } = star, rad = 2.5 + power * 9, c = star.rgb.join(','), glow = g.createRadialGradient(x, y, 0, x, y, rad);
    glow.addColorStop(0, `rgba(${c},${0.55 * power})`); glow.addColorStop(.25, `rgba(${c},${0.18 * power})`);
    glow.addColorStop(1, `rgba(${c},0)`);
    g.globalAlpha = 1; g.fillStyle = glow; g.fillRect(x - rad, y - rad, rad * 2, rad * 2);
    this.splat(g, { x, y, power: .95, rgb: [255, 255, 255] });
    if (star.spikes) {
      g.strokeStyle = `rgba(${c},${0.3 * power})`; g.lineWidth = .6; g.globalAlpha = 1;
      const len = rad * 1.8;
      g.beginPath(); g.moveTo(x - len, y); g.lineTo(x + len, y); g.moveTo(x, y - len); g.lineTo(x, y + len); g.stroke();
    }
  }
  // How much the galactic band is at a point of the region: stars are kept in proportion to it, so it is thicker there.
  private static along(at: { x: number; y: number; cx: number; cy: number }): number {
    const d = Math.hypot(at.x - at.cx, at.cy - at.y);
    return Math.exp(-(((d - 1500) / 150) ** 2));
  }
  static field(cx: number, cy: number): string {
    if (this.url !== undefined) { return this.url; }
    if (typeof document === 'undefined') { return ''; }
    const canvas = document.createElement('canvas');
    canvas.width = this.width; canvas.height = this.height;
    const g = canvas.getContext('2d');
    if (!g) { return this.url = ''; }
    const x0 = cx - 1760, y0 = cy - 2150, r = new SkyRng(23);
    // By tier, as a real sky has them: a few dozen bright, some hundreds of middling, and the rest faint.
    for (let i = 0; i < 120000; i++) {
      const x = r.next() * this.width, y = r.next() * this.height;
      if (i > 900 && r.next() > .2 + .8 * this.along({ x: x0 + x, y: y0 + y, cx, cy })) { continue; }
      const rgb = this.stars[this.mix[(r.next() * 14) | 0]!]!, u = r.next();
      if (i < 46) { this.bright(g, { x, y, power: .62 + .38 * u, rgb, spikes: true }); }
      else if (i < 900) { this.bright(g, { x, y, power: .1 + .34 * u ** 2, rgb }); }
      else { this.splat(g, { x, y, power: .1 + .46 * u ** 3, rgb }); }
    }
    g.globalAlpha = 1;
    return this.url = canvas.toDataURL('image/png');
  }
}
