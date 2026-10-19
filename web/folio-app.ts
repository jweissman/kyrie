import partyExamples from '../data/party-examples.json';
import { PlaySession, type CombatController } from '../src/session/play-session';
import { Content, type CreatureGenerationContext } from '../src/content';
import { PlayerView, type PlayerSnapshot } from '../src/presentation/player-view';
import { ActionFeedbackView, type ActionFeedback } from '../src/presentation/action-feedback';
import { FictionalTime } from '../src/presentation/fictional-time';
import { CombatChoices } from '../src/ui/combat-choices';
import { CombatPresenter } from '../src/ui/combat-presenter';
import { Tactics } from '../src/tactics';
import type { Battle } from '../src/battle';
import type { Command } from '../src/model';
import { Scenarios } from './scenarios';
import { Html } from './html';
import { FolioArt } from './folio-art';

export class FolioApp {
  private session?: PlaySession;
  private turn?: { battle: Battle; resolve: (command: Command) => void; selected?: string };
  private feedback?: ActionFeedback;
  private intent = 'conversation';
  private seed = 'serewater';
  private person = '';
  private drawer = '';
  private error = '';
  private pending = false;
  private speaking = false;
  private draft = structuredClone(partyExamples.fellowship).map((p, i) => ({ ...p, backgroundId: ['forager', 'surveyor', 'pilgrim'][i] })) as CreatureGenerationContext[];
  private readonly key = 'kyrie.serewater.game.v1';
  constructor(private root: HTMLElement) {}
  boot() {
    this.root.addEventListener('click', e => { void this.click(e); });
    this.root.addEventListener('change', e => {
      const input = e.target as HTMLInputElement;
      if (input.id === 'import-save' && input.files?.[0]) {
        void input.files[0].text().then(text => { this.session = PlaySession.resume(JSON.parse(text));
          this.feedback = undefined; this.save(); this.render(); }).catch(error => {
          this.error = String(error); this.render(); });
      } else if (!this.session && !this.pending) {
        this.readDraft();
        queueMicrotask(() => { if (!this.session && !this.pending) { this.render(); } });
      }
    });
    this.root.addEventListener('keydown', e => {
      if (e.key === 'Escape' && this.drawer) { this.drawer = ''; this.render(); }
    });
    this.render();
  }
  private readonly controller: CombatController = battle => new Promise(resolve => {
    this.turn = { battle, resolve }; this.render();
  });
  private readDraft() {
    this.seed = this.root.querySelector<HTMLInputElement>('#seed')?.value.trim() || this.seed;
    this.draft = [0, 1, 2].map(i => ({
      name: this.root.querySelector<HTMLInputElement>(`#name-${i}`)!.value.trim(),
      raceId: this.root.querySelector<HTMLSelectElement>(`#race-${i}`)!.value as CreatureGenerationContext['raceId'],
      classId: this.root.querySelector<HTMLSelectElement>(`#class-${i}`)!.value as CreatureGenerationContext['classId'],
      backgroundId: this.root.querySelector<HTMLSelectElement>(`#background-${i}`)?.value,
    }));
  }
  private async click(e: Event) {
    const el = (e.target as HTMLElement).closest<HTMLButtonElement>('[data-action]');
    if (!el || el.disabled) { return; }
    const { action, id } = el.dataset;
    if (this.pending && !['ability', 'target', 'tactics'].includes(action!)) { return; }
    this.error = '';
    try {
      if (action === 'preset') {
        this.readDraft();
        const example = id === 'hired' ? partyExamples.company : partyExamples.fellowship;
        this.draft = structuredClone(example).map((p, i) => ({ ...p, backgroundId: ['forager', 'surveyor', 'pilgrim'][i] })) as CreatureGenerationContext[];
      } else if (action === 'start') {
        this.readDraft(); this.pending = true; this.render();
        this.session = await PlaySession.start('data/serewater/campaign.json', this.seed, Scenarios.source(), this.draft);
        this.save();
      } else if (action === 'resume') {
        this.session = PlaySession.resume(JSON.parse(localStorage.getItem(this.key)!));
      } else if (action === 'restart') {
        this.session = undefined; this.feedback = undefined; this.drawer = ''; this.speaking = false;
      } else if (action === 'intent') {
        this.intent = id!; this.person = ''; this.speaking = false;
      } else if (action === 'drawer') { this.drawer = this.drawer === id ? '' : id!; }
      else if (action === 'person') { this.person = this.person === id ? '' : id!; this.intent = 'conversation'; this.speaking = false; }
      else if (action === 'continue') { this.speaking = false; }
      else if (action === 'command') { await this.perform(id!); }
      else if (action === 'ability') { this.ability(id!); }
      else if (action === 'target') {
        this.answer(CombatChoices.target(this.selected()!, id!));
      } else if (action === 'tactics' && this.turn) {
        this.answer(Tactics.choose(this.turn.battle.state, this.turn.battle.legalCommands()));
      } else if (action === 'export' || action === 'export-save') {
        const a = document.createElement('a');
        a.href = URL.createObjectURL(new Blob([JSON.stringify(action === 'export-save' ? this.session!.checkpoint() : this.session!.transcript, null, 2)],
          { type: 'application/json' }));
        a.download = action === 'export-save' ? 'serewater.save.json' : 'serewater.replay.json'; a.click(); URL.revokeObjectURL(a.href);
      }
    } catch (error) { this.error = error instanceof Error ? error.message : String(error); }
    finally { if (!this.session?.acting) { this.pending = false; } }
    this.render();
    if (action === 'command') { this.root.querySelector<HTMLElement>('[role="status"]')?.focus(); }
  }
  private async perform(id: string) {
    const before = PlayerView.observe(this.session!.campaign);
    const choice = before.choices.find(c => c.id === id);
    this.speaking = choice?.category === 'conversation';
    this.person = this.speaking ? choice?.speaker ?? '' : '';
    this.drawer = '';
    this.pending = true;
    const result = this.session!.perform(id, this.controller); this.render();
    try { this.feedback = ActionFeedbackView.read(this.session!.campaign, await result, before); this.save(); }
    finally { this.turn = undefined; }
  }
  private save() { localStorage.setItem(this.key, JSON.stringify(this.session!.checkpoint())); }
  private selected() {
    return this.turn && CombatChoices.actions(this.turn.battle.legalCommands(), Content.abilities)
      .find(c => c.ability.id === this.turn!.selected);
  }
  private ability(id: string) {
    if (!this.turn) { return; }
    const choice = CombatChoices.actions(this.turn.battle.legalCommands(), Content.abilities)
      .find(c => c.ability.id === id);
    if (choice?.commands.length === 1) { this.answer(choice.commands[0]!); }
    else { this.turn.selected = id; }
  }
  private answer(command: Command) {
    if (this.turn) { const turn = this.turn; this.turn = undefined; turn.resolve(command); }
  }
  private render() {
    this.root.innerHTML = this.session ? this.game(PlayerView.observe(this.session.campaign)) : this.creator();
  }
  private creator(): string {
    return `<section class="creation"><div class="creation-art">${FolioArt.scene('wild')}</div>
      <div class="creation-copy"><p class="eyebrow">Kyr · A persistent party adventure</p><h1>Serewater March</h1>
      <p class="lede">Gather a company. Cross the marsh. Bring something back.</p>
      <p>Reedwake lives by ferry tolls and salvage. Beyond the reeds, Censer Hill holds a missing surveyor, a disputed inheritance, and the workshops of the dead. Choose three companions; their injuries, discoveries and possessions will endure.</p>
      <div class="company-presets">${Html.button('The Free Fellowship', 'preset', { id: 'fellowship' })}${Html.button('A hired company', 'preset', { id: 'hired' })}<small>Starting suggestions; edit every companion below.</small></div>
      <div class="creation-party">${this.draft.map((p, i) => `<fieldset><legend>Companion ${i + 1}</legend>
        <div class="portrait">${FolioArt.portrait(i)}</div><label>Name<input id="name-${i}" value="${Html.escape(p.name)}" maxlength="40"></label>
        <label>Ancestry<select id="race-${i}">${Content.playableRaces.map(r =>
          `<option value="${r}" ${r === p.raceId ? 'selected' : ''}>${Html.escape(r)}</option>`).join('')}</select></label>
        <small>${Html.escape((Content.races[p.raceId ?? 'human']! as { playerFeature?: string }).playerFeature ?? Content.races[p.raceId ?? 'human']!.description)}</small>
        <label>Calling<select id="class-${i}">${Content.playableClasses.map(c =>
          `<option value="${c}" ${c === p.classId ? 'selected' : ''}>${Html.escape(Content.classes[c]!.name)}</option>`).join('')}</select></label>
        <small>${Html.escape(Content.classes[p.classId ?? 'fighter']!.role)}</small>
        <label>Background<select id="background-${i}">${Object.entries(Content.backgrounds).map(([id, b]) =>
          `<option value="${id}" ${id === p.backgroundId ? 'selected' : ''}>${Html.escape(b.name)}</option>`).join('')}</select></label>
        <small>${Html.escape(Object.entries(Content.backgrounds).find(([id]) => id === p.backgroundId)?.[1].description ?? '')}</small>
      </fieldset>`).join('')}</div>
      <p class="note">Rangers provide woodcraft; a human, elf and dwarf form the Free Fellowship.
      Classes determine starting abilities and resources. Backgrounds grant practical expedition capabilities; ancestry also matters to the company's identity. All ancestry–class combinations are allowed in Kyr.</p>
      <label class="seed-field">World seed<input id="seed" value="${Html.escape(this.seed)}"></label>
      ${this.error ? `<p role="alert">${Html.escape(this.error)}</p>` : ''}
      ${Html.button(this.pending ? 'Gathering your company…' : 'Set out for Reedwake', 'start', { disabled: this.pending, class: 'primary' })}
      ${localStorage.getItem(this.key) ? Html.button('Continue saved journey', 'resume') : ''}
      <label class="file-load">Load a saved journey<input id="import-save" type="file" accept="application/json"></label></div></section>`;
  }
  private game(view: PlayerSnapshot): string {
    const kind = this.turn ? 'combat' : view.location?.scene ?? 'wild';
    return `<div class="game-shell"><header><a class="wordmark" href="folio.html">Serewater March</a>
      <span>${this.turn ? 'Encounter' : Html.escape(view.location?.zone ?? 'Serewater March')}</span>
      <time>${FictionalTime.at(view.elapsed)}</time>${Html.button('Journal', 'drawer', { id: 'journal', disabled: this.pending })}
      ${Html.button('Map', 'drawer', { id: 'map', disabled: this.pending })}${Html.button('Satchel', 'drawer', { id: 'satchel', disabled: this.pending })}${Html.button('Company', 'drawer', { id: 'company', disabled: this.pending })}</header>
      <main class="stage ${kind}"><div class="scene-art">${FolioArt.scene(kind)}</div>
      <div class="scene-caption"><span class="eyebrow">${this.turn ? 'The company holds its ground' : 'You are here'}</span>
      <h1>${this.turn ? Html.escape(this.turn.battle.state.combatants.filter(f => f.team !== 'fighters' && f.hp > 0).map(f => f.name).join(' & ')) : Html.escape(view.location?.name)}</h1></div>
      ${this.turn ? this.combat() : this.exploration(view)}
      </main>${this.party(view)}${this.drawer ? this.overlay(view) : ''}
      <footer><span>Seed ${Html.escape(this.session!.seed)} · saved after each completed action</span>
      ${Html.button('Save file', 'export-save', { disabled: this.pending })}${Html.button('Export replay', 'export', { disabled: this.pending })}${Html.button('New campaign', 'restart', { disabled: this.pending })}
      <a href="workbench.html">Developer workbench</a></footer></div>`;
  }
  private exploration(view: PlayerSnapshot): string {
    const categories = ['conversation', 'investigate', 'travel', 'interact', 'care', 'reward', 'combat', 'gift', 'wait'];
    const available = categories.filter(k => view.choices.some(c => c.category === k));
    const active = available.includes(this.intent) ? this.intent : available[0];
    const names: Record<string, string> = { conversation: 'Speak', investigate: 'Examine', travel: 'Go',
      care: 'Tend', reward: 'Supplies & finds', combat: 'Confront', interact: 'Interact', gift: 'Offer', wait: 'Wait' };
    const choices = view.choices.filter(c => c.category === active && (!this.person || c.speaker === this.person));
    const feedback = this.feedback ? `<section class="receipt" role="status" tabindex="-1">
      ${this.speaking && this.person ? `<h2>${Html.escape(view.present.find(p => p.id === this.person)?.name ?? 'Conversation')}</h2>` : ''}
      <span class="eyebrow">${Html.escape(this.feedback.attempt)} · ${this.feedback.time}</span>
      <p>${Html.escape(this.feedback.result)}</p>
      ${[...this.feedback.resources, ...this.feedback.discoveries].map(t => `<small>${Html.escape(t)}</small>`).join('')}
      ${this.feedback.available.length ? `<p class="new-options">New possibilities: ${Html.escape(this.feedback.available.slice(0, 3).join(' · '))}</p>` : ''}
      ${this.feedback.immediate.length ? `<details><summary>Resolution</summary>${Html.list(this.feedback.immediate.map(t => Html.escape(t)))}</details>` : ''}
      ${this.speaking ? Html.button('Step back', 'continue') : ''}</section>` : '';
    return `<section class="story-pane" aria-label="Current scene">${view.party.length && view.party.every(m => m.hp <= 0) ? '<section class="receipt"><h2>The company has fallen</h2><p>No companion survives to continue this expedition. This history remains saved; you can export it or begin a new campaign. Recovery cannot undo death.</p></section>' : ''}${this.speaking ? feedback :
      `<div class="scene-prose">${view.observations.map(o => `<p>${Html.escape(FictionalTime.prose(o.text))}</p>`).join('')}</div>${feedback}`}
      ${view.present.length ? `<div class="presence"><span>Within reach</span>${view.present.map(p => view.choices.some(c => c.speaker === p.id) ? Html.button(p.name, 'person', { id: p.id, disabled: this.pending, class: this.person === p.id ? 'active' : '' }) : `<span>${Html.escape(p.name)}${p.state === 'dead' ? ' · dead' : ''}</span>`).join('')}</div>` : ''}
      <nav class="intentions" aria-label="Intention">${available.map(k => Html.button(names[k]!, 'intent',
        { id: k, disabled: this.pending, class: k === active ? 'active' : '' })).join('')}</nav>
      <div class="intent-choices">${choices.map((c, i) => `<button data-action="command" data-id="${Html.escape(c.id)}"
        ${this.pending ? 'disabled' : ''}><span class="choice-index">${i + 1}</span><span>${Html.escape(c.name)}
        <small>${FictionalTime.duration(c.time)}${c.encounter ? ' · injuries persist' : ''}</small></span><b>›</b></button>`).join('')}</div>
      ${!choices.length && this.person ? '<p>There are no further available topics with this person here.</p>' : ''}
      ${this.pending ? '<p class="pending" role="status">The world answers…</p>' : ''}
      ${this.error ? `<p role="alert">${Html.escape(this.error)}</p>` : ''}</section>`;
  }
  private combat(): string {
    const { battle } = this.turn!, state = battle.state;
    const actor = state.combatants.find(f => f.id === state.actor)!;
    const choices = CombatChoices.actions(battle.legalCommands(), Content.abilities);
    const selected = this.selected();
    const foes = state.combatants.filter(f => f.team !== 'fighters');
    const controls = selected ? selected.commands.map(c => Html.button(
      state.combatants.find(f => f.id === c.target)!.name,
      'target', { id: c.target })).join('') + Html.button('Back', 'ability', { id: '' }) : choices.map(c =>
      `<button data-action="ability" data-id="${c.ability.id}"><strong>${Html.escape(c.ability.name)}</strong>
      <small>${c.ability.cost} mana · ${c.ability.cooldown} turn cooldown</small><span>${Html.escape(this.summary(c.ability.description ?? ''))}</span></button>`).join('');
    return `<div class="foes">${foes.map(f => `<span>${Html.escape(f.name)} · ${f.hp}/${f.maxHp} HP
      ${Html.escape(f.statuses.map(s => s.id).join(', '))}</span>`).join('')}</div>
      <section class="battle-console"><div class="battle-history" aria-live="polite">
      ${battle.events.slice(-5).map(e => `<p>${Html.escape(CombatPresenter.format(e, state))}</p>`).join('') || '<p>The encounter begins. Choose an ability, then its target.</p>'}</div>
      <div class="battle-turn"><span class="eyebrow">Turn ${state.turn} · ${Html.escape(actor.name)} acts</span>
      <h2>${selected ? `Choose a target for ${Html.escape(selected.ability.name)}` : 'What will you do?'}</h2>
      <div class="battle-actions">${controls}</div>${Html.button('Suggest and take one action', 'tactics')}
      <p class="note">Choose an ability, then a target. Spent mana and injuries persist; retreat is an action, not a reset.</p><details><summary>Ability rules</summary>${choices.map(c => `<p><strong>${Html.escape(c.ability.name)}</strong> ${Html.escape(c.ability.description ?? '')}</p>`).join('')}</details></div></section>`;
  }
  private party(view: PlayerSnapshot): string {
    const fighters = this.turn?.battle.state.combatants;
    return `<section class="company-bar" aria-label="Your company">${view.party.map((m, i) => {
      const f = fighters?.find(f => f.id === m.id), hp = f?.hp ?? m.hp, mana = f?.mana ?? m.mana;
      return `<button data-action="drawer" data-id="company" ${this.pending ? 'disabled' : ''} class="companion ${hp === 0 ? 'fallen' : ''}">
        <span class="portrait">${FolioArt.portrait(i)}</span><span><strong>${Html.escape(m.name)}</strong>
        <small>${Html.escape(m.raceId)} · ${Html.escape(m.classId)}</small>
        <meter min="0" max="${m.maxHp}" value="${hp}" aria-label="${Html.escape(m.name)} health"></meter>
        <small>${hp}/${m.maxHp} health · ${mana}/${m.maxMana} mana</small></span></button>`;
    }).join('')}</section>`;
  }
  private summary(text: string): string {
    return text.replace(/#([a-zA-Z]+)/g, '$1').replace(/\(statMod\(([^)]+)\)\s*\+?/g, '($1 modifier +');
  }
  private overlay(view: PlayerSnapshot): string {
    let content = '';
    if (this.drawer === 'journal') {
      content = `<h2>Discoveries</h2>${Html.list(view.knowledge.map(k => Html.escape(k.text)), 'Nothing established yet. Speak with the people of Reedwake and examine what you find.')}
        <h2>Your chronicle</h2>${Html.list(PlayerView.chronicle(this.session!.campaign).slice(-18).reverse().map(e =>
          `<small>${FictionalTime.at(e.at)}</small>${Html.escape(e.text)}`))}`;
    } else if (this.drawer === 'map') {
      const visited = view.map.places.filter(p => p.visited), frontier = view.map.places.filter(p => !p.visited);
      content = `<p>Drawn from your journeys. Hidden passages and unexplored interiors are not shown.</p>
        <h2>Explored ground · ${visited.length} places</h2>${[...new Set(visited.map(p => p.zone ?? 'Explored ground'))].map(zone => { const places = visited.filter(p => (p.zone ?? 'Explored ground') === zone); return places.length ? `<h3>${Html.escape(zone)}</h3><ul class="route-book">${places.map(p => this.mapEntry(view, p)).join('')}</ul>` : ''; }).join('')}
        <h2>Beyond your footsteps</h2><ul class="route-book">${frontier.map(p => this.mapEntry(view, p)).join('')}</ul>`;
    } else if (this.drawer === 'satchel') {
      content = `<h2>Company stores</h2>${Html.list((view.resources ?? []).map(r => `${Html.escape(r.name)} · ${r.amount}`))}
        <h2>Owned equipment</h2>${(view.items ?? []).map(item => `<article class="item-card"><h3>${Html.escape(item.name)}</h3>
        <small>${Html.escape(item.owner)} · ${item.equipped ? 'Equipped' : 'Carried'}${item.slot ? ` · ${Html.escape(item.slot)}` : ''}</small>
        <p>${Html.escape(item.description)}</p><small>${Html.escape(item.effects.join(' · '))}</small></article>`).join('') || '<p>No individual item instances yet.</p>'}
        <h2>Use and equip</h2>${this.drawerChoices(view, /item|equip|purchase|buy|sell/)}
        ${view.carried?.length ? `<h2>Carried objects</h2>${Html.list(view.carried.map(o => Html.escape(o.name)))}` : ''}`;
    } else {
      content = view.party.map(m => `<article class="character-sheet"><h2>${Html.escape(m.name)} · level ${m.level}</h2>
        <p>${Html.escape(m.raceId)} ${Html.escape(m.classId)} · ${m.experience} experience · ${m.gold} coin</p>
        <p>${m.hp}/${m.maxHp} health · ${m.mana}/${m.maxMana} mana</p>
        <p>${Html.escape(m.conditions.join(', ') || 'No persistent conditions')}</p>
        ${m.conditions.includes('poisoned') ? '<p class="note">Poison remains when you leave an encounter. Rest does not cure it; an antidote or purification can.</p>' : ''}
        <div class="attributes">${Object.entries(m.attributes ?? {}).map(([k, v]) => `<span>${Html.escape(k)} <b>${v}</b></span>`).join('')}</div>
        ${Html.list((m.abilities ?? []).map(id => { const ability = Content.abilities.find(a => a.id === id);
          return `<strong>${Html.escape(ability?.name ?? id)}</strong><small>${ability?.cost ?? 0} mana · ${Html.escape(ability?.description ?? '')}</small>`; }))}</article>`).join('')
        + `<h2>Practice and training</h2>${this.drawerChoices(view, /train|advance/)}`;
    }
    return `<div class="overlay"><section role="dialog" aria-modal="true" aria-label="${Html.escape(this.drawer)}">
      ${Html.button('Return to scene', 'drawer', { id: this.drawer })}<h1>${Html.escape(this.drawer === 'satchel' ? 'Equipment & stores' : this.drawer)}</h1>${content}</section></div>`;
  }
  private mapEntry(view: PlayerSnapshot, p: PlayerSnapshot['map']['places'][number]): string {
    return `<li class="map-place ${p.id === view.location?.id ? 'here' : ''}"><strong>${Html.escape(p.name)}</strong>
        <small>${p.id === view.location?.id ? 'You are here' : p.visited ? 'Explored' : 'Known entrance; not explored'}</small>
        ${p.visited ? `<span>${view.map.links.filter(l => l.from === p.id).map(l => {
          const next = view.map.places.find(v => v.id === l.to);
          return `${Html.escape(next?.name ?? 'Unexplored passage')} <small>${Html.escape(l.status ?? 'known connection')}</small>`;
        }).join(' · ') || 'No recorded onward passage'}</span>` : ''}</li>`;
  }
  private drawerChoices(view: PlayerSnapshot, match: RegExp): string {
    const choices = view.choices.filter(c => match.test(c.id));
    return choices.length ? `<div class="intent-choices">${choices.map(c => Html.button(c.name, 'command', { id: c.id, disabled: this.pending })).join('')}</div>` :
      '<p class="note">No relevant action is available here. Equipment must be owned; services require the right place and resources.</p>';
  }
}
