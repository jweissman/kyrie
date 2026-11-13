import { describe, expect, it } from 'bun:test';
import { Origins } from '../../src/world/origins';

// The debt's aims go on over every old place the innkeeper told of (M21's PL-27): at Marsh Howe, searched and left
// still short, the aim had still named it, nothing was gold, and Palusporta, told of with the others, was never led.
// Now: the nearest; been to and come back to the shop, the next; been to and left, the last.
const chain = (near: Record<string, unknown>) =>
  (Origins as unknown as { chain(owing: string, near: Record<string, unknown>): string }).chain('owing', near);

describe('the debt\'s chain', () => {
  it('goes on to the last old place, once the next is been to and left', () => {
    const kyr = chain({ near: 1, further: 1, furthest: 1 });
    expect(kyr).toContain('Objective owing_further when owing and nearSpent(party) and not furtherSpent(party)');
    expect(kyr).toContain('Rule further_spent when nearSpent(party) and been(party, further) and not within(party, further)');
    expect(kyr).toMatch(/Objective owing_furthest when owing and furtherSpent\(party\) toward furthest/);
  });
  it('stops where fewer were told of', () => {
    expect(chain({ near: 1, further: 1 })).not.toContain('furtherSpent');
    expect(chain({ near: 1 })).not.toContain('nearSpent');
    expect(chain({})).toBe('');
  });
});
