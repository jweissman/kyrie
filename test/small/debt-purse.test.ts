import { describe, expect, it } from 'bun:test';
import { Tiny } from '../support/tiny';

// A debt is not advanced by whatever some rule pays a coin for (M21's playability list, PL-21): at the Stormy Horn
// the debt's gold had gone to "Ask Osmund Pyle to come with you", the old man with a bad hip, because a rule pays a
// coin for bringing anyone home, and every rule touching the purse had made its condition the debt's. The purse is
// waited on by selling (AimAdvances.short), never by every reward. An inn, an old man who would be walked home, a road.
const inn = `
  Place vale "the vale" is settlement.
  Place inn "the taproom" is room within vale at 0, 0 indoors.
  Place lane "the lane" is room within vale at 1, 0 outdoors.
  Passage door "the inn door" is door between inn and lane.
  Company party "You" of 1 at inn.
  Person old "Osmund" at inn { Role "an old man with a stick". Ancestry human. Peaceable. Pronouns he. }
  Initially Assert acceptsEscort(old, party). Initially Assert home(old, lane).
  Rule walked when following(old, party) and at(old, lane) { Increase quantity(party, gold) by 1. }
  Objective debt when quantity(party, gold) < 50 toward lane "You owe fifty coin by market day.".
  Goal false.`;

describe('a debt\'s gold', () => {
  it('is not on asking along someone a rule pays a coin to see home', async () => {
    const t = await Tiny.start(inn);
    t.follow('debt');
    expect(t.journey.choices().some(c => /come with you/.test(c.label))).toBe(true);
    expect(t.gold.map(a => a.subject ?? a.label)).not.toContain('t__old');
  });
});
