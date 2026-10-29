import { useEffect, useRef, useState, type ReactNode } from 'react';
import type { RegionChart } from '../../src/ui/screen-types';
import type { BoardApi, BoardLand, BoardModule } from './board/board-types';
import { HexLand } from './hex-land';

// The map's board, when the browser can draw it (Mission 18, the owner's addendum): the country as a table of hex
// tiles in three dimensions. Its script is the page's own (board.js, beside the reader), fetched only when the map is
// first opened, so that nothing of it is paid for before; where it cannot be drawn, the flat map stands in its place.
export class BoardField {
  private static loading?: Promise<BoardModule | undefined>;
  static able(): boolean {
    try { return typeof document !== 'undefined' && !!document.createElement('canvas').getContext('webgl2'); }
    catch { return false; }
  }
  static load(): Promise<BoardModule | undefined> {
    BoardField.loading ??= new Promise(resolve => {
      const g = globalThis as { KyrieBoard?: BoardModule }, s = document.createElement('script');
      if (g.KyrieBoard) { resolve(g.KyrieBoard); return; }
      s.src = 'board.js'; s.async = true; s.onload = () => resolve(g.KyrieBoard); s.onerror = () => resolve(undefined);
      document.head.appendChild(s);
    });
    return BoardField.loading;
  }
  // What the board is given of the region's land: its hexes, rivers and roads, what is known, where you are, and each
  // town and place known with the sign of its kind (as the flat map has them).
  static land(region: RegionChart): BoardLand {
    const land = region.land!, W = land.width;
    const towns = region.areas.filter(a => a.kind === 'settlement').map(a => ({ id: a.id, name: a.name, cell: a.y * W + a.x,
      kind: 'town', visited: a.visited, town: true }));
    const marks = land.marks.map(m => ({ id: m.id, name: m.name, cell: m.cell, visited: m.visited, kind: BoardField.kind(m) }));
    return { key: land.cover, width: W, height: land.height, cover: land.cover, rivers: land.rivers, roads: land.roads,
      known: land.known, here: land.here, marks: [...towns, ...marks] };
  }
  // A place's kind, by its sign on the flat map; where a way goes into wild country, a cairn.
  static kind(m: { name: string; kind: string }): string {
    const sign = /^the (edge|foot) of/i.test(m.name) ? 'way' : HexLand.signs.find(([re]) => re.test(m.name))?.[1];
    return sign === 'gate' ? 'way' : sign ?? (m.kind === 'site' ? 'ruin' : 'stone');
  }
  static View({ region, chosen, choose, bound, flat }: { region: RegionChart; chosen?: string; choose: (id: string) => void;
    bound?: string; flat: ReactNode }) {
    const host = useRef<HTMLDivElement>(null), board = useRef<BoardApi | undefined>(undefined), pick = useRef(choose);
    const [failed, fail] = useState(() => !BoardField.able()), [ready, readied] = useState(false);
    pick.current = choose;
    useEffect(() => {
      if (failed) { return; }
      let live = true;
      void BoardField.load().then(m => {
        if (!live || !host.current) { return; }
        if (!m) { fail(true); return; }
        try {
          const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
          board.current = m.mount(host.current, BoardField.land(region), { choose: id => pick.current(id) }, still); readied(true);
        } catch { fail(true); }
      });
      return () => { live = false; board.current?.dispose(); board.current = undefined; readied(false); };
    }, [region, failed]);
    useEffect(() => { board.current?.show(chosen, bound); }, [chosen, bound, ready]);
    if (failed) { return <>{flat}</>; }
    return (
      <div className="field-land board" ref={host} data-board={ready ? 'ready' : 'loading'}>
        <div className="field-tools">
          <button type="button" aria-label="Nearer" data-action="map-nearer" onClick={() => board.current?.zoom(0.8)}>+</button>
          <button type="button" aria-label="Further" data-action="map-further" onClick={() => board.current?.zoom(1.25)}>−</button>
          <button type="button" aria-label="Where you are" data-action="map-here" onClick={() => board.current?.home()}>◎</button>
        </div>
      </div>
    );
  }
}
