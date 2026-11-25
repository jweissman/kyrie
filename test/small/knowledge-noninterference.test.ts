import { describe, expect, it } from 'bun:test';
import { Tiny } from '../support/tiny';

// Knowledge integrity's negative test (OR-524, the opening move of the knowledge boundary): two worlds that differ
// only in something the company neither knows nor perceives give the same player frame, the screen and the leaf as
// every client draws them (rows and their labels, facets and Atlas marks, the map, the Notes' lists); once the
// company learns it or sees it, they may differ. Each case is a pair of fragments, played alike.
const party = [{ name: 'Aud', raceId: 'human' as const, classId: 'warrior' as const }];
const yard = `
  Place yard "the yard" is room at 0, 0 outdoors.
  Place shed "the shed" is room at 1, 0.
  Passage door "the shed door" is path between yard and shed.
  Company party "You" of 1 at yard.
  Goal false.`;
// The frame as drawn: what any client is given to draw, with nothing of the order it was built in.
const frame = (t: Tiny) => JSON.stringify([t.look().screen, t.leaf]);
const pair = (a: string, b: string) => Promise.all([Tiny.start(a, { party }), Tiny.start(b, { party })]);

describe('two worlds the company cannot tell apart', () => {
  it('a hidden person: someone beyond a door not yet opened, and someone there unseen', async () => {
    const mag = `
      Person mag "Mag Tolley" at shed { Role "the carter". Ancestry human. Peaceable. Pronouns she. }
      Entity mag_road: fact "The carter's road goes over the moor.".
      Topic mag_ask with mag "Ask Mag about the road" when true once {
        Says "'Over the moor,' says Mag.". On discuss { Assert knows(actor, mag_road). } }
      Person hob "Hob Quill" at yard { Role "the cutpurse". Ancestry human. Peaceable. Pronouns he. }
      Initially Assert unseen(hob, party).
      Topic hob_ask with hob "Ask Hob what he is doing" when true once { Says "'Nothing,' says Hob.". }`;
    const [a, b] = await pair(yard + mag, yard);
    expect(frame(a)).toBe(frame(b));
    expect(frame(a)).not.toMatch(/Mag|Hob|carter|cutpurse/);
    await a.play('shed'); await b.play('shed');
    expect(frame(a)).toContain('Mag Tolley');
    expect(frame(a)).not.toBe(frame(b));
  });
  it('an undiscovered way: a trapdoor no one has told the company of', async () => {
    const known = `
      Entity cellar_told: fact "There is a trapdoor under the straw in the shed.".`;
    const trap = `
      Place cellar "the root cellar" is room at 1, 1 underground.
      Passage hatch "the trapdoor" is path between shed and cellar.
      Initially Assert revealedBy(hatch, cellar_told).
      Item lamp "a horn lamp" is lantern at cellar.`;
    const [a, b] = await pair(yard + known + trap, yard + known);
    expect(frame(a)).toBe(frame(b));
    await a.play('shed'); await b.play('shed');
    expect(frame(a)).toBe(frame(b));
    expect(frame(a)).not.toMatch(/trapdoor|cellar|horn lamp/);
    for (const t of [a, b]) { t.journey.assert('knows', 'party', 'cellar_told'); t.campaign.refreshProjection(); }
    expect(frame(a)).toContain('the trapdoor');
    expect(frame(a)).not.toBe(frame(b));
  });
  it('an unknown fact a topic would reveal: what Ned would say of the key', async () => {
    const ned = (where: string) => `
      Person ned "Ned Rook" at yard { Role "the ostler". Ancestry human. Peaceable. Pronouns he. }
      Entity key_where: fact ${JSON.stringify(`The stable key is ${where}.`)}.
      Entity key_talk: source "the stable key".
      Initially Assert knows(ned, key_where). Initially Assert testimony(ned, key_talk).
      Initially Assert reveals(key_talk, key_where). Initially Assert noticeable(key_talk). Initially Assert at(key_talk, yard).
      Initially Assert established(key_where).
      Topic ned_ask with ned "Ask Ned about the horses" when true once {
        Says ${JSON.stringify(`'The bay is lame,' says Ned. 'The key? ${where}.'`)}. }`;
    const [a, b] = await pair(yard + ned('under the mounting-block'), yard + ned('down the well'));
    expect(frame(a)).toBe(frame(b));
    expect(frame(a)).not.toMatch(/mounting-block|bay is lame/);
    for (const t of [a, b]) { await t.perform(t.campaign.offered().find(x => /stable key/.test(x.name))!.id); }
    expect(frame(a)).toContain('mounting-block');
    expect(frame(a)).not.toBe(frame(b));
  });
});
