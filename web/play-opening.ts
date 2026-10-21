import { Html } from './html';

export interface CampaignCard { id: string; title: string; note: string; detail: string; recommended?: boolean }
export interface Opening {
  saved?: { title: string; where: string; when: string; company: string };
  campaigns: CampaignCard[]; cursor: number;
}

// Before play: the title, with a saved game first if there is one, and the choice of where to go.
export class PlayOpening {
  static title(o: Opening, error: string): string {
    const entries = [
      ...(o.saved ? [{ action: 'continue', label: `Continue: ${o.saved.title}`,
        note: `${o.saved.where} · ${o.saved.when} · ${o.saved.company}` }] : []),
      { action: 'campaigns', label: 'Begin a new campaign', note: 'Choose where, then who goes.' },
      { action: 'load-file', label: 'Load a saved game', note: 'A file downloaded from the journal.' },
    ];
    const menu = entries.map((e, i) => `<li><button type="button" class="choice${i === o.cursor ? ' sel' : ''}" `
      + `data-action="${e.action}" data-index="${i}"><kbd class="n">${i + 1}</kbd><span class="l">${Html.escape(e.label)}</span>`
      + `<span class="note">${Html.escape(e.note)}</span></button></li>`).join('');
    return `<div class="frame opening" data-mode="title"><main class="title-page"><h1 class="mark">Kyr</h1>`
      + '<p class="tagline">Three companions, a world that keeps going without them, and the road out of town.</p>'
      + `<ol class="menu" role="list">${menu}</ol><input type="file" id="load" accept="application/json" hidden>`
      + '<p class="books"><a href="handbook/index.html">The handbooks</a>: every ancestry, calling, spell and creature, '
      + 'and how far the game plays each.</p></main>'
      + `${this.toast(error)}</div>`;
  }
  static campaigns(o: Opening): string {
    const cards = o.campaigns.map((c, i) => `<li><button type="button" class="card${i === o.cursor ? ' sel' : ''}" `
      + `data-action="campaign" data-id="${Html.escape(c.id)}" data-index="${i}"><kbd class="n">${i + 1}</kbd>`
      + `<b class="l">${Html.escape(c.title)}${c.recommended ? ' <em>start here</em>' : ''}</b>`
      + `<span class="blurb">${Html.escape(c.note)}</span><span class="meta">${Html.escape(c.detail)}</span></button></li>`).join('');
    return `<div class="frame opening" data-mode="campaigns"><header class="status"><b class="brand">Kyr</b>`
      + '<span class="where">Where will the company go?</span><time></time></header>'
      + `<main class="campaign-page"><ol class="cards" role="list">${cards}</ol></main>`
      + '<footer class="keys"><span class="hint"><kbd>↑↓</kbd> look <kbd>⏎</kbd> choose <kbd>Esc</kbd> back</span></footer></div>';
  }
  static toast(error: string): string {
    return error ? `<div class="toast" role="alert" data-id="error">${Html.escape(error)}</div>` : '';
  }
}
