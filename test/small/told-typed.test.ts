import { describe, expect, it } from 'bun:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Tiny } from '../support/tiny';
import { Told } from '../../web/reader/stage/told';
import { News } from '../../web/reader/news';
import type { Frame } from '../../src/creation/protocol';
import { PlayerView } from '../../src/presentation/player-view';

// What came of an act is told to the page as what it is, by the narrator that wrote it (AR-05): a roll as its die and
// the face it needed (ExchangeLine.roll), what was learned as learned (Exchange.noted, by kind), so that the page reads
// those fields and never the words. A plea at a gate, failed and then made, and what it teaches.
const yard = `
  Place yard "the yard" is room at 0, 0 outdoors.
  Person wat "Wat" at yard { Role "the gatekeeper". Ancestry human. Peaceable. Pronouns he. }
  Company party "You" of 1 at yard.
  Relation opened(group).
  Entity bar: fact "The gate's bar is only a peg and a rope.".
  Action plead(actor: group, keeper: group, site: place) "Plead with {keeper} to open the gate" {
    Requires able(actor) and at(actor, site) and at(keeper, site) and distinct(actor, keeper) and not opened(keeper).
    Resolve check(actor, persuasion, dc_hard).
    On success { Assert opened(keeper). Assert knows(actor, bar). }
    Result "{keeper} grumbles, and lifts the bar.".
    Otherwise "{keeper} will not hear of it.".
  }`;
const party = [{ name: 'Aud', raceId: 'human' as const, classId: 'warrior' as const }];
// The plea, as the page sends it, told as the page tells it.
class Gate {
  static async plead(outcome: 'pass' | 'fail'): Promise<Tiny> {
    const t = await Tiny.start(yard, { party });
    t.journey.roll(outcome);
    return t.perform(PlayerView.choices(t.campaign).find(r => /^Plead with Wat/.test(r.choice.name))!.choice.id);
  }
}

describe('what came of an act, typed', () => {
  it('gives a roll its die and need, and the page draws the die from them', async () => {
    const t = await Gate.plead('fail');
    const roll = t.leaf.exchange!.lines.find(l => l.kind === 'roll');
    expect(roll?.roll).toMatchObject({ who: 'Aud', what: 'persuasion', kind: 'check', made: false });
    const html = renderToStaticMarkup(createElement(Told.Happened, { exchange: t.leaf.exchange!, looked: true }));
    expect(html).toContain('class="roll throw missed"');
    // Words alone are not a roll: the same exchange with its fields gone draws the sentence, not the die.
    const bare = { ...t.leaf.exchange!, lines: t.leaf.exchange!.lines.map(l => ({ text: l.text, kind: l.kind })) };
    expect(renderToStaticMarkup(createElement(Told.Happened, { exchange: bare, looked: true })))
      .not.toContain('roll throw');
  });
  it('gives what was learned its kind, and the Book its label from it', async () => {
    const t = await Gate.plead('pass');
    const noted = t.leaf.exchange!.noted ?? [];
    expect(noted.filter(n => n.kind === 'learned').map(n => n.text)).toEqual([expect.stringMatching(/peg and a rope/)]);
    // The terminal's words for it are the narration's still.
    expect(t.leaf.exchange!.notes).toContain(`Noted: ${noted.find(n => n.kind === 'learned')!.text}`);
    const news = News.of({ leaf: t.leaf } as unknown as Frame);
    expect(news.find(i => /peg and a rope/.test(i.text))).toMatchObject({ label: 'You know now' });
  });
});
