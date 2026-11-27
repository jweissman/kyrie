import { Installed } from '../ports/installed';
import type { EmblemSet } from '../ports/presentation';

// The emblems (data/paintings/emblems.json): one line glyph for each thing chosen or met by its kind (a people, a
// calling, a way, a school, a god, a life, a reason for coming, what a spell is for), keyed by the id of what it stands
// for, drawn the same in creation, in play and in the Encyclopedia of Imbar (the owner, 5 November: one visual
// vocabulary, authorable, never a letter in a ring). What has none is shown by its name alone.
export class Emblems {
  private static readonly empty: Record<string, EmblemSet> = {};
  private static readonly indexes = new WeakMap<Record<string, EmblemSet>, {
    paths: Record<string, string>; text: Record<string, string> }>();
  static get sets(): Record<string, EmblemSet> { return Installed.current().presentation?.emblems ?? this.empty; }
  private static index(): { paths: Record<string, string>; text: Record<string, string> } {
    const sets = this.sets, cached = this.indexes.get(sets);
    if (cached) { return cached; }
    const index = { paths: Object.assign({}, ...Object.values(sets).map(s => s.paths)) as Record<string, string>,
      text: Object.assign({}, ...Object.values(sets).map(s => s.text ?? {})) as Record<string, string> };
    this.indexes.set(sets, index);
    return index;
  }
  static path(id: string): string | undefined {
    const paths = this.index().paths;
    return Object.hasOwn(paths, id) ? paths[id] : undefined;
  }
  static text(id: string): string | undefined {
    const text = this.index().text;
    return Object.hasOwn(text, id) ? text[id] : undefined;
  }
  static has(id: string): boolean { return Emblems.path(id) !== undefined; }
  // The emblem as markup, for a page drawn as text (the Encyclopedia).
  static svg(id: string, className = 'emblem'): string {
    const d = Emblems.path(id);
    return d ? `<svg class="${className}" viewBox="0 0 48 48" aria-hidden="true" focusable="false"><path d="${d}" `
      + 'vector-effect="non-scaling-stroke"/></svg>' : '';
  }
}
