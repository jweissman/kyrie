import { describe, expect, it } from 'bun:test';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { OverlayBundleSource } from '../src/campaign/overlay-bundle-source';
import { LocalObservations } from '../src/campaign/local-observations';
import { PlaySession } from '../src/session/play-session';

// A thing on a way, or a line beside it, told only at the end it is seen from (the Grand Tour's friction 8, the Third
// Night's 18, Behind the Wainscot's F5: a guard's line, and the deep step on the ford, told on both banks).
describe('one end of a way', () => {
  it('tells what is on the way, and beside it, only to a company at that end', async () => {
    const source = new OverlayBundleSource(NodeBundleSource.shared, {
      'we/site.kyr': `Module we "Ends" { Place field "Field" is wilderness.
        Place bank "the near bank" is room within field at 0, 0. Place far "the far bank" is room within field at 1, 0.
        Passage ford "the ford" is ford between bank and far. Company party "You" of 1 at bank.
        Thing step "the deep step" on ford from far { State there "A deep step drops away under the water on this side.". }
        Observe sign beside ford from bank when true "A post by the water says FORD.". }`,
      'we/module.json': JSON.stringify({ version: 1, source: 'site.kyr', rules: ['world'], globals: ['party'],
        exports: { party: 'party' } }),
      'we.campaign.json': JSON.stringify({ version: 1, name: 'we', modules: [{ id: 'p', bundle: 'we/module.json' }],
        party: [{ name: 'Ama', raceId: 'human', classId: 'warrior' }] }) });
    const s = await PlaySession.start(source.resolve('we.campaign.json'), 'we', source);
    const told = () => LocalObservations.read(s.campaign.world, s.campaign.playerActor!).map(o => o.text).join(' ');
    expect(told()).toContain('FORD');
    expect(told()).not.toContain('deep step');
    await s.perform('go(p__ford,p__far)');
    expect(told()).toContain('deep step');
    expect(told()).not.toContain('FORD');
  }, 60000);
});
