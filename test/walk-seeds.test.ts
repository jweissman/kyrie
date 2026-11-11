import { describe, expect, it } from 'bun:test';
import { Walking } from './support/walking';

// The Walk is placed in every first country the standing list names it for, its people are named for the country, and on the
// second day a stranger standing on the first green sees it and is told of it (the lesson of the blind playtests: an
// enthusiasm must be in the world itself, not only in a rumour).
describe('the Walk, in several countries', () => {
  it.each(['kahitude', 'a1', 'b2', 'thorn', 'c3', 'd4', 'kite'])('is placed in %s on four different towns, named for the country, and seen from the first green on the second day', async seed => {
    const { j, placed } = await Walking.world(seed, 'ranger');
    expect(new Set(Object.values(placed.bindings)).size).toBe(4);
    expect(placed.bindings.a).toBe('s1');
    expect(placed.modules).toEqual(['walk']);
    const names = ['leader', 'pettifer', 'annet', 'wenna', 'gaunt', 'dray', 'hask', 'orme', 'teague']
      .map(id => j.campaign.module.entities.find(e => e.id === Walking.k(id))!.name);
    expect(names.some(n => /^Someone/.test(n))).toBe(false);
    expect(new Set(names).size).toBe(names.length);
    const drawn = ['creed', 'flashpoint', 'patron_is', 'bound_by', 'leader_kind'].map(r => Walking.drawn(j, r).join());
    expect(drawn.every(d => d.length > 0)).toBe(true);
    expect(Walking.drawn(j, 'stance').length).toBe(4);
    const first = String(await j.play('=day 2 10:00'));
    expect(first).toMatch(/barefoot strangers/);
    expect(Walking.knows(j, 'walk_heard')).toBe(true);
    // And the aim is on the page: someone to find, and the camp is a way on from the green.
    expect(j.offers('To the Walkers. camp')).toBe(true);
    console.log(seed, drawn.join(' '), 'a=' + placed.bindings.a, 'b=' + placed.bindings.b, 'c=' + placed.bindings.c, 'd=' + placed.bindings.d);
  }, 600000);
});
