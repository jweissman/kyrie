import { describe, expect, it } from 'bun:test';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { OverlayBundleSource } from '../src/campaign/overlay-bundle-source';
import { LocalObservations } from '../src/campaign/local-observations';
import { PlaySession } from '../src/session/play-session';
import { Journey } from '../src/session/journey';

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
  // Behind the Wainscot's F5 (BTW-06): a toll whose sign says DOWN, FREE had to be two one-way ladders.
  it('bars a way from the end it stands at, and not from the other', async () => {
    const j = await Journey.start('test/fixtures/probes/toll-up/probe.campaign.json');
    await j.play('^To the foot of the ladder$');
    expect(j.at('party')).toBe('p__foot');
    expect(j.choices().map(c => c.label)).not.toContain('To the top of the wainscot');
    await j.play('Pay Ma Riser a crumb', '^To the top of the wainscot$');
    expect(j.at('party')).toBe('p__top');
  }, 60000);
  // The Book of Faces' BOF-12: a way that opens only by night (`opening when`) shuts at both ends, and the Assessor's
  // kitchen, its door shut by day, shut in a company that was inside at half past eight. A door that shuts against
  // the street only is a thing on the way from the street's end, barring it by day: the company inside walks out.
  it('shuts against one end only, by day, and lets out whoever is inside', async () => {
    const source = new OverlayBundleSource(NodeBundleSource.shared, {
      'ke/site.kyr': `Module ke "The kitchen" { Place row "Counting Row" is settlement.
        Place street "the street" is room within row at 0, 0 outdoors. Place kitchen "the night kitchen" is room within row at 1, 0.
        Passage kitchen_door "the kitchen door" is door between street and kitchen. Company party "You" of 1 at kitchen.
        Thing bolt "the kitchen door's bolt" on kitchen_door from street {
          State drawn blocking "The kitchen door is bolted from inside: the Assessor bakes by night.". State back "The door is on the latch.". }
        Rule bolted when not dark() and state(bolt, back) { Assert state(bolt, drawn). }
        Rule unbolted when dark() and state(bolt, drawn) { Assert state(bolt, back). } }`,
      'ke/module.json': JSON.stringify({ version: 1, source: 'site.kyr', rules: ['world'], globals: ['party'],
        exports: { party: 'party' } }),
      'ke.campaign.json': JSON.stringify({ version: 1, name: 'ke', modules: [{ id: 'p', bundle: 'ke/module.json' }],
        party: [{ name: 'Ama', raceId: 'human', classId: 'warrior' }] }) });
    const j = await Journey.start(source.resolve('ke.campaign.json'), 'ke', { source });
    await j.play('^To the street$');
    expect(j.at('party')).toBe('p__street');
    expect(j.choices().map(c => c.label)).not.toContain('To the night kitchen');
    await j.play('Until dark');
    expect(j.choices().map(c => c.label)).toContain('To the night kitchen');
  }, 60000);
});
