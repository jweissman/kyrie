import { describe, expect, it } from 'bun:test';
import { readFileSync } from 'node:fs';
import { Quantity, type Baseline } from '../../scripts/quantity/quantity';
import { QuantityMeasures, type Readings } from '../../scripts/quantity/measures';
import { Reckon } from '../../scripts/quantity/reckon';
import { QuantityWalks, type Walked } from '../../scripts/quantity/walks';
import { QuantityCountry, type Read } from '../../scripts/quantity/country';
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
  ...o });
const country = (seed: string, o: Partial<Read> = {}): Read => ({ seed, near: 12,
  fair: [{ band: 'wolves', fell: 3, said: 'deadly', warned: true }, { band: 'rats', fell: 1, said: 'hard', warned: false },
    { band: 'fox', fell: 0, said: 'slight', warned: false }],
  economy: { day: 60, kit: 10, dearest: 50, ratio: 1, worth: 200, stock: 100, purse: 6, missing: [] },
  reach: { things: ['site:the barrow', 'wonder:the stone', 'pleasure:the hens'], cells: 7 },
  dungeon: { name: 'the barrow', minutes: 90, hexes: 1, levels: 2, companion: true, light: true, provisions: false,
    at: { companion: false, light: true, provisions: false, gear: true } }, ...o });
const fixed: Readings = { golden: walk('golden walk', 'iscoed', { fights: 0, minutes: 600 }),
  gold: [walk('gold a1', 'a1'), walk('gold b2', 'b2')], countries: [country('a1'), country('b2', { near: 50 })],
  stranded: { creatures: ['golem'], works: [], scenarios: ['x', 'y'] } };
const read = (id: string) => Reckon[QuantityMeasures.all.find(m => m.id === id)!.read](fixed);
describe('the quantity gate', () => {
  it('works each measure out of one fixed reading', () => {
    expect(read('fights').each).toEqual({ 'golden walk': 0, 'gold a1': 0.5, 'gold b2': 0.5 });
    expect(read('bands').each).toEqual({ a1: 12, b2: 50 });
    // Of the bands that felled the one who plays, those asked before: one of two in each seed.
    expect(read('fair').value).toBe(50);
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
