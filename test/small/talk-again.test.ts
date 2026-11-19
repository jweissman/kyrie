import { describe, expect, it } from 'bun:test';
import { Tiny } from '../support/tiny';
import { ModuleParser } from '../../src/lang/module-parser';
import { Journey } from '../../src/session/journey';

// Counted conversation (the maturity track's step 5, MT-05; the requests' R57 and R60): a return greeting that reads
// the world (`Greets again "…" when …`, the first that holds: "Raistrick has opened the book, now that you have found
// the ash"), and a question answered otherwise when it is asked again (`Says "…" again "…"`: a person asked the same
// thing three days later had only one answer). Each compiles into what there was: the second a regreeting of its own
// with its when, as a second Greets is; the third the topic's again, which a topic put once already had.
const world = `
  Place yard "the yard" is room at 0, 0 outdoors.
  Person rai "Raistrick" at yard { Role "the keeper of the book". Ancestry human. Peaceable. Pronouns he.
    Greets "'The book stays shut,' says Raistrick.".
    Greets again "'You have the ash,' says Raistrick, 'so I have opened the book.'" when knows(party, ash).
    Greets again "'Still no ash,' says Raistrick.". }
  Company party "You" of 1 at yard.
  Entity ash: fact "The ash is found.".
  Action find(actor: group) "Find the ash" { Requires able(actor). On success { Assert knows(actor, ash). }
    Result "You find the ash.". }
  Topic rai_book with rai "Ask Raistrick about the book" when true {
    Says "'It is the parish's,' says Raistrick. 'Births, banns, burials.'" again "'Still the parish's,' says Raistrick. 'Still shut.'".
  }
  Goal false.`;
const party = [{ name: 'Aud', raceId: 'human' as const, classId: 'warrior' as const }];
class Talk {
  static async said(t: Tiny, label: RegExp): Promise<string> {
    await t.perform(t.campaign.offered().find(a => label.test(a.name))!.id);
    return (t.leaf.exchange?.lines ?? []).map(l => l.text).join(' ');
  }
}
describe('counted conversation', () => {
  it('greets a company come back by the first return greeting that holds', async () => {
    const t = await Tiny.start(world, { party });
    expect(await Talk.said(t, /^Talk to Raistrick/)).toContain('The book stays shut');
    await Talk.said(t, /^Take your leave/);
    expect(await Talk.said(t, /^Talk to Raistrick/)).toContain('Still no ash');
    await Talk.said(t, /^Take your leave/);
    await Talk.said(t, /^Find the ash/);
    expect(await Talk.said(t, /^Talk to Raistrick/)).toContain('so I have opened the book');
  });
  it('answers a question asked again in its own words for it, and goes on answering so', async () => {
    const t = await Tiny.start(world, { party });
    await Talk.said(t, /^Talk to Raistrick/);
    expect(await Talk.said(t, /^Ask Raistrick about the book/)).toContain('Births, banns, burials');
    expect(t.campaign.offered().some(a => /^Ask Raistrick about the book/.test(a.name))).toBe(false);
    expect(await Talk.said(t, /^Ask Raistrick again about the book/)).toContain('Still shut');
    expect(t.campaign.offered().some(a => /^Ask Raistrick again about the book/.test(a.name))).toBe(true);
  });
  // R57's own reproduction: A Winter in Carth's return greetings were all true of every case. Annis Scaife's now reads
  // the hearth: lit, she says so; dark, she asks after the road as she did.
  it('A Winter in Carth: Annis Scaife greets a company come back by whether the hearth is lit', async () => {
    const w = (await Journey.start('data/campaigns/a-winter-in-carth.campaign.json', 'g1')).campaign.world;
    const again = w.related('regreeting').filter(r => r.args[0]!.endsWith('__annis')).map(r => r.args[1]!);
    expect(again.length).toBe(2);
    expect(w.module.queries.find(q => q.name === `${again[0]}_when`)?.body).toMatchObject({ kind: 'call',
      name: 'state' });
    expect(w.module.queries.some(q => q.name === `${again[1]}_when`)).toBe(false);
    expect(w.module.entities.find(e => e.id === again[0])?.name).toContain('It is lit now');
  }, 60000);
  it('fails at the load where again cannot be said: not a question, or put once only', () => {
    const topic = (title: string, once = '') => `Module m "m" { Place yard "the yard" is room.
      Person rai "Raistrick" at yard { Peaceable. }
      Topic t with rai "${title}" when true ${once} { Says "a" again "b". } Goal false. }`;
    expect(() => ModuleParser.parse(topic('Tell Raistrick the news'))).toThrow(/is not a question/);
    expect(() => ModuleParser.parse(topic('Ask Raistrick about the book', 'once only'))).toThrow(/once only/);
    expect(ModuleParser.parse(topic('Ask Raistrick about the book')).actions.find(a => a.id === 't_again')?.report)
      .toBe('b');
  });
});
