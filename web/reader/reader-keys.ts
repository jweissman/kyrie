import type { ReaderApp } from './reader-app';
import type { View } from './menu-model';
import { Stage } from './stage/stage';
import { PrologueStage } from './stage/prologue-stage';
import { Raised, type Sheet } from './stage/raised';
import { GlanceStage } from './stage/glance';
import { Explorer, type Part } from './stage/explorer';

// The keyboard. In play, arrows move the highlight through what can be done now (raising the sheet a choice is on, at
// a place: see Raised), Enter does it, a digit does one at once (at a place, 1 to 3 what the glance leads with), Esc
// goes back; letters open the company, the pack, the journal and the map, and at a place what is all about (L) and
// every way from it (W). Over the map, the arrows, Enter,
// Space and the digits are the map's own. Before play, arrows move between the page's choices and Enter takes the
// one in focus.
export class ReaderKeys {
  static readonly views: Record<string, View> = { e: 'here', c: 'company', i: 'pack', j: 'journal', m: 'map', h: 'story' };
  static readonly sheets: Record<string, Sheet> = { l: 'look', w: 'ways' };
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
      if (Stage.mode(app) === 'explore') { Raised.follow(app, cursor); }
      return true;
    }
    if (key === 'Enter' || key === ' ') {
      // Nothing is shown chosen yet: Enter shows where the keys are, and does nothing unseen.
      if (!s.keyed && menu.choices.length) {
        app.setState({ cursor: Math.max(0, GlanceStage.top(app)), keyed: true });
        return true;
      }
      const chosen = menu.choices[s.cursor];
      if (chosen) { app.choose(chosen); }
      return !!chosen;
    }
    if (/^[1-9]$/.test(key)) {
      // What is drawn with that key on it, first: the glance numbers what it leads with by their places among
      // themselves, and at a place at rest only what will not wait is led with (the second fresh playtest of 7
      // November: "2" by "light a torch" in a dark cellar did nothing, the keys reading the menu's order).
      const drawn = ReaderKeys.keyed(Number(key)), shown = drawn ? menu.choices.findIndex(c => c.id === drawn) : -1;
      if (shown >= 0) { app.setState({ cursor: shown }); app.choose(menu.choices[shown]!); return true; }
      // At a place, what the glance leads with (1 to 3), never something under a sheet and out of sight.
      const led = Stage.mode(app) === 'explore' ? Raised.led(app) : undefined;
      if (led !== undefined && Number(key) > led) { return false; }
      const chosen = menu.choices[Number(key) - 1];
      if (chosen) { app.setState({ cursor: Number(key) - 1 }); app.choose(chosen); }
      return !!chosen;
    }
    if (key === 'Escape' || key === 'Backspace') { app.back(); return true; }
    return this.letter(key.toLowerCase());
  }
  // The choice drawn with this number on its key, where the glance leads with it (none under a raised sheet).
  private static keyed(n: number): string | undefined {
    if (document.querySelector('[aria-modal="true"]')) { return undefined; }
    return document.querySelector<HTMLElement>(`ol.led > li[data-promoted="${n}"] [data-choice]`)?.dataset.choice;
  }
  // A new game's opening: Enter, Space or an arrow on brings the next beat (and after the last, the place), once it
  // has been shown a moment (see PrologueStage.next), and never by a key held down; a digit answers whoever is met on
  // the road; Esc goes straight on. Nothing reaches the place's choices under it, unseen.
  private prologue(key: string, held: boolean): boolean { return PrologueStage.key(this.app, key, held); }
  private letter(key: string): boolean {
    const app = this.app;
    if (key === 't' && app.state.frame?.combat) { app.auto(); return true; }
    if (ReaderKeys.views[key]) { app.show(ReaderKeys.views[key]); return true; }
    const part = ReaderKeys.parts[key];
    if (part && app.state.frame?.leaf.glance && !app.state.outdoors && Stage.mode(app) === 'explore') {
      app.explore(app.state.exploring === part ? undefined : part);
      return true;
    }
    const sheet = ReaderKeys.sheets[key];
    if (sheet && app.state.frame && Stage.mode(app) === 'explore') {
      Raised.toggle(app, sheet);
      return true;
    }
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
    if (/^[1-9]$/.test(key)) { items[Number(key) - 1]?.click(); return !!items[Number(key) - 1]; }
    if (key === 'Escape') {
      if (sheet) { sheet.querySelector<HTMLElement>('[data-action="close"]')?.click(); return true; }
      if (this.app.state.phase === 'campaigns') { this.app.opening.title(); return true; }
      // Back from making a life is to the title; only development (?dev) has the list of campaigns behind it.
      if (this.app.state.phase === 'company') {
        if (this.app.props.query.has('dev')) { this.app.setState({ phase: 'campaigns' }); } else { this.app.opening.title(); }
        return true;
      }
    }
    return false;
  }
}
