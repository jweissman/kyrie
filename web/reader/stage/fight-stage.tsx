import { useRef, useState, type ReactNode } from 'react';
import type { CombatantRow } from '../../../src/ui/screen-types';
import type { ReaderApp } from '../reader-app';
import { Typography } from '../../../src/presentation/typography';
import { Words } from '../words';
import { Followed } from '../followed';
import { FightLog } from '../fight-log';
import { Act } from './act';
import { Scrolled } from './scrolled';

// A fight. The company on one side and what it fights on the other, each with how hurt they are, what they are under
// and (for a foe) what it means to do; between them what has just happened, large, the latest last, the blows just
// before it quieter above; whose turn it is and who follows; and beneath, what the one whose turn it is can do, as
// cards. The whole fight so far is shown in place of what just happened, at a touch, and put away again (it had been
// a web page's fold: play 7). A word said in the middle of it never hides what happened. Once it has ended, the page stays: the last blows, how it ended and what
// it was worth, and how each side stands, until the player goes on.
export class FightStage {
  // Decided: every foe standing is at half its strength or less, and every one of the company above half.
  static decided(c: { foes: { hp: number; maxHp: number }[]; allies: { hp: number; maxHp: number }[] }): boolean {
    const standing = c.foes.filter(f => f.hp > 0);
    return standing.length > 0 && standing.every(f => f.hp <= f.maxHp / 2) && c.allies.every(f => f.hp > f.maxHp / 2);
  }
  // The acts and the sides each say when more of them lies below (see Scrolled).
  static View({ app }: { app: ReaderApp }) {
    const [log, show] = useState(false), moves = useRef(null), sides = useRef(null);
    const s = app.state, frame = s.frame!, combat = frame.combat!, mark = s.fight, draw = Act.draw(app);
    const seen = mark?.seen ?? 0, recent = combat.exchanges.filter(e => e.n >= seen);
    // The blows before, quieter, above the last: the middle of the page had been white under one line (Mission 17).
    const earlier = combat.exchanges.filter(e => e.n < seen).slice(-FightStage.kept);
    const first = mark?.first ?? true, after = combat.after ?? [];
    const turn = combat.outcome ? 'The fight is over.' : combat.ours ? `${combat.actorName}’s turn` : `${combat.actorName} acts`;
    Scrolled.useCue(moves, combat); Scrolled.useCue(sides, combat);
    return (
      <div className="fight" id="page">
        <p className="status"><span>A fight</span><span>Round {Math.max(1, combat.round)}</span>
          <span data-id="place">{Typography.curl(frame.screen.place.name)}</span>
          {combat.standing && <span className={`standing ${combat.standing.danger}`} data-region="standing">
            {Typography.curl(combat.standing.text.split(/(?<=\.) /)[0]!)}</span>}</p>
        {(combat.laws ?? []).map(l => <p key={l.name} className="law"><b>{l.name}.</b> {l.text}</p>)}
        <div className="sides" ref={sides}>
          <ul className="side ours" aria-label="The company">{combat.allies.map(f => <FightStage.Card key={`${f.id}:${f.hp}`} fighter={f}
            took={mark ? (mark.hp[f.id] ?? f.hp) - f.hp : 0} />)}</ul>
          <div className="beat" aria-live="polite">{log ? <FightLog.Memo exchanges={combat.exchanges} /> : <>
            {first && frame.opening.filter(Boolean).map((l, i) => <p key={`o${i}`} className="began">{Typography.curl(l)}</p>)}
            {combat.moment && <p className="moment">{Typography.curl([combat.reckoned ?? '', combat.moment === 'seen'
              ? 'It has not reached you yet.' : 'It is on you, but not yet round you.'].filter(Boolean).join(' '))}</p>}
            {earlier.map(e => <p key={e.n} className="what earlier">{Typography.curl(e.text)}</p>)}
            {/* What just happened, and beneath it how it fell (the rolls), on the page and not in a hover (the owner,
                6 November: no guidance a tooltip alone holds). */}
            {recent.map(e => <div key={e.n} className="what"><p>{Typography.curl(e.text)}</p>
              {e.detail && <p className="how">{Typography.curl(e.detail)}</p>}</div>)}
            {after.map(l => <p key={l} className="after">{Typography.curl(l)}</p>)}
            {combat.outcome && <FightStage.Aftermath app={app} />}
            {!recent.length && !first && !after.length && <p className="quiet">Nothing has changed.</p>}
          </>}</div>
          <ul className="side foes" aria-label="Against you">{combat.foes.map(f => <FightStage.Card key={`${f.id}:${f.hp}`} fighter={f}
            took={mark ? (mark.hp[f.id] ?? f.hp) - f.hp : 0} foe dark={!!frame.screen.dark} />)}</ul>
        </div>
        <div className="turn"><p className="now">{turn}
          {s.pending && <span className="working"> · {Typography.curl(Words.lastSaid(s.pending.said))}…</span>}</p>
          {!combat.outcome && combat.order.length > 1 && <ol className="order" aria-label="Who acts, in turn">
            {combat.order.map((n, i) => <li key={`${i}:${n}`} className={i ? undefined : 'next'}>
              {Typography.curl(Words.upper(n))}</li>)}</ol>}</div>
        <div className="moves" ref={moves}>
          {app.menu.sections.filter(sec => sec.choices.length).map(sec => <section key={sec.id} data-section={sec.id}>
            {sec.title && <p className="label">{sec.title}</p>}
            <Act.List choices={sec.choices} draw={draw} className="cards" />
          </section>)}
          {combat.ours && !combat.outcome && app.menu.sections.length > 0 && <p className="auto">
            <button type="button" className="option quiet" data-action="auto" onClick={app.auto}>
              Let {combat.actorName} fight this turn <kbd>T</kbd></button></p>}
          {combat.ours && !combat.outcome && FightStage.decided(combat) && <p className="through">
            <button type="button" className="option" data-action="press-on" onClick={app.through}>Press on to the end</button>
            <span className="why">As good as won.</span></p>}
        </div>
        <p className="fight-log-toggle"><button type="button" className="option quiet" data-action="fight-log"
          aria-pressed={log} onClick={() => show(!log)}>{log ? 'Back to what just happened' : 'The fight so far'}</button></p>
      </div>
    );
  }
  // What the fight cost the company, each by how they stood as it began, and what is still to do (the product-design
  // review's PD-13: an end that told what was won, never what it cost or what remained).
  static Aftermath({ app }: { app: ReaderApp }) {
    const frame = app.state.frame!, combat = frame.combat!, began = app.state.fight?.began ?? {};
    const cost = combat.allies.map(f => {
      const was = began[f.id] ?? f.hp;
      return f.hp === 0 ? `${f.name} down` : f.hp < was ? `${f.name} ${f.hp} of ${f.maxHp}, ${was - f.hp} lost`
        : `${f.name} unhurt`;
    });
    const aim = Followed.of(frame.screen);
    return <div className="aftermath" data-region="aftermath">
      <p><span className="label">What it cost</span>{Typography.curl(cost.join(' · '))}</p>
      {aim && <p><span className="label">Still to do</span>{Typography.curl(aim)}</p>}
    </div>;
  }
  // How many blows before the last are kept on the page, quieter.
  static readonly kept = 4;
  // What a foe means to do this round, at whom first: "→ Ama · strike with the javelin".
  static Intent({ intent }: { intent: string }) {
    const [what, at] = intent.split(' → ');
    return <p className="intent">{at && <span className="at">→ {Typography.curl(at)}</span>}
      <span className="what">{at ? ' · ' : ''}{Typography.curl(what!.toLowerCase())}</span></p>;
  }
  // A foe by how it looks, never its hit points (the owner, 7 November: what one can see, not what one counts): its
  // hurt in words and a bar of four bands; in the dark only whether it stands.
  static Card({ fighter: f, took, foe, dark }: { fighter: CombatantRow; took: number; foe?: boolean; dark?: boolean }) {
    const hurt = foe && dark ? (f.hp > 0 ? 'standing' : 'down') : Words.hurt(f.hp, f.maxHp);
    const band = foe ? FightStage.band(f, dark) : f.maxHp ? (f.hp / f.maxHp) * 100 : 0;
    // A face panel for one of the company, and for a foe that has a painting (a den's wolves, the rats).
    const marks = [!foe || f.face ? ' faced' : '', f.down ? ' down' : '', f.acting ? ' acting' : '', took > 0 ? ' struck' : ''];
    return (
      <li className={`fighter${marks.join('')}`} data-fighter={f.id}>
        {(!foe || f.face) && <FightStage.Face fighter={f} />}
        <p className="n"><b title={foe ? undefined : Typography.curl(Words.upper(f.name))}>{Typography.curl(Words.upper(f.name))}</b>
          {took > 0 && !foe && <span className="took" key={`${f.hp}`}>−{took}</span>}
          {!foe && <span className="of">{f.hp} of {f.maxHp}</span>}</p>
        <span className="hp" aria-hidden="true"><i style={{ width: `${band}%` }} /></span>
        <p className="tags"><span className="parts">{FightStage.parts(f, hurt).map(([key, part]) =>
          <span key={key} className="part">
            <span className="sep" aria-hidden="true"> · </span>{part}</span>)}</span></p>
        {foe && !f.down && f.intent && <FightStage.Intent intent={f.intent} />}
        {foe && !f.down && f.defenses && <p className="defenses">{Words.upper(f.defenses)}.</p>}
      </li>
    );
  }
  // How full a foe's bar is drawn: by its hurt, not its count.
  static band(f: CombatantRow, dark?: boolean): number {
    if (f.hp <= 0) { return 0; }
    if (dark) { return 100; }
    return ({ unhurt: 100, hurt: 75, 'badly hurt': 45, 'near death': 15 } as Record<string, number>)[Words.hurt(f.hp, f.maxHp)] ?? 100;
  }
  // What they are and are under, each part whole (see fight.css): "elf ranger", "badly hurt", "prone, frightened".
  static parts(f: CombatantRow, hurt: string): [string, ReactNode][] {
    const [statuses, boons] = [f.statuses, f.boons ?? []].map(all => (f.down ? '' : [...new Set(all)].join(', ')));
    return ([['line', f.line], ['state', <span className={`state ${hurt.replace(' ', '-')}`}>{hurt}</span>],
      ['statuses', statuses], ['boons', boons]] as [string, ReactNode][]).filter(([, p]) => p);
  }
  // One of the company by their portrait (see CompanyPortraits), the card's left panel, the whole height of it, the
  // name, the bar and what they are under to its right (the owner, 2026-10-30: not a little square), held about where
  // its face sits across it and by its top, so that a panel wider than tall cuts the shoulders and never the crown (a
  // foe's painting, with no such square, as the stylesheet says). One no portrait fits, or whose portrait does not
  // come, by the first letter of their name in the same panel.
  static Face({ fighter: f }: { fighter: CombatantRow }) {
    const [failed, fail] = useState(false), painted = f.face && !failed, at = f.face?.at;
    return <span className={`face${painted ? '' : ' plate'}`} aria-hidden="true">
      {painted ? <img src={f.face!.medium} alt="" decoding="async" onError={() => fail(true)}
        style={at ? { objectPosition: `${Math.round(at[0] * 100)}% 0%` } : undefined} />
        : f.name.replace(/^(the|an?) /i, '').charAt(0).toUpperCase()}</span>;
  }
}
