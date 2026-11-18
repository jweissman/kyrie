import type { Choice } from '../ui/choice-list';
import type { Screen } from '../ui/screen-types';
import { Attending } from '../ui/attention';
import { SceneModel } from '../ui/scene';
import { Attest, type Witness } from './attest';
import type { Glance, Lens, Promoted } from './glance-types';

// One resolution from the engine's offer to rows that can be done (mission-22/doable-design.md, TB-12): what each
// offered choice is, what taking it does, and what it opens, read once from the scene the page draws its menu from
// (SceneModel, Attending.place), so that no client reads a row for itself. A row with a command does it; an opener
// does nothing of its own: taken, it opens, its rows first the one the engine leads it for (Promoted.for, inside).
// Its indicator is its witnesses (Attest), as the page draws it.
export interface Row {
  id: string; label: string; does?: string; opens?: Row[]; lens?: Lens; led?: true; witnesses: Witness[];
}
type Offered = Pick<Glance, 'acts' | 'lenses' | 'offer' | 'likenesses' | 'sensed' | 'following' | 'lead'>;

export class Doable {
  private static readonly kept = new WeakMap<object, Row[]>();
  // The offer's rows, the four first: from the glance and the screen it was drawn for.
  static of(glance: Offered, screen: Screen): Row[] {
    const kept = this.kept.get(glance);
    if (kept) { return kept; }
    const scene = Attending.place(SceneModel.build(screen)), tree = new Map<string, Choice>();
    this.index(tree, [...scene.subjects.flatMap(s => s.choices), ...scene.near, ...scene.far, ...scene.you]);
    const lensOf = new Map<string, Lens>(Object.entries(glance.lenses ?? {}).flatMap(([lens, l]) =>
      [...l.promoted.map(p => p.choice), ...l.rest.map(r => r.choice)].map(id => [id, lens as Lens] as const)));
    const acts = new Map(glance.acts.map(a => [a.choice, a]));
    const led = new Set((glance.offer?.primary ?? []).map(o => o.choice));
    const rows = [...glance.offer?.primary ?? [], ...glance.offer?.rest ?? []].map(o => this.row(o.choice, o.label,
      { tree, acts, glance, lens: lensOf.get(o.choice), led: led.has(o.choice) }));
    this.kept.set(glance, rows);
    return rows;
  }
  private static index(tree: Map<string, Choice>, cs: Choice[]): void {
    for (const c of cs) { tree.set(c.id, c); this.index(tree, c.children ?? []); }
  }
  private static row(id: string, label: string, at: { tree: Map<string, Choice>; acts: Map<string, Promoted>;
    glance: Offered; lens?: Lens; led?: boolean }): Row {
    const c = at.tree.get(id), act = at.acts.get(id);
    const witnesses = [Attest.witness(at.glance, id), ...c ? Attest.within(at.glance, c) : []]
      .filter((w): w is Witness => !!w);
    const base = { id, label: c?.alone ?? label, witnesses, ...at.lens ? { lens: at.lens } : {},
      ...at.led ? { led: true as const } : {} };
    const kids = c?.children ?? [];
    // A row with a command does it, even where acts hang under it (a way with a door to listen at is gone by).
    // One offered by its command, outside the scene's tree (a light, a set-down, a wait), does that command.
    const does = c ? c.command ?? act?.command : act?.command ?? id;
    if (c?.command || !kids.length) { return { ...base, ...does ? { does } : {} }; }
    // An opener opens: what the engine leads it for first, then the rest in the scene's order.
    const first = new Set([act?.for, ...(act?.inside ?? []).map(i => i.command)].filter((x): x is string => !!x));
    const ordered = [...kids.filter(k => first.has(k.command ?? '')), ...kids.filter(k => !first.has(k.command ?? ''))];
    return { ...base, opens: ordered.map(k => this.row(k.id, k.label, { ...at, lens: at.lens, led: false })) };
  }
  // What taking a row does at once, where it does anything: its command; an opener none (it opens).
  static does(rows: readonly Row[], id: string): string | undefined {
    for (const r of rows) {
      if (r.id === id) { return r.does; }
      const inner = r.opens && this.does(r.opens, id);
      if (inner) { return inner; }
    }
    return undefined;
  }
}
