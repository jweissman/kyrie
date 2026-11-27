import { describe, expect, it } from 'bun:test';
import { readFileSync } from 'node:fs';
import { Quantity, type Baseline } from '../../scripts/quantity/quantity';
import { QuantityMeasures, type Readings } from '../../scripts/quantity/measures';
import { Reckon } from '../../scripts/quantity/reckon';
import { QuantityWalks, type Walked } from '../../scripts/quantity/walks';
import { QuantityCountry, type Read } from '../../scripts/quantity/country';
import { QuantityLeads, type Led } from '../../scripts/quantity/leads';
import type { Campaign } from '../../src/campaign/campaign';
import type { Predicate } from '../../src/lang/module';

// The quantity gate's wiring (scripts/quantity, doc/architecture/quantity.md), on one fixed reading: each measure
// worked out from it as said, a band held on every seed's value, a ratchet only the right way, and the baseline
// holding every band and ratchet the gate names. The worlds and walks themselves are the gate's to read, not this.
const walk = (name: string, seed: string, o: Partial<Walked> = {}): Walked => ({ name, seed, minutes: 120, fights: 1,
  turns: [{ tones: { gold: 1, blue: 2 }, none: false, unwitnessed: [], fight: false },
    { tones: {}, none: true, unwitnessed: [], fight: false }, { tones: {}, none: false, unwitnessed: [], fight: true }],
  aims: [{ id: `${seed}_a`, key: 'rats', kind: 'kill', text: '', travelled: 30, done: true, arrived: false },
    { id: `${seed}_b`, key: `${seed}_b`, kind: 'fetch', text: '', travelled: 90, done: true, arrived: true }],
  people: [{ id: 'boy', name: 'the boy', why: 'joined' }, { id: 'kynes', name: 'Kynes, innkeeper', why: 'anchor' }],
  grounds: { place: { minutes: 120, fights: 2 }, road: { minutes: 30, fights: 0 }, expeditions: [
    { place: 'barrow', fights: 1, reward: true }, { place: 'barrow', fights: 1, reward: true },
    { place: 'cave', fights: 0, reward: true }, { place: 'cave', fights: 0, reward: true }] },
  ...o });
const country = (seed: string, o: Partial<Read> = {}): Read => ({ seed, near: 12,
  fair: [{ band: 'wolves', fell: 3, said: 'deadly', warned: true, mortal: true },
    { band: 'rats', fell: 1, said: 'hard', warned: false, mortal: true },
    { band: 'fox', fell: 1, said: 'slight', warned: false, mortal: false }],
  economy: { day: 60, kit: 10, dearest: 50, ratio: 1, worth: 200, stock: 100, purse: 6, missing: [] },
  reach: { things: ['site:the barrow', 'wonder:the stone', 'pleasure:the hens'], cells: 7 },
  dungeon: { name: 'the barrow', minutes: 90, hexes: 1, levels: 2, companion: true, light: true, provisions: false,
    at: { companion: false, light: true, provisions: false, gear: true } }, returned: ['barrow', 'cave'], ...o });
const fixed: Readings = { golden: walk('golden walk', 'iscoed', { fights: 0, minutes: 600 }),
  gold: [walk('gold a1', 'a1'), walk('gold b2', 'b2')], countries: [country('a1'), country('b2', { near: 50 })],
  stranded: { creatures: ['golem'], works: [], scenarios: ['x', 'y'] } };
