import { expect } from 'bun:test';
import type { Frame } from '../../src/creation/protocol';
import { MenuModel, type Menu } from '../../src/frame/menu-model';
import { MenuTree } from '../../src/frame/menu-tree';
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
