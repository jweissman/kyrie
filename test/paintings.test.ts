import { describe, expect, it } from 'bun:test';
import { existsSync, readdirSync } from 'node:fs';
import registry from '../data/paintings/registry.json';
import occupations from '../data/generation/scenes/occupations.json';
import { Likeness } from '../src/paintings/likeness';

// The painting corpus as the game holds it: every image read and copied, each attribution only what the image itself
// says, and every occupation's painting one the game can show.
describe('the painting corpus', () => {
  const paintings = registry.paintings as { id: string; source: string; artist?: string; title?: string; copy: string;
    width: number; height: number; sha1: string }[];
  it('holds every image, read as an image, with a copy the game can show', () => {
    expect(paintings.length).toBe(registry.count);
    expect(readdirSync('web/reader/paintings').filter(f => f.endsWith('.webp')).length).toBe(paintings.length);
    for (const p of paintings) {
      expect(p.width * p.height).toBeGreaterThan(0);
      expect(p.sha1).toMatch(/^[0-9a-f]{40}$/);
      expect(existsSync(`web/reader/${p.copy}`)).toBe(true);
    }
    if (existsSync('assets/images')) { expect(readdirSync('assets/images').length).toBe(paintings.length); }
  });
  it('says only what each image says of itself', () => {
    for (const p of paintings.filter(x => x.source === 'none')) { expect([p.artist, p.title]).toEqual([undefined, undefined]); }
  });
  it('has a painting for every kind of work a settlement holds', () => {
    for (const o of Object.values((occupations as { occupations: Record<string, { painting: string }> }).occupations)) {
      expect(Likeness.people.has(o.painting)).toBe(true);
    }
  });
  it('shows beside someone only a painting of someone: the drover\'s son is not a herd in a field', () => {
    expect(Likeness.of({ role: 'the drover\'s son' })).toBeUndefined();
    expect(Likeness.of({ profession: 'blacksmith' })).toBe('blacksmith');
    for (const id of Likeness.people) { expect(Likeness.ids.has(id)).toBe(true); }
  });
});