const read = (id: string) => Reckon[QuantityMeasures.all.find(m => m.id === id)!.read](fixed);
describe('the quantity gate', () => {
  it('works each measure out of one fixed reading', () => {
    expect(Reckon.fights(fixed).each).toEqual({ 'golden walk': 0, 'gold a1': 0.5, 'gold b2': 0.5 });
    // At combat places two fights in two hours; on the roads, half an hour on each is too little to read.
    expect(read('places').each).toEqual({ 'golden walk': 1, 'gold a1': 1, 'gold b2': 1 });
    expect(read('roads').value).toBeNull();
    expect(read('returned').value).toBe(2);
    // Back to the barrow, a fight and a reward again, on each of three walks; back to the cave, no fight.
    expect(read('again').value).toBe(3);
    expect(read('bands').each).toEqual({ a1: 12, b2: 50 });
    // Of the bands whose reckoning felled the one who plays, those asked before: one of two in each seed; the fox,
    // felled in the census's trials alone, is said, not held.
    expect(read('fair').value).toBe(50);
    expect(read('fair').note).toContain('trials alone: 2');
    expect(read('treasure').value).toBe(2);
    // Marks per turn outside a fight's frame: three over two turns; one of them blank.
    expect(read('marks').each!['gold a1']).toBe(1.5);
    expect(read('blank').each!['gold a1']).toBe(50);
    expect(read('unwitnessed').value).toBe(0);
    expect(read('reach').value).toBe(3);
    expect(read('variety').value).toBe(2);
    // The rats are in both seeds' first hour; each seed's own aim in one.
    expect(read('recurrence').note).toBe('1 of 3: rats');
    expect(read('nowhere').value).toBe(50);
    expect(read('ready').value).toBe(2);
    expect(read('levels').value).toBe(2);
    expect(read('outfit').value).toBe(2);
    expect(read('stranded').value).toBe(3);
    expect(read('identity').value).toBe(50);
  });
  it('holds a band on every value read, and a ratchet only the right way', () => {
    const base: Baseline = { bands: { bands: { floor: 5, ceiling: 40 } }, ratchets: { stranded: 4, fair: 50 } };
    const m = (id: string) => QuantityMeasures.all.find(x => x.id === id)!;
    expect(Quantity.holds(m('bands'), read('bands'), base)).toBe(false);
    expect(Quantity.holds(m('stranded'), read('stranded'), base)).toBe(true);
    expect(Quantity.holds(m('stranded'), { value: 5, note: '' }, base)).toBe(false);
    expect(Quantity.holds(m('fair'), { value: 40, note: '' }, base)).toBe(false);
    // --update keeps a gain and never a loss; --rebase writes what was read.
    Quantity.update(base, m('stranded'), { value: 6, note: '' }, false);
    expect(base.ratchets.stranded).toBe(4);
    Quantity.update(base, m('stranded'), { value: 2, note: '' }, false);
    expect(base.ratchets.stranded).toBe(2);
    Quantity.update(base, m('stranded'), { value: 6, note: '' }, true);
    expect(base.ratchets.stranded).toBe(6);
  });
  it('keeps a baseline for every band and ratchet it names, each with its reason', () => {
    const base = JSON.parse(readFileSync(Quantity.file, 'utf8')) as Baseline;
    for (const m of QuantityMeasures.all) {
      expect(m.why.length).toBeGreaterThan(20);
      if (m.kind === 'band') { expect(base.bands[m.id]).toBeDefined(); }
      if (m.kind === 'up' || m.kind === 'down') { expect(base.ratchets[m.id]).toBeDefined(); }
    }
  });
  it('reads the reference game\'s first hour: the way to the dungeon, its colours, its aims, its blank moves', () => {
    const life = (name: string, o: Partial<Led>): Led => ({ name, mouth: 10, wandered: 12, tones: ['gold', 'red'],
      above: ['gold'], jobs: [], blank: { led: 1, wandered: 2 }, moves: { led: 60, wandered: 60 }, blanks: {}, ...o });
    const leads: Readings = { ...fixed, leads: [life('warrior order', { mouth: 22, wandered: null, blanks: { ride: 3 },
      jobs: [{ id: 'errand', text: '', opens: ['aim wood_go'] }, { id: 'home', text: '', opens: [] }] }),
    life('mage debt', { mouth: 9, above: ['gold', 'blue', 'green'], blanks: { ride: 1, edge: 2 } }),
    life('thief map', { mouth: null })] };
    const at = (id: string) => Reckon[QuantityMeasures.all.find(m => m.id === id)!.read](leads);
    // A life never come to the mouth counts as farthest; a wanderer that never finds it, as strayed.
    expect([at('mouth').value, at('strayed').value, at('colours').value]).toEqual([22, 1, 1]);
    expect(at('connected').value).toBe(50);
    expect(at('connected').note).toContain('opening nothing: home');
    expect(at('aimless').value).toBe(3);
    expect(at('aimless').note).toBe('ride 4, edge 2');
    // Unread, each is said not read and held by nothing.
    expect(Reckon.mouth(fixed).value).toBeNull();
    // What an aim seen through opened: another aim, a fact a condition asks, someone joined; not a fact nothing asks.
    const step = (held: string[], facts: string[], members = 1) => ({ held: new Set(held), facts: new Set(facts),
      members, history: 0 });
    expect(QuantityLeads.opened(step(['a'], []), step(['b'], ['read', 'idle'], 2), 'a', new Set(['read'])))
      .toEqual(['aim b', 'fact read', 'joined']);
  });
  it('reads an aim\'s kind from its condition, and hexes over a land\'s cells', () => {
    const not = (name: string): Predicate => ({ kind: 'not', value: { kind: 'call', name, args: ['x'] } });
    expect(QuantityWalks.kind(not('dead'))).toBe('kill');
    expect(QuantityWalks.kind({ kind: 'and', left: not('region__told'), right: not('carries') })).toBe('fetch+tell');
    expect(QuantityWalks.kind(not('bell_rung'))).toBe('stage');
    const c = { module: { charts: { land: { width: 6, height: 6 } } } } as unknown as Campaign;
    expect(QuantityCountry.hexes(c, { land: 'land', cell: 0 }, { land: 'land', cell: 3 })).toBe(3);
    expect(QuantityCountry.hexes(c, { land: 'land', cell: 0 }, { land: 'other', cell: 0 })).toBe(Infinity);
  });
});
