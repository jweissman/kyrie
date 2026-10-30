import type { ReaderApp } from '../reader-app';
import { Typography } from '../../../src/presentation/typography';
import { Words } from '../words';
import { Card } from './card';
import { OriginStep } from './origin-step';

// What you were before, for one who comes with their trade and not much else, behind Details on the last page: the
// calling's own trade until another is chosen (see CreationDefaults), and the trades open to the calling by the kind
// of life (the roads, learning, the earth, the water…), the kind of the one held open, each a row with the coin it
// starts with and what it knows and carries where that is not what its kind's trades mostly do ("Knows lore" had
// stood on fifteen rows of one kind). Two hundred trades scroll down, never sideways.
export class TradeStep {
  static View({ app }: { app: ReaderApp }) {
    const s = app.state, catalog = s.catalog!, m = s.party[0]!;
    const open = catalog.backgrounds.filter(b => !b.calling || b.calling === m.classId);
    const kinds = catalog.kinds.filter(k => open.some(b => b.kind === k.id)), mine = open.find(b => b.id === m.backgroundId);
    return <>
      {mine && <Card.Particulars title={Words.upper(mine.name)} facts={OriginStep.facts(mine, catalog)} />}
      {kinds.map(k => {
        const rows = open.filter(b => b.kind === k.id), most = TradeStep.most(rows.map(b => b.text));
        return <details key={k.id} className="kit-group" open={mine?.kind === k.id}>
          <summary>{Typography.curl(Words.upper(k.name))}<small>{rows.length}</small></summary>
          <p className="how">{Typography.curl([most && `Most ${most.replace(/\bknows\b/, 'know')
            .replace(/\bcarries\b/, 'carry').replace('; ', ', and ')}.`, k.does].filter(Boolean).join(' '))}</p>
          <ul className="kit-rows">{rows.map(b => <li key={b.id}>
            <button type="button" className="kit-row" data-nav aria-pressed={m.backgroundId === b.id}
              data-choice={`backgroundId:${b.id}`} onClick={() => app.opening.edit(0, 'backgroundId', b.id)}>
              <span className="name">{Words.upper(b.name)}</span>
              <span className="what">{Typography.curl(b.text && b.text !== most
                ? `${Words.upper(b.text.replace('; ', ', and '))}.` : '')}</span>
              <span className="tag">{b.coin} coin</span>
            </button></li>)}</ul>
        </details>;
      })}
    </>;
  }
  // What most of a kind's trades know and carry, if most of them say the same.
  private static most(texts: string[]): string | undefined {
    const counts = new Map<string, number>();
    for (const t of texts) { counts.set(t, (counts.get(t) ?? 0) + 1); }
    const [text, n] = [...counts].sort((a, b) => b[1] - a[1])[0] ?? ['', 0];
    return n > 1 && n * 2 >= texts.length ? text : undefined;
  }
}
