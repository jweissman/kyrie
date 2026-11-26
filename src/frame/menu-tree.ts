import type { Choice, Section } from '../ui/choice-list';
import { SceneModel, type Scene } from '../ui/scene';
import { Attending } from '../ui/attention';
import type { Frame } from '../creation/protocol';
import type { Lens, Promoted } from '../presentation/glance-types';
import { Fold, type Chosen, type Leaf } from '../presentation/fold';
import { Attest, type Projected } from '../presentation/attest';
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
// journey across the country, the map's gold; led: each act led with (the glance's, a lens's, the offer's), by id;
// rows: each row of the scene as its own drawer marks it (Look… and a thing's pane: the aim's gold only on the act that
// carries it on); within: each as a row inside an opener marks it (by its own witnesses, an opener by its rows);
// lensed: each lens's rows, by id (the lens, the rail's mark over it, a tile, a row gathered by focus); replies: each
// thing to say to someone here, as the talk drawer marks it (itself, or what it opens), a reply asked again bearing
// nothing (the page lets go of those the player has asked: TalkStage).
export interface MenuMarks {
  place: Leaf[]; local: Leaf[]; map: Leaf[]; led: Record<string, Leaf[]>; rows: Record<string, Leaf[]>;
  within: Record<string, Leaf[]>; lensed: Partial<Record<Lens, Record<string, Leaf[]>>>;
  replies: Record<string, Leaf[]>;
  // places: each place named beside a way from here, by its id, as what is perceived of its area along the way there
  // (its place-mark, OR-1248); the place the company stands in is place's own.
  places?: Record<string, Leaf[]>;
}

export class MenuTree {
  // The frame with its menu: worked out where the frame leaves the engine (EngineHost), once all of it is settled.
  static framed<F extends Omit<Frame, 'menu'>>(frame: F): F & Pick<Frame, 'menu'> {
    return { ...frame, menu: this.of(frame) };
  }
  static of(frame: Omit<Frame, 'menu'>): MenuNode {
    const raw = SceneModel.build(frame.screen), found = Attending.place(raw);
    const tops = [...found.subjects.flatMap(s => s.choices), ...found.near, ...found.far, ...found.you];
    const openers = new Set(Attending.all(tops).filter(c => c.children?.length).map(c => c.id));
    const full = MenuModel.resting(found, openers, frame);
    const node: Omit<MenuNode, 'marks'> = { choices: full.choices, sections: full.sections, scene: full.scene!,
      destinations: full.destinations ?? [], around: full.around ?? [], under: this.under(tops),
      ...full.overland ? { overland: [...full.overland] } : {}, ...full.leads ? { leads: full.leads } : {},
      ...full.leading ? { leading: [...full.leading] } : {}, ...full.said ? { said: [...full.said] } : {},
      ...full.sheets ? { sheets: full.sheets } : {} };
    return { ...node, marks: this.marks(frame, this.opened(node, []), raw) };
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
  static marks(frame: Pick<Frame, 'leaf' | 'screen'>, menu: Menu, raw?: Scene): MenuMarks {
    const g = frame.leaf.glance, chosen = MenuModel.lead.bind(MenuModel, menu);
    const around = frame.screen.around ?? [];
    const next = g?.acts.find(a => a.continues && a.choice.startsWith('travel:')
      && !around.some(d => `travel:${d.id}` === a.choice));
    const ids = new Set([...g?.acts ?? [], ...Object.values(g?.lenses ?? {}).flatMap(l => l.promoted),
      ...g?.offer?.primary ?? [], ...g?.offer?.rest ?? []].map(a => a.choice));
    return { place: Fold.led(g, chosen), local: Fold.led(g, chosen, true),
      map: next ? [Fold.step(next.choice, [Attest.witness(g, next.choice)])] : [],
      led: Object.fromEntries([...ids].map(id => [id, Fold.of(g, chosen(id), id, true)])),
      ...this.rows(g, menu, chosen), lensed: this.lensed(g, chosen),
      replies: this.replies(g, raw ?? SceneModel.build(frame.screen), frame.screen.paying ?? []),
      places: Object.fromEntries([...frame.screen.exits.map(e => e.destination.id), ...around.map(d => d.id)]
        .map(id => [id, [Fold.step(`sensed:${id}`, [Attest.sensed(g, id)])]])) };
  }
  private static replies(g: Projected | undefined, scene: Scene, paying: readonly string[]): Record<string, Leaf[]> {
    const out: Record<string, Leaf[]> = {};
    for (const c of Attending.all(scene.subjects.flatMap(s => s.choices))) {
      out[c.id] ??= c.children?.length && !c.command ? Attending.all(c.children).filter(k => !k.children?.length)
        .map(k => this.reply(g, k, paying)) : [this.reply(g, c, paying)];
    }
    return out;
  }
  // What a reply bears: what the glance found in it, what it teaches and what pays; asked again, nothing.
  private static reply(g: Projected | undefined, k: Choice, paying: readonly string[]): Leaf {
    return Fold.leaf(k, /_again(\(|$)/.test(k.command ?? '') ? [] : Attest.reply(g, k, paying));
  }
  private static rows(g: Projected | undefined, menu: Menu, chosen: Chosen): Pick<MenuMarks, 'rows' | 'within'> {
    const scene = menu.scene, rows: Record<string, Leaf[]> = {}, within: Record<string, Leaf[]> = {};
    if (!scene) { return { rows, within }; }
    const all = Attending.all([...[...scene.subjects, ...scene.still ?? []].flatMap(s => s.choices), ...scene.near,
      ...scene.far, ...scene.you, ...menu.around ?? []]);
    const next = new Set((g?.acts ?? []).filter(a => a.continues).flatMap(a => chosen(a.choice)?.id ?? []));
    for (const c of all) {
      rows[c.id] ??= Fold.of(g, c, c.id, next.has(c.id));
      within[c.id] ??= c.children?.length && !c.command ? Fold.of(g, c, c.id, true)
        : [Fold.leaf(c, Attest.within(g, c))];
    }
    return { rows, within };
  }
  private static lensed(g: Projected | undefined, chosen: Chosen): MenuMarks['lensed'] {
    return Object.fromEntries(Object.entries(g?.lenses ?? {}).map(([lens, l]) => {
      const inside = Object.values(l.leaves ?? {}).flat();
      const ids = new Set([...l.promoted, ...l.rest, ...inside].map(a => a.choice));
      const led = [...g?.acts ?? [], ...l.promoted];
      return [lens, Object.fromEntries([...ids].map(id => [id, this.lens(g, { led, id,
        command: inside.find(a => a.choice === id)?.command }, chosen)]))];
    }));
  }
  // An act within an opener the menu does not hold unopened (a tablet's reading, gathered by focus) is known by the
  // lens's own command for it, so that what the opener is led for is found on it (AT-07: the gathered tablets plain).
  private static lens(g: Projected | undefined, { led, id, command }: { led: Promoted[]; id: string; command?: string },
    chosen: Chosen): Leaf[] {
    const on = led.some(a => a.choice === id && a.continues);
    return Fold.of(g, chosen(id) ?? (command ? { id, label: '', tone: 'way', command } : undefined), id, on);
  }
}
