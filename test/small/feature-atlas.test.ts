import { describe, expect, it } from 'bun:test';
import { FeatureAtlas } from '../../scripts/feature-atlas';

// The feature atlas (scripts/feature-atlas.ts; the owner, 24 November: the features and the pins one tree, its
// negative space seen): every feature on one aspect, every pin on a feature that exists, and the page drawn whole.
describe('the feature atlas', () => {
  const atlas = FeatureAtlas.read(), ids = atlas.features.map(f => f.id);
  it('puts every feature on exactly one aspect', () => {
    const placed = atlas.aspects.flatMap(a => a.features);
    expect(placed.toSorted()).toEqual(ids.toSorted());
  });
  it('places every pin on a feature that exists', () => {
    const pins = FeatureAtlas.pins(atlas);
    expect(pins.length).toBeGreaterThan(0);
    expect(pins.filter(p => !ids.includes(p.feature)).map(p => `${p.file}: ${p.describe}`)).toEqual([]);
    expect(Object.values({ ...atlas.pins.files, ...atlas.pins.describes }).filter(f => !ids.includes(f))).toEqual([]);
  });
  it('reads each feature\'s layers from its paths', () => {
    const lang = atlas.features.find(f => f.paths.some(p => p.startsWith('src/lang')))!;
    expect(FeatureAtlas.layers(lang)).toContain('language');
  });
  it('draws the tree by aspect, then the negative space', () => {
    const page = FeatureAtlas.page();
    for (const a of atlas.aspects) { expect(page).toContain(`## ${a.n}. ${a.name}`); }
    expect(page).toContain('## Negative space');
  });
});
