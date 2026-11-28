import { describe, expect, it } from 'bun:test';
import { Tiny } from '../support/tiny';
import { PlayerView } from '../../src/presentation/player-view';

// A check's difficulty read from the world (OB-11, CB-05's rest): a difficulty of the module's own is as hard as its
// toBeat, which the module's rules set from what they read (here what is owed). The four named difficulties had been
// all there was, so a debt's size or a keeper's temper could not set how hard a plea is. The odds offered and the
// roll made are both by it (a rule sets it as the world moves, so after a first wait), and one with no toBeat set is
// offered without odds and refused when tried, not taken for nothing.
const yard = (owed: number, set = true) => `
  Place yard "the yard" is room at 0, 0 outdoors.
  Person wat "Wat" at yard { Role "the moneylender". Ancestry human. Peaceable. Pronouns he. }
  Company party "You" of 1 at yard.
  Measure owed(group). Relation forgiven(group).
  Entity wat_ask: difficulty "what Wat asks".
  Initially Set owed(party) to ${owed}.
  Action tally(actor: group) "Tally what is owed" { Requires able(actor). Result "It comes to what it comes to.". }
  ${set ? 'Rule asked when owed(party) > 0 { Set toBeat(wat_ask) to 2 + owed(party). }' : ''}
  Action plead(actor: group, keeper: group, site: place) "Plead with {keeper} to forgive the debt" {
    Requires able(actor) and at(actor, site) and at(keeper, site) and distinct(actor, keeper) and not forgiven(actor).
    Resolve check(actor, persuasion, wat_ask).
    On success { Assert forgiven(actor). }
    Result "{keeper} tears the note across.".
    Otherwise "{keeper} will not hear of it.".
  }`;
const party = [{ name: 'Aud', raceId: 'human' as const, classId: 'warrior' as const }];
const plea = (t: Tiny) => PlayerView.choices(t.campaign).map(r => r.choice.name).find(n => /^Plead/.test(n))!;

describe('a check as hard as the world says', () => {
  it('is offered and rolled at the number the module\'s rules set', async () => {
    const small = await Tiny.start(yard(1), { party, horizon: [] });
    const great = await Tiny.start(yard(30), { party, horizon: [] });
    for (const t of [small, great]) { await t.play('Tally what is owed'); }
    // Three to beat is all but sure; thirty-two cannot be made.
    expect(plea(small)).toMatch(/^Plead with Wat to forgive the debt · (sure|likely)$/);
    expect(plea(great)).toBe('Plead with Wat to forgive the debt · beyond you');
    for (const t of [small, great]) { t.journey.roll('pass'); await t.play('Plead with Wat'); }
    const rolled = (t: Tiny) => t.campaign.events.at(-1)!.combat!.find(e => e.type === 'check') as { difficulty: number };
    expect([rolled(small).difficulty, rolled(great).difficulty]).toEqual([3, 32]);
  });
  it('is refused where nothing has set it', async () => {
    const t = await Tiny.start(yard(1, false), { party, horizon: [] });
    await t.play('Tally what is owed');
    expect(plea(t)).toBe('Plead with Wat to forgive the debt');
    await expect(t.play('Plead with Wat')).rejects.toThrow(/no toBeat set/);
  });
});
