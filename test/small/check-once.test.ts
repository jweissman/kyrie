import { describe, expect, it } from 'bun:test';
import { Tiny } from '../support/tiny';
import { PlayerView } from '../../src/presentation/player-view';
import { ModuleWriter } from '../../src/lang/index';
import { PlaySession } from '../../src/session/play-session';

// A try limit on a check (CB-05): `Resolve check(…) once.` is a try spent whatever comes of it. Failed, the plea is
// not offered again, and the world keeps that it was made (a fact, kept in a save); made of one keeper, it may still be
// made of another. Without `once` a failed check was free to retry until the dice came right.
const yard = (once: boolean) => `
  Place yard "the yard" is room at 0, 0 outdoors.
  Person wat "Wat" at yard { Role "the gatekeeper". Ancestry human. Peaceable. Pronouns he. }
  Person hild "Hild" at yard { Role "the gatekeeper's wife". Ancestry human. Peaceable. Pronouns she. }
  Company party "You" of 1 at yard.
  Relation opened(group).
  Action plead(actor: group, keeper: group, site: place) "Plead with {keeper} to open the gate" {
    Requires able(actor) and at(actor, site) and at(keeper, site) and distinct(actor, keeper) and not opened(keeper).
    Resolve check(actor, persuasion, dc_hard)${once ? ' once' : ''}.
    On success { Assert opened(keeper). }
    Result "{keeper} grumbles, and lifts the bar.".
    Otherwise "{keeper} will not hear of it.".
  }`;
const party = [{ name: 'Aud', raceId: 'human' as const, classId: 'warrior' as const }];
const offered = (t: Tiny) => PlayerView.choices(t.campaign).map(r => r.choice.name).filter(n => /^Plead/.test(n));
// Whom a plea is offered of, by name, in order.
const pleas = (t: Tiny) => offered(t).map(n => n.split(' · ')[0]!).sort();

describe('a check tried once', () => {
  it('is not offered again once failed, of that keeper, and is still offered of another', async () => {
    const t = await Tiny.start(yard(true), { party, horizon: [] });
    expect(pleas(t)).toEqual(['Plead with Hild to open the gate', 'Plead with Wat to open the gate']);
    // And said to be a single try where it is offered.
    expect(offered(t).every(n => / · one try$/.test(n))).toBe(true);
    t.journey.roll('fail');
    await t.play('Plead with Wat');
    expect(t.campaign.events.at(-1)!.result).toBe('failure');
    expect(pleas(t)).toEqual(['Plead with Hild to open the gate']);
    // The try is a fact of the world, and a save keeps it.
    const tried = ModuleWriter.call('t__tried_plead', 'party', 't__wat', 't__yard');
    expect(t.world.test(tried)).toBe(true);
    const kept = PlaySession.resume(JSON.parse(JSON.stringify(t.session.checkpoint())));
    expect(kept.campaign.world.test(tried)).toBe(true);
  });
  it('is spent by a success too, and without once a failure may be tried again', async () => {
    const t = await Tiny.start(yard(true), { party, horizon: [] });
    t.journey.roll('pass');
    await t.play('Plead with Hild');
    expect(pleas(t)).toEqual(['Plead with Wat to open the gate']);
    const free = await Tiny.start(yard(false), { party, horizon: [] });
    free.journey.roll('fail');
    await free.play('Plead with Wat');
    expect(pleas(free)).toContain('Plead with Wat to open the gate');
  });
});
