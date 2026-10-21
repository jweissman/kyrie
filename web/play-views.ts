import { Html } from './html';
import { PlayMap } from './play-map';
import { PlayMenu } from './play-menu';
import { PlayRail } from './play-rail';
import { Advancement } from '../src/rules/advancement';
import type { PlayState } from './play-types';
import type { MemberRow, Screen } from '../src/ui/screen-types';

// The company, the pack, the journal and the full map: views of the same game, drawn on the page with the rail still
// beside them. Esc (or E) goes back to the place.
export class PlayViews {
  static render(s: PlayState): string {
    const body = s.mode === 'party' ? this.company(s) : s.mode === 'pack' ? this.pack(s) : s.mode === 'journal'
      ? this.journal(s) : this.atlas(s.screen!);
    return `<section class="page view view-${s.mode}" data-region="page">${body}</section>`;
  }
  private static company(s: PlayState): string {
    const screen = s.screen!, chosen = s.trail[0] ?? s.level[s.cursor];
    const m = screen.party.find(p => p.id === chosen?.id) ?? screen.party[0];
    return `<div class="split">${PlayMenu.render(s, 'The company')}${m ? this.sheet(m, screen) : ''}</div>`;
  }
  private static sheet(m: MemberRow, screen: Screen): string {
    const next = Advancement.threshold(m.level + 1);
    const progress = next <= m.experience ? `ready for level ${m.level + 1}: a night under a roof`
      : `${m.experience} of ${next} experience to level ${m.level + 1}`;
    const attrs = Object.entries(m.attributes).map(([k, v]) => `<span><abbr title="${k}">${k.slice(0, 3)}</abbr><b>${v}</b></span>`).join('');
    const abilities = m.abilities.map(a => `<li><b>${Html.escape(a.name)}</b>${a.price ? ` <small>${Html.escape(a.price)}</small>` : ''}`
      + `<p>${Html.escape(a.text)}</p></li>`).join('');
    const gear = screen.items.filter(i => i.owner === m.id)
      .map(i => `<li class="${i.equipped ? 'on' : ''}">${i.equipped ? '◉' : '○'} ${Html.escape(i.name)}</li>`).join('');
    const origins = (m.overlays ?? []).map(o => `<li><b>${Html.escape(o.name)}</b> <small>${Html.escape(o.role)}</small>`
      + `<p>${o.grants.map(g => Html.escape(g)).join(' · ')}</p></li>`).join('');
    const together = screen.formations.map(f => `<li><b>${Html.escape(f.name)}</b>${f.perks.map(p => `<p>${Html.escape(p)}</p>`).join('')}</li>`).join('');
    return `<article class="sheet" data-region="sheet"><header><h1>${Html.escape(m.name)}</h1>`
      + `<p class="where">${Html.escape(m.line)} · level ${m.level}${m.background ? ` · ${Html.escape(m.background)}` : ''}</p>`
      + `<p class="where">${progress} · ${m.gold} coin</p></header>`
      + `${PlayRail.bar(m.hp, m.maxHp)}${PlayRail.slots(m)}<p class="attrs">${attrs}</p>${this.prepared(m)}`
      + `<div class="columns"><section><h3>Can do</h3><ul class="abilities">${abilities}</ul></section><section>`
      + `<h3>Carries</h3><ul>${gear || '<li class="none">Nothing</li>'}</ul>`
      + `<h3>Where they come from</h3><ul class="origins">${origins || '<li class="none">Nothing recorded</li>'}</ul>`
      + `${together ? `<h3>Together</h3><ul class="origins">${together}</ul>` : ''}`
      + `<h3>The company can</h3><ul>${screen.capabilities.map(c => `<li>${Html.escape(c)}</li>`).join('')
        || '<li class="none">Nothing special</li>'}</ul></section></div></article>`;
  }
  // A caster's spells for today: ● ready to cast, ○ spent until the next rest.
  private static prepared(m: MemberRow): string {
    if (!m.spells?.length) { return ''; }
    const levels = [...new Set(m.spells.map(x => x.level))];
    return `<h3>Prepared today</h3><ul class="prepared">${levels.map(l => `<li><b>${['I', 'II', 'III', 'IV', 'V'][l - 1]}</b> `
      + m.spells!.filter(x => x.level === l).map(x => `<span class="${x.ready ? 'ready' : 'spent'}">${x.ready ? '●' : '○'} `
        + `${Html.escape(x.name)}</span>`).join(' ') + '</li>').join('')}</ul>`;
  }
  private static pack(s: PlayState): string {
    const screen = s.screen!, chosen = s.level[s.cursor];
    const item = screen.items.find(i => i.id === (s.trail[0]?.id ?? chosen?.id));
    const detail = item ? `<article class="sheet"><header><h1>${Html.escape(item.name)}</h1><p class="where">${Html.escape(item.kind)}`
      + ` · ${Html.escape(item.ownerName)} carries it${item.equipped ? ', in use' : ''}</p></header>`
      + `<div class="prose"><p>${Html.escape(item.description)}</p></div></article>`
      : `<article class="sheet"><div class="prose"><p>${screen.items.length ? 'Everything is carried by someone. Choose a thing to use '
        + 'it, hand it over or set it down.' : 'The company carries nothing yet.'}</p></div></article>`;
    return `<div class="split">${PlayMenu.render(s, 'What the company carries')}${detail}</div>`;
  }
  // What the company knows, split by how: seen with its own eyes, or heard from someone; what people want of it;
  // what is pressing; and everything that has happened so far.
  private static journal(s: PlayState): string {
    const screen = s.screen!;
    const seen = screen.knowledge.filter(k => !/told you|said|heard/i.test(k.how));
    const heard = screen.knowledge.filter(k => /told you|said|heard/i.test(k.how));
    const known = `<div class="known">${this.facts('Seen for yourselves', seen)}${this.facts('Heard from others', heard)}</div>`;
    const wants = screen.objectives.length ? `<ul class="wants">${screen.objectives.map(o => `<li>${Html.escape(o)}</li>`).join('')}</ul>`
      : '<p class="none">Nobody has asked anything of you yet. Listen in the taprooms and at the shrine.</p>';
    const deadlines = screen.deadlines.length ? `<ul>${screen.deadlines.map(d => `<li>${Html.escape(d)}</li>`).join('')}</ul>`
      : '<p class="none">No one has named a day.</p>';
    const chronicle = s.chronicle.slice(-80).reverse().map(e => `<li><time>${Html.escape(e.at)}</time>${Html.escape(e.text)}</li>`).join('');
    return `<div class="split"><article class="sheet journal" data-region="knowledge"><h1>Journal</h1>`
      + `<h3>What you know</h3>${known}<h3>What people want</h3>${wants}<h3>Days named</h3>${deadlines}`
      + `<p class="save">${Html.button('Download a save file', 'export')} ${Html.button('Back to the title', 'title')}</p></article>`
      + `<article class="sheet chronicle" data-region="chronicle"><h1>So far</h1><ol class="chronicle">${chronicle
        || '<li class="none">Nothing yet.</li>'}</ol></article></div>`;
  }
  private static facts(title: string, facts: { text: string; how: string }[]): string {
    if (!facts.length) { return ''; }
    return `<p class="kind">${title}</p><ul>${facts.map(k => `<li>${Html.escape(k.text)}`
      + `${k.how ? ` <span class="how">${Html.escape(k.how)}</span>` : ''}</li>`).join('')}</ul>`;
  }
  private static atlas(screen: Screen): string {
    return PlayMap.pane(screen.chart, screen.map, screen.region, 'large');
  }
}
