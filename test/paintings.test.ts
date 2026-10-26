import { describe, expect, it } from 'bun:test';
import { existsSync, readdirSync } from 'node:fs';
import registry from '../data/paintings/registry.json';
import occupations from '../data/generation/scenes/occupations.json';
import { Likeness } from '../src/paintings/likeness';
import { Portraits } from '../src/paintings/portraits';
import { CommunityWriter } from '../src/world/community/community-writer';
import type { Region } from '../src/world/region-writer';

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
  // The follow-up review saw a mother painted younger than her son, and grand.
  it('paints a mother as a woman of her years, and of her work', () => {
    for (const key of ['Ian', 'Reed', 'Agnes', 'Maud']) {
      const sitter = Likeness.sitter(Likeness.of({ role: 'the drover\'s wife, who cooks at the inn', sex: 'woman', key })!)!;
      expect([key, sitter.age, sitter.station]).toEqual([key, 'adult', 'labouring']);
    }
  });
  // The follow-up review saw richly dressed sitters given working roles: the herb-wife beside a lady at her cabinet.
  it('paints the country\'s working people as working people, not as the gentry', () => {
    const region = { name: 'Here' } as unknown as Region;
    for (const painting of ['herbalist', 'gardener', 'teacher', 'gatherer', 'candlemaker']) {
      const said = CommunityWriter.likenessOf(region, { pronoun: 'she', painting, id: painting });
      const sitter = Likeness.sitter(/Likeness "(.+)"/.exec(said)![1]!)!;
      expect([painting, ['middling', 'labouring'].includes(sitter.station ?? '')]).toEqual([painting, true]);
    }
  });
  // A likeness is someone who could be them, in a world with its own gods: no severed head, no saint of another
  // world's faith, no king for an innkeeper (data/paintings/unfit.json); a priest is painted as someone of faith.
  it('casts no one the game makes in a painting it refuses, and a priest as someone of faith', async () => {
    const { WorldAssembler } = await import('../src/world/world-assembler');
    const { NodeBundleSource } = await import('../src/campaign/node-bundle-source');
    for (const seed of ['wren', 'a1', 'thorn']) {
      const w = await WorldAssembler.assemble(seed, NodeBundleSource.shared, { origin: 'wanderer' });
      const files = [...(w.source as unknown as { files: Map<string, string> }).files.values()].join('\n');
      const cast = [...files.matchAll(/Likeness "([^"]+)"/g)].map(m => m[1]!);
      expect(cast.length).toBeGreaterThan(10);
      expect(cast.filter(id => Likeness.unfit.has(id))).toEqual([]);
    }
    for (const role of ['priest of Aine', 'priest of Flidais', 'the prior']) {
      const id = Likeness.of({ role, sex: 'man', key: role })!;
      expect([role, Likeness.unfit.has(id), Likeness.sitter(id)?.station]).toEqual([role, false, 'religious']);
    }
  }, 120000);
  // Free play of M16 met Mother Ysolt as Valentin's young Samson, and an alehouse-keeper as a preacher: a role was
  // read from its last word (the Ford, not the priest), and whoever no word placed was given anyone of their sex.
  it('paints someone by what their role says they are, and otherwise not at all', () => {
    const sitter = (at: Parameters<typeof Likeness.of>[0]) => Likeness.sitter(Likeness.of(at) ?? '');
    expect(sitter({ role: 'priest of the Chapel of the Ford', sex: 'man', key: 'a' })?.station).toBe('religious');
    expect(sitter({ role: 'foreman at the Hall', sex: 'man', key: 'b' })?.station).toBe('labouring');
    expect(sitter({ role: 'landlord of the Drowned Ox', sex: 'woman', key: 'c' })?.sex).toBe('woman');
    // A title says who bears it; a woman of years is not painted as a girl.
    const mother = sitter({ role: 'priest of the Chapel of the Ford', name: 'Mother Ysolt', key: 'd' });
    expect(mother === undefined || (mother.sex === 'woman' && mother.age !== 'young')).toBe(true);
    // "Master of the barge" is not a painter; nothing in "who keeps the books" says what they look like.
    expect(sitter({ role: 'master of the barge Heron', sex: 'woman', key: 'e' })?.station).toBe('labouring');
    expect(Likeness.of({ role: 'who keeps the books of the Reodweard company', sex: 'man', key: 'f' })).toBeUndefined();
    // Someone known by whose they are is one of the working people, of the sex the words say.
    expect(sitter({ role: 'a widow whose son went after the raiders', name: 'the woman in black', key: 'g' }))
      .toMatchObject({ sex: 'woman', station: 'labouring' });
  });
});

