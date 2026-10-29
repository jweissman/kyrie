import { useState } from 'react';
import type { ReaderApp } from '../reader-app';
import { Typography } from '../../../src/presentation/typography';
import { Words } from '../words';
import { Card } from './card';
import { OriginStep } from './origin-step';

// What you were before, for one who comes with their trade and not much else: first the kind of life (the roads,
// learning, the earth, the water…), then the trades of that kind open to your calling, each a card with what it knows
// and carries. A wanderer had been offered only the few trades kept for their calling; then 211 at once.
export class TradeStep {
  static View({ app }: { app: ReaderApp }) {
    const s = app.state, catalog = s.catalog!, m = s.party[0]!;
    const open = catalog.backgrounds.filter(b => !b.calling || b.calling === m.classId);
    const kinds = catalog.kinds.filter(k => open.some(b => b.kind === k.id));
    const mine = open.find(b => b.id === m.backgroundId), [kind, choose] = useState(mine?.kind ?? kinds[0]?.id ?? '');
    const does = catalog.kinds.find(k => k.id === kind)?.does;
    return <>
      <ul className="kinds" aria-label="Kinds of life">{kinds.map(k => <li key={k.id}><button type="button" className="kind"
        data-nav aria-pressed={kind === k.id} onClick={() => choose(k.id)}>{Typography.curl(Words.upper(k.name))}
        <small>{open.filter(b => b.kind === k.id).length}</small></button></li>)}</ul>
      {does && <p className="how">{Typography.curl(does)}</p>}
      <Card.Deck kind="trades" detail={mine && <Card.Particulars title={Words.upper(mine.name)}
        facts={OriginStep.facts(mine, catalog)} />}>
        {open.filter(b => b.kind === kind).map(b => <Card.View key={b.id} name={Words.upper(b.name)} glyph=""
          text={b.text ? `${Words.upper(b.text.replace('; ', ', and '))}.` : undefined} chosen={m.backgroundId === b.id}
          rule={`${b.coin} coin to start with`} data={{ choice: `backgroundId:${b.id}` }}
          onChoose={() => app.opening.edit(0, 'backgroundId', m.backgroundId === b.id ? '' : b.id)} />)}
      </Card.Deck>
    </>;
  }
}
