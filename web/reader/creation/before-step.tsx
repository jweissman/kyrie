import type { ReactNode } from 'react';
import type { ReaderApp } from '../reader-app';
import type { Catalog } from '../../engine/protocol';
import { Card } from './card';
import { TradeStep } from './trade-step';

type Trade = Catalog['backgrounds'][number];

// What you did before this: the kind of life your trade was (the roads, learning, the shadows, the water…), a card for
// each your calling is open to, naming the trade of it you held (your calling's own until another is chosen); behind
// Details every trade, to choose one by name (the owner, 3 November: the decision had gone behind Details on the last
// page, where nobody made it).
export class BeforeStep {
  static readonly ask = 'What did you do before this?';
  static View({ app, onward }: { app: ReaderApp; onward?: ReactNode }) {
    const s = app.state, catalog = s.catalog!, m = s.party[0]!;
    const open = catalog.backgrounds.filter(b => !b.calling || b.calling === m.classId);
    const mine = open.find(b => b.id === m.backgroundId);
    const wants = catalog.callings.find(c => c.id === m.classId)?.qualities ?? {};
    return (
      // The kind of life only, as the engine's creation flow asks it (CreationFlow): the trade within it is the one
      // that best suits the calling, to be chosen later in play (the owner, 14 November: the cards had asked for the
      // specific trade at once).
      <Card.Deck kind="before" onward={onward}>
        {catalog.kinds.filter(k => open.some(b => b.kind === k.id)).map(k => {
          const trade = mine?.kind === k.id ? mine : BeforeStep.first(open, k.id, wants);
          return <Card.View key={k.id} name={k.name} glyph={`life_${k.id}`} text={k.does} chosen={mine?.kind === k.id}
            data={{ choice: `backgroundId:${trade.id}` }} onChoose={() => app.opening.edit(0, 'backgroundId', trade.id)} />;
        })}
      </Card.Deck>
    );
  }
  private static first(open: Trade[], kind: string, wants: Record<string, number>): Trade {
    const of = open.filter(b => b.kind === kind);
    return of.find(b => b.calling) ?? [...of].sort((a, b) => TradeStep.fit(b, wants) - TradeStep.fit(a, wants))[0]!;
  }
}
