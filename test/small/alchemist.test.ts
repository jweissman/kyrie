import { describe, expect, it } from 'bun:test';
import { Tiny } from '../support/tiny';

// The Alchemist (the owner, 15 November: a player verb as a pin): collect, experiment, discover a preparation,
// reproduce it, use it. A recipe nobody has worked out is `undiscovered`; trying its two things together (`experiment`)
// finds it (`knowsRecipe`), and only then can it be made. Every recipe before it is common knowledge and nothing
// existing changes.
const yard = `
  Place yard "the yard" is room.
  Company party "You" of 1 at yard.
  Entity bitter_wash: recipe "heather and dandelion, ground dry".
  Initially Assert undiscovered(bitter_wash). Initially Assert takes(bitter_wash, heather). Initially Assert takesWith(bitter_wash, dandelion).
  Initially Assert makes(bitter_wash, antidote).
  Action pick(actor: group) "Pick heather and a dandelion" { Time 1. On success { Give heather to actor. Give dandelion to actor. } }
  Goal false.`;
const command = (t: Tiny, re: RegExp) => t.journey.choices().find(c => re.test(c.command))?.command;
const knows = (t: Tiny) => t.world.related('knowsRecipe').length > 0;

describe('an alchemist', () => {
  it('cannot make a secret recipe until an experiment has found it, then makes it from what it takes', async () => {
    const t = await Tiny.start(yard, { horizon: ['making'] });
    await t.perform(command(t, /^t__pick/)!);
    expect(command(t, /^make_plain\(/)).toBeUndefined();
    expect(command(t, /^experiment\(/)).toBeDefined();
    // The experiment is a check and can come to nothing; the things are none the worse, so it is tried again.
    for (let tries = 0; tries < 30 && !knows(t); tries++) { await t.perform(command(t, /^experiment\(/)!); }
    expect(knows(t)).toBe(true);
    // Found, it is not tried again, and it can be made.
    expect(command(t, /^experiment\(/)).toBeUndefined();
    const make = command(t, /^make_plain\(/);
    expect(make).toBeDefined();
    await t.perform(make!);
    expect(t.world.related('ownedItem').some(r => /antidote/.test(String(r.args[0])))).toBe(true);
  });
});
