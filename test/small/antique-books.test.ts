import { describe, expect, it } from 'bun:test';
import { Tiny } from '../support/tiny';
import { RegionBooks } from '../../src/world/region-books';
import { PlaySession } from '../../src/session/play-session';
import { Journey } from '../../src/session/journey';
import type { Site, Region } from '../../src/world/region-writer';
import { Terrain } from '../../src/world/land/terrain';
import { Consequence } from '../../src/lang';

const site: Site = { id: 'ruin', name: 'the deep workings', kind: 'mine', hours: 1,
  work: { plan: 'deep', art: 'deep', deep: true, made: 'The Second Stair' } };
const start = `Place yard "the yard" is room at 0, 0 outdoors.
  Place ruin "the deep workings" is room at 1, 0 outdoors.
  Company party "You" of 1 at yard.
  Person keeper "the keeper" at yard { Role "an innkeeper". Species human. Level 1. Peaceable. }
  Discovery ruin_found "The deep workings lie east of the yard.".
  Discovery ruin_named "The Second Stair is the old name of the workings.".
  Passage ruin_track "the old path to the workings" is path between yard and ruin hidden until ruin_found.
  Initially Assert leadsTo(ruin_found, ruin). Initially Assert leadsVia(ruin_found, ruin_track).
  Objective deep_sought when knows(party, ruin_named) and not been(party, ruin)
    "Enter the workings recorded as the Second Stair.".`;
const book = () => RegionBooks.volume('old-book', 'book',
  { room: 'yard', keeper: 'keeper', site, where: 'east of the yard', arcology: false, country: 'tiny' }).join('\n');

describe('antique books', () => {
  it('queries actual deep sites, excludes another adventure\'s ground, and never invents a destination', () => {
    const region: Region = { name: 'Book Country', terrain: 'hills', ancestry: 'human', domain: 'craft',
      deity: 'berem', wonder: { kind: 'spring', description: 'a spring' },
      settlements: [{ id: 's0', name: 'Bookhaven', size: 'town', trade: 'grain', inn: 'the Dry Page',
        innkeeper: 'Wat', priest: 'Ann', merchant: 'Meg', traveller: 'Hal', calling: 'warrior', cell: 0 }],
      sites: [{ ...site, id: 'w0', cell: 10 }, { id: 'w1', name: 'the numbered dwelling', kind: 'ruin',
        cell: 12, hours: 1 }, { ...site, id: 'w2', cell: 14 }],
      atlas: { land: Terrain.make('books', 'hills', { width: 5, height: 5 }), seats: [], ways: [],
        rivers: [], lakes: [], zones: [], borders: [] } };
    const written = RegionBooks.lines(region, { w1: 'arcology', w2: 'another_adventure' });
    expect(written.length).toBeGreaterThan(0);
    expect(written.join('\n')).not.toContain('w2_found');
    expect(written.join('\n')).toMatch(/knows\(actor, w[01]_found\)/);
    expect(written).toEqual(RegionBooks.lines(region, { w1: 'arcology', w2: 'another_adventure' }));
    expect(RegionBooks.lines({ ...region, sites: [] }, {})).toEqual([]);
    expect(RegionBooks.lines({ ...region, sites: [{ ...site, id: 'w2', cell: 14 }] },
      { w2: 'another_adventure' })).toEqual([]);
  });
  it('lends a real book, gives an actual route without a proof, and restores a name that opens an expedition', async () => {
    const t = await Tiny.start(`${start}\n${book()}`, { party: [
      { name: 'Elen', raceId: 'human', classId: 'warrior', level: 1, perk: 'mathematician' }] });
    expect(t.glance.acts.some(a => a.label.startsWith('Read the itinerary'))).toBe(false);
    expect(Consequence.census(t.campaign.module).filter(a => a.id.startsWith('t__book_'))).toEqual([]);
    await t.play('^Ask to borrow ', 'Take', '^Read the itinerary ');
    expect(t.journey.holds('carries', 'party', 'book')).toBe(true);
    expect(t.journey.holds('lends', 'keeper', 'book', 'party')).toBe(true);
    expect(t.journey.holds('knows', 'party', 'ruin_found')).toBe(true);
    expect(t.journey.holds('knows', 'party', 'ruin_named')).toBe(false);
    expect(t.journey.matches('^Resolve the mathematical appendix')).toHaveLength(1);
    expect(t.glance.acts.some(a => a.aspects.includes('wonder'))).toBe(false);
    await t.play('^Resolve the mathematical appendix ');
    expect(t.journey.holds('knows', 'party', 'ruin_named')).toBe(true);
    t.follow('deep_sought');
    expect(t.gold.map(a => a.label)).toContain('To the deep workings');
    const again = Journey.of(PlaySession.fromSave(t.campaign.save(), 'tiny'), true);
    expect(again.holds('carries', 'party', 'book')).toBe(true);
    expect(again.holds('knows', 'party', 'ruin_found')).toBe(true);
    await t.play('To the deep workings');
    expect(t.where()).toBe('t__ruin');
  });
  it('requires familiarity before an untrained attempt, which keeps its readable route even on failure', async () => {
    const t = await Tiny.start(`${start}\n${book()}`, { party: [
      { name: 'Bran', raceId: 'human', classId: 'warrior', level: 1 }] });
    await t.play('^Ask to borrow ', 'Take');
    expect(t.journey.matches('^Resolve the mathematical appendix')).toHaveLength(0);
    await t.play('^Read the itinerary ', '^Resolve the mathematical appendix ');
    const check = t.campaign.events.at(-1)!.combat.find(e => e.type === 'check')!;
    expect(check).toMatchObject({ difficulty: 35, trained: 0 });
    expect(t.journey.holds('knows', 'party', 'ruin_found')).toBe(true);
    expect(t.journey.holds('knows', 'party', 'ruin_named')).toBe(check.success);
  });
});
