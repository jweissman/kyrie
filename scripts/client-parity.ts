import type { Runner } from '../src/cli/runner';
import { Serve } from '../src/cli/serve';
import { Doable, type Row } from '../src/presentation/doable';
import type { Lens, Promoted, LensAct } from '../src/presentation/glance-types';
import type { Choice } from '../src/ui/choice-list';
import { ScreenModel } from '../src/ui/screen-model';
import { MenuModel } from '../web/reader/menu-model';
import { GlanceStage } from '../web/reader/stage/glance';
import { LensRows } from '../web/reader/stage/lens-rows';
import type { ReaderApp } from '../web/reader/reader-app';
import type { Frame } from '../web/engine/protocol';

// The other clients at the runner's turns (MT-18, after the runner's own: scripts/offer-parity.ts): what the page
// draws, built headlessly as the page builds it (its menu, MenuModel; the four, GlanceStage; each lens's rows,
// LensRows), and what `serve` answers (its view: the acts led, every choice by id), each read against the engine's one
// projection of the same turn (Doable), by the act each row does. Each divergence is named by its client and kind
// ("page engine only: …", "serve words: …"), into the one baseline. Not measured yet: the page's talk drawer (drawn
// only once a person is turned to) and the map's menu (CO-20).
interface Act { words: string; id: string; lens?: Lens; within?: string; map?: true }
interface Drawn { act: string; words: string; id: string; lens?: Lens; where: 'four' | 'lens' | 'menu' | 'pack' }
export class ClientParity {
  // The engine's acts by what each does, in its own words, with its lens and what it is held within.
  static engine(rows: Row[]): Map<string, Act> {
    const out = new Map<string, Act>();
    for (const r of Doable.flat(rows)) {
      const act = r.for ?? r.does;
      if (!act) { continue; }
      out.set(act, { words: r.called ?? r.label, id: r.id, ...r.lens ? { lens: r.lens } : {},
        ...r.within ? { within: r.within } : {}, ...r.map ? { map: r.map } : {} });
    }
    return out;
  }
  static turn(runner: Runner, out: Set<string>) {
    const leaf = runner.leaf, glance = leaf?.glance;
    if (!leaf || !glance) { return; }
    const frame = { title: '', screen: ScreenModel.build(runner.session.campaign), entries: [], leaf,
      opening: [], chronicle: [], transcript: { steps: [] } } as unknown as Frame;
    const rows = Doable.of(glance, frame.screen);
    this.page(frame, rows, out);
    this.serve(runner, rows, out);
  }
  // What the page draws: the four, every lens's rows, the menu's every choice (what the keys and automation reach).
  static drawn(frame: Frame): { drawn: Drawn[]; app: ReaderApp; four: Promoted[] } {
    const menu = MenuModel.build(frame, 'here', []);
    const app = { state: { frame, open: [], focused: [] }, menu, props: { query: new URLSearchParams() } } as unknown as
      ReaderApp;
    const glance = frame.leaf.glance!, four = GlanceStage.offered(app) ?? GlanceStage.foreground(app, glance.acts);
    const drawn: Drawn[] = four.map(a => ({ act: a.inside?.[0]?.command ?? a.command ?? a.choice, words: a.label,
      id: a.choice, where: 'four' as const }));
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
    return { drawn, app, four };
  }
  private static leaves(choices: Choice[]): Choice[] {
    return choices.flatMap(c => [...c.command ? [c] : [], ...this.leaves(c.children ?? [])]);
  }
  private static page(frame: Frame, rows: Row[], out: Set<string>) {
    const engine = this.engine(rows), { drawn, app, four } = this.drawn(frame);
    const acts = new Map<string, Drawn[]>();
    for (const d of drawn) { acts.set(d.act, [...acts.get(d.act) ?? [], d]); }
    const ids = new Set(drawn.map(d => d.id));
    for (const [act, e] of engine) {
      const at = acts.get(act);
      if (!at) {
        const held = e.within && (ids.has(e.within) || acts.has(engine.get(e.within)?.id ?? e.within));
        if (!held && !e.map) { out.add(`page engine only: ${this.short(act)}`); }
        continue;
      }
      if (at.some(d => d.where !== 'menu' && d.words !== e.words)) { out.add(`page words: ${this.short(act)}`); }
      if (at.every(d => ['menu', 'pack'].includes(d.where)) && at.some(d => d.words !== e.words)) {
        out.add(`page menu words: ${this.short(act)}`);
      }
      if (e.lens && at.some(d => d.lens && d.lens !== e.lens)) { out.add(`page lens: ${this.short(act)}`); }
      if (e.map && at.some(d => ['four', 'lens'].includes(d.where))) { out.add(`page unfolded: ${this.short(act)}`); }
    }
    for (const [act, at] of acts) {
      if (!engine.has(act)) { out.add(`page only: ${at[0]!.where} ${this.short(act)}`); }
    }
    // What pressing one of the four does: as the engine's row for it does (Doable.one), never the page's own fold.
    const glance = frame.leaf.glance!;
    for (const a of four) {
      const c = MenuModel.lead(app.menu, a.choice);
      const pressed = c ? GlanceStage.acted(app, a, c).command ?? a.choice : a.command ?? a.choice;
      const does = Doable.one(glance, frame.screen, a.choice, a.command).does;
      if (does && pressed !== does && a.inside?.[0]?.command !== does) { out.add(`page pressed: ${this.short(a.choice)}`); }
    }
  }
  // What `serve` answers at the same turn (Serve.of): the acts it leads with, and every choice it offers by id.
  private static serve(runner: Runner, rows: Row[], out: Set<string>) {
    const view = Serve.of(runner.session), engine = this.engine(rows);
    const offered = new Map(view.choices.map(c => [c.id, c.label]));
    for (const [act, e] of engine) {
      if (e.map) { continue; }
      if (!offered.has(act)) { out.add(`serve engine only: ${this.short(act)}`); continue; }
      if (offered.get(act) !== e.words) { out.add(`serve words: ${this.short(act)}`); }
    }
    for (const id of offered.keys()) { if (!engine.has(id)) { out.add(`serve only: ${this.short(id)}`); } }
    const led = new Set(Doable.flat(rows).filter(r => r.led).map(r => r.for ?? r.does ?? r.id));
    for (const a of view.led) {
      const act = a.for ?? a.command ?? a.choice;
      if (!led.has(act)) { out.add(`serve led: ${this.short(act)}`); }
    }
  }
  // An act by its schema, its arguments left out, so that one divergence is named once however many places.
  static short(id: string): string { return id.replace(/\(.*$/, '(…)'); }
}
