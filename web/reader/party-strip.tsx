import type { MouseEvent } from 'react';
import type { CombatScreen, Screen } from '../../src/ui/screen-types';
import type { ReaderApp } from './reader-app';
import { Words } from './words';

interface Row { id: string; name: string; hp: number; maxHp: number; conditions: string[]; acting?: boolean }

// The company, kept quietly in view: each companion's name and how they stand, more plainly in a fight; and what
// the company carries in coin and food. A name opens that companion's sheet.
export class PartyStrip {
  static View({ app, screen, combat }: { app: ReaderApp; screen: Screen; combat?: CombatScreen }) {
    const rows: Row[] = combat ? combat.allies.map(a => ({ id: a.id, name: a.name, hp: a.hp, maxHp: a.maxHp,
      conditions: a.statuses, acting: a.acting }))
      : screen.party.map(m => ({ id: m.id, name: m.name, hp: m.hp, maxHp: m.maxHp, conditions: m.conditions }));
    return (
      <footer className={`party${combat ? ' fighting' : ''}`} data-region="party" aria-label="The company">
        {rows.map(r => (
          <button type="button" key={r.id} className={`member${r.hp ? '' : ' down'}${r.acting ? ' acting' : ''}`}
            data-member={r.id} onClick={PartyStrip.open.bind(null, app)} disabled={!!combat}
            title={`${r.name}: ${r.hp} of ${r.maxHp}`}>
            <b>{r.name}</b>
            <span className="bar" aria-hidden="true"><i style={{ width: `${r.maxHp ? (r.hp / r.maxHp) * 100 : 0}%` }} /></span>
            {combat ? <span className="hp">{r.hp}/{r.maxHp}</span>
              : r.hp < r.maxHp && <span className="hp">{Words.hurt(r.hp, r.maxHp)}</span>}
            {combat && PartyStrip.took(app, r) > 0 && <span className="took" key={r.hp}>−{PartyStrip.took(app, r)}</span>}
            {r.conditions.length > 0 && <span className="cond">{[...new Set(r.conditions)].join(', ').toLowerCase()}</span>}
          </button>
        ))}
        {!combat && <span className="purse" data-id="purse">{screen.purse.coin} coin · {screen.purse.rations}
          {screen.purse.rations === 1 ? ' ration' : ' rations'}</span>}
      </footer>
    );
  }
  // What the blows since the company last chose took from a companion.
  private static took(app: ReaderApp, r: Row): number { return (app.state.fight?.hp[r.id] ?? r.hp) - r.hp; }
  private static open(app: ReaderApp, e: MouseEvent<HTMLButtonElement>) {
    app.setState({ member: e.currentTarget.dataset.member! });
    if (app.state.view !== 'company') { app.show('company'); }
  }
}
