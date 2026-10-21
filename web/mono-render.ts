import { Html } from './html';
import { FictionalTime } from '../src/presentation/fictional-time';
import { MonoMap } from './mono-map';
import { MonoStrip } from './mono-strip';
import type { Choice, Section } from '../src/ui/choice-list';
import type { CombatScreen, CombatantRow, LogEntry, MemberRow, Screen } from '../src/ui/screen-types';

export type Mode = 'title' | 'campaigns' | 'create' | 'explore' | 'pack' | 'party' | 'journal' | 'map' | 'combat';
export interface MonoState {
  mode: Mode; screen?: Screen; combat?: CombatScreen;
  // The choices on show: every section at the top level, or the list a choice opened (trail names the way in).
  sections: Section[]; level: Choice[]; trail: Choice[]; cursor: number;
  log: LogEntry[]; pending: boolean; error: string; history: boolean; narrow: boolean;
  chronicle: { at: string; text: string; detail: string[] }[];
}

// Pure HTML for the game screen. Every interactive element carries data-* identifiers the controller and tests use.
export class MonoRender {
  static readonly tabs: [Mode, string, string][] = [['explore', 'E', 'Explore'], ['pack', 'I', 'Pack'],
    ['party', 'C', 'Company'], ['journal', 'J', 'Journal'], ['map', 'M', 'Map']];
  static frame(s: MonoState, body: string): string {
    const screen = s.screen;
    const path = screen?.path.slice(0, -1).map(p => `<span data-kind="${Html.escape(p.kind)}">${Html.escape(p.name)}</span>`).join('<i>›</i>') ?? '';
    const clock = screen ? `${Html.escape(screen.clock)}<i>${FictionalTime.part(screen.elapsed)}</i>` : '';
    return `<div class="frame" data-mode="${s.mode}"${s.pending ? ' aria-busy="true"' : ''}>
<header class="bar top"><b class="brand">${Html.escape(screen?.title.split(' — ')[0] ?? 'Kyr')}</b><nav class="path" aria-label="Where you are">${path}</nav><time data-id="clock">${clock}</time></header>
${body}
${s.mode === 'combat' ? '' : MonoStrip.render(s.log, s.history)}
<footer class="bar keys">${this.keys(s)}</footer>${s.error ? `<div class="toast" role="alert" data-id="error">${Html.escape(s.error)}</div>` : ''}</div>`;
  }
  private static keys(s: MonoState): string {
    const hint = `<span class="hint"><kbd>↑↓</kbd>look <kbd>⏎</kbd>do <kbd>1–9</kbd>do at once <kbd>Esc</kbd>back</span>`;
    if (s.mode === 'combat') { return `${Html.button('Let them fight one turn on their own', 'auto', { key: 't' }, '<kbd>T</kbd>')}${hint}`; }
    const tabs = this.tabs.map(([mode, key, label]) => Html.button(label, 'mode', { mode, key: key.toLowerCase(),
      class: s.mode === mode ? 'tab on' : 'tab' }, `<kbd>${key}</kbd>`)).join('');
    return `${tabs}${hint}`;
  }
  // The list of things to do. Section headings say who or what the choices are about; each choice does what it says
  // (or opens a short list, marked ▸). The highlighted choice is explained underneath.
  static choices(s: MonoState, title: string, inline = false): string {
    const crumbs = s.trail.length ? `<p class="crumbs">${s.trail.map(c => Html.escape(c.label)).join(' › ')} <span class="muted">· Esc to go back</span></p>` : '';
    const counter = { n: 0 };
    const lists = s.trail.length ? `<ul role="list">${s.level.map(c => this.choice(c, s.cursor, counter)).join('')}</ul>`
      : s.sections.map(sec => `<li class="section ${sec.tone}" role="presentation"><span class="g">${sec.glyph}</span><b>${Html.escape(sec.title)}</b>${sec.note ? `<span class="note">${Html.escape(sec.note)}</span>` : ''}</li>`
        + (sec.about && sec.tone !== 'way' ? `<li class="look${sec.fresh ? ' new' : ''}" role="presentation">${sec.fresh ? '<b class="tag">new</b> ' : ''}${Html.escape(sec.about)}</li>` : '')
        + (sec.choices.length ? sec.choices.map(c => this.choice(c, s.cursor, counter)).join('') : '<li class="none">Nothing to do with them now.</li>')).join('');
    const chosen = s.level[s.cursor];
    const detail = chosen ? [chosen.disabled, chosen.about].filter(Boolean)[0] ?? '' : '';
    const body = s.trail.length ? lists : `<ul role="list">${lists || '<li class="none">Nothing to do here.</li>'}</ul>`;
    return `<section class="${inline ? '' : 'pane '}choices" data-region="choices" aria-label="${Html.escape(title)}"><h2>${Html.escape(title)}</h2>${crumbs}${body}`
      + `<p class="detail" data-id="detail">${Html.escape(detail)}</p></section>`;
  }
  // One choice as a button: its number (the first nine can be chosen with a digit), what it does, and its cost.
  static choice(c: Choice, cursor: number, counter: { n: number }): string {
    const i = counter.n++, sel = i === cursor, digit = i < 9 ? String(i + 1) : '';
    const note = c.disabled ? c.note ?? '' : [c.note, c.children ? '▸' : ''].filter(Boolean).join(' ');
    return `<li><button type="button" class="choice ${c.tone}${sel ? ' sel' : ''}${c.risk ? ' risk' : ''}${c.disabled ? ' disabled' : ''}" data-action="choice" data-choice="${Html.escape(c.id)}" data-index="${i}"${c.command ? ` data-command="${Html.escape(c.command)}"` : ''} aria-current="${sel}"${c.disabled ? ' aria-disabled="true"' : ''}>`
      + `<span class="n">${digit}</span><span class="l">${Html.escape(c.label)}</span><span class="note">${Html.escape(note)}${c.risk ? ' <b>!</b>' : ''}</span></button></li>`;
  }
  static title(name: string): string { return name.charAt(0).toUpperCase() + name.slice(1); }
  // Where the company stands: the place, what it is like now, what is in hand here, and what just happened.
  static scene(screen: Screen, last?: LogEntry): string {
    const where = screen.path.slice(0, -1).reverse().slice(0, 2).map(p => Html.escape(p.name)).join(' · ');
    const purpose = screen.objectives.map(o => `<p class="objective" data-id="objective">◆ ${Html.escape(o)}</p>`).join('');
    // What just happened, less anything the scene already says.
    const told = [...screen.prose, ...[...screen.people, ...screen.things].flatMap(t => t.says ?? [])];
    const lines = last?.lines.filter(l => !told.some(p => p.includes(l))) ?? [];
    const response = last && lines.length && !last.title.startsWith('→')
      ? `<div class="response tone-${last.tone}" data-id="response"><h3>${Html.escape(last.title)}</h3>${lines.slice(0, 8).map(l => `<p>${Html.escape(l)}</p>`).join('')}</div>` : '';
    // What has changed at a place the company has been before is marked, so a return reads as news.
    const prose = screen.prose.map(p => screen.fresh.includes(p)
      ? `<p class="new"><b class="tag">new</b> ${Html.escape(p)}</p>` : `<p>${Html.escape(p)}</p>`).join('');
    return `<section class="scene" data-region="scene"><h1 data-id="place">${Html.escape(this.title(screen.place.name))}</h1>`
      + `<p class="where">${where}</p>${purpose}`
      + `<div class="prose">${prose}</div>${response}</section>`;
  }
  static party(screen: Screen): string {
    const meal = screen.expedition.hungry ? '<b class="hungry">hungry</b>'
      : screen.expedition.nextMeal ? `eat by ${Html.escape(screen.expedition.nextMeal)}` : '';
    return `<section class="pane party" data-region="party"><h2>Company</h2>${screen.party.map(m => this.member(m)).join('')}`
      + `<p class="purse" data-id="purse">${screen.purse.coin} coin · ${screen.purse.rations} ration${screen.purse.rations === 1 ? '' : 's'}`
      + `${screen.purse.other.map(o => ` · ${Html.escape(o)}`).join('')}${meal ? ` · ${meal}` : ''}</p></section>`;
  }
  static member(m: MemberRow): string {
    return `<div class="member${m.hp ? '' : ' dead'}" data-member="${Html.escape(m.id)}"><div class="who"><b>${Html.escape(m.name)}</b><span>${Html.escape(m.line)} · ${m.level}</span></div>`
      + `${this.bar('HP', m.hp, m.maxHp, 'hp')}${m.maxMana ? this.bar('MP', m.mana, m.maxMana, 'mp') : ''}${this.slots(m)}`
      + `${m.conditions.length ? `<div class="cond">${m.conditions.map(c => Html.escape(c)).join(' · ')}</div>` : ''}`
      + `${m.boons?.length ? `<div class="boon">${m.boons.map(c => Html.escape(c)).join(' · ')}</div>` : ''}</div>`;
  }
  // Spell slots by level: "I ●●○ II ●", a filled pip for each slot not yet spent.
  static slots(m: { slots?: number[]; maxSlots?: number[] }): string {
    if (!m.maxSlots?.length) { return ''; }
    const levels = m.maxSlots.map((most, i) => `<span>${['I', 'II', 'III', 'IV', 'V'][i] ?? i + 1} ${'●'.repeat(m.slots?.[i] ?? 0)}`
      + `<i>${'○'.repeat(Math.max(0, most - (m.slots?.[i] ?? 0)))}</i></span>`);
    return `<div class="meter slots" aria-label="Spell slots"><span class="k">Spells</span><span class="cells">${levels.join(' ')}</span></div>`;
  }
  static bar(label: string, value: number, max: number, kind: string): string {
    const cells = 10, filled = max ? Math.round((value / max) * cells) : 0;
    const low = max && value / max <= 0.34 ? ' low' : '';
    return `<div class="meter ${kind}${low}" role="meter" aria-label="${label}" aria-valuenow="${value}" aria-valuemax="${max}"><span class="k">${label}</span><span class="cells">${'█'.repeat(filled)}<i>${'░'.repeat(cells - filled)}</i></span><span class="v">${value}/${max}</span></div>`;
  }
  static explore(s: MonoState): string {
    const screen = s.screen!;
    if (!screen.running) {
      return `<main class="screen fallen"><section class="pane scene"><h1>The company has fallen</h1><p>No companion survives. The history stays saved; a new company can set out from the title screen.</p>${Html.button('Begin again', 'new', { class: 'primary' })}</section></main>`;
    }
    // One column to read and act in (where you are, what just happened, what you can do), and one to keep your
    // bearings: the map and the company.
    return `<main class="screen explore"><section class="pane stage" data-region="stage">${this.scene(screen, s.log.at(-1))}`
      + `${this.choices(s, 'What will you do?', true)}</section><aside class="side">`
      + `${MonoMap.pane(screen.chart, screen.map, screen.region)}${this.party(screen)}</aside></main>`;
  }
  static combatant(c: CombatantRow): string {
    const statuses = c.down ? 'down' : [...new Set(c.statuses)].join(' · ');
    return `<div class="fighter${c.acting ? ' acting' : ''}${c.down ? ' down' : ''}" data-fighter="${Html.escape(c.id)}"><div class="who"><b>${c.acting ? '▶ ' : ''}${Html.escape(c.name)}</b><span>${Html.escape(c.line)}</span></div>`
      + `${this.bar('HP', c.hp, c.maxHp, 'hp')}${this.slots(c)}${statuses ? `<div class="cond">${Html.escape(statuses)}</div>` : ''}`
      + `${c.boons?.length && !c.down ? `<div class="boon">${Html.escape([...new Set(c.boons)].join(' · '))}</div>` : ''}`
      + `${c.intent && !c.down ? `<div class="intent">⚑ ${Html.escape(c.intent)}</div>` : ''}${c.defenses && !c.down ? `<div class="defenses">${Html.escape(c.defenses)}</div>` : ''}</div>`;
  }
  // A fight in its place: where it is, who stands on each side, whose turn it is, what they can do, and what just
  // happened, newest first.
  static combat(s: MonoState): string {
    const c = s.combat!, place = s.screen?.place.name;
    const turn = c.ours && !c.outcome ? `${c.actorName}'s turn` : c.outcome ? 'The fight is over' : `${c.actorName} acts…`;
    const scene = `<section class="pane scene battle" data-region="scene"><h1>${place ? `A fight at ${Html.escape(place)}` : 'A fight'}</h1>`
      + `${s.screen?.prose[0] ? `<p class="where">${Html.escape(s.screen.prose[0])}</p>` : ''}`
      + `<p class="stakes">Anyone brought to nothing must save against death. Withdrawing ends the fight for the whole company.</p></section>`;
    const order = c.order.length && !c.outcome ? `<p class="order" data-id="order">This round: ${c.order.map((n, i) => Html.escape(i ? n : `▶ ${n}`)).join(' · ')}</p>` : '';
    const sides = `<section class="pane sides" data-region="sides">${order}<h2>Against you</h2>${c.foes.map(f => this.combatant(f)).join('')}`
      + `<h2>Your company</h2>${c.allies.map(f => this.combatant(f)).join('')}</section>`;
    const log = `<section class="pane battle-log" data-region="battle-log" aria-live="polite"><h2>Blow by blow</h2>${c.exchanges.slice(-8).reverse().map((g, i) => `<div class="exchange${i ? ' old' : ''}">${g.map(l => `<p>${Html.escape(l)}</p>`).join('')}</div>`).join('')}</section>`;
    return `<main class="screen combat">${scene}${sides}${this.choices(s, turn)}${log}</main>`;
  }
}
