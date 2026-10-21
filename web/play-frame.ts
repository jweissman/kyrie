import { Html } from './html';
import { FictionalTime } from '../src/presentation/fictional-time';
import { PlayPage } from './play-page';
import { PlayRail } from './play-rail';
import { PlayViews } from './play-views';
import { PlayOpening } from './play-opening';
import type { Mode, PlayState } from './play-types';

// One frame for all of play: a status line (where, when), the page with the rail beside it, and the keys. What the
// page shows changes (the place, a fight, the company, the journal); the frame does not.
export class PlayFrame {
  static readonly tabs: [Mode, string, string][] = [['explore', 'E', 'Here'], ['party', 'C', 'Company'],
    ['pack', 'I', 'Pack'], ['journal', 'J', 'Journal'], ['map', 'M', 'Map']];
  static render(s: PlayState): string {
    const page = s.mode === 'combat' && s.combat ? PlayPage.combat(s) : s.mode === 'explore' ? PlayPage.explore(s)
      : PlayViews.render(s);
    return `<div class="frame play" data-mode="${s.mode}"${s.pending ? ' aria-busy="true"' : ''}>${this.status(s)}`
      + `<main class="play-grid">${page}${PlayRail.render(s)}</main>${this.keys(s)}${PlayOpening.toast(s.error)}</div>`;
  }
  private static status(s: PlayState): string {
    const screen = s.screen;
    const title = screen?.title.split(' — ')[0] ?? 'Kyr';
    const clock = screen ? `${Html.escape(screen.clock)}<i>${FictionalTime.part(screen.elapsed)}</i>` : '';
    const region = screen?.path.slice(0, -1).at(0)?.name ?? '';
    return `<header class="status"><b class="brand">${Html.escape(title)}</b><span class="where">${Html.escape(region)}</span>`
      + `<time data-id="clock">${clock}</time></header>`;
  }
  private static keys(s: PlayState): string {
    const hint = '<span class="hint"><kbd>↑↓</kbd> look <kbd>⏎</kbd> do <kbd>1–9</kbd> at once <kbd>Esc</kbd> back</span>';
    if (s.mode === 'combat') {
      return `<footer class="keys">${Html.button('Let them fight this turn on their own', 'auto', { key: 't' }, '<kbd>T</kbd> ')}${hint}</footer>`;
    }
    const tabs = this.tabs.map(([mode, key, label]) => Html.button(label, 'mode', { mode, key: key.toLowerCase(),
      class: s.mode === mode ? 'tab on' : 'tab' }, `<kbd>${key}</kbd> `)).join('');
    const history = Html.button(s.history ? 'Back to now' : 'History', 'history',
      { class: s.history ? 'tab on' : 'tab' }, '<kbd>H</kbd> ');
    return `<footer class="keys"><nav class="tabs" aria-label="Views">${tabs}${history}</nav>${hint}</footer>`;
  }
}
