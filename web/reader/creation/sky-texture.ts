// The colours of the stars, as a sky has them (the owner, 15 November: hot blue-white to cool orange), and a star's
// size by its place in the order of brightness (nearly all faint, a very few bright). The sky itself is drawn live (see
// SkyCanvas).
export class SkyTexture {
  // Spectral colours, hot to cool (r, g, b), and the proportion they are seen (most stars are cool and dim).
  static readonly stars: readonly (readonly [number, number, number])[] = [[170, 195, 255], [200, 218, 255],
    [240, 240, 255], [255, 246, 228], [255, 226, 180], [255, 199, 148], [255, 178, 122]];
  static readonly mix: readonly number[] = [3, 2, 3, 4, 4, 5, 3, 1, 4, 6, 3, 0, 4, 3];
  static colour(i: number): string {
    const [r, g, b] = this.stars[this.mix[i % this.mix.length]!]!;
    return `rgb(${r},${g},${b})`;
  }
  static size(u: number, big = 1.9): number { return .45 + big * u ** 7; }
}
