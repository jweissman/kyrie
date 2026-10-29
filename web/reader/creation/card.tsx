import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Typography } from '../../../src/presentation/typography';
import { Glyphs } from './glyphs';

// A choice at creation as a card held up: its emblem (or, for a weapon, its die), its name, a line or two of what it
// is, and the rule it brings in a phrase. Chosen, it is lit and marked; one that cannot be chosen says why. Everything
// else it means by the rules is said beneath the deck for the chosen card alone, not on every card at once.
export interface CardShape {
  name: string; text?: string; rule?: string; facts?: ReactNode[]; chosen?: boolean; shut?: string;
  onChoose: () => void; data?: Record<string, string>; tag?: string; glyph?: string; big?: string;
}
export class Card {
  static View({ name, text, rule, chosen, shut, onChoose, data, tag, glyph, big }: CardShape) {
    const ref = useRef<HTMLButtonElement>(null);
    useEffect(() => { if (chosen) { ref.current?.scrollIntoView({ block: 'nearest', inline: 'nearest' }); } }, [chosen]);
    return (
      <button type="button" ref={ref} className={`card${chosen ? ' chosen' : ''}`} aria-pressed={chosen} disabled={!!shut}
        data-nav onClick={onChoose} {...Object.fromEntries(Object.entries(data ?? {}).map(([k, v]) => [`data-${k}`, v]))}>
        {big ? <span className="card-big">{big}</span> : glyph !== undefined && <Glyphs.View id={glyph} name={name} />}
        <span className="card-name">{Typography.curl(name)}</span>
        {tag && <span className="tag">{Typography.curl(tag)}</span>}
        {text && <span className="card-text">{Typography.curl(text)}</span>}
        {rule && <span className="card-rule">{Typography.curl(rule)}</span>}
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
  // Cards in a row, as many as the stage holds, the rest a turn of the deck away (its arrows, a swipe, or the keys
  // moving on to them): a few large choices at once, never a wall of them.
  static Deck({ title, how, children, kind, detail }: { title?: string; how?: string; children: ReactNode; kind?: string;
    detail?: ReactNode }) {
    const row = useRef<HTMLDivElement>(null), [ends, see] = useState({ back: false, on: false });
    useEffect(() => {
      const el = row.current;
      if (!el) { return; }
      const look = () => see({ back: el.scrollLeft > 4, on: el.scrollLeft + el.clientWidth < el.scrollWidth - 4 });
      look();
      el.addEventListener('scroll', look, { passive: true });
      const watch = new ResizeObserver(look);
      watch.observe(el);
      return () => { el.removeEventListener('scroll', look); watch.disconnect(); };
    }, [children]);
    const turn = (by: number) => row.current?.scrollBy({ left: by * row.current.clientWidth * 0.8, behavior: 'smooth' });
    return (
      <section className={`deck${kind ? ` deck-${kind}` : ''}`} aria-label={title}>
        {title && <h2 className="deck-title">{Typography.curl(title)}</h2>}
        {how && <p className="how">{Typography.curl(how)}</p>}
        <div className="deck-row">
          <button type="button" className="deck-turn back" aria-label="The cards before" hidden={!ends.back}
            onClick={() => turn(-1)}>‹</button>
          <div className="cards" ref={row}>{children}</div>
          <button type="button" className="deck-turn on" aria-label="More cards" hidden={!ends.on}
            onClick={() => turn(1)}>›</button>
        </div>
        {detail}
      </section>
    );
  }
}
