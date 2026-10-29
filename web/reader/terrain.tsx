import { Atlas, type Drawn } from './atlas';
import { PaintedLand } from './painted-land';

// The marks of what the land is, set on its painting: trees scattered through a wood, a fell's rounded hills, a peak
// with its snow, the reeds of a fen, the tufts of heath, the ripples of water, each cell's few placed differently so
// the country does not read as wallpaper; and the marks for places: a settlement as a cluster of roofs, a site as a
// broken arch, anything else as a diamond.
export class Terrain {
  static readonly glyphs: Record<string, string> = {
    wood: 'M-5 3l3-7 3 7zM1 4l3-8 3 8z',
    peak: 'M-7 5l6-10 4 6 2-3 3 7zM-3.4 -1l2.4-4 1.6 2.4',
    fell: 'M-7 4c2-6 6-6 8 0M0 4c2-4 5-4 7 0',
    heath: 'M-5 2v-2M-4 2l-2-2M-4 2l1-3M3 3v-2M4 3l-2-2M4 3l1-3',
    fen: 'M-6 1h4M-1 -2h5M1 4h5M-6 1v-3M5 -2v-3',
    water: 'M-7 0c2-2 3-2 4 0s3 2 4 0 3-2 4 0M-4 4c2-2 3-2 4 0s3 2 4 0',
  };
  static Defs() {
    return (
      <defs>
        {Object.entries(Terrain.glyphs).map(([id, d]) => <symbol key={id} id={`g-${id}`} viewBox="-8 -8 16 16"
          overflow="visible"><path d={d} /></symbol>)}
        <symbol id="g-town" viewBox="-8 -8 16 16" overflow="visible"><path d="M-7 6v-5l3-3 3 3v5zM-1 6v-7l4-4 4 4v7z" /></symbol>
        <symbol id="g-site" viewBox="-8 -8 16 16" overflow="visible"><path d="M-6 6v-8a6 6 0 0 1 12 0M6 -2v8M-2 6v-5" /></symbol>
        <radialGradient id="map-glow"><stop offset="0" stopColor="rgba(242,189,76,.35)" /><stop offset="1" stopColor="rgba(242,189,76,0)" /></radialGradient>
      </defs>
    );
  }
  // How many of its mark a cell of each land carries, and how large: a wood is many trees, a peak one mountain.
  static readonly scatter: Record<string, [number, number]> = { wood: [4, 10], peak: [1, 18], fell: [2, 13],
    heath: [2, 10], fen: [2, 10], water: [1, 12] };
  // Each cell's marks, each placed by the cell and its count so neighbours differ.
  static Land({ cells }: { cells: Drawn['cells'] }) {
    const S = Atlas.S;
    return <g className="land">
      {cells.filter(c => Terrain.scatter[c.cover]).flatMap(c => {
        const [n, size] = Terrain.scatter[c.cover]!;
        return Array.from({ length: n }, (_, k) => {
          const x = c.x - S / 2 + S * (0.2 + 0.6 * PaintedLand.hash(c.i * 7 + k, 3));
          const y = c.y - S / 2 + S * (0.25 + 0.55 * PaintedLand.hash(c.i * 5 + k, 9));
          return <use key={`g${c.i}.${k}`} href={`#g-${c.cover}`} className={`glyph ${c.cover}`} x={x - size / 2}
            y={y - size / 2} width={size} height={size} />;
        });
      })}
    </g>;
  }
  // A place's mark, by what it is and whether the company has been there.
  static Mark({ p }: { p: Drawn['places'][number] }) {
    if (p.kind === 'settlement') {
      return <use href="#g-town" className={`town${p.visited ? '' : ' unvisited'}`} x={p.x - 9} y={p.y - 9} width={18} height={18} />;
    }
    if (p.kind === 'site') {
      return <use href="#g-site" className={`site${p.visited ? ' visited' : ''}`} x={p.x - 8} y={p.y - 8} width={16} height={16} />;
    }
    return <rect className={`mark${p.visited ? ' visited' : ''}`} x={p.x - 3.5} y={p.y - 3.5} width={7} height={7}
      transform={`rotate(45 ${p.x} ${p.y})`} />;
  }
}
