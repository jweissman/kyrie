import type { BoardLand, BoardMark } from './board-types';
import { HexSteps } from './hex-steps';

// What the board draws of a land, as plain data, so that a board made again and a board updated in place can be told to
// draw the same (OR-91's rest: at a journey's end the board had been made again whole, 1.2 s of the scene built anew
// without a GPU, its land's key the whole land). The shape is what only a new board can draw: the country, its size,
// its rivers, and the shore known at its edge, which the low land past the edge is laid from. What is laid is what the
// land's layer is made again for, beside the old and shown in its place (see BoardLayer): the roads known, which the
// ground, its tiles and what grows on them are shaped by, and the places by what and where they are (a town's hex
// nothing grows in the middle of, a place's hex kept level). The rest an update draws in place: what is known, where
// you are, each place's label and what stands for it (how much is known of it, whether it was been to, its colour and
// companion, whether its hex is known and whether you are on it), and the hexes about the towns that are known (where
// their houses stand: a lot on a hex not known is drawn in onto the town's own).
export interface BoardState {
  shape: string; laid: string; known: number[]; here?: number; marks: Record<string, string>; towns: number[];
}
// What a board draws, read back from it (Board.drawn) or wanted of a land (BoardModel.drawn): what is known, where
// your mark is, each place's label by how it is known (how much, been to, its colour, a companion), and the places
// that have something standing for them.
export interface BoardDrawn { known: number[]; here?: number; labels: Record<string, string>; models: string[] }
// What changed: a new board, or each part to be drawn again.
export interface BoardChange {
  rebuild: boolean; laid: boolean; known: boolean; here: boolean; marks: string[]; towns: boolean;
}
export class BoardModel {
  static of(land: BoardLand): BoardState {
    const known = new Set(land.known);
    const shore = [...known].filter(c => BoardModel.edge(land, c) && ['~', 'o'].includes(land.cover[c] ?? '.'))
      .sort((a, b) => a - b);
    const shape = JSON.stringify([land.key, land.width, land.height, land.cover, land.rivers, land.terrain ?? '',
      land.face ?? '', shore]);
    const laid = JSON.stringify([land.roads, land.marks.map(m => [m.id, m.cell, m.kind, !!m.town])]);
    const about = new Set(land.marks.filter(m => m.town)
      .flatMap(m => [m.cell, ...HexSteps.neighbours(land.width, land.height, m.cell)]));
    return { shape, laid, known: [...known].sort((a, b) => a - b),
      ...land.here === undefined ? {} : { here: land.here },
      marks: Object.fromEntries(land.marks.map(m => [m.id, BoardModel.mark(m, known, land.here)])),
      towns: [...about].filter(c => known.has(c)).sort((a, b) => a - b) };
  }
  static drawn(land: BoardLand): BoardDrawn {
    const models = land.marks.filter(m => !m.town && m.state !== 'heard' && m.state !== 'unknown').map(m => m.id);
    return { known: [...land.known].sort((a, b) => a - b), ...land.here === undefined ? {} : { here: land.here },
      labels: Object.fromEntries(land.marks.map(m => [m.id, BoardModel.label(m)])), models: models.sort() };
  }
  static label(m: Pick<BoardMark, 'state' | 'visited' | 'tone' | 'companion'>): string {
    return [m.state, m.visited ? 'visited' : '', m.tone ?? '', m.companion ? 'companion' : ''].join('|');
  }
  // A hex at the land's edge, whose being known for water lays the sea on past it (see BoardUnder).
  private static edge(land: BoardLand, c: number): boolean {
    return c < land.width || c >= land.width * (land.height - 1) || c % land.width === 0
      || c % land.width === land.width - 1;
  }
  // One place as it is drawn.
  static mark(m: BoardMark, known: Set<number>, here?: number): string {
    return JSON.stringify([m.cell, m.kind, m.name, m.state, m.visited, m.tone ?? '', !!m.companion, known.has(m.cell),
      m.cell === here]);
  }
  static change(a: BoardState, b: BoardState): BoardChange {
    if (a.shape !== b.shape) {
      return { rebuild: true, laid: true, known: true, here: true, marks: Object.keys(b.marks), towns: true };
    }
    const ids = [...new Set([...Object.keys(a.marks), ...Object.keys(b.marks)])];
    return { rebuild: false, laid: a.laid !== b.laid, known: String(a.known) !== String(b.known),
      here: a.here !== b.here,
      marks: ids.filter(id => a.marks[id] !== b.marks[id]), towns: String(a.towns) !== String(b.towns) };
  }
  // A state with a change applied from the state it is to become: what an update leaves the board drawing.
  static applied(a: BoardState, change: BoardChange, b: BoardState): BoardState {
    if (change.rebuild) { return b; }
    const marks = { ...a.marks };
    for (const id of change.marks) {
      if (b.marks[id] === undefined) { delete marks[id]; } else { marks[id] = b.marks[id]; }
    }
    const here = change.here ? b.here : a.here;
    return { shape: a.shape, laid: change.laid ? b.laid : a.laid, known: change.known ? b.known : a.known,
      ...here === undefined ? {} : { here }, marks,
      towns: change.towns ? b.towns : a.towns };
  }
}
