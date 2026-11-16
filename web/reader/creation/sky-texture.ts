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
  // One tile of the sky, in the sky's units (see Observatory): it repeats without a seam across, the page pans it, so
  // that no edge of it is ever in sight and each sign is seen over a different stretch of it.
  static readonly width = 4800;
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
  // How much the galactic band is at a point of the tile: stars are kept in proportion to it, so it is thicker there.
  // band wanders across the tile, so that the stretch seen under each sign has the band in its own place.
  private static along(x: number, y: number): number {
    const mid = 600 + 260 * Math.sin(x / 760) + 140 * Math.sin(x / 290 + 1);
    return .22 + .78 * Math.exp(-(((y - mid) / 190) ** 2));
  }
  // A star is drawn again a tile's width over, where its light would cross the seam.
  private static twice(star: Star, draw: (s: Star) => void) {
    const reach = 40;
    draw(star);
    if (star.x < reach) { draw({ ...star, x: star.x + this.width }); }
    if (star.x > this.width - reach) { draw({ ...star, x: star.x - this.width }); }
  }
  static field(): string {
    if (this.url !== undefined) { return this.url; }
    if (typeof document === 'undefined') { return ''; }
    const canvas = document.createElement('canvas');
    canvas.width = this.width; canvas.height = this.height;
    const g = canvas.getContext('2d');
    if (!g) { return this.url = ''; }
    const r = new SkyRng(23);
    // By tier, as a real sky has them: a few dozen bright, some hundreds of middling, and the rest faint.
    for (let i = 0; i < 170000; i++) {
      const x = r.next() * this.width, y = r.next() * this.height;
      if (i > 1200 && r.next() > this.along(x, y)) { continue; }
      const rgb = this.stars[this.mix[(r.next() * 14) | 0]!]!, u = r.next();
      if (i < 60) { this.twice({ x, y, power: .62 + .38 * u, rgb, spikes: true }, s => this.bright(g, s)); }
      else if (i < 1200) { this.twice({ x, y, power: .1 + .34 * u ** 2, rgb }, s => this.bright(g, s)); }
      else { this.twice({ x, y, power: .1 + .46 * u ** 3, rgb }, s => this.splat(g, s)); }
    }
    g.globalAlpha = 1;
    return this.url = canvas.toDataURL('image/png');
  }
}
