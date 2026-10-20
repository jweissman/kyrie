import { Html } from './html';
import { MonoRows, type Mode, type Row, type Talk } from './mono-rows';
import { MonoMap } from './mono-map';
import { MonoStrip } from './mono-strip';
import type { Act, CombatScreen, CombatantRow, LogEntry, MemberRow, Screen } from '../src/ui/screen-types';

export interface MonoState {
  mode: Mode; screen?: Screen; combat?: CombatScreen; rows: Row[]; row: number;
  menu: { trail: Act[]; cursor: number } | null; log: LogEntry[]; talk?: Talk; pending: boolean; error: string;
  chronicle: { at: string; text: string; detail: string[] }[]; narrow: boolean; history: boolean;
}

// Pure HTML for the game screen. Every interactive element carries data-* identifiers the controller and tests use.
export class MonoRender {
  static readonly tabs: [Mode, string, string][] = [['explore', 'E', 'Explore'], ['pack', 'I', 'Pack'],
    ['party', 'C', 'Company'], ['journal', 'J', 'Journal']];
  static frame(s: MonoState, body: string): string {
    const screen = s.screen;
    const path = screen?.path.slice(0, -1).map(p => `<span data-kind="${Html.escape(p.kind)}">${Html.escape(p.name)}</span>`).join('<i>›</i>') ?? '';
    return `<div class="mono-frame" data-mode="${s.mode}"${s.pending ? ' aria-busy="true"' : ''}>
<header class="bar top"><b class="brand">${Html.escape(screen?.title.split(' — ')[0] ?? 'Kyr')}</b><nav class="path" aria-label="Where you are">${path}</nav><time data-id="clock">${Html.escape(screen?.clock ?? '')}</time></header>
${body}
${s.mode === 'combat' ? '' : MonoStrip.render(s.log, s.history)}
<footer class="bar keys">${this.keys(s)}</footer>${s.error ? `<div class="toast" role="alert" data-id="error">${Html.escape(s.error)}</div>` : ''}</div>`;
  }
  private static keys(s: MonoState): string {
    if (s.mode === 'combat') {
      return `<span><kbd>↑↓</kbd>choose</span><span><kbd>⏎</kbd>act</span><span><kbd>Esc</kbd>back</span>${Html.button('Auto: one action', 'auto', { key: 't' }, '<kbd>T</kbd>')}`;
    }
    const tabs = this.tabs.map(([mode, key, label]) => Html.button(label, 'mode', { mode, key: key.toLowerCase(),
      class: s.mode === mode ? 'tab on' : 'tab' }, `<kbd>${key}</kbd>`)).join('');
    return `${tabs}<span class="hint"><kbd>↑↓</kbd>select <kbd>⏎</kbd>act <kbd>Esc</kbd>back</span>`;
  }
  static rows(s: MonoState, title: string): string {
    let group = '';
    const html = s.rows.map((r, i) => {
      const head = r.group !== group ? `<li class="group" role="presentation">${Html.escape(group = r.group)}</li>` : '';
      const selected = i === s.row;
      return `${head}<li><button type="button" class="row ${r.tone ?? ''}${selected ? ' sel' : ''}${r.blocked ? ' blocked' : ''}" data-action="row" data-row="${Html.escape(r.id)}" data-index="${i}" aria-current="${selected}">`
        + `<span class="n">${i < 9 ? i + 1 : ' '}</span><span class="g">${r.glyph}</span><span class="l">${Html.escape(r.label)}</span>`
        + `${r.note ? `<span class="note">${Html.escape(r.note)}</span>` : ''}</button></li>`;
    }).join('');
    return `<section class="pane rows" data-region="rows" aria-label="${Html.escape(title)}"><h2>${Html.escape(title)}</h2><ul role="list">${html || '<li class="empty">Nothing here.</li>'}</ul></section>`;
  }
  static menu(s: MonoState): string {
    const row = s.rows[s.row];
    if (!row) { return '<section class="pane menu" data-region="menu"><h2>—</h2></section>'; }
    const level = s.menu ? (s.menu.trail.at(-1)?.children ?? row.acts) : row.acts;
    const trail = [row.label, ...(s.menu?.trail.map(a => a.label) ?? [])];
    const acts = level.map((a, i) => `<li><button type="button" class="act${s.menu && i === s.menu.cursor ? ' sel' : ''}${a.risk ? ' risk' : ''}" data-action="act" data-act="${Html.escape(a.key)}"${a.command ? ` data-command="${Html.escape(a.command)}"` : ''} data-index="${i}">`
      + `${s.menu && i < 9 ? `<span class="n">${i + 1}</span>` : ''}<span class="l">${Html.escape(a.label)}</span><span class="note">${a.children ? '▸' : a.minutes ? MonoRows.minutes(a.minutes) : ''}${a.risk ? ' !' : ''}</span></button></li>`).join('');
    const blocked = !level.length ? `<p class="blocked-why" data-id="blocked">${Html.escape(row.blocked ?? 'Nothing you can do with this right now.')}</p>` : '';
    const about = row.about && !s.menu?.trail.length ? `<p class="about">${Html.escape(row.about)}</p>` : '';
    return `<section class="pane menu${s.menu ? ' open' : ''}" data-region="menu" aria-label="Actions"><h2>${trail.map(t => Html.escape(t)).join(' › ')}</h2>${about}${blocked}<ul role="list">${acts}</ul></section>`;
  }
  static title(name: string): string { return name.charAt(0).toUpperCase() + name.slice(1); }
  static place(screen: Screen): string {
    const here = screen.path.at(-1);
    const purpose = screen.objectives.map(o => `<p class="objective" data-id="objective">◆ ${Html.escape(o)}</p>`).join('');
    return `<section class="pane place" data-region="place"><h1 data-id="place">${Html.escape(this.title(screen.place.name))}</h1>`
      + `<p class="kind">${screen.path.slice(0, -1).reverse().slice(0, 2).map(p => Html.escape(p.name)).join(' · ') || Html.escape(here?.kind ?? '')}</p>${purpose}`
      + `<div class="prose">${screen.prose.map(p => `<p>${Html.escape(p)}</p>`).join('')}</div></section>`;
  }
  static log(log: LogEntry[], limit = 3): string {
    const entries = log.slice(-limit).reverse().map((e, i) => `<article class="entry tone-${e.tone}${i ? ' old' : ''}" data-id="log-entry">`
      + `<h3><span>${Html.escape(e.title)}</span><time>${Html.escape(e.at)}</time></h3>${e.lines.map(l => `<p>${Html.escape(l)}</p>`).join('')}</article>`).join('');
    return `<section class="pane log" data-region="log" aria-live="polite"><h2>Lately</h2>${entries || '<p class="empty">Your expedition begins at the river.</p>'}</section>`;
  }
  static party(screen: Screen, compact: boolean): string {
    return `<section class="pane party${compact ? ' compact' : ''}" data-region="party"><h2>Company</h2>${screen.party.map(m => this.member(m)).join('')}`
      + `<p class="purse" data-id="purse">${screen.purse.coin} coin · ${screen.purse.rations} ration${screen.purse.rations === 1 ? '' : 's'}`
      + `${screen.purse.other.map(o => ` · ${Html.escape(o)}`).join('')}`
      + `${screen.expedition.hungry ? ' · <b class="hungry">hungry</b>' : screen.expedition.nextMeal ? ` · eat by ${Html.escape(screen.expedition.nextMeal)}` : ''}`
      + ` · ${screen.expedition.daylight}</p></section>`;
  }
  static member(m: MemberRow): string {
    return `<div class="member${m.hp ? '' : ' dead'}" data-member="${Html.escape(m.id)}"><div class="who"><b>${Html.escape(m.name)}</b><span>${Html.escape(m.line)}</span></div>`
      + `${this.bar('HP', m.hp, m.maxHp, 'hp')}${m.maxMana ? this.bar('MP', m.mana, m.maxMana, 'mp') : ''}${this.slots(m)}`
      + `${m.conditions.length ? `<div class="cond">${m.conditions.map(c => Html.escape(c)).join(' · ')}</div>` : ''}</div>`;
  }
  // Spell slots by level: "Spells I ●●○ II ●", a filled pip for each slot not yet spent.
  static slots(m: { slots?: number[]; maxSlots?: number[] }): string {
    if (!m.maxSlots?.length) { return ''; }
    const levels = m.maxSlots.map((most, i) => `${['I', 'II', 'III', 'IV', 'V'][i] ?? i + 1} ${'●'.repeat(m.slots?.[i] ?? 0)}`
      + `${'○'.repeat(most - (m.slots?.[i] ?? 0))}`);
    return `<div class="meter slots" aria-label="Spell slots"><span class="k">Spells</span><span class="cells">${levels.join(' ')}</span></div>`;
  }
  static bar(label: string, value: number, max: number, kind: string): string {
    const cells = 10, filled = max ? Math.round((value / max) * cells) : 0;
    return `<div class="meter ${kind}" role="meter" aria-label="${label}" aria-valuenow="${value}" aria-valuemax="${max}"><span class="k">${label}</span><span class="cells">${'█'.repeat(filled)}<i>${'░'.repeat(cells - filled)}</i></span><span class="v">${value}/${max}</span></div>`;
  }
  static explore(s: MonoState): string {
    const screen = s.screen!;
    if (!screen.running) {
      return `<main class="screen explore"><section class="pane place"><h1>The company has fallen</h1><p>No companion survives. This history remains saved; start a new company from the Journal.</p>${Html.button('New company', 'new')}</section></main>`;
    }
    return `<main class="screen explore">${this.place(screen)}${this.rows(s, 'Ways and things')}${this.menu(s)}${MonoMap.pane(screen.chart, screen.map, screen.region)}${this.party(screen, true)}</main>`;
  }
  static talk(s: MonoState): string {
    const screen = s.screen!, talk = s.talk!;
    const person = screen.people.find(p => p.id === talk.person);
    const lines = talk.lines.map(l => `<div class="exchange"><p class="you">» ${Html.escape(l.topic)}</p><p class="reply">${Html.escape(l.reply)}</p></div>`).join('');
    return `<main class="screen talk"><section class="pane place conversation" data-region="conversation"><h1 data-id="speaker">${Html.escape(talk.name)}</h1>`
      + `<p class="kind">${Html.escape(person?.note ?? '')} · ${Html.escape(screen.place.name)}</p><div class="prose">${lines || '<p class="muted">They wait for you to speak.</p>'}</div></section>`
      + `${this.rows(s, 'Say')}${this.menu(s)}${MonoMap.pane(screen.chart, screen.map, screen.region)}${this.party(screen, true)}</main>`;
  }
  static combatant(c: CombatantRow): string {
    return `<div class="fighter${c.acting ? ' acting' : ''}${c.down ? ' down' : ''}" data-fighter="${Html.escape(c.id)}"><div class="who"><b>${c.acting ? '▶ ' : ''}${Html.escape(c.name)}</b><span>${Html.escape(c.line)}</span></div>`
      + `${this.bar('HP', c.hp, c.maxHp, 'hp')}${c.maxMana ? this.bar('MP', c.mana, c.maxMana, 'mp') : ''}${this.slots(c)}${c.statuses.length ? `<div class="cond">${c.statuses.map(x => Html.escape(x)).join(' · ')}</div>` : ''}</div>`;
  }
  static combat(s: MonoState): string {
    const c = s.combat!;
    const title = c.ours && !c.outcome ? `${c.actorName} acts — turn ${c.turn}` : c.outcome ? 'The fight is over' : `${c.actorName} moves…`;
    return `<main class="screen combat"><section class="pane foes" data-region="foes"><h2>Opposed</h2>${c.foes.map(f => this.combatant(f)).join('')}</section>`
      + `<section class="pane allies" data-region="allies"><h2>Your company</h2>${c.allies.map(f => this.combatant(f)).join('')}</section>`
      + `${this.rows(s, title)}${this.menu(s)}`
      + `<section class="pane log battle" data-region="battle-log" aria-live="polite"><h2>Blow by blow</h2>${c.exchanges.slice(-6).reverse().map((g, i) => `<div class="exchange${i ? ' old' : ''}">${g.map(l => `<p>${Html.escape(l)}</p>`).join('')}</div>`).join('')}</section></main>`;
  }
}
