import { describe, expect, it } from 'bun:test';
import { Tiny } from '../support/tiny';
import { Runner, type Said } from '../../src/cli/runner';
import { RunnerOffer } from '../../src/cli/runner-offer';
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
    // An opener is listed by its own id, its rows under it each by a legal one (TB-12).
    for (const o of [...first.offer.primary, ...first.offer.rest].flatMap(x => x.opens ?? [x])) {
      expect([o.id, legal.has(RunnerOffer.act(o))]).toEqual([o.id, true]);
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
    expect([lens.moment, lens.offer.primary.map(o => [o.label, RunnerOffer.act(o)])])
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
    expect(r.said().offer.primary.map(o => [o.label, RunnerOffer.act(o)]))
      .toContainEqual(['Ask Wat about the weather', 't__weather']);
    expect(await r.ask(JSON.stringify({ follow: 'none' }))).toEqual({ error: 'no aim: none' });
    // By the number the scene says it by ("· follow 1": cold play 2, CL-11), where there is no such aim, said so.
    expect(await r.ask(JSON.stringify({ follow: 3 }))).toEqual({ error: 'no aim: 3' });
  });
  it('gives a fight turn by turn, with a way out, as the terminal does', async () => {
    const t = await Tiny.start(`
      Place yard "the yard" is room at 0, 0 outdoors.
      Company party "You" of 1 at yard.
      Person rats "the rats" at yard { Role "rats". Species rat. Numbers 3. Level 1. Temperament territorial. Lair yard. }
      Goal false.`, { party: [{
        name: 'Ama', raceId: 'human', classId: 'warrior',
        rolled: { strength: 14, dexterity: 12, constitution: 18, intelligence: 10, wisdom: 10, charisma: 10 },
      }] }), r = new Runner(t.session);
    const attack = r.said().offer.primary.find(o => o.type === 'fight')!;
    let turn = said(await r.ask(JSON.stringify({ act: attack.id })));
    expect(turn.moment).toBe('fight');
    expect(turn.offer.primary.map(o => o.label)).toEqual(expect.arrayContaining(['Flee', 'Let Ama fight this turn']));
    // Not pressed on to its end before it is as good as won (cold play 7, CL-59), as the page offers it.
    expect(turn.offer.primary.map(o => o.label)).not.toContain('Press on to the end');
    // An aim followed in a fight is said not to be offered, not thrown (CL-62: it had ended the runner).
    const followed = await r.ask(JSON.stringify({ follow: 1 }));
    expect(followed).toEqual({ error: expect.stringMatching(/^not offered in the fight/) });
    for (let n = 0; n < 30 && turn.moment === 'fight'; n++) {
      turn = said(await r.ask(JSON.stringify({ act: turn.offer.primary[0]!.id })));
    }
    expect(turn.moment).toBe('outcome');
  });
});
