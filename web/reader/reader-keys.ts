import type { ReaderApp } from './reader-app';
import type { View } from './menu-model';

// The keyboard. In play, arrows move the highlight through what can be done now, Enter does it, a digit does one at
// once, Esc goes back; letters open the company, the pack, the journal and the map. Before play, arrows move between
// the page's choices and Enter takes the one in focus.
export class ReaderKeys {
  static readonly views: Record<string, View> = { e: 'here', c: 'company', i: 'pack', j: 'journal', m: 'map', h: 'story' };
  constructor(private readonly app: ReaderApp) {}
  readonly press = (e: KeyboardEvent) => {
    const target = e.target as HTMLElement | null;
    if (e.metaKey || e.ctrlKey || e.altKey) { return; }
    if (target?.closest('input, select, textarea')) {
      if (e.key === 'Escape') { target.blur(); }
      return;
    }
    const handled = this.app.state.phase === 'play' ? this.play(e.key) : this.page(e.key);
    if (handled) { e.preventDefault(); }
  };
  private play(key: string): boolean {
    const app = this.app, menu = app.menu, s = app.state;
    if (key === 'ArrowDown' || key === 'ArrowUp') {
      if (!menu.level.length) { return false; }
      const step = key === 'ArrowDown' ? 1 : -1;
      app.setState({ cursor: (s.cursor + step + menu.level.length) % menu.level.length, hovered: undefined });
      return true;
    }
    if (key === 'Enter' || key === ' ') {
      const chosen = menu.level[s.cursor];
      if (chosen) { app.choose(chosen); }
      return !!chosen;
    }
    if (/^[1-9]$/.test(key)) {
      const chosen = menu.level[Number(key) - 1];
      if (chosen) { app.setState({ cursor: Number(key) - 1 }); app.choose(chosen); }
      return !!chosen;
    }
    if (key === 'Escape' || key === 'Backspace') { app.back(); return true; }
    return this.letter(key.toLowerCase());
  }
  private letter(key: string): boolean {
    const app = this.app;
    if (key === 't' && app.state.frame?.combat) { app.auto(); return true; }
    if (ReaderKeys.views[key]) { app.show(ReaderKeys.views[key]); return true; }
    if (key === '?') { app.setState({ help: !app.state.help }); return true; }
    return false;
  }
  // Before play: the page's own buttons, in order.
  private page(key: string): boolean {
    const items = [...document.querySelectorAll<HTMLElement>('[data-nav]')];
    const at = items.indexOf(document.activeElement as HTMLElement);
    if (key === 'ArrowDown' || key === 'ArrowUp') {
      const next = items[(at + (key === 'ArrowDown' ? 1 : -1) + items.length) % items.length];
      next?.focus();
      return !!next;
    }
    if (/^[1-9]$/.test(key)) { items[Number(key) - 1]?.click(); return !!items[Number(key) - 1]; }
    if (key === 'Escape') {
      if (this.app.state.phase === 'campaigns') { this.app.opening.title(); return true; }
      if (this.app.state.phase === 'company') { this.app.setState({ phase: 'campaigns' }); return true; }
    }
    return false;
  }
}
