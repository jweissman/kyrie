import { useState } from 'react';
import type { ReaderApp } from '../reader-app';
import { CreationRules } from '../creation-rules';
import { Typography } from '../../../src/presentation/typography';

// Your qualities: six rolls of three dice, each on a quality, with what your people and calling add; choose one roll
// and then another to change them over, or roll again. Each says what it comes to by the rules at the score you have:
// what it adds to a blow and to a check, and what else rests on it.
export class QualitiesStep {
  static View({ app }: { app: ReaderApp }) {
    const [held, hold] = useState<string>();
    const s = app.state, m = s.party[0]!, catalog = s.catalog!, rolled = m.rolled as Record<string, number> | undefined;
    if (!rolled) { return null; }
    const calling = catalog.callings.find(c => c.id === m.classId);
    const choose = (q: string) => { if (held && held !== q) { app.opening.place(held, q); } hold(held ? undefined : q); };
    return <>
      <p className="how">{held ? `Now the quality to give ${rolled[held]} to.` : 'Six rolls of three dice. Choose one,'
        + ' then another, to change them over.'}</p>
      <ul className="qualities">{catalog.qualities.map(q => {
        const score = CreationRules.score(m, catalog, q.id), adds = CreationRules.sources(m, catalog, q.id);
        return <li key={q.id} className={held === q.id ? 'held' : undefined}>
          <button type="button" className="roll" data-quality={q.id} aria-pressed={held === q.id}
            aria-label={`${q.name}: rolled ${rolled[q.id]}`} onClick={choose.bind(null, q.id)}>{rolled[q.id]}</button>
          <div className="quality">
            <p className="q"><b>{q.name}</b> <span className="score">{score}</span>
              {adds && <span className="adds">{adds}</span>}
              <span className="mods">{`${CreationRules.signed(CreationRules.fight(score))} in a fight, `
                + `${CreationRules.signed(CreationRules.check(score))} to a roll`}</span></p>
            <ul className="does">{CreationRules.quality(q.id, score, calling).map(l => <li key={l}>{Typography.curl(l)}</li>)}</ul>
          </div>
        </li>;
      })}</ul>
      <p><button type="button" className="option" data-action="reroll" onClick={app.opening.reroll.bind(app.opening)}>
        Roll again</button></p>
    </>;
  }
}
