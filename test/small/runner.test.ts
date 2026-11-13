import { describe, expect, it } from 'bun:test';
import { Tiny } from '../support/tiny';
import { Runner, type Said } from '../../src/cli/runner';
import { PlayerView } from '../../src/presentation/player-view';

// The runner for agents playing blind (the owner, 14 November: TB-05): the terminal's own projection as one JSON value
// a turn, acts taken by their real ids, a lens and a look that take no time, and errors said rather than thrown.
// A yard and a kitchen, someone in it.
const yard = `
  Place yard "the yard" is room at 0, 0 outdoors.
  Place kitchen "the kitchen" is room at 1, 0 indoors.
  Passage back "the back door" is door between yard and kitchen.
  Company party "You" of 1 at yard.
  Person wat "Wat" at kitchen { Role "your brother". Ancestry human. Peaceable. Pronouns he. }
  Topic weather with wat "Ask Wat about the weather" when true { Says "'Rain by noon,' says Wat.". }
  Goal false.`;
const said = (x: Said | { error: string }): Said => { if ('error' in x) { throw new Error(x.error); } return x; };

describe('the runner', () => {
  it('says the first turn as an arrival, with the four led with and the rest, each by a legal id', async () => {
    const t = await Tiny.start(yard), r = new Runner(t.session), first = r.said();
    expect([first.turn, first.moment]).toEqual([0, 'arrive']);
    const legal = new Set([...PlayerView.observe(t.campaign).choices.map(c => c.id)]);
    expect(first.offer.primary.length).toBeGreaterThan(0);
    for (const o of [...first.offer.primary, ...first.offer.rest]) {
      expect([o.id, legal.has(o.id)]).toEqual([o.id, true]);
    }
  });
  it('takes an act by its id: a way arrives somewhere, telling it', async () => {
    const t = await Tiny.start(yard), r = new Runner(t.session);
    const way = r.said().offer.primary.find(o => /kitchen/.test(o.label))!;
    const next = said(await r.ask(JSON.stringify({ act: way.id })));
    expect([next.turn, next.moment, t.where()]).toEqual([1, 'arrive', 't__kitchen']);
    expect(next.scene.lines.join(' ')).toMatch(/kitchen/i);
  });
  it('looks through a lens and at the place without time passing, and says what it cannot do', async () => {
    const t = await Tiny.start(yard), r = new Runner(t.session);
    await r.ask(JSON.stringify({ act: r.said().offer.primary.find(o => /kitchen/.test(o.label))!.id }));
    const at = t.campaign.readout.elapsed, lens = said(await r.ask(JSON.stringify({ lens: 'people' })));
    expect([lens.moment, lens.offer.primary.map(o => [o.label, o.id])])
      .toEqual(['inspect', [['Talk to Wat', 'talk_to(t__wat)']]]);
    expect(said(await r.ask(JSON.stringify({ look: true }))).moment).toBe('inspect');
    expect(t.campaign.readout.elapsed).toBe(at);
    expect(await r.ask(JSON.stringify({ act: 'nothing(here)' }))).toEqual({ error: 'not offered: nothing(here)' });
    expect(await r.ask('not json')).toEqual({ error: 'not JSON: not json' });
  });
  it('does what an opener is led for, called as it is, and follows an aim without time passing', async () => {
    const t = await Tiny.start(`${yard.replace('Goal false.', '')}
      Initially Assert kin(party, wat).
      Goal false.`), r = new Runner(t.session);
    await r.ask(JSON.stringify({ act: r.said().offer.primary.find(o => /kitchen/.test(o.label))!.id }));
    // Wat, kin, is led for the first thing to ask him; done by "Talk to Wat", a walk had taken his first reply instead
    // (Eamon's bed, nine nights running: TB-04).
    expect(r.said().offer.primary.map(o => [o.label, o.id])).toContainEqual(['Ask Wat about the weather', 't__weather']);
    expect(await r.ask(JSON.stringify({ follow: 'none' }))).toEqual({ error: 'no aim: none' });
  });
});
