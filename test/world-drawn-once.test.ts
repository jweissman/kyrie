import { describe, expect, it } from 'bun:test';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import type { BundleSource } from '../src/campaign/bundle-source';
import { WorldAssembler } from '../src/world/world-assembler';
import { WorldDrawings } from '../src/world/world-drawings';
import { Origins } from '../src/world/origins';
import { CanonVocabulary } from '../src/canon/canon-vocabulary';
import { Creation } from '../web/engine/creation';

// A new life draws its country once (WorldDrawings): creation reads the country as drawn, and the start into it is
// assembled from the same drawing, its own copy. The same seed gives the same world either way, compared canonically:
// every file the world writes, its report, and what creation says of it, against a world whose country was drawn
// afresh. And what creation says is what a whole world drawn for nobody said of it, as creation had drawn one.
const source = NodeBundleSource.shared, seed = 'drawn-once';
const party = [{ name: 'Wenna', raceId: 'human', classId: 'warrior' }] as const;
const files = async (w: { source: BundleSource }) => Object.fromEntries([...(w.source as unknown as
  { files: Map<string, string> }).files].sort(([a], [b]) => a.localeCompare(b)));
const world = async () => {
  const w = await WorldAssembler.assemble(seed, source, { party: [{ ...party[0] }] });
  return { files: await files(w), report: JSON.stringify(w.report) };
};
describe('a country drawn once for a new life', () => {
  it('gives the same world as one drawn afresh, and creation says of it what a whole world said', async () => {
    WorldDrawings.forget(source);
    const fresh = await world();
    const setting = await new Creation().generate(seed, undefined, source);
    const again = await world();
    expect(again.files).toEqual(fresh.files);
    expect(again.report).toBe(fresh.report);
    // As creation had read it: a whole world drawn, its region and placements as written.
    WorldDrawings.forget(source);
    const whole = await WorldAssembler.assemble(seed, source);
    WorldDrawings.forget(source);
    expect(setting.title).toBe(whole.report.region.name);
    expect(setting.terrain).toBe(whole.report.region.terrain);
    expect(setting.origins).toEqual(Origins.choices(await Origins.load(source), whole.report.region,
      whole.report.placements, CanonVocabulary.context()));
    expect(await new Creation().generate(seed, undefined, source)).toEqual(setting);
  }, 60000);
  it('gives each its own copy: what one world does to its country is not another\'s', async () => {
    const one = await WorldDrawings.of(seed, source), two = await WorldDrawings.of(seed, source);
    expect(two).toEqual(one);
    one.region.name = 'Elsewhere'; one.placements.length = 0;
    const three = await WorldDrawings.of(seed, source);
    expect(three.region.name).toBe(two.region.name);
    expect(three.placements.length).toBe(two.placements.length);
  }, 30000);
});
