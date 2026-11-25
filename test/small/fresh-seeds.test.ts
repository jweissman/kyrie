import { describe, expect, it } from 'bun:test';
import { FreshSeeds } from '../../src/world/fresh-seeds';
import { FirstChoice } from '../../src/creation/first-choice';
import { WorldAssembler } from '../../src/world/world-assembler';
import { RegionWriter } from '../../src/world/region-writer';
import { ReferenceSettlement } from '../../src/world/reference-settlement';

// Every new life begins in the reference game (the owner's playtest, 25 November: "it takes way too long to start up a
// new world; and once you do it's all very sweaty and unclear how to get to the dungeon, if there is one"): the seed
// an unnamed new life rolls (the engine's { kind: 'seed' }, and the terminal's) is drawn again until its first
// country's first town is the reference game's settlement, with the old woods beside it and the way down found there
// by searching the fallen stones. Gate worlds and seeds named keep theirs (Iscoed is a marsh). The countries' texts
// only, no world.
describe('a new life\'s world', () => {
  it('always begins in the reference game\'s settlement, with the way down findable in its woods', () => {
    let n = 0;
    const seeds = Array.from({ length: 6 }, () => FreshSeeds.seed(() => `fresh${n++}`));
    expect(n).toBeGreaterThan(6);
    for (const seed of seeds) {
      const region = WorldAssembler.region(seed, [0, 0]), town = ReferenceSettlement.of(region);
      expect([seed, town?.name]).toEqual([seed, expect.any(String)]);
      const t = town!.id, text = RegionWriter.source(region, { size: 1, contacts: [] });
      expect([seed, new RegExp(`Passage ${t}_wood_down .* hidden until ${t}_wood_door`).test(text),
        text.includes(`Discovery ${t}_wood_door `)]).toEqual([seed, true, true]);
    }
  });
  it('is drawn at random for a life with no seed named, and never changes one that is named', () => {
    expect(FreshSeeds.referenced(FreshSeeds.seed(FirstChoice.seed))).toBe(true);
    // Iscoed is a marsh; kite, a forest, is one of the worlds the specs walk by name, which keep their first town.
    expect([FreshSeeds.referenced('iscoed'), FreshSeeds.referenced('kite')]).toEqual([false, false]);
  });
});
