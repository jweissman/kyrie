import { describe, expect, it } from 'bun:test';
import { Journeys } from '../../src/narrative/journeys';
import { Voice } from '../../src/narrative/voice';

// A journey's land told once (the boredom census, BO-02): the voice's land lines are few for each land (one for a
// lake, three for a wood), and every one said, the oldest had been said again word for word, "For an hour the path
// runs under trees" seven times over in four walks of a first hour. Setting out is said again; a journey begins
// somewhere.
describe('a journey told', () => {
  it('tells each line of the land once, and then nothing of it, but sets out again', () => {
    const used = new Set<string>(), wood = { land: 'wood' }, all = Voice.tiers('journey-land', wood).flat().length;
    const told = Array.from({ length: all + 2 }, (_, i) => {
      const line = Journeys.line('journey-land', wood, `walk:${i}`, used);
      if (line) { used.add(line.id); }
      return line?.id;
    });
    expect(new Set(told.filter(Boolean)).size).toBe(told.filter(Boolean).length);
    expect(told.slice(-2)).toEqual([undefined, undefined]);
    const depart = { time: 'morning', sky: 'fair' };
    for (const l of Voice.tiers('journey-depart', depart).flat()) { used.add(l.id); }
    expect(Journeys.line('journey-depart', depart, 'walk:again', used)).toBeDefined();
  });
});
