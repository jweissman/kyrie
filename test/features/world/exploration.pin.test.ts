import { describe, expect, it } from 'bun:test';
import { Tiny } from '../../support/tiny';

// Feature pins: see test/features/choice/consequence.pin.test.ts. The owner's notes in brackets are pins of their own.
describe('World › Locations that reward reading', () => {
  it.todo('unwritten: a second look or search at a place gives something its first look did not');
  it.todo('unwritten: every layer (world, country, region, hex, building) has its icon, shown where it is named');
});
describe('World › Non-linear traversal', () => {
  it.todo('unwritten: the land is revealed as a journey crosses it, hex by hex, not after it');
  it.todo('unwritten: exploring a region is an act of its own, rolled on the region\'s table of finds');
  it.todo('unwritten: crossing into a new hex draws from what that hex may hold');
  it.todo('unwritten: revealing a hex earns experience');
  it.todo('unwritten: a Cartographers\' guild pays for and honours what the company has mapped');
});
describe('World › Environmental interaction and puzzles', () => {
  // The shape of Iscoed's sea-gate (data/goings-on/iscoed-gate): a key and a slate in one room; a door in another that
  // opens only to the key, and only at the hour the slate tells, when the sea's weight is off it.
  const works = `
  Place cell "the tide-room" is room at 0, 0.
  Place gallery "the gallery" is room at 1, 0.
  Place beyond "the undercroft" is room at 2, 0.
  Company party "You" of 1 at cell.
  Kind key_kind "a bronze key" is gear worth 1 weighing 1 described "A key with a wave on its bow.".
  Kind slate_kind "a tide-slate" is document teaching tides worth 1 weighing 1 described "The water is low at four.".
  Entity tides: fact "The water is lowest at four.".
  Item key "a bronze key" is key_kind at cell.
  Item slate "a tide-slate" is slate_kind at cell.
  Passage arch "the arch" is doorway between cell and gallery.
  Passage door "the bronze door" is door between gallery and beyond opening when holding(party, key_kind) and hour(clock) >= 16 and hour(clock) < 19 "The bronze door has the sea behind it.".`;
  it('opens a way with a clue and a key found in another place: the key and its door, at the hour the slate tells',
    async () => {
      const t = await Tiny.start(works);
      await t.play('To the gallery');
      expect(t.journey.matches('To the undercroft')).toEqual([]);
      await t.play('To the tide-room', 'a bronze key: Take', 'a tide-slate: Take', 'To the gallery');
      expect(t.journey.matches('To the undercroft')).toEqual([]);
      await t.play('=16:10', 'To the undercroft');
      expect(t.journey.screen().place.name).toBe('the undercroft');
    });
  it.todo('unwritten: a puzzle of reasoning other than a riddle, its solution read from the world');
});
describe('World › Navigation aid', () => {
  it.todo('unwritten: a strategic map of countries above the hex map, and a hex view of the places within a hex');
});
