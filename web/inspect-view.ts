import type { Campaign } from '../src/campaign/campaign';
import type { GoalAssessment } from '../src/campaign/agency';
import { ModuleWriter } from '../src/lang/module-writer';
import { PlayerView } from '../src/presentation/player-view';
import type { PlaySession, TranscriptStep } from '../src/session/play-session';
import { Html } from './html';

export interface PinnedRun {
  label: string; scenario: string; seed: string; steps: TranscriptStep[]; elapsed: number;
  outcomes: Record<string, boolean>; developments: { id: string; elapsed: number }[]; alive: boolean;
}
export interface Explanation { actor: string; goals: GoalAssessment[]; selected: string | null }

// Omniscient GM/debug view. Everything here is authoritative engine state, deliberately not player-safe.
export class InspectView {
  static render(session: PlaySession, explanation: Explanation[] | undefined, runs: PinnedRun[],
    filter: string): string {
    const c = session.campaign;
    return `<p class="banner">Inspect mode shows authoritative state, including facts the player has not perceived.</p>
      ${this.run(session)}${this.modules(c)}${this.actors(c, explanation)}${this.compare(session, runs)}
      <details open class="card"><summary><h2>World facts</h2></summary>
        <input id="fact-filter" placeholder="filter, e.g. guard or quantity" value="${Html.escape(filter)}">
        <div id="facts">${this.facts(c, filter)}</div></details>
      ${this.creatures(c)}${this.events(c)}
      <details class="card"><summary><h2>Player view (what Play mode receives)</h2></summary>${Html.pre(PlayerView.observe(c))}</details>
      <details class="card"><summary><h2>Raw Kyr save</h2></summary>${Html.button('Render save JSON', 'show-save')}
        <div id="raw-save"></div></details>`;
  }
  private static run(session: PlaySession): string {
    const t = session.transcript;
    return `<details open class="card"><summary><h2>Run</h2></summary>
      ${Html.table(['Scenario', 'Seed', 'Watch', 'Commands', 'Transcript'], [[Html.escape(t.scenario), `<code>${Html.escape(t.seed)}</code>`,
        String(session.campaign.state.elapsed), String(t.steps.length), t.complete ? 'complete (replayable)' :
          '<span class="warn">incomplete: resumed from a bare save</span>']])}
      <div class="row">${Html.button('Pin this run for comparison', 'pin')}${Html.button('Copy transcript JSON', 'copy-transcript')}</div>
      <p class="muted small">Replay in the CLI: <code>bun run kyrie replay transcript.json</code> prints the same canonical state.</p>
      ${Html.pre(t.steps.map((s, i) => `${i + 1}. ${s.command}${s.combat ? `  [${s.combat.length} combat commands]` : ''}`)
        .join('\n') || '(no commands yet)')}</details>`;
  }
  private static modules(c: Campaign): string {
    const state = c.state, rows = (state.modules ?? []).map(m => [Html.escape(`${m.id}: ${m.name}`), String(m.installedAt),
      m.deadline === undefined ? '—' : String(m.deadline), m.outcome,
      Object.entries(m.outcomes).map(([id, on]) => `<span class="tag ${on ? 'on' : ''}">${Html.escape(id)}</span>`).join(' '),
      m.developments.map(d => `${Html.escape(d.id)}@${d.elapsed}`).join(', ') || '—']);
    return `<details open class="card"><summary><h2>Installed situations and outcomes</h2></summary>
      ${Html.table(['Situation', 'Installed', 'Deadline', 'Status', 'Outcome predicates (now)', 'First observed'], rows)}
      <p class="muted small">Outcome predicates are author-declared observations, not victory conditions; the campaign never ends
        on them.</p></details>`;
  }
  private static actors(c: Campaign, explanation: Explanation[] | undefined): string {
    const labels = new Map(c.module.actions.map(a => [a.id, a.name]));
    const npcs = c.actors.filter(a => !a.player).map(actor => {
      const goals = actor.goals.map(g => [Html.escape(g.id), `<code>${Html.escape(ModuleWriter.predicate(g.when))}</code>`,
        `<code>${Html.escape(ModuleWriter.predicate(g.target))}</code>`, String(g.priority),
        g.urgent ? `${g.urgent.priority} when <code>${Html.escape(ModuleWriter.predicate(g.urgent.when))}</code>` : '—']);
      const last = [...c.events].reverse().flatMap(e => (e.npc ?? []).filter(n => n.actor === actor.id)).slice(0, 4)
        .map(n => `w${n.elapsed ?? '?'} <strong>${Html.escape(n.goal)}</strong>: ${Html.escape(labels.get(n.action) ?? n.action)}
          <span class="muted small">plan: ${Html.escape(n.plan.join(' → '))}</span>`);
      const explained = explanation?.find(e => e.actor === actor.id);
      const next = explained ? Html.table(['Goal', 'Priority', 'Urgent', 'Applies', 'Satisfied', 'Plan found'],
        explained.goals.map(g => [`${g.id === explained.selected ? '▶ ' : ''}${Html.escape(g.id)}`, String(g.priority),
          g.urgent ? 'yes' : '', g.applicable ? 'yes' : 'no', g.satisfied ? 'yes' : 'no',
          g.plan === undefined ? '—' : g.plan === null ? '<span class="warn">none within horizon</span>' :
            Html.escape(g.plan.map(id => labels.get(id) ?? id).join(' → ') || '(already satisfied)')])) : '';
      return `<h3>${Html.escape(actor.id)} <span class="muted small">members ${Html.escape(actor.members.join(', '))};
        horizon ${actor.horizon}; may use ${Html.escape(actor.actions.join(', '))}</span></h3>
        ${Html.table(['Goal', 'When', 'Target', 'Priority', 'Urgent'], goals)}
        <h4>Recent decisions</h4>${Html.list(last, 'No actions taken yet.')}${next ? `<h4>Next opportunity (evaluated now)</h4>${next}` : ''}`;
    });
    return `<details open class="card"><summary><h2>NPC controllers</h2></summary>
      ${Html.button('Explain next NPC decisions', 'explain')}
      <p class="muted small">Explanation runs Kyr's Agency on the current world. The next real opportunity happens after the clock
        advances, so urgency thresholds can differ by one watch.</p>${npcs.join('') || '<p class="muted">No NPCs.</p>'}</details>`;
  }
  static facts(c: Campaign, filter: string): string {
    const needle = filter.trim().toLowerCase();
    const facts = c.world.describe().filter(f => !needle || f.toLowerCase().includes(needle));
    return `<p class="muted small">${facts.length} facts</p>${Html.pre(facts.join('\n'))}`;
  }
  private static creatures(c: Campaign): string {
    const owner = new Map(Object.entries(c.state.inhabitants).flatMap(([group, ids]) => ids.map(id => [id, group])));
    const rows = c.state.creatures.map(k => [Html.escape(k.id), Html.escape(k.name), Html.escape(owner.get(k.id) ?? '—'),
      Html.escape(`${k.raceId} ${k.classId}`), `${k.state.hp}/${k.base.maxHp}`, `${k.state.mana}/${k.base.maxMana}`,
      String(k.state.gold), Html.escape(k.state.conditions.map(s => `${s.id}(${s.remaining})`).join(', ') || '—'),
      Html.escape(k.base.abilities.join(', '))]);
    return `<details class="card"><summary><h2>Creatures</h2></summary>
      ${Html.table(['ID', 'Name', 'Group', 'Kind', 'HP', 'Mana', 'Coin', 'Conditions', 'Abilities'], rows)}</details>`;
  }
  private static events(c: Campaign): string {
    const labels = new Map(c.module.actions.map(a => [a.id, a.name]));
    const items = c.events.map((e, i) => `<li><strong>#${i + 1} → w${e.elapsed}</strong> ${Html.escape(e.action)}
      (${e.result})${e.combat.length ? `, ${e.combat.length} combat events` : ''}
      ${(e.npc ?? []).map(n => `<div class="small">NPC ${Html.escape(n.actor)} [${Html.escape(n.goal)}] w${n.elapsed ?? '?'}:
        ${Html.escape(labels.get(n.action) ?? n.action)} <code>${Html.escape((n.changes ?? []).join('  '))}</code></div>`).join('')}
      <details><summary class="small muted">merged state diff (${e.changes.length})</summary>${Html.pre(e.changes.join('\n'))}</details></li>`);
    return `<details class="card"><summary><h2>Event history</h2></summary><ol class="log">${items.reverse().join('')}</ol></details>`;
  }
  private static compare(session: PlaySession, runs: PinnedRun[]): string {
    const current = InspectView.pinned(session, 'current');
    const all = [...runs, current];
    const ids = [...new Set(all.flatMap(r => Object.keys(r.outcomes)))];
    const rows = [['watch', ...all.map(r => String(r.elapsed))], ['party alive', ...all.map(r => r.alive ? 'yes' : 'no')],
      ...ids.map(id => [Html.escape(id), ...all.map(r => this.cell(r, id))])];
    const headers = ['', ...all.map((r, i) => `${r.label}${i < runs.length ? '' : ' (live)'}`)];
    return `<details open class="card"><summary><h2>Compare runs</h2></summary>
      ${Html.table(headers, rows.map(r => [`<strong>${r[0]}</strong>`, ...r.slice(1)]))}
      <div class="row">${runs.map((r, i) => Html.button(`Replay “${r.label}”`, 'replay-run', { index: i })
        + Html.button('×', 'unpin', { index: i, title: 'Forget this pinned run' })).join(' ')}</div>
      <p class="muted small">“yes @n” is true now and first observed at watch n; “was @n” held at watch n but no longer does.</p>
    </details>`;
  }
  private static cell(run: PinnedRun, id: string): string {
    const seen = run.developments.find(d => d.id === id);
    return run.outcomes[id] ? `<span class="tag on">yes</span>${seen ? ` @${seen.elapsed}` : ''}` :
      seen ? `<span class="tag">was</span> @${seen.elapsed}` : '—';
  }
  static pinned(session: PlaySession, label: string): PinnedRun {
    const s = session.campaign.state, t = session.transcript;
    return { label, scenario: t.scenario, seed: t.seed, steps: t.steps, elapsed: s.elapsed,
      outcomes: s.outcomes ?? {}, developments: s.developments ?? [], alive: session.campaign.running };
  }
}
