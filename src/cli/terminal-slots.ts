import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { homedir } from 'node:os';
import { CheckpointStore, type KeyValueStorage } from '../session/checkpoint-store';

// Where the terminal keeps a game without being told where: the engine's own store of kept games (CheckpointStore)
// and its one slot (autosave), as the page keeps one game in the browser, written to a file of the player's
// (KYRIE_SLOTS, or ~/.kyrie/slots.json). Saving had asked for a path every time (the human mode's assessment); a path
// is asked only with --save-as.
export class TerminalSlots implements KeyValueStorage {
  private readonly kept: Record<string, string>;
  private constructor(private readonly path: string) {
    this.kept = existsSync(path) ? JSON.parse(readFileSync(path, 'utf8')) as Record<string, string> : {};
  }
  static path(env: Record<string, string | undefined> = process.env): string {
    return env.KYRIE_SLOTS ?? join(homedir(), '.kyrie', 'slots.json');
  }
  static store(path = TerminalSlots.path()): CheckpointStore { return new CheckpointStore(new TerminalSlots(path)); }
  getItem(key: string): string | null { return this.kept[key] ?? null; }
  setItem(key: string, value: string) { this.kept[key] = value; this.write(); }
  removeItem(key: string) { delete this.kept[key]; this.write(); }
  key(index: number): string | null { return Object.keys(this.kept)[index] ?? null; }
  get length(): number { return Object.keys(this.kept).length; }
  private write() {
    mkdirSync(dirname(this.path), { recursive: true });
    writeFileSync(this.path, JSON.stringify(this.kept));
  }
}
