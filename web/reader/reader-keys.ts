import type { ReaderApp } from './reader-app';
import type { View } from '../../src/frame/menu-model';
import { Stage } from './stage/stage';
import { PrologueStage } from './stage/prologue-stage';
import { Raised } from './stage/raised';
import { GlanceStage } from './stage/glance';
import { Explorer, type Part } from './stage/explorer';
import { CompassStage } from './stage/compass-stage';
import { Folded } from './stage/folded-rail';
import { SceneRail } from './stage/scene-rail';
import { Act } from './stage/act';
import { PressGuard } from './press-guard';
import { DigitSettle } from './digit-settle';
import type { Choice } from '../../src/ui/choice-list';
import { Surfaces } from '../../src/presentation/surfaces';

// The keyboard. In play, arrows move the highlight through what can be done now (raising the sheet a choice is on, at
// a place: see Raised), Enter does it, a digit does one at once (at a place, 1 to 3 what the glance leads with), Esc
// goes back; letters open the company, the pack, the journal and the map, and at a place what is all about (L) and
// every way from it (W). Over the map, the arrows, Enter,
// Space and the digits are the map's own. Before play, arrows move between the page's choices and Enter takes the
// one in focus.
export class ReaderKeys {
  static readonly views: Record<string, View> = { e: 'here', c: 'company', i: 'company', j: 'journal', m: 'map', h: 'story' };
  // At a place at rest: Go… (G, or W for the ways), Look… (L), Wait… (Z, a while).
  static readonly parts: Record<string, Part> = { g: 'go', w: 'go', l: 'look', z: 'wait' };
  constructor(private readonly app: ReaderApp) {}
  readonly press = (e: KeyboardEvent) => {
    const target = e.target as HTMLElement | null;
    if (e.metaKey || e.ctrlKey || e.altKey) { return; }
    if (target?.closest('input, select, textarea')) {
      if (e.key === 'Escape') { target.blur(); }
      return;
    }
    // A key held down does its act once (IG-17): its repeats are dropped, the browser's click on a focused button too.
    if (PressGuard.repeated(e)) { e.preventDefault(); return; }
    // A choice committed (a hold done, a press taken) closes the page to every other input until its answer comes
    // (OR-145, the owner's playtest of 20 November): no key does anything meanwhile.
    if (this.app.state.phase === 'play' && this.app.state.pending) { e.preventDefault(); return; }
    // Enter or Space on a focused act is that act, at once (IG-07: one press commits), where the arrows are not
    // driving the page's own highlight.
    if ((e.key === 'Enter' || e.key === ' ') && !this.app.state.keyed
      && target?.closest('button[data-act], button[data-choice]')) { return; }
    const handled = this.app.state.phase !== 'play' ? this.page(e.key)
      : Stage.prologue(this.app) ? this.prologue(e.key, e.repeat) : this.play(e.key);
    if (handled) { e.preventDefault(); }
  };
  private play(key: string): boolean {
    const app = this.app, menu = app.menu, s = app.state;
    // The map open over the page: its buttons pressed and its land moved over by these keys, not the place's choices
    // hidden under it done unseen. Esc still closes it, and the letters open the books.
    if (Stage.mapped(app) && /^(ArrowUp|ArrowDown|Enter| |[1-9])$/.test(key)) { return false; }
    // What is opened over a place at rest has the keys while it is up (see Explorer).
    if (s.exploring && Stage.mode(app) === 'explore' && Explorer.key(app, key)) { return true; }
    // The backstage's tabs, one navigation instrument (OR-306): left and right go to the page before and after, round
    // again at the ends, on every page of the Book alike.
    const pages = Act.pages(app);
    if ((key === 'ArrowLeft' || key === 'ArrowRight') && pages.includes(s.view)) {
      const at = pages.indexOf(s.view), n = pages.length;
      app.show(pages[(at + (key === 'ArrowRight' ? 1 : -1) + n) % n]!);
      return true;
    }
    if (key === 'ArrowDown' || key === 'ArrowUp') {
      if (!menu.choices.length) { return false; }
      // At a place at rest, only what is drawn there: who is here, what will not wait, searching.
      const resting = Stage.mode(app) === 'explore' && !s.outdoors && s.frame?.leaf.glance ? GlanceStage.atRest(app) : undefined;
      const among = menu.choices.map((c, i) => ({ c, i })).filter(x => !resting || resting.has(x.c.id)).map(x => x.i);
      if (!among.length) { return false; }
      // The first press shows where the keys are, on what the page marks first (or the last, going up), rather than
      // passing over one the player never saw it on.
      const n = among.length, step = key === 'ArrowDown' ? 1 : -1, at = among.indexOf(s.cursor);
      const top = among.indexOf(GlanceStage.top(app));
      const cursor = among[s.keyed && at >= 0 ? (at + step + n) % n : step > 0 ? Math.max(0, top) : n - 1]!;
      app.setState({ cursor, hovered: undefined, keyed: true });
      return true;
    }
    if (key === 'Enter' || key === ' ') {
      // Nothing is shown chosen yet: Enter shows where the keys are, and does nothing unseen.
      if (!s.keyed && menu.choices.length) {
        app.setState({ cursor: Math.max(0, GlanceStage.top(app)), keyed: true });
        return true;
      }
      const chosen = menu.choices[s.cursor];
      if (chosen && ReaderKeys.opener(chosen.id)) { ReaderKeys.opener(chosen.id)!.click(); return true; }
      return chosen ? this.commit(chosen) : false;
    }
    if (/^[1-9]$/.test(key) && Stage.mode(app) === 'talk') {
      // In a conversation, the reply that number is beside as the rows stand when the key goes down, and only once
      // they have stood a moment (R11-01: see DigitSettle); refused, not passed on, while they are changing.
      if (!DigitSettle.settled(DigitSettle.drawn())) { return true; }
      const id = document.querySelector<HTMLElement>(`.talk [data-number="${key}"]`)?.dataset.choice;
      const at = id ? menu.choices.findIndex(c => c.id === id) : -1;
      if (at < 0) { return false; }
      app.setState({ cursor: at });
      return this.commit(menu.choices[at]!);
    }
    if (/^[1-9]$/.test(key)) {
      // What is drawn with that key on it, first: the glance numbers what it leads with by their places among
      // themselves, and at a place at rest only what will not wait is led with (the second fresh playtest of 7
      // November: "2" by "light a torch" in a dark cellar did nothing, the keys reading the menu's order).
      const drawn = ReaderKeys.keyed(Number(key)), shown = drawn ? menu.choices.findIndex(c => c.id === drawn) : -1;
      // One of the four the engine offers that the menu has no choice for (talking to someone here): its own row.
      if (drawn && shown < 0) {
        const row = document.querySelector<HTMLElement>(`ol.led > li:nth-child(${key}) [data-choice]`);
        if (row) { row.click(); return true; }
      }
      if (drawn && ReaderKeys.opener(drawn)) { ReaderKeys.opener(drawn)!.click(); return true; }
      if (shown >= 0) { app.setState({ cursor: shown }); return this.commit(menu.choices[shown]!); }
      // At a place, what the glance leads with (1 to 3), never something under a sheet and out of sight.
      const led = Stage.mode(app) === 'explore' ? Raised.led(app) : undefined;
      if (led !== undefined && Number(key) > led) { return false; }
      const chosen = menu.choices[Number(key) - 1];
      if (chosen) { app.setState({ cursor: Number(key) - 1 }); this.commit(chosen); }
      return !!chosen;
    }
    if (key === 'Escape' || key === 'Backspace') { app.back(); return true; }
    return this.letter(key.toLowerCase());
  }
  // A choice the keys take, by the one path a row is taken by (OR-128): its own button pressed, which does what a tap
  // on it does (nothing is held: OR-185); only a choice drawn by no button of its own is chosen directly.
  private commit(c: Choice): boolean {
    const row = document.querySelector<HTMLElement>(`[data-choice="${CSS.escape(c.id)}"]`), keyed = this.app.state.keyed;
    if (!row) { this.app.choose(c); return true; }
    // As a tap on it, which lets the keys' highlight go: the keys keep it.
    row.click();
    if (keyed) { this.app.setState({ keyed: true }); }
    return true;
  }
  // An act the four draw as an opener in place (a thing's look: see GlanceStage.Acts), which the keys open there as a
  // touch does, never turning the page to the thing.
  private static opener(id: string): HTMLElement | null {
    return document.querySelector<HTMLElement>(`ol.led [data-act="${CSS.escape(id)}"][aria-expanded]`);
  }
  // The choice drawn with this number on its key, where the glance leads with it, or on a page of the place's rows
  // after its four, Something else… among them (OR-1490); none under a raised sheet.
  private static keyed(n: number): string | undefined {
    if (document.querySelector('[aria-modal="true"]')) { return undefined; }
    return document.querySelector<HTMLElement>(`ol.led > li:nth-child(${n}) [data-choice]`)?.dataset.choice;
  }
  // A new game's opening: Enter, Space or an arrow on brings the next beat (and after the last, the place), once it
  // has been shown a moment (see PrologueStage.next), and never by a key held down; a digit answers whoever is met on
  // the road; Esc goes straight on. Nothing reaches the place's choices under it, unseen.
  private prologue(key: string, held: boolean): boolean { return PrologueStage.key(this.app, key, held); }
  private letter(key: string): boolean {
    const app = this.app;
    if (key === 't' && app.state.frame?.combat) { app.auto(); return true; }
    // Inside an enclosed place, M is the compass, as its mark is (see SceneRail.Books).
    // Nothing, where no way on is open (its mark shut: OR-211), never an empty lens.
    if (key === 'm' && CompassStage.of(app) && Stage.mode(app) === 'explore') {
      if (!Surfaces.has(app.state.frame?.screen, 'lens_go')) { return true; }
      if (!SceneRail.noWayOn(app)) { Explorer.open(app, app.state.exploring === 'go' ? undefined : 'go'); }
      return true;
    }
    if (ReaderKeys.views[key]) { app.show(ReaderKeys.views[key]); return true; }
    // A lens by its key only where it is earned (Surfaces, OR-1241), as its mark is drawn.
    const part = ReaderKeys.parts[key], rail = app.state.frame?.leaf.glance?.rail;
    if (part && Surfaces.lens(rail, part) && app.state.frame?.leaf.glance && !app.state.outdoors
      && Stage.mode(app) === 'explore') {
      app.explore(app.state.exploring === part ? undefined : part);
      return true;
    }
    // F: the folded lenses taken up, or folded again (Folded, OR-1084).
    if (key === 'f' && !!rail?.lenses.length && !app.state.outdoors
      && Stage.mode(app) === 'explore') { Folded.toggle(app); return true; }
    if (key === '?') { app.setState({ help: !app.state.help }); return true; }
    return false;
  }
  // Before play: the page's own buttons, in order; or, while a sheet is open over the page, the sheet's, and Escape
  // puts it away. Creation's cards stand in rows, so there the arrows across go along them too.
  private page(key: string): boolean {
    const sheet = document.querySelector<HTMLElement>('[aria-modal="true"]');
    const items = [...(sheet ?? document).querySelectorAll<HTMLElement>('[data-nav]')];
    const at = items.indexOf(document.activeElement as HTMLElement);
    const across = this.app.state.phase === 'company' && (key === 'ArrowRight' || key === 'ArrowLeft');
    if (key === 'ArrowDown' || key === 'ArrowUp' || across) {
      const next = items[(at + (key === 'ArrowDown' || key === 'ArrowRight' ? 1 : -1) + items.length) % items.length];
      next?.focus();
      return !!next;
    }
    if (/^[1-9]$/.test(key)) {
      const item = items[Number(key) - 1];
      item?.click();
      return !!item;
    }
    if (key === 'Escape') {
      if (sheet) { sheet.querySelector<HTMLElement>('[data-action="close"]')?.click(); return true; }
      // Back from how a new game begins, or from the campaigns, is to the title.
      if (['campaigns', 'begin', 'closed'].includes(this.app.state.phase)) {
        this.app.opening.title(); return true;
      }
      // Back from making a life is to the title; only development (?dev) has the list of campaigns behind it.
      if (this.app.state.phase === 'company') {
        if (this.app.props.query.has('dev')) { this.app.setState({ phase: 'campaigns' }); } else { this.app.opening.title(); }
        return true;
      }
    }
    return false;
  }
}
