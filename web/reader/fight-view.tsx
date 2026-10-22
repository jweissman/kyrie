import { memo } from 'react';
import type { CombatantRow, CombatScreen } from '../../src/ui/screen-types';
import type { FightMark } from './reader-app';
import { FightLog } from './fight-log';
import { Words } from './words';

// A fight, told on the page so that what matters stays where it is: who stands against the company and how they look
// (with what each last blow took from them), then what happened since the company last chose, then whose turn it is,
// with the choices after. The whole fight so far is kept beside the page (on a phone, folded under the turn).
export class FightView {
  static View({ combat, opening, place, mark }: { combat: CombatScreen; opening: string[]; place: string;
    mark?: FightMark }) {
    const seen = mark?.seen ?? 0, recent = combat.exchanges.filter(e => e.n >= seen);
    const turn = combat.outcome ? 'The fight is over.' : combat.ours ? `${combat.actorName}’s turn.`
      : `${combat.actorName} acts.`;
    return (
      <section className="fight" aria-label="A fight">
        <header className="scene-head fight-head">
          <h1>A fight at {place}</h1>
          <p className="where">Round {Math.max(1, combat.round)}</p>
          {(combat.laws ?? []).map(l => <p key={l.name} className="law">{l.name}: {l.text}</p>)}
        </header>
        <ul className="foes" aria-label="Against you">{combat.foes.map(f => <FightView.Foe key={f.id} foe={f}
          took={mark ? (mark.hp[f.id] ?? f.hp) - f.hp : 0} />)}</ul>
        <div className="now" aria-live="polite">
          {(mark?.first ?? true) && opening.filter(Boolean).map((l, i) => <p key={`o${i}`} className="began">{l}</p>)}
          {recent.map(e => <FightView.Exchange key={e.n} text={e.text} detail={e.detail} />)}
          {!recent.length && !(mark?.first ?? true) && <p className="quiet">Nothing has changed.</p>}
        </div>
        <p className="turn">{turn}{combat.ours && combat.order.length > 1 && !combat.outcome
          && <span> Then {combat.order.slice(1).join(', ')}.</span>}</p>
        <details className="fight-log-fold">
          <summary>The fight so far</summary>
          <FightLog.Memo exchanges={combat.exchanges} />
        </details>
      </section>
    );
  }
  // One foe: what it is, how hurt it looks and what the last blows took, what it shrugs off, and what it means to do.
  static Foe({ foe, took }: { foe: CombatantRow; took: number }) {
    const hurt = Words.hurt(foe.hp, foe.maxHp);
    return (
      <li className={`foe${foe.down ? ' down' : ''}${foe.acting ? ' acting' : ''}`} data-fighter={foe.id}>
        <p className="who"><b>{Words.upper(foe.name)}</b> <span className="line">{foe.line}</span>
          {took > 0 && <span className="took" key={`${foe.hp}`}>−{took}</span>}
          <span className={`hurt ${hurt.replace(' ', '-')}`} title={`${foe.hp} of ${foe.maxHp}`}>{hurt}</span></p>
        <span className="bar" aria-hidden="true"><i style={{ width: `${foe.maxHp ? (foe.hp / foe.maxHp) * 100 : 0}%` }} /></span>
        {!foe.down && foe.intent && <p className="intent">Means to use {Words.intent(foe.intent)}.</p>}
        {!foe.down && foe.statuses.length > 0 && <p className="states">{[...new Set(foe.statuses)].join(', ')}</p>}
        {!foe.down && foe.defenses && <p className="defenses">{Words.upper(foe.defenses)}.</p>}
      </li>
    );
  }
  static readonly Exchange = memo(FightView.lines);
  private static lines({ text, detail }: { text: string; detail: string }) {
    return <p className="exchange" title={detail}>{text}</p>;
  }
}
