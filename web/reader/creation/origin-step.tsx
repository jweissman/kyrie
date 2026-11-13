import { BackgroundCatalog } from '../../../src/canon/background-catalog';
import type { ReactNode } from 'react';
import type { ReaderApp } from '../reader-app';
import type { CreationStep } from '../../engine/creation-flow';
import type { Catalog } from '../../engine/protocol';
import { Words } from '../words';
import { Card } from './card';
import { PeopleStep } from './people-step';

// Why you have come: the reasons this country holds (a debt, an errand, a child's fever, a father who did not come
// home, or only your trade and the road), each a card with what it makes you in a few words, and its sentence beneath
// for the one chosen. The first page of creation: a life is begun from the reason it is here, before anything is said
// of what it is by the rules.
export class OriginStep {
  static View({ app, step, onward }: { app: ReaderApp; step: CreationStep; onward?: ReactNode }) {
    const s = app.state, catalog = s.catalog!, origins = s.setting?.origins ?? [];
    const origin = origins.find(o => o.id === step.chosen), background = (id: string) => origins.find(o => o.id === id)?.background;
    return (
      <Card.Deck kind="origins" onward={onward} details={origin && { title: origin.title,
        head: { kind: 'Why you came', glyph: origin.id, summary: origin.choice },
        body: <Card.Particulars title="What it has made of you" facts={[OriginStep.makes(origin.background, catalog, s.party[0]?.pronouns)]} /> }}>
        {/* The flow's cards; under each name what it makes you by the rules ("Once a scribe"), its sentence the flow's. */}
        {step.cards.map(o => <Card.View key={o.id} name={o.name} line={OriginStep.rule(background(o.id), catalog, s.party[0]?.pronouns)}
          text={o.text ?? o.line} glyph={o.id} shut={o.shut} chosen={step.chosen === o.id} data={{ action: 'origin', id: o.id }}
          onChoose={() => app.opening.choose(step.id, o.id)} />)}
      </Card.Deck>
    );
  }
  private static rule(background: string | undefined, catalog: Catalog, pronouns?: string): string {
    const b = background && catalog.backgrounds.find(x => x.id === background);
    return b ? `Once ${Words.article(BackgroundCatalog.called(b, pronouns).toLowerCase())}` : 'Your own trade';
  }
  // What an origin makes you: a background of its story, or your trade as you choose it.
  static makes(background: string | undefined, catalog: Catalog, pronouns?: string): string {
    const b = background && catalog.backgrounds.find(x => x.id === background);
    return b ? `Makes you ${Words.article(BackgroundCatalog.called(b, pronouns).toLowerCase())}${b.text ? `, who ${b.text.replace('; ', ' and ')}` : ''}.`
      : 'You bring your own trade: one your calling knows, until you choose another under Details when you are named.';
  }
  // A trade by the rules: what it adds to the qualities, the coin it starts with, and what it carries. Not the coin
  // where an origin begins the game: the origin's purse is what one starts with (a monster hunter had been promised
  // "100 coin to start with" and begun with 22: Mission 20's fourth round, F 20).
  static facts(b: Catalog['backgrounds'][number], catalog: Catalog, origin?: string): string[] {
    return [PeopleStep.adds(b.qualities, catalog), ...origin ? [] : [`${b.coin} coin to start with.`],
      ...b.gear.length ? [`Carries ${b.gear.map(g => Words.article(g)).join(', ')}.`] : []];
  }
}
