// The signs of the board's places, as one small set of marks: each drawn on the same sixteen-unit grid, its ink kept
// within a margin of two units on every side, standing on one ground line (13) and weighing about the grid's middle,
// so that each sits at the middle of its plate however its shape leans. Each kind has a shape of its own that can be
// told without its name: a cave a mouth in the ground, a ruin broken walls, a tower a beacon burning, a ford a way
// across water. Where a shape's weight lies off the middle, it is moved so much (in grid units, up or down).
export class BoardGlyphs {
  private static readonly paths: Record<string, string> = {
    tower: 'M6.4 13V7.2h3.2V13M5.4 7.2h5.2M8 2.6c1.3 1.1 1.3 2.6 0 3.4c-1.3-.8-1.3-2.3 0-3.4z',
    ruin: 'M2.5 13V6.2h2.2V13M11.3 13V8.6h2.2V13M4.7 6.2c1.6-1.5 3.3-1.8 4.8-1.2M7 13v-2.6h2V13M2 13h12',
    cave: 'M2 13h12M3.6 13C3.6 7.8 5.6 4.6 8 4.6s4.4 3.2 4.4 8.4M6.1 13c0-2.4.8-3.8 1.9-3.8s1.9 1.4 1.9 3.8',
    stone: 'M6.6 13l.6-9.4h1.6l.6 9.4M4 13h8',
    ford: 'M2 6.4c2-1 4 1 6 0s4-1 6 0M2 10.4c2-1 4 1 6 0s4-1 6 0M5 3.4l-.6 9.2M11 3.4l.6 9.2',
    way: 'M4 13h8l-1.3-2.8H5.3zM5.6 10.2l.8-2.6h3.2l.8 2.6M7 7.6l.4-2.6h1.2l.4 2.6',
    camp: 'M2.5 13L8 3.6 13.5 13M8 13l-1.9-3.6M8 13l1.9-3.6',
    shrine: 'M2.8 7.4L8 3.4l5.2 4M4.4 6.9V13h7.2V6.9M7 13v-3h2v3',
    barrow: 'M1.8 12.4C3.3 7.8 5.6 5.6 8 5.6s4.7 2.2 6.2 6.8zM6.6 12.4V10h2.8v2.4',
    tarn: 'M2 8.4c0-2.2 2.7-3.6 6-3.6s6 1.4 6 3.6-2.7 3.6-6 3.6-6-1.4-6-3.6zM5 8.4c1-.6 2-.6 3 0s2 .6 3 0',
    crag: 'M1.8 13l3.4-6.4 2 2.6 2.6-6.2 4.4 10z',
    grove: 'M5 13v-2.6M11 13v-2.6M8 13V9M5 10.4a2.4 2.4 0 1 1 0-4.8a2.4 2.4 0 0 1 0 4.8z'
      + 'M11 10.4a2.4 2.4 0 1 1 0-4.8a2.4 2.4 0 0 1 0 4.8z',
    place: 'M8 3l5 5-5 5-5-5z',
    unknown: 'M5.7 5.9a2.3 2.3 0 1 1 3.4 2c-.7.4-1.1.9-1.1 1.7v.6M8 12.4v.3',
  };
  private static readonly shift: Record<string, number> = { way: -1, barrow: -1, stone: -0.3, cave: -0.9, grove: -1.2,
    ruin: -0.8, camp: -0.3, shrine: -0.2, tarn: -0.4 };
  // The sign of a kind of place (a diamond, for a kind without one of its own), or of something not made out.
  static svg(kind: string): string {
    const glyph = BoardGlyphs.paths[kind] ?? BoardGlyphs.paths.place!, dy = BoardGlyphs.shift[kind] ?? 0;
    return `<svg viewBox="0 0 16 16" aria-hidden="true"><path transform="translate(0 ${dy})" d="${glyph}"/></svg>`;
  }
  // The company's own mark: a pin, the same whichever way it is going, for the board does not know which way it faces.
  static readonly pin = '<svg viewBox="0 0 16 16" aria-hidden="true"><path fill-rule="evenodd" d="M8 1.6a4.6 4.6 0 0 1 '
    + '4.6 4.6c0 3.3-4.6 8.4-4.6 8.4S3.4 9.5 3.4 6.2A4.6 4.6 0 0 1 8 1.6z'
    + 'M8 4.4a1.8 1.8 0 1 0 0 3.6a1.8 1.8 0 1 0 0-3.6z"/>'
    + '</svg>';
}
