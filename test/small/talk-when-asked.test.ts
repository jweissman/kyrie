import { describe, expect, it } from 'bun:test';
import { Tiny } from '../support/tiny';
import { ModuleWriter } from '../../src/lang/module-writer';
import { Attending } from '../../src/ui/attention';
import { SceneModel } from '../../src/ui/scene';

// Someone dangerous is talked to only when there is something to be said to them now, not because something is
// written for them for later (M21's playability list, PL-20): the hobs' Gaffer, whose terms wait on a parley, had been
// led "Talk to the Gaffer", and the talk held nothing but attacking him. A ledge, a hob chief, and a question that
// opens once he tolerates the company.
const ledge = `
  Place ledge "the high ledge" is room at 0, 0 indoors.
  Company party "You" of 1 at ledge.
  Person gaffer "the Gaffer" at ledge { Role "the hobs' chief". Species goblin. Lair ledge. }
  Topic terms with gaffer "Ask the Gaffer what it would take" when tolerates(gaffer, party) once {
    Says "'Bells,' says the Gaffer.".
  }
  Goal false.`;
// The scene as the page draws it: whether the Gaffer's likeness opens a talk.
const talks = (t: Tiny) => !!Attending.place(SceneModel.build(t.screen)).subjects.find(x => x.id === 't__gaffer')
  ?.choices.some(c => Attending.talking(c) || c.id.endsWith('#talk'));

describe('someone dangerous to talk to', () => {
  it('is talked to only when there is something to be said now', async () => {
    const t = await Tiny.start(ledge);
    expect(talks(t)).toBe(false);
    const c = t.campaign as unknown as { world: { apply(c: unknown[]): unknown }; commitWorld(w: unknown): void };
    c.commitWorld(c.world.apply([{ kind: 'assert', call: ModuleWriter.call('tolerates', 't__gaffer', 'party') }]));
    expect(talks(t.look())).toBe(true);
  });
});
