import { afterAll, beforeAll, describe, expect, it } from 'bun:test';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { CanonicalNames } from '../../src/cli/canonical-names';

// An adventure's own names against the canon's and each other's (AU-35, The Warm Wall's friction): a relation, measure
// or query that the shared rules or the engine name already, and a rule and an ending of one name, said by
// `kyrie names` and verify before lint says them; every shipped adventure, origin, kit and template free of both (the
// debt origin's own laden had shadowed belongings.kyr's: worthSelling now).
describe('the canon\'s names', () => {
  let dir = '';
  beforeAll(async () => {
    dir = await mkdtemp(join(tmpdir(), 'kyrie-canon-names-'));
    await writeFile(join(dir, 'site.kyr'), 'Module x "x" {\n  Relation yields(group).\n  Measure hour(clock).\n'
      + '  Relation ownWord(group).\n  Rule step_again when ownWord(party) { Retract ownWord(party). }\n}\n');
    await writeFile(join(dir, 'endings.kyr'), 'Module x "x" {\n  Ending step_again "The Step Again" when true "Done.".\n}\n');
  });
  afterAll(async () => { await rm(dir, { recursive: true, force: true }); });
  it('says a relation or measure the shared rules or the engine name, and a rule and an ending of one name', () => {
    expect(CanonicalNames.shadows(dir)).toEqual([
      "Relation yields (site.kyr) is the shared rules' Relation (core.kyr): name its own otherwise",
      "Measure hour (site.kyr) is the engine's clock: name its own otherwise"]);
    expect(CanonicalNames.doubled(dir)).toEqual(['step_again: an Ending (endings.kyr) and a Rule (site.kyr), one rule'
      + ' to the engine']);
    expect(CanonicalNames.said('yields')).toMatch(/the shared rules' Relation/);
    expect(CanonicalNames.said('ownWord')).toBeUndefined();
  });
  it('reads an origin\'s, a kit\'s and a template\'s own, each declaration where it stands on its line', async () => {
    const origin = await mkdtemp(join(tmpdir(), 'kyrie-canon-origin-'));
    await writeFile(join(origin, 'origin.kyr'), 'Module origin "o" {\n  Relation ownWord(group). Relation claimed(reward).\n}\n');
    await writeFile(join(origin, 'lair.kyrt'), 'Module {id} "{name}" {\n  Query laden(a: group) means at(a, {site}).\n}\n');
    expect(CanonicalNames.shadows(origin)).toEqual([
      "Query laden (lair.kyrt) is the shared rules' Query (belongings.kyr): name its own otherwise",
      "Relation claimed (origin.kyr) is the shared rules' Relation (care.kyr): name its own otherwise"]);
    await rm(origin, { recursive: true, force: true });
  });
  it('finds every shipped adventure, origin, kit and folder of templates free of both', () => {
    const dirs = CanonicalNames.dirs();
    expect(dirs.some(d => d.includes('data/origins/'))).toBe(true);
    expect(dirs.some(d => d.includes('data/generation/'))).toBe(true);
    expect(dirs.flatMap(d => [...CanonicalNames.shadows(d), ...CanonicalNames.doubled(d)])).toEqual([]);
  });
});
