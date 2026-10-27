import type { CombatantRow } from '../../../src/ui/screen-types';
import type { ReaderApp } from '../reader-app';
import { Typography } from '../../../src/presentation/typography';
import { Words } from '../words';
import { FightLog } from '../fight-log';
import { Act } from './act';

// A fight. The company on one side and what it fights on the other, each with how hurt they are, what they are under
// and (for a foe) what it means to do; between them what has just happened, large, the latest last; whose turn it
// is and who follows; and beneath, what the one whose turn it is can do, as cards. The whole fight so far is a fold
// away. A word said in the middle of it never hides what happened. Once it has ended, the page stays: the last blows,
// how it ended and what it was worth, and how each side stands, until the player goes on.
export class FightStage {
  static View({ app }: { app: ReaderApp }) {
    const s = app.state, frame = s.frame!, combat = frame.combat!, mark = s.fight, draw = Act.draw(app);
    const seen = mark?.seen ?? 0, recent = combat.exchanges.filter(e => e.n >= seen);
    const first = mark?.first ?? true, after = combat.after ?? [];
    const turn = combat.outcome ? 'The fight is over.' : combat.ours ? `${combat.actorName}’s turn` : `${combat.actorName} acts`;
    return (
      <div className="fight" id="page">
        <p className="status"><span>A fight</span><span>Round {Math.max(1, combat.round)}</span>
          <span data-id="place">{Typography.curl(frame.screen.place.name)}</span></p>
        {(combat.laws ?? []).map(l => <p key={l.name} className="law"><b>{l.name}.</b> {l.text}</p>)}
        <div className="sides">
          <ul className="side ours" aria-label="The company">{combat.allies.map(f => <FightStage.Card key={`${f.id}:${f.hp}`} fighter={f}
            took={mark ? (mark.hp[f.id] ?? f.hp) - f.hp : 0} />)}</ul>
          <div className="beat" aria-live="polite">
            {first && frame.opening.filter(Boolean).map((l, i) => <p key={`o${i}`} className="began">{Typography.curl(l)}</p>)}
            {recent.map(e => <p key={e.n} className="what" title={e.detail}>{Typography.curl(e.text)}</p>)}
            {after.map(l => <p key={l} className="after">{Typography.curl(l)}</p>)}
            {!recent.length && !first && !after.length && <p className="quiet">Nothing has changed.</p>}
          </div>
          <ul className="side foes" aria-label="Against you">{combat.foes.map(f => <FightStage.Card key={`${f.id}:${f.hp}`} fighter={f}
            took={mark ? (mark.hp[f.id] ?? f.hp) - f.hp : 0} foe />)}</ul>
        </div>
        <p className="turn">{turn}{!combat.outcome && combat.order.length > 1
          && <span> · then {combat.order.slice(1).join(', ')}</span>}
          {s.pending && <span className="working"> · {Typography.curl(Words.lastSaid(s.pending.said))}…</span>}</p>
        <div className="moves">
          {app.menu.sections.filter(sec => sec.choices.length).map(sec => <section key={sec.id} data-section={sec.id}>
            {sec.title && <p className="label">{sec.title}</p>}
            <Act.List choices={sec.choices} draw={draw} className="cards" />
          </section>)}
          {combat.ours && !combat.outcome && app.menu.sections.length > 0 && <p className="auto">T lets {combat.actorName} fight
            this turn on their own.</p>}
        </div>
        <details className="fight-log-fold">
          <summary>The fight so far</summary>
          <FightLog.Memo exchanges={combat.exchanges} />
        </details>
      </div>
    );
  }
  static Card({ fighter: f, took, foe }: { fighter: CombatantRow; took: number; foe?: boolean }) {
    const hurt = Words.hurt(f.hp, f.maxHp);
    return (
      <li className={`card${f.down ? ' down' : ''}${f.acting ? ' acting' : ''}${took > 0 ? ' struck' : ''}`}
        data-fighter={f.id}>
        <p className="n"><b>{Typography.curl(Words.upper(f.name))}</b>{took > 0 && <span className="took" key={`${f.hp}`}>−{took}</span>}</p>
        <p className="line">{f.line}</p>
        <span className="hp" aria-hidden="true"><i style={{ width: `${f.maxHp ? (f.hp / f.maxHp) * 100 : 0}%` }} /></span>
        <p className="tags"><span className={`state ${hurt.replace(' ', '-')}`}>{hurt} · {f.hp} of {f.maxHp}</span>
          {!f.down && f.statuses.length > 0 && ` · ${[...new Set(f.statuses)].join(', ')}`}
          {!f.down && f.boons && f.boons.length > 0 && ` · ${[...new Set(f.boons)].join(', ')}`}</p>
        {foe && !f.down && f.intent && <p className="intent">Means to use {Words.intent(f.intent)}.</p>}
        {foe && !f.down && f.defenses && <p className="defenses">{Words.upper(f.defenses)}.</p>}
      </li>
    );
  }
}
