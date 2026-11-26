import { describe, expect, it } from 'bun:test';
import { DoableJourneys } from '../../src/presentation/doable-journeys';
import type { Row } from '../../src/presentation/doable';
import type { Witness } from '../../src/presentation/attest';
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
function row(id: string, does: string, led?: true, aim?: true): Row {
  const gold = { id, aspects: ['undertaking'], kind: 'act' } as unknown as Witness;
  return { id, label: id, does, witnesses: aim ? [gold] : [], ...led ? { led } : {} };
}
describe('a journey across the country', () => {
  it('led with, opens the map at where it goes, and is set out on from there', () => {
    const rows = DoableJourneys.mapped([row('travel:reedbridge', 'travel:reedbridge', true, true),
      row('exit:ford', 'travel:ford', true, true), row('travel:shrine', 'travel:shrine', true)], screen);
    expect(rows.map(r => [r.id, r.does, r.chart ?? null, r.map ?? null])).toEqual([
      ['map:reedbridge', 'view:map:reedbridge', 'reedbridge', null],
      ['exit:ford', 'view:map:ford', 'ford', null],
      ['travel:shrine', 'travel:shrine', null, null],
      ['travel:reedbridge', 'travel:reedbridge', null, true],
      ['travel:ford', 'travel:ford', null, true]]);
    // Said as what it does, gold as the aim's step (the owner, 25 November: ways to another hex appear only on the
    // map); the journey it opens the map on keeps its own words there.
    expect(rows.filter(r => r.chart).map(r => [r.label, r.called])).toEqual([['Open the map', 'Open the map'],
      ['Open the map', 'Open the map']]);
    expect(rows.find(r => r.id === 'travel:reedbridge')?.label).toBe('travel:reedbridge');
  });
  // One row opens the map (the owner's playtest, 25 November, OR-804): the aim's way across in its gold, or else the
  // map's own; never both, as "Open the map" and "Open the world map" had stood on one landing.
  // A walk about the town whose way runs out over the open country (Destination.crosses, Passages.leaves) is the map's
  // too, led or not (the owner's new life, 25 November: one act in the first town had carried the company more than
  // a hex).
  it('about the town, by a way that leaves the hex, is on the map; led with, opens it', () => {
    const away = { ...screen, around: [{ ...place('shrine', 5), crosses: true }] } as unknown as Screen;
    expect(DoableJourneys.mapped([row('travel:shrine', 'travel:shrine')], away).map(r => [r.id, r.map ?? null]))
      .toEqual([['travel:shrine', true], ['view:map', null]]);
    expect(DoableJourneys.mapped([row('travel:shrine', 'travel:shrine', true)], away).map(r => [r.id, r.does]))
      .toEqual([['travel:shrine', 'travel:shrine'], ['view:map', 'view:map']]);
    expect(DoableJourneys.mapped([row('travel:shrine', 'travel:shrine', true, true)], away).map(r => [r.id, r.does]))
      .toEqual([['map:shrine', 'view:map:shrine'], ['travel:shrine', 'travel:shrine']]);
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
  // Entering a town from the stretch of country it stands in is not a crossing (a1: Millholm from hex 89, by its
  // gate): led, a journey to one of its places stays an act that goes there; one to another town is charted.
  it('led into a town from its own hex, stays an act that enters; to a town further off, opens the map', () => {
    const own = { ...screen, around: [], exits: [{ id: 'exit:millholm_green', destination: { id: 'millholm_green' } }],
      region: { land: { tracts: 'region__t', here: 89, towns: { millholm: 'known', lowmouth: 'known' } } } };
    const rows = DoableJourneys.mapped([row('travel:millholm_store', 'travel:millholm_store', true),
      row('travel:lowmouth', 'travel:lowmouth', true, true), row('exit:millholm_green', 'go(gate,millholm_green)', true)],
    own as unknown as Screen);
    expect(rows.filter(r => r.led).map(r => [r.id, r.does])).toEqual([
      ['travel:millholm_store', 'travel:millholm_store'], ['map:lowmouth', 'view:map:lowmouth'],
      ['exit:millholm_green', 'go(gate,millholm_green)']]);
  });
});
