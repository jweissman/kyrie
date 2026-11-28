import { describe, expect, it } from 'bun:test';
import { Tiny } from '../support/tiny';
import { LedAgain } from '../../src/presentation/led-again';

// A try that failed, nothing changed since, is not led a third time (OR-482). In the ossuary on the weir route, "Tell
// the man with the black candle the town knows what he has done" (intimidation, unlikely) failed and was led a second
// and a third time, the story's mark unmoved: LedAgain had kept only what came off, and the word, an answer to his
// warning as well as an act on a danger, was led for reasons only one of which it kept. Once round is allowed, as for
// anything led (see LedAgain): a fresh try.
const ossuary = `
  Place stair "the crypt stair" is room at 0, 0 indoors.
  Place ossuary "the ossuary" is room at 1, 0 indoors.
  Passage steps "the steps" is path between stair and ossuary.
  Company party "You" of 1 at ossuary.
  Person raiser "the man with the black candle" at ossuary {
    Role "a man in good boots". Ancestry human. Pronouns he. Level 1. Temperament territorial.
    Warns "He lifts the candle, and the dead turn their heads.".
  }
  Relation ended(group).
  Action tell(actor: group, site: place) "Tell the man with the black candle it ends now" {
    Requires able(actor) and company(actor) and at(actor, site) and at(actor, ossuary) and at(raiser, ossuary) and not ended(raiser).
    Time 0.
    Resolve check(actor, intimidation, dc_fair).
    On success { Assert ended(raiser). }
    Result "He goes.". Otherwise "He will not.".
  }
  Objective dead when not ended(raiser) toward raiser "Find out who is raising the dead.".
  Goal false.`;
const party = [{ name: 'Ilse', raceId: 'elf' as const, classId: 'mage' as const }];
const telling = (command?: string) => /tell\(/.test(command ?? '');
describe('a try failed with nothing changed', () => {
  it('is led for one fresh try, and not a third time', async () => {
    const t = await Tiny.start(ossuary, { party, horizon: ['inhabitants'] });
    t.journey.roll('fail');
    t.follow('dead');
    const mark = LedAgain.of(t.campaign).mark;
    for (const n of [1, 2]) {
      expect([n, telling(t.glance.acts[0]?.command)]).toEqual([n, true]);
      await t.perform(t.glance.acts[0]!.command!);
      expect([n, t.campaign.history.at(-1)!.result]).toEqual([n, 'failure']);
      t.follow('dead');
    }
    expect(LedAgain.of(t.campaign).mark).toBe(mark);
    expect(t.glance.acts.filter(a => telling(a.command) || telling(a.for))).toEqual([]);
  });
});
