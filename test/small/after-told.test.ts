import { describe, expect, it } from 'bun:test';
import { readFileSync } from 'node:fs';

// What a thing is once something is done to it is said as itself, never by what only its first line told (OR-697,
// cold plays 3 and 4): "The burst strongbox is empty, and so is the rust around it" was the first word of a
// strongbox at the winze foot, the coins gathered unseen among the room's things, and read as the paymaster's
// strong-box broken at the shaft bottom; "The notebook lies open by the dead fire where you left it" spoke of a fire
// in a passage whose camp had not been told. A deep room's coin, gathered, introduces what is left; its words never
// name the deep's own strong-box; and the notebook read lies open, by no fire.
const hoards = JSON.parse(readFileSync('data/generation/deep/hoards.json', 'utf8')).hoards as [string, string][];
describe('a thing as it is after', () => {
  it('is said as itself: a room\'s coin gathered', () => {
    expect(hoards.length).toBeGreaterThan(4);
    expect(hoards.map(([, gathered]) => gathered).filter(g => /^The /.test(g))).toEqual([]);
    expect(hoards.flat().filter(l => /strong-?box/i.test(l))).toEqual([]);
  });
  it('is said as itself: a notebook read', () => {
    const read = /State read "([^"]*)"/.exec(readFileSync('data/generation/deep/rooms.kyrt', 'utf8'))![1]!;
    expect(read).toMatch(/notebook/);
    expect(read).not.toMatch(/fire/);
  });
});
