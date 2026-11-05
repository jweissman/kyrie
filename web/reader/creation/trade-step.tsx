import type { ReaderApp } from '../reader-app';
import { Typography } from '../../../src/presentation/typography';
import { Words } from '../words';
import { Card } from './card';
import { OriginStep } from './origin-step';

type Trade = NonNullable<ReaderApp['state']['catalog']>['backgrounds'][number];

// What you were before, for one who comes with their trade and not much else, behind Details on the last page: the
// calling's own trade until another is chosen (see CreationDefaults), and the trades open to the calling by the kind
// of life (the roads, learning, the earth, the water…), the kind of the one held open, each a row with the coin it
// starts with and what it knows and carries where that is not what its kind's trades mostly do ("Knows lore" had
// stood on fifteen rows of one kind). Those that give the same as the rest of their kind are folded, but for one.
export class TradeStep {
  static View({ app }: { app: ReaderApp }) {
    const s = app.state, catalog = s.catalog!, m = s.party[0]!;
    const open = catalog.backgrounds.filter(b => !b.calling || b.calling === m.classId);
    const kinds = catalog.kinds.filter(k => open.some(b => b.kind === k.id)), mine = open.find(b => b.id === m.backgroundId);
    const wants = catalog.callings.find(c => c.id === m.classId)?.qualities;
    return <>
      {mine && <Card.Particulars title={Words.upper(mine.name)} facts={OriginStep.facts(mine, catalog)} />}
      {kinds.map(k => {
        const rows = open.filter(b => b.kind === k.id), most = TradeStep.most(rows.map(b => b.text)), held = m.backgroundId;
        const alike = TradeStep.alike(rows, most, { held, wants: wants ?? {} });
        return <details key={k.id} className="kit-group" open={mine?.kind === k.id}>
          <summary>{Typography.curl(Words.upper(k.name))}<small>{rows.length}</small></summary>
          <p className="how">{Typography.curl([most && `Most ${most.replace(/\bknows\b/, 'know')
            .replace(/\bcarries\b/, 'carry').replace('; ', ', and ')}.`, k.does].filter(Boolean).join(' '))}</p>
          <ul className="kit-rows">{rows.filter(b => !alike.includes(b)).map(b =>
            <TradeStep.Row key={b.id} app={app} trade={b} most={most} />)}</ul>
          {alike.length > 0 && <details className="kit-more">
            <summary>{`${alike.length} more, alike in what they give`}</summary>
            <ul className="kit-rows">{alike.map(b =>
              <TradeStep.Row key={b.id} app={app} trade={b} most={most} />)}</ul></details>}
        </details>;
      })}
    </>;
  }
  // A trade as a row: its name, what it knows and carries where that is not its kind's usual, its coin.
  static Row({ app, trade: b, most }: { app: ReaderApp; trade: Trade; most?: string }) {
    const m = app.state.party[0]!;
    return <li><button type="button" className="kit-row" data-nav aria-pressed={m.backgroundId === b.id}
      data-choice={`backgroundId:${b.id}`} onClick={() => app.opening.edit(0, 'backgroundId', b.id)}>
      <span className="name">{Words.upper(b.name)}</span>
      <span className="what">{Typography.curl(b.text && b.text !== most ? `${Words.upper(b.text.replace('; ', ', and '))}.` : '')}</span>
      <span className="tag">{b.coin} coin</span>
    </button></li>;
  }
  // Those alike in what they give, but for the one held and the one most fit for the calling (its qualities, then
  // its coin), which are shown with the trades that differ; the rest folded (the product-design review's PD-02: thirty
  // scholarly trades, academician to polymath, that gave the same, at once; the one shown had been the first by name).
  static alike(rows: Trade[], most: string | undefined, at: { held?: string; wants: Record<string, number> }): Trade[] {
    if (!most) { return []; }
    return rows.filter(b => b.text === most && b.id !== at.held)
      .sort((a, b) => TradeStep.fit(b, at.wants) - TradeStep.fit(a, at.wants) || b.coin - a.coin).slice(1);
  }
  // How well a trade suits a calling: what it adds to the qualities the calling rests on, weighed as the calling does.
  static fit(trade: Trade, wants: Record<string, number>): number {
    return Object.entries(wants).reduce((t, [q, w]) => t + (trade.qualities[q] ?? 0) * w, 0);
  }
  // What most of a kind's trades know and carry, if most of them say the same.
  static most(texts: string[]): string | undefined {
    const counts = new Map<string, number>();
    for (const t of texts) { counts.set(t, (counts.get(t) ?? 0) + 1); }
    const [text, n] = [...counts].sort((a, b) => b[1] - a[1])[0] ?? ['', 0];
    return n > 1 && n * 2 >= texts.length ? text : undefined;
  }
}
