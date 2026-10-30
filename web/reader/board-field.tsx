import { useEffect, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import type { RegionChart } from '../../src/ui/screen-types';
import type { BoardApi, BoardLand, BoardModule } from './board/board-types';
import { HexLand } from './hex-land';

type Land = NonNullable<RegionChart['land']>;

// The map's board, when the browser can draw it (Mission 18, the owner's addendum): the country as a table of hex
// tiles in three dimensions. Its script is the page's own (board.js, beside the reader), fetched only when the map is
// first opened, so that nothing of it is paid for before; where it cannot be drawn, the flat map stands in its place.
export class BoardField {
  private static loading?: Promise<BoardModule | undefined>;
  private static drawable?: boolean;
  // Whether the browser can draw the board, the drawing made to ask let go at once: asked until it can (a refusal may
  // be for the moment only, too many drawings open, say), and once it can, not asked again.
  static able(): boolean {
    if (typeof document === 'undefined') { return false; }
    BoardField.drawable ||= BoardField.probe();
    return BoardField.drawable;
  }
  private static probe(): boolean {
    try {
      const gl = document.createElement('canvas').getContext('webgl2');
      gl?.getExtension('WEBGL_lose_context')?.loseContext();
      return !!gl;
    } catch { return false; }
  }
  static load(): Promise<BoardModule | undefined> {
    BoardField.loading ??= new Promise(resolve => {
      const g = globalThis as { KyrieBoard?: BoardModule }, s = document.createElement('script');
      if (g.KyrieBoard) { resolve(g.KyrieBoard); return; }
      s.src = 'board.js'; s.async = true;
      s.addEventListener('load', () => resolve(g.KyrieBoard));
      // Not fetched (the connection dropped, say): the flat map this time, and the board asked for again the next.
      s.addEventListener('error', () => { s.remove(); BoardField.loading = undefined; resolve(undefined); });
      document.head.appendChild(s);
    });
    return BoardField.loading;
  }
  // What the board is given of the region's land: its hexes, rivers and roads, what is known, where you are, and each
  // town and place known of with the sign of its kind (as the flat map has them) and how much is known of it; and the
  // protagonist's face, for your mark.
  static land(region: RegionChart, face?: string): BoardLand {
    const land = region.land!, W = land.width;
    const towns = region.areas.filter(a => a.kind === 'settlement').map(a => ({ id: a.id, name: a.name,
      cell: a.y * W + a.x, kind: 'town', visited: a.visited, town: true, state: HexLand.town(land, a) }));
    const marks = land.marks.map(m => ({ id: m.id, name: m.name, cell: m.cell, visited: m.visited,
      kind: BoardField.kind(m), state: m.state }));
    return { key: land.cover, width: W, height: land.height, cover: land.cover, rivers: land.rivers, roads: land.roads,
      known: land.known, here: land.here, marks: [...towns, ...marks], face };
  }
  // A place's kind, by its sign on the flat map; where a way goes into wild country, seen or been to, a cairn.
  static kind(m: Land['marks'][number]): string {
    const found = m.state === 'seen' || m.state === 'visited';
    const sign = found && /^the (edge|foot) of/i.test(m.name) ? 'way' : HexLand.sign(m);
    return sign === 'gate' ? 'way' : sign;
  }
  // The land as the board is given it, and that land told whole as text: a new frame that leaves the land as it was
  // (anything done with the map open, short of a journey) leaves the board as it is, its view where the player had it.
  static drawn(region: RegionChart, face?: string): [BoardLand, string] {
    const land = BoardField.land(region, face);
    return [land, JSON.stringify(land)];
  }
  // Where the company is bound, as the maps know it (the board and the flat map have the same places): a town or a
  // place on the land by itself; a stretch of open country, or an area of the land that is neither, by its hex; a
  // place within a town (an inn, a hall) by its town.
  static whither(region: RegionChart, id?: string): string | undefined {
    const land = region.land;
    if (!id || !land) { return undefined; }
    const tract = land.tracts && id.startsWith(land.tracts) ? id.slice(land.tracts.length) : undefined;
    if (tract && /^\d+$/.test(tract)) { return `hex:${tract}`; }
    const area = region.within[id] ?? id, a = region.areas.find(x => x.id === area);
    const marked = [id, area].find(x => land.marks.some(m => m.id === x)
      || region.areas.some(t => t.id === x && t.kind === 'settlement'));
    return marked ?? (a ? `hex:${a.y * land.width + a.x}` : undefined);
  }
  // The board, given where the company is bound as the maps know it (see whither).
  static View({ region, chosen, choose, bound, flat, face }: { region: RegionChart; chosen?: string;
    choose: (id: string, keyed?: boolean) => void; bound?: string; flat: ReactNode; face?: string }) {
    const host = useRef<HTMLDivElement>(null), board = useRef<BoardApi | undefined>(undefined), pick = useRef(choose);
    const [failed, fail] = useState(() => !BoardField.able()), [ready, readied] = useState(false);
    const [land, same] = useMemo(() => BoardField.drawn(region, face), [region, face]);
    const now = useRef({ land, chosen, bound });
    pick.current = choose; now.current = { land, chosen, bound };
    useEffect(() => {
      if (failed) { return; }
      let live = true;
      // Made only once the map has been drawn opening (after the next frame), so that the press that opened it is
      // answered at once, and the making is not done in the moment of that press.
      void BoardField.load().then(m => requestAnimationFrame(() => setTimeout(() => {
        if (!live || !host.current) { return; }
        if (!m) { fail(true); return; }
        try {
          const still = matchMedia('(prefers-reduced-motion: reduce)').matches, at = now.current;
          board.current = m.mount(host.current, at.land, { choose: (id, keyed) => pick.current(id, keyed),
            lost: () => fail(true) }, still);
          // A board made again (the land changed under it) shows at once what is chosen and where you are bound.
          board.current.show(at.chosen, at.bound); readied(true);
        } catch (e) {
          // The flat map in its place, and why told where it can be read (a land the board could not be made of).
          console.error(e); fail(true);
        }
      })));
      return () => { live = false; board.current?.dispose(); board.current = undefined; readied(false); };
    }, [same, failed]);
    // Put away as the map closes, before it is taken off the page, while the page can still be told (see
    // BoardCamera.dispose).
    useLayoutEffect(() => () => { board.current?.dispose(); board.current = undefined; }, []);
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
