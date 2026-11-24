import { describe, expect, it } from 'bun:test';
import { FeatureMap } from '../../scripts/feature-map';

// The feature map (scripts/feature-map.ts; the owner, 24 November: the features and the pins one tree, read
// encyclopedically, by capability, its negative space seen): every pinned behaviour on a capability, every pin on a
// feature that exists, every feature with one capability its rows fall to, and the page drawn whole.
describe('the feature map', () => {
  const atlas = FeatureMap.read(), ids = atlas.features.map(f => f.id), caps = FeatureMap.capabilities();
  it('places every pin on a feature that exists, and every pinned behaviour on a capability', () => {
    const pins = FeatureMap.pins(atlas);
    expect(pins.length).toBeGreaterThan(0);
    expect(pins.filter(p => !ids.includes(p.feature)).map(p => `${p.file}: ${p.describe}`)).toEqual([]);
    expect(FeatureMap.data().negative.unplaced).toEqual([]);
  });
  it('gives each feature exactly one capability its rows fall to, and each capability a feature that exists', () => {
    expect(ids.filter(id => caps.filter(c => c.feature === id && c.default).length !== 1)).toEqual([]);
    expect(caps.filter(c => !ids.includes(c.feature)).map(c => c.id)).toEqual([]);
    expect(new Set(caps.map(c => c.id)).size).toBe(caps.length);
  });
  it('reads each feature\'s layers from its paths', () => {
    const lang = atlas.features.find(f => f.paths.some(p => p.startsWith('src/lang')))!;
    expect(FeatureMap.layers(lang)).toContain('language');
  });
  it('reads every experience family\'s specs, and draws the tree, then the negative space', () => {
    const d = FeatureMap.data(), page = FeatureMap.page();
    expect(d.families.every(f => f.specs > 0)).toBe(true);
    for (const a of d.aspects) { expect(page).toContain(`## ${a.n}. ${a.name}`); }
    expect(page).toContain('## Negative space');
  });
});
