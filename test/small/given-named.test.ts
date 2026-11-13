import { describe, expect, it } from 'bun:test';
import { Tiny } from '../support/tiny';

// A thing the world gives the company later, by its kind, is named as the things it set out with are: "a lantern",
// not the catalog's "Lantern". Review A's lantern, given for the rats, was filled twice over, "Wynn fills Lantern and
// lights it." and "Wynn fills a lantern and lights it.", the act's words and its telling naming it two ways (T24-17).
const adit = `
  Place adit "the old adit" is room at 0, 0 underground.
  Company party "You" of 1 at adit.
  Person bask "Bask" at adit { Role "a corn-factor". Ancestry human. Peaceable. Pronouns he. }
  Topic pay with bask "Ask Bask for the lantern" when true once {
    Says "'Here.'". On discuss { Give lantern to actor. Give lamp_oil to actor. }
  }
  Goal false.`;

describe('a thing given', () => {
  it('is named as a kit\'s own, and its use told once', async () => {
    const t = await Tiny.start(adit);
    await t.play('^Ask Bask for the lantern');
    const fill = t.look().journey.choices().find(c => /^light_lamp\(/.test(c.command))!;
    expect(fill.label).toBe('Fill a lantern from a flask of lamp oil and light it');
    await t.perform(fill.command);
    expect((t.leaf.exchange?.lines ?? []).map(l => l.text).filter(l => /fill/i.test(l))).toEqual(['You fill a lantern and light it.']);
  });
});
