import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { describe, expect, it } from 'bun:test';
import { CanonVocabulary } from '../src/canon/canon-vocabulary';
import { CatalogContext } from '../src/item-catalog';
import { Handbooks } from '../src/handbook/handbooks';
import { Encyclopedia, type Land } from '../src/handbook/encyclopedia';
import { EncyclopediaHtml } from '../src/handbook/encyclopedia-html';
import { HandbookPublisher } from '../src/handbook/publish';

// The Encyclopedia of Imbar (Mission 19, Priority Eight): the reader's book, made from the entries the authors'
// handbooks are, so that what it says a spell does is what the game does; only what the game plays, nothing of how
// it was made (statuses, Orsino, the handbooks), and of the adventures' lands only what is said of them.
describe('the Encyclopedia of Imbar', () => {
  const vocabulary = CanonVocabulary.context();
  const handbooks = new Handbooks(process.cwd(), vocabulary, CatalogContext.canon);
  const countries = (Handbooks.read(process.cwd(), 'data/adventures/countries.json') as { countries: AdventureCountry[] })
    .countries;
  const lands = countries.filter(c => c.heard);
  const book = new Encyclopedia(handbooks, lands, Encyclopedia.canon(process.cwd(), vocabulary),
    HandbookPublisher.tongues());
  const html = new EncyclopediaHtml(book);
  it('has its chapters, each with entries', () => {
    expect(book.chapters.map(c => c.id)).toEqual(['peoples', 'lives', 'magic', 'arms', 'creatures', 'plants', 'conditions',
      'history', 'gods', 'tongues', 'planes', 'lands']);
    for (const c of book.chapters) { expect(html.chapter(c)).toContain('class="item'); }
  });
  // Its history and its gods, from the data every country draws its past and its faith from (Mission 19's progress:
  // the Encyclopedia had lacked history and institutions).
  it('tells of the old makers, those after them, and the gods', () => {
    const where = book.where();
    expect(where.get('makers:water')?.title).toBe('The Water-Wardens');
    expect([...where.keys()].filter(id => id.startsWith('successors:')).length).toBeGreaterThanOrEqual(3);
    expect([...where.keys()].filter(id => id.startsWith('deity:')).length).toBeGreaterThan(20);
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
  it('carries the succession crisis and a local cast member through every adventure', () => {
    const adventures = countries.filter(country => country.province);
    expect(adventures.length).toBeGreaterThan(0);
    for (const adventure of adventures) {
      expect(adventure.rumour).toMatch(/succession/i);
      expect(adventure.heard).toMatch(/succession/i);
      expect(adventure.far).toMatch(/succession/i);
      expect(adventure.rumour).toContain('Ash');
      expect(adventure.heard).toContain('Ash');
      expect(adventure.far).toContain('Ash');
      expect(adventureCastNames(adventure).some(name => adventure.rumour?.includes(name))).toBe(true);
    }
  });
});

interface AdventureCountry extends Land {
  bundle?: string;
  far?: string;
  province?: boolean;
  rumour?: string;
}

function adventureCastNames(adventure: AdventureCountry): string[] {
  if (!adventure.bundle) { return []; }
  const bundlePath = join('data/adventures', adventure.bundle);
  const bundle = JSON.parse(readFileSync(bundlePath, 'utf8')) as { source?: string[] };
  return (bundle.source ?? [])
    .filter(source => source.endsWith('.kyr'))
    .flatMap(source => [...readFileSync(join(dirname(bundlePath), source), 'utf8')
      .matchAll(/\bPerson\s+[\w-]+\s+"([^"]+)"/g)].map(match => match[1]!))
    .filter(name => name[0] === name[0]?.toUpperCase());
}
