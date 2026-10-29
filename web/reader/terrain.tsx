import type { Drawn } from './atlas';

// The land drawn on the map's hexes: a glyph of what each hex is (trees for wood, a fell's rounded hill, a peak with
// its snow, the reeds of a fen, the tufts of heath, the ripples of water), placed a little differently in each hex so
// the country does not read as wallpaper; the unknown as faint hex outlines; and the marks for places: a settlement as
// a cluster of roofs, a site as a broken arch, anything else as a diamond.
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
  // Each hex's glyph, nudged by its index so neighbours differ.
  static Land({ cells }: { cells: Drawn['cells'] }) {
    return <g className="land">
      {cells.map(c => <polygon key={c.i} className={`hex ${c.cover}`} points={c.points} />)}
      {cells.filter(c => Terrain.glyphs[c.cover]).map(c => {
        const dx = ((c.i * 7) % 5) - 2, dy = ((c.i * 3) % 3) - 1;
        return <use key={`g${c.i}`} href={`#g-${c.cover}`} className={`glyph ${c.cover}`} x={c.x + dx - 8} y={c.y + dy - 8}
          width={16} height={16} />;
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
