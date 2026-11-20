import { describe, expect, it } from 'bun:test';
import { PlaceFacets } from '../../src/presentation/place-facets';
import type { Screen } from '../../src/ui/screen-types';
import type { Lensed } from '../../src/presentation/glance-types';
import { MapMenu } from '../../web/reader/map-menu';
import type { Projected } from '../../src/presentation/attest';

// What each place on the map is to the company, read once for its marks and its menu (the owner, 17 November: a gold
// act and no gold on the map, and a town with gold in it found only by touching it): the aim followed's places gold,
// and their town; another aim's worth going to; someone perceived along a way; what the places lens leads with. The
// map's menu offers them first, gold first, before the nearest roads.
// Each place's mark is a fold of the first steps toward it (Fold.step, AT-07 §4 I7): the journey the followed aim's
// route goes by (Glance.following), another aim's way (Glance.aimed), never an aim's naming a place alone.
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
const glance = { sensed: [{ to: 'lea', aspect: 'companionship' as const, far: 1 }], lenses: { places },
  aimed: ['travel:stow', 'travel:fen'], following: ['travel:stow'] } as unknown as Projected;

describe('what each place is to the company, on the map', () => {
  it('reads the aim, other aims, who is perceived and what the ways are led with', () => {
    const f = PlaceFacets.of(screen, glance), of = (id: string) => PlaceFacets.aspects(f.get(id));
    expect(of('stow')).toEqual(['undertaking']);
    // The inn the aim names is in Stow, which the journey goes to: it is marked on the map as its town, and only so.
    expect(of('inn')).toEqual([]);
    expect(of('fen')).toEqual(['exploration']);
    expect(of('lea')).toEqual(['companionship']);
    expect(of('mill')).toEqual(['payoff']);
    // Each by its witnesses (Attest): the aim's place, what is perceived along a way, the way led with.
    expect(f.get('mill')?.map(l => l.id)).toEqual(['x_mill']);
    expect(f.get('stow')?.map(l => l.id)).toEqual(['travel:stow']);
  });
  it('marks no place an aim names that no step from here goes toward', () => {
    // No way led toward an aim's place, and no journey the map knows to it or its town: nothing but the mill's way.
    const far = { ...screen, destinations: screen.destinations!.filter(d => ['lea', 'mill'].includes(d.id)) } as Screen;
    expect([...PlaceFacets.of(far, { lenses: { places } } as unknown as Projected).keys()]).toEqual(['mill']);
  });
  it('marks a place an aim names by the journey the map knows to it, the first step there', () => {
    const f = PlaceFacets.of(screen, { lenses: { places } } as unknown as Projected);
    expect([PlaceFacets.aspects(f.get('stow')), f.get('stow')?.map(l => l.id)]).toEqual([['undertaking'], ['travel:stow']]);
    expect(PlaceFacets.aspects(f.get('fen'))).toEqual(['exploration']);
  });
  it('offers them in the map\'s menu by what they are, gold first, before the nearest', () => {
    const f = PlaceFacets.of(screen, glance);
    expect(MapMenu.roads(screen, f, { taken: [] }).map(r => r.id)).toEqual(['stow', 'mill', 'lea', 'fen']);
    expect(MapMenu.marked(f.get('stow'), true).indicator?.tone).toBe('gold');
    expect(MapMenu.marked(f.get('stow'), false)).toEqual({ plain: 'neutral' });
  });
});
