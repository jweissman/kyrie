import type { Choice, Section } from '../ui/choice-list';
import { SceneModel, type Scene } from '../ui/scene';
import { Attending } from '../ui/attention';
import type { Frame } from '../creation/protocol';
import type { Promoted } from '../presentation/glance-types';
import { Fold, type Leaf } from '../presentation/fold';
import { Attest } from '../presentation/attest';
import { MenuModel, type Menu, type Sheets } from './menu-model';

// The resting scene's menu, as the frame holds it (OR-1071; the owner, 26 November: "we definitely need to move
// everything to scanning one tree"): the engine works it out once a frame, and every client reads it, never building
// its own from the screen and the glance. Its rows are every row the scene draws, each opener's rows beneath it as
// though every one were open, in the order they are drawn; under says, of a row inside an opener, which opener it is
// inside, so that a fold the player opens shows it and nothing is worked out again (MenuTree.opened). Its marks are the
// leaves each container's mark is the fold of (Fold): the place's own, the way back from the map, the map's, and each
// act the glance leads with, so that the page folds the frame's leaves and composes none (scripts/frame-marks.ts).
export interface MenuNode {
  choices: Choice[]; sections: Section[]; scene: Scene; destinations: Choice[]; around: Choice[];
  overland?: string[]; leads?: Promoted[]; leading?: string[]; said?: [string, string][]; sheets?: Sheets;
  under: Record<string, string>;
  marks: MenuMarks;
}
// place: what the place leads with, each act by its leaves (PlaceMark, the rail's mark over the scene); local: the
// same, less the journeys across the country (the map's way back to the scene); map: the aim's next step where it is a
// journey across the country, the map's gold; led: each act led with (the glance's, a lens's, the offer's), by id.
export interface MenuMarks { place: Leaf[]; local: Leaf[]; map: Leaf[]; led: Record<string, Leaf[]> }

export class MenuTree {
  // The frame with its menu: worked out where the frame leaves the engine (EngineHost), once all of it is settled.
  static framed<F extends Omit<Frame, 'menu'>>(frame: F): F & Pick<Frame, 'menu'> {
    return { ...frame, menu: this.of(frame) };
  }
  static of(frame: Omit<Frame, 'menu'>): MenuNode {
    const found = Attending.place(SceneModel.build(frame.screen));
    const tops = [...found.subjects.flatMap(s => s.choices), ...found.near, ...found.far, ...found.you];
    const openers = new Set(Attending.all(tops).filter(c => c.children?.length).map(c => c.id));
    const full = MenuModel.resting(found, openers, frame);
    const node: Omit<MenuNode, 'marks'> = { choices: full.choices, sections: full.sections, scene: full.scene!,
      destinations: full.destinations ?? [], around: full.around ?? [], under: this.under(tops),
      ...full.overland ? { overland: [...full.overland] } : {}, ...full.leads ? { leads: full.leads } : {},
      ...full.leading ? { leading: [...full.leading] } : {}, ...full.said ? { said: [...full.said] } : {},
      ...full.sheets ? { sheets: full.sheets } : {} };
    return { ...node, marks: this.marks(frame, this.opened(node, [])) };
  }
  // The menu as drawn with the folds the player has open: every row whose openers are all open.
  static opened(node: Omit<MenuNode, 'marks'>, open: Iterable<string>): Menu {
    const shown = MenuTree.shown.bind(MenuTree, node.under, new Set(open));
    const sheets = node.sheets && { look: node.sheets.look.filter(shown), ways: node.sheets.ways.filter(shown),
      more: node.sheets.more.filter(shown) };
    return { sections: node.sections, choices: node.choices.filter(c => shown(c.id)), scene: node.scene,
      destinations: node.destinations, around: node.around,
      ...node.overland ? { overland: new Set(node.overland) } : {}, ...node.leads ? { leads: node.leads } : {},
      ...node.leading ? { leading: new Set(node.leading) } : {}, ...node.said ? { said: new Map(node.said) } : {},
      ...sheets ? { sheets } : {} };
  }
  private static shown(under: Record<string, string>, open: Set<string>, id: string): boolean {
    for (let u = under[id]; u; u = under[u]) {
      if (!open.has(u)) { return false; }
    }
    return true;
  }
  // Of each row inside an opener, the opener: but a way's own rows, which are always drawn open under it (a portcullis
  // on a way: see MenuModel.inWay), and a row that is also drawn standing alone.
  private static under(tops: Choice[]): Record<string, string> {
    const top = new Set(tops.map(c => c.id)), out: Record<string, string> = {};
    for (const c of tops) { this.walk(c, MenuModel.inWay(c), top, out); }
    return out;
  }
  private static walk(c: Choice, forced: boolean, top: Set<string>, out: Record<string, string>) {
    for (const k of c.children ?? []) {
      if (!forced && !top.has(k.id)) { out[k.id] = c.id; }
      this.walk(k, false, top, out);
    }
  }
  // The marks of a menu drawn over the frame's glance (a spec's hand-made frame and menu read them too).
  static marks(frame: Pick<Frame, 'leaf' | 'screen'>, menu: Menu): MenuMarks {
    const g = frame.leaf.glance, chosen = MenuModel.lead.bind(MenuModel, menu);
    const around = frame.screen.around ?? [];
    const next = g?.acts.find(a => a.continues && a.choice.startsWith('travel:')
      && !around.some(d => `travel:${d.id}` === a.choice));
    const ids = new Set([...g?.acts ?? [], ...Object.values(g?.lenses ?? {}).flatMap(l => l.promoted),
      ...g?.offer?.primary ?? [], ...g?.offer?.rest ?? []].map(a => a.choice));
    return { place: Fold.led(g, chosen), local: Fold.led(g, chosen, true),
      map: next ? [Fold.step(next.choice, [Attest.witness(g, next.choice)])] : [],
      led: Object.fromEntries([...ids].map(id => [id, Fold.of(g, chosen(id), id, true)])) };
  }
}
