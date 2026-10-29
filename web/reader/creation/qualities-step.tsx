import { useState } from 'react';
import type { ReaderApp } from '../reader-app';
import { CreationRules } from '../creation-rules';
import { Card } from './card';

// Your qualities: six rolls of three dice, a tile each, with the score your people, calling and past make of it;
// choose one roll and then another to change them over, or roll again. Beneath, what the quality under the pointer
// (or the one chosen) comes to by the rules at its score: what it adds to a blow and to a check, and what else rests
// on it.
export class QualitiesStep {
  static View({ app }: { app: ReaderApp }) {
    const [held, hold] = useState<string>(), [shown, show] = useState<string>();
    const s = app.state, m = s.party[0]!, catalog = s.catalog!, rolled = m.rolled as Record<string, number> | undefined;
    if (!rolled) { return null; }
    const calling = catalog.callings.find(c => c.id === m.classId);
    const choose = (q: string) => { if (held && held !== q) { app.opening.place(held, q); } hold(held ? undefined : q); };
    const about = catalog.qualities.find(q => q.id === (shown ?? held)) ?? catalog.qualities[0]!;
    return <>
      <p className="how">{held ? `Now the quality to give ${rolled[held]} to.` : 'Six rolls of three dice. Choose one,'
        + ' then another, to change them over.'}</p>
      <ul className="qualities">{catalog.qualities.map(q => {
        const score = CreationRules.score(m, catalog, q.id), adds = CreationRules.sources(m, catalog, q.id);
        return <li key={q.id} className={held === q.id ? 'held' : undefined} onMouseEnter={() => show(q.id)}>
          <span className="q-name">{q.name}</span>
          <button type="button" className="roll" data-nav data-quality={q.id} aria-pressed={held === q.id}
            aria-label={`${q.name}: rolled ${rolled[q.id]}`} onFocus={() => show(q.id)}
            onClick={choose.bind(null, q.id)}>{rolled[q.id]}</button>
          <span className="q-score">{score === rolled[q.id] ? 'as rolled' : `${score} with ${adds}`}</span>
        </li>;
      })}</ul>
      <Card.Particulars title={`${about.name} at ${CreationRules.score(m, catalog, about.id)}`}
        facts={CreationRules.quality(about.id, CreationRules.score(m, catalog, about.id), calling)} />
      <p className="again"><button type="button" className="option" data-nav data-action="reroll"
        onClick={app.opening.reroll.bind(app.opening)}>Roll again</button></p>
    </>;
  }
}
