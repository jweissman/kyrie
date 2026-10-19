import { Html } from './html';
import type { LogEntry } from '../src/ui/screen-types';

// The bottom activity strip: one line per happening, newest last, so the eye reads it like a ship's log. Expanded,
// it shows a bounded history (the most recent 120 lines) and scrolls within itself; the page never scrolls.
export class MonoStrip {
  static readonly collapsed = 4;
  static readonly history = 120;
  static lines(log: LogEntry[]): { at: string; text: string; tone: string; head: boolean }[] {
    return log.flatMap(e => [{ at: e.at.split(' · ').at(-1)!.replace(/^Day \d+, /, ''), text: e.title, tone: e.tone, head: true },
      ...e.lines.map(text => ({ at: '', text, tone: e.tone, head: false }))]);
  }
  static render(log: LogEntry[], expanded: boolean): string {
    const all = this.lines(log);
    const shown = expanded ? all.slice(-this.history) : all.slice(-this.collapsed);
    const items = shown.map(l => `<li class="${l.head ? 'head' : 'line'} tone-${l.tone}"><time>${Html.escape(l.at)}</time><span>${Html.escape(l.text)}</span></li>`).join('');
    const count = all.length > shown.length ? `${all.length - shown.length} earlier` : '';
    return `<section class="strip${expanded ? ' expanded' : ''}" data-region="activity" aria-label="Recent activity" aria-live="polite">`
      + `<button type="button" class="strip-toggle" data-action="history" aria-expanded="${expanded}"><kbd>H</kbd>${expanded ? 'Close history' : `History${count ? ` · ${count}` : ''}`}</button>`
      + `<ol>${items || '<li class="line"><time></time><span>Nothing has happened yet.</span></li>'}</ol></section>`;
  }
}
