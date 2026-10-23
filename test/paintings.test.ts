import { describe, expect, it } from 'bun:test';
import { existsSync, readdirSync } from 'node:fs';
import registry from '../data/paintings/registry.json';
import occupations from '../data/generation/scenes/occupations.json';
import { Likeness } from '../src/paintings/likeness';
import { Portraits } from '../src/paintings/portraits';

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
      expect(Likeness.ids.has(o.painting)).toBe(true);
    }
  });
  it('shows beside someone a portrait of someone of their sex: the drover\'s son is not a herd in a field', () => {
    const son = Likeness.of({ role: 'the drover\'s son', sex: 'man', key: 'son' })!;
    expect(Likeness.sitter(son)?.sex).toBe('man');
    expect(Likeness.of({ profession: 'blacksmith' })).toBe('blacksmith');
    // A woman who thatches is not shown as the gentleman in a frock coat; a fisher not as a lagoon.
    const thatcher = Likeness.choose({ sex: 'woman', concept: 'thatcher', stations: ['labouring'] }, 'Beatrix')!;
    expect([Likeness.sitter(thatcher)?.sex, Likeness.sitter(thatcher)?.station]).toEqual(['woman', 'labouring']);
    expect(Likeness.sitter(Likeness.choose({ sex: 'man', concept: 'fisherman' }, 'Wilkin')!)?.sex).toBe('man');
  });
  it('gives each of a country\'s people a painting of their own, while one fits', () => {
    const portraits = new Portraits(), given = Array.from({ length: 40 }, (_, i) =>
      portraits.take({ sex: i % 2 ? 'man' : 'woman', stations: ['labouring', 'middling'] }, `p${i}`));
    expect(new Set(given).size).toBe(40);
  });
});
