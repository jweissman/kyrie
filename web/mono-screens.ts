import { Content, type CreatureGenerationContext } from '../src/content';
import { Html } from './html';
import { MonoRender, type MonoState } from './mono-render';
import { Overlays } from '../src/overlays';

export interface Draft { seed: string; party: CreatureGenerationContext[]; field: number }

// The secondary game screens: inventory, character sheets, the known map, the journal and party creation.
export class MonoScreens {
  static pack(s: MonoState): string {
    const screen = s.screen!, row = s.rows[s.row], item = screen.items.find(i => i.id === row?.id);
    const detail = item ? `<section class="pane detail" data-region="detail"><h2>${Html.escape(item.name)}</h2><p class="kind">${Html.escape(item.kind)} · carried by ${Html.escape(item.ownerName)}${item.equipped ? ' · equipped' : ''}</p><p>${Html.escape(item.description)}</p></section>`
      : `<section class="pane detail" data-region="detail"><h2>Pack</h2><p class="muted">${screen.items.length ? 'Choose an item or a companion who can tend wounds.' : 'The company carries no gear yet. Items you buy or find belong to a named companion.'}</p></section>`;
    return `<main class="screen pack">${MonoRender.rows(s, 'Carried')}${MonoRender.menu(s)}${detail}${MonoRender.party(screen, s.narrow)}</main>`;
  }
  static party(s: MonoState): string {
    const screen = s.screen!, m = screen.party.find(p => p.id === s.rows[s.row]?.id) ?? screen.party[0];
    if (!m) { return '<main class="screen company-sheet"></main>'; }
    const attrs = Object.entries(m.attributes).map(([k, v]) => `<span><abbr title="${k}">${k.slice(0, 3).toUpperCase()}</abbr> ${v}</span>`).join('');
    const gear = screen.items.filter(i => i.owner === m.id).map(i => `<li>${i.equipped ? '◉' : '○'} ${Html.escape(i.name)}${i.kind === i.name ? '' : ` <small>${Html.escape(i.kind)}</small>`}</li>`).join('');
    const abilities = m.abilities.map(a => `<li><b>${Html.escape(a.name)}</b>${a.cost ? ` <small>${a.cost} mana</small>` : ''}<br><small>${Html.escape(a.text)}</small></li>`).join('');
    return `<main class="screen company-sheet">${MonoRender.rows(s, 'Company')}<section class="pane sheet" data-region="sheet"><h1>${Html.escape(m.name)}</h1>`
      + `<p class="kind">${Html.escape(m.line)} · level ${m.level}${m.background ? ` · ${Html.escape(m.background)}` : ''} · ${m.experience} xp · ${m.gold} coin</p>`
      + `${MonoRender.bar('HP', m.hp, m.maxHp, 'hp')}${m.maxMana ? MonoRender.bar('MP', m.mana, m.maxMana, 'mp') : ''}<div class="attrs">${attrs}</div>`
      + `<div class="cols"><div><h3>Abilities</h3><ul>${abilities}</ul></div><div><h3>Carried</h3><ul>${gear || '<li class="muted">Nothing</li>'}</ul>`
      + `<h3>Background and profession</h3><ul>${(m.overlays ?? []).map(o => `<li><b>${Html.escape(o.name)}</b> <small>${Html.escape(o.role)}</small><br><small>${o.grants.map(g => Html.escape(g)).join(' · ')}</small></li>`).join('') || '<li class="muted">None</li>'}</ul>`
      + `<h3>Company standing</h3><ul>${screen.capabilities.map(c => `<li>${Html.escape(c)}</li>`).join('') || '<li class="muted">None</li>'}</ul></div></div></section>`
      + `${MonoRender.menu(s)}</main>`;
  }
  static journal(s: MonoState): string {
    const screen = s.screen!;
    return `<main class="screen journal"><section class="pane knowledge" data-region="knowledge"><h2>What you know</h2>${this.list(screen.knowledge, 'Nothing established yet.')}`
      + `<h3>Deadlines</h3>${this.list(screen.deadlines, 'No public deadline.')}<h3>Company standing</h3>${this.list(screen.capabilities, 'None.')}`
      + `<p class="save-actions">${Html.button('Download save file', 'export')} ${Html.button('New company', 'new')}</p></section>`
      + `<section class="pane chronicle" data-region="chronicle"><h2>Chronicle</h2>${this.chronicle(s.chronicle.slice(-60).reverse())}</section></main>`;
  }
  static chronicle(entries: MonoState['chronicle']): string {
    if (!entries.length) { return '<p class="muted">Nothing has happened yet.</p>'; }
    return `<ul>${entries.map(e => `<li><time>${Html.escape(e.at)}</time> ${Html.escape(e.text)}`
      + `${e.detail.length ? `<details><summary>${e.detail.length} details</summary>${e.detail.map(d => `<p>${Html.escape(d)}</p>`).join('')}</details>` : ''}</li>`).join('')}</ul>`;
  }
  static background(id?: string): string {
    if (!id) { return ''; }
    if (!Overlays.has(id)) { return Content.backgrounds[id as keyof typeof Content.backgrounds]?.description ?? ''; }
    const o = Overlays.get(id), grants = Overlays.contributions({ backgroundId: id });
    return `${grants.filter(g => g.kind === 'skill').map(g => g.value).join(', ') || 'no skill'}; carries ${grants.filter(g => g.kind === 'gear').map(g => g.value.replace('_', ' ')).join(', ') || 'nothing special'}${o.requiredClass ? `; ${o.requiredClass}s only` : ''}.`;
  }
  static list(items: string[], empty: string): string {
    return items.length ? `<ul>${items.map(i => `<li>${Html.escape(i)}</li>`).join('')}</ul>` : `<p class="muted">${empty}</p>`;
  }
  static options(entries: string[][], value: string): string {
    return entries.map(([id, name]) => `<option value="${Html.escape(id)}"${id === value ? ' selected' : ''}>${Html.escape(name)}</option>`).join('');
  }
  static create(draft: Draft, error: string): string {
    const races = Content.playableRaces as string[], classes = Content.playableClasses as string[];
    const backgrounds = [...Object.keys(Overlays.catalog).filter(id => Overlays.has(id, 'background')), ...Object.keys(Content.backgrounds)];
    const rows = draft.party.map((p, i) => `<fieldset class="companion${draft.field === i ? ' sel' : ''}" data-companion="${i}"><legend>${i + 1}</legend>`
      + `<label>Name <input data-field="name" data-index="${i}" maxlength="40" value="${Html.escape(p.name ?? '')}"></label>`
      + `<label>Ancestry <select data-field="raceId" data-index="${i}">${this.options(races.map(id => [id, Content.races[id as keyof typeof Content.races]?.name ?? id]), p.raceId ?? '')}</select></label>`
      + `<label>Calling <select data-field="classId" data-index="${i}">${this.options(classes.map(id => [id, Content.classes[id as keyof typeof Content.classes]?.name ?? id]), p.classId ?? '')}</select></label>`
      + `<label>Background <select data-field="backgroundId" data-index="${i}">${this.options(backgrounds.map(id => [id, Overlays.has(id) ? Overlays.get(id).name : Content.backgrounds[id as keyof typeof Content.backgrounds]!.name]), p.backgroundId ?? '')}</select></label>`
      + `<p class="muted">${Html.escape(MonoScreens.background(p.backgroundId))}</p></fieldset>`).join('');
    return `<div class="mono-frame" data-mode="create"><header class="bar top"><b class="brand">Serewater March</b><nav class="path">Form a company of three</nav><time></time></header>`
      + `<main class="screen create"><section class="pane place"><h1>A company for Censer Hill</h1><p>Reedwake needs people willing to go under the hill: a surveyor is missing, a salvage crew wants its bronze, and a burial keeper wants the dead left with their names. Choose three companions. Their ancestry, calling and background decide what they can do — and what doors open.</p>`
      + `<p>${Html.button('Fellowship: elf, human, dwarf', 'preset', { id: 'fellowship' })} ${Html.button('Hired company', 'preset', { id: 'company' })}</p>`
      + `<label class="seed">World seed <input data-field="seed" value="${Html.escape(draft.seed)}"></label></section>`
      + `<section class="pane companions" data-region="companions">${rows}</section></main>`
      + `<footer class="bar keys">${Html.button('Begin the expedition', 'start', { class: 'primary' }, '<kbd>⏎</kbd>')}${Html.button('Load a save file', 'load-file')}<input type="file" id="load" accept="application/json" hidden></footer>`
      + `${error ? `<div class="toast" role="alert" data-id="error">${Html.escape(error)}</div>` : ''}</div>`;
  }
}
