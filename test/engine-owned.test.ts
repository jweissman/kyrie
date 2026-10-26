import { describe, expect, it } from 'bun:test';
import { PlaySession } from '../src/session/play-session';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { OverlayBundleSource } from '../src/campaign/overlay-bundle-source';
import { CampaignTick } from '../src/campaign/campaign-tick';
import { EngineOwned } from '../src/lang/engine-owned';
import { ModuleParser } from '../src/lang/module-parser';
import { World } from '../src/lang/world';

// No module may write what the engine keeps, by any construct (the architecture review's A8, from its probe
// state-write-guard: a Topic made it dark at eight in the morning and set the watch's die; a Rule set the hours
// until dark, and waiting for dark used the forged hours).
class Guard {
  static start(body: string) {
    const files: Record<string, string> = {
      'wg/site.kyr': `Module wg "Write guard" { Place field "Field" is wilderness.
        Place yard "the yard" is room within field at 0, 0. Company party "You" of 1 at yard. ${body} }`,
      'wg/module.json': JSON.stringify({ version: 1, source: 'site.kyr', rules: ['world'], globals: ['party'],
        exports: { party: 'party' } }),
      'wg.campaign.json': JSON.stringify({ version: 1, name: 'wg', modules: [{ id: 'p', bundle: 'wg/module.json' }],
        party: [{ name: 'Ama', raceId: 'human', classId: 'warrior' }] }) };
    const source = new OverlayBundleSource(NodeBundleSource.shared, files);
    return PlaySession.start(source.resolve('wg.campaign.json'), 'wg', source);
  }
}
describe('what the engine keeps', () => {
  it('is written by no Topic, Rule or Initially', async () => {
    await expect(Guard.start(`Person ann "Ann" at yard { Peaceable. }
      Topic night with ann "Ask Ann for the night" when true { Says "It is night now.". On discuss { Assert dark(). } }`))
      .rejects.toThrow();
    await expect(Guard.start('Relation sat(group). Rule early when not sat(party) { Assert sat(party). Set untilDark(clock) to 1. }'))
      .rejects.toThrow();
    await expect(Guard.start('Initially Set dice(clock) to 1.')).rejects.toThrow();
    // A module that writes only what is its own loads.
    await expect(Guard.start('Relation sat(group). Rule early when not sat(party) { Assert sat(party). }')).resolves.toBeTruthy();
  }, 120000);
  it('is all the clock writes', () => {
    const module = ModuleParser.parse('Module clock "Clock" { }');
    const world = new World({ ...module, relations: [{ name: 'dark', types: [], exclusive: false }],
      measures: EngineOwned.clock.filter(n => n !== 'dark').map(name => ({ name, types: ['entity'], exclusive: false })) });
    const written = CampaignTick.clock(world, { elapsed: 80, seed: 's', calendar: { year: 1300, month: 3, day: 2 } })
      .map(c => c.call.name);
    expect(written.filter(n => !EngineOwned.clock.includes(n))).toEqual([]);
  });
});
