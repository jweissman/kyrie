import { describe, expect, it } from 'bun:test';
import { Runner, type Said } from '../../src/cli/runner';
import { RunnerOffer } from '../../src/cli/runner-offer';
import { Tiny } from '../support/tiny';

// A check made in a conversation is told with it by every client (One projection): the page folds its dice under
// "How it fell" where it fell in the exchange (TalkStage.Lines), and the runner (the cold players' client) and the
// terminal had said the outcome alone, the dice kept for a look that a conversation never asks for. Out of a
// conversation the dice still wait for a look, on the page and in the runner alike (ToldLines).
const yard = `
  Place yard "the yard" is room at 0, 0 outdoors.
  Person wat "Wat" at yard { Role "the gatekeeper". Ancestry human. Peaceable. Pronouns he. }
  Company party "You" of 1 at yard.
  Relation opened(group).
  Action plead(actor: group, site: place) "Plead with Wat to open the gate" {
    Speaker wat.
    Requires able(actor) and at(actor, site) and at(wat, site) and not opened(wat).
    Resolve check(actor, persuasion, dc_hard).
    On success { Assert opened(wat). }
    Result "Wat grumbles, and lifts the bar.".
    Otherwise "Wat will not hear of it.".
  }
  Action shove(actor: group, site: place) "Shove at the gate" {
    Requires able(actor) and at(actor, site) and not opened(wat).
    Resolve check(actor, climbing, dc_hard).
    Result "The gate gives a little.". Otherwise "The gate does not move.".
  }
  Goal false.`;
const party = [{ name: 'Aud', raceId: 'human' as const, classId: 'warrior' as const }];
const said = (x: Said | { error: string }): Said => { if ('error' in x) { throw new Error(x.error); } return x; };
const find = (s: Said, words: RegExp) => RunnerOffer.flat([...s.offer.primary, ...s.offer.rest, ...Object.values(
  s.offer.lenses ?? {}).flat()]).find(o => words.test(o.label));

describe("a conversation's check", () => {
  it('is told with its dice by the runner, as the page tells it, and out of one waits for a look', async () => {
    const t = await Tiny.start(yard, { party, horizon: [] });
    t.journey.roll('fail');
    const r = new Runner(t.session);
    const talk = find(r.said(), /^Talk to Wat/)!;
    const talking = said(await r.ask(JSON.stringify({ act: talk.id })));
    const plead = find(talking, /^Plead with Wat/)!;
    const pleaded = said(await r.ask(JSON.stringify({ act: plead.id }))).scene.lines.join(' ');
    expect(pleaded).toMatch(/Wat will not hear of it\./);
    expect(pleaded).toMatch(/fails the persuasion check \(d20 \d+/);
    const leave = find(said(await r.ask(JSON.stringify({ look: true }))), /^(Take your leave|Leave)/);
    const out = leave ? said(await r.ask(JSON.stringify({ act: leave.id }))) : r.said();
    const shove = find(out, /^Shove at the gate/)!;
    const shoved = said(await r.ask(JSON.stringify({ act: shove.id }))).scene.lines.join(' ');
    expect(shoved).toMatch(/The gate does not move\./);
    expect(shoved).not.toMatch(/climbing check \(d20/);
  });
});
