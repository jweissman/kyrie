import { describe, expect, it } from 'bun:test';
import { Tiny } from '../support/tiny';
import { Runner, type Said } from '../../src/cli/runner';
import { RunnerAgain } from '../../src/cli/runner-again';

// An id a turn offered is the same act a turn later, under whatever id the act stands now (OR-686, cold plays 1, 3 and
// 4): "Gather up the coins" offered within the coins, then the coins' own row; exit:…hall against exit:…hall/0:Go; a
// torch bought one at a time, each torch on the shelf its own id.
const shop = `
  Place shop "the shop" is room at 0, 0 indoors.
  Person mabel "Mabel" at shop { Role "a chandler". Ancestry human. Peaceable. Pronouns she.
    Sells torch for 1 coin from 3. }
  Company party "You" of 1 at shop.
  Goal false.`;
const said = (x: Said | { error: string }): Said => { if ('error' in x) { throw new Error(x.error); } return x; };
const torches = (t: Tiny) => t.world.related('ownedItem').filter(r => t.world.one('itemKind', r.args[0]!) === 'torch'
  && r.args[1] === 't__member_party_1').length;

describe('an act asked again', () => {
  it('is the same act by the id it was offered by', async () => {
    const t = await Tiny.start(shop, {});
    t.journey.coin(10); t.look();
    const r = new Runner(t.session);
    said(await r.ask(JSON.stringify({ act: 't__mabel#talk' })));
    const talk = said(await r.ask(JSON.stringify({ act: 'focus:trade:on' })));
    const buy = [...talk.offer.primary, ...talk.offer.rest].find(o => /^buy_item\(t__mabel_torch/.test(o.does ?? ''))!;
    const had = torches(t);
    said(await r.ask(JSON.stringify({ act: buy.does })));
    // The next torch on the shelf is another thing, bought by the same words: asked by the first one's command.
    said(await r.ask(JSON.stringify({ act: buy.does })));
    expect(torches(t)).toBe(had + 2);
  });
  it('is what the id did where the turn offers that, and a way\'s one step by the way', () => {
    const again = new RunnerAgain();
    again.keep([{ id: 'coins/0:Gather up the coins', does: 'change_thing(coins_gather)' }]);
    expect(again.find([{ id: 'coins#look', does: 'change_thing(coins_gather)' }], 'coins/0:Gather up the coins'))
      .toBe('change_thing(coins_gather)');
    expect(again.find([{ id: 'exit:hall/0:Go', does: 'go(door,hall)' }], 'exit:hall')).toBe('exit:hall/0:Go');
    expect(again.find([{ id: 'exit:hall/0:Go', does: 'go(door,hall)' }], 'exit:yard')).toBe('exit:yard');
  });
});
