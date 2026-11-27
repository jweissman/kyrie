import { PresentationResources } from '../ports/presentation-resources';

// The emblems (data/paintings/emblems.json): one line glyph for each thing chosen or met by its kind (a people, a
// calling, a way, a school, a god, a life, a reason for coming, what a spell is for), keyed by the id of what it stands
// for, drawn the same in creation, in play and in the Encyclopedia of Imbar (the owner, 5 November: one visual
// vocabulary, authorable, never a letter in a ring). What has none is shown by its name alone.
export class Emblems {
  private static readonly paths = new WeakMap<object, Record<string, string>>();
  static get sets() { return PresentationResources.emblems().sets; }
  private static all(): Record<string, string> {
    const domain = PresentationResources.domain(), kept = this.paths.get(domain);
    if (kept) { return kept; }
    const made = Object.assign({}, ...Object.values(this.sets).map(s => s.paths));
    this.paths.set(domain, made);
    return made;
  }
  static path(id: string): string | undefined {
    const all = this.all();
    return Object.hasOwn(all, id) ? all[id] : undefined;
  }
  static has(id: string): boolean { return Emblems.path(id) !== undefined; }
  // The emblem as markup, for a page drawn as text (the Encyclopedia).
  static svg(id: string, className = 'emblem'): string {
    const d = Emblems.path(id);
    return d ? `<svg class="${className}" viewBox="0 0 48 48" aria-hidden="true" focusable="false"><path d="${d}" `
      + 'vector-effect="non-scaling-stroke"/></svg>' : '';
  }
}
