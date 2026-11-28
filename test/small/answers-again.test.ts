import { describe, expect, it } from 'bun:test';
import { Tiny } from '../support/tiny';
import { PlaySession } from '../../src/session/play-session';
import type { CampaignEvent } from '../../src/campaign/campaign';

// An answer asked for again is told as given again, not word for word, while nothing it bears on has changed and it
// was given within the day (the boredom census, BO-10: Honoria's tea-shop, Hulda's work, "Ask … again" offered,
// taken and told the same each time). What was answered is the campaign's record (CampaignEvent.voiced, kind answer),
// so a game kept and opened again goes on from it; an answer that has changed is told as it is, and one asked for
// after a day is told whole again. Honoria, her tea-shop, and the larder she counts.
const world = `
  Place yard "the yard" is room at 0, 0 outdoors.
  Person hon "Honoria" at yard { Role "the cook". Ancestry human. Peaceable. Pronouns she. }
  Company party "You" of 1 at yard.
  Measure larder(entity).
  Initially Set larder(hon) to 5.
  Entity teashop: fact "Honoria is saving for a tea-shop.".
  Topic hon_teashop with hon "Ask Honoria what she is saving for" when true once {
    Says "Honoria shows you the coins in a tea-caddy. 'A tea-shop,' she says. 'With a bow window.'".
    On discuss { Assert knows(actor, teashop). }
  }
  Topic hon_larder with hon "Ask Honoria how the larder stands" when true {
    Says "'{larder(hon)} days,' says Honoria, 'if nobody has seconds.'".
  }
  Action eat(actor: group) "Eat from the larder" { Requires able(actor) and larder(hon) > 0.
    On success { Decrease larder(hon) by 1. }
    Result "You eat.". }
  Goal false.`;
const party = [{ name: 'Aud', raceId: 'human' as const, classId: 'warrior' as const }];
const shop = 'Honoria shows you the coins in a tea-caddy.';
const kept = (s: PlaySession) => PlaySession.resume(JSON.parse(JSON.stringify(s.checkpoint())) as ReturnType<PlaySession['checkpoint']>);
const asking = async (t: Tiny, label: RegExp) => {
  await t.perform(t.campaign.offered().find(a => label.test(a.name))!.id);
  return (t.leaf.exchange?.lines ?? []).map(l => l.text).join(' ');
};
const again = (e: CampaignEvent) => (e.voiced ?? []).find(v => v.kind === 'answer-again')?.text;

describe('an answer asked for again', () => {
  it('is told as given again, not word for word, and the Notes keep what it said', async () => {
    const t = await Tiny.start(world, { party, horizon: [] });
    await t.perform('talk_to(party,t__hon,t__yard)');
    expect(await asking(t, /^Ask Honoria what/)).toContain(shop);
    const second = await asking(t, /^Ask Honoria again what/), third = await asking(t, /^Ask Honoria again what/);
    for (const told of [second, third]) { expect(told).not.toContain(shop); expect(told).toMatch(/Honoria|As I said/); }
    expect(second).not.toBe(third);
    expect(t.world.test({ kind: 'call', name: 'knows', args: ['party', 't__teashop'] })).toBe(true);
  });
  it('is told as it is when what it bears on has changed, and whole after a day', async () => {
    const t = await Tiny.start(world, { party, horizon: [] });
    await t.perform('talk_to(party,t__hon,t__yard)');
    expect(await asking(t, /larder/)).toContain('5 days');
    expect(await asking(t, /larder/)).not.toContain('days');
    await t.perform('t__eat(party)');
    expect(await asking(t, /larder/)).toContain('4 days');
    for (let h = 0; h < 25; h++) { await t.perform('wait_hour(party)'); }
    expect(await asking(t, /larder/)).toContain('4 days');
  });
  it('goes on from what was answered in a game kept and opened again', async () => {
    const t = await Tiny.start(world, { party, horizon: [] });
    await t.perform('talk_to(party,t__hon,t__yard)');
    await asking(t, /^Ask Honoria what/);
    const resumed = kept(t.session), id = resumed.campaign.offered().find(a => /again what/.test(a.name))!.id;
    const [a, b] = [await resumed.leg(id), await t.session.leg(id)];
    expect(again(a)).toBeDefined();
    expect(again(a)).toBe(again(b));
  });
});
