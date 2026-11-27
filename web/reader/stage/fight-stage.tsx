import { useEffect, useRef, useState, type ReactNode } from 'react';
import type { Choice } from '../../../src/ui/choice-list';
import type { CombatantRow } from '../../../src/ui/screen-types';
import type { ReaderApp } from '../reader-app';
import { Typography } from '../../../src/presentation/typography';
import { Words } from '../../../src/presentation/words';
import { Followed } from '../followed';
import { FightLog } from '../fight-log';
import { Scrolled } from './scrolled';
import { PageFrame } from '../page-frame';
import { FightMoves, type Aiming } from './fight-moves';
import { Act } from './act';
import { ChoiceRow } from './choice-row';

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
    const [aiming, aim] = useState<Aiming | undefined>(), [panel, open] = useState<string | undefined>();
    const s = app.state, frame = s.frame!, combat = frame.combat!, mark = s.fight;
    // Aiming and an open kind are let go whenever the fight moves on, and with Escape.
    useEffect(() => { aim(undefined); open(undefined); }, [combat.round, combat.actorName, combat.exchanges.length]);
    // A level at a time, as Not now and Back are (OR-1561): out of aiming to the kind it was aimed from, then the hand.
    useEffect(() => {
      const key = (e: KeyboardEvent) => { if (e.key === 'Escape') { if (aiming) { aim(undefined); } else { open(undefined); } } };
      window.addEventListener('keydown', key);
      return () => window.removeEventListener('keydown', key);
    }, [aiming]);
    const seen = mark?.seen ?? 0, recent = combat.exchanges.filter(e => e.n >= seen);
    // The blows before, quieter, above the last: the middle of the page had been white under one line (Mission 17).
    const earlier = combat.exchanges.filter(e => e.n < seen).slice(-FightStage.kept);
    const first = mark?.first ?? true, after = combat.after ?? [];
    // Ended, the fight says how, once, above (the owner, 11 November late: "The fight is won" over "The fight is over").
    const turn = combat.outcome ? '' : combat.ours ? `${combat.actorName}’s turn` : `${combat.actorName} acts`;
    Scrolled.useCue(moves, combat); Scrolled.useCue(sides, combat); Scrolled.useHeld(sides, '.ours', combat);
    // A fight the page never had to ask about (one foregone, fought through by the company's own tactics: BP-01) is
    // told by its end, in a sentence or two, not shown as a fight page.
    if (combat.outcome && (mark?.first ?? true)) { return <FightStage.Told app={app} log={log} show={show} />; }
    return (
      <PageFrame.View kind="fight" className={`fight${aiming ? ' aiming' : ''}${combat.stage ? ` ${combat.stage}` : ''}${combat.theme ? ` theme-${combat.theme}` : ''}`} header={<p className="status"><span>A fight</span><span>Round {Math.max(1, combat.round)}</span>
          <span data-id="place">{Typography.curl(frame.screen.place.name)}</span>
          {/* Said once: in the beat where it is told whole at the start, not again in the head. */}
          {combat.standing && !(first && !recent.length && !frame.opening.some(Boolean)) && <span
            className={`standing ${combat.standing.danger}`} data-region="standing">
            {Typography.curl(combat.standing.text.split(/(?<=\.) /)[0]!)}</span>}
          {/* The fight so far, a page of the fight's own, read from its head: not a bar across its foot. */}
          <FightStage.LogMark log={log} show={show} words={log ? 'What just happened' : 'The fight so far'} /></p>}
        narrative={<>{(combat.laws ?? []).map(l => <p key={l.name} className="law"><b>{l.name}.</b> {l.text}</p>)}
        <div className="sides" ref={sides}>
          <ul className="side ours" aria-label="The company">{combat.allies.map(f => <FightStage.Card key={`${f.id}:${f.hp}`} fighter={f}
            took={mark ? (mark.hp[f.id] ?? f.hp) - f.hp : 0} app={app} target={aiming?.targets.get(f.id)} />)}</ul>
          <div className="beat" aria-live="polite">{log ? <FightLog.Memo exchanges={combat.exchanges} /> : <>
            {first && frame.opening.filter(Boolean).map((l, i) => <p key={`o${i}`} className="began">{Typography.curl(l)}</p>)}
            {/* At the start, how the fight stands, in the beat where the eye is: its middle had stood empty, the
                reckoning in small italics at the corner (Mission 21's critique, finding 5). */}
            {first && !recent.length && !frame.opening.some(Boolean) && combat.standing && <p
              className={`began reckoning ${combat.standing.danger}`} data-region="reckoning">{Typography.curl(combat.standing.text)}</p>}
            {combat.moment && <p className="moment">{Typography.curl([combat.reckoned ?? '', combat.moment === 'seen'
              ? 'It has not reached you yet.' : 'It is on you, but not yet round you.'].filter(Boolean).join(' '))}</p>}
            {/* What the company's skills tell of the kinds it faces, at the fight's start (OR-1432). */}
            {first && combat.known?.map((l, i) => <p key={`k${i}`} className="known">{Typography.curl(l)}</p>)}
            {earlier.map(e => <div key={e.n} className="what earlier"><FightLog.Line exchange={e} /></div>)}
            {/* What just happened in prose, and how it fell (the rolls) one deliberate, keyboard- and reader-reachable
                disclosure away, not in a hover and not an act (the owner, 16 November). */}
            {recent.map(e => <div key={e.n} className="what"><FightLog.Line exchange={e} />
              {e.detail && <details className="how"><summary>How it fell</summary>
                <p>{Typography.curl(e.detail)}</p></details>}</div>)}
            {/* What is coming, said where the eye is, before the player answers it (see FoeIntents). */}
            {combat.ours && !combat.outcome && (combat.coming ?? []).map(l => <p key={l} className="coming">
              {Typography.curl(l)}</p>)}
            {/* Pressed on, and handed back: why, under what brought it to it (see PressOn). */}
            {combat.halted && !combat.outcome && <p className="moment halted" data-region="halted">
              {Typography.curl(combat.halted)}</p>}
            {after.map(l => <p key={l} className="after">{Typography.curl(l)}</p>)}
            {combat.outcome && <FightStage.Aftermath app={app} />}
            {!recent.length && !first && !after.length && <p className="quiet">Nothing has changed.</p>}
          </>}</div>
          <ul className="side foes" aria-label="Against you">{combat.foes.map(f => <FightStage.Card key={`${f.id}:${f.hp}`} fighter={f}
            took={mark ? (mark.hp[f.id] ?? f.hp) - f.hp : 0} foe dark={!!frame.screen.dark} app={app}
            target={aiming?.targets.get(f.id)} />)}</ul>
        </div>
        <div className="turn"><p className="now">{turn}
          {s.pending && <span className="working"> · {Typography.curl(Words.lastSaid(s.pending.said))}…</span>}</p>
          {!combat.outcome && combat.order.length > 1 && <ol className="order" aria-label="Who acts, in turn">
            {combat.order.map((n, i) => <li key={`${i}:${n}`} className={i ? undefined : 'next'}>
              {Typography.curl(Words.upper(n))}</li>)}</ol>}</div></>}
        menu={<div className="moves" ref={moves}>
          <FightMoves.View app={app} aiming={aiming} aim={aim} panel={panel} open={open} />
        </div>} />
    );
  }
  // A foregone fight's end, as one act's telling (the blind playtest of 13 November, BP-01: six rounds of a fight the
  // game had called easily won, "clerical work"): who fell, in a sentence; what it gained (the engine's words); what
  // it cost; and the way on. Over the place's painting, where the column stands, its geometry the column's. The blows
  // and their dice are behind a deliberate look, never told with it (BP-03).
  static Told({ app, log, show }: { app: ReaderApp; log: boolean; show: (on: boolean) => void }) {
    const combat = app.state.frame!.combat!;
    const onward = app.menu.sections?.find(x => x.id === 'onward')?.choices[0] ?? app.menu.choices.find(c => c.id === 'onward');
    const fell = combat.foes.filter(f => f.hp <= 0 || f.down).map(f => f.name.replace(/^The /, 'the '));
    const draw = Act.draw(app);
    return (
      <div className="fight-told" id="page" data-region="fight-told">
        <div className="fight-told-col">
          {fell.length > 0 && <p className="told-end">{Typography.curl(Words.upper(
            `${Words.listed(fell)} ${fell.length > 1 ? 'are' : 'is'} down.`))}</p>}
          {(combat.after ?? []).map(l => <p key={l} className="after">{Typography.curl(l)}</p>)}
          <FightStage.Aftermath app={app} />
          {log && <FightLog.Memo exchanges={combat.exchanges} />}
          <p className="fight-told-foot">
            {onward && <ChoiceRow.Act choice={onward} draw={draw} label={Typography.curl(onward.label)} />}
            <FightStage.LogMark log={log} show={show} words={log ? 'Put it away' : 'The fight, blow by blow'} />
          </p>
        </div>
      </div>
    );
  }
  // What the fight cost the company, each by how they stood as it began, and what is still to do (the product-design
  // review's PD-13: an end that told what was won, never what it cost or what remained).
  static Aftermath({ app }: { app: ReaderApp }) {
    const frame = app.state.frame!, combat = frame.combat!, began = app.state.fight?.began ?? {};
    // Hurt and healed in it is said so (a warrior brought to 6 of 16 by the goblin chief, his second wind taken, had
    // been "unhurt": Mission 20's first cold round).
    const cost = combat.allies.map(f => {
      const was = began[f.id] ?? f.hp, low = Math.min(f.hp, app.state.fight?.low?.[f.id] ?? was);
      return f.hp === 0 ? `${f.name} down` : f.hp < was ? `${f.name} ${f.hp} of ${f.maxHp}, ${was - f.hp} lost`
        : low < was ? `${f.name} brought to ${low} of ${f.maxHp}, now ${f.hp}`
          // Unhurt only at full strength: a bite before the page first showed the fight was not counted as lost, and
          // Xyn at 10 of 14, bleeding, had been "unhurt" (Mission 20's fourth round, F 74).
          : f.hp < f.maxHp ? `${f.name} ${f.hp} of ${f.maxHp}` : `${f.name} unhurt`;
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
  // Aimed at, the card is the choice: lit, with how likely it is, chosen by clicking it (see FightMoves).
  static Card({ fighter: f, took, foe, dark, app, target }: { fighter: CombatantRow; took: number; foe?: boolean;
    dark?: boolean; app?: ReaderApp; target?: Choice }) {
    const hurt = foe && dark ? (f.hp > 0 ? 'standing' : 'down') : Words.hurt(f.hp, f.maxHp);
    const band = foe ? FightStage.band(f, dark) : f.maxHp ? (f.hp / f.maxHp) * 100 : 0;
    // A face panel for one of the company, and for a foe that has a painting (a den's wolves, the rats).
    const marks = [!foe || f.face ? ' faced' : '', f.down ? ' down' : '', f.acting ? ' acting' : '', took > 0 ? ' struck' : '',
      target ? ' target' : ''];
    return (
      <li className={`fighter${marks.join('')}`} data-fighter={f.id}>
        {(!foe || f.face) && <FightStage.Face fighter={f} />}
        {/* How hurt, on the name's own line at its right (OR-1133: read at a glance, before the card is read). */}
        <p className="n"><b>{Typography.curl(Words.upper(f.name))}</b>
          {took > 0 && !foe && <span className="took" key={`${f.hp}`}>−{took}</span>}
          <span className={`hurt ${hurt.replace(' ', '-')}`} data-region="hurt">{hurt}</span></p>
        <span className="hp" aria-hidden="true"><i style={{ width: `${band}%` }} /></span>
        {!foe && <p className="of">{f.hp} of {f.maxHp}</p>}
        <p className="tags"><span className="parts">{FightStage.parts(f).map(([key, part]) =>
          <span key={key} className="part" data-part={key}>
            <span className="sep" aria-hidden="true"> · </span>{part}</span>)}</span></p>
        {/* A foe's intent keeps its line when it has none (after it has acted, or fallen): the card had shrunk under the
            hand as it struck (CN-06: no reflow). */}
        {foe && (!f.down && f.intent ? <FightStage.Intent intent={f.intent} />
          : <p className="intent-held" aria-hidden="true">{'\u00a0'}</p>)}
        {foe && !f.down && f.defenses && <p className="defenses">{Words.upper(f.defenses)}.</p>}
        {/* Said as what it is, a blow's chance of landing (OR-1133's cold reading: "3 in 5" alone had to be guessed). */}
        {target && FightStage.chance(target) && <span className="chance">Hits {FightStage.chance(target)}</span>}
        {/* The reticle over the card: the act's own target, drawn as every choice is (OR-94). */}
        {target && app && <Act.View choice={target} draw={Act.draw(app)} quiet variant="glyph" className="pick"
          said={Typography.curl(target.label)}><></></Act.View>}
      </li>
    );
  }
  // The fight's own book, its log, opened and put away from its head or its end: an instrument like the book's (OR-94's
  // allowed set), which reads what happened and does nothing in the world.
  static LogMark({ log, show, words }: { log: boolean; show: (on: boolean) => void; words: string }) {
    return <button type="button" className="quiet-word fight-log-toggle" data-action="fight-log" aria-pressed={log}
      onClick={() => show(!log)}>{words}</button>;
  }
  // A target's chance of being struck, as its note leads with it ("3 in 5", "almost always"), else none.
  static chance(target: Choice): string | undefined {
    const first = target.note?.split(' · ')[0] ?? '';
    return /\bin \d+$|^almost /.test(first) ? Typography.curl(first) : undefined;
  }
  // How full a foe's bar is drawn: by its hurt, not its count.
  static band(f: CombatantRow, dark?: boolean): number {
    if (f.hp <= 0) { return 0; }
    if (dark) { return 100; }
    return ({ unhurt: 100, hurt: 75, 'badly hurt': 45, 'near death': 15 } as Record<string, number>)[Words.hurt(f.hp, f.maxHp)] ?? 100;
  }
  // What they are and are under, each part whole (see fight.css): "elf ranger", "prone, frightened".
  static parts(f: CombatantRow): [string, ReactNode][] {
    const [statuses, boons] = [f.statuses, f.boons ?? []].map(all => (f.down ? '' : [...new Set(all)].join(', ')));
    // How hurt is said on the name's line (see Card), never twice.
    return ([['line', f.line], ['statuses', statuses], ['boons', boons]] as [string, ReactNode][]).filter(([, p]) => p);
  }
  // One of the company by their portrait (see CompanyPortraits), the card's left panel, the whole height of it, the
  // name, the bar and what they are under to its right (the owner, 2026-10-30: not a little square), held about where
  // its face sits across it and by its top, so that a panel wider than tall cuts the shoulders and never the crown (a
  // foe's painting, with no such square, as the stylesheet says). One no portrait fits, or whose portrait does not
  // come, by the first letter of their name in the same panel.
  static Face({ fighter: f }: { fighter: CombatantRow }) {
    const [failed, fail] = useState(false), painted = f.face && !failed, at = f.face?.at;
    // A beast's or a monster's plate is the whole creature on its parchment, shown whole, never cut to the panel (the
    // owner, 8 November: the dog's and the rat's had been cropped); a person's portrait fills it, held by the face.
    const whole = painted && /(^|\/)(animals|monsters)\//.test(f.face!.medium);
    return <span className={`face${painted ? whole ? ' whole' : '' : ' plate'}`} aria-hidden="true">
      {painted ? <img src={f.face!.medium} alt="" decoding="async" onError={() => fail(true)}
        style={at && !whole ? { objectPosition: `${Math.round(at[0] * 100)}% 0%` } : undefined} />
        : f.name.replace(/^(the|an?) /i, '').charAt(0).toUpperCase()}</span>;
  }
}
