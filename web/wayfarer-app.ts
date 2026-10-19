import partyExamples from '../data/party-examples.json';
import { Content, type CreatureGenerationContext } from '../src/content';
import { PlaySession, type CombatController } from '../src/session/play-session';
import { PlayerView, type PlayerSnapshot } from '../src/presentation/player-view';
import { ActionFeedbackView, type ActionFeedback } from '../src/presentation/action-feedback';
import { FictionalTime } from '../src/presentation/fictional-time';
import { CombatChoices } from '../src/ui/combat-choices';
import { CombatPresenter } from '../src/ui/combat-presenter';
import { Tactics } from '../src/tactics';
import type { Battle } from '../src/battle';
import type { Command } from '../src/model';
import type { PublicChoice } from '../src/presentation/action-presentation';
import { Scenarios } from './scenarios';
import { Html } from './html';

/** A room-centred client. Every game consequence remains a PlaySession command. */
export class WayfarerApp {
  private session?: PlaySession;
  private feedback?: ActionFeedback;
  private feedbackSpeaker?: string;
  private mode = 'explore';
  private focus = '';
  private pending = false;
  private moved = false;
  private error = '';
  private seed = 'greenhollow';
  private readonly manifest = new URLSearchParams(location.search).get('campaign') ?? 'data/greenhollow/campaign.json';
  private draft = structuredClone(partyExamples.fellowship).map((p, i) =>
    ({ ...p, ...(i === 2 ? { classId: 'orsino_life_cleric' } : {}),
      backgroundId: ['forager', 'surveyor', 'pilgrim'][i] })) as CreatureGenerationContext[];
  private turn?: { battle: Battle; resolve: (command: Command) => void; selected?: string };
  private readonly key = 'kyrie.wayfarer.v1';
  constructor(private root: HTMLElement) {}
  boot() {
    this.root.addEventListener('click', e => { void this.click(e); });
    this.root.addEventListener('change', e => {
      const input = e.target as HTMLInputElement;
      if (input.id === 'load' && input.files?.[0]) {
        void input.files[0].text().then(text => { this.session = PlaySession.resume(JSON.parse(text));
          this.feedback = undefined; this.mode = 'explore'; this.save(); this.render(); })
          .catch(error => { this.error = String(error); this.render(); });
      } else if (!this.session) { this.readDraft(); this.render(); }
    });
    this.root.addEventListener('keydown', e => {
      if (e.key === 'Escape') { this.mode = 'explore'; this.focus = ''; this.render(); }
    });
    this.render();
  }
  private readDraft() {
    this.seed = this.root.querySelector<HTMLInputElement>('#seed')?.value.trim() || this.seed;
    this.draft = [0, 1, 2].map(i => ({ name: this.input(`name-${i}`), raceId: this.input(`race-${i}`) as CreatureGenerationContext['raceId'],
      classId: this.input(`class-${i}`) as CreatureGenerationContext['classId'], backgroundId: this.input(`background-${i}`) }));
  }
  private input(id: string) { return this.root.querySelector<HTMLInputElement>(`#${id}`)?.value ?? ''; }
  private readonly controller: CombatController = battle => new Promise(resolve => {
    this.turn = { battle, resolve }; this.render();
  });
  private async click(event: Event) {
    const button = (event.target as HTMLElement).closest<HTMLButtonElement>('[data-action]');
    if (!button || button.disabled) { return; }
    const { action, id } = button.dataset;
    if (this.pending && !['ability', 'target', 'tactics'].includes(action!)) { return; }
    this.error = '';
    try {
      if (action === 'start') {
        this.readDraft(); this.pending = true; this.render();
        this.session = await PlaySession.start(this.manifest, this.seed, Scenarios.source(), this.draft);
        this.mode = 'explore'; this.save();
      } else if (action === 'resume') { this.session = PlaySession.resume(JSON.parse(localStorage.getItem(this.key)!)); }
      else if (action === 'new') { this.session = undefined; this.feedback = undefined; this.mode = 'explore'; }
      else if (action === 'mode') { this.mode = id!; this.focus = ''; }
      else if (action === 'focus') { this.focus = id!; this.mode = 'explore'; }
      else if (action === 'journey') { this.focus = id!; this.mode = 'travel'; }
      else if (action === 'talk') { this.focus = id!; this.mode = 'conversation'; }
      else if (action === 'command') { await this.perform(id!); }
      else if (action === 'ability') {
        const choice = this.turn && CombatChoices.actions(this.turn.battle.legalCommands(), Content.abilities)
          .find(c => c.ability.id === id);
        if (choice?.commands.length === 1) { this.answer(choice.commands[0]!); }
        else if (this.turn) { this.turn.selected = id; }
      } else if (action === 'target' && this.turn) {
        const choice = CombatChoices.actions(this.turn.battle.legalCommands(), Content.abilities)
          .find(c => c.ability.id === this.turn!.selected);
        if (choice) { this.answer(CombatChoices.target(choice, id!)); }
      } else if (action === 'tactics' && this.turn) { this.answer(Tactics.choose(this.turn.battle.state, this.turn.battle.legalCommands())); }
      else if (action === 'save' || action === 'replay') {
        const link = document.createElement('a');
        link.href = URL.createObjectURL(new Blob([JSON.stringify(action === 'save' ? this.session!.checkpoint() : this.session!.transcript, null, 2)], { type: 'application/json' }));
        link.download = `wayfarer.${action === 'save' ? 'save' : 'replay'}.json`; link.click(); URL.revokeObjectURL(link.href);
      }
    } catch (error) { this.error = error instanceof Error ? error.message : String(error); }
    finally { if (!this.session?.acting) { this.pending = false; } }
    this.render();
    if (this.moved || ['mode', 'talk', 'journey', 'start', 'resume'].includes(action!)) {
      window.scrollTo({ top: 0, behavior: 'instant' }); this.moved = false;
    } else if (action === 'command') {
      this.root.querySelector('.wf-receipt')?.scrollIntoView({ block: 'nearest' });
    }
  }
  private answer(command: Command) { const turn = this.turn; this.turn = undefined; turn?.resolve(command); }
  private async perform(id: string) {
    const before = PlayerView.observe(this.session!.campaign), choice = before.choices.find(c => c.id === id);
    this.feedbackSpeaker = choice?.speaker;
    if (choice?.speaker) { this.focus = choice.speaker; this.mode = 'conversation'; }
    this.pending = true;
    const result = this.session!.perform(id, this.controller); this.render();
    try {
      this.feedback = ActionFeedbackView.read(this.session!.campaign, await result, before);
      const after = PlayerView.observe(this.session!.campaign);
      if (this.focus && !after.present.some(p => p.id === this.focus)) {
        this.focus = ''; this.mode = 'explore';
      }
      if (before.location?.id !== after.location?.id) {
        this.focus = ''; this.mode = 'explore'; this.moved = true;
      }
      this.save();
    } finally { this.turn = undefined; }
  }
  private save() { localStorage.setItem(this.key, JSON.stringify(this.session!.checkpoint())); }
  private render() {
    this.root.innerHTML = this.session ? this.game(PlayerView.observe(this.session.campaign)) : this.creator();
  }
  private creator(): string {
    const name = Scenarios.files[this.manifest] ? (JSON.parse(Scenarios.files[this.manifest]!) as { name: string }).name : 'Greenhollow';
    return `<main class="wf-creation"><p class="wf-overline">Kyr · A persistent fantasy world</p><h1>WAYFARER</h1>
      <p class="wf-lead">A company, a road, and what waits below.</p><p>Begin in ${Html.escape(name)}. Your company’s bodies, possessions and discoveries persist when you leave a place. Choose three companions.</p>
      <div class="wf-create-party">${this.draft.map((p, i) => `<fieldset><legend>${['I', 'II', 'III'][i]} · Companion</legend>
        <label>Name<input id="name-${i}" value="${Html.escape(p.name)}" maxlength="40"></label>
        <label>Ancestry<select id="race-${i}">${Content.playableRaces.map(r => `<option ${r === p.raceId ? 'selected' : ''} value="${r}">${Html.escape(r)}</option>`).join('')}</select></label>
        <small>${Html.escape((Content.races[p.raceId!]! as { playerFeature?: string }).playerFeature ?? Content.races[p.raceId!]!.description)}</small>
        <label>Calling<select id="class-${i}">${Content.playableClasses.map(c => `<option ${c === p.classId ? 'selected' : ''} value="${c}">${Html.escape(Content.classes[c]!.name)}</option>`).join('')}</select></label>
        <small>${Html.escape(Content.classes[p.classId!]!.role)}</small>
        <label>Background<select id="background-${i}">${Object.entries(Content.backgrounds).map(([id, b]) => `<option ${id === p.backgroundId ? 'selected' : ''} value="${id}">${Html.escape(b.name)}</option>`).join('')}</select></label>
        <small>${Html.escape(Object.entries(Content.backgrounds).find(([id]) => id === p.backgroundId)?.[1].description ?? '')}</small></fieldset>`).join('')}</div>
      <label class="wf-seed">World seed<input id="seed" value="${Html.escape(this.seed)}"></label>
      ${this.button(this.pending ? 'Gathering your company…' : 'Begin the journey', 'start', undefined, 'wf-primary')}
      ${localStorage.getItem(this.key) ? this.button('Continue saved journey', 'resume') : ''}
      <label class="wf-file">Load save<input id="load" type="file" accept="application/json"></label>
      ${this.error ? `<p role="alert">${Html.escape(this.error)}</p>` : ''}</main>`;
  }
  private spatial(view: PlayerSnapshot): PlayerSnapshot['spatial'] {
    return view.spatial;
  }
  private game(view: PlayerSnapshot): string {
    const spatial = this.spatial(view);
    return `<div class="wf-game"><header class="wf-header"><strong>WAYFARER</strong><nav aria-label="World hierarchy">${spatial?.ancestry.map(p => `<span><small>${Html.escape(p.kind)}</small>${Html.escape(p.name)}</span>`).join('<b>›</b>') ?? `<span>${Html.escape(view.location?.zone ?? view.title)}</span>`}</nav><time>${FictionalTime.at(view.elapsed)}</time></header>
      <main class="wf-main" aria-busy="${this.pending}">${this.pending && !this.turn ? '<p class="wf-resolving" role="status">The company acts. Time passes…</p>' : ''}${this.turn ? this.combat() : this.mode === 'explore' ? this.scene(view) : this.panel(view)}</main>
      ${this.error ? `<p class="wf-error" role="alert">${Html.escape(this.error)}</p>` : ''}
      ${this.party(view)}<nav class="wf-dock" aria-label="Game modes">${[['explore', 'Explore'], ['inventory', 'Inventory'], ['party', 'Company'], ['journal', 'Journal'], ['map', 'Atlas'], ['system', 'Save / leave']].map(([id, name]) => this.button(name!, 'mode', id, this.mode === id ? 'active' : '')).join('')}</nav></div>`;
  }
  private scene(view: PlayerSnapshot): string {
    const spatial = this.spatial(view), present = view.present;
    const environment = view.location?.scene ?? (spatial?.ancestry.some(p => p.kind === 'level') ? 'dungeon' :
      spatial?.ancestry.some(p => p.kind === 'settlement') ? 'town' : 'wild');
    const focused = present.find(p => p.id === this.focus);
    const choices = this.focus ? this.related(view, this.focus) : view.choices.filter(c =>
      c.category !== 'travel' && !c.speaker && c.category !== 'gift'
      && c.interaction !== 'inventory' && c.interaction !== 'training' && c.interaction !== 'spell'
      && !c.targets?.some(id => present.some(p => p.id === id)));
    return `<section class="wf-scene ${environment}"><div class="wf-scene-title"><p class="wf-overline">${Html.escape(spatial?.ancestry.at(-1)?.kind ?? view.location?.scene ?? 'Place')} · ${spatial?.enteredFrom ? `Entered from ${Html.escape(spatial.enteredFrom.name)}` : 'Your company is here'}</p><h1>${Html.escape(view.location?.name ?? 'Journey')}</h1></div>
      <div class="wf-space" aria-label="Nearby people, objects and exits"><div class="wf-floor"><div class="wf-company-token" title="Your company">♜<span>Your company</span></div>
      <div class="wf-occupants">${present.map(p => `<button data-action="focus" data-id="${Html.escape(p.id)}" class="wf-token ${p.type === 'group' ? 'person' : 'object'} ${this.focus === p.id ? 'selected' : ''}"><span aria-hidden="true">${p.type === 'group' ? '♟' : p.type === 'source' ? '▤' : '◇'}</span><strong>${Html.escape(p.name)}</strong><small>${p.state === 'dead' ? 'Dead' : p.type === 'group' ? 'Person / company' : p.intact === false ? 'Destroyed' : 'Within reach'}</small></button>`).join('')}</div></div>
      <div class="wf-exits">${spatial?.exits.length ? spatial.exits.map(e => this.exit(view, e)).join('') : view.choices.filter(c => c.category === 'travel').map(c => this.choice(c)).join('')}</div></div>
      <div class="wf-reading"><article class="wf-description">${view.party.length && view.party.every(m => m.hp <= 0) ? '<section class="wf-receipt"><h2>The company has fallen</h2><p>There is no living companion to continue. This history remains saved. Recovery does not undo death; you may export the record or create another company.</p></section>' : ''}${view.observations.map(o => `<p>${Html.escape(FictionalTime.prose(o.text))}</p>`).join('') || '<p>Look to the people, objects and exits around your company.</p>'}${this.receipt()}</article>
      <aside class="wf-interaction"><p class="wf-overline">${focused ? 'Within reach' : 'Around you'}</p><h2>${Html.escape(focused?.name ?? 'What will you do?')}</h2>
      ${focused?.type === 'group' && view.choices.some(c => c.speaker === focused.id) ? this.button('Speak with them', 'talk', focused.id, 'wf-primary') : ''}
      ${this.focus ? this.button('Look around', 'focus', '') : '<p class="wf-hint">Choose a person, object or exit in the space above. The diagram shows what is present, not tactical positions. Field abilities and healing are on Company.</p>'}
      <div class="wf-options">${choices.map(c => this.choice(c)).join('') || '<p>No further action is available with this object now.</p>'}</div></aside></div></section>`;
  }
  private exit(view: PlayerSnapshot, exit: NonNullable<PlayerSnapshot['spatial']>['exits'][number]): string {
    const journey = ['travel', 'cross_plane'].includes(exit.mode);
    const action = exit.command ? journey ? 'journey' : 'command' : 'focus';
    const id = exit.command && journey ? exit.destination : exit.command ?? exit.id;
    const command = view.choices.find(c => c.id === exit.command);
    return `<button data-action="${action}" data-id="${Html.escape(id)}" ${!exit.available || !exit.command || this.pending ? 'disabled' : ''} class="wf-exit ${exit.mode}"><small>${this.transition(exit.mode)}</small><strong>${Html.escape(exit.name)}</strong><span>${Html.escape(exit.available ? command ? FictionalTime.duration(command.time) : 'Passable' : exit.reason ?? 'Blocked')}${exit.barrier ? ` · ${Html.escape(exit.barrier)}` : ''}</span></button>`;
  }
  private transition(kind: string): string {
    return ({ walk: 'Move locally', enter: 'Enter building', leave: 'Step outside', descend: 'Descend', ascend: 'Ascend', travel: 'Travel overland', cross_plane: 'Cross planes' } as Record<string, string>)[kind] ?? kind.replaceAll('_', ' ');
  }
  private related(view: PlayerSnapshot, id: string): PublicChoice[] {
    return view.choices.filter(c => c.speaker === id || c.targets?.includes(id));
  }
  private receipt(): string {
    return this.feedback ? `<section class="wf-receipt" role="status"><small>${Html.escape(this.feedback.attempt)} · ${this.feedback.time}</small><p>${Html.escape(this.feedback.result)}</p>${[...this.feedback.resources, ...this.feedback.discoveries].map(t => `<p class="wf-change">${Html.escape(t)}</p>`).join('')}${this.feedback.observations.map(t => `<p class="wf-notice">${Html.escape(t)}</p>`).join('')}${this.feedback.available.length ? `<small>New possibilities: ${Html.escape(this.feedback.available.slice(0, 3).join(' · '))}</small>` : ''}${this.feedback.immediate.length ? `<details><summary>Resolution details</summary>${Html.list(this.feedback.immediate.map(t => Html.escape(t)))}</details>` : ''}</section>` : '';
  }
  private panel(view: PlayerSnapshot): string {
    let body = '';
    if (this.mode === 'conversation') {
      const person = view.present.find(p => p.id === this.focus);
      body = `<p class="wf-overline">Conversation · ${Html.escape(view.location?.name)}</p><h1>${Html.escape(person?.name ?? 'No one here')}</h1><div class="wf-dialogue-silhouette" aria-hidden="true">♟</div>${this.feedbackSpeaker === this.focus ? this.receipt() : ''}<h2>Ask or respond</h2>${view.choices.filter(c => c.speaker === this.focus).map(c => this.choice(c)).join('') || '<p>No further topic is available here.</p>'}`;
    } else if (this.mode === 'travel') {
      const route = view.spatial?.exits.find(e => e.destination === this.focus);
      const command = view.choices.find(c => c.id === route?.command);
      body = `<p class="wf-overline">${route?.mode === 'cross_plane' ? 'Planar threshold' : 'Regional travel'}</p><h1>${Html.escape(route?.name ?? 'The onward road')}</h1><div class="wf-road" aria-hidden="true">⌁</div><p>Leave ${Html.escape(view.location?.name)} and travel to ${Html.escape(route?.name)}.</p><p>${command ? `${FictionalTime.duration(command.time)} will pass. The same persistent world continues while the company travels.` : 'This route is not available now.'}</p>${command ? this.choice(command) : ''}`;
    } else if (this.mode === 'inventory') {
      body = `<h1>Inventory & equipment</h1><p>${(view.resources ?? []).map(r => `${Html.escape(r.name)}: ${r.amount}`).join(' · ')}</p><div class="wf-item-grid">${(view.items ?? []).map(i => `<article><span class="wf-item-icon">◇</span><h2>${Html.escape(i.name)}</h2><small>${Html.escape(i.owner)} · ${i.equipped ? 'Equipped' : 'Carried'}${i.slot ? ` · ${Html.escape(i.slot)}` : ''}</small><p>${Html.escape(i.description)}</p><small>${Html.escape(i.effects.join(' · '))}</small></article>`).join('') || '<p>No individual items carried.</p>'}</div><h2>Use, equip or trade</h2>${view.choices.filter(c => c.interaction === 'inventory').map(c => this.choice(c)).join('')}${this.receipt()}`;
    } else if (this.mode === 'party') {
      body = `<h1>The company</h1>${view.party.map(m => `<article class="wf-character"><h2>${Html.escape(m.name)} <small>Level ${m.level} ${Html.escape(m.raceId)} ${Html.escape(Object.entries(Content.classes).find(([id]) => id === m.classId)?.[1].name ?? m.classId)}</small></h2><p>${m.hp}/${m.maxHp} HP · ${m.mana}/${m.maxMana} mana · ${m.gold} coin · ${m.experience} experience</p><p>${Html.escape(m.conditions.join(', ') || 'No persistent conditions')}</p>${Html.list((m.abilities ?? []).map(id => { const a = Content.abilities.find(a => a.id === id); return `<strong>${Html.escape(a?.name ?? id)}</strong> · ${a?.cost ?? 0} mana<small>${Html.escape(a?.description ?? '')}</small>`; }))}</article>`).join('')}<h2>Field care & training</h2>${view.choices.filter(c => c.category === 'care' || c.interaction === 'training' || c.interaction === 'spell').map(c => this.choice(c)).join('')}${this.receipt()}`;
    } else if (this.mode === 'journal') {
      body = `<h1>Journal</h1><h2>Established discoveries</h2>${Html.list(view.knowledge.map(k => Html.escape(k.text)), 'Nothing established yet.')}<h2>Believed but uncertain</h2>${Html.list(view.assumptions.map(k => Html.escape(k.text)), 'No recorded assumptions.')}<h2>Chronicle</h2>${Html.list(PlayerView.chronicle(this.session!.campaign).slice(-24).reverse().map(e => `<small>${FictionalTime.at(e.at)}</small>${Html.escape(e.text)}`))}`;
    } else if (this.mode === 'map') {
      body = `<h1>Atlas of your journeys</h1><p>Recorded places and known entrances. Undiscovered passages remain absent. Travel is undertaken through the exits of your current scene.</p><div class="wf-atlas">${view.map.places.map(p => `<article class="${p.id === view.location?.id ? 'here' : ''}"><small>${Html.escape(p.zone ?? p.scene ?? 'Place')} · ${p.visited ? 'Explored' : 'Unexplored entrance'}</small><h2>${Html.escape(p.name)}</h2>${view.map.links.filter(l => l.from === p.id).map(l => `<p>→ ${Html.escape(view.map.places.find(p => p.id === l.to)?.name ?? 'Unknown')}<small>${Html.escape(l.status)}</small></p>`).join('')}</article>`).join('')}</div>`;
    } else {
      body = `<h1>Your persistent journey</h1><p>Saved automatically after each completed action. Saving during an encounter is unavailable.</p>${this.button('Download save', 'save')}${this.button('Download replay', 'replay')}${this.button('Create another company', 'new')}<p>Seed: ${Html.escape(this.session!.seed)}</p><a href="workbench.html">Developer workbench</a>`;
    }
    return `<section class="wf-panel">${this.button('← Return to surroundings', 'mode', 'explore')} ${body}</section>`;
  }
  private combat(): string {
    const { battle } = this.turn!, state = battle.state, actor = state.combatants.find(f => f.id === state.actor)!;
    const choices = CombatChoices.actions(battle.legalCommands(), Content.abilities);
    const selected = choices.find(c => c.ability.id === this.turn!.selected);
    return `<section class="wf-battle"><p class="wf-overline">Encounter · turn ${state.turn}</p><h1>Stand your ground</h1><div class="wf-enemies">${state.combatants.filter(f => f.team !== 'fighters').map(f => `<article class="${f.hp <= 0 ? 'fallen' : ''}"><span aria-hidden="true">♜</span><h2>${Html.escape(f.name)}</h2><meter min="0" max="${f.maxHp}" value="${f.hp}" aria-label="${Html.escape(f.name)} health"></meter><p>${f.hp}/${f.maxHp} HP</p><small>${Html.escape(f.statuses.map(s => s.id).join(' · '))}</small></article>`).join('')}</div><div class="wf-battle-log" aria-live="polite">${battle.events.slice(-6).map(e => `<p>${Html.escape(CombatPresenter.format(e, state))}</p>`).join('') || '<p>The encounter begins. Choose an ability, then its target.</p>'}</div><div class="wf-battle-commands"><h2>${Html.escape(actor.name)} · ${selected ? `Target for ${Html.escape(selected.ability.name)}` : 'Choose an action'}</h2>${selected ? selected.commands.map(c => this.button(state.combatants.find(f => f.id === c.target)!.name, 'target', c.target)).join('') + this.button('Back', 'ability', '') : choices.map(c => `<button data-action="ability" data-id="${c.ability.id}"><strong>${Html.escape(c.ability.name)}</strong><small>${c.ability.cost} mana · ${c.ability.cooldown} turn cooldown</small><span>${Html.escape(c.ability.description ?? '')}</span></button>`).join('')}${this.button('Take one suggested action', 'tactics')}</div></section>`;
  }
  private party(view: PlayerSnapshot): string {
    return `<section class="wf-party" aria-label="Your company">${view.party.map(m => {
      const f = this.turn?.battle.state.combatants.find(f => f.id === m.id);
      const hp = f?.hp ?? m.hp, mana = f?.mana ?? m.mana;
      return `<button data-action="mode" data-id="party" ${this.pending ? 'disabled' : ''} class="${hp <= 0 ? 'fallen' : ''}"><span class="wf-portrait" aria-hidden="true">♟</span><span><strong>${Html.escape(m.name)}</strong><small>${Html.escape(Object.entries(Content.classes).find(([id]) => id === m.classId)?.[1].name ?? m.classId)} · ${hp}/${m.maxHp} HP · ${mana}/${m.maxMana} MP</small><meter min="0" max="${m.maxHp}" value="${hp}" aria-label="${Html.escape(m.name)} health"></meter></span></button>`;
    }).join('')}</section>`;
  }
  private choice(c: PublicChoice): string {
    return `<button class="wf-choice" data-action="command" data-id="${Html.escape(c.id)}" ${this.pending ? 'disabled' : ''}><strong>${Html.escape(c.name)}</strong><small>${FictionalTime.duration(c.time)}${c.encounter ? ' · encounter' : ''}</small></button>`;
  }
  private button(label: string, action: string, id?: string, className = ''): string {
    return Html.button(label, action, { id, class: className, disabled: this.pending && !['ability', 'target', 'tactics'].includes(action) });
  }
}
