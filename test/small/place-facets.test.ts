import { describe, expect, it } from 'bun:test';
import { PlaceFacets } from '../../src/presentation/place-facets';
import type { Screen } from '../../src/ui/screen-types';
import type { Lensed } from '../../src/presentation/glance-types';
import { MapMenu } from '../../web/reader/map-menu';

// What each place on the map is to the company, read once for its marks and its menu (the owner, 17 November: a gold
// act and no gold on the map, and a town with gold in it found only by touching it): the aim followed's places gold,
// and their town; another aim's worth going to; someone perceived along a way; what the places lens leads with. The
// map's menu offers them first, gold first, before the nearest roads.
const screen = {
  exits: [{ id: 'x_mill', destination: { id: 'mill' } }],
  region: { within: { inn: 'stow' }, areas: [] },
  path: [],
  aims: [{ id: 'a', text: 'The letter', followed: true, places: ['inn'] }, { id: 'b', text: 'Rumour', places: ['fen'] }],
  destinations: [
    { id: 'lea', name: 'Lea', minutes: 20, legs: [] }, { id: 'stow', name: 'Stow', minutes: 90, legs: [] },
    { id: 'fen', name: 'the Fen', minutes: 60, legs: [] }, { id: 'mill', name: 'the Mill', minutes: 40, legs: [] }],
} as unknown as Screen;
const places = { promoted: [{ choice: 'x_mill', exit: 'x_mill', aspects: ['payoff'] }], rest: [],
  aspects: ['payoff'] } as unknown as Lensed;
const glance = { sensed: [{ to: 'lea', aspect: 'companionship' as const, far: 1 }], lenses: { places } };

describe('what each place is to the company, on the map', () => {
  it('reads the aim, other aims, who is perceived and what the ways are led with', () => {
    const f = PlaceFacets.of(screen, glance);
    expect(f.inn).toEqual(['undertaking']);
    expect(f.stow).toEqual(['undertaking']);
    expect(f.fen).toEqual(['exploration']);
    expect(f.lea).toEqual(['companionship']);
    expect(f.mill).toEqual(['payoff']);
  });
  it('offers them in the map\'s menu by what they are, gold first, before the nearest', () => {
    const f = PlaceFacets.of(screen, glance);
    expect(MapMenu.roads(screen, f, { taken: [] }).map(r => r.id)).toEqual(['stow', 'mill', 'lea', 'fen']);
    expect(MapMenu.marked(f.stow, true).mark).toBe('var(--tone-gold)');
    expect(MapMenu.marked(f.stow, false).markClass).toBe('neutral');
  });
});
