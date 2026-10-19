import type { Battle } from '../src/battle';
import { Content } from '../src/content';
import { CombatChoices } from '../src/ui/combat-choices';
import { CombatPresenter } from '../src/ui/combat-presenter';
import type { ChronicleEntry, PlayerSnapshot } from '../src/presentation/player-view';
import { Html } from './html';

export interface CombatPrompt { battle: Battle; selected?: string }

// Renders only PlayerView output and the live encounter; never reads omniscient campaign state.
export class PlayView {
  static render(view: PlayerSnapshot, chronicle: ChronicleEntry[], combat: CombatPrompt | undefined,
    busy: boolean): string {
    return `<div class="play-grid">
      <section class="column">${this.situation(view)}${this.location(view)}${this.party(view)}</section>
      <section class="column">${combat ? this.combat(combat) : this.actions(view, busy)}</section>
      <section class="column chronicle">${this.chronicle(chronicle, view.elapsed)}</section>
    </div>`;
  }
  private static situation(view: PlayerSnapshot): string {
    const deadlines = view.deadlines.map(d => d.passed ?
      `<li class="passed">${Html.escape(d.pressure)} — reached at watch ${d.at}</li>` :
      `<li>${Html.escape(d.pressure)} — watch ${d.at} <span class="muted">(${d.at - view.elapsed} to go)</span></li>`);
    return `<div class="card"><h2>${Html.escape(view.title)}</h2>
      ${view.situations.map(s => `<p>${view.situations.length > 1 ? `<strong>${Html.escape(s.name)}.</strong> ` : ''}${Html.escape(s.description)}</p>`).join('')}
      <h3>Clock</h3><p class="clock">Watch ${view.elapsed}</p>
      ${view.deadlines.length ? `<h3>Deadlines</h3><ul>${deadlines.join('')}</ul>` : ''}
      ${view.running ? '' : '<p class="banner danger">Your party can no longer act. Kyr accepts no further commands.</p>'}
    </div>`;
  }
  private static location(view: PlayerSnapshot): string {
    const present = view.present.map(e => {
      const members = e.members?.map(m => `${m.name} (${m.raceId} ${m.classId})`).join(', ');
      const state = e.state ? ` <span class="tag danger">${e.state}</span>` : '';
      const intact = e.intact === false ? ' <span class="tag">destroyed</span>' : '';
      return `<strong>${Html.escape(e.name)}</strong> <span class="muted">${Html.escape(e.type)}</span>${state}${intact}`
        + (members ? `<br><span class="muted">${Html.escape(members)}</span>` : '');
    });
    return `<div class="card"><h2>${Html.escape(view.location?.name ?? 'Nowhere known')}</h2>
      ${view.observations.map(o => `<p class="observation">${Html.escape(o.text)}</p>`).join('')}
      <h3>Here</h3>${Html.list(present, 'Nobody and nothing else you can perceive.')}
      ${view.knowledge.length || view.assumptions.length ? `<h3>You know</h3>${Html.list(view.knowledge.map(k =>
        Html.escape(k.text)), 'Nothing recorded.')}${view.assumptions.length ? `<h3>You assume false</h3>${Html.list(
        view.assumptions.map(a => Html.escape(a.text)))}` : ''}` : ''}
    </div>`;
  }
  static party(view: PlayerSnapshot): string {
    const rows = view.party.map(m => [Html.escape(m.name), Html.escape(`${m.raceId} ${m.classId} ${m.level}`),
      `<span class="${m.hp === 0 ? 'danger' : m.hp < m.maxHp / 2 ? 'warn' : ''}">${m.hp}/${m.maxHp}</span>`,
      m.maxMana ? `${m.mana}/${m.maxMana}` : '—', String(m.gold), Html.escape(m.conditions.join(', ') || '—')]);
    return `<div class="card"><h2>Party</h2>${Html.table(['Name', 'Kind', 'HP', 'Mana', 'Coin', 'Conditions'], rows)}
      ${view.party.map(m => `<details><summary>${Html.escape(m.name)} — scores and abilities</summary>
      ${Html.list(Object.entries(m.attributes ?? {}).map(([key, value]) => `${Html.escape(key)}: ${value}`))}
      ${Html.list((m.abilities ?? []).map(id => {
        const a = Content.abilities.find(a => a.id === id)!;
        return `<strong>${Html.escape(a?.name ?? id)}</strong> · ${a?.cost ?? 0} mana · cooldown ${a?.cooldown ?? 0} turns<br>${Html.escape(a?.description ?? '')}`;
      }))}</details>`).join('')}
      <p class="muted small">Persistent conditions keep their remaining owner combat turns between encounters.
      Shelter recovery treats bleeding; poison needs cleansing. Encounter wards and combat cooldowns end when you leave combat.</p>
      <h3>Holdings</h3>${Html.list(view.holdings.map(h => `${Html.escape(h.text)}: <strong>${h.value}</strong>`), 'Nothing.')}
      ${view.facts.length ? `<h3>Your commitments and state</h3>${Html.list(view.facts.map(f => Html.escape(f)))}` : ''}
    </div>`;
  }
  private static actions(view: PlayerSnapshot, busy: boolean): string {
    const buttons = view.choices.map(c => Html.button(c.name, 'command', { id: c.id, disabled: busy || undefined,
      class: c.encounter ? 'choice encounter' : 'choice', title: c.description || c.name },
    c.encounter ? '<span class="tag danger">encounter</span> ' : '') + `<span class="muted small">${c.time} watch</span>`);
    return `<div class="card"><h2>What will you do?</h2>
      ${view.choices.length ? `<div class="choices">${buttons.map(b => `<div class="choice-row">${b}</div>`).join('')}</div>`
        : '<p class="muted">No legal commands.</p>'}
      <p class="muted small">Every listed command is legal right now according to Kyr. Each one advances the
        campaign clock by its duration, and every NPC gets one opportunity per elapsed watch, wherever you are.</p>
    </div>`;
  }
  static combat(prompt: CombatPrompt): string {
    const state = prompt.battle.state, actor = state.combatants.find(f => f.id === state.actor);
    const rows = state.combatants.map(f => [`${f.id === state.actor ? '▶ ' : ''}${Html.escape(f.name)}`,
      f.team === 'fighters' ? 'yours' : 'opposed', `<span class="${f.hp === 0 ? 'danger' : ''}">${f.hp}/${f.maxHp}</span>`,
      f.maxMana ? `${f.mana}/${f.maxMana}` : '—', Html.escape(f.statuses.map(s => `${s.id} (${s.remaining})`).join(', ') || '—')]);
    const choices = CombatChoices.actions(prompt.battle.legalCommands(), Content.abilities);
    const selected = choices.find(c => c.ability.id === prompt.selected);
    const controls = selected ? `<h3>${Html.escape(selected.ability.name)} — choose a target</h3><div class="choices">${
      selected.commands.map(c => Html.button(state.combatants.find(f => f.id === c.target)!.name, 'target',
        { target: c.target, class: 'choice' })).join('')}${Html.button('Back', 'ability', { ability: '', class: 'choice' })}</div>`
      : `<div class="choices">${choices.map(c => Html.button(c.ability.name, 'ability', { ability: c.ability.id,
        class: 'choice', title: Content.abilities.find(a => a.id === c.ability.id)?.description ?? c.scope }, '')
        + `<span class="muted small">${Html.escape(c.scope)}${c.ability.cost ? `, ${c.ability.cost} mana` : ''}</span>`
        + `<p class="hint">${Html.escape(c.ability.description ?? '')}</p>`)
        .map(b => `<div class="choice-row">${b}</div>`).join('')}</div>`;
    const log = prompt.battle.events.slice(-14).map(e => Html.escape(CombatPresenter.format(e, state)));
    return `<div class="card combat"><h2>Encounter — turn ${state.turn}</h2>
      ${Html.table(['Combatant', 'Side', 'HP', 'Mana', 'Statuses'], rows)}
      <h3>${Html.escape(actor?.name ?? '')} acts</h3>${controls}
      <div class="row">${Html.button('Let tactics choose this turn', 'auto-turn')}${Html.button('Auto-resolve encounter', 'auto-rest')}</div>
      <h3>Recent blows</h3>${Html.list(log, 'The encounter begins.')}
      <p class="muted small">Choose an action, then a target. Retreat leaves both sides' injuries intact.
        The whole encounter advances the world by ten minutes.</p>
    </div>`;
  }
  static chronicle(entries: ChronicleEntry[], elapsed: number): string {
    const items = [...entries].reverse().map(e => `<li class="entry ${e.kind}"><span class="watch">w${e.at}</span>
      <span class="who">${e.kind === 'player' ? 'You' : e.kind === 'npc' ? 'Seen' : e.kind === 'observation' ? 'Observed' : e.kind === 'discovery' ? 'Learned' : 'Clock'}</span>
      ${Html.escape(e.text)}${e.detail.length ? `<details><summary class="muted small">${e.detail.length} detail line(s)</summary>
      <ul class="small">${e.detail.map(d => `<li>${Html.escape(d)}</li>`).join('')}</ul></details>` : ''}</li>`);
    return `<div class="card"><h2>Chronicle</h2><p class="muted small">Recent first: what your party did, observed, and learned.
      Now: watch ${elapsed}.</p><ol class="log">${items.join('') || '<li class="muted">Nothing has happened yet.</li>'}</ol></div>`;
  }
}
