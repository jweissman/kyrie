import { describe, expect, it } from 'bun:test';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { OverlayBundleSource } from '../src/campaign/overlay-bundle-source';
import { ModuleWriter } from '../src/lang/module-writer';
import { PlaySession } from '../src/session/play-session';

// A member's calling in a campaign of several modules (the Imbar adventure author's calling-portability audit, 6
// November): each module that reads the world's rules has its own calling entities (hall__calling_warrior,
// yard__calling_warrior), and a member had been given only the last installed, so a voice keyed on the calling spoke in
// one module and was silent in every other, and in every drawn world. A member is of their calling under each.
describe('a calling in a campaign of several modules', () => {
  it('is the member\'s under every module\'s own name for it', async () => {
    const voice = (who: string) => `  Relation heard_${who}(group).
  Rule ${who}_voice when memberOf(?m, party) and hasCalling(?m, calling_warrior) and not heard_${who}(party) {
    Assert heard_${who}(party). }`;
    const src = new OverlayBundleSource(NodeBundleSource.shared, {
      'copies/hall.kyr': `Module hall "The hall" {
  Place hall "the hall" is room. Company party "You" of 1 at hall.
${voice('hall')}
  Goal false.
}`,
      'copies/hall.json': JSON.stringify({ version: 1, source: 'hall.kyr', rules: ['world'], globals: ['party'],
        exports: { party: 'party' } }),
      'copies/yard.kyr': `Module yard "The yard" {
  Entity party: group "Your company".
${voice('yard')}
  Goal false.
}`,
      'copies/yard.json': JSON.stringify({ version: 1, source: 'yard.kyr', rules: ['world'], globals: ['party'],
        imports: ['party'], roles: { party: { type: 'group' } } }),
      'copies.campaign.json': JSON.stringify({ version: 1, name: 'copies', modules: [
        { id: 'hall', bundle: 'copies/hall.json' },
        { id: 'yard', bundle: 'copies/yard.json', imports: { party: 'hall.party' } }],
      party: [{ name: 'Ama', raceId: 'human', classId: 'warrior' }] }) });
    const s = await PlaySession.start(src.resolve('copies.campaign.json'), 'copies', src);
    await s.perform('wait');
    const w = s.campaign.world;
    expect(['hall', 'yard'].map(m => w.test(ModuleWriter.call(`${m}__heard_${m}`, 'party')))).toEqual([true, true]);
  }, 60000);
});
