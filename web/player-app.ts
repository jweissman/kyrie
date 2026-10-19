import partyExamples from '../data/party-examples.json';
import { PlaySession, type CombatController } from '../src/session/play-session';
import { PlayerView, type PlayerSnapshot } from '../src/presentation/player-view';
import { ActionFeedbackView, type ActionFeedback } from '../src/presentation/action-feedback';
import { FictionalTime } from '../src/presentation/fictional-time';
import { Content, type CreatureGenerationContext } from '../src/content';
import { CombatChoices } from '../src/ui/combat-choices';
import { Tactics } from '../src/tactics';
import type { Battle } from '../src/battle';
import type { Command } from '../src/model';
import { Scenarios } from './scenarios';
import { PlayView } from './play-view';
import { Html } from './html';

interface Turn { battle: Battle; resolve: (command: Command) => void; selected?: string }
export class PlayerApp {
  private session?: PlaySession;
  private turn?: Turn;
  private panel = 'journey';
  private chosenSeed = 'orra';
  private draft = structuredClone(partyExamples.fellowship) as CreatureGenerationContext[];
  private error = '';
  private notice = '';
  private auto = false;
  private loading = false;
  private feedback?: ActionFeedback;
  private readonly key = 'kyrie.orra.player.v1';
  constructor(private readonly root: HTMLElement) {}
  async boot() {
    this.root.addEventListener('click', event => { void this.click(event); });
    this.root.addEventListener('change', event => { void this.change(event); });
    this.render();
  }
  private readonly controller: CombatController = battle => new Promise<Command>(resolve => {
    if (this.auto) { resolve(Tactics.choose(battle.state, battle.legalCommands())); return; }
    this.turn = { battle, resolve }; this.render();
  });
  private async click(event: Event) {
    const button = (event.target as HTMLElement).closest<HTMLElement>('[data-action]');
    if (!button || this.loading) { return; }
    this.error = ''; this.notice = '';
    try { await this.dispatch(button.dataset); }
    catch (error) { this.error = error instanceof Error ? error.message : String(error); }
    this.render();
    if (button.dataset.action === 'command') { this.root.querySelector<HTMLElement>('.feedback')?.focus(); }
  }
  private answer(command: Command) {
    const turn = this.turn;
    if (turn) { this.turn = undefined; turn.resolve(command); }
  }
  private creation(): CreatureGenerationContext[] {
    return [0, 1, 2].map(i => ({
      name: this.root.querySelector<HTMLInputElement>(`#name-${i}`)!.value.trim(),
      raceId: this.root.querySelector<HTMLSelectElement>(`#race-${i}`)!.value as CreatureGenerationContext['raceId'],
      classId: this.root.querySelector<HTMLSelectElement>(`#class-${i}`)!.value as CreatureGenerationContext['classId'],
    }));
  }
  private async dispatch(data: DOMStringMap) {
    if (this.session?.acting && !['ability', 'target', 'auto-turn', 'auto-rest'].includes(data.action!)) { return; }
    switch (data.action) {
      case 'start': {
        const seed = this.root.querySelector<HTMLInputElement>('#seed')?.value.trim() || 'orra';
        const party = this.creation(); this.draft = party; this.chosenSeed = seed; this.loading = true;
        this.render();
        try { this.session = await PlaySession.start('data/orra/play.campaign.json', seed, Scenarios.source(), party); }
        finally { this.loading = false; }
        this.panel = 'journey'; this.feedback = undefined; this.save(); window.scrollTo(0, 0); return;
      }
      case 'resume': {
        const stored = localStorage.getItem(this.key);
        if (!stored) { throw new Error('No saved journey in this browser.'); }
        this.session = PlaySession.resume(JSON.parse(stored)); this.panel = 'journey'; this.feedback = undefined;
        this.notice = 'Journey resumed with its people, injuries and discoveries intact.'; return;
      }
      case 'command': {
        const before = PlayerView.observe(this.session!.campaign);
        const pending = this.session!.perform(data.id!, this.controller); this.render();
        try {
          const event = await pending;
          this.feedback = ActionFeedbackView.read(this.session!.campaign, event, before); this.save();
        } finally { this.turn = undefined; this.auto = false; }
        return;
      }
      case 'ability': {
        if (!this.turn) { return; }
        const choice = CombatChoices.actions(this.turn.battle.legalCommands(), Content.abilities)
          .find(c => c.ability.id === data.ability);
        if (choice?.commands.length === 1) { this.answer(choice.commands[0]!); }
        else { this.turn.selected = data.ability || undefined; }
        return;
      }
      case 'target': {
        const command = this.turn?.battle.legalCommands()
          .find(c => c.ability === this.turn!.selected && c.target === data.target);
        if (command) { this.answer(command); } return;
      }
      case 'auto-rest': case 'auto-turn':
        this.auto = data.action === 'auto-rest';
        if (this.turn) { this.answer(Tactics.choose(this.turn.battle.state, this.turn.battle.legalCommands())); }
        return;
      case 'preset': this.preset(data.id!); return;
      case 'panel': this.panel = data.panel!; return;
      case 'save': this.save(); this.notice = 'Journey saved in this browser.'; return;
      case 'restart': {
        const s = this.session!;
        this.session = await PlaySession.start(s.scenario, s.seed, Scenarios.source(), s.transcript.party);
        this.panel = 'journey'; this.feedback = undefined; this.save(); return;
      }
      case 'onboarding': this.session = undefined; this.feedback = undefined; return;
      case 'export': this.download('orra.save.json', this.session!.checkpoint()); return;
      case 'replay': this.download('orra.replay.json', this.session!.transcript); return;
      case 'import': this.root.querySelector<HTMLInputElement>('#load')!.click(); return;
    }
  }
  private preset(id: string) {
    const choices = id === 'company' ? partyExamples.company : partyExamples.fellowship;
    choices.forEach((p, i) => {
      this.root.querySelector<HTMLInputElement>(`#name-${i}`)!.value = p.name;
      this.root.querySelector<HTMLSelectElement>(`#race-${i}`)!.value = p.raceId;
      this.root.querySelector<HTMLSelectElement>(`#class-${i}`)!.value = p.classId;
    });
    this.creationSummary();
  }
  private creationSummary() {
    const party = this.creation(); this.draft = party;
    const races = new Set(party.map(c => c.raceId));
    const benefit = ['human', 'elf', 'dwarf'].every(r => races.has(r as CreatureGenerationContext['raceId'])) ?
      'Free Fellowship: the refuge compact grants this human–elf–dwarf company a hearing.' :
      'No founding privilege. Evidence can still earn a hearing.';
    const ranger = party.some(c => c.classId === 'ranger') ?
      'A ranger can approach explicitly receptive wildlife without spending food.' :
      'Without a ranger, food, alternate routes or combat may resolve an animal blockade.';
    this.root.querySelector('#creation-summary')!.textContent = `${benefit} ${ranger}`;
    party.forEach((p, i) => {
      const cls = Content.classes[p.classId!];
      this.root.querySelector(`#role-${i}`)!.textContent = cls!.role;
    });
  }
  private async change(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.id === 'seed') { this.chosenSeed = input.value; return; }
    if (input.id.startsWith('name-') || input.id.startsWith('race-') || input.id.startsWith('class-')) { this.creationSummary(); return; }
    if (input.id !== 'load' || !input.files?.[0] || this.session?.acting) { return; }
    try {
      const value = JSON.parse(await input.files[0].text());
      if ('save' in value) { this.session = PlaySession.resume(value); }
      else {
        const session = await PlaySession.start(value.scenario, value.seed, Scenarios.source(), value.party);
        await session.replay(value.steps); this.session = session;
      }
      this.panel = 'journey'; this.feedback = undefined; this.save();
    } catch (error) { this.error = String(error); }
    this.render();
  }
  private save() {
    if (this.session && !this.session.acting) {
      localStorage.setItem(this.key, JSON.stringify(this.session.checkpoint()));
    }
  }
  private download(name: string, value: unknown) {
    const url = URL.createObjectURL(new Blob([JSON.stringify(value)], { type: 'application/json' }));
    const link = document.createElement('a'); link.href = url; link.download = name; link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  private onboarding(): string {
    const races = Content.playableRaces;
    const classes = Content.playableClasses;
    const initial = this.draft.map(c => [c.name, c.raceId, c.classId]);
    return `<main class="welcome"><p class="eyebrow">A frontier company</p><h1>Who comes to Saint Orra?</h1>
      <p>You arrive at a refuge where a worker is accused of poisoning the spring. A healer has vanished beneath
      the old watchtower. You can investigate, venture underground, help whom you choose—or walk away.</p>
      <p>Prepare three level-two companions. Ancestry affects company identity; class provides abilities and resources.
      Any listed ancestry can take any listed class in this campaign. Your choices change your company’s opportunities.</p>
      <div class="row">${Html.button('Use Fellowship example', 'preset', { id: 'fellowship' })}
      ${Html.button('Use hired company example', 'preset', { id: 'company' })}</div>
      <div class="creator">${initial.map((p, i) => `<section class="card"><h2>Companion ${i + 1}</h2>
      <label>Name <input id="name-${i}" value="${p[0]}" maxlength="40" required></label>
      <label>Ancestry <select id="race-${i}">${races.map(r => `<option value="${r}" ${r === p[1] ? 'selected' : ''}>${Content.races[r]!.name}</option>`).join('')}</select></label>
      <label>Class <select id="class-${i}">${classes.map(c => `<option value="${c}" ${c === p[2] ? 'selected' : ''}>${Content.classes[c]!.name}</option>`).join('')}</select></label>
      <p id="role-${i}">${Content.classes[p[2] as keyof typeof Content.classes]!.role}</p></section>`).join('')}</div>
      <p id="creation-summary" class="banner">Free Fellowship: this human–elf–dwarf company can request a hearing.
      Your ranger can approach receptive wildlife. Your cleric can heal in the field.</p>
      <label>World seed <input id="seed" value="${Html.escape(this.chosenSeed)}"></label>
      ${Html.button(this.loading ? 'Preparing your company…' : 'Begin the journey', 'start', { disabled: this.loading })}
      <p>Time begins at 8 a.m. Reading the scene, journal and party sheet is free. Listed actions show their duration.
      Rest takes six hours; people and dangers continue while you sleep. Your choices and generated scores are saved.</p>
      <div class="row">${Html.button('Resume saved journey', 'resume')}${Html.button('Load save or replay', 'import')}</div></main>`;
  }
  private feedbackView(): string {
    const f = this.feedback;
    if (!f) { return ''; }
    return `<section class="card feedback" aria-live="polite" tabindex="-1"><p class="eyebrow">${Html.escape(f.time)}</p>
      <h2>${Html.escape(f.attempt)}</h2><p>${Html.escape(f.result)}</p>
      ${f.resources.length ? `<h3>Supplies</h3>${Html.list(f.resources.map(Html.escape))}` : ''}
      ${f.discoveries.length ? `<h3>You learned</h3>${Html.list(f.discoveries.map(Html.escape))}` : ''}
      ${f.immediate.length ? `<details${f.immediate.length <= 8 ? ' open' : ''}><summary>Resolution (${f.immediate.length} events)</summary>${Html.list(f.immediate.map(Html.escape))}</details>` : ''}
      ${f.observations.length ? `<details><summary>What you notice afterward</summary>${Html.list(f.observations.map(Html.escape))}</details>` : ''}
      ${f.available.length ? `<h3>Now possible here</h3>${Html.list(f.available.map(Html.escape))}` : ''}
      ${f.unavailable.length ? `<details><summary>No longer available here</summary>${Html.list(f.unavailable.map(Html.escape))}</details>` : ''}
      </section>`;
  }
  private choices(view: PlayerSnapshot, category: string, title: string): string {
    const choices = view.choices.filter(c => c.category === category);
    if (!choices.length) { return ''; }
    return `<section class="action-group"><h2>${title}</h2><div class="choices">${choices.map(c =>
      `<div>${Html.button(c.name, 'command', { id: c.id, class: 'choice', disabled: this.session?.acting })}
      <p class="hint">${FictionalTime.duration(c.time)}${c.description ? ` · ${Html.escape(c.description)}` : ''}</p></div>`).join('')}</div></section>`;
  }
  private journey(view: PlayerSnapshot): string {
    return `<div class="journey"><article class="scene"><p class="eyebrow">${FictionalTime.at(view.elapsed)}</p>
      <h1>${Html.escape(view.location?.name ?? 'The frontier')}</h1>${this.feedbackView()}
      <section class="scene-prose">${view.observations.map(o => `<p>${Html.escape(FictionalTime.prose(o.text))}</p>`).join('')}</section>
      <section class="presence"><h2>People and things here</h2>${Html.list(view.present.map(p =>
        `${Html.escape(p.name)}${p.state ? ` — ${p.state}` : ''}${p.intact === false ? ' — destroyed' : ''}`))}</section>
      ${this.choices(view, 'conversation', 'Speak and respond')}${this.choices(view, 'investigate', 'Investigate')}
      ${view.choices.some(c => c.category === 'gift') ? `<details><summary>Offer food or coin</summary>
      <p>Gifts transfer belongings. They create no obligation to help you.</p>${this.choices(view, 'gift', 'Give a gift')}</details>` : ''}
      ${this.choices(view, 'reward', 'Learn and prepare')}${this.choices(view, 'interact', 'Act on the scene')}
      ${this.choices(view, 'travel', 'Where will you go?')}
      ${view.map.links.some(l => l.from === view.location?.id && l.status === 'blocked from here') ?
        `<p class="muted">Blocked from here: ${view.map.links.filter(l => l.from === view.location?.id
          && l.status === 'blocked from here').map(l => Html.escape(view.map.places.find(p => p.id === l.to)?.name)).join(', ')}.
        The scene describes visible barriers and people who may grant passage.</p>` : ''}
      <details><summary>Care, recovery and waiting</summary>${this.choices(view, 'care', 'Care for the company')}
      ${this.choices(view, 'wait', 'Let time pass')}</details>
      ${view.choices.some(c => c.encounter) ? `<details class="danger"><summary>Use force</summary>
      <p>Combat can permanently kill companions and inhabitants. It will not establish whether an accusation is true.</p>
      ${this.choices(view, 'combat', 'Choose an opponent')}</details>` : ''}
      ${view.running ? '' : '<p class="danger">Nobody in the company can act. You can still read, save or restart.</p>'}
      </article><aside class="company-strip"><h2>Your company</h2>${Html.list((view.resources ?? []).map(r => `${Html.escape(r.name)}: ${r.amount}`))}${view.party.map(p =>
      `<p><strong>${Html.escape(p.name)}</strong><br>${p.hp}/${p.maxHp} health · ${p.mana}/${p.maxMana} mana
      ${p.conditions.length ? `<br>${Html.escape(p.conditions.join(', '))}` : ''}</p>`).join('')}
      <h3>Active advantages</h3>${Html.list((view.capabilities ?? []).map(c =>
        `${Html.escape(c.name)} — ${Html.escape(c.providers.join(', '))}`), 'No company advantage is currently active.')}
      <p>Reading costs no time. A safe shelter and ration permit recovery. Discoveries stay in your journal.</p></aside></div>`;
  }
  private journal(view: PlayerSnapshot): string {
    const entries = PlayerView.chronicle(this.session!.campaign).slice().reverse();
    return `<div class="journal"><h1>Your journal</h1><h2>Established discoveries</h2>
      ${Html.list(view.knowledge.map(k => Html.escape(k.text)), 'You have not yet examined evidence or received testimony.')}
      <h2>What the company experienced</h2>${entries.map(e => `<section class="card"><p class="eyebrow">${FictionalTime.at(e.at)} · ${e.kind === 'npc' ? 'Witnessed' : e.kind === 'discovery' ? 'Learned' : e.kind === 'player' ? 'Your action' : 'Observed'}</p>
      <p>${Html.escape(FictionalTime.prose(e.text))}</p>${e.detail.length ? `<details><summary>Details</summary>${Html.list(e.detail.map(Html.escape))}</details>` : ''}</section>`).join('')}</div>`;
  }
  private party(view: PlayerSnapshot): string {
    return `<div class="journal"><h1>Your company</h1>
      ${Html.list((view.resources ?? []).map(r => `${Html.escape(r.name)}: ${r.amount}`))}
      ${view.carried?.length ? `<p>Carrying: ${view.carried.map(r => Html.escape(r.name)).join(', ')}</p>` : ''}
      ${Html.list((view.capabilities ?? []).map(c => `${Html.escape(c.name)} — ${Html.escape(c.providers.join(', '))}`))}
      ${view.party.map(p => `<section class="card"><h2>${Html.escape(p.name)}</h2>
      <p>${Html.escape(p.raceId)} ${Html.escape(Content.classes[p.classId as keyof typeof Content.classes]?.name ?? p.classId)} · level ${p.level} · ${p.experience} experience</p>
      <p>${p.hp}/${p.maxHp} health · ${p.mana}/${p.maxMana} mana · ${p.gold} personal coins</p>
      ${Html.list(p.conditions.map(Html.escape), 'No persistent conditions.')}
      <details><summary>Ability scores</summary>${Html.list(Object.entries(p.attributes ?? {}).map(([k, n]) => `${k}: ${n}`))}</details>
      <h3>Abilities</h3>${Html.list((p.abilities ?? []).map(id => {
        const a = Content.abilities.find(a => a.id === id)!;
        const cost = p.hp === 0 ? 'Dead; cannot act.' : (a.cost ?? 0) > p.mana ? 'Not enough mana now.' : 'Enough mana.';
        return `<strong>${Html.escape(a.name)}</strong> · ${a.cost ?? 0} mana · ${a.cooldown ?? 0} turn cooldown.
          ${cost}<br>${Html.escape(a.description ?? '')}`;
      }))}</section>`).join('')}
      <p>Persistent conditions retain their remaining owner combat turns between encounters.
      Recovery treats bleeding; poison needs cleansing. Encounter wards and cooldowns reset when combat ends.
      Learning a reward spell is permanent. Experience is recorded; new capabilities come from permanent lessons in this campaign.</p></div>`;
  }
  private map(view: PlayerSnapshot): string {
    return `<div class="journal"><h1>Places and routes</h1><p>You know the places you visited and exits you saw there.
      A known place may still be inaccessible. Travel choices in the scene show routes you can take now.</p>
      ${Html.list(view.map.places.map(p => `${Html.escape(p.name)} — ${p.id === view.location?.id ? 'you are here' : p.visited ? 'visited' : 'seen from a nearby route'}`))}
      ${Html.list(view.map.links.map(l => `${Html.escape(view.map.places.find(p => p.id === l.from)?.name)} → ${Html.escape(view.map.places.find(p => p.id === l.to)?.name)} — ${Html.escape(l.status ?? 'known route')}`))}</div>`;
  }
  private render() {
    const s = this.session, view = s ? PlayerView.observe(s.campaign) : undefined;
    this.root.innerHTML = `<header><strong class="brand">Saint Orra · Ash and Silver</strong>
      ${s ? `<span>${FictionalTime.at(view!.elapsed)}</span><nav>${['journey', 'journal', 'party', 'map'].map(panel =>
        Html.button(panel, 'panel', { panel, disabled: s.acting, class: this.panel === panel ? 'active' : '' })).join('')}
        <details><summary>Journey options</summary>${s.acting ? '<p>Finish or retreat from the encounter before saving.</p>' : ''}${Html.button('Save', 'save', { disabled: s.acting })}${Html.button('Export save', 'export', { disabled: s.acting })}
        ${Html.button('Export replay', 'replay', { disabled: s.acting })}${Html.button('Restart same journey', 'restart', { disabled: s.acting })}
        ${Html.button('Create a new company', 'onboarding', { disabled: s.acting })}${Html.button('Load', 'import', { disabled: s.acting })}</details></nav>` : ''}</header>
      ${this.error ? `<p class="banner danger" role="alert">${Html.escape(this.error)}</p>` : ''}
      ${this.notice ? `<p class="banner" role="status">${Html.escape(this.notice)}</p>` : ''}
      ${!s ? this.onboarding() : this.turn ? `<main class="encounter-screen">${PlayView.combat(this.turn)}</main>` :
    `<main>${this.panel === 'party' ? this.party(view!) : this.panel === 'journal' ? this.journal(view!) :
      this.panel === 'map' ? this.map(view!) : this.journey(view!)}</main>`}
      <input type="file" id="load" accept="application/json,.json" hidden>
      <footer>Your journey is saved after each completed action. <a href="workbench.html">Developer workbench</a></footer>`;
    if (!s) { this.creationSummary(); }
  }
}
