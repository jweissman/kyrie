import { describe, expect, it } from 'bun:test';
import { Wares } from '../web/reader/wares';
import type { Choice } from '../src/ui/choice-list';

// A seller's wares, each with what buys it, and what else there is to say: the wares had been a run-on line, and
// buying a list opened inside the replies (the owner's interim report; play 7).
describe('a seller\'s wares', () => {
  it('pairs each thing on the counter with what buys it, and leaves the rest to be said', () => {
    const c = (id: string, label: string, extra: Partial<Choice> = {}): Choice => ({ id, label, tone: 'ability', ...extra });
    // Each buy is known by what it buys (its kind among its targets), never by its words: the labels below say
    // nothing a match could go by (the architecture review's P0).
    const buy = (id: string, kind: string, extra: Partial<Choice> = {}) =>
      c(id, `Option ${id}`, { does: 'buy_item', targets: [`${kind}_1`, kind, 'member', 'tolman'], ...extra });
    const replies = [c('buy', 'Buy', { children: [buy('buy/0', 'torch', { note: '1 coin' }), buy('buy/1', 'rope')] }),
      buy('glossary', 'glossary', { disabled: 'It costs 80 coin, and you have 12.' }),
      c('cisterns', 'Ask what is down in the cisterns', { does: 'ask' })];
    const counter = { id: 'tolman', name: 'Tolman', coin: 40, buys: [], sells: [
      { name: 'Torch', price: 1, stock: 2, kind: 'torch' }, { name: 'Coil of rope', price: 1, stock: 2, kind: 'rope' },
      { name: 'Glossary of the old script', price: 80, stock: 1, kind: 'glossary' },
      { name: 'Lantern', price: 7, stock: 1, kind: 'lantern' }] };
    const { wares, rest } = Wares.of(counter, replies);
    expect(wares.map(w => [w.name, w.buy?.id])).toEqual([['Torch', 'buy/0'], ['Coil of rope', 'buy/1'],
      ['Glossary of the old script', 'glossary'], ['Lantern', undefined]]);
    expect(rest.map(r => r.id)).toEqual(['cisterns']);
  });
});
