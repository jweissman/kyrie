import { Board } from './board';
import type { BoardModule } from './board-types';

// The board's own script: loaded by the map when it is first opened, it leaves the board where the page can find it.
const module: BoardModule = { mount: Board.mount };
(globalThis as { KyrieBoard?: BoardModule }).KyrieBoard = module;
