import { memo, useLayoutEffect, useRef } from 'react';
import type { CombatScreen } from '../../src/ui/screen-types';

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
            {exchanges.filter(e => e.round === r).map(e => <p key={e.n} title={e.detail}>{e.text}</p>)}
          </section>
        ))}
        {!exchanges.length && <p className="none">Nothing has happened yet.</p>}
      </div>
    );
  }
  static readonly Memo = memo(FightLog.View);
}
