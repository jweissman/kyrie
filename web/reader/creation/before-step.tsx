import type { ReactNode } from 'react';
import type { ReaderApp } from '../reader-app';
import type { Catalog } from '../../engine/protocol';
import { Words } from '../words';
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
      <Card.Deck kind="before" onward={onward} details={{ title: 'Every trade', body: <TradeStep.View app={app} /> }}
        after={mine && <BeforeStep.Trades app={app} trades={open.filter(b => b.kind === mine.kind)} mine={mine.id} />}>
        {catalog.kinds.filter(k => open.some(b => b.kind === k.id)).map(k => {
          const trade = mine?.kind === k.id ? mine : BeforeStep.first(open, k.id, wants);
          return <Card.View key={k.id} name={k.name} glyph={`life_${k.id}`} line={Words.upper(trade.name)}
            text={BeforeStep.said(trade, k.does)} chosen={mine?.kind === k.id} data={{ choice: `backgroundId:${trade.id}` }}
            onChoose={() => app.opening.edit(0, 'backgroundId', trade.id)} />;
        })}
      </Card.Deck>
    );
  }
  // Every trade of the kind chosen, each a word to choose it by (the owner, 3 November: of the hundreds of trades,
  // the cards had reached one a kind).
  static Trades({ app, trades, mine }: { app: ReaderApp; trades: Trade[]; mine: string }) {
    return (
      <div className="trades" aria-label="Trades of this kind">{trades.map(t => <button key={t.id} type="button"
        className="trade" data-nav aria-pressed={t.id === mine} data-choice={`backgroundId:${t.id}`}
        onClick={() => app.opening.edit(0, 'backgroundId', t.id)}>{Words.upper(t.name)}</button>)}</div>
    );
  }
  // The trade of a kind first to hand: one the calling has of its own, if there is one of that kind, else the one whose
  // qualities serve what the calling wants most (a mage offered Poisoner and Courtesan had been offered the first).
  private static first(open: Trade[], kind: string, wants: Record<string, number>): Trade {
    const of = open.filter(b => b.kind === kind);
    return of.find(b => b.calling) ?? [...of].sort((a, b) => BeforeStep.fit(b, wants) - BeforeStep.fit(a, wants))[0]!;
  }
  private static fit(trade: Trade, wants: Record<string, number>): number {
    return Object.entries(wants).reduce((t, [q, w]) => t + (trade.qualities[q] ?? 0) * w, 0);
  }
  private static said(trade: Trade, does: string): string {
    return [trade.text && `${Words.upper(trade.name)}: ${trade.text.replace('; ', ', and ')}.`, does].filter(Boolean).join(' ');
  }
}
