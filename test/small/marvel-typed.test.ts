import { describe, expect, it } from 'bun:test';
import { Tiny } from '../support/tiny';
import { ModuleParser } from '../../src/lang/module-parser';
import { ModuleWriter } from '../../src/lang/module-writer';

// Violet is a marvel's, and an author can declare one (the atlas study, Model A: AT-01). Its one producer had been a
// regular expression on the thing's id (`wonder_…`, which only the generators write), against Affordances' own
// contract, "never from a choice's words": no authored adventure could make a marvel, an uncanny door or a living
// house, and violet met no row in 1,920 of the study's census. Now a thing's own part, `Marvel.`, lowered as
// `marvel(thing)` and read as the engine's, whatever the thing is called.
const glade = (part: string, id = 'stone') => `
  Place glade "the glade" is room at 0, 0 outdoors.
  Company party "You" of 1 at glade.
  Thing ${id} "a standing stone humming" at glade is scenery {
    ${part}
    State unwoken "A standing stone hums, very low, a note you feel in your teeth.".
    State woken "The stone is quiet, and warm to the hand.".
    Change meet "Lay a hand on the humming stone" from unwoken to woken.
  }
  Goal false.`;
const drawn = (t: Tiny) => t.glance.acts.find(a => /standing stone|humming stone/.test(a.label))?.aspects ?? [];

describe('a marvel', () => {
  it('is violet where its author declares it, by any name', async () => {
    expect(drawn(await Tiny.start(glade('Marvel.')))).toContain('wonder');
  });
  it('is not violet for its name alone', async () => {
    expect(drawn(await Tiny.start(glade('', 'wonder_stone')))).not.toContain('wonder');
  });
  it('is written back as the engine keeps it, and read again a marvel', () => {
    const m = ModuleParser.parse(`Module t "T" {\n  Relation marvel(entity).\n${glade('Marvel.')}\n}`);
    const again = ModuleParser.parse(ModuleWriter.write(m));
    expect(ModuleWriter.write(m)).toContain('Initially Assert marvel(stone).');
    expect(again.initial).toContainEqual({ kind: 'assert', call: { kind: 'call', name: 'marvel', args: ['stone'] } });
  });
});
