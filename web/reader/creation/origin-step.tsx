import type { ReaderApp } from '../reader-app';
import type { Catalog } from '../../engine/protocol';
import { Words } from '../words';
import { Card } from './card';
import { PeopleStep } from './people-step';

// Why you have come: the reasons this country holds (a debt, an errand, a child's fever, a father who did not come
// home, or only your trade and the road), each a card with what it makes you. The first page of creation: a life is
// begun from the reason it is here, before anything is said of what it is by the rules.
export class OriginStep {
  static View({ app }: { app: ReaderApp }) {
    const s = app.state, catalog = s.catalog!, origins = s.setting?.origins ?? [];
    const origin = origins.find(o => o.id === s.origin);
    return (
      <Card.Deck kind="origins" detail={origin && <Card.Particulars title={origin.title}
        facts={[OriginStep.makes(origin.background, catalog)]} />}>
        {origins.map(o => <Card.View key={o.id} name={o.title} text={o.choice} glyph={o.id} chosen={s.origin === o.id}
          rule={OriginStep.rule(o.background, catalog)} data={{ action: 'origin', id: o.id }}
          onChoose={() => app.opening.origin(o.id)} />)}
      </Card.Deck>
    );
  }
  private static rule(background: string | undefined, catalog: Catalog): string {
    const b = background && catalog.backgrounds.find(x => x.id === background);
    return b ? `Once ${Words.article(b.name.toLowerCase())}` : 'Your own trade, chosen later';
  }
  // What an origin makes you: a background of its story, or your trade as you choose it.
  static makes(background: string | undefined, catalog: Catalog): string {
    const b = background && catalog.backgrounds.find(x => x.id === background);
    return b ? `Makes you ${Words.article(b.name.toLowerCase())}${b.text ? `, who ${b.text.replace('; ', ' and ')}` : ''}.`
      : 'You bring your own trade: you choose it after your calling.';
  }
  // A trade by the rules: what it adds to the qualities, the coin it starts with, and what it carries.
  static facts(b: Catalog['backgrounds'][number], catalog: Catalog): string[] {
    return [PeopleStep.adds(b.qualities, catalog), `${b.coin} coin to start with.`,
      ...b.gear.length ? [`Carries ${b.gear.map(g => Words.article(g)).join(', ')}.`] : []];
  }
}
