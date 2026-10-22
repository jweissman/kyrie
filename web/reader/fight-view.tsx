import { memo } from 'react';
import type { CombatantRow, CombatScreen } from '../../src/ui/screen-types';
import { Words } from './words';

// A fight, told on the page: how it began, who stands against the company and what each means to do next, and each
// exchange as it happened. The acting companion's choices follow, in the menu.
export class FightView {
  static View({ combat, opening, place }: { combat: CombatScreen; opening: string[]; place: string }) {
    const exchanges = combat.exchanges;
    const turn = combat.outcome ? 'The fight is over.' : combat.ours ? `${combat.actorName}’s turn.`
      : `${combat.actorName} acts.`;
    return (
      <section className="fight" aria-label="A fight">
        <header className="scene-head">
          <h1>A fight at {place}</h1>
          {(combat.laws ?? []).map(l => <p key={l.name} className="law">{l.name}: {l.text}</p>)}
        </header>
        {opening.length > 0 && <div className="prose now">{opening.map((l, i) => <p key={i}>{l}</p>)}</div>}
        <ul className="foes" aria-label="Against you">{combat.foes.map(f => <FightView.Foe key={f.id} foe={f} />)}</ul>
        <div className="exchanges" aria-live="polite">
          {exchanges.slice(-10).map((g, i, all) => <FightView.Exchange key={exchanges.length - all.length + i}
            text={g.text} detail={g.detail} />)}
        </div>
        <p className="turn">{turn}{combat.ours && combat.order.length > 1 && !combat.outcome
          && <span> Then {combat.order.slice(1).join(', ')}.</span>}</p>
      </section>
    );
  }
  // One foe: what it is, how hurt it looks, what it shrugs off, and what it means to do this round.
  static Foe({ foe }: { foe: CombatantRow }) {
    const hurt = Words.hurt(foe.hp, foe.maxHp);
    return (
      <li className={`foe${foe.down ? ' down' : ''}${foe.acting ? ' acting' : ''}`} data-fighter={foe.id}>
        <p className="who"><b>{Words.upper(foe.name)}</b> <span className="line">{foe.line}</span>
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
