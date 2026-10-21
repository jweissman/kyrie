import { Html } from './html';
import type { Choice, Section } from '../src/ui/choice-list';
import type { PlayState } from './play-types';

// What can be done now, grouped by what it is about: a person, a thing, the ways on, the company. Each choice is a
// numbered line that does what it says, or opens a short list (marked ›); the highlighted one is explained below the
// list. Wide screens set the groups side by side; a phone stacks them.
export class PlayMenu {
  static render(s: PlayState, title: string): string {
    const counter = { n: 0 };
    const body = s.trail.length ? this.opened(s, counter) : s.sections.map(sec => this.group(sec, s, counter)).join('');
    const chosen = s.level[s.cursor];
    const detail = chosen ? chosen.disabled ?? chosen.about ?? '' : '';
    return `<section class="choices menu${s.pending ? ' busy' : ''}" data-region="choices" aria-label="${Html.escape(title)}">`
      + `<h2 class="menu-title">${Html.escape(title)}</h2>`
      + `<div class="groups${s.trail.length ? ' opened' : ''}">${body || '<p class="none">Nothing to do here.</p>'}</div>`
      + `<p class="detail" data-id="detail">${Html.escape(detail)}</p></section>`;
  }
  // A list a choice opened: the way back, then its choices.
  private static opened(s: PlayState, counter: { n: number }): string {
    const crumbs = s.trail.map(c => Html.escape(c.label)).join(' <i>›</i> ');
    return `<div class="group open"><p class="crumbs"><kbd>Esc</kbd> back · ${crumbs}</p>`
      + `<ol role="list">${s.level.map(c => this.choice(c, s.cursor, counter)).join('')}</ol></div>`;
  }
  private static group(sec: Section, s: PlayState, counter: { n: number }): string {
    const about = sec.about && sec.tone !== 'way' ? `<p class="about${sec.fresh ? ' new' : ''}">${Html.escape(sec.about)}</p>` : '';
    const choices = sec.choices.length ? sec.choices.map(c => this.choice(c, s.cursor, counter)).join('')
      : '<li class="none">Nothing to do with them now.</li>';
    return `<div class="group tone-${sec.tone}" data-section="${Html.escape(sec.id)}">`
      + `<h3><span class="g" aria-hidden="true">${sec.glyph}</span><b>${Html.escape(sec.title)}</b>`
      + `${sec.note ? `<span class="note">${Html.escape(sec.note)}</span>` : ''}</h3>${about}<ol role="list">${choices}</ol></div>`;
  }
  // One choice: its key (the first nine have a digit), what it does, and a note (time, who, cost, a risk).
  static choice(c: Choice, cursor: number, counter: { n: number }): string {
    const i = counter.n++, sel = i === cursor, digit = i < 9 ? String(i + 1) : '';
    const note = c.disabled ? c.note ?? '' : c.note ?? '';
    const classes = ['choice', `tone-${c.tone}`, sel ? 'sel' : '', c.risk ? 'risk' : '', c.disabled ? 'disabled' : '',
      c.children ? 'opens' : ''].filter(Boolean).join(' ');
    return `<li><button type="button" class="${classes}" data-action="choice" data-choice="${Html.escape(c.id)}" data-index="${i}"`
      + `${c.command ? ` data-command="${Html.escape(c.command)}"` : ''} aria-current="${sel}"${c.disabled ? ' aria-disabled="true"' : ''}>`
      + `<kbd class="n">${digit}</kbd><span class="l">${Html.escape(c.label)}</span>`
      + `<span class="note">${Html.escape(note)}${c.risk ? '<b class="risk-mark" title="risky">!</b>' : ''}</span>`
      + `${c.children ? '<span class="more" aria-hidden="true">›</span>' : ''}</button></li>`;
  }
}
