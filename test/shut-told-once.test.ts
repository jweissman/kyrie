import { describe, expect, it } from 'bun:test';
import { PlaySession } from '../src/session/play-session';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { OverlayBundleSource } from '../src/campaign/overlay-bundle-source';
import { PlayerView } from '../src/presentation/player-view';
import { ActionFeedbackView } from '../src/presentation/action-feedback';
import { Narrator } from '../src/presentation/narrator';
import { ScreenModel } from '../src/ui/screen-model';

// Why a way is shut is told the first time the company sees it shut; after that, the way itself says it (A Winter in
// Carth's friction 12: "The gaol door is shut. The Consistory's gaol admits visitors between ten and four" was told
// each time the company came into the Close).
class Shut {
  static readonly words = 'The gaol door is shut. Visitors between ten and four.';
  static async start() {
    const source = new OverlayBundleSource(NodeBundleSource.shared, {
      'st/site.kyr': `Module st "Shut" { Place field "Field" is wilderness.
        Place yard "the yard" is room within field at 0, 0. Place close "the Close" is room within field at 1, 0.
        Place gaol "the gaol" is room within field at 2, 0.
        Passage gate "the Close gate" is door between yard and close.
        Passage gaol_door "the gaol door" is door between close and gaol opening when false ${JSON.stringify(Shut.words)}.
        Company party "You" of 1 at yard. }`,
      'st/module.json': JSON.stringify({ version: 1, source: 'site.kyr', rules: ['world'], globals: ['party'],
        exports: { party: 'party' } }),
      'st.campaign.json': JSON.stringify({ version: 1, name: 'st', modules: [{ id: 'p', bundle: 'st/module.json' }],
        party: [{ name: 'Ama', raceId: 'human', classId: 'warrior' }] }) });
    return PlaySession.start(source.resolve('st.campaign.json'), 'st', source);
  }
  // Goes through the gate, and answers with what the page says of the place it comes to.
  static async through(s: PlaySession, to: string): Promise<string[]> {
    const c = s.campaign, before = PlayerView.observe(c);
    const go = PlayerView.choices(c).find(x => x.choice.id.startsWith('go(p__gate') && x.choice.id.endsWith(`${to})`))!;
    const event = await s.perform(go.choice.id), feedback = ActionFeedbackView.read(c, event, before);
    return Narrator.leaf(c, ScreenModel.build(c), { event, feedback, said: go.choice.name, moved: true }).situation;
  }
}

describe('a way shut', () => {
  it('says why the first time it is seen shut, and after that only as the way', async () => {
    const s = await Shut.start();
    expect((await Shut.through(s, 'p__close')).join(' ')).toContain(Shut.words);
    await Shut.through(s, 'p__yard');
    expect((await Shut.through(s, 'p__close')).join(' ')).not.toContain(Shut.words);
    expect(JSON.stringify(ScreenModel.build(s.campaign).exits)).toContain('Visitors between ten and four');
  }, 60000);
});
