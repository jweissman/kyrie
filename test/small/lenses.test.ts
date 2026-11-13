import { describe, expect, it } from 'bun:test';
import { Tiny } from '../support/tiny';
import { PlayerView } from '../../src/presentation/player-view';
import { SceneModel } from '../../src/ui/scene';
import { Attending } from '../../src/ui/attention';
import type { Lens } from '../../src/presentation/glance-types';

// The attention lenses over the one resting scene (the owner, 14 November: CN-01, CN-05): things, people, places and
// time each give their promoted acts (at most four) and the rest in order, from the same acts the resting scene's four
// come from; choosing one is not a world act and takes no time; the time lens holds the waiting acts that exist. A
// taproom with an innkeeper who teaches, a notice, a door out, and the aim at the notice.
const inn = `
  Place town "Hythe" is settlement.
  Place taproom "the taproom" is room within town at 0, 0 indoors.
  Place lane "the lane" is room within town at 1, 0 outdoors.
  Passage door "the inn door" is door between taproom and lane.
  Company party "You" of 1 at taproom.
  Person keeper "Eamon" at taproom { Role "the innkeeper". Ancestry human. Peaceable. Pronouns he. }
  Entity country: fact "There is an old keep in the fen.".
  Topic ask_country with keeper "Ask Eamon what is out in the country round" when not knows(actor, country) {
    Says "'A keep, in the fen,' says Eamon.". On discuss { Assert knows(actor, country). } }
  Thing notice "the notice by the door" at taproom { State posted "A notice is pinned by the door.". State read "The notice is read.".
    Change read "Read the notice" from posted to read. }
  Objective work when not knows(party, country) "Ask Eamon what is out in the country round.".
  Goal false.`;
const lenses: Lens[] = ['things', 'people', 'places', 'time'];

describe('the attention lenses', () => {
  it('give each lens its acts from the scene\'s own, the promoted at most four, gold only on the aim\'s next step', async () => {
    const t = await Tiny.start(inn);
    t.follow('work');
    const g = t.glance, scene = Attending.place(SceneModel.build(t.screen));
    // The authoritative acts: every choice the scene draws (openers and what is in them), and every legal command.
    const ids = new Set([...scene.subjects.flatMap(x => Attending.all(x.choices)), ...Attending.all([...scene.near,
      ...scene.far, ...scene.you])].map(c => c.id));
    const commands = new Set(PlayerView.observe(t.campaign).choices.map(c => c.id));
    for (const lens of lenses) {
      const l = g.lenses[lens];
      expect(l.promoted.length).toBeLessThanOrEqual(4);
      for (const a of [...l.promoted, ...l.rest]) {
        expect([lens, ids.has(a.choice) || commands.has(a.command ?? '')]).toEqual([lens, true]);
      }
    }
    expect(g.lenses.people.promoted.map(a => a.subject)).toEqual(['t__keeper']);
    expect(g.lenses.things.promoted.concat(g.lenses.things.rest as never[]).map(a => a.subject)).toContain('t__notice');
    expect([...g.lenses.places.promoted, ...g.lenses.places.rest].map(a => a.label).join(' ')).toMatch(/lane/);
    // One gold in all, the glance's own.
    const gold = lenses.flatMap(l => g.lenses[l].promoted.filter(a => a.continues).map(a => a.choice));
    expect(gold).toEqual(g.acts.filter(a => a.continues).map(a => a.choice));
  });
  it('holds the waiting acts in the time lens, each by its own command', async () => {
    const t = await Tiny.start(inn);
    const lens = t.glance.lenses.time, time = [...lens.promoted, ...lens.rest].map(a => a.command);
    expect(time).toEqual(expect.arrayContaining(['wait', 'wait_hour']));
  });
  it('is chosen without a world act: no time passes and nothing is done', async () => {
    const t = await Tiny.start(inn);
    const before = { world: t.world, elapsed: t.campaign.readout.elapsed, done: t.campaign.history.length };
    for (const lens of lenses) { expect(t.look().glance.lenses[lens]).toBeDefined(); }
    expect({ world: t.world, elapsed: t.campaign.readout.elapsed, done: t.campaign.history.length }).toEqual(before);
  });
});

