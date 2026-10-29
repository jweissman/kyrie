// What the map's board is given, and what it gives back. The board is its own script, loaded only when the map is
// first opened (see BoardField), so the reader and it share these shapes and nothing else.
export interface BoardMark { id: string; name: string; cell: number; kind: string; visited: boolean; town?: boolean }
export interface BoardLand {
  // Which country this is, so that what was known the last time it was opened can be told from what is new.
  key: string;
  width: number; height: number; cover: string; rivers: number[][]; roads: Record<string, number[]>;
  known: number[]; here?: number; marks: BoardMark[];
}
export interface BoardHooks { choose(id: string): void }
export interface BoardApi {
  show(chosen?: string, bound?: string): void;
  zoom(by: number): void;
  home(): void;
  dispose(): void;
}
export interface BoardModule { mount(host: HTMLElement, land: BoardLand, hooks: BoardHooks, still: boolean): BoardApi }
