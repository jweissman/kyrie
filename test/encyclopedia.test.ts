import { describe, expect, it } from 'bun:test';
import { Handbooks } from '../src/handbook/handbooks';
import { Encyclopedia, type Land } from '../src/handbook/encyclopedia';
import { EncyclopediaHtml } from '../src/handbook/encyclopedia-html';
import { HandbookPublisher } from '../src/handbook/publish';

// The Encyclopedia of Imbar (Mission 19, Priority Eight): the reader's book, made from the entries the authors'
// handbooks are, so that what it says a spell does is what the game does; only what the game plays, nothing of how
// it was made (statuses, Orsino, the handbooks), and of the adventures' lands only what is said of them.
describe('the Encyclopedia of Imbar', () => {
  const handbooks = new Handbooks(process.cwd());
  const lands = (Handbooks.read(process.cwd(), 'data/adventures/countries.json') as { countries: Land[] }).countries
    .filter(c => c.heard);
  const book = new Encyclopedia(handbooks, lands, Encyclopedia.canon(process.cwd()), HandbookPublisher.tongues());
  const html = new EncyclopediaHtml(book);
  it('has its chapters, each with entries', () => {
    expect(book.chapters.map(c => c.id)).toEqual(['peoples', 'lives', 'magic', 'arms', 'creatures', 'conditions',
      'tongues', 'planes', 'lands']);
    for (const c of book.chapters) { expect(html.chapter(c)).toContain('class="item'); }
  });
  it('holds only what the game plays, said as the game plays it', () => {
    const where = book.where(), placed = new Map(handbooks.placed().map(p => [p.id, p]));
    const unplayed = [...where.keys()].filter(id => placed.has(id) && !Encyclopedia.played.has(placed.get(id)!.status));
    expect(unplayed).toEqual([]);
    expect(where.has('ability:fireball') || [...where.values()].some(w => /fireball/i.test(w.title))).toBe(true);
  });
  it('says nothing of how it was made', () => {
    const pages = [html.landing(), ...book.chapters.map(c => html.chapter(c))].join('\n');
    expect(pages).not.toMatch(/Orsino|>Faithful<|>Adapted<|Not playable|bonusSpellDC|Dungeon Master/);
  });
  it('tells of the tongues the land\'s names are in, with who speaks each and some of its words', () => {
    const page = html.chapter(book.chapters.find(c => c.id === 'tongues')!);
    expect(page).toContain('Khuzdul');
    expect(page).toMatch(/<dt>stone<\/dt><dd>[^<]+<\/dd>/);
  });
  it('tells of the planes as their thresholds are seen, read from the canon by the Kyr parser', () => {
    const page = html.chapter(book.chapters.find(c => c.id === 'planes')!);
    expect(page).toContain('Heat and light on every side');
    expect(page).toMatch(/an outer plane/);
  });
  it('tells of the adventures\' lands only as they are spoken of', () => {
    const page = html.chapter(book.chapters.find(c => c.id === 'lands')!);
    expect(page).toContain('Merrowdale');
    expect(page).toContain(lands.find(l => l.name === 'Merrowdale')!.heard.replace(/'/g, '&#39;').slice(0, 30));
  });
});
