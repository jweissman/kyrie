import { describe, expect, it } from 'bun:test';
import { PlaySession } from '../src/session/play-session';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { OverlayBundleSource } from '../src/campaign/overlay-bundle-source';
import { PlayerView } from '../src/presentation/player-view';
import { ScreenModel } from '../src/ui/screen-model';
import { ChoiceList } from '../src/ui/choice-list';

// Quittance's ll 10 (QTC-A21): a topic had been offered under "Talk to Hob" and again, once met, at the top level of
// the page. It is offered once, under the one it is said to, in the talk and out of it; asked from outside a talk, it
// is answered without beginning one, so there is no leave to take after it.
class Topics {
  static async start(): Promise<PlaySession> {
    const source = new OverlayBundleSource(NodeBundleSource.shared, {
      'to/site.kyr': `Module to "Topics" { Place field "Field" is wilderness.
        Place yard "the yard" is room within field at 0, 0. Company party "You" of 1 at yard.
        Person hob "Hob" at yard { Peaceable. Greets "'Evening,' says Hob.". }
        Topic pole with hob "Ask Hob what he is doing with that pole" when true { Says "'Lamps,' says Hob.". } }`,
      'to/module.json': JSON.stringify({ version: 1, source: 'site.kyr', rules: ['world'], globals: ['party'],
        exports: { party: 'party' } }),
      'to.campaign.json': JSON.stringify({ version: 1, name: 'to', modules: [{ id: 'p', bundle: 'to/module.json' }],
        party: [{ name: 'Ama', raceId: 'human', classId: 'warrior' }] }) });
    return PlaySession.start(source.resolve('to.campaign.json'), 'to', source);
  }
  // Where on the page the topic is offered: the title of each section that offers it.
  static offered(s: PlaySession): string[] {
    return ChoiceList.explore(ScreenModel.build(s.campaign)).flatMap(x => x.choices
      .filter(c => /what he is doing/.test(c.label)).map(() => x.title));
  }
  static async choose(s: PlaySession, name: RegExp) {
    return s.perform(PlayerView.choices(s.campaign).find(c => name.test(c.choice.name))!.choice.id);
  }
  static labels(s: PlaySession): string[] { return PlayerView.choices(s.campaign).map(c => c.choice.name); }
}

describe('a topic', () => {
  it('is offered once, under the one it is said to, in a talk and out of it', async () => {
    const s = await Topics.start();
    expect(Topics.offered(s)).toEqual(['Hob']);
    await Topics.choose(s, /^Talk to Hob/);
    await Topics.choose(s, /what he is doing/);
    expect(Topics.offered(s)).toEqual(['Hob']);
    await Topics.choose(s, /^Take your leave/);
    expect(Topics.offered(s)).toEqual(['Hob']);
    const outside = await Topics.choose(s, /what he is doing/);
    expect([outside.response, Topics.labels(s).some(l => /^Take your leave/.test(l))]).toEqual(["'Lamps,' says Hob.", false]);
  }, 60000);
});
