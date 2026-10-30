import type { Menu } from '../menu-model';
import type { ReaderApp } from '../reader-app';

// What a place keeps a deliberate touch away (OWN-18, OWN-19), each a sheet raised over its glance and put away again
// (Esc, the cross, or a touch beside it): Look about (the whole telling, everyone and everything here), Every way, and
// More (yourself, and what you can do of yourself). One is up at a time, kept with what is open (AppState.open), so
// that Esc puts away what was opened last.
export type Sheet = 'look' | 'ways' | 'more';
export class Raised {
  static readonly ids: Record<Sheet, string> = { look: 'sheet:look', ways: 'ways:all', more: 'sheet:more' };
  static up(app: ReaderApp): Sheet | undefined {
    return (Object.keys(this.ids) as Sheet[]).find(k => app.state.open.includes(this.ids[k]));
  }
  // A sheet raised (the one up put away first), or, with none, put away.
  static raise(app: ReaderApp, sheet?: Sheet) {
    const all = Object.values(this.ids), open = app.state.open.filter(id => !all.includes(id));
    app.setState({ open: sheet ? [...open, this.ids[sheet]] : open, hovered: undefined });
  }
  static toggle(app: ReaderApp, sheet: Sheet) { this.raise(app, this.up(app) === sheet ? undefined : sheet); }
  // Where a choice the keys come to is drawn: the sheet up, if it holds it; the glance, if it draws it; or the sheet
  // that holds it, raised (a choice the keys are on is always on show).
  static holding(menu: Menu, id: string, at: { up?: Sheet; glanced: string[] }): Sheet | undefined {
    const sheets = menu.sheets;
    if (!sheets) { return undefined; }
    if (at.up && sheets[at.up].includes(id)) { return at.up; }
    if (at.glanced.includes(id)) { return undefined; }
    return (Object.keys(sheets) as Sheet[]).find(k => sheets[k].includes(id));
  }
  // How many the glance leads with, as the menu has them first (see MenuModel.led) and the keys 1 to 3 do them at a
  // place: none while a sheet is raised over them; no limit where there is no glance (a road).
  static led(app: ReaderApp): number | undefined {
    const g = app.state.frame?.leaf.glance, menu = app.menu;
    if (!g || !menu.sheets) { return undefined; }
    return this.up(app) ? 0 : g.acts.filter(a => menu.choices.some(c => c.id === a.choice)).length;
  }
  // The choices the glance draws: what it leads with, and its quiet row of ways.
  static glanced(app: ReaderApp): string[] {
    const g = app.state.frame?.leaf.glance;
    return g ? [...g.acts.map(a => a.choice), ...g.ways] : [];
  }
  // The keys come to a choice: the sheet that holds it is raised, and any other put away.
  static follow(app: ReaderApp, cursor: number) {
    const id = app.menu.choices[cursor]?.id, up = this.up(app);
    if (!id || !app.menu.sheets) { return; }
    const sheet = this.holding(app.menu, id, { ...up ? { up } : {}, glanced: this.glanced(app) });
    if (sheet !== up) { this.raise(app, sheet); }
  }
}
