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
    const event = await s.leg(PlayerView.choices(s.campaign).find(c => name.test(c.choice.name))!.choice.id);
    return (event.voiced ?? []).map(v => v.text).join(' ');
  }
}

// A place seen as something until it is named (UNT-203): its look said for it in a label, but not inside another
// thing's own name, a clause that names it ("that the Imprimatur may burn as it judges" had been put to the parliament
// as "that a grey building with a lamp over its door may burn as it judges").
const seenAs = new OverlayBundleSource(NodeBundleSource.shared, {
  'sa/site.kyr': `Module sa "Seen" { Place field "Field" is wilderness.
    Entity imp_named: fact "The Imprimatur's name".
    Place yard "the yard" is room within field at 0, 0. Company party "You" of 1 at yard.
    Place imprimatur "the Imprimatur" is room within field at 1, 0 seen as "a grey building with a lamp over its door"
      until imp_named.
    Passage gate "the gate" is path between yard and imprimatur.
    Kind motion. Entity sa_burn: motion "that the Imprimatur may burn as it judges".
    Relation moved(motion).
    Action put_motion(actor: group, clause: motion, site: place) "Put to the Parliament {clause}" {
      Requires at(actor, site) and not moved(clause). On success { Assert moved(clause). } Result "It is put.". }
    Action stare(actor: group, site: place) "Stare at the Imprimatur" { Requires at(actor, site). Result "It stares back.". } }`,
  'sa/module.json': JSON.stringify({ version: 1, source: 'site.kyr', rules: ['world'], globals: ['party'],
    exports: { party: 'party' } }),
  'sa.campaign.json': JSON.stringify({ version: 1, name: 'sa', modules: [{ id: 'p', bundle: 'sa/module.json' }],
    party: [{ name: 'Ama', raceId: 'human', classId: 'warrior' }] }) });
describe('a place seen as something', () => {
  it('is said as it is seen in a label, and left whole inside another thing\'s own name', async () => {
    const s = await PlaySession.start(seenAs.resolve('sa.campaign.json'), 'sa', seenAs);
    const labels = PlayerView.choices(s.campaign).map(c => c.choice.name).filter(n => /Parliament|Stare/.test(n));
    expect(labels.sort()).toEqual(['Put to the Parliament that the Imprimatur may burn as it judges',
      'Stare at a grey building with a lamp over its door']);
  }, 60000);
});

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
