import { describe, expect, it } from 'bun:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { DrawnWorld } from '../src/world/drawn-world';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { ScreenModel } from '../src/ui/screen-model';
import { SceneModel } from '../src/ui/scene';
import { Attending } from '../src/ui/attention';
import { TalkStage } from '../web/reader/stage/talk-stage';

// A likeness marked for knowledge has a reply drawn so (the owner's player report, 12 November: a blue pip on a
// person, and no blue reply among what could be said): what would tell the company something is typed by what its
// action makes so, that the company knows a fact; the reply the glance found it in carries knowledge's mark, and one
// it did not is plain (E185: a salter with no pip had had every reply blue). test/signal-inside holds the chain.
describe('what someone would tell', () => {
  it('is typed by what it teaches, and drawn so among the replies', async () => {
    const s = await DrawnWorld.start('kahitude', { origin: 'debt', party: [{ name: 'Ralf', raceId: 'human',
      classId: 'warrior' }] }, NodeBundleSource.shared);
    const tuck = SceneModel.build(ScreenModel.build(s.campaign)).subjects.find(x => x.id === 'region__s1_merchant')!;
    const all = Attending.all(tuck.choices);
    const asks = all.filter(c => /^ask\(/.test(c.command ?? ''));
    expect(asks.length).toBeGreaterThan(0);
    expect(asks.every(c => c.teaches)).toBe(true);
    expect(all.find(c => /^buy_item\(/.test(c.command ?? ''))?.teaches).toBeUndefined();
    const draw = { index: new Map(), open: new Set(), app: { state: {}, numbered: new Map() } } as unknown as Parameters<typeof TalkStage.Reply>[0]['draw'];
    const marked = renderToStaticMarkup(createElement(TalkStage.Reply, { choice: asks[0]!, draw, aspects: ['knowledge'] }));
    expect(marked).toContain('data-aspects="knowledge"');
    expect(marked).toContain('var(--tone-blue)');
    expect(renderToStaticMarkup(createElement(TalkStage.Reply, { choice: asks[0]!, draw }))).not.toContain('prism-bar');
  }, 120000);
});
