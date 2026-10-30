import type { ReactNode } from 'react';
import type { ReaderApp } from '../reader-app';
import type { Catalog } from '../../engine/protocol';
import { Words } from '../words';
import { Card } from './card';
import { PeopleStep } from './people-step';

// Why you have come: the reasons this country holds (a debt, an errand, a child's fever, a father who did not come
// home, or only your trade and the road), each a card with what it makes you in a few words, and its sentence beneath
// for the one chosen. The first page of creation: a life is begun from the reason it is here, before anything is said
// of what it is by the rules.
export class OriginStep {
  static View({ app, onward }: { app: ReaderApp; onward?: ReactNode }) {
    const s = app.state, catalog = s.catalog!, origins = s.setting?.origins ?? [];
    const origin = origins.find(o => o.id === s.origin);
    return (
      <Card.Deck kind="origins" onward={onward} details={origin && { title: origin.title,
        body: <Card.Particulars facts={[OriginStep.makes(origin.background, catalog)]} /> }}>
        {origins.map(o => <Card.View key={o.id} name={o.title} line={OriginStep.rule(o.background, catalog)}
          text={o.choice} glyph={o.id} chosen={s.origin === o.id} data={{ action: 'origin', id: o.id }}
          onChoose={() => app.opening.origin(o.id)} />)}
      </Card.Deck>
    );
  }
  private static rule(background: string | undefined, catalog: Catalog): string {
    const b = background && catalog.backgrounds.find(x => x.id === background);
    return b ? `Once ${Words.article(b.name.toLowerCase())}` : 'Your own trade';
  }
  // What an origin makes you: a background of its story, or your trade as you choose it.
  static makes(background: string | undefined, catalog: Catalog): string {
    const b = background && catalog.backgrounds.find(x => x.id === background);
    return b ? `Makes you ${Words.article(b.name.toLowerCase())}${b.text ? `, who ${b.text.replace('; ', ' and ')}` : ''}.`
      : 'You bring your own trade: one your calling knows, until you choose another under Details when you are named.';
  }
  // A trade by the rules: what it adds to the qualities, the coin it starts with, and what it carries.
  static facts(b: Catalog['backgrounds'][number], catalog: Catalog): string[] {
    return [PeopleStep.adds(b.qualities, catalog), `${b.coin} coin to start with.`,
      ...b.gear.length ? [`Carries ${b.gear.map(g => Words.article(g)).join(', ')}.`] : []];
  }
}
