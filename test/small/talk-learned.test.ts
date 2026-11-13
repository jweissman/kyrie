import { describe, expect, it } from 'bun:test';
import { Tiny } from '../support/tiny';
import { Conversation } from '../../web/reader/conversation';
import type { Frame } from '../../web/engine/protocol';
import type { Choice } from '../../src/ui/choice-list';

// What the company learns in a talk is set apart on the page as learned, by what the narrator says it is (the
// exchange's learned), not by the words its note begins with ("Noted: ", "Borne out: "): AR-05, text inference in the
// page. A miller who says why the wheel stopped.
const mill = `
  Place mill "the mill" is room at 0, 0.
  Company party "You" of 1 at mill.
  Person tam "Tam" at mill { Role "a miller". Ancestry human. Peaceable. Pronouns he. }
  Entity stopped: fact "The wheel was stopped on purpose, with a wedge.".
  Topic why with tam "Ask Tam why the wheel stopped" when not knows(actor, stopped) once {
    Says "'Someone put a wedge in it,' says Tam.". On discuss { Assert knows(actor, stopped). }
  }
  Goal false.`;

describe('what a talk teaches', () => {
  it('is told as learned by the exchange\'s own word for it', async () => {
    const t = await Tiny.start(mill);
    await t.perform(t.journey.choices().find(c => /^Ask Tam why the wheel stopped/.test(c.label))!.command);
    const exchange = t.leaf.exchange!;
    expect(exchange.learned?.length).toBe(1);
    const lines = Conversation.lines({ leaf: t.leaf } as unknown as Frame, { id: 'x' } as Choice, 'Ask Tam why');
    expect(lines.filter(l => l.kind === 'learned').map(l => l.text)).toEqual([expect.stringMatching(/wedge/)]);
  });
});
