import { describe, expect, it } from 'bun:test';
import { DoableJourneys } from '../../src/presentation/doable-journeys';
import type { Row } from '../../src/presentation/doable';
import type { Screen } from '../../src/ui/screen-types';

// Cross-hex travel only by the map (the owner, 31 October; the lead's ruling of 20 November on the parity measure's
// page pressed): in a country drawn in hexes, a journey the four lead with across it opens the map at where it goes,
// the journey itself set out on from there; a walk about the town stays a walk; an aim's journey across the country is
// the map's, not the rest's; and the map itself is a row, where any journey is set out on from it.
function place(id: string, minutes: number) { return { id, name: id, minutes, legs: [{ to: id }] }; }
const screen = {
  region: { land: { tracts: [] } }, map: [], roads: [], exits: [], place: { id: 'here' },
  around: [place('shrine', 5)], destinations: [place('reedbridge', 400), place('gatesend', 600)],
  aims: [{ id: 'boat', places: ['gatesend'] }],
} as unknown as Screen;
function row(id: string, does: string, led?: true): Row {
  return { id, label: id, does, witnesses: [], ...led ? { led } : {} };
}
describe('a journey across the country', () => {
  it('led with, opens the map at where it goes, and is set out on from there', () => {
    const rows = DoableJourneys.mapped([row('travel:reedbridge', 'travel:reedbridge', true),
      row('exit:ford', 'travel:ford', true), row('travel:shrine', 'travel:shrine', true)], screen);
    expect(rows.map(r => [r.id, r.does, r.chart ?? null, r.map ?? null])).toEqual([
      ['map:reedbridge', 'view:map:reedbridge', 'reedbridge', null],
      ['exit:ford', 'view:map:ford', 'ford', null],
      ['travel:shrine', 'travel:shrine', null, null],
      ['travel:reedbridge', 'travel:reedbridge', null, true],
      ['travel:ford', 'travel:ford', null, true],
      ['view:map', 'view:map', null, null]]);
  });
  it('to where an aim names, is on the map, not in the rest', () => {
    const rows = DoableJourneys.mapped([row('travel:gatesend', 'travel:gatesend'),
      row('travel:shrine', 'travel:shrine')], screen);
    expect(rows.map(r => [r.id, r.map ?? null])).toEqual([['travel:gatesend', true], ['travel:shrine', null],
      ['view:map', null]]);
  });
  it('walked into another hex by its way, is on the map too; a way within the hex is not', () => {
    const exits = [{ destination: { id: 'road' }, crosses: true }, { destination: { id: 'inn' } }];
    const rows = DoableJourneys.mapped([row('go(gate,road)', 'go(gate,road)'), row('go(door,inn)', 'go(door,inn)')],
      { ...screen, exits } as unknown as Screen);
    expect(rows.map(r => [r.id, r.map ?? null])).toEqual([['go(gate,road)', true], ['go(door,inn)', null],
      ['view:map', null]]);
  });
});
