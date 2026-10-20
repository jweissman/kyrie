import { Advancement } from '../src/rules/advancement';
import { Content, type CreatureGenerationContext } from '../src/content';
import { Html } from './html';
import { MonoMap } from './mono-map';
import { MonoRender, type MonoState } from './mono-render';
import { Canon } from '../src/canon/canon';
import { Overlays } from '../src/overlays';

export interface Draft { seed: string; party: CreatureGenerationContext[] }
export interface CampaignCard { id: string; title: string; note: string; detail: string; recommended?: boolean }
export interface Opening {
  saved?: { title: string; where: string; when: string; company: string };
  campaigns: CampaignCard[]; cursor: number; chosen?: string;
}

// The screens around play: the title, choosing a campaign, forming a company, the pack, a companion's sheet, the
// journal and the full map.
export class MonoScreens {
  static title(o: Opening, error: string): string {
    const entries = [
      ...(o.saved ? [{ action: 'continue', label: `Continue: ${o.saved.title}`, note: `${o.saved.where} · ${o.saved.when} · ${o.saved.company}` }] : []),
      { action: 'campaigns', label: 'Begin a new campaign', note: 'Choose where, then who goes.' },
      { action: 'load-file', label: 'Load a saved game', note: 'A file downloaded from the Journal.' },
    ];
    const menu = entries.map((e, i) => `<li><button type="button" class="choice${i === o.cursor ? ' sel' : ''}" data-action="${e.action}" data-index="${i}">`
      + `<span class="n">${i + 1}</span><span class="l">${Html.escape(e.label)}</span><span class="note">${Html.escape(e.note)}</span></button></li>`).join('');
    return `<div class="frame" data-mode="title"><main class="screen title"><section class="pane opening">`
      + `<pre class="mark" aria-hidden="true">K  Y  R</pre><p class="tagline">A party of three, a world that remembers, and the road out of town.</p>`
      + `<ul role="list" class="menu">${menu}</ul><input type="file" id="load" accept="application/json" hidden></section></main>`
      + `${error ? `<div class="toast" role="alert" data-id="error">${Html.escape(error)}</div>` : ''}</div>`;
  }
  static campaigns(o: Opening): string {
    const cards = o.campaigns.map((c, i) => `<li><button type="button" class="choice campaign${i === o.cursor ? ' sel' : ''}" data-action="campaign" data-id="${Html.escape(c.id)}" data-index="${i}">`
      + `<span class="n">${i + 1}</span><span class="l">${Html.escape(c.title)}${c.recommended ? ' <em>· start here</em>' : ''}</span>`
      + `<span class="blurb">${Html.escape(c.note)}</span><span class="meta">${Html.escape(c.detail)}</span></button></li>`).join('');
    return `<div class="frame" data-mode="campaigns"><header class="bar top"><b class="brand">Kyr</b><nav class="path">Choose a campaign</nav><time></time></header>`
      + `<main class="screen campaigns"><section class="pane opening"><h1>Where will the company go?</h1><ul role="list" class="menu">${cards}</ul></section></main>`
      + `<footer class="bar keys"><span class="hint"><kbd>↑↓</kbd>look <kbd>⏎</kbd>choose <kbd>Esc</kbd>back</span></footer></div>`;
  }
  static pack(s: MonoState): string {
    const screen = s.screen!, chosen = s.level[s.cursor], item = screen.items.find(i => i.id === chosen?.id);
    const detail = item ? `<section class="pane detail" data-region="detail"><h2>${Html.escape(item.name)}</h2><p class="where">${Html.escape(item.kind)} · carried by ${Html.escape(item.ownerName)}${item.equipped ? ' · in use' : ''}</p><p>${Html.escape(item.description)}</p></section>`
      : `<section class="pane detail" data-region="detail"><h2>Pack</h2><p class="muted">${screen.items.length ? 'Each thing is carried by someone. Choose one to use it, hand it over or put it down.' : 'The company carries nothing yet. What you buy or find is carried by a named companion.'}</p></section>`;
    return `<main class="screen pack">${MonoRender.choices(s, 'What the company carries')}${detail}${MonoRender.party(screen)}</main>`;
  }
  static sheet(s: MonoState): string {
    const screen = s.screen!, chosen = s.trail[0] ?? s.level[s.cursor];
    const m = screen.party.find(p => p.id === chosen?.id) ?? screen.party[0];
    if (!m) { return '<main class="screen company-sheet"></main>'; }
    const attrs = Object.entries(m.attributes).map(([k, v]) => `<span><abbr title="${k}">${k.slice(0, 3).toUpperCase()}</abbr> ${v}</span>`).join('');
    const gear = screen.items.filter(i => i.owner === m.id).map(i => `<li>${i.equipped ? '◉' : '○'} ${Html.escape(i.name)}</li>`).join('');
    const abilities = m.abilities.map(a => `<li><b>${Html.escape(a.name)}</b>${a.price ? ` <small>${Html.escape(a.price)}</small>` : ''}<br><small>${Html.escape(a.text)}</small></li>`).join('');
    const next = Advancement.threshold(m.level + 1);
    const progress = next <= m.experience ? `${m.experience} xp · ready for level ${m.level + 1}: rest under a roof` : `${m.experience} of ${next} xp for level ${m.level + 1}`;
    return `<main class="screen company-sheet">${MonoRender.choices(s, 'The company')}<section class="pane sheet" data-region="sheet"><h1>${Html.escape(m.name)}</h1>`
      + `<p class="where">${Html.escape(m.line)} · level ${m.level}${m.background ? ` · ${Html.escape(m.background)}` : ''} · ${progress} · ${m.gold} coin</p>`
      + `${MonoRender.bar('HP', m.hp, m.maxHp, 'hp')}${MonoRender.slots(m)}<div class="attrs">${attrs}</div>`
      + `<div class="cols"><div><h3>Abilities and spells</h3><ul>${abilities}</ul></div><div><h3>Carried</h3><ul>${gear || '<li class="muted">Nothing</li>'}</ul>`
      + `<h3>Where they come from</h3><ul>${(m.overlays ?? []).map(o => `<li><b>${Html.escape(o.name)}</b> <small>${Html.escape(o.role)}</small><br><small>${o.grants.map(g => Html.escape(g)).join(' · ')}</small></li>`).join('') || '<li class="muted">Nothing recorded</li>'}</ul>`
      + `<h3>What the company can do</h3><ul>${screen.capabilities.map(c => `<li>${Html.escape(c)}</li>`).join('') || '<li class="muted">Nothing special</li>'}</ul></div></div></section></main>`;
  }
  static journal(s: MonoState): string {
    const screen = s.screen!;
    return `<main class="screen journal"><section class="pane knowledge" data-region="knowledge"><h2>Journal</h2><h3>In hand</h3>`
      + `${this.list(screen.objectives ?? [], 'Nothing in hand. Listen in the taprooms and at the shrine.')}<h3>What you know</h3>${this.list(screen.knowledge, 'Nothing learned yet.')}`
      + `<h3>Deadlines</h3>${this.list(screen.deadlines, 'No deadline anyone has told you of.')}`
      + `<p class="save-actions">${Html.button('Download a save file', 'export')} ${Html.button('Back to the title', 'title')}</p></section>`
      + `<section class="pane chronicle" data-region="chronicle"><h2>Chronicle</h2>${this.chronicle(s.chronicle.slice(-80).reverse())}</section></main>`;
  }
  static map(s: MonoState): string {
    const screen = s.screen!;
    return `<main class="screen atlas">${MonoMap.pane(screen.chart, screen.map, screen.region, 'large')}</main>`;
  }
  static chronicle(entries: MonoState['chronicle']): string {
    if (!entries.length) { return '<p class="muted">Nothing has happened yet.</p>'; }
    return `<ul>${entries.map(e => `<li><time>${Html.escape(e.at)}</time> ${Html.escape(e.text)}`
      + `${e.detail.length ? `<details><summary>${e.detail.length} details</summary>${e.detail.map(d => `<p>${Html.escape(d)}</p>`).join('')}</details>` : ''}</li>`).join('')}</ul>`;
  }
  // What a background means in play, in a line.
  static background(id?: string): string {
    if (!id || !Overlays.has(id)) { return ''; }
    const o = Overlays.get(id), grants = Overlays.contributions({ backgroundId: id });
    const skills = grants.filter(g => g.kind === 'skill').map(g => Canon.skills[g.value]?.name ?? g.value);
    const gear = grants.filter(g => g.kind === 'gear').map(g => Canon.items[g.value]?.name ?? g.value.replace(/_/g, ' '));
    const parts = [skills.length ? `knows ${skills.join(', ').toLowerCase()}` : '', gear.length ? `carries ${gear.join(', ').toLowerCase()}` : '',
      o.contact ? `has an old friend who hears ${({ tavern: 'taproom', temple: 'shrine', market: 'market', road: 'road' })[o.contact.channel]} news` : '',
      o.requiredClass ? `${o.requiredClass}s only` : ''].filter(Boolean);
    return parts.length ? `${parts.join('; ')}.` : '';
  }
  static list(items: string[], empty: string): string {
    return items.length ? `<ul>${items.map(i => `<li>${Html.escape(i)}</li>`).join('')}</ul>` : `<p class="muted">${empty}</p>`;
  }
  static options(entries: string[][], value: string): string {
    return entries.map(([id, name]) => `<option value="${Html.escape(id)}"${id === value ? ' selected' : ''}>${Html.escape(name)}</option>`).join('');
  }
  // Orsino's trait choice for the class (a mage school, a cleric domain, a warrior's disposition), when it has one.
  static specialization(p: Draft['party'][number], i: number): string {
    const choices = Canon.classes[Canon.resolve('classes', p.classId ?? '')]?.specializations ?? [];
    if (!choices.length) { return ''; }
    const forbidden = Canon.ancestries[p.raceId ?? '']?.forbiddenTraits ?? [];
    const options = [['', 'Drawn at random'], ...choices.filter(id => !forbidden.includes(id))
      .map(id => [id, Canon.traits[id]?.name ?? id])];
    return `<label>Specialization <select data-field="specialization" data-index="${i}">${this.options(options, p.traits?.[0] ?? '')}</select></label>`;
  }
  static create(draft: Draft, error: string, campaign: { name: string; pitch?: { heading: string; text: string } },
    presets: { id: string; label: string; note: string }[]): string {
    const races = Content.playableRaces as string[], classes = Content.playableClasses as string[];
    const backgrounds = Object.keys(Overlays.catalog).filter(id => Overlays.has(id, 'background'));
    const rows = draft.party.map((p, i) => {
      const klass = Canon.classes[Canon.resolve('classes', p.classId ?? '')];
      return `<fieldset class="companion" data-companion="${i}"><legend>${Html.escape(p.name ?? `Companion ${i + 1}`)}</legend>`
        + `<label>Name <input data-field="name" data-index="${i}" maxlength="40" value="${Html.escape(p.name ?? '')}"></label>`
        + `<label>Ancestry <select data-field="raceId" data-index="${i}">${this.options(races.map(id => [id, Content.races[id as keyof typeof Content.races]?.name ?? id]), p.raceId ?? '')}</select></label>`
        + `<label>Calling <select data-field="classId" data-index="${i}">${this.options(classes.map(id => [id, Content.classes[id as keyof typeof Content.classes]?.name ?? id]), p.classId ?? '')}</select></label>`
        + this.specialization(p, i)
        + `<label>Background <select data-field="backgroundId" data-index="${i}">${this.options([['', 'None'], ...backgrounds.map(id => [id, Overlays.get(id).name])], p.backgroundId ?? '')}</select></label>`
        + `<p class="muted">${Html.escape([klass?.description ?? '', MonoScreens.background(p.backgroundId)].filter(Boolean).join(' '))}</p></fieldset>`;
    }).join('');
    const pitch = campaign.pitch ?? { heading: campaign.name, text: 'Choose three companions.' };
    const ready = presets.map(p => Html.button(p.label, 'preset', { id: p.id, title: p.note })).join(' ');
    return `<div class="frame" data-mode="create"><header class="bar top"><b class="brand">${Html.escape(campaign.name)}</b>`
      + `<nav class="path">Form a company of three</nav><time></time></header>`
      + `<main class="screen create"><section class="pane scene"><h1>${Html.escape(pitch.heading)}</h1><div class="prose"><p>${Html.escape(pitch.text)}</p></div>`
      + `<h3>A ready company</h3><p class="presets">${ready}</p>`
      + `<label class="seed">Seed (the same seed makes the same draws) <input data-field="seed" value="${Html.escape(draft.seed)}"></label></section>`
      + `<section class="pane companions" data-region="companions">${rows}</section></main>`
      + `<footer class="bar keys">${Html.button('Set out', 'start', { class: 'primary' }, '<kbd>⏎</kbd>')}${Html.button('Choose another campaign', 'campaigns')}</footer>`
      + `${error ? `<div class="toast" role="alert" data-id="error">${Html.escape(error)}</div>` : ''}</div>`;
  }
}
