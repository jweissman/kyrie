import type { ReactNode } from 'react';
import { Typography } from '../../../src/presentation/typography';

// A choice at creation as a card: its name, what it is, and what it does by the rules, line by line; chosen, it is
// marked so; one that cannot be chosen says why.
export class Card {
  static View({ name, text, facts = [], chosen, shut, onChoose, data, tag }: { name: string; text?: string;
    facts?: ReactNode[]; chosen?: boolean; shut?: string; onChoose: () => void; data?: Record<string, string>;
    tag?: string }) {
    return (
      <button type="button" className={`card${chosen ? ' chosen' : ''}`} aria-pressed={chosen} disabled={!!shut}
        onClick={onChoose} {...Object.fromEntries(Object.entries(data ?? {}).map(([k, v]) => [`data-${k}`, v]))}>
        <span className="card-name">{Typography.curl(name)}{tag && <span className="tag">{Typography.curl(tag)}</span>}</span>
        {text && <span className="card-text">{Typography.curl(text)}</span>}
        {facts.length > 0 && <span className="card-facts">{facts.map((f, i) => <span key={i} className="fact">
          {typeof f === 'string' ? Typography.curl(f) : f}</span>)}</span>}
        {shut && <span className="card-shut">{Typography.curl(shut)}</span>}
      </button>
    );
  }
  // Cards laid out on the page, with a heading and a line about them.
  static Deck({ title, how, children, kind }: { title?: string; how?: string; children: ReactNode; kind?: string }) {
    return (
      <section className={`deck${kind ? ` deck-${kind}` : ''}`} aria-label={title}>
        {title && <h2 className="deck-title">{Typography.curl(title)}</h2>}
        {how && <p className="how">{Typography.curl(how)}</p>}
        <div className="cards">{children}</div>
      </section>
    );
  }
}
