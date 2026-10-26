import { describe, expect, it } from 'bun:test';
import { PlaySession } from '../src/session/play-session';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { OverlayBundleSource } from '../src/campaign/overlay-bundle-source';
import { PlayerView } from '../src/presentation/player-view';
import { Endings } from '../src/lang/endings';

// Text with variables in it says what its condition bound (the architecture review's A17, from its probe
// lang-compiler-gaps): "Ann counts 0 coins" was said when she had 7; an ending's closing page printed "?g leaves
// rich"; and an observation that spoke of a variable nothing bound printed "?who".
class Text {
  static start(body: string) {
    const files: Record<string, string> = {
      'tv/site.kyr': `Module tv "Text" { Place field "Field" is wilderness.
        Place yard "the yard" is room within field at 0, 0. Company party "You" of 1 at yard. ${body} }`,
      'tv/module.json': JSON.stringify({ version: 1, source: 'site.kyr', rules: ['world'], globals: ['party'],
        exports: { party: 'party' } }),
      'tv.campaign.json': JSON.stringify({ version: 1, name: 'tv', modules: [{ id: 'p', bundle: 'tv/module.json' }],
        party: [{ name: 'Ama', raceId: 'human', classId: 'warrior' }] }) };
    const source = new OverlayBundleSource(NodeBundleSource.shared, files);
    return PlaySession.start(source.resolve('tv.campaign.json'), 'tv', source);
  }
}
describe('text with variables', () => {
  it('says what was bound, in a rule and on an ending\'s page', async () => {
    const s = await Text.start(`Person ann "Ann" at yard { Peaceable. }
      Measure purse(group). Relation rich(group). Relation told(group).
      Initially Set purse(ann) to 7.
      Rule counts when at(?g, yard) and purse(?g) > 5 and not told(?g) says "{?g} counts {purse(?g)} coins." { Assert told(?g). }
      Ending wealth "Wealth" when rich(?g) "{?g} leaves rich.".
      Action enrich(actor: group) "Make Ann rich" { Requires company(actor). Time 1. On success { Assert rich(ann). } }`);
    const first = await s.perform('wait');
    expect((first.perceptions ?? []).map(p => p.text)).toContain('Ann counts 7 coins.');
    await s.perform(PlayerView.choices(s.campaign).find(c => c.choice.name === 'Make Ann rich')!.choice.id);
    expect(Endings.reached(s.campaign.world, [])?.lines).toEqual(['Ann leaves rich.']);
  }, 60000);
  it('is refused where it speaks of what nothing binds', async () => {
    await expect(Text.start('Observe waiting at yard when true "{?who} waits here.".')).rejects.toThrow('does not bind');
  }, 60000);
});
