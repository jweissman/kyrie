import { describe, expect, it } from 'bun:test';
import { NodeBundleSource } from '../../src/campaign/node-bundle-source';
import { OverlayBundleSource } from '../../src/campaign/overlay-bundle-source';
import { PlaySession } from '../../src/session/play-session';
import { Journey } from '../../src/session/journey';
import { ModuleWriter } from '../../src/lang/module-writer';
import { WorldAssembler, type Placement } from '../../src/world/world-assembler';
import { PlayerFrame } from '../../src/presentation/player-frame';
import hall from '../../data/scenarios/brynach-hall.scenario.json';
import drove from '../../data/scenarios/iscoed-drove.scenario.json';

// Bran's road west, carried between countries (register ST-11): freed, Bran says to come up the pass to the drovers'
// hall at Caer Brynach and say he sent you, and the road had led past the march to no aim, while the hall's keeper
// let anyone at all say that Bran sent them. A scenario's module.export reads only its own country; ^module.export
// reads a module of the world's first country, so the hall, drawn beyond the march, hears what the drove taught at
// Porthalen (road_west), and only a company that has it can say Bran sent it. A stand-in first country, the hall's
// own module over it, bound as the assembler binds it.
const beyond: Placement = { scenario: 'brynach-hall', instance: 'brynach-hall', bindings: { town: 's1' }, generated: [],
  modules: ['xm1y0hall'], carriers: {}, rid: 'xm1y0' };
const first = `Module drove "Porthalen" {
  Place town "the market at the pass" is settlement.
  Place green "the market" is room within town at 5, 5.
  Entity road_west: fact "The drove road goes west up the pass to Caer Brynach.".
  Company party "You" of 1 at green.
  Goal false.
}`;
const start = async (sent: boolean) => {
  const imports = Object.fromEntries(Object.entries(hall.modules[0]!.imports)
    .map(([k, v]) => [k, v.startsWith('@') ? `drove.${k}` : WorldAssembler.ref(v, beyond)]));
  const source = new OverlayBundleSource(NodeBundleSource.shared, {
    'bran-sent/drove/site.kyr': first,
    'bran-sent/drove/module.json': JSON.stringify({ version: 1, source: 'site.kyr', rules: ['world'], globals: ['party'],
      exports: { party: 'party', town: 'town', green: 'green', road_west: 'road_west' } }),
    'bran-sent/c.campaign.json': JSON.stringify({ version: 1, name: 'Bran sent you', modules: [
      { id: 'drove', bundle: 'drove/module.json' },
      { id: 'hall', bundle: '../data/goings-on/brynach-hall/module.json', imports: { ...imports, party: 'drove.party' } }],
    party: [{ name: 'Wenna', raceId: 'human', classId: 'warrior' }] }) });
  const s = await PlaySession.start(source.resolve('bran-sent/c.campaign.json'), 'bran', source), c = s.campaign;
  if (sent) { c.commitWorld(c.world.apply([{ kind: 'assert', call: ModuleWriter.call('knows', 'party', 'drove__road_west') }])); }
  const j = Journey.of(s, true);
  await j.play('To the drovers\' hall');
  return PlayerFrame.of(c).rows.map(r => r.choice.name);
};
describe('Bran\'s word at the drovers\' hall', () => {
  it('is read from the first country by the hall beyond the march', () => {
    expect(WorldAssembler.ref('^drove.road_west', beyond)).toBe('drove.road_west');
    expect(hall.modules[0]!.imports.sent).toBe('^drove.road_west');
    expect(drove.modules[0]!.imports.west).toBe('@region.edge_west');
    expect(WorldAssembler.ref('@region.edge_west', { ...beyond, rid: 'region' })).toBe('region.edge_west');
  });
  it('is said to Marged by a company Bran sent, and by no other', async () => {
    expect(await start(true)).toContain('Tell Marged that Bran ap Ifor sent you');
    expect(await start(false)).not.toContain('Tell Marged that Bran ap Ifor sent you');
  });
});
