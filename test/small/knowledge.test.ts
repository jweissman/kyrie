import { describe, expect, it } from 'bun:test';
import { Tiny } from '../support/tiny';
import { ModuleWriter } from '../../src/lang/module-writer';

// What the company learns it may pass on, and what it passes on is known where it was said (data/rules/discovery.kyr:
// tell): to one who trusts it, once, and never a fact gone stale; and a rule that reads what someone knows acts on it
// (the drover's wife told what was found on the road: test/drover-*.test.ts in a generated country). An eel-man who
// knows where the ford is, a ferryman who trusts the company, and a stranger who does not.
const hythe = `
  Place hythe "Hythe" is settlement.
  Place green "the green" is room within hythe at 0, 0 outdoors.
  Company party "You" of 1 at green.
  Entity ford_known: fact "where the old ford is". Initially Assert established(ford_known).
  Entity flood: fact "that the river is in flood". Initially Assert established(flood).
  Initially Assert stale(flood). Initially Assert knows(party, flood).
  Person osric "Osric" at green { Role "an old eel-man". Ancestry human. Peaceable. Pronouns he. }
  Topic osric_ford with osric "Ask Osric about the ford" when true once {
    Says "'Below the alders,' says Osric.".
    On discuss { Assert knows(actor, ford_known). }
  }
  Person cole "Cole" at green { Role "the ferryman". Ancestry human. Peaceable. Pronouns he. }
  Initially Assert trusts(cole, party).
  Person drew "Drew" at green { Role "a stranger off the road". Ancestry human. Peaceable. Pronouns he. }
  Relation rowing(group).
  Rule cole_rows when knows(cole, ford_known) and not rowing(cole) { Assert rowing(cole). }
  Goal false.`;
const knows = (t: Tiny, who: string, fact: string) => t.world.test(ModuleWriter.call('knows', who, fact));
const tells = (t: Tiny) => t.journey.choices().map(c => c.label).filter(l => /^Tell /.test(l));

describe('what is known, passed on', () => {
  it('is learned, told to one who trusts the company, once, and acted on', async () => {
    const t = await Tiny.start(hythe);
    expect(tells(t)).toEqual([]);
    await t.play('Talk to Osric', 'Ask Osric about the ford', '?Take your leave');
    expect(knows(t, 'party', 't__ford_known')).toBe(true);
    expect(tells(t)).toEqual(['Tell — Where the old ford is']);
    await t.play('^Tell — Where the old ford is');
    expect(knows(t, 't__cole', 't__ford_known')).toBe(true);
    expect(knows(t, 't__drew', 't__ford_known')).toBe(false);
    expect(t.world.test(ModuleWriter.call('t__rowing', 't__cole'))).toBe(true);
    expect(tells(t)).toEqual([]);
  });
});
