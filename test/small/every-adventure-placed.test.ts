import { describe, expect, it } from 'bun:test';
import { readdirSync, readFileSync, statSync } from 'node:fs';

// One world holds every adventure (Mission 16's XIII, test/adventure-library): each adventure is a province of the
// first country, listed in data/adventures/countries.json, so that a generated world reaches it. Nothing had tied the
// adventures' folders to that list, and six went unplaced as they were integrated (the owner, 24 November: "shouldn't
// all adventures be available in a single country now?"). Those not yet placed are named here, the list only to
// shrink: each placed is taken off it, and a new adventure is never added to it (OR-420: the last five placed on
// 25 November, so it is empty, and stays so).
const unplaced: string[] = [];
describe('every adventure', () => {
  const listed = new Set((JSON.parse(readFileSync('data/adventures/countries.json', 'utf8')) as {
    countries: { bundle: string }[] }).countries.map(c => c.bundle.split('/')[0]!));
  const dirs = readdirSync('data/adventures').filter(d => statSync(`data/adventures/${d}`).isDirectory());
  it('is a province of the first country, or named here as not yet placed', () => {
    expect(dirs.filter(d => !listed.has(d) && !unplaced.includes(d))).toEqual([]);
  });
  it('names here none that is placed already', () => {
    expect(unplaced.filter(d => listed.has(d))).toEqual([]);
  });
});
