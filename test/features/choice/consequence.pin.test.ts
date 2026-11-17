import { describe, expect, it } from 'bun:test';
import { Tiny } from '../../support/tiny';
import { PlaySession } from '../../../src/session/play-session';
import { ModuleWriter } from '../../../src/lang/module-writer';

// Feature pins (doc/architecture/mission-22/feature-pins-brief.md): each a narrow scenario proving one table-stakes
// behaviour on as little world as it needs. A behaviour not yet had is an `it.failing` proof ("missing: …") or, where
// no proof is written yet, an `it.todo` ("unwritten: …"); `bun scripts/feature-pins.ts` reads them into the matrix.
const gate = `
  Place yard "the yard" is room at 0, 0 outdoors.
  Person wat "Wat" at yard { Role "the gatekeeper". Ancestry human. Peaceable. Pronouns he. }
  Company party "You" of 1 at yard.
  Relation opened(group).
  Action plead(actor: group, keeper: group, site: place) "Plead with {keeper} to open the gate" {
    Requires able(actor) and at(actor, site) and at(keeper, site) and distinct(actor, keeper) and not opened(keeper).
    Resolve check(actor, persuasion, dc_hard) once.
    On success { Assert opened(keeper). }
    Result "{keeper} grumbles, and lifts the bar.".
    Otherwise "{keeper} will not hear of it.".
  }`;
const party = [{ name: 'Aud', raceId: 'human' as const, classId: 'warrior' as const }];

describe('Choice & Consequence › Visible consequence tracking', () => {
  it('tells a choice\'s outcome in its own words, and the world and a save keep what came of it', async () => {
    const won = await Tiny.start(gate, { party }), lost = await Tiny.start(gate, { party });
    won.journey.roll('pass'); lost.journey.roll('fail');
    await won.play('Plead with Wat'); await lost.play('Plead with Wat');
    expect(won.campaign.events.at(-1)!.response).toContain('lifts the bar');
    expect(lost.campaign.events.at(-1)!.response).toContain('will not hear of it');
    const opened = ModuleWriter.call('t__opened', 't__wat');
    const kept = PlaySession.resume(JSON.parse(JSON.stringify(won.session.checkpoint())));
    expect([won.world.test(opened), lost.world.test(opened), kept.campaign.world.test(opened)])
      .toEqual([true, false, true]);
  });
  it.todo('unwritten: a spared enemy reappears later, as what being spared made of them');
  it.todo('unwritten: a promise broken resurfaces in what someone says or will do');
});

describe('Choice & Consequence › Reputation and relationship', () => {
  it.todo('unwritten: a settlement\'s or a person\'s standing changes their greeting, their prices and what they ask');
});

describe('Choice & Consequence › Branching at multiple scales', () => {
  it.todo('unwritten: a dramatic choice (spare or kill) and a mundane one (which town first) each change what follows');
  it.todo('unwritten: a fluff choice lets the character say what they think, and it is remembered');
});

describe('Choice & Consequence › Multiple endings', () => {
  it.todo('unwritten: an adventure reaches different endings by different deeds, each told as its own');
});

describe('Choice & Consequence › Free-form input', () => {
  it.todo('unwritten: an act typed in the player\'s own words, outside the four, is understood or refused');
});
