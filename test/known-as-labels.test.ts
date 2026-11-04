import { describe, expect, it } from 'bun:test';
import { PlaySession } from '../src/session/play-session';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { OverlayBundleSource } from '../src/campaign/overlay-bundle-source';
import { PlayerView } from '../src/presentation/player-view';
import { ScreenModel } from '../src/ui/screen-model';
import { SceneModel } from '../src/ui/scene';

// Someone known as something until their name is learned is called that everywhere the page names them: in "Talk
// to …", in an author's own labels, in a {who} in their words (the Book of Faces' BOF-01, BOF-35: in a book about
// masks, every label had printed the real name, and "{tibb}" had been said as an id). Once the name is learned, the
// name; and a Known as with a comma in it is one name, not a name and a role (BOF-02).
class Masked {
  static async start(known = 'an old man by the stove') {
    const source = new OverlayBundleSource(NodeBundleSource.shared, {
      'kn/site.kyr': `Module kn "Known" { Place field "Field" is wilderness.
        Place yard "the yard" is room within field at 0, 0. Company party "You" of 1 at yard.
        Entity tibb_named: fact "Tibb's name".
        Person tibb "Tibb" at yard { Peaceable. Known as "${known}" when not knows(party, tibb_named).
          Greets "'Evening,' says {tibb}.". }
        Topic tibb_name with tibb "Ask {tibb} his name" when not knows(actor, tibb_named) {
          Says "'Tibb,' says {tibb}.". On discuss { Assert knows(actor, tibb_named). } }
        Action poke(actor: group, site: place) "Nudge {tibb}" { Requires at(actor, site). Result "{tibb} grunts.". } }`,
      'kn/module.json': JSON.stringify({ version: 1, source: 'site.kyr', rules: ['world'], globals: ['party'],
        exports: { party: 'party' } }),
      'kn.campaign.json': JSON.stringify({ version: 1, name: 'kn', modules: [{ id: 'p', bundle: 'kn/module.json' }],
        party: [{ name: 'Ama', raceId: 'human', classId: 'warrior' }] }) });
    return PlaySession.start(source.resolve('kn.campaign.json'), 'kn', source);
  }
  static labels(s: PlaySession): string[] {
    return PlayerView.choices(s.campaign).map(c => c.choice.name).filter(n => /Tibb|old man|stove/.test(n));
  }
  static async choose(s: PlaySession, name: RegExp): Promise<string> {
    const event = await s.perform(PlayerView.choices(s.campaign).find(c => name.test(c.choice.name))!.choice.id);
    return (event.voiced ?? []).map(v => v.text).join(' ');
  }
}

describe('someone known as something', () => {
  it('is called that in every label and in their own words, until their name is learned', async () => {
    const s = await Masked.start();
    expect(Masked.labels(s)).toEqual(['Talk to an old man by the stove', 'Ask an old man by the stove his name',
      'Nudge an old man by the stove']);
    expect(await Masked.choose(s, /^Talk to/)).toContain("'Evening,' says an old man by the stove.");
    await Masked.choose(s, /his name$/);
    expect(Masked.labels(s)).toContain('Nudge Tibb');
    expect(ScreenModel.build(s.campaign).people.map(p => p.name)).toContain('Tibb');
  }, 60000);
  it('is one name with a comma in it', async () => {
    const s = await Masked.start('a woman in a grey half-mask, plaster to the elbows');
    const screen = ScreenModel.build(s.campaign), whole = 'a woman in a grey half-mask,\u00a0plaster to the elbows';
    expect(screen.people.map(p => p.name)).toEqual([whole]);
    expect(SceneModel.build(screen).subjects.map(x => [x.name, x.note ?? ''])).toEqual([[whole, '']]);
  }, 60000);
});