// A lens with acts of its kind promotes them, though none has a reason (the coordinator, 14 November: a kitchen's Wat,
// with a topic and no aim, had left the people lens empty, his talk only in the rest): those with a reason first, then
// the lens's own in its own order (talk first among people; the shorter waits first), never one that cannot be done.
const kitchen = `
  Place kitchen "the kitchen" is room at 0, 0 indoors.
  Place yard "the yard" is room at 1, 0 outdoors.
  Passage back "the back door" is door between kitchen and yard.
  Company party "You" of 1 at kitchen.
  Person wat "Wat" at kitchen { Role "your brother". Ancestry human. Peaceable. Pronouns he. }
  Topic weather with wat "Ask Wat about the weather" when true { Says "'Rain by noon,' says Wat.". }
  Goal false.`;
describe('a lens with nothing to lead it', () => {
  it('promotes its own acts in its own order', async () => {
    const t = await Tiny.start(kitchen), l = t.glance.lenses;
    expect(l.people.promoted.map(a => a.subject)).toEqual(['t__wat']);
    expect(l.people.rest.map(a => a.subject)).not.toContain('t__wat');
    expect(l.places.promoted.map(a => a.label).join(' ')).toMatch(/yard/);
    const waits = l.time.promoted.map(a => a.command);
    expect(waits.length).toBeGreaterThan(0);
    expect(waits[0]).toBe('wait');
  });
});
// The company's own acts are the time lens's, after the waits (the coordinator's ruling, 14 November: lighting a
// candle, preparing a spell, tending a hurt had been in no lens, only on the old Wait page), each the company's own. A
// cellar with no light in it, where lighting one is among them.
const cellar = `
  Place cellar "the cellar" is room at 0, 0 underground 1 down.
  Company party "You" of 1 at cellar.
  Initially Assert unlit(cellar).
  Goal false.`;
