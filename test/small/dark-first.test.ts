import { describe, expect, it } from 'bun:test';
import { Tiny } from '../support/tiny';

// In the dark, the light first, before any danger (the laboratory, 15 November: beside the beetles in the dark the
// four had led with "Attack", the lantern second, and a blind walker took the first and died).
const face = `
  Place gallery "the gallery" is room at 0, 0 underground.
  Place face "the working face" is room at 1, 0 underground.
  Passage cut "the cutting" is passage between gallery and face.
  Initially Assert unlit(gallery). Initially Assert unlit(face).
  Company party "You" of 1 at gallery.
  Person beetles "the beetles in the spoil" at face {
    Role "beetles as long as a forearm". Species beetle. Numbers 2. Level 1. Temperament defensive. Lair face.
  }
  Goal false.`;

describe('in the dark, beside a danger', () => {
  it('leads with the light, then the danger', async () => {
    const t = await Tiny.start(face);
    await t.perform('go(t__cut,t__face)');
    expect(t.glance.acts[0]?.why).toBe('dark');
    expect(t.glance.offer?.primary[0]?.type).toBe('light');
    expect([t.costs.region, t.costs.world]).toEqual([undefined, undefined]);
  });
  // With an aim followed, the light is its next step, in gold: the gold had gone out on every dark threshold the aim
  // led over (the laboratory's blind walks).
  it('gilds the light, with an aim followed', async () => {
    const t = await Tiny.start(`${face.replace('Goal false.', '')}
      Objective spoil when true toward face "Clear the beetles out of {face}.".
      Goal false.`);
    t.follow('spoil');
    await t.perform('go(t__cut,t__face)');
    expect(t.gold.map(a => a.why)).toEqual(['dark']);
  });
});
