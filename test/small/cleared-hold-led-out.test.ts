import { describe, expect, it } from 'bun:test';
import { Tiny } from '../support/tiny';
import { ModuleWriter } from '../../src/lang/module-writer';

// A hold cleared from within is led out of by the four, never shut in (BL-03, the second blind playtest: after the
// Gaffer's fight the way out was barred by the gate hobs, and "Up to the cave mouth" was only under Go…, "a player who
// never opens Go is shut in a cleared cave"). Played in kite's hobs' hold (the guest's way in, the pit, the raiders,
// the Gaffer): from the cavern the page leads into the side-cave not yet entered (gone into before it is left: the
// owner, 4 November), and from there back out, up to the cave mouth, where the gate hobs' fight is led. The same
// hold in miniature: come in as a guest past the gate, up to the ledge and down again, and the hobs turned on it.
const hold = `
  Place fell "the fell" is wilderness.
  Place moor "the open moor" is room within fell at 0, 0 outdoors.
  Place hold "the hobs' hold" is site within fell at 1, 0.
  Place mouth "the cave mouth" is room within hold at 0, 0 underground.
  Place cavern "the smoky cavern" is room within hold at 1, 0 underground.
  Place ledge "the high ledge" is room within hold at 2, 0 underground.
  Place cache "a dry side-cave" is room within hold at 1, 1 underground.
  Passage brambles "the brambles across the cave mouth" is path between moor and mouth.
  Passage throat "the throat of the cave" is path between mouth and cavern.
  Passage log "a notched log" is path between cavern and ledge.
  Passage crawl "a crawl into the side-cave" is path between cavern and cache.
  Company party "You" of 1 at mouth.
  Person watchers "the hobs on the gate" at mouth {
    Role "two hobs who keep the gate". Species goblin. Numbers 2. Level 1. Temperament territorial. Lair mouth.
    State watching blocking "Two hobs squat just inside the brambles, watching who comes.".
  }
  Initially Assert guards(watchers, brambles). Initially Assert state(watchers, watching).
  Initially Assert tolerates(watchers, party).
  Initially Assert unlit(mouth). Initially Assert unlit(cavern). Initially Assert unlit(ledge). Initially Assert unlit(cache).
  Goal false.`;

describe('a hold cleared from within', () => {
  it('is led out of by the four, to the gate and its keepers, within the rooms left to see', async () => {
    const t = await Tiny.start(hold, { party: [{ name: 'Thora', raceId: 'dwarf', classId: 'warrior' }] });
    await t.perform('light_item(t__party_1__torch)');
    for (const way of ['go(t__throat,t__cavern)', 'go(t__log,t__ledge)', 'go(t__log,t__cavern)']) { await t.perform(way); }
    // The truce over ("THIEVES!"): the hobs on the gate will not let the company by.
    const held = t.campaign as unknown as { world: { apply(c: unknown[]): unknown }; commit(w: unknown): void };
    held.commit(held.world.apply([{ kind: 'retract', call: ModuleWriter.call('tolerates', 't__watchers', 'party') }]));
    t.look();
    const walked: string[] = [];
    for (let step = 0; step < 6 && t.where() !== 't__mouth'; step++) {
      const way = t.glance.acts.find(a => a.command?.startsWith('go('));
      expect([t.where(), way?.label]).toEqual([t.where(), expect.any(String)]);
      walked.push(way!.label);
      await t.perform(way!.command!);
    }
    expect([t.where(), walked]).toEqual(['t__mouth', ['To a dry side-cave', 'To the smoky cavern', 'To the cave mouth']]);
    expect(t.glance.acts.map(a => a.command)).toContain('attack(t__watchers)');
  });
});
