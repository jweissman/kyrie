import { Children, isValidElement, useEffect, useRef, type ReactElement, type ReactNode } from 'react';
import { Typography } from '../../../src/presentation/typography';
import { Glyphs } from './glyphs';

// A choice at creation as a card held up: its emblem (or, for a weapon, its die) and its name, and only that (the
// owner's review of Mission 18: creation was a horizontal scroll through cards heavy with text). Chosen, it is lit and
// marked; one that cannot be chosen says why. What it is, the rule it brings and everything else it means by the
// rules are said beneath the cards for the chosen one alone; what it is, also when a pointer rests on it.
export interface CardShape {
  name: string; text?: string; rule?: string; facts?: ReactNode[]; chosen?: boolean; shut?: string;
  onChoose: () => void; data?: Record<string, string>; tag?: string; glyph?: string; big?: string;
}
export class Card {
  static View({ name, text, chosen, shut, onChoose, data, tag, glyph, big }: CardShape) {
    const ref = useRef<HTMLButtonElement>(null);
    useEffect(() => { if (chosen) { ref.current?.scrollIntoView({ block: 'nearest', inline: 'nearest' }); } }, [chosen]);
    return (
      <button type="button" ref={ref} className={`card${chosen ? ' chosen' : ''}`} aria-pressed={chosen} disabled={!!shut}
        data-nav onClick={onChoose} title={text ? Typography.curl(text) : undefined}
        {...Object.fromEntries(Object.entries(data ?? {}).map(([k, v]) => [`data-${k}`, v]))}>
        {big ? <span className="card-big">{big}</span> : glyph !== undefined && <Glyphs.View id={glyph} name={name} />}
        <span className="card-name">{Typography.curl(name)}</span>
        {tag && <span className="tag">{Typography.curl(tag)}</span>}
        {shut && <span className="card-shut">{Typography.curl(shut)}</span>}
      </button>
    );
  }
  // A fact headed by what it is ("Keen Senses: +4 to search checks"), the heading set apart.
  static fact(f: string): ReactNode {
    const m = /^([^:]{2,32}): (.+)$/.exec(f);
    return m ? <><b>{Typography.curl(m[1]!)}</b> {Typography.curl(m[2]!)}</> : Typography.curl(f);
  }
  // What the chosen card means by the rules, line by line, under the deck.
  static Particulars({ title, facts }: { title?: string; facts: ReactNode[] }) {
    if (!facts.length) { return null; }
    return (
      <section className="particulars" aria-label={title ? `${title}, by the rules` : 'By the rules'}>
        {title && <p className="label">{Typography.curl(title)}</p>}
        <ul>{facts.map((f, i) => <li key={i}>{typeof f === 'string' ? Card.fact(f) : f}</li>)}</ul>
      </section>
    );
  }
  // The cards laid out together, as many to a row as the stage holds and wrapping onto the next, every one in sight
  // at once; beneath them the chosen card's own words, the rule it brings, and its particulars.
  static Deck({ title, how, children, kind, detail }: { title?: string; how?: string; children: ReactNode; kind?: string;
    detail?: ReactNode }) {
    const chosen = Children.toArray(children).find((c): c is ReactElement<CardShape> => isValidElement<CardShape>(c)
      && !!c.props.chosen)?.props;
    return (
      <section className={`deck${kind ? ` deck-${kind}` : ''}`} aria-label={title}>
        {title && <h2 className="deck-title">{Typography.curl(title)}</h2>}
        {how && <p className="how">{Typography.curl(how)}</p>}
        <div className="cards">{children}</div>
        {chosen && (chosen.text || chosen.rule) && <p className="chosen-lead">
          {chosen.text && <span className="card-text">{Typography.curl(chosen.text)}</span>}
          {chosen.rule && <span className="card-rule">{Typography.curl(chosen.rule)}</span>}</p>}
        {detail}
      </section>
    );
  }
}
