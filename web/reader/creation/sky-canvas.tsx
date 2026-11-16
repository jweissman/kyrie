import { useEffect, useRef } from 'react';
import { SkyRng } from './sky-rng';
import { SkyTexture } from './sky-texture';

// The sky behind the sign's page, drawn live (the owner, 17 November: "pixellated; jerky; not dynamic or suggestive enough
// of spatial depth"): a canvas at the screen's own pixel density, so that no star is a scaled-up picture of one, and layers
// of stars at four depths that slide past one another by different amounts as the ring turns (the far ones barely move, the
// near ones go by), eased frame by frame rather than jumped, with a slow drift of its own and a few stars that twinkle. A star
// is a rectangle of a device pixel or two where it is faint and a soft glow where it is bright; the brightest carry a long
// fine cross. Deterministic: the same sky every time. Stopped while the page is hidden or the reader asks for less motion.
interface Star { x: number; y: number; size: number; alpha: number; colour: number; phase: number; twinkle: boolean }
interface Layer { depth: number; stars: Star[]; glow: boolean }

export class SkyCanvas {
  // One tile of the sky, in the page's units (1600 by 1000), repeated sideways without a seam.
  static readonly tile = 6400;
  static readonly height = 1000;
  private static layers?: Layer[];
  private static sprites = new Map<string, HTMLCanvasElement>();

  // The galactic band across the tile: where the stars are thicker, wandering as the tile goes on.
  private static band(x: number): number { return 520 + 230 * Math.sin(x / 700) + 120 * Math.sin(x / 260 + 1); }

  private static make(): Layer[] {
    if (this.layers) { return this.layers; }
    const r = new SkyRng(41);
    const layer = (depth: number, count: number, size: [number, number], alpha: [number, number], banded: number, glow = false) => {
      const stars: Star[] = [];
      while (stars.length < count) {
        const x = r.next() * this.tile, y = r.next() * this.height;
        const near = Math.abs(y - this.band(x)) / 230, keep = banded ? .1 + .9 * Math.exp(-near * near) : 1;
        if (r.next() > keep) { continue; }
        const u = r.next() ** 3;
        stars.push({ x, y, size: size[0] + (size[1] - size[0]) * u, alpha: alpha[0] + (alpha[1] - alpha[0]) * u ** .6,
          colour: (r.next() * 14) | 0, phase: r.next() * 6.28, twinkle: r.next() < .22 });
      }
      return { depth, stars, glow };
    };
    return this.layers = [layer(.08, 22000, [.5, 1.2], [.28, .7], 1), layer(.22, 9000, [.6, 1.5], [.34, .8], 1),
      layer(.5, 2400, [.9, 2.2], [.4, .9], 0), layer(.85, 140, [1.4, 3.6], [.6, 1], 0, true)];
  }

  // A soft glow of one colour, drawn once: a bright star's halo and its cross.
  private static sprite(colour: number): HTMLCanvasElement {
    const key = String(colour), kept = this.sprites.get(key);
    if (kept) { return kept; }
    const c = document.createElement('canvas'), n = 96, g = c.getContext('2d')!, rgb = SkyTexture.stars[SkyTexture.mix[colour % 14]!]!;
    c.width = c.height = n;
    const halo = g.createRadialGradient(n / 2, n / 2, 0, n / 2, n / 2, n / 2);
    halo.addColorStop(0, `rgba(${rgb.join(',')},.7)`); halo.addColorStop(.1, `rgba(${rgb.join(',')},.28)`);
    halo.addColorStop(.4, `rgba(${rgb.join(',')},.07)`); halo.addColorStop(1, `rgba(${rgb.join(',')},0)`);
    g.fillStyle = halo; g.fillRect(0, 0, n, n);
    for (const [dx, dy] of [[1, 0], [0, 1]] as const) {
      const line = g.createLinearGradient(n / 2 - dx * n / 2, n / 2 - dy * n / 2, n / 2 + dx * n / 2, n / 2 + dy * n / 2);
      line.addColorStop(0, `rgba(${rgb.join(',')},0)`); line.addColorStop(.5, `rgba(${rgb.join(',')},.55)`);
      line.addColorStop(1, `rgba(${rgb.join(',')},0)`);
      g.strokeStyle = line; g.lineWidth = 1; g.beginPath(); g.moveTo(n / 2 - dx * n / 2, n / 2 - dy * n / 2);
      g.lineTo(n / 2 + dx * n / 2, n / 2 + dy * n / 2); g.stroke();
    }
    this.sprites.set(key, c);
    return c;
  }

