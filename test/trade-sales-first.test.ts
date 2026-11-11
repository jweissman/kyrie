import { describe, expect, it } from 'bun:test';
import { TalkFocus } from '../web/reader/talk-focus';
import type { Choice } from '../src/ui/choice-list';

// Trading, what the company carries that the trader would buy comes first, before the wares and the other services
// (round 5: four sales lay under SERVICES below six wares and the fold, and a promised buyer seemed to buy nothing).
describe('a trader\'s services', () => {
  it('put what the company can sell first', () => {
    // As the engine gives them: what each does (sell_valuable), not only its words.
    const c = (label: string) => ({ id: label, label, ...label.startsWith('Sell ') ? { does: 'sell_valuable' } : {} }) as Choice;
    const { sales, rest } = TalkFocus.parted([c('A bed for the night'), c('Sell a music box'), c('Sell a stolen chalice')]);
    expect([sales.map(x => x.label), rest.map(x => x.label)])
      .toEqual([['Sell a music box', 'Sell a stolen chalice'], ['A bed for the night']]);
  });
});
