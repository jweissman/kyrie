import { describe, expect, it } from 'bun:test';
import { Tiny } from '../support/tiny';
import { Folded } from '../../web/reader/stage/folded-rail';
import { Surfaces } from '../../src/presentation/surfaces';
import type { Attested } from '../../src/presentation/attest';
import type { Lensed } from '../../src/presentation/glance-types';

// The rail as the owner set it (27 November, late; OR-1880), refining the lenses folded at rest (OR-1084): the engine
// says it of the resting scene, for every client (Glance.rail). The diamond always; the character's compass and book
// from the start; the lenses had (a perk's early, all of them after act I) folded behind the diamond, which is lit by
// what they hold and dim with nothing; and the lenses unfolded after act I, or while one of them holds something.
const yard = `
  Place yard "the yard" is room at 0, 0 outdoors.
  Company party "You" of 1 at yard.`;
const wenna = (more: { level?: number; perk?: string } = {}) => ({ name: 'Wenna', raceId: 'human', classId: 'warrior',
  level: 1, backgroundId: 'soldier', ...more });
const keep = { view: 'company' as const, label: 'Your character' };
describe('the rail', () => {
  it('is, in act I, the diamond dim beside the compass and the book, nothing folded behind it', async () => {
    const first = await Tiny.start(yard, { party: [wenna()] });
    expect(first.leaf.glance?.rail).toEqual({ fold: 'folded', lenses: [], keep, tools: ['compass', 'book'],
      diamond: [], unfolded: false });
  });
  it('holds a perk\'s lens early: a keen eye has the look lens and the search, folded', async () => {
    const keen = await Tiny.start(yard, { party: [wenna({ perk: 'keen_eyed' })] });
    expect(keen.screen.surfaces).toEqual(['lens_look', 'lens_search']);
    expect(keen.leaf.glance?.rail).toMatchObject({ lenses: ['look', 'search'], diamond: [], unfolded: false });
  });
  it('holds every lens but the compass\'s once act I is over, and stands unfolded', async () => {
    const later = await Tiny.start(yard, { party: [wenna({ level: 4 })] });
    expect(later.leaf.glance?.rail).toMatchObject({ lenses: ['talk', 'look', 'wait', 'search'],
      tools: ['compass', 'book'], unfolded: true });
  });
  // The diamond from the folded lenses' own rows (Lensed.aspects), never the compass's; and unfolded while lit.
  it('is lit by what the folded lenses hold, and unfolds while it is', () => {
    const lensed = (...aspects: Lensed['aspects']) => ({ promoted: [], rest: [], aspects }) as Lensed;
    const screen = { surfaces: ['lens_look' as const], party: [{ level: 1 }] } as never;
    expect(Surfaces.rail(screen, { things: lensed('knowledge', 'exploration'), places: lensed('undertaking') }))
      .toMatchObject({ lenses: ['look'], diamond: ['knowledge'], unfolded: true });
    expect(Surfaces.rail(screen, { things: lensed('exploration'), people: lensed('danger') }))
      .toMatchObject({ diamond: [], unfolded: false });
  });
});
describe('the diamond', () => {
  it('is filled with the tones of what it holds, one or a still gradient, and none without', () => {
    const fill = (...diamond: Lensed['aspects']) => Folded.fill(Surfaces.diamond({ fold: 'folded', lenses: ['look'],
      tools: [], diamond, unfolded: false }).tones);
    expect(fill()).toBeUndefined();
    expect(fill('companionship')).toBeUndefined();
    expect(fill('knowledge')).toBe('var(--tone-blue)');
    expect(fill('knowledge', 'undertaking')).toBe('linear-gradient(135deg in oklab, var(--tone-gold), var(--tone-blue))');
  });
  it('folds a place-mark\'s leaves by the same rule', () => {
    const mark = (tone?: string) => ({ tone, words: tone ?? 'nothing', icons: [], companion: false, faint: false,
      witnesses: [] }) as unknown as Attested;
    expect(Folded.glint([mark()])).toBeUndefined();
    expect(Folded.glint([mark('gold'), mark('blue'), mark('gold')]))
      .toBe('linear-gradient(135deg in oklab, var(--tone-gold), var(--tone-blue))');
  });
});
