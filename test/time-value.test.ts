import { describe, expect, it } from 'bun:test';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { OverlayBundleSource } from '../src/campaign/overlay-bundle-source';
import { ModuleParser } from '../src/lang/module-parser';
import { ModuleWriter } from '../src/lang/module-writer';
import { Journey } from '../src/session/journey';

// The Imbar author's friction 8 (M19-96): `Time <measure>.` waited as many watches as the measure held, but `Time
// ferry(party) + 2.` did not parse. A command's Time is any value, worked out as it is begun; the other forms stand.
const site = `Module tv "Waiting" { Place hill "the Hill" is settlement.
  Place quay "the quay" is room within hill at 0, 0 outdoors. Company party "You" of 1 at quay.
  Measure ferry(group). Relation waited(group).
  Initially Set ferry(party) to 3.
  Action wait_ferry(actor: group, site: place) "Wait for the ferry" {
    Requires able(actor) and company(actor) and at(actor, site) and not waited(actor).
    Time ferry(actor) + 2.
    On success { Assert waited(actor). }
  }
  Action plain(actor: group) "Plain" { Requires waited(actor). Time 3. }
  Action brief(actor: group) "Brief" { Requires waited(actor). Time 2 minutes. }
  Action long(actor: group) "Long" { Requires waited(actor). Time 3 hours. }
  Action show(actor: group) "Show" { Requires waited(actor). Time until hour 19. }
  Action measured(actor: group) "Measured" { Requires waited(actor). Time ferry(actor). }
  Action grouped(actor: group) "Grouped" { Requires waited(actor). Time (ferry(actor) + 1) * 2. }
  Action rolled(actor: group) "Rolled" { Requires waited(actor). Time (1d1) + 1. }
  Observe quay_scene at quay when true "Wet stones and rope.".
  Goal false. }`;
describe('a command\'s time, worked out', () => {
  const module = ModuleParser.parse(site), act = (id: string) => module.actions.find(a => a.id === id)!;
  const ferry = { kind: 'call' as const, name: 'ferry', args: ['actor'] };
  it('is a sum, a product or a measure, and the fixed forms stand', () => {
    expect(act('wait_ferry').duration).toEqual({ kind: 'arith', op: '+', left: ferry, right: { kind: 'number', value: 2 } });
    expect(act('grouped').duration).toEqual({ kind: 'arith', op: '*', right: { kind: 'number', value: 2 },
      left: { kind: 'arith', op: '+', left: ferry, right: { kind: 'number', value: 1 } } });
    expect(act('measured').duration).toEqual(ferry);
    expect(act('rolled').duration).toMatchObject({ kind: 'arith', left: { kind: 'deem', expression: '1d1' } });
    expect([act('plain').time, act('brief').minutes, act('long').time, act('show').until])
      .toEqual([3, 2, 18, { hour: 19 }]);
    expect(['plain', 'brief', 'long', 'show'].map(id => act(id).duration)).toEqual([undefined, undefined, undefined, undefined]);
  });
  it('is written back as it reads', () => {
    const written = ModuleWriter.write(module);
    expect(written).toContain('Time (ferry(actor) + 2).');
    expect(ModuleParser.parse(written).actions.find(a => a.id === 'wait_ferry')!.duration)
      .toEqual(act('wait_ferry').duration);
  });
  it('passes as many watches as it comes to', async () => {
    const j = await start(site);
    const before = j.watch();
    await j.play('Wait for the ferry');
    expect(j.watch() - before).toBe(5);
  }, 60000);
  it('is refused, in a campaign, where it reads no measure', async () => {
    await expect(start(site.replace('Time ferry(actor) + 2.', 'Time tide(actor) + 2.')))
      .rejects.toThrow(/Unknown function or arity: tide\(actor\)/);
  }, 60000);
});
async function start(text: string): Promise<Journey> {
  const source = new OverlayBundleSource(NodeBundleSource.shared, { 'tv/site.kyr': text,
    'tv/module.json': JSON.stringify({ version: 1, source: 'site.kyr', rules: ['world'], globals: ['party'],
      exports: { party: 'party' } }),
    'tv.campaign.json': JSON.stringify({ version: 1, name: 'tv', modules: [{ id: 'p', bundle: 'tv/module.json' }],
      party: [{ name: 'Ama', raceId: 'human', classId: 'warrior' }] }) });
  return Journey.start(source.resolve('tv.campaign.json'), 'tv', { source });
}
