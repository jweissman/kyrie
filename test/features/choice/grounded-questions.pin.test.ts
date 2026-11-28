import { describe, expect, it } from 'bun:test';
import { Tiny } from '../../support/tiny';
import { WorldAssembler } from '../../../src/world/world-assembler';
import { RegionWriter } from '../../../src/world/region-writer';
import { ReferenceSettlement } from '../../../src/world/reference-settlement';
import { CanonVocabulary } from '../../../src/canon/canon-vocabulary';
import type { Act } from '../../../src/ui/screen-types';

// Each probe on the kernel and the packages it reads (OR-407).
const start: typeof Tiny.start = (kyr, options = {}) => Tiny.start(kyr, { horizon: [], ...options });

// Feature pins: see test/features/choice/consequence.pin.test.ts. Choice › A question asked on grounds (the owner's
// play of 27 November, OR-1680: "how do I know who this person is? Where did I get the information I needed to ask him
// these questions?"). A question about something in particular is offered only once the company has grounds for it,
// and its row says which, in a few words, for every client (Act.ground, drawn beside its words): read from the topic's
// own condition and how the company came to know what it asks of (TopicGrounds), never written by its author. A
// question anyone may put to anyone (what the matter is, news, where someone is going) has none to say.
const said = (t: Tiny, who: string) => t.screen.people.find(p => p.id === `t__${who}`)!.acts
  .flatMap(a => a.children ?? [a]).filter(a => /^Ask/.test(a.label));
const ground = (acts: Act[], label: RegExp) => acts.find(a => label.test(a.label))?.ground;
describe('Choice › A question asked on grounds', () => {
  const yard = `
    Place yard "the yard" is room at 0, 0 outdoors.
    Entity mill: fact "The mill on the weir has stood shut since the spring.".
    Person ida "Ida" at yard { Role "a miller's widow". Ancestry human. Peaceable. Pronouns she. }
    Person tam "Tam" at yard { Role "a carter". Ancestry human. Peaceable. Pronouns he. }
    Topic ida_news with ida "Ask Ida for news" when true once {
      Says "'The mill on the weir is shut,' says Ida.". On discuss { Assert knows(actor, mill). }
    }
    Topic tam_mill with tam "Ask Tam about the mill" when knows(actor, mill) once { Says "'Shut,' says Tam.". }
    Company party "You" of 1 at yard.
    Goal false.`;
  it('offers the mill only once it is heard of, and says who told it', async () => {
    const t = await start(yard);
    expect(said(t, 'tam').map(a => a.label)).toEqual([]);
    // News is anyone's to ask, and says no ground.
    expect(ground(said(t, 'ida'), /for news/)).toBeUndefined();
    await t.perform(said(t, 'ida')[0]!.command!);
    expect(ground(said(t, 'tam'), /about the mill/)).toBe('Ida told you');
  });
  // The reference game's country as drawn (its text only, no world built): the woods asked after once seen from the
  // green or walked to, a far barrow's buyer asked only by one who has heard of the barrow or of the band, and the
  // walled stair under the stones only once it has been seen; and what the old folk say, by one who knows the place's
  // name. test/first-town-grounds holds the same of a fresh life's first town, everyone in it spoken with.
  it('writes the reference game\'s questions with their grounds in their conditions', () => {
    const region = WorldAssembler.region('fresh1', [0, 0]), t = ReferenceSettlement.of(region)!.id;
    const text = RegionWriter.source(region, { size: 1, contacts: [] }, {}, CanonVocabulary.context());
    const topic = (id: RegExp) => text.split('\n').filter(l => /^\s*Topic /.test(l) && id.test(l));
    expect(topic(new RegExp(`Topic ${t}_wood_asked `))).toEqual([expect.stringContaining(
      `when knows(actor, ${t}_wood_seen) or been(actor, ${t}_wood_edge) once`)]);
    expect(text).toMatch(new RegExp(`Observe ${t}_wood_above at ${t}_green .* teaches ${t}_wood_seen`));
    for (const line of topic(/_rivals_asked /)) {
      expect(line).toMatch(/when \(knows\(actor, \w+_named\) or knows\(actor, \w+_rivals_out\)\)/);
    }
    for (const line of topic(/_wall with /)) {
      expect(line).toMatch(/when knows\(actor, \w+_named\) and been\(actor, \w+\) and/);
    }
    expect(topic(/_saying with /).every(l => /when knows\(actor, \w+_named\)/.test(l))).toBe(true);
  });
  // Known before the life began, from what the company brings (the brothers' letter, the dead man's map, a sister's
  // letter): said so, as anything found in a source is.
  it('says where what was known from the first came from', async () => {
    const t = await start(`
      Place yard "the yard" is room at 0, 0 outdoors.
      Entity mill: fact "The mill on the weir has stood shut since the spring.".
      Entity letter: source "the brothers' letter". Initially Assert reveals(letter, mill).
      Initially Assert established(mill). Initially Assert at(letter, yard). Initially Assert knows(party, mill). Initially Assert learnedFrom(party, letter, mill).
      Person tam "Tam" at yard { Role "a carter". Ancestry human. Peaceable. Pronouns he. }
      Topic tam_mill with tam "Ask Tam about the mill" when knows(actor, mill) once { Says "'Shut,' says Tam.". }
      Company party "You" of 1 at yard.
      Goal false.`);
    expect(ground(said(t, 'tam'), /about the mill/)).toBe("from the brothers' letter");
  });
});
