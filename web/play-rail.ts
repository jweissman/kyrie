import { Html } from './html';
import { PlayMap } from './play-map';
import type { PlayState } from './play-types';
import type { CombatantRow, MemberRow, Screen } from '../src/ui/screen-types';
import type { Counter } from '../src/ui/trade-model';

type Row = Pick<MemberRow, 'id' | 'name' | 'line' | 'hp' | 'maxHp' | 'slots' | 'maxSlots' | 'conditions' | 'boons'>
  & { acting?: boolean; level?: number };

// The rail keeps the company in view whatever the page shows, and beside it what the moment needs: the map and the
// road while exploring, a merchant's counter where there is trade, the foes and what each means to do in a fight.
export class PlayRail {
  static render(s: PlayState): string {
    const screen = s.screen;
    if (s.mode === 'combat' && s.combat) {
      const c = s.combat;
      return `<aside class="rail" data-region="rail">${this.company(c.allies.map(a => ({ ...a, conditions: a.statuses })),
        screen)}<section class="panel foes" data-region="foes"><h2>Against you</h2>`
        + `${c.foes.map(f => this.foe(f)).join('')}</section></aside>`;
    }
    if (!screen) { return '<aside class="rail"></aside>'; }
    const trade = screen.trade.length ? `<section class="panel counter" data-region="counter"><h2>At the counter</h2>`
      + `${screen.trade.map(t => this.counter(t)).join('')}</section>` : '';
    // The full map is the page itself in the map view; the rail does not draw it twice.
    const map = s.mode === 'map' ? '' : PlayMap.pane(screen.chart, screen.map, screen.region);
    return `<aside class="rail" data-region="rail">${this.company(screen.party, screen)}${trade}${map}${this.road(screen)}</aside>`;
  }
  static company(rows: Row[], screen?: Screen): string {
    const purse = screen ? `<p class="purse" data-id="purse"><b>${screen.purse.coin}</b> coin · <b>${screen.purse.rations}</b>`
      + ` ration${screen.purse.rations === 1 ? '' : 's'}${screen.purse.other.map(o => ` · ${Html.escape(o)}`).join('')}</p>` : '';
    return `<section class="panel company" data-region="party"><h2>Company</h2>${rows.map(r => this.member(r)).join('')}${purse}</section>`;
  }
  static member(m: Row): string {
    const states = [...m.conditions.map(c => `<span class="bad">${Html.escape(c)}</span>`),
      ...(m.boons ?? []).map(b => `<span class="good">${Html.escape(b)}</span>`)].join('');
    return `<div class="member${m.hp ? '' : ' down'}${m.acting ? ' acting' : ''}" data-member="${Html.escape(m.id)}">`
      + `<p class="who"><b>${m.acting ? '▸ ' : ''}${Html.escape(m.name)}</b><span>${Html.escape(m.line)}</span></p>`
      + `${this.bar(m.hp, m.maxHp)}${this.slots(m)}${states ? `<p class="states">${states}</p>` : ''}</div>`;
  }
  // Health as a run of blocks and a number: ████░░ 8/12.
  static bar(value: number, max: number): string {
    const cells = 12, filled = max ? Math.round((value / max) * cells) : 0, low = max && value / max <= 0.34 ? ' low' : '';
    return `<p class="hp${low}" role="meter" aria-label="health" aria-valuenow="${value}" aria-valuemax="${max}">`
      + `<span class="cells">${'█'.repeat(filled)}<i>${'░'.repeat(cells - filled)}</i></span><span class="v">${value}/${max}</span></p>`;
  }
  // Spell slots by level, a filled pip for each still ready: I ●●○ II ●.
  static slots(m: { slots?: number[]; maxSlots?: number[] }): string {
    if (!m.maxSlots?.length) { return ''; }
    return `<p class="slots" aria-label="spell slots">${m.maxSlots.map((most, i) => `<span>${['I', 'II', 'III', 'IV', 'V'][i]}`
      + ` ${'●'.repeat(m.slots?.[i] ?? 0)}<i>${'○'.repeat(Math.max(0, most - (m.slots?.[i] ?? 0)))}</i></span>`).join('')}</p>`;
  }
  private static foe(f: CombatantRow): string {
    return `<div class="member foe${f.down ? ' down' : ''}${f.acting ? ' acting' : ''}" data-fighter="${Html.escape(f.id)}">`
      + `<p class="who"><b>${f.acting ? '▸ ' : ''}${Html.escape(f.name)}</b><span>${Html.escape(f.line)}</span></p>`
      + `${this.bar(f.hp, f.maxHp)}${f.statuses.length ? `<p class="states">${[...new Set(f.statuses)]
        .map(x => `<span class="bad">${Html.escape(x)}</span>`).join('')}</p>` : ''}`
      + `${f.intent && !f.down ? `<p class="intent">${Html.escape(f.intent)}</p>` : ''}`
      + `${f.defenses && !f.down ? `<p class="defenses">${Html.escape(f.defenses)}</p>` : ''}</div>`;
  }
  private static counter(t: Counter): string {
    const sells = t.sells.map(g => `<li><span>${Html.escape(g.name)}</span><span class="price">${g.price}c</span>`
      + `<span class="stock${g.stock ? '' : ' out'}">${g.stock ? `${g.stock} left` : 'none left'}</span></li>`).join('');
    const buys = t.buys.map(g => `<li><span>${Html.escape(g.name)}</span><span class="price">${g.price}c</span></li>`).join('');
    return `<div class="merchant"><p class="who"><b>${Html.escape(t.name)}</b>${t.buys.length ? `<span>${t.coin} coin in hand</span>` : ''}</p>`
      + `${sells ? `<ul class="ledger">${sells}</ul>` : ''}${buys ? `<p class="buys">Buys</p><ul class="ledger">${buys}</ul>` : ''}</div>`;
  }
  // The road: how long the light lasts, and when the company must next eat.
  private static road(screen: Screen): string {
    const e = screen.expedition;
    const light = { day: 'Daylight until 6 p.m.', evening: 'Dark by 9 p.m.', night: 'Night until 6 a.m.' }[e.daylight] ?? '';
    const meal = e.hungry ? '<b class="bad">Hungry</b>' : e.nextMeal ? `Eat by ${Html.escape(e.nextMeal)}` : '';
    return `<p class="road">${[light, meal].filter(Boolean).join(' · ')}</p>`;
  }
}
