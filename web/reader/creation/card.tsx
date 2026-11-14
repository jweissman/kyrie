import { Children, isValidElement, useLayoutEffect, useRef, useState, type CSSProperties, type ReactElement,
  type ReactNode } from 'react';
import { Typography } from '../../../src/presentation/typography';
import { Glyphs } from './glyphs';
import { CreationSheet, type SheetHead } from './creation-sheet';

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
    // Chosen at a tap, then Continue (the blind playtest of 13 November, BP-09: a card that had to be held had looked
    // chosen and done nothing at a click, "I initially believed the game had ignored me").
    // Chosen, it stays where it is: a press moves nothing on the page, nor the page under it (IG-08).
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
  // What the chosen card means, line by line, headed in words of the world (BP-08: "In play, by the rules" had been
  // the first moment the game sounded like a rules application documenting itself).
  static Particulars({ title, facts }: { title?: string; facts: ReactNode[] }) {
    if (!facts.length) { return null; }
    return (
      <section className="particulars" aria-label={title ?? 'What it means'}>
        {title && <p className="label">{Typography.curl(title)}</p>}
        <ul>{facts.map((f, i) => <li key={i}>{typeof f === 'string' ? Card.fact(f) : f}</li>)}</ul>
      </section>
    );
  }
  static readonly four = 4;
  // The first sentence of a card's words, for beneath the cards (the rest is on the card, under the pointer).
  static sentence(text: string): string { return /^.+?[.!?](?=\s|$)/.exec(text)?.[0] ?? text; }
  // The cards together, centred, all in sight: the fewer there are, the larger, and as many to a row as leaves none
  // alone on the last (eight in a row on a desk, twelve in two and a little smaller; four to a row on a tablet). Every
  // card's name and line are given the room of the tallest, so that emblems, names and lines stand level across the
  // deck (OWN-14: a name of three lines beside one of one had set a row askew). Beneath them the chosen card's
  // sentence, what more the step shows of it (a school's spells), and the way on: Details, which opens the chosen
  // card's rules over the page, and Continue, kept in sight when the page is longer than the screen.
  static Deck({ kind, children, details, after, onward }: { kind: string; children: ReactNode;
    details?: { title: string; body: ReactNode; head?: SheetHead }; after?: ReactNode; onward?: ReactNode }) {
    const [open, show] = useState(false), all = Children.toArray(children), deck = useRef<HTMLElement>(null);
    const chosen = all.find((c): c is ReactElement<CardShape> => isValidElement<CardShape>(c) && !!c.props.chosen)?.props;
    // The four the step leads with (the engine gives them first), the rest one quiet word away and never dumped (the
    // owner, 14 November: four promoted on every surface).
    const [more, unfold] = useState(false);
    // The deck's layout is the step's, fixed: the four, and the rest behind one quiet word the player alone opens; a press
    // never changes which cards are shown or where (IG-08: a card chosen outside the four had unfolded the deck under
    // the hand).
    const folds = all.length > Card.four + 1 && !more, cards = folds ? all.slice(0, Card.four) : all;
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
      <section className={`deck deck-${kind}${n >= 7 ? ' deck-many' : ''}`} style={size} ref={deck}>
        <div className="cards">{cards}</div>
        {folds && <p className="deck-more"><button type="button" className="quiet-word" data-nav data-action="more-cards"
          onClick={() => unfold(true)}>{`${all.length - Card.four} more`}</button></p>}
        <p className="chosen-lead" aria-live="polite">{chosen?.text && Typography.curl(Card.sentence(chosen.text))}</p>
        {after}
        <p className="creation-go">
          {details && <button type="button" className="quiet-word details" data-nav data-action="details"
            onClick={() => show(true)}>Details</button>}
          {onward}
        </p>
        {open && details && <CreationSheet.View title={details.title} head={details.head} onClose={() => show(false)}>
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
