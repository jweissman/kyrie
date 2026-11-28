import { describe, expect, it } from 'bun:test';
import { CompanyChapters } from '../../../src/handbook/phb-company';
import { Creation } from '../../../web/engine/creation';
import { CreationFlow } from '../../../src/creation/creation-flow';
import type { Setting } from '../../../src/creation/protocol';

// Feature pins: see test/features/choice/consequence.pin.test.ts. The encyclopedia's peoples carry what matters (the
// owner, 27 November: "The details from the encyclopedia don't cover anything interesting or important (demography,
// sociology…?)"; OR-1802): where each people lives, how many and in what settlements; how it lives together and how it
// is seen; and for the peoples a life may begin as, what that means for one. Written in data, terse and concrete, read
// by the encyclopedia and by creation's book alike, each part under its head.
const peoples = CompanyChapters.ancestries().entries ?? [];
const names = { human: { she: ['Wenna'], he: ['Odo'], they: ['Wren'] } };
const setting: Setting = { title: 'Marshfen', generated: true, pitch: { heading: '', text: '' }, names,
  party: [Creation.protagonist('human', 'told', names)] };
const counted = new RegExp('\\b(few|fewer|dozen|hundreds?|thousand|twenty|thirty|forty|fifty|two|three|four|five|'
  + 'counted|numerous|one)\\b', 'i');

describe('Character › Each people told by where it lives, how it lives, and a life begun as one', () => {
  it('says of every people where it lives and how many, and of each a life may begin as how it is seen and what that means', () => {
    for (const e of peoples) {
      const parts = new Map(e.parts);
      expect([e.id, counted.test(parts.get('Where they live') ?? '')]).toEqual([e.id, true]);
      if (e.kind !== 'playable ancestry') { continue; }
      expect([e.id, [...parts.keys()]]).toEqual([e.id, ['How they look', 'Where they live', 'How they live',
        'How they are seen', 'A life begun as one']]);
    }
  });
  it('says it tersely, in plain words', () => {
    const told = ['Where they live', 'How they are seen', 'A life begun as one'];
    for (const e of peoples) {
      for (const [head, words] of (e.parts ?? []).filter(([h]) => told.includes(h))) {
        const sentences = words.split(/(?<=[.!?])\s+/);
        expect([e.id, head, sentences.length <= 3 && words.length <= 300]).toEqual([e.id, head, true]);
        expect([e.id, head, /\bsome(one|thing|body)\b|, and [^,.;]+, and /i.test(words)]).toEqual([e.id, head, false]);
      }
    }
  });
  it('is the page creation turns a card over to', () => {
    const elf = new CreationFlow(setting, Creation.catalog()).steps().find(x => x.id === 'you')!.cards
      .find(c => c.id === 'elf')!.entry!;
    expect(elf.book).toBe('Ancestries');
    expect(elf.text?.map(p => p.heading)).toEqual([undefined, 'How they look', 'Where they live', 'How they live',
      'How they are seen', 'A life begun as one']);
    expect(elf.text?.at(-1)?.text).toMatch(/^An elf who leaves the woods young has still lived a hundred years/);
  });
});
