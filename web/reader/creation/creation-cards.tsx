import { useEffect, useRef, useState, type ReactNode } from 'react';
import type { CreationCard, CreationStep } from '../../../src/creation/creation-flow';
import { Typography } from '../../../src/presentation/typography';
import { PressGuard } from '../press-guard';
import { ChoiceRow } from '../stage/choice-row';
import { Glyphs } from './glyphs';
import { ComposedRow } from './composed-row';
import type { Offer } from './composed-options';

// Whether a card's page is open (reading: the page of the card considered), the card turning over to it, and the
// gestures that open it and go back to the cards.
export interface Book { reading: boolean; turning?: string; open: (id: string) => void; back: () => void }

// A step the engine hints as cards (CreationStep.present: the ancestry; the owner, 27 November: "If anything is a card,
// it's this, even if we use the card very sparingly, and the cards would be an instrument that doubled what the menu
// can already do: the menu would still be there"; OR-1801). The cards are the step's own cards, one to each of the
// menu's rows and in their order, drawn beside the menu: coming to a card considers it as coming to its row does, and
// a press turns it over to its page in the book (Book), never chooses it. Nothing here is a control of the card's own:
// what is chosen is chosen by the row, in the menu or at the foot of the page.
export class CreationCards {
  // Beside the menu: the cards, or the page of the one considered where a card has been opened, with the menu's own row
  // for it at its foot (the same option, choosing as the menu's does).
  static Beside({ step, offer, lit, book, look, choose }: { step: CreationStep; offer: Offer; lit: string; book: Book;
    look: (id: string) => void; choose: (id: string) => void }) {
    if (!book.reading) {
      return <CreationCards.View cards={step.cards} lit={lit} turning={book.turning} consider={look} open={book.open} />;
    }
    const card = step.cards.find(c => c.id === lit), option = offer.options.find(o => o.id === lit);
    return card && option ? <CreationCards.Book card={card} section={card.entry?.book ?? step.ask} back={book.back}
      choose={<ComposedRow.View option={option} chosen={step.chosen === lit} onConsider={() => undefined}
        onChoose={choose} />} /> : null;
  }
  // The book as a step holds it: shut when the step changes; a card opened turns over first, then its page is up.
  static useBook(at: string | undefined, consider: (id: string) => void): Book {
    const [reading, read] = useState(false), [turning, turn] = useState<string>(), timer = useRef(0);
    useEffect(() => { read(false); turn(undefined); return () => window.clearTimeout(timer.current); }, [at]);
    const open = (id: string) => {
      consider(id);
      if (matchMedia('(prefers-reduced-motion: reduce)').matches) { read(true); return; }
      turn(id);
      timer.current = window.setTimeout(() => { turn(undefined); read(true); }, CreationCards.turn);
    };
    return { reading, ...turning ? { turning } : {}, open, back: () => read(false) };
  }
  // lit: the card considered (the menu's lit row); turning: the card being turned over to its page.
  static View({ cards, lit, turning, consider, open }: { cards: CreationCard[]; lit: string; turning?: string;
    consider: (id: string) => void; open: (id: string) => void }) {
    return <ul className="creation-cards" data-region="cards" aria-label="The cards: each opens its page">
      {cards.map(c => <li key={c.id}>
        <button type="button" className={`card${turning === c.id ? ' turning' : ''}`} data-control="card" data-card={c.id}
          data-considered={lit === c.id || undefined} aria-label={`${c.name}: open its page`}
          onMouseEnter={() => consider(c.id)} onFocus={() => consider(c.id)} {...PressGuard.once(() => open(c.id))}>
          {c.emblem && <Glyphs.View id={c.emblem} className="card-glyph" />}
          <b>{Typography.curl(c.name)}</b>
          {c.line && <span>{Typography.curl(c.line)}</span>}
        </button></li>)}
    </ul>;
  }
  // How long a card takes to turn over before its page is up, in milliseconds (none for one who asks for less motion).
  static readonly turn = 200;
  // The card's page in the book: the encyclopedia's entry for it as the engine gives it (CreationEntry), set as a page
  // of the Encyclopedia of Imbar on the backstage's parchment (the owner, 27 November: "You have cards, but those flip
  // to pages in the 'book' where you can read the information about the species. Which should be styled like a real
  // encyclopedia page"): its running head, its name, its words under their heads, its facts, what it is born with;
  // and at its foot the menu's own row for it, which chooses it, and the way back to the cards.
  static Book({ card, section, choose, back }: { card: CreationCard; section: string; choose: ReactNode;
    back: () => void }) {
    const entry = card.entry;
    useEffect(() => {
      const key = (e: KeyboardEvent) => {
        if (e.key !== 'Escape') { return; }
        e.preventDefault(); e.stopImmediatePropagation(); back();
      };
      window.addEventListener('keydown', key, true);
      return () => window.removeEventListener('keydown', key, true);
    }, [back]);
    return <aside className="creation-book" data-region="book" aria-label={`${card.name}, from the encyclopedia`}>
      <article className="book-page folio-sheet">
        {/* Each people's page read from its head: turned to another, the page is not left scrolled where the last was. */}
        <div className="book-body" key={card.id} data-book={card.id}>
          <header className="book-running"><span>The Encyclopedia of Imbar</span><span>{section}</span></header>
          <h2 className="book-title">{Typography.curl(card.name)}</h2>
          {entry?.play && <p className="book-play">{Typography.curl(entry.play)}</p>}
          {(entry?.text ?? (card.text ? [{ text: card.text }] : [])).map((p, i) => <p key={i}
            className={i === 0 && !p.heading ? 'book-lede' : 'book-para'}>
            {p.heading && <b className="run-in">{Typography.curl(p.heading)}. </b>}{Typography.curl(p.text)}</p>)}
          {entry && entry.facts.length > 0 && <dl className="book-facts">{entry.facts.map(([k, v]) =>
            <div key={k}><dt>{k}</dt><dd>{Typography.curl(v)}</dd></div>)}</dl>}
          {entry?.groups?.map(g => <section key={g.heading} className="book-group" aria-label={g.heading}>
            <h3>{g.heading}</h3>
            <ul>{g.rows.map(x => <li key={x.id}><b>{Typography.curl(x.name)}.</b> {Typography.curl(x.line)}</li>)}</ul>
          </section>)}
        </div>
        <footer className="book-foot">{choose}
          <ChoiceRow.Button className="book-out" data={{ action: 'cards' }} label="Back to the cards" glyph="back"
            plain="neutral" own={{ 'data-nav': true, ...PressGuard.once(back) }} /></footer>
      </article>
    </aside>;
  }
}