describe('the time lens', () => {
  it('holds the company\'s own acts, the light first in the dark, the waits before the rest of them', async () => {
    const t = await Tiny.start(cellar), time = t.glance.lenses.time, all = [...time.promoted, ...time.rest];
    expect(time.promoted[0]!.command).toMatch(/^light_item\(/);
    // The company's own acts are its own; the waits are no one's ("Until dark" had been 'yourself' in the rest).
    expect(all.filter(a => /^light_item/.test(a.command ?? '')).every(a => a.subject === 'yourself')).toBe(true);
    expect(all.filter(a => /^wait/.test(a.command ?? '')).map(a => a.subject)).toEqual(
      all.filter(a => /^wait/.test(a.command ?? '')).map(() => undefined));
    const rest = time.rest.map(a => /^wait/.test(a.command ?? '') ? 'wait' : 'own');
    expect(rest.lastIndexOf('wait')).toBeLessThan(rest.includes('own') ? rest.indexOf('own') : Infinity);
    expect(all.map(a => a.command)).toEqual(expect.arrayContaining(['wait', 'light_item(t__party_1__candle)']));
  });
});
// What is done at a thing on a way (a portcullis, a tripwire, a riddle door's words), not going by it, is the things
// lens's, the thing its subject (round 13's lens gap: in no lens, the aesthetic line's AtHand.onWays a stopgap); and an
// opener's acts are reachable from the lens (Lensed.leaves). A gate-passage with a portcullis across the inner arch,
// and a chest whose lid can be lifted.
const passage = `
  Place gate "the gate-passage" is room at 0, 0 indoors.
  Place court "the court" is room at 1, 0 outdoors.
  Passage arch "the inner arch" is door between gate and court.
  Company party "You" of 1 at gate.
  Thing portcullis "the portcullis" on arch { State down blocking "A portcullis is down across the inner arch.".
    State up "The portcullis is wedged up.". Change heave "Heave the portcullis up and wedge it" from down to up. }
  Thing chest "a chest" at gate { State shut "A chest stands against the wall.". State open "The chest is open.".
    Change open "Lift the chest's lid" from shut to open. Change kick "Kick the chest" from shut to shut. }
  Goal false.`;
describe('the things lens', () => {
  it('holds what is done at a thing on a way, the thing its subject', async () => {
    const t = await Tiny.start(passage), things = t.glance.lenses.things;
    const heave = [...things.promoted, ...things.rest].find(a => /heave/.test(a.command ?? ''));
    expect(heave?.subject).toBe('t__portcullis');
  });
  it('reaches every act within an opener by the lens', async () => {
    const t = await Tiny.start(passage), things = t.glance.lenses.things;
    const chest = [...things.promoted, ...things.rest].find(a => a.subject === 't__chest')!;
    expect(things.leaves?.[chest.choice]?.map(a => a.command)).toEqual(expect.arrayContaining(['change_thing(t__chest_open)',
      'change_thing(t__chest_kick)']));
  });
});

// A thing on a way the scene draws no one for is named, and what is seen of it said, by the lens (the aesthetic line's
// riddle-door probe: the stone was in none of the page's lists, and its riddle, the blocking state's words, in no
// field of the lens); its promoted acts can say whom they are at by the same field.
const riddle = `
  Place lane "the lane" is room at 0, 0 outdoors.
  Place hall "the hall" is room at 1, 0 indoors.
  Passage way_in "the way in" is path between lane and hall.
  Company party "You" of 1 at lane.
  Relation speaking(thing).
  Initially Assert speaking(stone).
  Thing stone "the speaking door" on way_in {
    State sealed blocking "A door of one grey stone fills the way in. Cut across it: 'What has keys but cannot open locks?'".
    State open "The stone door stands open.".
  }
  Action word(actor: group, door: thing) "Press the word Piano" {
    Requires able(actor) and at(actor, lane) and speaking(door) and state(door, sealed).
    On success { Retract state(door, sealed). Assert state(door, open). }
  }
  Goal false.`;
describe('a lens\'s subjects the scene does not draw', () => {
  it('names the speaking door and says its riddle', async () => {
    const t = await Tiny.start(riddle), things = t.glance.lenses.things;
    const word = [...things.promoted, ...things.rest].find(a => /Piano/.test(a.label))!;
    expect(word.subject).toBe('t__stone');
    expect(things.subjects?.t__stone?.name).toBe('the speaking door');
    expect(things.subjects?.t__stone?.seen?.join(' ')).toMatch(/What has keys/);
    // Every act at it is about it, the look from the way too.
    expect(things.promoted.filter(a => /speaking door|Piano/.test(a.label)).every(a => a.subject === 't__stone')).toBe(true);
  });
});
// An opener among the company's own acts stays one act, its acts in the leaves (Dori's spells to prepare had come
// through as their bare names); and an act of no one here that is not time is among things (a look at Wren's ferry had
// been led first in time at Reedwake quay).
describe('the time lens\'s openers and its bounds', () => {
  it('keeps the march\'s Dori: prepare as one act with its spells inside', async () => {
    const { PlaySession } = await import('../../src/session/play-session');
    const { NodeBundleSource } = await import('../../src/campaign/node-bundle-source');
    const { Narrator } = await import('../../src/presentation/narrator');
    const { ScreenModel } = await import('../../src/ui/screen-model');
    const s = await PlaySession.start('test/fixtures/march/serewater-march.campaign.json', 'march',
      NodeBundleSource.shared);
    const g = Narrator.leaf(s.campaign, ScreenModel.build(s.campaign)).glance!, time = g.lenses.time;
    const prepare = [...time.promoted, ...time.rest].find(a => /prepare/i.test(a.label))!;
    expect(prepare.subject).toBe('yourself');
    expect((time.leaves?.[prepare.choice] ?? []).length).toBeGreaterThan(0);
    expect([...time.promoted, ...time.rest].some(a => /^(Anoint|Cure Light Wounds)$/.test(a.label))).toBe(false);
  }, 60000);
  it('puts a look at something of no one here among things, never time', async () => {
    const { Promotion } = await import('../../src/ui/promotion');
    const look = { choice: 'look:ferry', label: 'Look at Wren\'s ferry', command: 'look_closely(ferry)',
      kind: 'other' as const, whys: ['own' as const], order: 0, marks: [] };
    const scene = { subjects: [], near: [], far: [], you: [] };
    const calm = { threat: false, warned: false, dark: false, settled: true, open: false };
    const l = Promotion.lenses([look], scene, calm, []);
    expect([l.things.promoted.map(a => a.choice), l.time.promoted.map(a => a.choice)]).toEqual([['look:ferry'], []]);
  });
});
