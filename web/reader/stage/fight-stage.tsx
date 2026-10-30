import { useState } from 'react';
import type { CombatantRow } from '../../../src/ui/screen-types';
import type { ReaderApp } from '../reader-app';
import { Typography } from '../../../src/presentation/typography';
import { Words } from '../words';
import { FightLog } from '../fight-log';
import { Act } from './act';

// A fight. The company on one side and what it fights on the other, each with how hurt they are, what they are under
// and (for a foe) what it means to do; between them what has just happened, large, the latest last, the blows just
// before it quieter above; whose turn it is and who follows; and beneath, what the one whose turn it is can do, as
// cards. The whole fight so far is shown in place of what just happened, at a touch, and put away again (it had been
// a web page's fold: play 7). A word said in the middle of it never hides what happened. Once it has ended, the page stays: the last blows, how it ended and what
// it was worth, and how each side stands, until the player goes on.
export class FightStage {
  static View({ app }: { app: ReaderApp }) {
    const [log, show] = useState(false);
    const s = app.state, frame = s.frame!, combat = frame.combat!, mark = s.fight, draw = Act.draw(app);
    const seen = mark?.seen ?? 0, recent = combat.exchanges.filter(e => e.n >= seen);
    // The blows before, quieter, above the last: the middle of the page had been white under one line (Mission 17).
    const earlier = combat.exchanges.filter(e => e.n < seen).slice(-FightStage.kept);
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
          <div className="beat" aria-live="polite">{log ? <FightLog.Memo exchanges={combat.exchanges} /> : <>
            {first && frame.opening.filter(Boolean).map((l, i) => <p key={`o${i}`} className="began">{Typography.curl(l)}</p>)}
            {combat.moment && <p className="moment">{Typography.curl([combat.reckoned ?? '', combat.moment === 'seen'
              ? 'It has not reached you yet: there is still time to get back the way you came.'
              : 'It is on you, but not yet round you: there is still time to get back the way you came.']
              .filter(Boolean).join(' '))}</p>}
            {earlier.map(e => <p key={e.n} className="what earlier" title={e.detail}>{Typography.curl(e.text)}</p>)}
            {recent.map(e => <p key={e.n} className="what" title={e.detail}>{Typography.curl(e.text)}</p>)}
            {after.map(l => <p key={l} className="after">{Typography.curl(l)}</p>)}
            {!recent.length && !first && !after.length && <p className="quiet">Nothing has changed.</p>}
          </>}</div>
          <ul className="side foes" aria-label="Against you">{combat.foes.map(f => <FightStage.Card key={`${f.id}:${f.hp}`} fighter={f}
            took={mark ? (mark.hp[f.id] ?? f.hp) - f.hp : 0} foe />)}</ul>
        </div>
        <div className="turn"><p className="now">{turn}
          {s.pending && <span className="working"> · {Typography.curl(Words.lastSaid(s.pending.said))}…</span>}</p>
          {!combat.outcome && combat.order.length > 1 && <ol className="order" aria-label="Who acts, in turn">
            {combat.order.map((n, i) => <li key={`${i}:${n}`} className={i ? undefined : 'next'}>
              {Typography.curl(Words.upper(n))}</li>)}</ol>}</div>
        <div className="moves">
          {app.menu.sections.filter(sec => sec.choices.length).map(sec => <section key={sec.id} data-section={sec.id}>
            {sec.title && <p className="label">{sec.title}</p>}
            <Act.List choices={sec.choices} draw={draw} className="cards" />
          </section>)}
          {combat.ours && !combat.outcome && app.menu.sections.length > 0 && <p className="auto">T lets {combat.actorName} fight
            this turn on their own.</p>}
        </div>
        <p className="fight-log-toggle"><button type="button" className="option quiet" data-action="fight-log"
          aria-pressed={log} onClick={() => show(!log)}>{log ? 'Back to what just happened' : 'The fight so far'}</button></p>
      </div>
    );
  }
  // How many blows before the last are kept on the page, quieter.
  static readonly kept = 4;
  // What a foe means to do this round, at whom first: "→ Ama · strike with the javelin".
  static Intent({ intent }: { intent: string }) {
    const [what, at] = intent.split(' → ');
    return <p className="intent">{at && <span className="at">→ {Typography.curl(at)}</span>}
      <span className="what">{at ? ' · ' : ''}{Typography.curl(what!.toLowerCase())}</span></p>;
  }
  static Card({ fighter: f, took, foe }: { fighter: CombatantRow; took: number; foe?: boolean }) {
    const hurt = Words.hurt(f.hp, f.maxHp);
    const marks = [foe ? '' : ' faced', f.down ? ' down' : '', f.acting ? ' acting' : '', took > 0 ? ' struck' : ''];
    return (
      <li className={`fighter${marks.join('')}`} data-fighter={f.id}>
        {!foe && <FightStage.Face fighter={f} />}
        <p className="n"><b>{Typography.curl(Words.upper(f.name))}</b>{took > 0 && <span className="took" key={`${f.hp}`}>−{took}</span>}
          <span className="of">{f.hp} of {f.maxHp}</span></p>
        <span className="hp" aria-hidden="true"><i style={{ width: `${f.maxHp ? (f.hp / f.maxHp) * 100 : 0}%` }} /></span>
        <p className="tags">{f.line} · <span className={`state ${hurt.replace(' ', '-')}`}>{hurt}</span>
          {!f.down && f.statuses.length > 0 && ` · ${[...new Set(f.statuses)].join(', ')}`}
          {!f.down && f.boons && f.boons.length > 0 && ` · ${[...new Set(f.boons)].join(', ')}`}</p>
        {foe && !f.down && f.intent && <FightStage.Intent intent={f.intent} />}
        {foe && !f.down && f.defenses && <p className="defenses">{Words.upper(f.defenses)}.</p>}
      </li>
    );
  }
  // One of the company by their portrait (see CompanyPortraits), small at the card's side so the card is no taller for
  // it; one no portrait fits by the first letter of their name on a plain plate.
  static Face({ fighter: f }: { fighter: CombatantRow }) {
    return f.face ? <img className="face" src={f.face.src} alt="" decoding="async"
      onError={e => { e.currentTarget.classList.add('gone'); }} />
      : <span className="face plate" aria-hidden="true">{f.name.replace(/^(the|an?) /i, '').charAt(0).toUpperCase()}</span>;
  }
}
