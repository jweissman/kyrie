import type { Knowing } from '../../../src/ui/screen-types';

// What the map's board is given, and what it gives back. The board is its own script, loaded only when the map is
// first opened (see BoardField), so the reader and it share these shapes and nothing else. Each town and place with
// how much the company knows of it (see Knowing): only heard of, or not made out, it is a sign over the land and no
// more.
export interface BoardMark {
  id: string; name: string; cell: number; kind: string; visited: boolean; town?: boolean; state: Knowing;
}
export interface BoardLand {
  // Which country this is, so that what was known the last time it was opened can be told from what is new.
  key: string;
  width: number; height: number; cover: string; rivers: number[][]; roads: Record<string, number[]>;
  known: number[]; here?: number; marks: BoardMark[];
}
// What the board gives back: a hex or a place chosen (and whether by the keys, so that the way there is the next
// thing they reach), and that it can no longer be drawn, when the browser has taken its drawing away for good.
export interface BoardHooks { choose(id: string, keyed?: boolean): void; lost?(): void }
export interface BoardApi {
  show(chosen?: string, bound?: string): void;
  zoom(by: number): void;
  home(): void;
  dispose(): void;
}
export interface BoardModule { mount(host: HTMLElement, land: BoardLand, hooks: BoardHooks, still: boolean): BoardApi }
