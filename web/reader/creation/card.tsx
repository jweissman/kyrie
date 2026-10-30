import { Children, isValidElement, useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type ReactElement,
  type ReactNode } from 'react';
import { Typography } from '../../../src/presentation/typography';
import { Glyphs } from './glyphs';
import { CreationSheet } from './creation-sheet';

// A choice at creation as a card held up, all of one proportion: its emblem, its name, and a line of a few words of
// what it is (OWN-14: the cards had carried their rules, and a horizontal scroll of them). Chosen, it is lifted and
// edged in gold and the others go quiet; one that cannot be chosen says why. Its sentence is said beneath the cards
// for the chosen one alone, and its rules are behind Details.
export interface CardShape {
  name: string; line?: string; text?: string; chosen?: boolean; shut?: string;
  onChoose: () => void; data?: Record<string, string>; glyph?: string;
}
export class Card {
  static View({ name, line, text, chosen, shut, onChoose, data, glyph }: CardShape) {
    const ref = useRef<HTMLButtonElement>(null);
    useEffect(() => { if (chosen) { ref.current?.scrollIntoView({ block: 'nearest', inline: 'nearest' }); } }, [chosen]);
    return (
      <button type="button" ref={ref} className={`card${chosen ? ' chosen' : ''}`} aria-pressed={chosen} disabled={!!shut}
        data-nav onClick={onChoose} title={text ? Typography.curl(text) : undefined}
        {...Object.fromEntries(Object.entries(data ?? {}).map(([k, v]) => [`data-${k}`, v]))}>
        {glyph !== undefined && <Glyphs.View id={glyph} name={name} />}
        <span className="card-name">{Typography.curl(name)}</span>
        {shut ? <span className="card-line card-shut">{Typography.curl(shut)}</span>
          : <span className="card-line">{line && Typography.curl(line)}</span>}
      </button>
    );
  }
  // A fact headed by what it is ("Keen Senses: +4 to search checks"), the heading set apart.
  static fact(f: string): ReactNode {
    const m = /^([^:]{2,32}): (.+)$/.exec(f);
    return m ? <><b>{Typography.curl(m[1]!)}</b> {Typography.curl(m[2]!)}</> : Typography.curl(f);
  }
  // What the chosen card means by the rules, line by line.
  static Particulars({ title, facts }: { title?: string; facts: ReactNode[] }) {
    if (!facts.length) { return null; }
    return (
      <section className="particulars" aria-label={title ? `${title}, by the rules` : 'By the rules'}>
        {title && <p className="label">{Typography.curl(title)}</p>}
        <ul>{facts.map((f, i) => <li key={i}>{typeof f === 'string' ? Card.fact(f) : f}</li>)}</ul>
      </section>
    );
  }
  // The first sentence of a card's words, for beneath the cards (the rest is on the card, under the pointer).
  static sentence(text: string): string { return /^.+?[.!?](?=\s|$)/.exec(text)?.[0] ?? text; }
  // The cards together, centred, all in sight: the fewer there are, the larger, and as many to a row as leaves none
  // alone on the last (eight in a row on a desk, twelve in two and a little smaller; four to a row on a tablet). Every
  // card's name and line are given the room of the tallest, so that emblems, names and lines stand level across the
  // deck (OWN-14: a name of three lines beside one of one had set a row askew). Beneath them the chosen card's
  // sentence, what more the step shows of it (a school's spells), and the way on: Details, which opens the chosen
  // card's rules over the page, and Continue, kept in sight when the page is longer than the screen.
  static Deck({ kind, children, details, after, onward }: { kind: string; children: ReactNode;
    details?: { title: string; body: ReactNode }; after?: ReactNode; onward?: ReactNode }) {
    const [open, show] = useState(false), cards = Children.toArray(children), deck = useRef<HTMLElement>(null);
    const chosen = cards.find((c): c is ReactElement<CardShape> => isValidElement<CardShape>(c) && !!c.props.chosen)?.props;
    const n = cards.length, size = { '--card-wide': `${n <= 4 ? 176 : n <= 7 ? 150 : n <= 8 ? 140 : 128}px`,
      '--card-narrow': `${n <= 4 ? 176 : n <= 7 ? 150 : 140}px`, '--row': n <= 8 ? n : Math.ceil(n / 2),
      '--row-narrow': n <= 4 ? n : Math.ceil(n / Math.ceil(n / 4)) } as CSSProperties;
    useLayoutEffect(() => {
      const el = deck.current;
      if (!el) { return; }
      const level = () => { Card.level(el, '.card-name', '--name-h'); Card.level(el, '.card-line', '--line-h'); };
      level();
      const watch = new ResizeObserver(level);
      watch.observe(el);
      return () => { watch.disconnect(); };
    }, [n]);
    return (
      <section className={`deck deck-${kind}`} style={size} ref={deck}>
        <div className="cards">{children}</div>
        <p className="chosen-lead" aria-live="polite">{chosen?.text && Typography.curl(Card.sentence(chosen.text))}</p>
        {after}
        <p className="creation-go">
          {details && <button type="button" className="quiet-word details" data-nav data-action="details"
            onClick={() => show(true)}>Details</button>}
          {onward}
        </p>
        {open && details && <CreationSheet.View title={details.title} onClose={() => show(false)}>
          {details.body}</CreationSheet.View>}
      </section>
    );
  }
  // Gives each of a deck's names (or lines) the height of its tallest.
  private static level(deck: HTMLElement, part: string, height: string) {
    deck.style.setProperty(height, 'auto');
    const tallest = Math.max(0, ...[...deck.querySelectorAll<HTMLElement>(part)].map(e => e.offsetHeight));
    deck.style.setProperty(height, `${tallest}px`);
  }
}
