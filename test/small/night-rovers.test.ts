import { describe, expect, it } from 'bun:test';
import { WorldAssembler } from '../../src/world/world-assembler';
import { RegionRovers } from '../../src/world/region-rovers';
import { RegionTracts } from '../../src/world/region-tracts';
import { ModuleSource } from '../../src/lang';

// Danger at night, a little (OR-1235; the owner, 26 November, as AGENTS.md has it: "danger is genuine; roads carry a
// little"): every country with rovers has one band besides its footpads that goes about by night (a pack, or the
// hungry dead), over open country and road away from its towns; it comes only in the dark, once, and warns first, as
// a territorial band does. Generator lines only, over four countries' first regions.
describe('the night\'s band', () => {
  for (const seed of ['iscoed', 'a1', 'thorn', 's0']) {
    it(`goes about ${seed} by night alone, warns first, and keeps off its towns`, () => {
      // Read as Kyr: where a rover goes about is declared as values (ModuleSource, AX-04).
      const region = WorldAssembler.region(seed, [0, 0]), lines = ModuleSource.text(RegionRovers.lines(region));
      const comes = lines.filter(l => /Rule wr\d+n_comes when .* and dark\(\) and /.test(l));
      expect(comes).toHaveLength(1);
      const id = /Rule (wr\d+n)_comes/.exec(comes[0]!)![1]!;
      const person = lines.join('\n').split(`Person ${id} `)[1]!.split('\n  }')[0]!;
      expect(person).toContain('Temperament territorial.');
      expect(person).toContain('Warns "');
      // By day nothing of it comes: every other rover's coming asks for daylight, and this one for the dark.
      expect(lines.filter(l => /Rule wr\d+\w*_comes when /.test(l) && / and dark\(\) and /.test(l))).toHaveLength(1);
      const roams = lines.filter(l => l.includes(`roams(${id}, `));
      expect(roams.length).toBeGreaterThan(0);
      for (const town of region.settlements.flatMap(t => t.cell === undefined ? [] : [RegionTracts.id(t.cell)])) {
        expect(roams.some(l => l.includes(`, ${town})`))).toBe(false);
      }
    });
  }
});
