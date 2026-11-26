import { expect } from 'bun:test';
import type { Frame } from '../../src/creation/protocol';
import { MenuModel, type Menu } from '../../src/frame/menu-model';
import { MenuTree, type MenuMarks } from '../../src/frame/menu-tree';
import type { Choice } from '../../src/ui/choice-list';
import type { Lens, Lensed } from '../../src/presentation/glance-types';
import { SceneModel } from '../../src/ui/scene';
import { Attending } from '../../src/ui/attention';
import { Fold } from '../../src/presentation/fold';
import { Attest } from '../../src/presentation/attest';

// The frame's menu held to what the page had built for itself (OR-1071, the menu and lens tree's first increment):
// the resting scene's menu as the frame holds it, drawn with any fold the player opens (MenuTree.opened), is the menu
// MenuModel worked out with that fold open; and the marks the frame carries are those the page had folded from its
// own lookups of that menu (place-mark, the rail's way back from the map and the map's gold, each act led with).
export class MenuOracle {
  // The menu as the page had built it, with these folds open.
  static built(frame: Frame, open: string[]): Menu {
    return MenuModel.resting(Attending.place(SceneModel.build(frame.screen)), new Set(open), frame);
  }
  // Each difference between the frame's tree and the oracle, named; none where they agree.
  static differences(frame: Frame): string[] {
    const out: string[] = [], tree = MenuTree.of(frame), at = frame.screen.place.id;
    const openers = Attending.all(this.built(frame, []).choices).filter(c => c.children?.length).map(c => c.id);
    for (const open of [[], ...openers.map(id => [id]), openers]) {
      const was = this.built(frame, open), now = MenuTree.opened(tree, open);
      if (!this.same(now, was)) { out.push(`${at}: the menu with ${open.join(',') || 'nothing'} open differs`); }
    }
    const g = frame.leaf.glance, menu = this.built(frame, []), chosen = MenuModel.lead.bind(MenuModel, menu);
    const around = frame.screen.around ?? [];
    const next = g?.acts.find(a => a.continues && a.choice.startsWith('travel:')
      && !around.some(d => `travel:${d.id}` === a.choice));
    const marks = { place: Fold.led(g, chosen), local: Fold.led(g, chosen, true),
      map: next ? [Fold.step(next.choice, [Attest.witness(g, next.choice)])] : [] };
    for (const [k, leaves] of Object.entries(marks)) {
      if (!this.same(tree.marks[k as keyof typeof marks], leaves)) { out.push(`${at}: the ${k} mark differs`); }
    }
    for (const a of [...g?.acts ?? [], ...g?.offer?.primary ?? []]) {
      if (!this.same(tree.marks.led[a.choice], Fold.of(g, chosen(a.choice), a.choice, true))) {
        out.push(`${at}: the mark of ${a.choice} differs`);
      }
    }
    return [...out, ...this.rows(frame, tree.marks, menu), ...this.lensed(frame, tree.marks, menu)];
  }
  // Each row of the scene as Look… and a thing's pane had marked it (AtHand.leaves: the aim's gold only where it
  // carries the aim on), and as a row inside an opener had (PlaceStage.Within).
  private static rows(frame: Frame, marks: MenuMarks, menu: Menu): string[] {
    const g = frame.leaf.glance, scene = menu.scene!, out: string[] = [];
    const carries = (c: Choice) => !!g?.acts.some(a => a.continues && MenuModel.lead(menu, a.choice)?.id === c.id);
    for (const c of Attending.all([...[...scene.subjects, ...scene.still ?? []].flatMap(s => s.choices), ...scene.near,
      ...scene.far, ...scene.you])) {
      if (!this.same(marks.rows[c.id], Fold.of(g, c, c.id, carries(c)))) { out.push(`the row ${c.id} differs`); }
      const within = c.children?.length && !c.command ? Fold.of(g, c, c.id, true) : [Fold.leaf(c, Attest.within(g, c))];
      if (!this.same(marks.within[c.id], within)) { out.push(`the row ${c.id} within differs`); }
    }
    return out;
  }
  // Each lens's row as LensRows had marked it.
  private static lensed(frame: Frame, marks: MenuMarks, menu: Menu): string[] {
    const g = frame.leaf.glance, out: string[] = [];
    for (const [lens, l] of Object.entries(g?.lenses ?? {}) as [Lens, Lensed][]) {
      const inside = Object.values(l.leaves ?? {}).flat();
      for (const a of [...l.promoted, ...l.rest, ...inside]) {
        const id = a.choice, on = [...g?.acts ?? [], ...l.promoted].some(x => x.choice === id && x.continues);
        const command = inside.find(x => x.choice === id)?.command;
        const was = Fold.of(g, MenuModel.lead(menu, id) ?? (command ? { id, label: '', command } as Choice : undefined),
          id, on);
        if (!this.same(marks.lensed[lens]?.[id], was)) { out.push(`the ${lens} lens's ${id} differs`); }
      }
    }
    return out;
  }
  private static same(a: unknown, b: unknown): boolean {
    try { expect(a).toEqual(b); return true; } catch { return false; }
  }
  // The frame as the host sends it, over a runner's leaf and screen.
  static frame(screen: Frame['screen'], leaf: Frame['leaf']): Frame {
    return MenuTree.framed({ title: '', screen, entries: [], leaf, opening: [], chronicle: [],
      transcript: { steps: [] } } as unknown as Frame);
  }
}
