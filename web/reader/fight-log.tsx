import { memo, useLayoutEffect, useRef } from 'react';
import type { CombatScreen } from '../../src/ui/screen-types';
import { Typography } from '../../src/presentation/typography';

// The fight so far, round by round, newest last: shown in place of what just happened when asked for. It scrolls on
// its own, so reading back never moves the foes or the choices.
export class FightLog {
  static View({ exchanges }: { exchanges: CombatScreen['exchanges'] }) {
    const list = useRef<HTMLDivElement>(null);
    useLayoutEffect(() => { list.current?.scrollTo({ top: list.current.scrollHeight }); }, [exchanges.length]);
    const rounds = [...new Set(exchanges.map(e => e.round))];
    return (
      <div className="fight-log" ref={list} aria-label="The fight so far">
        {rounds.map(r => (
          <section key={r} className="round">
            <h2>Round {r}</h2>
            {exchanges.filter(e => e.round === r).map(e => <FightLog.Line key={e.n} exchange={e} />)}
          </section>
        ))}
        {!exchanges.length && <p className="none">Nothing has happened yet.</p>}
      </div>
    );
  }
  static readonly Memo = memo(FightLog.View);
  // One exchange as one line of its actor's (the combat experiment's legibility, OR-1352): what they did, then what
  // came of it, a breath apart; what anyone said of it a quiet line of its own, never run into the blow. An exchange
  // the engine told as one sentence is that sentence.
  static Line({ exchange: e }: { exchange: CombatScreen['exchanges'][number] }) {
    if (!e.cause && !e.effect) { return <p>{Typography.curl(e.text)}</p>; }
    return <>
      <p className="exchange">{e.cause && <span className="cause">{Typography.curl(e.cause)}</span>}
        {e.cause && e.effect ? ' ' : ''}{e.effect && <span className="effect">{Typography.curl(e.effect)}</span>}</p>
      {e.bark && <p className="bark">{Typography.curl(e.bark)}</p>}
    </>;
  }
}