  // One frame: every layer at its own share of the pan, the near ones drawn last.
  private static draw(g: CanvasRenderingContext2D, w: number, h: number, dpr: number, pan: number, t: number) {
    g.clearRect(0, 0, w, h);
    const scale = Math.max(w / dpr / 1600, h / dpr / 1000), ox = (w / dpr - 1600 * scale) / 2, oy = (h / dpr - 1000 * scale) / 2;
    for (const layer of this.make()) {
      const slide = pan * (.12 + layer.depth * .88) + t * 2.2 * (.3 + layer.depth);
      for (const s of layer.stars) {
        const vx = ((s.x - slide) % this.tile + this.tile) % this.tile - 200;
        if (vx > 1800) { continue; }
        const x = (ox + vx * scale) * dpr, y = (oy + s.y * scale) * dpr, k = s.size * scale * dpr;
        const a = s.alpha * (s.twinkle ? .78 + .22 * Math.sin(t * 1.9 + s.phase) : 1), rgb = SkyTexture.stars[SkyTexture.mix[s.colour % 14]!]!;
        if (layer.glow) {
          const sp = this.sprite(s.colour), size = k * 9;
          g.globalAlpha = Math.min(1, a); g.drawImage(sp, x - size / 2, y - size / 2, size, size);
          g.fillStyle = '#fff'; g.beginPath(); g.arc(x, y, Math.max(.8 * dpr, k * .5), 0, 6.283); g.fill();
        } else if (k < 1.6) {
          // Fainter than a pixel is a pixel at its own strength, never a larger one.
          g.globalAlpha = Math.min(1, a * Math.min(1, k)); g.fillStyle = `rgb(${rgb[0]},${rgb[1]},${rgb[2]})`;
          g.fillRect(Math.round(x), Math.round(y), 1 * dpr, 1 * dpr);
        } else {
          g.globalAlpha = Math.min(1, a); g.fillStyle = `rgb(${rgb[0]},${rgb[1]},${rgb[2]})`;
          g.beginPath(); g.arc(x, y, k * .5, 0, 6.283); g.fill();
        }
      }
    }
    g.globalAlpha = 1;
  }

  // The canvas, filling what it is in; pan: where the ring has turned to, in the page's units, which it eases to.
  static View({ pan, still }: { pan: number; still: boolean }) {
    const canvas = useRef<HTMLCanvasElement>(null), target = useRef(pan), now = useRef(pan);
    target.current = pan;
    useEffect(() => {
      const el = canvas.current, g = el?.getContext('2d');
      if (!el || !g) { return undefined; }
      const begun = performance.now();
      let frame = 0, last = begun, w = 0, h = 0, dpr = 1;
      const size = () => {
        dpr = Math.min(2.5, window.devicePixelRatio || 1);
        const box = el.getBoundingClientRect();
        w = Math.max(1, Math.round(box.width * dpr)); h = Math.max(1, Math.round(box.height * dpr));
        el.width = w; el.height = h;
      };
      const tick = (at: number) => {
        // Eased by time, not by frame: the same glide at any rate of frames.
        now.current += (target.current - now.current) * (still ? 1 : 1 - Math.exp(-(at - last) / 260));
        last = at;
        SkyCanvas.draw(g, w, h, dpr, now.current, still ? 0 : (at - begun) / 1000);
        frame = document.hidden ? 0 : requestAnimationFrame(tick);
      };
      const resume = () => { if (!frame) { last = performance.now(); frame = requestAnimationFrame(tick); } };
      size(); frame = requestAnimationFrame(tick);
      window.addEventListener('resize', size); document.addEventListener('visibilitychange', resume);
      return () => {
        cancelAnimationFrame(frame); window.removeEventListener('resize', size);
        document.removeEventListener('visibilitychange', resume);
      };
    }, [still]);
    return <canvas ref={canvas} className="obs-canvas" aria-hidden="true" />;
  }
}
