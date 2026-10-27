import { describe, expect, it } from 'bun:test';
import { PlaySession } from '../src/session/play-session';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { OverlayBundleSource } from '../src/campaign/overlay-bundle-source';
import { PlayerView } from '../src/presentation/player-view';
import { ScreenModel } from '../src/ui/screen-model';
import { ChoiceList } from '../src/ui/choice-list';
import { Travel } from '../src/session/travel';

// What the play-structure investigation of 6596e18 found in ordinary play, held here: a way that goes one way only
// says so, and a journey does not take it unasked (PT-17); a journey goes on past those who let the company by
// (PT-16); a risk that fails says who fell, and to what (PT-21); and a mage in the dark can cast the light they
// have (PT-06).
class Played {
  static readonly two = [{ name: 'Ama', raceId: 'human', classId: 'warrior' },
    { name: 'Bo', raceId: 'human', classId: 'warrior' }];
  static start(body: string, party: object[] = this.two) {
    const source = new OverlayBundleSource(NodeBundleSource.shared, {
      'ps/site.kyr': `Module ps "Played" { Place field "the field" is wilderness. ${body} Goal false. }`,
      'ps/module.json': JSON.stringify({ version: 1, source: 'site.kyr', rules: ['world'], globals: ['party'],
        exports: { party: 'party' } }),
      'ps.campaign.json': JSON.stringify({ version: 1, name: 'ps', modules: [{ id: 'p', bundle: 'ps/module.json' }],
        party }) });
    return PlaySession.start(source.resolve('ps.campaign.json'), 'ps', source);
  }
  static place(s: PlaySession, name: string) { return s.campaign.module.entities.find(e => e.name === name)!.id; }
  // Walks the ways named, one after another, so that the company knows them.
  static async walk(s: PlaySession, ...ways: string[]) {
    for (const way of ways) {
      const id = this.place(s, way);
      await s.perform(PlayerView.choices(s.campaign).find(c => c.choice.id.startsWith(`go(${id},`))!.choice.id);
    }
  }
  static go(s: PlaySession, to: string) {
    return Travel.go({ campaign: s.campaign, perform: command => s.perform(command) }, this.place(s, to));
  }
}

describe('a way that goes one way only', () => {
  const body = `Place start "the gallery" is room within field at 0, 0 outdoors.
    Place top "the top of the pipe" is room within field at 1, 0 outdoors.
    Place bottom "the bottom of the pipe" is room within field at 2, 0 outdoors.
    Passage stair "the stair" is path between start and top.
    Passage pipe "the great pipe" is path between top and bottom one way.
    Company party "You" of 2 at start.`;
  it('says so by its own name, and asks again before it is taken', async () => {
    const s = await Played.start(body);
    await Played.walk(s, 'the stair');
    const down = ChoiceList.all(ChoiceList.explore(ScreenModel.build(s.campaign)))
      .find(c => c.command?.startsWith('go(') && c.command.includes('pipe'))!;
    expect(down.label).toContain('by the great pipe');
    expect(down.grave).toBe('There is no coming back this way.');
  }, 60000);
  it('is not taken by a journey: the journey stops before it', async () => {
    const s = await Played.start(body);
    await Played.walk(s, 'the stair', 'the stair');
    const done = await Played.go(s, 'the bottom of the pipe');
    expect([done.arrived, done.stopped, done.legs.length]).toEqual([false, 'There is no coming back by the great pipe', 1]);
  }, 60000);
});

describe('a journey', () => {
  // Hobs parleyed with stopped every journey past them, as danger.
  it('goes on past those who let the company by', async () => {
    const s = await Played.start(`Place a "the first room" is room within field at 0, 0 outdoors.
      Place mid "the middle room" is room within field at 1, 0 outdoors.
      Place c "the far room" is room within field at 2, 0 outdoors.
      Passage ab "the first track" is path between a and mid.
      Passage bc "the second track" is path between mid and c.
      Company party "You" of 2 at a.
      Person hobs "the hobs" at mid { Role "hobs at their ease". Ancestry goblin. Calling thief. Level 1. Numbers 2. }
      Initially Assert tolerates(hobs, party).`);
    await Played.walk(s, 'the first track', 'the second track', 'the second track', 'the first track');
    const done = await Played.go(s, 'the far room');
    expect([done.arrived, done.stopped, done.legs.length]).toEqual([true, undefined, 2]);
  }, 60000);
});

describe('a risk that fails', () => {
  it('says who fell, to what, and what follows', async () => {
    const s = await Played.start(`Place near "the near bank" is room within field at 0, 0 outdoors.
      Place far "the far bank" is room within field at 1, 0 outdoors.
      Passage ford "the ford" is path between near and far.
      Company party "You" of 2 at near.
      Hazard torrent "the torrent" means "Deal (100) bludgeoning damage to ally.".
      Thing water "deep water" on ford {
        State high dangerous "The river runs high over the ford.".
        State fallen "The river has fallen.".
        Hurts with torrent when high then fallen.
      }`);
    const risk = PlayerView.choices(s.campaign).find(c => /^Risk deep water.*; Ama goes first/.test(c.choice.name))!;
    const done = await s.perform(risk.choice.id);
    expect(done.response).toContain('The torrent brings Ama down, and the company does not cross.');
    expect(done.response).not.toContain('exposed adventurer');
  }, 60000);
});

describe('in the dark', () => {
  it('a mage can cast the light they have prepared, where the dark is', async () => {
    const s = await Played.start(`Place cellar "the cellar" is room within field at 0, 0 underground.
      Company party "You" of 1 at cellar. Initially Assert unlit(cellar).`,
      [{ name: 'Osric', raceId: 'human', classId: 'mage' }]);
    const screen = ScreenModel.build(s.campaign);
    expect(screen.dark).toBe(true);
    const cast = ChoiceList.all(ChoiceList.explore(screen)).find(c => c.label === 'Osric: cast Light')!;
    expect(cast.command).toMatch(/^field_spell\(.*conjure_light/);
    await s.perform(cast.command!);
    expect(ScreenModel.build(s.campaign).dark).toBe(false);
  }, 60000);
});
