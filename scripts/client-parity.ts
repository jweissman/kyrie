import type { Runner } from '../src/cli/runner';
import { Serve } from '../src/cli/serve';
import { Doable, type Row } from '../src/presentation/doable';
import type { Lens, Promoted, LensAct } from '../src/presentation/glance-types';
import type { Choice } from '../src/ui/choice-list';
import { ScreenModel } from '../src/ui/screen-model';
import { MenuModel } from '../src/frame/menu-model';
import { GlanceStage } from '../web/reader/stage/glance';
import { LensRows } from '../web/reader/stage/lens-rows';
import { PlaceStage } from '../web/reader/stage/place-stage';
import { MapMenu } from '../web/reader/map-menu';
import type { ReaderApp } from '../web/reader/reader-app';
import type { Frame } from '../src/creation/protocol';
import { MenuTree } from '../src/frame/menu-tree';

// The other clients at the runner's turns (MT-18, after the runner's own: scripts/offer-parity.ts): what the page
// draws, built headlessly as the page builds it (its menu, MenuModel; the four, GlanceStage; each lens's rows,
// LensRows), and what `serve` answers (its view: the acts led, every choice by id), each read against the engine's one
// projection of the same turn (Doable), by the act each row does. Each divergence is named by its client and kind
// ("page engine only: …", "serve words: …"), into the one baseline. Not measured yet: the page's talk drawer (drawn
// only once a person is turned to) and the map's menu (CO-20); the map's menu is read now, every page of it (OR-152).
interface Act {
  words: string; label?: string; short?: string; alts?: Set<string>; id: string; lens?: Lens; within?: string;
  map?: true; chart?: string;
}
interface Drawn {
  act: string; words: string; id: string; lens?: Lens;
  where: 'four' | 'lens' | 'menu' | 'pack' | 'likeness' | 'talk' | 'map';
}
export class ClientParity {
  // The engine's acts by what each does, in its own words, with its lens and what it is held within.
  static engine(rows: Row[]): Map<string, Act> {
    const out = new Map<string, Act>();
    for (const r of Doable.flat(rows)) {
      const act = r.for ?? r.does;
      if (!act) { continue; }
      // Every row doing it says words of the engine's (a talk led for a question, the question's own row); the one led
      // for it (for) says what it is called among the four.
      const had = out.get(act), alts = new Set([...had?.alts ?? [], r.label, ...r.called ? [r.called] : [],
        ...r.short ? [r.short] : []]);
      if (had && !r.for) { out.set(act, { ...had, alts }); continue; }
      // A talk led for a question does the talk too (Row.does): drawn as the talk where it is not led (a lens, a
      // likeness), it is the engine's row, not the client's own.
      if (r.for && r.does && r.does !== r.for && !out.has(r.does)) {
        out.set(r.does, { words: r.label, label: r.label, alts: new Set([r.label]), id: r.id,
          ...r.lens ? { lens: r.lens } : {} });
      }
      out.set(act, { words: r.called ?? r.label, label: r.label, ...r.short ? { short: r.short } : {}, alts, id: r.id,
        ...r.lens ? { lens: r.lens } : {}, ...r.within ? { within: r.within } : {}, ...r.map ? { map: r.map } : {},
        ...r.chart ? { chart: r.chart } : {} });
    }
    return out;
  }
  static turn(runner: Runner, out: Set<string>) {
    const leaf = runner.leaf, glance = leaf?.glance;
    if (!leaf || !glance) { return; }
    const frame = MenuTree.framed({ title: '', screen: ScreenModel.build(runner.session.campaign), entries: [], leaf,
      opening: [], chronicle: [], transcript: { steps: [] } } as unknown as Frame);
    const rows = Doable.of(glance, frame.screen);
    this.page(frame, rows, out);
    this.serve(runner, rows, out);
  }
  // A row of the four in the words the page draws it in: its label as GlanceStage.Acts draws the choice it is taken as.
  private static four(app: ReaderApp, a: Promoted): string {
    const c = GlanceStage.taken(app, a);
    return c ? GlanceStage.label(app, a, c) : a.label;
  }
  // What the page draws: the four, every lens's rows, the menu's every choice (what the keys and automation reach).
  static drawn(frame: Frame): { drawn: Drawn[]; app: ReaderApp; four: Promoted[] } {
    const menu = MenuModel.build(frame, 'here', []);
    const app = { state: { frame, open: [], focused: [] }, menu, props: { query: new URLSearchParams() } } as unknown as
      ReaderApp;
    const glance = frame.leaf.glance!, four = GlanceStage.offered(app) ?? GlanceStage.foreground(app, glance.acts);
    // One of the four opening the map at a place (Row.chart) is drawn as what pressing it does, and in the words of
    // the choice the page draws it as (GlanceStage.taken), not the glance's own label for it: the page had drawn a
    // journey led across the country as the world map's own row (the owner's P0, 20 November, OR-159), and the
    // measure, reading the glance's label, had seen nothing wrong.
    const drawn: Drawn[] = four.map(a => ({
      act: this.charted(app, a) ?? a.inside?.[0]?.command ?? a.command ?? a.choice,
      words: this.four(app, a), id: a.choice, where: 'four' as const }));
    type Lenses = NonNullable<typeof glance.lenses>;
    for (const [lens, lensed] of Object.entries(glance.lenses ?? {}) as [Lens, Lenses[Lens]][]) {
      for (const a of LensRows.of(app, lens, lensed, GlanceStage.choice).all as (Promoted | LensAct)[]) {
        drawn.push({ act: a.command ?? a.choice, words: a.label, id: a.choice, lens, where: 'lens' });
      }
    }
    for (const c of this.leaves(menu.choices)) {
      drawn.push({ act: c.command!, words: c.label, id: c.id, where: 'menu' });
    }
    // And the pack, where what is carried is done with (the page's Pack, its own view).
    for (const c of this.leaves(MenuModel.build(frame, 'pack', []).choices)) {
      drawn.push({ act: c.command!, words: c.label, id: c.id, where: 'pack' });
    }
    drawn.push(...this.attended(frame, menu));
    // And the map's menu, every page of it: each journey it sets out on (MapMenu.rows, the engine's MapRows).
    for (const r of MapMenu.rows(app, frame.screen, { taken: [] })) {
      drawn.push({ act: r.row.does!, words: r.row.label, id: r.row.id, where: 'map' });
    }
    return { drawn, app, four };
  }
  private static charted(app: ReaderApp, a: Promoted): string | undefined {
    const does = GlanceStage.taken(app, a)?.command;
    return does?.startsWith('view:map:') ? does : undefined;
  }
  // Whoever is here as the page draws them, by their likeness (taken, it talks to them: PlaceStage.into), and what
  // their talk drawer holds once the company turns to them, trading too (MenuModel's attention, Wares): the measure
  // had not read these (MT-18: talk_to, take_leave and buy_item counted the engine's only).
  private static attended(frame: Frame, menu: ReturnType<typeof MenuModel.build>): Drawn[] {
    const people = (menu.scene?.subjects ?? []).filter(x => ['person', 'companion'].includes(x.kind));
    return people.flatMap(x => {
      const into = PlaceStage.into(x), attention = { kind: 'person' as const, id: x.id };
      const drawer = [false, true].flatMap(trading => this.leaves(MenuModel.build(frame, 'here', [],
        { attention, trading }).choices));
      return [...into?.command ? [{ act: into.command, words: into.label, id: into.id, where: 'likeness' as const }]
        : [], ...drawer.map(c => ({ act: c.command!, words: c.label, id: c.id, where: 'talk' as const }))];
    });
  }
  private static leaves(choices: Choice[]): Choice[] {
    return choices.flatMap(c => [...c.command ? [c] : [], ...this.leaves(c.children ?? [])]);
  }
  private static page(frame: Frame, rows: Row[], out: Set<string>) {
    const { drawn, app, four } = this.drawn(frame), engine = this.lensed(frame, this.engine(rows), drawn);
    const acts = new Map<string, Drawn[]>();
    for (const d of drawn) { acts.set(d.act, [...acts.get(d.act) ?? [], d]); }
    const ids = new Set(drawn.map(d => d.id));
    for (const [act, e] of engine) {
      const at = acts.get(act);
      if (!at) {
        const held = e.within && (ids.has(e.within) || acts.has(engine.get(e.within)?.id ?? e.within));
        if (!held) { out.add(`page engine only: ${e.map ? 'map ' : ''}${this.short(act)}`); }
        continue;
      }
      const wrong = at.filter(d => !this.says(d, e));
      if (wrong.some(d => !this.menus.has(d.where))) {
        out.add(`page words: ${this.short(act)}`);
        this.example(`page words: ${this.short(act)}`, e.words, wrong[0]!.words);
      }
      if (at.every(d => this.menus.has(d.where)) && wrong.length) {
        out.add(`page menu words: ${this.short(act)}`);
        this.example(`page menu words: ${this.short(act)}`, e.words, wrong[0]!.words);
      }
      if (e.lens && at.some(d => d.lens && d.lens !== e.lens)) { out.add(`page lens: ${this.short(act)}`); }
      if (e.map && at.some(d => d.where === 'four')) { out.add(`page unfolded: ${this.short(act)}`); }
    }
    // An opener the page draws by itself (a thing's look whose every act is shut, the wayside shrine with no coin) is
    // the engine's where a row of the engine's by that id opens: it does no act, so it is met by its id.
    const opening = new Set(Doable.flat(rows).filter(r => r.opens?.length).map(r => r.id));
    for (const [act, at] of acts) {
      // (A talk with no greeting is turned to by the session's command, focus:talk, no act of the world's: OR-1451.)
      if (act.startsWith('focus:talk:') && at.every(d => d.id.endsWith('#talk'))) { continue; }
      if (!engine.has(act) && !at.every(d => d.id === act && opening.has(d.id))) {
        out.add(`page only: ${at[0]!.where} ${this.short(act)}`);
      }
    }
    // What pressing one of the four does: as the engine's row for it does (Doable.one), never the page's own fold.
    const glance = frame.leaf.glance!;
    for (const a of four) {
      const c = GlanceStage.taken(app, a);
      const pressed = c ? c.command ?? a.choice : a.command ?? a.choice;
      const does = Doable.one(glance, frame.screen, a.choice, a.command).does;
      if (does && pressed !== does && a.inside?.[0]?.command !== does) { out.add(`page pressed: ${this.short(a.choice)}`); }
    }
  }
  // Where the page draws a row in a list of its own (its menu, the pack, a talk drawer, a likeness).
  private static readonly menus = new Set<Drawn['where']>(['menu', 'pack', 'talk', 'likeness', 'map']);
  // Whether a row the page draws says the engine's words: its own (what it is called, LedWords), or, under what holds
  // it (a person's talk, a thing, the pack), the engine's other words for it there (its label, Row.short); among the
  // four, only what it is called.
  private static says(d: Drawn, e: Act): boolean {
    return d.words === e.words || (d.where !== 'four' && !!e.alts?.has(d.words));
  }
  // A lens's rows are the engine's too where it offers them by Doable.one (the runner's lens view draws them so: a
  // way off a road hex, a thing's look, which the turn's offer leaves out): the engine's act for each, by the act its
  // row does, so that a lens row is read against its own engine row and not counted the page's own.
  private static lensed(frame: Frame, engine: Map<string, Act>, drawn: Drawn[]): Map<string, Act> {
    const glance = frame.leaf.glance!, out = new Map(engine);
    for (const d of drawn.filter(x => x.where === 'lens' && !engine.has(x.act))) {
      const one = Doable.one(glance, frame.screen, d.id, d.act === d.id ? undefined : d.act), act = one.for ?? one.does;
      if (act && !out.has(act)) {
        out.set(act, { words: one.called ?? one.label, ...one.short ? { short: one.short } : {}, id: one.id,
          lens: d.lens });
      }
    }
    return out;
  }
  // What `serve` answers at the same turn (Serve.of): the acts it leads with, and every choice it offers by id.
  private static serve(runner: Runner, rows: Row[], out: Set<string>) {
    const view = Serve.of(runner.session, runner.last), engine = this.engine(rows);
    const offered = new Map(view.choices.map(c => [c.id, c.label]));
    for (const [act, e] of engine) {
      if (e.map) { continue; }
      if (!offered.has(act)) { out.add(`serve engine only: ${this.short(act)}`); continue; }
      if (offered.get(act) !== e.words && !e.alts?.has(offered.get(act)!)) {
        out.add(`serve words: ${this.short(act)}`);
        this.example(`serve words: ${this.short(act)}`, e.words, offered.get(act)!);
      }
    }
    for (const id of offered.keys()) { if (!engine.has(id)) { out.add(`serve only: ${this.short(id)}`); } }
    const led = new Set(Doable.flat(rows).filter(r => r.led).map(r => r.for ?? r.does ?? r.id));
    for (const a of view.led) {
      const act = a.for ?? a.command ?? a.choice;
      if (!led.has(act)) { out.add(`serve led: ${this.short(act)}`); }
    }
  }
  // The engine's words and the client's for each words divergence, the first met (bun scripts/offer-parity.ts --words).
  static readonly examples = new Map<string, [string, string]>();
  private static example(key: string, engine: string, client: string) {
    if (!this.examples.has(key)) { this.examples.set(key, [engine, client]); }
  }
  // An act by its schema, its arguments left out, so that one divergence is named once however many places.
  static short(id: string): string { return id.replace(/\(.*$/, '(…)'); }
}
