import { describe, expect, it } from 'bun:test';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { PlayTool } from '../src/cli/play-tool';
import { WorldAssembler } from '../src/world/world-assembler';
import { StockOpenings } from '../src/world/stock-openings';
import { Creation } from '../web/engine/creation';
import { EngineStarts } from '../web/engine/engine-starts';

// A stock opening is chosen at creation, never by the world (StockOpenings): a life, a kept play or a cold capture
// that never chose one begins exactly as before. Drawn without it, Iscoed's warrior writes no opening, begins on the
// green, and its origin knows on beginning what it always knew; drawn with it, the region gains only the opening's own
// lines and the company's place, and nothing else of the region's text moves (checked by hand against main on
// 23 November: every generated file of the world drawn without it byte for byte the same).
const party = [{ name: 'Wenna', raceId: 'human', classId: 'warrior', rolled: Creation.rolled('iscoed', 'warrior') }];
const drawn = async (opening?: string) => {
  const origin = await PlayTool.given('iscoed', party[0]!);
  const w = await WorldAssembler.assemble('iscoed', NodeBundleSource.shared, { party, origin, ...opening ? { opening } : {} });
  const read = (path: string) => w.source.read(w.source.resolve(path)).catch(() => '');
  const manifest = JSON.parse(await read('world-iscoed/region/module.json')) as { source: string[] };
  const region = (await Promise.all(manifest.source.map(f => read(`world-iscoed/region/${f}`)))).join('\n');
  return { region, origin: await read('world-iscoed/origin/origin.kyr'), opening: await read('world-iscoed/opening/opening.kyr'),
    campaign: JSON.parse(await read(w.path)) as { modules: { id: string }[] } };
};
describe('a life with no stock opening chosen', () => {
  it('begins as it always did, and one chosen adds only its own lines', async () => {
    const off = await drawn(), on = await drawn('adit');
    expect(off.opening).toBe('');
    expect(off.campaign.modules.map(m => m.id)).not.toContain('adit');
    expect(off.region).not.toContain('s1_adit_');
    expect(off.region).toContain(' at s1_green.');
    expect(off.origin).toContain('Initially Assert knows(party, held).');
    expect(on.campaign.modules.map(m => m.id).filter(id => id !== 'adit')).toEqual(off.campaign.modules.map(m => m.id));
    // With it: the region's text is the same but for the opening's lines and where the company begins.
    const own = (text: string) => text.split('\n').filter(l => !l.includes('s1_adit_') && !/^\s*Company party /.test(l));
    expect(own(on.region)).toEqual(own(off.region));
    expect(on.region).toContain(' at s1_adit_fall.');
    expect(on.region.split('\n').filter(l => l.includes('s1_adit_')).length).toBeGreaterThan(3);
  }, 120000);
  // A new life is begun in its country's opening by creation (Iscoed's adit; none in a country that keeps none);
  // asked "none", in none; a world drawn again takes only what it was drawn for, and a scripted life none unasked.
  it('is a new life\'s choice: the country\'s by default, none on asking', () => {
    const begin = { campaign: Creation.generated, seed: 'iscoed', party: [] };
    expect(StockOpenings.chosen('iscoed')).toBe('adit');
    expect(StockOpenings.chosen('a1')).toBeUndefined();
    expect(StockOpenings.chosen('iscoed', 'none')).toBeUndefined();
    expect(EngineStarts.at(begin)?.opening).toBe('adit');
    expect(EngineStarts.at({ ...begin, opening: 'none' })?.opening).toBeUndefined();
    expect(EngineStarts.at({ ...begin, seed: 'a1' })?.opening).toBeUndefined();
    expect(PlayTool.parse(['--world', 'iscoed', '--as', 'human/warrior/Wenna']).opening).toBeUndefined();
  });
});
