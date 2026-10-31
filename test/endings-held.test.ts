import { describe, expect, it } from 'bun:test';
import { Journey } from '../src/session/journey';
import { Endings } from '../src/lang/endings';
import { ModuleParser } from '../src/lang/module-parser';
import { EndingOrder } from '../src/lang/ending-order';

// The Grand Tour's friction 4 (GTR-04): endings are tried in the order they are written, and the first that holds is
// reached. An accomplice whose hill crushed the Whelm was given the Second Whelming's ending, written first, and not
// First Through: the two could hold at once, neither asking all the other asks, and nothing said so but play. A journey
// now says when an ending is reached while such another held, naming both and the one reached; and an author says
// which wins with `over`. Played in the belfry of `probes/rivals` by the choices the page offers.
const probe = 'test/fixtures/probes/rivals/probe.campaign.json';
const reached = (j: Journey) => Endings.reached(j.campaign.world)?.title;

describe('two endings that hold at once', () => {
  it('are both named by the journey, the one written first as the one reached', async () => {
    const j = await Journey.start(probe);
    await j.play('Light the lantern', 'Raise the hatch');
    expect([j.campaign.running, j.contested]).toEqual([true, []]);
    expect(await j.play('Ring the bell')).toContain('You ring the bell by lantern light.');
    expect([j.campaign.running, reached(j)]).toEqual([false, 'The Lamplit Peal']);
    // The Peal (the bell alone) held too, but it asks only part of what the Lamplit Peal asks: the general case
    // written after the particular, as the order means it, and no rival.
    const told = j.taken.at(-1)!.event.perceptions!.find(p => p.id === 'p__lamplit');
    expect(told?.rivals).toEqual(['p__downstair']);
    expect(j.contested).toEqual(['p__lamplit and p__downstair held at once, and p__lamplit was reached: it is written'
      + ' first (an Ending\'s "over" says which wins)']);
  }, 30000);
  it('are not said to have where one asks that the other does not hold', async () => {
    const j = await Journey.start(probe);
    expect(await j.play('Strike the gong')).toContain('The gong\'s note fills the tower.');
    expect([reached(j), j.holds('state', 'p__bowl', 'p__humming'), j.contested]).toEqual(['The Gong', true, []]);
  }, 30000);
});

describe('an ending over another', () => {
  it('is reached where both hold, though written after it, and neither is reported', async () => {
    const j = await Journey.start(probe);
    await j.play('Blow the horn', 'Play the fife');
    expect(await j.play('Beat the drum')).toContain('Drum and fife call the valley up.');
    expect([reached(j), j.contested]).toEqual(['The Fife Call', []]);
  }, 30000);
  it('holds the other back only while its own condition holds', async () => {
    const j = await Journey.start(probe);
    await j.play('Blow the horn', 'Beat the drum');
    expect([reached(j), j.contested]).toEqual(['The Horn Call', []]);
  }, 30000);
  it('names an ending of its own file, and not one that is over it', () => {
    const module = (endings: string) => `Module m "M" { Place yard "the yard" is site. ${endings} }`;
    expect(() => ModuleParser.parse(module('Ending a "A" over b when true "A.".')))
      .toThrow('Ending a is over b, which is no ending of this file');
    expect(() => ModuleParser.parse(module('Ending a "A" over b when true "A". Ending b "B" over a when true "B".')))
      .toThrow('Ending a is over b, which is over it');
  });
  it('written after an ending that asks less, is not one the lint says is never reached', () => {
    // The lint says a later ending is never reached where an earlier one asks only part of what it asks; the general
    // one, held back by the particular, asks that the particular does not hold.
    const shadowed = (over: string) => {
      const [general, particular] = ModuleParser.parse(`Module m "M" { Place yard "the yard" is site.
        Ending general "G" when a() "G". Ending particular "P"${over} when a() and b() "P". }`).rules!;
      return EndingOrder.within(EndingOrder.asks(general!), EndingOrder.asks(particular!));
    };
    expect([shadowed(''), shadowed(' over general')]).toEqual([true, false]);
  });
});
