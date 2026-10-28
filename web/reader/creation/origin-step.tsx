import { useState } from 'react';
import type { ReaderApp } from '../reader-app';
import type { Catalog, Member } from '../../engine/protocol';
import { Typography } from '../../../src/presentation/typography';
import { Words } from '../words';
import { Card } from './card';
import { PeopleStep } from './people-step';

// Why you have come: the reasons this country holds (a debt, an errand, a child's fever, a father who did not come
// home), each with what it makes you; and for one who comes with their trade and not much else, the trade, from every
// background open to your calling, by kind (the roads, learning, the earth, the water...), each with what it knows and
// carries. A wanderer had been offered only the few trades kept for their calling.
export class OriginStep {
  static View({ app }: { app: ReaderApp }) {
    const s = app.state, catalog = s.catalog!, m = s.party[0]!, origins = s.setting?.origins ?? [];
    const origin = origins.find(o => o.id === s.origin);
    return <>
      <Card.Deck title="Why you have come" kind="origins">
        {origins.map(o => <Card.View key={o.id} name={o.title} text={o.choice} chosen={s.origin === o.id}
          data={{ action: 'origin', id: o.id }} facts={[OriginStep.makes(o.background, catalog)]}
          onChoose={() => app.opening.origin(o.id)} />)}
      </Card.Deck>
      {origin && !origin.background && <OriginStep.Trade app={app} member={m} catalog={catalog} />}
    </>;
  }
  // What an origin makes you: a background of its story, or your trade as you choose it.
  static makes(background: string | undefined, catalog: Catalog): string {
    const b = background && catalog.backgrounds.find(x => x.id === background);
    return b ? `Makes you ${Words.article(b.name.toLowerCase())}${b.text ? `, who ${b.text.replace('; ', ' and ')}` : ''}.`
      : 'You bring your own trade: choose it below.';
  }
  // A trade by the rules: what it adds to the qualities, the coin it starts with, and what it carries.
  static facts(b: Catalog['backgrounds'][number], catalog: Catalog): string[] {
    return [PeopleStep.adds(b.qualities, catalog), `${b.coin} coin to start with.`,
      ...b.gear.length ? [`Carries ${b.gear.map(g => Words.article(g)).join(', ')}.`] : []];
  }
  static Trade({ app, member: m, catalog }: { app: ReaderApp; member: Member; catalog: Catalog }) {
    const open = catalog.backgrounds.filter(b => !b.calling || b.calling === m.classId);
    const kinds = catalog.kinds.filter(k => open.some(b => b.kind === k.id));
    const mine = open.find(b => b.id === m.backgroundId), [kind, choose] = useState(mine?.kind ?? kinds[0]?.id ?? '');
    return (
      <section className="trade" aria-label="Your trade">
        <h2 className="deck-title">Your trade</h2>
        <p className="how">{`${open.length} trades are open to you, by what they are. What one knows is a skill you`
          + ' bring to every roll it serves; what it carries is in your pack.'}</p>
        <ul className="kinds">{kinds.map(k => <li key={k.id}><button type="button" className="kind"
          aria-pressed={kind === k.id} onClick={() => choose(k.id)}>{Typography.curl(Words.upper(k.name))}
          <small>{open.filter(b => b.kind === k.id).length}</small></button></li>)}</ul>
        {catalog.kinds.find(k => k.id === kind)?.does && <p className="how">{Typography.curl(
          catalog.kinds.find(k => k.id === kind)!.does)}</p>}
        <div className="cards">{open.filter(b => b.kind === kind).map(b => <Card.View key={b.id} name={Words.upper(b.name)}
          chosen={m.backgroundId === b.id} data={{ choice: `backgroundId:${b.id}` }} facts={OriginStep.facts(b, catalog)}
          onChoose={() => app.opening.edit(0, 'backgroundId', m.backgroundId === b.id ? '' : b.id)} />)}</div>
      </section>
    );
  }
}
