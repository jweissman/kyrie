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
