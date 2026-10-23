import { Voice } from './voice';

// How far the voice tables cover the moments they are meant for: for each kind, each value of each circumstance
// some line names, and how many lines a moment with that value alone would choose among.
export class VoiceCoverage {
  static report(): string[] {
    const rows: string[] = [];
    for (const table of Voice.tables) {
      for (const kind of table.kinds) {
        const lines = table.lines.filter(l => l.id.startsWith(`${kind}.`) || table.kinds.length === 1);
        const keys = new Map<string, Set<string>>();
        for (const l of lines) {
          for (const [k, v] of Object.entries(l.when ?? {})) {
            for (const value of [v].flat()) { (keys.get(k) ?? keys.set(k, new Set()).get(k)!).add(value); }
          }
        }
        const plain = lines.filter(l => !l.when).length;
        const cells = [...keys].flatMap(([k, values]) => [...values].map(v => `${k}=${v}:${Voice.fitting(kind, { [k]: v }).length}`));
        rows.push(`${kind}: ${lines.length} lines (${plain} for any moment)${cells.length ? `; ${cells.join(' ')}` : ''}`);
      }
    }
    return rows;
  }
}
