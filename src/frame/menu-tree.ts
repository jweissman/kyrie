import type { Choice, Section } from '../ui/choice-list';
import { SceneModel, type Scene } from '../ui/scene';
import { Attending } from '../ui/attention';
import type { Frame } from '../creation/protocol';
import type { Lens, Promoted } from '../presentation/glance-types';
import { Fold, type Chosen, type Leaf } from '../presentation/fold';
import { Attest, type Projected } from '../presentation/attest';
import { MenuModel, type Menu, type Sheets } from './menu-model';
import { TalkQuestion, type Question } from './talk-question';
import { PlaceQuestion } from './place-question';
import type { Focus, Conversation } from '../session/focus';
import type { Campaign } from '../campaign/campaign';

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
  // The question asked from the session's focus (OR-1451): while it is a talk, the talk's menu, built once here over
  // the frame for every client (TalkQuestion). Its rows come from the player's immutable kept rows, never a fresh
  // PlayerFrame rebuild for this question.
  // At the place, its own question, the four and the rest a page at a time (PlaceQuestion, OR-1490), where the frame
  // has its menu.
  static question(frame: Pick<Frame, 'screen' | 'leaf'> & { menu?: MenuNode }, focus: Focus,
    conversation?: Conversation, campaign?: Campaign): Question {
    const asked = TalkQuestion.of(frame, focus, conversation, campaign);
    if (asked.focus.kind !== 'place') { return asked; }
    const place = PlaceQuestion.of(frame, asked.focus.page ?? 0);
    return place ? { ...asked, place } : asked;
  }
  static of(frame: Omit<Frame, 'menu'>): MenuNode {
    const raw = SceneModel.build(frame.screen), found = Attending.place(raw);
    const tops = [...found.subjects.flatMap(s => s.choices), ...found.near, ...found.far, ...found.you];
    const openers = new Set(Attending.all(tops).filter(c => c.children?.length).map(c => c.id));
    const full = MenuModel.resting(found, openers, frame);
    const node: Omit<MenuNode, 'marks'> = { choices: this.flattened(full.choices, tops), sections: full.sections,
      scene: full.scene!, destinations: full.destinations ?? [], around: full.around ?? [], under: {},
      ...full.overland ? { overland: [...full.overland] } : {}, ...full.leads ? { leads: full.leads } : {},
      ...full.leading ? { leading: [...full.leading] } : {}, ...full.said ? { said: [...full.said] } : {},
      ...full.sheets ? { sheets: full.sheets } : {} };
    // Its marks from the rows as the scene holds them, an opener's the fold of its own rows (MenuTree.marks).
    return { ...node, marks: this.marks(frame, this.opened({ ...node, choices: full.choices, under: this.under(tops) },
      []), raw) };
  }
  // One row, "Talk to …" (the owner's ruling, OR-1451): turned to and greeted in one act where the world has a greeting
  // (its row does talk_to), else turned to by the session's own command, which takes no time (focus:talk): every client
  // does the row by its command. (The glance reads the talk as it was, with no command of its own.)
  static turning(this: void, c: Choice): Choice {
    const who = !c.command && /^(.+)#talk$/.exec(c.id)?.[1];
    return who ? { ...c, command: `focus:talk:${who}` } : c;
  }
  // One flat level outside a fight (AGENTS.md: "Unfolding menus only in a fight"; the owner's playtest, 26 November,
  // OR-1295: "Look at the bronze ring" had opened its acts beneath it): no row of the resting scene unfolds rows of its
  // own. A thing looked at or someone talked to is a page of their own (Attending: the thing's page, the
  // conversation), so its rows are that page's, never under its row here; any other row's rows (a way's obstacle, a
  // fold of the company's acts) stand flat beside it, the fold itself gone; and no row carries rows.
  static readonly paged = /#(look|talk)$/;
  // A riddle's focus (the speaking door's words under the question it reads out whole) stays as it is until it is asked
  // in place of the four, as a fight's target is to be (OR-1301, with OR-1296).
  static flattened(choices: Choice[], tops: Choice[]): Choice[] {
    const under = this.under(tops), focused = new Set(Attending.all(tops).filter(c => c.focus).map(c => c.id));
    return choices.filter(c => MenuTree.focused(c.id, under, focused) || (!MenuTree.inPage(c.id, under)
      && !(c.children?.length && !c.command && !MenuTree.paged.test(c.id))))
      .map(c => (MenuTree.focused(c.id, under, focused) ? c : MenuTree.leaf(c)));
  }
  private static focused(id: string, under: Record<string, string>, focused: Set<string>): boolean {
    for (let u: string | undefined = id; u; u = under[u]) { if (focused.has(u)) { return true; } }
    return false;
  }
  // Whether a row is inside a thing's or a person's page, under its opener.
  private static inPage(id: string, under: Record<string, string>): boolean {
    for (let u = under[id]; u; u = under[u]) { if (MenuTree.paged.test(u)) { return true; } }
    return false;
  }
  private static leaf(c: Choice): Choice {
    if (!c.children) { return c; }
    const row = { ...c };
    delete row.children;
    return row;
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
