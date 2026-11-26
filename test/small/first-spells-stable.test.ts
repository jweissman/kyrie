import { afterAll, afterEach, describe, expect, it, spyOn } from 'bun:test';
import { Canon } from '../../src/canon/canon';
import { Creation } from '../../src/rules/creation';
import { SpellSelection } from '../../src/rules/spell-selection';
import { FirstSpells } from '../../src/creation/first-spells';
import { Content } from '../../src/content';
import type { Trait } from '../../src/rules/catalog-schema';

// A spell added to the catalog changes a caster's start only where the new spell is itself chosen (AGENTS.md: random
// draws are keyed by stable identity). Comprehend Languages, a first-level divination (b40e30950, OR-1099), had
// changed the mage's walk on the road home: Ilse, a diviner drawn by her own seed, won it in place of Second Sight,
// the other spell of her school, and knew every other spell as before. Both ways a mage's spells are set are held:
// the seeded draw of a life made by name (SpellSelection.choose, ranked by each spell's own hash) and the way's picks
// creation shows and sets out with (FirstSpells.picks, ranked by what the hand so far lacks, then by each spell's own
// hash: where the new spell is picked, the hand lacks otherwise, and the later levels' picks may follow from that, by
// design; its first level is then the old with the new spell in place of one). The spell added
// is a first-level divination of no catalog's, what Comprehend Languages does under another name, so that its kind
// is read as any other's.
const added = 'synthetic_scrying';
const original = Creation.spellbook.bind(Creation);
const ways = Object.keys(Canon.traits).filter(id => Canon.traits[id]?.spellAccess?.tradition === 'arcane');
const keys = Array.from({ length: 120 }, (_, i) => `region__party_${i}:spells`);
const withAdded = () => spyOn(Creation, 'spellbook').mockImplementation((tradition, level, restriction) => {
  const base = original(tradition, level, restriction);
  const fits = tradition === 'arcane' && level === 1 && (!restriction || restriction === 'divination');
  return fits ? [...base, added].sort() : base;
});
const without = (gone: string) => spyOn(Creation, 'spellbook')
  .mockImplementation((tradition, level, restriction) =>
    original(tradition, level, restriction).filter(id => id !== gone));
// Whether the spells with the new one are those without it, or the new one in place of exactly one of them.
const onlyWhereChosen = (before: string[], after: string[], spell: string) => after.includes(spell)
  ? after.filter(id => id !== spell).every(id => before.includes(id)) && after.length === before.length
  : JSON.stringify(after) === JSON.stringify(before);
const drawn = (way: string, key: string) =>
  SpellSelection.choose(Canon.traits[way] as Trait, undefined, SpellSelection.ranked(key), key);
const picks = (way: string) => FirstSpells.picks(way, FirstSpells.own('mage'));
const first = (ids: string[]) => ids.filter(id => Canon.abilities[id]?.spell?.level === 1 || id === added);
// The picks with a spell, against those without it: the same, or, where it is picked, the same at the first level but
// for it.
const picked = (before: string[], after: string[], spell: string) => after.includes(spell)
  ? onlyWhereChosen(first(before), first(after), spell) : JSON.stringify(after) === JSON.stringify(before);

describe('a spell added changes a mage\'s first spells only where it is chosen', () => {
  let spy: { mockRestore(): void } | undefined;
  const like = Content.abilities.find(a => a.id === 'comprehend_languages')!;
  Content.abilities.push({ ...like, id: added });
  afterAll(() => { Content.abilities.splice(Content.abilities.findIndex(a => a.id === added), 1); });
  afterEach(() => { spy?.mockRestore(); spy = undefined; });
  it('holds the seeded draw of every arcane way, for many seeds', () => {
    expect(ways).toContain('diviner');
    const before = ways.flatMap(w => keys.map(k => drawn(w, k)));
    spy = withAdded();
    const after = ways.flatMap(w => keys.map(k => drawn(w, k)));
    const moved = after.filter((a, i) => !onlyWhereChosen(before[i]!, a, added));
    expect(moved).toEqual([]);
    // And the new spell is chosen somewhere, by its merits: the hold is not vacuous.
    expect(after.some(a => a.includes(added))).toBe(true);
  });
  it('holds the picks of every arcane way', () => {
    const before = ways.map(picks);
    spy = withAdded();
    const after = ways.map(picks);
    expect(ways.filter((w, i) => !picked(before[i]!, after[i]!, added))).toEqual([]);
    expect(after.filter(p => p.includes(added)).length).toBeGreaterThan(0);
  });
  it('holds them for Comprehend Languages itself: without it, a diviner knows what she knew, but the one in its place', () => {
    const before = keys.map(k => drawn('diviner', k)), was = picks('diviner');
    spy = without('comprehend_languages');
    const after = keys.map(k => drawn('diviner', k));
    expect(keys.filter((_, i) => !onlyWhereChosen(after[i]!, before[i]!, 'comprehend_languages'))).toEqual([]);
    expect(picked(picks('diviner'), was, 'comprehend_languages')).toBe(true);
  });
});
