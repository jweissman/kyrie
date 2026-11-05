import emblems from '../../data/paintings/emblems.json';

// The emblems (data/paintings/emblems.json): one line glyph for each thing chosen or met by its kind (a people, a
// calling, a way, a school, a god, a life, a reason for coming, what a spell is for), keyed by the id of what it stands
// for, drawn the same in creation, in play and in the Encyclopedia of Imbar (the owner, 5 November: one visual
// vocabulary, authorable, never a letter in a ring). What has none is shown by its name alone.
export class Emblems {
  static readonly sets = emblems.sets as Record<string, { about: string; paths: Record<string, string> }>;
  private static readonly all: Record<string, string> = Object.assign({},
    ...Object.values(Emblems.sets).map(s => s.paths));
  static path(id: string): string | undefined { return Object.hasOwn(Emblems.all, id) ? Emblems.all[id] : undefined; }
  static has(id: string): boolean { return Emblems.path(id) !== undefined; }
  // The emblem as markup, for a page drawn as text (the Encyclopedia).
  static svg(id: string, className = 'emblem'): string {
    const d = Emblems.path(id);
    return d ? `<svg class="${className}" viewBox="0 0 48 48" aria-hidden="true" focusable="false"><path d="${d}" `
      + 'vector-effect="non-scaling-stroke"/></svg>' : '';
  }
}
