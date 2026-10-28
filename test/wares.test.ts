import { describe, expect, it } from 'bun:test';
import { Wares } from '../web/reader/wares';
import type { Choice } from '../src/ui/choice-list';

// A seller's wares, each with what buys it, and what else there is to say: the wares had been a run-on line, and
// buying a list opened inside the replies (the owner's interim report; play 7).
describe('a seller\'s wares', () => {
  it('pairs each thing on the counter with what buys it, and leaves the rest to be said', () => {
    const c = (id: string, label: string, extra: Partial<Choice> = {}): Choice => ({ id, label, tone: 'ability', ...extra });
    const replies = [c('buy', 'Buy', { children: [c('buy/0', 'A torch', { note: '1 coin' }), c('buy/1', 'A coil of rope')] }),
      c('glossary', 'Buy a glossary of the old script', { disabled: 'It costs 80 coin, and you have 12.' }),
      c('cisterns', 'Ask what is down in the cisterns')];
    const counter = { id: 'tolman', name: 'Tolman', coin: 40, buys: [], sells: [{ name: 'Torch', price: 1, stock: 2 },
      { name: 'Coil of rope', price: 1, stock: 2 }, { name: 'Glossary of the old script', price: 80, stock: 1 },
      { name: 'Lantern', price: 7, stock: 1 }] };
    const { wares, rest } = Wares.of(counter, replies);
    expect(wares.map(w => [w.name, w.buy?.id])).toEqual([['Torch', 'buy/0'], ['Coil of rope', 'buy/1'],
      ['Glossary of the old script', 'glossary'], ['Lantern', undefined]]);
    expect(rest.map(r => r.id)).toEqual(['cisterns']);
  });
});
