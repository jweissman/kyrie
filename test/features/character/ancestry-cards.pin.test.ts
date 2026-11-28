import { describe, expect, it } from 'bun:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Creation } from '../../../web/engine/creation';
import { CreationFlow } from '../../../src/creation/creation-flow';
import type { Setting } from '../../../src/creation/protocol';
import { CreationCards, type Book } from '../../../web/reader/creation/creation-cards';
import { ComposedOptions } from '../../../web/reader/creation/composed-options';

// Feature pins: see test/features/choice/consequence.pin.test.ts. The ancestry is chosen beside its cards (the owner,
// 27 November: "If anything is a card, it's this, even if we use the card very sparingly, and the cards would be an
// instrument that doubled what the menu can already do: the menu would still be there"; "those flip to pages in the
// 'book' where you can read the information about the species. Which should be styled like a real encyclopedia page";
// OR-1801): the engine hints cards for the ancestry and nothing else; the cards are its rows, one to each, and a press
// opens a card's page, chooses nothing; the page is the encyclopedia's entry, under its running head, with the menu's
// own row for it at its foot and the way back to the cards.
const names = { human: { she: ['Wenna'], he: ['Odo'], they: ['Wren'] } };
const setting: Setting = { title: 'Marshfen', generated: true, pitch: { heading: '', text: '' }, names,
  party: [Creation.protagonist('human', 'cards', names)] };
const shut: Book = { reading: false, open: () => undefined, back: () => undefined };
const step = () => new CreationFlow(setting, Creation.catalog()).steps().find(x => x.id === 'you')!;
const beside = (book: Book, lit: string) => { const s = step();
  return renderToStaticMarkup(createElement(CreationCards.Beside, { step: s, offer: ComposedOptions.of(s), lit, book,
    look: () => undefined, choose: () => undefined })); };

describe('Character › Ancestries as cards beside the menu, each a page of the book', () => {
  it('hints cards for the ancestry alone, one card to each of its rows, none of them a choice', () => {
    const steps = new CreationFlow(setting, Creation.catalog()).steps();
    expect(steps.filter(x => x.present === 'cards').map(x => x.id)).toEqual(['you']);
    const cards = beside(shut, 'elf');
    expect([...cards.matchAll(/data-card="(\w+)"/g)].map(m => m[1])).toEqual(step().cards.map(c => c.id));
    expect(cards).not.toContain('data-option');
    expect(cards).toMatch(/data-card="elf" data-considered="true"/);
  });
  it('opens to the encyclopedia\'s page, the menu\'s own row at its foot and the way back to the cards', () => {
    const page = beside({ ...shut, reading: true }, 'elf');
    expect(page).toContain('<span>The Encyclopedia of Imbar</span><span>Ancestries</span>');
    expect(page).toMatch(/<h2 class="book-title">Elf<\/h2>/);
    expect(page).toMatch(/<p class="book-lede">Elves of the frontier woods/);
    expect(page).toMatch(/<b class="run-in">How they look\. <\/b>Pale or nut-brown/);
    expect(page).toMatch(/<dt>Ages<\/dt><dd>Grown at a hundred/);
    expect(page).toMatch(/<h3>Born with<\/h3>.*Keen Senses/);
    expect([...page.matchAll(/data-option="(\w+)"/g)].map(m => m[1])).toEqual(['elf']);
    expect(page).toContain('data-action="cards"');
  });
});
