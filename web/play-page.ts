import { Html } from './html';
import { PlayMenu } from './play-menu';
import { PlayTranscript } from './play-transcript';
import type { Entry, PlayState } from './play-types';
import type { Screen } from '../src/ui/screen-types';

// The page: where the company is, what the place is like now, and what has happened here since it arrived, told
// top to bottom like a story, with what can be done next at the foot. A fight is told on the same page.
export class PlayPage {
  static explore(s: PlayState): string {
    const screen = s.screen!;
    if (!screen.running) { return this.fallen(); }
    const entries = s.history ? s.log : PlayTranscript.here(s.log, screen.place.id);
    return `<section class="page explore" data-region="page">${this.head(screen)}`
      + `<div class="transcript" data-region="transcript">${s.history ? this.history(entries) : this.now(screen)}`
      + `${s.history ? '' : entries.map((e, i) => this.entry(this.unsaid(e, screen), i === entries.length - 1)).join('')}`
      + `${this.doing(s)}</div>${PlayMenu.render(s, s.history ? 'History · H to close' : 'What now?')}</section>`;
  }
  static head(screen: Screen): string {
    const where = screen.path.slice(0, -1).reverse().slice(0, 2).map(p => Html.escape(p.name)).join(' · ');
    const name = screen.place.name.charAt(0).toUpperCase() + screen.place.name.slice(1);
    return `<header class="scene-head"><h1 data-id="place">${Html.escape(name)}</h1>`
      + `<p class="where">${where}${screen.dark ? ' · <b class="dark">no light</b>' : ''}</p></header>`;
  }
  // What the place is like now. What has changed at a place the company has been before is marked as news.
  private static now(screen: Screen): string {
    return `<div class="now prose">${screen.prose.map(p => screen.fresh.includes(p)
      ? `<p class="new"><b class="tag">new</b> ${Html.escape(p)}</p>` : `<p>${Html.escape(p)}</p>`).join('')}</div>`;
  }
  // What the place's description says now is said there; an entry does not tell it again.
  private static unsaid(e: Entry, screen: Screen): Entry {
    return { ...e, lines: e.lines.filter(l => !screen.prose.includes(l)) };
  }
  static entry(e: Entry, latest: boolean): string {
    const said = e.said ? `<p class="said"><span aria-hidden="true">›</span> ${Html.escape(e.said)}</p>` : '';
    const told = e.lines.length ? `<div class="told prose"${latest ? ' data-id="response"' : ''}>`
      + `${e.lines.map(l => `<p>${Html.escape(l)}</p>`).join('')}</div>` : '';
    const notes = e.notes.length ? `<p class="notes">${e.notes.map(n => `<span>${Html.escape(n)}</span>`).join('')}</p>` : '';
    if (!said && !told && !notes) { return ''; }
    return `<article class="entry tone-${e.tone}${latest ? ' latest' : ''}"><time>${Html.escape(e.at)}</time>${said}${told}${notes}</article>`;
  }
  // Everything so far, chapter by chapter: each place the company came to, and what happened there.
  private static history(log: Entry[]): string {
    if (!log.length) { return '<p class="none">Nothing has happened yet.</p>'; }
    let place = '';
    return log.map((e, i) => {
      const chapter = e.place !== place ? `<h2 class="chapter">${Html.escape(e.placeName)}</h2>` : '';
      place = e.place;
      return chapter + this.entry(e, i === log.length - 1);
    }).join('');
  }
  // While a command is carried out, what the company is doing.
  private static doing(s: PlayState): string {
    if (!s.pending || !s.doing) { return ''; }
    return `<article class="entry pending" aria-live="polite"><p class="said"><span aria-hidden="true">›</span> ${Html.escape(s.doing)}</p>`
      + '<p class="working"><span></span><span></span><span></span></p></article>';
  }
  private static fallen(): string {
    return '<section class="page fallen" data-region="page"><header class="scene-head"><h1>The company has fallen</h1></header>'
      + '<div class="transcript"><div class="now prose"><p>No one is left standing. The story so far is kept; '
      + 'a new company can set out from the beginning.</p></div></div>'
      + `<section class="choices menu"><div class="groups">${Html.button('Begin again', 'new', { class: 'primary' })}</div>`
      + '<p class="detail" data-id="detail"></p></section></section>';
  }
  // A fight, on the same page: how it began, each exchange as it happened, and the acting companion's choices.
  static combat(s: PlayState): string {
    const c = s.combat!, place = s.screen?.place.name ?? 'here';
    const begun = s.opening.length ? 'Set upon' : 'A fight';
    const turn = c.outcome ? 'The fight is over' : c.ours ? `${c.actorName}’s turn` : `${c.actorName} acts`;
    const opening = s.opening.length ? `<div class="now prose">${s.opening.map(l => `<p>${Html.escape(l)}</p>`).join('')}</div>` : '';
    // The order of the round is in the heading; the exchanges are what was done.
    const exchanges = c.exchanges.map(g => g.filter(l => !l.startsWith('The order:'))).filter(g => g.length);
    const blows = exchanges.map((g, i) => `<article class="entry tone-fight${i === exchanges.length - 1 ? ' latest' : ''}">`
      + `<div class="told prose">${g.map(l => `<p>${Html.escape(l)}</p>`).join('')}</div></article>`).join('');
    const waiting = !c.ours && !c.outcome ? `<p class="working" aria-live="polite">${Html.escape(c.actorName)} acts`
      + '<span></span><span></span><span></span></p>' : '';
    return `<section class="page fight" data-region="page"><header class="scene-head"><h1>${begun} at ${Html.escape(place)}</h1>`
      + `<p class="where">${Html.escape(s.screen?.clock ?? '')}${c.order.length > 1 && !c.outcome
        ? ` · after ${Html.escape(c.order[0]!)}: ${c.order.slice(1).map(n => Html.escape(n)).join(', ')}` : ''}</p></header>`
      + `<div class="transcript" data-region="battle-log" aria-live="polite">${opening}${blows}${waiting}</div>`
      + `${PlayMenu.render(s, turn)}</section>`;
  }
}
