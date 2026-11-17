import { describe, expect, it } from 'bun:test';
import { Tiny } from '../support/tiny';
import { ModuleWriter } from '../../src/lang/module-writer';
import { RegionMarvels } from '../../src/world/region-marvels';

// A wonder within a work or a deep site carries a fragment of the country's history (the sites commission, item 3):
// met, it tells how its makers ended, once, and the company keeps it; with who the makers were known besides, the
// country's inference (RegionWorks.facts: makers and their fate point to the great work) completes. Never met, nothing
// is known. The wonder and its fragment are the generator's own lines (RegionMarvels.wonder); the reveal is written
// as RegionWorks.facts writes it.
const wonder = RegionMarvels.wonders.find(([, w]) => w.where === 'within')!;
const lines = RegionMarvels.wonder(wonder, 'hall', 'hall_wonder',
  { fact: 'history_bone_fate', fate: 'The last of them went into the barrows of their own will.' }).join('\n');
const hall = `
  Place hall "the hall" is room at 0, 0 underground.
  Place great "the great barrow" is room at 5, 0 outdoors.
  Company party "You" of 1 at hall.
  Discovery history_bone "Before the folk came, the Barrow-Kin held this country.".
  Discovery history_bone_fate "How the Barrow-Kin ended: the last of them went into the barrows.".
  Discovery great_found "The way to the great barrow.".
  Initially Assert knows(party, history_bone).
  Observe great_revealed near party when knows(party, history_bone) and knows(party, history_bone_fate) and not knows(party, great_found) "Put together, it points somewhere no single stone names." teaches great_found.
${lines}
  Goal false.`;
const knows = (t: Tiny, fact: string) => t.world.test(ModuleWriter.call('knows', 'party', `t__${fact}`));
describe('a wonder that carries a fragment', () => {
  it('tells how its makers ended once it is met, keeps it, and the inference completes', async () => {
    const t = await Tiny.start(hall);
    expect(knows(t, 'history_bone_fate')).toBe(false);
    const meet = t.journey.choices().find(c => c.command.includes('_meet'))!;
    const told = await t.journey.perform(meet.command, meet.label);
    expect(told).toContain('of their own will');
    expect(knows(t, 'history_bone_fate')).toBe(true);
    expect(knows(t, 'great_found')).toBe(true);
  });
  it('teaches nothing to a company that never meets it', async () => {
    const t = await Tiny.start(hall);
    await t.play('=+6');
    expect(knows(t, 'history_bone_fate')).toBe(false);
    expect(knows(t, 'great_found')).toBe(false);
  });
});
