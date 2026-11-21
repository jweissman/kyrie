import { afterAll, beforeAll, describe, expect, it } from 'bun:test';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { readdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { CanonicalNames } from '../../src/cli/canonical-names';

// An adventure's own names against the canon's and each other's (AU-35, The Warm Wall's friction): a relation, measure
// or query that the shared rules or the engine name already, and a rule and an ending of one name, said by
// `kyrie names` and verify before lint says them; every shipped adventure free of both.
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
      "Relation yields (site.kyr) is the shared rules' Relation (core.kyr): name the adventure's own otherwise",
      "Measure hour (site.kyr) is the engine's clock: name the adventure's own otherwise"]);
    expect(CanonicalNames.doubled(dir)).toEqual(['step_again: an Ending (endings.kyr) and a Rule (site.kyr), one rule'
      + ' to the engine']);
    expect(CanonicalNames.said('yields')).toMatch(/the shared rules' Relation/);
    expect(CanonicalNames.said('ownWord')).toBeUndefined();
  });
  it('finds every shipped adventure free of both', () => {
    const root = join(import.meta.dir, '../../data/adventures');
    const found = readdirSync(root, { withFileTypes: true }).filter(d => d.isDirectory())
      .flatMap(d => [...CanonicalNames.shadows(join(root, d.name)), ...CanonicalNames.doubled(join(root, d.name))]);
    expect(found).toEqual([]);
  });
});
