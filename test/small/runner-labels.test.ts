import { describe, expect, it } from 'bun:test';
import { Runner, type Said } from '../../src/cli/runner';
import { Tiny } from '../support/tiny';

// A row says what it does (cold play 2, CL-05: "Talk to the factor" had sold the crown): a talk is offered only by an
// act that talks, and what an opener is led for is called by its own words. A buyer of what the company carries, and
// someone to talk to beside him: whatever the offer leads with, no "Talk to …" does anything but talk.
const yard = `
  Place yard "the yard" is room at 0, 0 outdoors.
  Company party "You" of 1 at yard.
  Person factor "the factor" at yard { Role "the company's factor". Ancestry human. Peaceable. Pronouns he. }
  Person wat "Wat" at yard { Role "a carter". Ancestry human. Peaceable. Pronouns he. }
  Topic weather with wat "Ask Wat about the weather" when true { Says "'Rain by noon,' says Wat.". }
  Goal false.`;
const said = (x: Said | { error: string }): Said => { if ('error' in x) { throw new Error(x.error); } return x; };

describe('a row says what it does', () => {
  it('offers a talk only by an act that talks', async () => {
    const t = await Tiny.start(yard), r = new Runner(t.session);
    for (let i = 0; i < 4; i++) {
      const turn = r.said(), all = [...turn.offer.primary, ...turn.offer.rest];
      // Or opens onto what can be said to them, doing nothing of its own (TB-12).
      expect(all.filter(o => /^Talk to /.test(o.label) && !/^talk_to\(/.test(o.id) && !o.opens)
        .map(o => `${o.label} = ${o.id}`)).toEqual([]);
      const next = all.find(o => o.type === 'talk') ?? all[0];
      if (!next) { break; }
      said(await r.ask(JSON.stringify({ act: next.id })));
    }
  });
});
