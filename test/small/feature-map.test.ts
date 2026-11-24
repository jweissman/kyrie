import { describe, expect, it } from 'bun:test';
import { FeatureMap } from '../../scripts/feature-map';

// The feature map (scripts/feature-map.ts; the owner, 24 November: the features and the pins one tree, its
// negative space seen): every feature on one aspect, every pin on a feature that exists, and the page drawn whole.
describe('the feature map', () => {
  const atlas = FeatureMap.read(), ids = atlas.features.map(f => f.id);
  it('puts every feature on exactly one aspect', () => {
    const placed = atlas.aspects.flatMap(a => a.features);
    expect(placed.toSorted()).toEqual(ids.toSorted());
  });
  it('places every pin on a feature that exists', () => {
    const pins = FeatureMap.pins(atlas);
    expect(pins.length).toBeGreaterThan(0);
    expect(pins.filter(p => !ids.includes(p.feature)).map(p => `${p.file}: ${p.describe}`)).toEqual([]);
    expect(Object.values({ ...atlas.pins.files, ...atlas.pins.describes }).filter(f => !ids.includes(f))).toEqual([]);
  });
  it('reads each feature\'s layers from its paths', () => {
    const lang = atlas.features.find(f => f.paths.some(p => p.startsWith('src/lang')))!;
    expect(FeatureMap.layers(lang)).toContain('language');
  });
  it('draws the tree by aspect, then the negative space', () => {
    const page = FeatureMap.page();
    for (const a of atlas.aspects) { expect(page).toContain(`## ${a.n}. ${a.name}`); }
    expect(page).toContain('## Negative space');
  });
});
describe('the feature map\'s experience pins and implied stories', () => {
  it('reads every experience family\'s specs, and says the stories no row asks for with their pins', () => {
    const d = FeatureMap.data();
    expect(d.families.every(f => f.specs > 0)).toBe(true);
    expect(d.counts.experience).toBeGreaterThan(0);
    expect(d.negative.implied.every(i => i.acceptance.length > 0 && i.story.length > 0)).toBe(true);
  });
});
